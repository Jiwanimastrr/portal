const CACHE_NAME = 'pickall-v3';
const STATIC_ASSETS = [
  '/',
  '/random',
  '/order',
  '/seats',
  '/groups',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // 간단한 캐시 우선(Cache-first) 전략 (로컬 스토리지 데이터 앱이므로)
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // 캐시가 있으면 반환하되, 백그라운드에서 캐시 업데이트 시도 (Stale-while-revalidate)
        event.waitUntil(
          fetch(event.request).then((networkResponse) => {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }).catch(() => {})
        );
        return cachedResponse;
      }
      
      return fetch(event.request).then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => {
        // 오프라인 시 기본 페이지 폴백 (Next.js 라우터 특성상 루트 반환)
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});
