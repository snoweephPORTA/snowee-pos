const CACHE = 'snowee-cashier-v1';
const URL = '/snowee-pos/cashier.html';
self.addEventListener('install', e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll([URL,'/snowee-pos/cashier-manifest.json','/snowee-pos/cashier-icon-192.png','/snowee-pos/cashier-icon-512.png'])).then(()=>self.skipWaiting()));});
self.addEventListener('activate', e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch', e=>{if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(ca=>ca.put(e.request,c));return r;}).catch(()=>caches.match(URL)));return;}e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request)));});
