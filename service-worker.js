/**
 * AfyiaTech Clinical Lab Assistant - Progressive Web App Service Worker
 * Core Architecture: Cache-First Strategy with Dynamic Network Fallback
 */

const CACHE_NAME = "afyiatech-cache-v1.0.0";

// Explicit file system inventory matching your PWA asset structure
const ASSETS_TO_CACHE = [
  "/",
  "index.html",
  "src/output.css",
  "js/script.js",
  "js/ui.js",
  "js/data.js",
  "js/state.js",
  "js/conversions.js",
  "manifest.json",
  "assets/favicon.ico",
  "assets/icon-16x16.png",
  "assets/icon-32x32.png",
  "assets/apple-touch-icon.png",
  "assets/icon-192x192.png",
  "assets/icon-512x512.png",
  "assets/icon-maskable.png",
  "screenshots/mobile.png",
  "screenshots/desktop.png"
];

// 1. INSTALL EVENT: Creates the cache vault and stores all core shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log("[Service Worker] Initializing offline storage vault; precaching assets...");
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
      .catch((err) => console.error("[Service Worker] Pre-cache routine critical failure:", err))
  );
});

// 2. ACTIVATE EVENT: Safely purges obsolete or out-of-date assets from local device storage
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("[Service Worker] Purging expired cache registry index:", cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. FETCH EVENT: Intercepts network requests to serve assets instantly from cache
self.addEventListener("fetch", (event) => {
  // Only process standard GET requests (ignores tracking scripts or POST analytical payloads)
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return the file instantly if it exists inside our offline storage cache
      if (cachedResponse) {
        return cachedResponse;
      }

      // If the asset isn't cached, fetch it over the live network stream
      return fetch(event.request)
        .then((networkResponse) => {
          // Safeguard check: Avoid caching broken or failing server responses
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          // Clone the response stream to save a copy into the background cache safely
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
        .catch((err) => {
          console.warn("[Service Worker] Fetch request failed. Device is entirely offline:", event.request.url, err);
          
          // If a main page navigation requests fails completely offline, return the root shell
          if (event.request.mode === "navigate") {
            return caches.match("index.html");
          }
        });
    })
  );
});