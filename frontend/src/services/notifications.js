export function getNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

export function playAlertSound(level = "warning") {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(level === "evacuation" || level === "red" ? [280, 100, 280, 100, 420] : [220, 100, 220]);
    }
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return false;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const urgent = level === "evacuation" || level === "red";
    const pattern = urgent
      ? [
          { freq: 880, start: 0, duration: 0.16 },
          { freq: 660, start: 0.18, duration: 0.16 },
          { freq: 988, start: 0.36, duration: 0.18 },
          { freq: 740, start: 0.56, duration: 0.22 },
        ]
      : [
          { freq: 660, start: 0, duration: 0.15 },
          { freq: 880, start: 0.18, duration: 0.22 },
        ];

    pattern.forEach(({ freq, start, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = urgent ? "sawtooth" : "triangle";
      osc.frequency.setValueAtTime(freq, now + start);
      gain.gain.setValueAtTime(0.001, now + start);
      gain.gain.exponentialRampToValueAtTime(urgent ? 0.18 : 0.14, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + duration + 0.02);
    });

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 1000);
    return true;
  } catch {
    return false;
  }
}

export async function sendSystemNotification({ title, body, tag, level = "warning" }) {
  if (typeof window === "undefined" || !("Notification" in window)) return false;

  let permission = Notification.permission;
  if (permission === "default") {
    permission = await requestNotificationPermission();
  }
  if (permission !== "granted") return false;

  const options = {
    body: body || "โปรดตรวจสอบสถานการณ์น้ำท่วมล่าสุดในพื้นที่ของคุณ",
    icon: "/icon-192.svg",
    badge: "/icon-192.svg",
    tag: tag || `thaiflood-${Date.now()}`,
    requireInteraction: level === "evacuation" || level === "red",
    data: { url: "/" },
  };

  try {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.showNotification) {
        await registration.showNotification(title, options);
        return true;
      }
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "SHOW_NOTIFICATION",
          title,
          options,
        });
        return true;
      }
    }
  } catch {
    // Fallback to window Notification below
  }

  try {
    new Notification(title, options);
    return true;
  } catch {
    return false;
  }
}
