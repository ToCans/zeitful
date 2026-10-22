// src/sw.js
self.__WB_MANIFEST;

self.addEventListener("push", (event) => {
  const pushData = event.data?.json() ?? {};
  if (!pushData || !pushData.title) {
    console.error(
      "Received WebPush with an empty title. Received body: ",
      pushData,
    );
    return;
  }
  event.waitUntil(self.registration.showNotification(pushData.title, pushData));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  if (!event.notification.data?.url) {
    console.error(
      "Click on WebPush without url. Notification: ",
      event.notification,
    );
    return;
  }
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
