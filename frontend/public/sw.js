self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (event) => {
  const payload = event.data;
  if (!payload || payload.type !== "SHOW_NOTIFICATION") return;
  const title = payload.title || "ThaiFlood Watch";
  const options = {
    body: payload.options?.body || "มีการแจ้งเตือนสถานการณ์น้ำท่วมใหม่",
    icon: "/icon-192.svg",
    badge: "/icon-192.svg",
    tag: payload.options?.tag || `thaiflood-${Date.now()}`,
    vibrate: [220, 100, 220, 100, 320],
    requireInteraction: payload.options?.requireInteraction ?? false,
    data: payload.options?.data || { url: "/" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: "ThaiFlood Watch", body: event.data?.text() || "แจ้งเตือนสถานการณ์น้ำท่วม" };
  }
  const title = payload.title || "ThaiFlood Watch";
  const options = {
    body: payload.body || payload.advisory || "โปรดตรวจสอบสถานการณ์น้ำท่วมในพื้นที่ของคุณ",
    icon: "/icon-192.svg",
    badge: "/icon-192.svg",
    tag: payload.tag || "thaiflood-push",
    vibrate: [240, 110, 240],
    data: { url: payload.url || "/" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
      return null;
    }),
  );
});
