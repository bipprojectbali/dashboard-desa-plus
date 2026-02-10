const CACHE_NAME = "darmasaba-v1";
const ASSETS = ["/", "/index.html", "/logo.svg"];

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			console.log("SW: Pre-caching assets");
			return cache.addAll(ASSETS).catch((err) => {
				console.error(
					"SW: Pre-cache failed (likely due to Vary header or missing file):",
					err,
				);
			});
		}),
	);
});

self.addEventListener("fetch", (event) => {
	event.respondWith(
		caches.match(event.request).then((response) => {
			return response || fetch(event.request);
		}),
	);
});
