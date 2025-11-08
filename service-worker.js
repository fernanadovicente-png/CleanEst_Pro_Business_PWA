self.addEventListener("install", (e) => {
  console.log("🧩 Service Worker installé");
  e.waitUntil(
    caches.open("cleanest-cache-v1").then((cache) => {
      return cache.addAll([
        "/CleanEst_Pro_Business_PWA/",
        "/CleanEst_Pro_Business_PWA/index.html",
        "/CleanEst_Pro_Business_PWA/manifest.json",
        "/CleanEst_Pro_Business_PWA/vite.svg",
      ]);
    })
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});

self.addEventListener("activate", () => console.log("⚡ Service Worker activé"));
