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
    const urgent = level === "evacuation" || level === "red" || level === "critical";
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(urgent ? [350, 90, 350, 90, 500, 90, 500] : [220, 80, 260, 80, 300]);
    }
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return false;
    const ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-16, now);
    compressor.knee.setValueAtTime(6, now);
    compressor.ratio.setValueAtTime(12, now);
    compressor.attack.setValueAtTime(0.002, now);
    compressor.release.setValueAtTime(0.12, now);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.95, now);
    masterGain.connect(compressor);
    compressor.connect(ctx.destination);

    const playIphoneBellNote = ({ freq, start, duration, peakGain = 0.65, bright = false }) => {
      const t0 = now + start;

      // Layer 1: Triangle fundamental for crisp marimba-bell transient
      const oscMain = ctx.createOscillator();
      const gainMain = ctx.createGain();
      oscMain.type = "triangle";
      oscMain.frequency.setValueAtTime(freq, t0);
      gainMain.gain.setValueAtTime(0.001, t0);
      gainMain.gain.exponentialRampToValueAtTime(peakGain, t0 + 0.008);
      gainMain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
      oscMain.connect(gainMain);
      gainMain.connect(masterGain);
      oscMain.start(t0);
      oscMain.stop(t0 + duration + 0.02);

      // Layer 2: Sine body punch for loud small-speaker audibility
      const oscBody = ctx.createOscillator();
      const gainBody = ctx.createGain();
      oscBody.type = "sine";
      oscBody.frequency.setValueAtTime(freq, t0);
      gainBody.gain.setValueAtTime(0.001, t0);
      gainBody.gain.exponentialRampToValueAtTime(peakGain * 0.85, t0 + 0.01);
      gainBody.gain.exponentialRampToValueAtTime(0.001, t0 + duration * 1.15);
      oscBody.connect(gainBody);
      gainBody.connect(masterGain);
      oscBody.start(t0);
      oscBody.stop(t0 + duration * 1.15 + 0.02);

      // Layer 3: Octave harmonic chime + brief 3rd-harmonic glass strike
      const oscOct = ctx.createOscillator();
      const gainOct = ctx.createGain();
      oscOct.type = bright ? "square" : "sine";
      oscOct.frequency.setValueAtTime(freq * 2, t0);
      gainOct.gain.setValueAtTime(0.001, t0);
      gainOct.gain.exponentialRampToValueAtTime(peakGain * (bright ? 0.22 : 0.34), t0 + 0.006);
      gainOct.gain.exponentialRampToValueAtTime(0.001, t0 + duration * 0.78);
      oscOct.connect(gainOct);
      gainOct.connect(masterGain);
      oscOct.start(t0);
      oscOct.stop(t0 + duration * 0.78 + 0.02);

      const oscPing = ctx.createOscillator();
      const gainPing = ctx.createGain();
      oscPing.type = "sine";
      oscPing.frequency.setValueAtTime(freq * 3, t0);
      gainPing.gain.setValueAtTime(0.001, t0);
      gainPing.gain.exponentialRampToValueAtTime(peakGain * 0.26, t0 + 0.004);
      gainPing.gain.exponentialRampToValueAtTime(0.001, t0 + 0.06);
      oscPing.connect(gainPing);
      gainPing.connect(masterGain);
      oscPing.start(t0);
      oscPing.stop(t0 + 0.07);
    };

    const playIosCriticalPulse = ({ start, duration }) => {
      const t0 = now + start;
      const pulseGain = ctx.createGain();
      pulseGain.gain.setValueAtTime(0.001, t0);
      pulseGain.gain.exponentialRampToValueAtTime(0.55, t0 + 0.01);
      pulseGain.gain.setValueAtTime(0.55, t0 + Math.max(0.02, duration - 0.02));
      pulseGain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
      pulseGain.connect(masterGain);

      [
        { freq: 853, type: "sawtooth", weight: 0.42 },
        { freq: 960, type: "square", weight: 0.36 },
        { freq: 1706, type: "sine", weight: 0.26 },
      ].forEach(({ freq, type, weight }) => {
        const osc = ctx.createOscillator();
        const subGain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t0);
        subGain.gain.setValueAtTime(weight, t0);
        osc.connect(subGain);
        subGain.connect(pulseGain);
        osc.start(t0);
        osc.stop(t0 + duration + 0.02);
      });
    };

    if (urgent) {
      playIosCriticalPulse({ start: 0.0, duration: 0.24 });
      playIosCriticalPulse({ start: 0.3, duration: 0.24 });

      const urgentFreqs = [987.77, 1244.51, 1479.98, 1975.53, 2489.02];
      [0.62, 1.32].forEach((offset) => {
        urgentFreqs.forEach((freq, idx) => {
          playIphoneBellNote({
            freq,
            start: offset + idx * 0.09,
            duration: idx === urgentFreqs.length - 1 ? 0.28 : 0.16,
            peakGain: 0.9,
            bright: true,
          });
        });
      });
    } else {
      const warningNotes = [
        { freq: 987.77, start: 0.0, duration: 0.16, peakGain: 0.72 },
        { freq: 1244.51, start: 0.11, duration: 0.16, peakGain: 0.76 },
        { freq: 1479.98, start: 0.22, duration: 0.22, peakGain: 0.82 },
        { freq: 1975.53, start: 0.34, duration: 0.32, peakGain: 0.88, bright: true },
        { freq: 987.77, start: 0.68, duration: 0.16, peakGain: 0.72 },
        { freq: 1244.51, start: 0.79, duration: 0.16, peakGain: 0.76 },
        { freq: 1479.98, start: 0.9, duration: 0.22, peakGain: 0.82 },
        { freq: 1975.53, start: 1.02, duration: 0.35, peakGain: 0.88, bright: true },
      ];
      warningNotes.forEach(playIphoneBellNote);
    }

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, urgent ? 2600 : 1700);
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
