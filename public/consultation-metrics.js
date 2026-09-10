(() => {
  const pages = new Map([
    ['/', 'home'],
    ['/programs/phonics/', 'phonics'],
    ['/programs/speaking/', 'speaking'],
    ['/programs/grammar-middle-school/', 'grammar-middle-school'],
  ]);
  const page = pages.get(location.pathname);
  if (!page || navigator.doNotTrack === '1' || navigator.globalPrivacyControl) return;
  // No cookies, visitor IDs, form values, or complete referrer/query URLs are sent.
  const destinations = new Map([
    ['https://m.booking.naver.com/booking/13/bizes/1365988/items/7577083', 'booking'],
    ['tel:0507-1356-0671', 'phone'],
    ['https://map.naver.com/p/entry/place/1694768560', 'directions'],
    ['https://place.map.kakao.com/63452265', 'directions'],
    ['https://www.google.com/maps?cid=6076773154571855206', 'directions'],
  ]);
  // More specific services must precede their parent domain (Gemini before Google).
  const sourceDomains = [
    ['gemini', ['gemini.google.com']],
    ['chatgpt', ['chatgpt.com', 'chat.openai.com']],
    ['google', ['google.com', 'google.co.kr']],
    ['bing', ['bing.com']],
    ['naver', ['naver.com', 'naver.me']],
    ['perplexity', ['perplexity.ai', 'perplexity.com']],
    ['kakao', ['kakao.com']],
    ['instagram', ['instagram.com']],
  ];
  const params = new URLSearchParams(location.search);
  const utm = (params.get('utm_source') || '').toLowerCase();
  let source = sourceDomains.find(([name, domains]) => utm === name || domains.includes(utm))?.[0] || 'unknown';
  if (source === 'unknown' && document.referrer) {
    try {
      const host = new URL(document.referrer).hostname;
      source = sourceDomains.find(([, domains]) => domains.some(domain => host === domain || host.endsWith('.' + domain)))?.[0] || 'other';
    } catch { /* An absent or invalid referrer stays unattributed. */ }
  }
  const lastClick = new Map();
  document.addEventListener('click', event => {
    if (!event.isTrusted || event.defaultPrevented || !(event.target instanceof Element)) return;
    const link = event.target.closest('a[href]');
    const action = link && destinations.get(link.href);
    if (!action) return;
    const now = Date.now();
    if (now - (lastClick.get(action) || 0) < 2000) return;
    lastClick.set(action, now);
    try {
      const payload = { id: crypto.randomUUID(), page, action, source, test: params.get('measurement_test') === '1' };
      // Navigation never waits for measurement and still works if this fails.
      void fetch('/api/public-metrics', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), keepalive: true, credentials: 'omit',
      }).catch(() => {});
    } catch { /* Measurement must never interrupt a booking or phone link. */ }
  });
})();
