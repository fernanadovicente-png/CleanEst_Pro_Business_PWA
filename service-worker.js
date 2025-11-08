self.addEventListener('install', (event) => {
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  clients.claim();
});
// Optional: simple passthrough fetch (no caching) just to validate SW
self.addEventListener('fetch', () => {});