const CACHE = 'snowee-v1';
const FILES = [
  '/snowee-pos/snowee-37.html',
  'https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Nunito:wght@600;700;800;900&display=swap',
  'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      // Return cached version, but also fetch fresh in background
      if (cached) {
        fetch(e.request).then(fresh => {
          caches.open(CACHE).then(cache => cache.put(e.request, fresh));
        }).catch(() => {});
        return cached;
      }
      // Not cached — try network, cache it, fallback to main file if offline
      return fetch(e.request).then(fresh => {
        return caches.open(CACHE).then(cache => {
          cache.put(e.request, fresh.clone());
          return fresh;
        });
      }).catch(() => caches.match('/snowee-pos/snowee-37.html'));
    })
  );
});
