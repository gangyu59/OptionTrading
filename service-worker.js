const CACHE_NAME = 'option-trading-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/style.css',
    '/static/js/fetchData.js',
    '/static/js/stockChart.js',
    '/static/js/generateAdvice.js',
    '/static/js/main.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});