/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

// To allow the service worker to use `self.addEventListener` without TypeScript errors
// we declare `self` as ServiceWorkerGlobalScope above.

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url;

  if (urlToOpen) {
    const url = new URL(urlToOpen, self.location.origin).href;

    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
        // Check if there is already a window/tab open with the target URL
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          // If so, just focus it
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        // If not, open the target URL in a new window/tab
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      })
    );
  }
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    event.waitUntil(self.registration.showNotification(title, options));
  }
});
