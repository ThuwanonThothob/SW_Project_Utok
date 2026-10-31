import {
  ArrowRight,
  BellRing,
  Bot,
  CloudRain,
  Compass,
  ExternalLink,
  History,
  Image as ImageIcon,
  LocateFixed,
  LogIn,
  LogOut,
  MapPin,
  Mountain,
  Navigation,
  Newspaper,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Thermometer,
  TriangleAlert,
  UserRoundCheck,
  Waves,
  Trash2,
  X,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useState } from "react";
import FloodMap from "./FloodMap.jsx";
import { analyzeIncidentClient } from "../services/aiTriage.js";

const riskLabel = { high: "เสี่ยงสูง", medium: "เสี่ยงปานกลาง", low: "เสี่ยงต่ำ" };
const statusLabel = { pending: "รอตรวจสอบ", verified: "ยืนยันแล้ว", resolved: "แก้ไขแล้ว", rejected: "ปฏิเสธ" };

function relativeTime(value) {
  if (!value) return "ซิงค์ข้อมูลสด";
  const minutes = Math.max(1, Math.round((Date.now() - new Date(value)) / 60_000));
  return minutes < 60 ? `${minutes} นาทีที่แล้ว` : `${Math.round(minutes / 60)} ชม.ที่แล้ว`;
}

export default function CitizenView({
  provinces,
  reports,
  broadcasts,
  news,
  onRefreshNews,
  newsBusy,
  selectedProvince,
  userLocation,
  isSimulated = false,
  onResetRealGps,
  onSelectProvince,
  onReportAt,
  onLocate,
  user,
  myReports,
  onMemberLogin,
  onLogout,
  onDeleteReport,
  onOpenNotifications,
  onOpenInstall,
}) {
  const [feedTab, setFeedTab] = useState("all");
  const [previewReport, setPreviewReport] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dismissedAlerts, setDismissedAlerts] = useState(() => {
    try {
      const raw = sessionStorage.getItem("utok_dismissed_alerts");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  function dismissAlert(alertId) {
    setDismissedAlerts((prev) => {
      const next = [...prev, alertId];
      try {
        sessionStorage.setItem("utok_dismissed_alerts", JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  const activeBroadcasts = broadcasts.filter((b) => !dismissedAlerts.includes(b.id));
  const latestAlert = activeBroadcasts[0];
  const province = selectedProvince || provinces[0];
  const advice =
    province?.risk === "high"
      ? "คำแนะนำจากข้อมูลจริง: พื้นที่มีฝนสะสมหรือรายงานน้ำท่วมสูง ควรเตรียมย้ายสิ่งของขึ้นที่สูงและติดตามประกาศเตือนภัย"
      : province?.risk === "medium"
        ? "คำแนะนำจากข้อมูลจริง: มีฝนตกในพื้นที่หรือโอกาสเกิดฝนฟ้าคะนอง ควรติดตามระดับน้ำและสภาพจราจร"
        : "คำแนะนำจากข้อมูลจริง: ปริมาณฝนปัจจุบันอยู่ในเกณฑ์ปกติ (ข้อมูลสดจาก Open-Meteo API)";

  const activeReports = reports.filter((report) => report.status !== "rejected");
  const displayedReports = feedTab === "mine" ? myReports : activeReports.slice(0, 8);
  const newsItems = news?.items || [];

  return (
    <main className="citizen-view">
      {latestAlert && (
        <div className={`alert-ribbon ${latestAlert.level}`}>
          <TriangleAlert />
          <div className="alert-ribbon-content">
            <small>ประกาศเตือนภัยจริงจากศูนย์บัญชาการ · {latestAlert.province}</small>
            <b>{latestAlert.headline}</b>
          </div>
          <p>{latestAlert.advisory}</p>
          <button
            type="button"
            className="alert-ribbon-close"
            onClick={() => dismissAlert(latestAlert.id)}
            title="ปิดการแจ้งเตือนนี้"
            aria-label="ปิดการแจ้งเตือน"
          >
            <X />
          </button>
        </div>
      )}
      <div className={`citizen-layout ${sidebarOpen ? "sidebar-expanded" : "sidebar-collapsed"}`}>
        <aside className={`control-panel ${sidebarOpen ? "open" : "closed"}`}>
          <div className="sidebar-top-strip">
            <span className="sidebar-badge-label">
              <Layers /> แผงข้อมูลสถานการณ์จริง
            </span>
            <button
              type="button"
              className="sidebar-toggle-btn"
              onClick={() => setSidebarOpen(false)}
              title="ซ่อนแถบซ้ายมือเพื่อดูแผนที่เต็มจอ"
              aria-label="ซ่อนแถบซ้ายมือ"
            >
              <PanelLeftClose />
              <span>ซ่อนแถบ</span>
            </button>
          </div>

          {user ? (
            <div className="member-strip">
              <UserRoundCheck />
              <div>
                <small>
                  {user.role === "authority" ? "เจ้าหน้าที่" : "สมาชิกประชาชน"} ({user.email})
                </small>
                <b>{user.name}</b>
                <span>
                  <MapPin /> {user.homeProvince || "กรุงเทพมหานคร"} ·{" "}
                  <button type="button" className="inline-link-btn" onClick={() => setFeedTab("mine")}>
                    <History /> ดูรายงานของฉัน ({myReports.length})
                  </button>
                </span>
              </div>
              <button onClick={onLogout} title="ออกจากระบบ">
                <LogOut />
              </button>
            </div>
          ) : (
            <button className="member-cta" onClick={onMemberLogin}>
              <LogIn />
              <span>
                <b>เข้าสู่ระบบหรือสมัครสมาชิกจริง</b>
                <small>สมัครด้วยอีเมลจริงของคุณเพื่อแจ้งเหตุน้ำท่วมและติดตามประวัติรายงาน</small>
              </span>
              <ArrowRight />
            </button>
          )}

          <section className="live-gps-card" aria-live="polite">
            <div className="live-gps-head">
              <div>
                <span className="eyebrow">
                  {isSimulated ? "📍 Simulated Mode (โหมดจำลองพิกัด)" : "Real-time User Location & Live Telemetry"}
                </span>
                <h3>
                  <Navigation className="inline-icon" /> {isSimulated ? "ตำแหน่งที่จำลองไว้" : "ตำแหน่งปัจจุบันของคุณ"}
                </h3>
              </div>
              <div className="live-gps-actions">
                {isSimulated && (
                  <button
                    type="button"
                    className="chip-button warning"
                    onClick={onResetRealGps}
                    title="ยกเลิกการจำลองและกลับสู่ตำแหน่ง GPS จริงของฉัน"
                  >
                    <RefreshCw className="inline-icon" /> กลับพิกัดจริง
                  </button>
                )}
                <button type="button" className="chip-button primary" onClick={() => onLocate(false)}>
                  <LocateFixed /> {userLocation?.loading ? "กำลังค้นหา..." : userLocation?.lat ? "อัปเดตพิกัด" : "เปิด GPS ปัจจุบัน"}
                </button>
              </div>
            </div>

            {isSimulated && (
              <div className="simulated-location-banner">
                <span>⚠️ กำลังจำลองพิกัดใน <b>จ.{userLocation.provinceName}</b> เพื่อทดสอบระบบ</span>
                <button type="button" onClick={onResetRealGps}>กลับพิกัด GPS จริง</button>
              </div>
            )}

            {userLocation?.lat ? (
              <>
                <div className="live-gps-address">
                  <b>{userLocation.address || "พิกัด GPS ปัจจุบันของคุณ"}</b>
                  <small>
                    พิกัดจริง: {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)} (ความแม่นยำ ±
                    {userLocation.accuracy || 15} ม.)
                  </small>
                  {userLocation.provinceName && (
                    <div className="geofence-citizen-pill">
                      <ShieldCheck /> สิทธิ์การแจ้งเหตุ: <b>เปิดเฉพาะใน จ.{userLocation.provinceName} (ป้องกันรายงานเท็จ)</b>
                    </div>
                  )}
                </div>
                <div className="live-gps-metrics">
                  <div>
                    <Thermometer />
                    <small>อุณหภูมิจริง</small>
                    <b>{userLocation.temperature !== null ? `${userLocation.temperature} °C` : "รอซิงค์"}</b>
                  </div>
                  <div>
                    <CloudRain />
                    <small>ฝนตรวจวัดสด / โอกาสฝน</small>
                    <b>{userLocation.rainMm !== null ? `${userLocation.rainMm} มม.` : "0 มม."} (โอกาส {userLocation.rainProbability ?? 0}%)</b>
                  </div>
                  <div>
                    <Mountain />
                    <small>ความสูงพื้นที่จริง</small>
                    <b>{userLocation.elevation !== null ? `${userLocation.elevation} ม.` : "-"}</b>
                  </div>
                  <div>
                    <Waves />
                    <small>อัตราไหลแม่น้ำ (GloFAS)</small>
                    <b>{userLocation.riverDischarge !== null ? `${userLocation.riverDischarge} m³/s` : "ปกติ"}</b>
                  </div>
                </div>
                <button
                  type="button"
                  className="primary-button orange gps-report-btn"
                  onClick={() => onReportAt({ lat: userLocation.lat, lng: userLocation.lng })}
                >
                  <Compass /> แจ้งเหตุน้ำท่วม ณ ตำแหน่งปัจจุบันของฉันทันที
                </button>
              </>
            ) : (
              <div className="live-gps-empty">
                <p>
                  {userLocation?.error ||
                    "ระบบกำลังขอสิทธิ์เข้าถึงตำแหน่ง GPS ปัจจุบันของคุณเพื่อแสดงสภาพอากาศ ปริมาณฝน และความเสี่ยงน้ำท่วมจริง ณ จุดที่คุณยืนอยู่"}
                </p>
                <div className="gps-fallback-group">
                  <button type="button" className="primary-button" onClick={() => onLocate(false)}>
                    <LocateFixed /> {userLocation?.loading ? "กำลังค้นหาตำแหน่ง..." : "อนุญาตและเปิดตำแหน่ง GPS ของฉัน"}
                  </button>
                  <div className="gps-fallback-select-wrap">
                    <small>หรือเลือกจังหวัดของคุณจากรายการเพื่อดูข้อมูล:</small>
                    <select
                      className="fallback-province-select"
                      value={selectedProvince?.name || ""}
                      onChange={(e) => {
                        const target = provinces.find((p) => p.name === e.target.value);
                        if (target) onSelectProvince(target);
                      }}
                    >
                      <option value="">-- เลือกจังหวัดเพื่อดูสภาพอากาศและแผนที่ --</option>
                      {provinces.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name} ({p.district})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </section>

          <div className="quick-action-strip">
            {user?.role === "authority" ? (
              <button type="button" className="quick-action-btn" onClick={onOpenNotifications}>
                <BellRing /> ทดสอบสัญญาณเตือนภัย (Admin)
              </button>
            ) : (
              <button type="button" className="quick-action-btn" onClick={onOpenNotifications}>
                <BellRing /> ศูนย์แจ้งเตือนภัย
              </button>
            )}
            <button type="button" className="quick-action-btn" onClick={onOpenInstall}>
              <Smartphone /> ติดตั้งแอปมือถือ
            </button>
          </div>

          <div className="panel-title">
            <div>
              <span className="eyebrow">ข้อมูลจริงจาก Open-Meteo API · ครบ {provinces.length} จังหวัด</span>
              <h1>
                เช็กความเสี่ยงจริง
                <br />
                <em>รายจังหวัด</em>
              </h1>
            </div>
            <button onClick={() => onLocate(false)} aria-label="ใช้ตำแหน่งปัจจุบัน" title="ค้นหาตำแหน่งปัจจุบันด้วย GPS">
              <LocateFixed />
            </button>
          </div>

          {province && (
            <article className="risk-card">
              <div className="risk-location">
                <MapPin />
                <div>
                  <small>
                    {province.region} · แหล่งข้อมูล: {province.dataSource || "Open-Meteo Live"} ({relativeTime(province.updatedAt)})
                  </small>
                  <b>
                    {province.name} · {province.district}
                  </b>
                </div>
              </div>
              <div className="risk-main">
                <div className="risk-gauge" style={{ "--score": province.score || 0 }}>
                  <span>
                    <b>{province.score ?? 0}</b>%
                  </span>
                </div>
                <div>
                  <div className="risk-header-badge">
                    <span className={`risk-pill ${province.risk}`}>{riskLabel[province.risk] || "เสี่ยงต่ำ"}</span>
                    <span className="risk-type-tag">ความเสี่ยงน้ำท่วมฉับพลัน (Flash Flood Risk)</span>
                  </div>
                  <p>{advice}</p>
                </div>
              </div>
              <div className="risk-factors">
                <span>
                  <CloudRain />
                  <small>ฝนตรวจวัดสด (Radar/Obs)</small>
                  <b>{province.rain !== null && province.rain !== undefined ? `${province.rain} มม.` : "กำลังดึง..."}</b>
                </span>
                <span>
                  <CloudRain />
                  <small>โอกาสฝนตก (Forecast)</small>
                  <b>{province.rainProbability ?? 0}%</b>
                </span>
                <span>
                  <Mountain />
                  <small>ความสูงภูมิประเทศ</small>
                  <b>{province.elevation !== null && province.elevation !== undefined ? `${province.elevation} ม.` : "รอซิงค์"}</b>
                </span>
              </div>
            </article>
          )}

          <div className="section-title">
            <div>
              <span className="eyebrow">Real User Reports Only · ไม่มีข้อมูลจำลอง</span>
              <h2>รายงานสถานการณ์จากผู้ใช้งานจริง</h2>
            </div>
            <button
              onClick={() =>
                onReportAt(
                  userLocation?.lat
                    ? { lat: userLocation.lat, lng: userLocation.lng }
                    : province
                      ? { lat: province.lat, lng: province.lng }
                      : null,
                )
              }
            >
              แจ้งเหตุใหม่ <ArrowRight />
            </button>
          </div>

          <div className="feed-tabs" role="tablist">
            <button type="button" className={feedTab === "all" ? "active" : ""} onClick={() => setFeedTab("all")}>
              เหตุการณ์ที่แจ้งจริง ({activeReports.length})
            </button>
            <button
              type="button"
              className={feedTab === "mine" ? "active" : ""}
              onClick={() => {
                if (!user) onMemberLogin();
                else setFeedTab("mine");
              }}
            >
              รายงานของฉัน ({myReports.length})
            </button>
          </div>

          <div className="incident-list">
            {displayedReports.map((report) => {
              const triage =
                report.aiTriage ||
                analyzeIncidentClient({
                  description: report.description,
                  level: report.level,
                  province: report.province,
                  urgent: report.urgent,
                });
              return (
                <article key={report.id} className="incident-item detailed">
                  <div className="incident-top">
                    <span className={`incident-icon ${report.urgent ? "urgent" : ""}`}>
                      <Waves />
                    </span>
                    <div className="incident-meta">
                      <b>
                        {report.province} · {report.district}
                      </b>
                      <small>
                        {relativeTime(report.createdAt)} ·{" "}
                        <span className={`status-inline ${report.status}`}>{statusLabel[report.status]}</span>
                      </small>
                    </div>
                    <strong>{report.level}</strong>
                  </div>

                  {report.description && <p className="incident-desc">{report.description}</p>}

                  <div className="incident-footer">
                    <span className={`triage-pill ${triage.priority}`}>
                      <Bot /> {triage.label} ({triage.score}%)
                    </span>
                    {report.photo && (
                      <button type="button" className="photo-chip-btn" onClick={() => setPreviewReport(report)}>
                        <ImageIcon /> ดูรูปภาพหลักฐาน
                      </button>
                    )}
                    {feedTab === "mine" && onDeleteReport && (
                      <button
                        type="button"
                        className="delete-report-chip-btn"
                        onClick={() => {
                          if (window.confirm(`ต้องการยกเลิกรายงาน ${report.id} ใช่หรือไม่?`)) {
                            onDeleteReport(report.id);
                          }
                        }}
                        title="ยกเลิกรายงานนี้"
                      >
                        <Trash2 /> ยกเลิกรายงาน
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
            {!displayedReports.length && (
              <p className="empty-state">
                {feedTab === "mine"
                  ? "คุณยังไม่มีประวัติการส่งรายงาน — กดปุ่ม 'แจ้งเหตุน้ำท่วม' เพื่อส่งข้อมูลจริงจากตำแหน่งของคุณ"
                  : "ยังไม่มีรายงานเหตุน้ำท่วมที่ส่งเข้ามาในขณะนี้ — ระบบแสดงเฉพาะข้อมูลที่ผู้ใช้แจ้งเข้ามาจริงเท่านั้น"}
              </p>
            )}
          </div>

          <section className="news-agent-panel">
            <div className="section-title">
              <div>
                <span className="eyebrow">Live RSS Feed · ข่าวจริงเท่านั้น</span>
                <h2>
                  <Newspaper className="inline-icon" /> ข่าวสารสถานการณ์น้ำประเทศไทย
                </h2>
              </div>
              <button type="button" onClick={onRefreshNews} disabled={newsBusy}>
                <RefreshCw className={newsBusy ? "spin" : ""} /> {newsBusy ? "กำลังดึงข่าว..." : "ดึงข่าวจริงล่าสุด"}
              </button>
            </div>
            <div className="news-agent-list">
              {newsItems.slice(0, 6).map((item) => (
                <article key={item.id} className={`news-item ${item.severity || "info"}`}>
                  <div className="news-item-top">
                    <span className={`news-badge ${item.severity || "info"}`}>
                      {item.severity === "high" ? "ข่าวสำคัญ" : "ข่าวจริง"}
                    </span>
                    <small>
                      {item.province} · {item.source}
                    </small>
                  </div>
                  <b>{item.title}</b>
                  {(item.aiSummary || item.summary) && <p>{item.aiSummary || item.summary}</p>}
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noreferrer" className="news-link">
                      อ่านข่าวต้นฉบับจริง <ExternalLink />
                    </a>
                  )}
                </article>
              ))}
              {!newsItems.length && (
                <p className="empty-state">
                  ไม่พบรายการข่าวจากฟีดสดในขณะนี้ — ระบบตัดข่าวจำลองออกทั้งหมดและแสดงเฉพาะข่าวจากแหล่งข่าวจริงเท่านั้น
                </p>
              )}
            </div>
          </section>
        </aside>

        <div className="map-wrapper-relative">
          {!sidebarOpen && (
            <button
              type="button"
              className="map-sidebar-expand-btn"
              onClick={() => setSidebarOpen(true)}
              title="เปิดแถบข้อมูลซ้ายมือ"
              aria-label="เปิดแถบข้อมูลซ้ายมือ"
            >
              <PanelLeftOpen />
              <span>เปิดแผงข้อมูล</span>
            </button>
          )}
          <FloodMap
            provinces={provinces}
            reports={reports}
            selectedProvince={province}
            userLocation={userLocation}
            onSelectProvince={onSelectProvince}
            onReportAt={onReportAt}
            onLocate={() => onLocate(false)}
          />
        </div>
      </div>

      {previewReport && (
        <div className="modal-layer">
          <button className="overlay" onClick={() => setPreviewReport(null)} aria-label="ปิด" />
          <section className="modal photo-modal">
            <button className="modal-close" onClick={() => setPreviewReport(null)} aria-label="ปิด">
              <X />
            </button>
            <span className="eyebrow">หลักฐานภาพถ่ายจากพื้นที่จริง · {previewReport.id}</span>
            <h2>
              {previewReport.province} · {previewReport.district}
            </h2>
            <p>{previewReport.description}</p>
            <div className="photo-lightbox-frame">
              <img src={previewReport.photo} alt={`ภาพน้ำท่วม ${previewReport.province}`} />
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
