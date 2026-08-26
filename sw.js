const CACHE = "paris-trip-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-first for the HTML shell (so edits show up quickly on wifi),
// cache-first for everything else (so it still opens offline in the car / tunnel).
// The live-updates feed (script.google.com) and weather (open-meteo.com) are
// always network-only — they must never be served from cache, or "live" would
// just mean "frozen at install time".
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.url.includes("script.google.com") || req.url.includes("open-meteo.com")) {
    event.respondWith(fetch(req, { cache: "no-store" }));
    return;
  }
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(req, copy));
        return res;
      }).catch(() => caches.match("./index.html"))
    );
    return;
  }
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
