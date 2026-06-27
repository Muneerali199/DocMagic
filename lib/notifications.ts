export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('This browser does not support desktop notification');
    return false;
  }

  // Check if preferences allow notifications
  const prefs = localStorage.getItem('documentGenerationNotifications');
  if (prefs === 'false') {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export async function showDocumentNotification(title: string, options?: NotificationOptions) {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return;

  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    if (registration) {
      // Try to use Service Worker to show notification (works better on mobile)
      try {
        await registration.showNotification(title, {
          icon: '/android-chrome-192x192.png',
          badge: '/favicon-32x32.png',
          ...options,
        });
        return;
      } catch (err) {
        console.error('Service worker notification failed, falling back to Notification API', err);
      }
    }
  }

  // Fallback to standard Notification API
  new Notification(title, {
    icon: '/android-chrome-192x192.png',
    badge: '/favicon-32x32.png',
    ...options,
  });
}
