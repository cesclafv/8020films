/**
 * Minimal Service Worker skeleton.
 * Intentionally conservative: no caching strategies yet.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
self.addEventListener('install', (_event) => {
  self.skipWaiting();
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
self.addEventListener('activate', (_event) => {
  self.clients.claim();
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
self.addEventListener('fetch', (_event) => {
  // Default: pass-through to network
});
