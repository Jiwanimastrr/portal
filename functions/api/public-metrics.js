const ORIGIN = 'https://willgrow.pages.dev';
const PAGES = new Set(['home', 'phonics', 'speaking', 'grammar-middle-school']);
const ACTIONS = new Set(['booking', 'phone', 'directions']);
const SOURCES = new Set(['chatgpt', 'gemini', 'google', 'bing', 'naver', 'perplexity', 'kakao', 'instagram', 'other', 'unknown']);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const HEADERS = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' };

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return new Response(null, { status: 405, headers: { ...HEADERS, Allow: 'POST' } });
  if (new URL(request.url).origin !== ORIGIN || request.headers.get('Origin') !== ORIGIN || request.headers.get('Sec-Fetch-Site') !== 'same-origin') {
    return new Response(null, { status: 403, headers: HEADERS });
  }
  if (request.headers.get('DNT') === '1' || request.headers.get('Sec-GPC') === '1') return new Response(null, { status: 204, headers: HEADERS });
  if (!(request.headers.get('Content-Type') || '').startsWith('application/json')) return new Response(null, { status: 415, headers: HEADERS });
  // Limit streamed input, including requests with no Content-Length header.
  const reader = request.body?.getReader();
  if (!reader) return new Response(null, { status: 400, headers: HEADERS });
  let text = '', bytes = 0;
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 512) { await reader.cancel(); return new Response(null, { status: 413, headers: HEADERS }); }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    const data = JSON.parse(text);
    if (!data || Object.keys(data).sort().join(',') !== 'action,id,page,source,test' ||
        !UUID.test(data.id) || !PAGES.has(data.page) || !ACTIONS.has(data.action) || !SOURCES.has(data.source) || typeof data.test !== 'boolean') {
      return new Response(null, { status: 400, headers: HEADERS });
    }
    if (!env.PUBLIC_METRICS) return new Response(null, { status: 503, headers: HEADERS });
    const now = Date.now();
    const day = new Date(now + 9 * 3600000).toISOString().slice(0, 10);
    const cutoff = new Date(now + 9 * 3600000 - 7 * 86400000).toISOString().slice(0, 10);
    await env.PUBLIC_METRICS.batch([
      env.PUBLIC_METRICS.prepare('INSERT OR IGNORE INTO click_receipts (id, day, page, action, source, test) VALUES (?, ?, ?, ?, ?, ?)').bind(data.id, day, data.page, data.action, data.source, data.test ? 1 : 0),
      env.PUBLIC_METRICS.prepare('DELETE FROM click_receipts WHERE day < ?').bind(cutoff),
    ]);
    return new Response(null, { status: 204, headers: HEADERS });
  } catch (error) {
    return new Response(null, { status: error instanceof SyntaxError ? 400 : 503, headers: HEADERS });
  }
}
