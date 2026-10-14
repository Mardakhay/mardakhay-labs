const CACHE_PREFIX = "mardakhay-labs-";
const CACHE_NAME = "mardakhay-labs-v6";
const APP_SHELL = [
  "/index.html",
  "/asset-manifest.json",
  "/manifest.webmanifest",
  "/favicon.svg",
  "/icon-192.png",
  "/icon-512.png"
];

function isCacheableAsset(url) {
  return APP_SHELL.includes(url.pathname) || url.pathname.startsWith("/assets/");
}

function getBuildAssetPaths(manifest) {
  const paths = Object.values(manifest).flatMap((entry) => [
    entry.file,
    ...(entry.css ?? []),
    ...(entry.assets ?? [])
  ]);

  return [...new Set(
    paths
      .filter((path) =>
        typeof path === "string" &&
        path.length > 0 &&
        !path.startsWith("http://") &&
        !path.startsWith("https://")
      )
      .map((path) => `/${path.replace(/^\/+/, "")}`)
  )];
}

self.addEventListener("install", (event) => {
  // Precache every compiled bundle (including lazy-loaded route chunks) so
  // the cached HTML can boot while offline, even on a first offline reload.
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await cache.addAll(APP_SHELL);

      const manifestResponse = await cache.match("/asset-manifest.json");

      if (!manifestResponse) {
        throw new Error("Failed to precache the Vite asset manifest");
      }

      const manifest = await manifestResponse.json();
      const assets = getBuildAssetPaths(manifest);

      if (!assets.some((path) => path.endsWith(".js"))) {
        throw new Error("Vite asset manifest contains no JavaScript bundles");
      }

      await cache.addAll(assets);

      // Activate only after the complete offline bundle is safely cached.
      await self.skipWaiting();
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );

      // Keep all open tabs on the same worker/cache version after install.
      await self.clients.claim();
    })()
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

  // Runtime cache remains restricted to the app shell and Vite build assets.
  // Dynamic same-origin endpoints are not cached by this worker.
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
