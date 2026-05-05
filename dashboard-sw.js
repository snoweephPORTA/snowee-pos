const CACHE = 'snowee-dashboard-v1';
const DASHBOARD_URL = '/snowee-pos/dashboard.html';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll([
        DASHBOARD_URL,
        '/snowee-pos/dashboard-manifest.json',
        '/snowee-pos/dashboard-icon-192.png',
        '/snowee-pos/dashboard-icon-512.png',
      ]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(DASHBOARD_URL))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request)
      .then(cached => {
        if (cached) return cached;
        return fetch(e.request)
          .then(res => {
            const clone = res.clone();
            caches.open(CACHE).then(cache => cache.put(e.request, clone));
            return res;
          })
          .catch(() => caches.match(DASHBOARD_URL));
      })
  );
});
