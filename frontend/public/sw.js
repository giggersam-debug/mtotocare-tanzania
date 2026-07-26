// Minimal, conservative service worker: only speeds up / offline-caches
// static build assets (JS/CSS/icons/manifest). It deliberately never
// touches page navigations or API requests — this is a health-record app,
// and showing a nurse or parent stale cached data instead of a real network
// response would be worse than no offline support at all.
const CACHE_NAME = 'mtotocare-static-v1';
const STATIC_ASSET_PATTERNS = [/^\/_next\/static\//, /^\/icon-/, /^\/apple-touch-icon/, /^\/manifest\.json$/];

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // never touch the backend API (different origin)
  if (!STATIC_ASSET_PATTERNS.some((pattern) => pattern.test(url.pathname))) return; // let pages/data hit the network

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) cache.put(request, response.clone());
      return response;
    }),
  );
});
