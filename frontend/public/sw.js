/* SkillBridge service worker — shows OS/browser push notifications */

self.addEventListener('push', (event) => {
  let data = { title: 'SkillBridge', body: 'You have a new notification.', link: '/dashboard' };

  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    // use defaults
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      tag:  data.tag || 'skillbridge',
      data: { link: data.link },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const link = event.notification.data?.link || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if ('focus' in client) {
          client.focus();
          client.navigate(link);
          return;
        }
      }
      if (clients.openWindow) return clients.openWindow(link);
    })
  );
});
