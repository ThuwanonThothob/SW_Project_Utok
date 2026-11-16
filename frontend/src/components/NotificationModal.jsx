import { Bell, BellRing, CheckCircle2, RadioTower, ShieldCheck, Siren, Volume2, VolumeX, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getNotificationPermission, playAlertSound, requestNotificationPermission, sendSystemNotification } from "../services/notifications.js";

export default function NotificationModal({
  open,
  user,
  notifications = [],
  broadcasts = [],
  soundEnabled,
  onToggleSound,
  onOpenBroadcast,
  onClose,
}) {
  const [permission, setPermission] = useState(() => getNotificationPermission());

  useEffect(() => {
    if (!open) return;
    setPermission(getNotificationPermission());
  }, [open]);

  if (!open) return null;

  async function handleEnablePermission() {
    const next = await requestNotificationPermission();
    setPermission(next);
    if (next === "granted") {
      playAlertSound("warning");
      await sendSystemNotification({
        title: "เปิดระบบแจ้งเตือน UTOK (อุทก) สำเร็จ",
        body: "อุปกรณ์ของคุณพร้อมรับสัญญาณเตือนภัยน้ำท่วมแบบ Real-time แล้ว",
        level: "warning",
      });
    }
  }

  const permissionText =
    permission === "granted"
      ? "อนุญาตแจ้งเตือนแล้ว (พร้อมใช้งาน)"
      : permission === "denied"
        ? "ถูกบล็อกในเบราว์เซอร์ (กรุณาเปิดในตั้งค่าเว็บ)"
        : permission === "unsupported"
          ? "เบราว์เซอร์นี้ไม่รองรับ Web Notification API (ยังใช้เสียงและ Pop-up ในแอปได้)"
          : "ยังไม่ได้เปิดสิทธิ์แจ้งเตือนระดับระบบ";

  const combinedFeed = [
    ...notifications,
    ...broadcasts.map((b) => ({
      id: b.id,
      level: b.level || "warning",
      province: b.province,
      headline: b.headline,
      advisory: b.advisory,
      createdAt: b.createdAt,
      source: "ศูนย์บัญชาการ",
    })),
  ].slice(0, 8);

  return (
    <div className="modal-layer">
      <button className="overlay" onClick={onClose} aria-label="ปิด" />
      <section className="modal notification-modal">
        <button className="modal-close" onClick={onClose} aria-label="ปิดหน้าต่าง">
          <X />
        </button>
        <span className="modal-icon orange">
          <BellRing />
        </span>
        <span className="eyebrow">Real-time Emergency Notification Center</span>
        <h2>ศูนย์การแจ้งเตือนและประกาศเตือนภัยฉุกเฉิน</h2>
        <p>ตั้งค่าการรับแจ้งเตือนภัยน้ำท่วมบนอุปกรณ์นี้ และติดตามประกาศฉุกเฉินจากศูนย์บัญชาการ ปภ. แบบ Real-time</p>

        <div className="notif-status-bar">
          <div>
            <small>สถานะสิทธิ์แจ้งเตือนบนอุปกรณ์นี้</small>
            <b className={permission === "granted" ? "ok" : "warn"}>{permissionText}</b>
          </div>
          <div className="notif-status-actions">
            {permission !== "granted" && permission !== "unsupported" && (
              <button type="button" className="chip-button primary" onClick={handleEnablePermission}>
                <Bell /> เปิดสิทธิ์แจ้งเตือนบนอุปกรณ์นี้
              </button>
            )}
            <button
              type="button"
              className={`chip-button ${soundEnabled ? "active" : ""}`}
              onClick={() => {
                if (!soundEnabled) playAlertSound("warning");
                onToggleSound?.();
              }}
            >
              {soundEnabled ? <Volume2 /> : <VolumeX />}
              {soundEnabled ? "เสียงเตือนภัย: เปิดอยู่" : "เสียงเตือนภัย: ปิด"}
            </button>
            <button
              type="button"
              className="chip-button"
              onClick={() => playAlertSound("warning")}
              title="ลองฟังเสียงแจ้งเตือนสไตล์ iPhone (ระดับความดังสูงสุด)"
            >
              <Volume2 /> ฟังเสียงแจ้งเตือน
            </button>
          </div>
        </div>

        <div className="notif-lab-box">
          <div className="notif-lab-head">
            <span>
              <ShieldCheck /> <b>ระบบแจ้งเตือนอัตโนมัติตามพิกัด GPS และประกาศจากเจ้าหน้าที่</b>
            </span>
          </div>
          <p className="geofence-test-desc">
            ระบบจะแจ้งเตือนพร้อมเสียงไซเรนอัตโนมัติเมื่อตรวจพบพื้นที่เสี่ยงน้ำท่วมในจังหวัดที่คุณอยู่ หรือเมื่อศูนย์บัญชาการ ปภ. ออกประกาศเตือนภัยฉุกเฉินแบบ Real-time
          </p>
          {user?.role === "authority" && onOpenBroadcast && (
            <div className="notif-test-buttons">
              <button
                type="button"
                className="primary-button orange"
                onClick={() => {
                  onClose();
                  onOpenBroadcast();
                }}
              >
                <RadioTower /> ออกประกาศเตือนภัยฉุกเฉินถึงประชาชน
              </button>
            </div>
          )}
        </div>

        <div className="notif-feed-section">
          <div className="card-head">
            <div>
              <span className="eyebrow">รายการแจ้งเตือนล่าสุด</span>
              <h3>ประวัติสัญญาณเตือนภัย ({combinedFeed.length})</h3>
            </div>
          </div>
          <div className="notif-feed-list">
            {combinedFeed.length === 0 ? (
              <p className="empty-state">ยังไม่มีประกาศเตือนภัยฉุกเฉินในขณะนี้</p>
            ) : (
              combinedFeed.map((item) => (
                <article key={item.id} className={`notif-feed-item ${item.level || "warning"}`}>
                  <span className="notif-badge-icon">
                    {item.level === "evacuation" || item.level === "red" ? <Siren /> : <CheckCircle2 />}
                  </span>
                  <div>
                    <small>
                      {item.province} · {item.source || "Real-time Alert"}
                    </small>
                    <b>{item.headline}</b>
                    <p>{item.advisory}</p>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
