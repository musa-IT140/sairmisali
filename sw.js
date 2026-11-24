const CACHE_NAME = 'sair-misali-pwa-v4';
const CORE_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './image_01d1a0.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(CORE_ASSETS).catch(() => { }))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SET_APP_BADGE') {
        const cnt = parseInt(event.data.count || 0, 10);
        if ('setAppBadge' in self.navigator) {
            if (cnt > 0) self.navigator.setAppBadge(cnt).catch(() => { });
            else if ('clearAppBadge' in self.navigator) self.navigator.clearAppBadge().catch(() => { });
        }
    }
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    const url = event.request.url;
    if (url.includes('firebasedatabase.app') || url.includes('googleapis.com') || url.includes('firebasestorage')) return;

    event.respondWith(
        fetch(event.request)
            .then((res) => {
                if (res && res.status === 200 && res.type === 'basic') {
                    const clone = res.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                }
                return res;
            })
            .catch(() => caches.match(event.request))
    );
});