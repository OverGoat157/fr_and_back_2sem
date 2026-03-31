const CACHE_NAME = 'notes-cache-v2';
const DYNAMIC_CACHE_NAME = 'dynamic-content-v1';
const ASSETS = ['/','/index.html','/app.js','/manifest.json','/icons/favicon-16x16.png','/icons/favicon-32x32.png','/icons/favicon-48x48.png','/icons/favicon-64x64.png','/icons/favicon-128x128.png','/icons/favicon-256x256.png','/icons/favicon-512x512.png'];

self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME && k !== DYNAMIC_CACHE_NAME).map(k => caches.delete(k))))
        .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    if (url.origin !== location.origin) return;
    if (url.pathname.startsWith('/content/')) {
        event.respondWith(
            fetch(event.request).then(r => { const c = r.clone(); caches.open(DYNAMIC_CACHE_NAME).then(cache => cache.put(event.request, c)); return r; })
            .catch(() => caches.match(event.request).then(c => c || caches.match('/content/home.html')))
        );
        return;
    }
    event.respondWith(caches.match(event.request).then(r => r || fetch(event.request)));
});
