const CACHE_NAME = 'snowee-v2-cache-v1';
const ASSETS = [
  '/snowee-pos/snowee-v2.html',
  'https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Nunito:wght@600;700;800;900&display=swap',
  'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js',
];

// Install — cache all assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(
        ASSETS.map(url => cache.add(url).catch(() => console.log('Cache miss (ok):', url)))
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate — clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — cache first for app assets, network first for API calls
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Always go network for Cloudflare Worker and Apps Script (sync calls)
  if (
    url.hostname.includes('workers.dev') ||
    url.hostname.includes('script.google.com') ||
    url.hostname.includes('api.emailjs.com')
  ) {
    e.respondWith(
      fetch(e.request).catch(() =>
        new Response(JSON.stringify({ status: 'error', message: 'Offline' }), {
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );
    return;
  }

  // Cache first for everything else (app shell)
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        // Cache successful GET responses
        if (e.request.method === 'GET' && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => {
        // If it's a navigation request and we have the app cached, serve it
        if (e.request.mode === 'navigate') {
          return caches.match('/snowee-pos/snowee-v2.html');
        }
      });
    })
  );
});
