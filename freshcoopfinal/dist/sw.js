// FresCoop service worker — mode hors ligne
// Stratégie : app-shell + cache dynamique des assets + fallback offline.

const CACHE_VERSION = 'frescoop-v3';
const APP_SHELL = [
  '/',
  '/index.html',
  '/favicon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => Promise.allSettled(APP_SHELL.map((asset) => cache.add(asset))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Ne jamais intercepter les appels API (paiement, store) pour laisser l'app gérer le fallback.
  if (url.pathname.startsWith('/api/')) return;

  // Navigations : toujours essayer le réseau, sinon servir index.html en cache.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put('/index.html', copy));
          return response;
        })
        .catch(() => caches.match('/index.html').then((cached) => cached || caches.match('/')))
    );
    return;
  }

  // Stratégie stale-while-revalidate pour les assets (JS, CSS, images…)
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type !== 'opaque') {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => null);
      return cached || networkFetch.then((response) => (
        response || new Response('Offline', { status: 503, statusText: 'Offline' })
      ));
    })
  );
});
