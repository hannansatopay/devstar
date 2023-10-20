self.addEventListener('fetch', (event) => {
  // If the request is for the speed test results, perform the speed test and cache the results.
  if (event.request.url.indexOf('/speed-test-results') !== -1) {
    const response = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${event.request.url.split('/')[2]}`);
    const results = await response.json();

    // Cache the results of the speed test.
    self.caches.open('speed-test-results').then((cache) => {
      cache.put('speed-test-results', results);
    });
  }
});

self.addEventListener('activate', (event) => {
  // Activate the service worker.
  event.waitUntil(self.clients.claim());
});
