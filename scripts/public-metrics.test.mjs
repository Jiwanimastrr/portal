import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { onRequest } from '../functions/api/public-metrics.js';

const origin = 'https://willgrow.pages.dev';
const sample = { id: '26bdd61f-e879-402e-8ff6-0a04ebf4d7e9', page: 'speaking', action: 'booking', source: 'chatgpt', test: true };
function setup() {
  const db = new DatabaseSync(':memory:');
  db.exec(readFileSync(new URL('./public-metrics-schema.sql', import.meta.url), 'utf8'));
  const env = { PUBLIC_METRICS: {
    prepare(sql) { return { bind(...values) { return { sql, values }; } }; },
    async batch(statements) { db.exec('BEGIN'); try { const values = statements.map(s => db.prepare(s.sql).run(...s.values)); db.exec('COMMIT'); return values; } catch(e) { db.exec('ROLLBACK'); throw e; } },
  } };
  return { db, env };
}
function request(body = sample, headers = {}, method = 'POST') {
  return new Request(origin + '/api/public-metrics', { method, headers: { Origin: origin, 'Sec-Fetch-Site': 'same-origin', 'Content-Type': 'application/json', ...headers }, ...(method === 'POST' ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}) });
}
test('duplicate delivery counts once, QA stays separate, expired receipts preserve totals', async () => {
  const { db, env } = setup();
  const send = body => onRequest({ request: request(body), env });
  assert.equal((await send(sample)).status, 204);
  assert.equal((await send(sample)).status, 204);
  await send({ ...sample, id: crypto.randomUUID(), test: false });
  assert.deepEqual(db.prepare('SELECT test, clicks FROM daily_clicks ORDER BY test').all().map(x => ({...x})), [{ test: 0, clicks: 1 }, { test: 1, clicks: 1 }]);
  db.prepare('INSERT INTO click_receipts VALUES(?,?,?,?,?,?)').run(crypto.randomUUID(), '2020-01-01', 'home', 'phone', 'unknown', 1);
  await send(sample);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM click_receipts WHERE day='2020-01-01'").get().n, 0);
  assert.equal(db.prepare("SELECT clicks FROM daily_clicks WHERE day='2020-01-01'").get().clicks, 1);
  db.close();
});
test('rejects cross-site, arbitrary fields, malformed and large inputs; respects privacy signals', async () => {
  const { db, env } = setup();
  for (const [req, status] of [
    [request(sample, { Origin: 'https://unrelated.example' }), 403],
    [request(sample, { 'Sec-Fetch-Site': 'cross-site' }), 403],
    [request({...sample, student_name: 'not-collected'}), 400],
    [request({...sample, action: 'enrollment'}), 400],
    [request({...sample, page: '/private-students'}), 400],
    [request({...sample, source: 'raw-user-query'}), 400],
    [request('invalid json'), 400], [request('x'.repeat(513)), 413],
    [request(sample, { 'Content-Type': 'text/plain' }), 415],
    [request(sample, {}, 'GET'), 405],
    [request(sample, { DNT: '1' }), 204], [request(sample, { 'Sec-GPC': '1' }), 204],
  ]) assert.equal((await onRequest({request: req, env})).status, status);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM daily_clicks').get().n, 0);
  assert.equal((await onRequest({ request: request(), env: {} })).status, 503);
  db.close();
});
test('client keeps direct navigation, strips personal URL data, debounces and tolerates network failure', () => {
  let handler;
  const bodies = [];
  class Element { closest() { return { href: 'https://m.booking.naver.com/booking/13/bizes/1365988/items/7577083' }; } }
  const context = {
    location: { pathname: '/programs/speaking/', search: '?utm_source=chatgpt.com&student=secret&measurement_test=1' },
    navigator: {}, document: { referrer: 'https://chatgpt.com/c/private-thread', addEventListener(type, fn) { handler = fn; } },
    Element, URL, URLSearchParams, crypto,
    fetch(url, options) { bodies.push({url, payload: JSON.parse(options.body)}); return Promise.reject(new Error('offline')); },
  };
  const script = readFileSync(new URL('../public/consultation-metrics.js', import.meta.url), 'utf8');
  vm.runInNewContext(script, context);
  const event = { isTrusted: true, defaultPrevented: false, target: new Element(), preventDefault() { throw new Error('Must not block navigation'); } };
  handler(event); handler(event);
  assert.equal(bodies.length, 1);
  assert.equal(bodies[0].payload.source, 'chatgpt');
  assert.equal(bodies[0].payload.test, true);
  assert.equal(JSON.stringify(bodies).includes('secret'), false);
  assert.equal(JSON.stringify(bodies).includes('private-thread'), false);
  handler = undefined;
  vm.runInNewContext(script, {...context, navigator: {doNotTrack: '1'}});
  assert.equal(handler, undefined);
});

test('only verified academy map links count as directions and retain QA separation', () => {
  const script = readFileSync(new URL('../public/consultation-metrics.js', import.meta.url), 'utf8');
  for (const [href, expectedCount] of [
    ['https://map.naver.com/p/entry/place/1694768560', 1],
    ['https://place.map.kakao.com/63452265', 1],
    ['https://www.google.com/maps?cid=6076773154571855206', 1],
    ['https://place.map.kakao.com/other-place', 0],
    ['https://www.google.com/maps?cid=other-place', 0],
    ['https://learnenglish.britishcouncil.org/', 0],
  ]) {
    let handler;
    const bodies = [];
    class Element { closest() { return { href }; } }
    vm.runInNewContext(script, {
      location: { pathname: '/programs/phonics/', search: '?measurement_test=1' },
      navigator: {}, document: { referrer: '', addEventListener(type, fn) { handler = fn; } },
      Element, URL, URLSearchParams, crypto,
      fetch(url, options) { bodies.push(JSON.parse(options.body)); return Promise.resolve(); },
    });
    handler({ isTrusted: true, defaultPrevented: false, target: new Element(), preventDefault() { throw new Error('Must not block map navigation'); } });
    assert.equal(bodies.length, expectedCount, href);
    if (expectedCount) {
      assert.equal(bodies[0].action, 'directions');
      assert.equal(bodies[0].test, true);
      assert.equal(bodies[0].page, 'phonics');
    }
  }
});
