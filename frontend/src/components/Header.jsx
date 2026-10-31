import { Bell, CloudRain, LocateFixed, LogOut, ShieldAlert, ShieldCheck, Smartphone, Waves, Wifi, WifiOff } from "lucide-react";
import SWULogo from "./SWULogo.jsx";

export default function Header({
  mode,
  onModeChange,
  connected,
  user,
  userLocation,
  selectedProvince,
  notificationCount,
  onLocate,
  onOpenNotifications,
  onOpenInstall,
  onUserClick,
  onLogout,
}) {
  const liveTickerTitle = userLocation?.lat
    ? `📍 พิกัดปัจจุบัน: ${userLocation.address || `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`}`
    : selectedProvince
      ? `ข้อมูลจริง Open-Meteo · ${selectedProvince.name} (${selectedProvince.district})`
      : "กำลังซิงค์ข้อมูลสภาพอากาศจริงจาก Open-Meteo API...";

  const liveRain = userLocation?.lat
    ? `${userLocation.rainMm ?? 0} มม.${userLocation.temperature !== null ? ` · ${userLocation.temperature}°C` : ""}`
    : selectedProvince?.rain !== null && selectedProvince?.rain !== undefined
      ? `${selectedProvince.rain} มม.`
      : "LIVE";

  return (
    <header className="topbar">
      <a className="brand" href="#top" aria-label="UTOK อุทก หน้าแรก">
        <span className="brand-mark"><Waves /></span>
        <span className="brand-title">
          <b>UTOK</b>
          <small>อุทก · FLOOD WATCH</small>
        </span>
        <SWULogo />
      </a>

      <div className="weather-ticker">
        <span className="live-dot" />
        <div>
          <small>ข้อมูลสภาพอากาศและพิกัดจริง (Open-Meteo & GPS)</small>
          <b>{liveTickerTitle}</b>
        </div>
        <span className="rain-chip"><CloudRain /> {liveRain}</span>
      </div>

      <div className="top-actions">
        <span className={`connection ${connected ? "online" : "offline"}`} title={connected ? "เชื่อมต่อ API แล้ว" : "ไม่ได้เชื่อมต่อ API"}>
          {connected ? <Wifi /> : <WifiOff />}
          <span>{connected ? "LIVE" : "OFFLINE"}</span>
        </span>
        <button
          type="button"
          className="app-pill-button"
          onClick={onLocate}
          title="อัปเดตตำแหน่ง GPS ปัจจุบันของฉัน"
        >
          <LocateFixed />
          <span>{userLocation?.lat ? "GPS เปิดอยู่" : "เปิด GPS"}</span>
        </button>
        {user?.role === "authority" ? (
          <div className="authority-header-cluster">
            <span className="authority-role-pill" title="ระบบบัญชาการและคัดกรองเหตุการณ์สำหรับเจ้าหน้าที่">
              <ShieldCheck />
              <span>ศูนย์บัญชาการ</span>
            </span>
            <button
              type="button"
              className="authority-logout-header-btn"
              onClick={onLogout}
              title="ออกจากระบบเจ้าหน้าที่เพื่อกลับสู่หน้าประชาชน"
            >
              <LogOut />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              className="app-pill-button"
              onClick={onOpenInstall}
              title="ติดตั้งแอปลงโทรศัพท์มือถือ (PWA)"
            >
              <Smartphone />
              <span>แอปมือถือ</span>
            </button>
            <button
              type="button"
              className="authority-access-btn"
              onClick={() => onModeChange("authority")}
              title="เข้าสู่ระบบศูนย์บัญชาการสำหรับเจ้าหน้าที่ ปภ. / กู้ภัย"
            >
              <ShieldAlert />
              <span>สำหรับเจ้าหน้าที่</span>
            </button>
          </>
        )}
        <button
          type="button"
          className="icon-button"
          onClick={onOpenNotifications}
          title="ศูนย์แจ้งเตือนและทดสอบสัญญาณเตือนภัย"
          aria-label={`การแจ้งเตือน ${notificationCount} รายการ`}
        >
          <Bell />
          <span>{notificationCount}</span>
        </button>
        <button className="user-badge" onClick={onUserClick}>
          <b>{user ? (user.role === "authority" ? "จ" : user.name.slice(0, 1)) : "ป"}</b>
          <span>
            {user?.name || "เข้าสู่ระบบ / สมัคร"}
            <small>{user ? (user.role === "authority" ? `เจ้าหน้าที่ · ${user.agency || "ปภ."}` : "สมาชิกประชาชน") : "สำหรับประชาชน"}</small>
          </span>
        </button>
      </div>
    </header>
  );
}
