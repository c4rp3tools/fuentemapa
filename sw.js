const CACHE_NAME = 'fuentemapa-v1';
const BASE_PATH = '/fuentemapa/';

const urlsToCache = [
  BASE_PATH,
  BASE_PATH + 'index.html',
  BASE_PATH + 'manifest.json',
  BASE_PATH + 'icon-72.png',
  BASE_PATH + 'icon-192.png',
  BASE_PATH + 'icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto para:', BASE_PATH);
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  var requestUrl = new URL(event.request.url);
  if (requestUrl.pathname === '/' || requestUrl.pathname === '/index.html') {
    event.respondWith(
      fetch(BASE_PATH + 'index.html')
        .catch(function() { return caches.match(BASE_PATH + 'index.html'); })
    );
    return;
  }
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        return response || fetch(event.request);
      })
  );
});