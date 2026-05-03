const CACHE = 'snowee-v2';
const APP_URL = '/snowee-pos/snowee.html';
const FILES = [
  APP_URL,
  '/snowee-pos/icon.svg',
  '/snowee-pos/manifest.json',
  'https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Nunito:wght@600;700;800;900&display=swap',
  'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll([APP_URL, '/snowee-pos/icon.svg', '/snowee-pos/manifest.json']))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Always serve app for navigation requests
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(APP_URL))
    );
    return;
  }

  // Cache-first for everything else
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
          .catch(() => caches.match(APP_URL));
      })
  );
});
