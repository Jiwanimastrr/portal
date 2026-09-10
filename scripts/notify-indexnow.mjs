// Run only after production deployment. A receipt is not proof of indexing.
import { readFile } from 'node:fs/promises';
const origin = 'https://willgrow.pages.dev';
const key = (await readFile(new URL('../public/search-update-key.txt', import.meta.url), 'utf8')).trim();
if (!/^[a-f0-9]{32}$/.test(key)) throw new Error('Invalid public IndexNow key');
const keyLocation = `${origin}/search-update-key.txt`;
const keyResponse = await fetch(keyLocation);
if (!keyResponse.ok || (await keyResponse.text()).trim() !== key) throw new Error('Production key is not deployed');
const sitemap = await fetch(`${origin}/sitemap.xml`);
if (!sitemap.ok) throw new Error('Production sitemap is unavailable');
const urlList = [...(await sitemap.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
if (urlList.length !== 4 || urlList.some(url => new URL(url).origin !== origin)) throw new Error('Unexpected sitemap URLs');
const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: new URL(origin).host, key, keyLocation, urlList }),
});
console.log(JSON.stringify({ at: new Date().toISOString(), status: response.status, urlList,
  meaning: response.status === 200 ? 'received; indexing not confirmed' : response.status === 202 ? 'received; key validation pending' : 'not accepted' }, null, 2));
if (![200, 202].includes(response.status)) process.exitCode = 1;
