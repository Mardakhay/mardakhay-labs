const CACHE_PREFIX = "mardakhay-labs-";
const CACHE_NAME = "mardakhay-labs-v3";
const APP_SHELL = [
  "/index.html",
  "/manifest.webmanifest",
  "/favicon.svg",
  "/icon-192.png",
  "/icon-512.png"
];

function isCacheableAsset(url) {
  return APP_SHELL.includes(url.pathname) || url.pathname.startsWith("/assets/");
}

self.addEventListener("install", (event) => {
  // Let the new worker wait until existing pages release the old worker.
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Never intercept third-party requests (including Supabase).
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    const networkResponse = fetch(request);

    event.respondWith(
      networkResponse.catch(() =>
        caches.open(CACHE_NAME).then((cache) =>
          cache.match("/index.html").then((cached) => cached || Response.error())
        )
      )
    );

    event.waitUntil(
      networkResponse
        .then((response) => {
          if (!response.ok) return;

          return caches.open(CACHE_NAME).then((cache) =>
            cache.put("/index.html", response.clone())
          );
        })
        .catch(() => undefined)
    );
    return;
  }

  // Runtime-cache only the app shell and Vite's fingerprinted build assets.
  // Dynamic same-origin endpoints must not be cached by this worker.
  if (!isCacheableAsset(url)) return;

  const networkResponse = fetch(request);

  event.respondWith(
    networkResponse.catch(() =>
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => cached || Response.error())
      )
    )
  );

  event.waitUntil(
    networkResponse
      .then((response) => {
        if (!response.ok) return;

        return caches.open(CACHE_NAME).then((cache) =>
          cache.put(request, response.clone())
        );
      })
      .catch(() => undefined)
  );
});
