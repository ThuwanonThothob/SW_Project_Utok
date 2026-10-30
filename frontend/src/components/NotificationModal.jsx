import { Bell, BellRing, CheckCircle2, Navigation, RadioTower, Siren, Volume2, VolumeX, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getNotificationPermission, playAlertSound, requestNotificationPermission, sendSystemNotification } from "../services/notifications.js";

const levelLabels = {
  warning: "เฝ้าระวัง (Warning)",
  red: "เตือนภัยวิกฤต (Critical Red)",
  evacuation: "สั่งอพยพด่วน (Evacuation)",
};

export default function NotificationModal({
  open,
  provinces = [],
  notifications = [],
  broadcasts = [],
  soundEnabled,
  onToggleSound,
  onSendTestNotification,
  onLocalTestNotification,
  onSimulateProvince,
  onClose,
  busy,
}) {
  const [permission, setPermission] = useState(() => getNotificationPermission());
  const [form, setForm] = useState({
    level: "red",
    province: "กรุงเทพมหานคร",
    headline: "[ทดสอบระบบ] แจ้งเตือนระดับน้ำวิกฤตและฝนตกหนัก",
    advisory: "ขอให้ประชาชนในพื้นที่ลุ่มต่ำเตรียมยกของขึ้นที่สูง และตรวจสอบเส้นทางอพยพใกล้บ้านทันที",
  });

  useEffect(() => {
    if (!open) return;
    setPermission(getNotificationPermission());
  }, [open]);

  if (!open) return null;

  const update = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

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

  async function handleLocalDeviceTest() {
    playAlertSound(form.level);
    await sendSystemNotification({
      title: `${form.province} · ${ form.headline }`,
      body: form.advisory,
      level: form.level,
    });
    onLocalTestNotification?.({
      id: `LOCAL-${Date.now()}`,
      level: form.level,
      province: form.province,
      headline: form.headline,
      advisory: form.advisory,
      createdAt: new Date().toISOString(),
      source: "อุปกรณ์นี้ (Local Test)",
    });
  }

  async function handleRealtimeBroadcastTest(event) {
    event.preventDefault();
    await onSendTestNotification?.(form);
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
        <span className="eyebrow">Notification Center & Test Lab</span>
        <h2>ศูนย์แจ้งเตือนและทดสอบสัญญาณเตือนภัย</h2>
        <p>ตั้งค่าการแจ้งเตือนบนมือถือ/คอมพิวเตอร์ และจำลองการยิงแจ้งเตือนฉุกเฉินพร้อมเสียงไซเรนแบบ Real-time</p>

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
            <button type="button" className={`chip-button ${soundEnabled ? "active" : ""}`} onClick={onToggleSound}>
              {soundEnabled ? <Volume2 /> : <VolumeX />}
              {soundEnabled ? "เสียงเตือนภัย: เปิดอยู่" : "เสียงเตือนภัย: ปิด"}
            </button>
          </div>
        </div>

        <form onSubmit={handleRealtimeBroadcastTest} className="form-stack notif-lab-box">
          <div className="notif-lab-head">
            <span>
              <Siren /> <b>ศูนย์ทดสอบการแจ้งเตือน (Notification Test Lab)</b>
            </span>
            <small>ทดสอบได้ทันทีใน 1 คลิก</small>
          </div>

          <div className="profile-grid">
            <label>
              <span>ระดับความรุนแรง</span>
              <select value={form.level} onChange={update("level")}>
                {Object.entries(levelLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>พื้นที่เป้าหมาย</span>
              <select value={form.province} onChange={update("province")}>
                <option value="ทุกพื้นที่ทั่วประเทศ">ทุกพื้นที่ทั่วประเทศ</option>
                {provinces.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            <span>หัวข้อแจ้งเตือน (Headline)</span>
            <input value={form.headline} onChange={update("headline")} required />
          </label>

          <label>
            <span>รายละเอียดคำแนะนำ (Advisory)</span>
            <textarea rows="2" value={form.advisory} onChange={update("advisory")} required />
          </label>

          <div className="notif-test-buttons">
            <button type="button" className="primary-button" onClick={handleLocalDeviceTest}>
              <Volume2 /> ทดสอบแจ้งเตือน + เสียงบนอุปกรณ์นี้ทันที
            </button>
            <button type="submit" className="primary-button orange" disabled={busy}>
              <RadioTower /> {busy ? "กำลังส่งสัญญาณ..." : "ยิงทดสอบ Real-time ไปยังทุกเครื่อง (SSE Broadcast Test)"}
            </button>
          </div>
        </form>

        <div className="geofence-test-box">
          <div className="notif-lab-head">
            <span>
              <Navigation /> <b>ทดสอบแจ้งเตือนเมื่อเดินทางเข้า/ผ่านจังหวัด (Geofence Province Alert)</b>
            </span>
            <small>ระบบป้องกันรายงานเท็จ</small>
          </div>
          <p className="geofence-test-desc">
            เมื่อผู้ใช้เดินทางเข้าหรือข้ามเขตจังหวัด ระบบจะส่งเสียงไซเรนแจ้งเตือนระดับความเสี่ยงของจังหวัดนั้น และเปิดสิทธิ์การส่งรายงานเหตุน้ำท่วมเฉพาะในจังหวัดที่ท่านอยู่จริง
          </p>
          <div className="geofence-btn-group">
            <button
              type="button"
              className="chip-button"
              onClick={() => {
                onSimulateProvince?.("อุบลราชธานี");
                onClose();
              }}
            >
              📍 จำลองเข้า จ.อุบลราชธานี
            </button>
            <button
              type="button"
              className="chip-button"
              onClick={() => {
                onSimulateProvince?.("เชียงใหม่");
                onClose();
              }}
            >
              📍 จำลองเข้า จ.เชียงใหม่
            </button>
            <button
              type="button"
              className="chip-button"
              onClick={() => {
                onSimulateProvince?.("สงขลา");
                onClose();
              }}
            >
              📍 จำลองเข้า จ.สงขลา
            </button>
            <button
              type="button"
              className="chip-button"
              onClick={() => {
                onSimulateProvince?.("กรุงเทพมหานคร");
                onClose();
              }}
            >
              📍 จำลองเข้า กรุงเทพมหานคร
            </button>
          </div>
        </div>

        <div className="notif-feed-section">
          <div className="card-head">
            <div>
              <span className="eyebrow">รายการแจ้งเตือนล่าสุด</span>
              <h3>ประวัติสัญญาณเตือนภัย ({combinedFeed.length})</h3>
            </div>
          </div>
          <div className="notif-feed-list">
            {combinedFeed.map((item) => (
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
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
