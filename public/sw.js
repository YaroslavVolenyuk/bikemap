importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

const { registerRoute } = workbox.routing;
const { CacheFirst, NetworkFirst, StaleWhileRevalidate, NetworkOnly } = workbox.strategies;
const { ExpirationPlugin } = workbox.expiration;
const { CacheableResponsePlugin } = workbox.cacheableResponse;

workbox.core.setCacheNameDetails({ prefix: 'bikemap' });
workbox.core.skipWaiting();
workbox.core.clientsClaim();

// App shell: Next.js static assets
registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style',
  new StaleWhileRevalidate({ cacheName: 'bikemap-static' })
);

// Images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'bikemap-images',
    plugins: [
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

// Mapbox tiles
registerRoute(
  ({ url }) => url.hostname.endsWith('.tiles.mapbox.com'),
  new CacheFirst({
    cacheName: 'mapbox-tiles',
    plugins: [
      new ExpirationPlugin({ maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

// Mapbox API (sprites, fonts, styles)
registerRoute(
  ({ url }) => url.hostname === 'api.mapbox.com',
  new CacheFirst({
    cacheName: 'mapbox-api',
    plugins: [
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

// Mapbox events — never cache
registerRoute(
  ({ url }) => url.hostname === 'events.mapbox.com',
  new NetworkOnly()
);

// Saved routes API — network first, fallback to cache
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/routes'),
  new NetworkFirst({
    cacheName: 'bikemap-routes-api',
    plugins: [
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

// Pages — network first
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'bikemap-pages',
    plugins: [
      new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);
