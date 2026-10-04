const CACHE_NAME = 'fuentemapa-v2';
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
  self.skipWaiting(); // la versión nueva se activa sin esperar a cerrar la app
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;                      // PUT/POST (OSM, Overpass) van directos a la red
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;            // Leaflet, mapas, rutas, APIs: red normal

  // Página: primero red (siempre la última versión); sin conexión, la copia guardada
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then(res => {
        if (res.ok && !url.search) {
          const copia = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(BASE_PATH + 'index.html', copia));
        }
        return res;
      }).catch(() => caches.match(BASE_PATH + 'index.html'))
    );
    return;
  }

  // Iconos y manifiesto: primero caché
  event.respondWith(caches.match(req).then(r => r || fetch(req)));
});
