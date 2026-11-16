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
  PhoneCall,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Target,
  Thermometer,
  ThumbsUp,
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
const trendMeta = {
  rising: { text: "📈 แนวโน้มฝนเพิ่มขึ้น", cls: "rising" },
  falling: { text: "📉 แนวโน้มฝนลดลง", cls: "falling" },
  stable: { text: "➖ แนวโน้มฝนทรงตัว", cls: "stable" },
};
const EMERGENCY_HOTLINES = [
  { number: "1784", label: "ปภ. แจ้งเหตุฉุกเฉิน" },
  { number: "1669", label: "กู้ชีพ / แพทย์ฉุกเฉิน" },
  { number: "1460", label: "กรมชลประทาน" },
  { number: "1129", label: "กฟภ. แจ้งไฟรั่ว" },
  { number: "1193", label: "ตำรวจทางหลวง" },
];
const IMPACT_CHECKLIST = {
  high: [
    "ย้ายรถยนต์ เอกสารสำคัญ ปลั๊กพ่วง และกลุ่มเปราะบางขึ้นที่สูงทันที",
    "สับคัตเอาท์ไฟฟ้าชั้นล่างหากน้ำเริ่มเอ่อเข้าตัวบ้าน และเตรียมกระเป๋าฉุกเฉิน 72 ชม.",
    "กดปุ่ม 'จุดพักพิง' บนแผนที่ หรือโทร ปภ. 1784 เพื่อประสานรถยกสูง/เรืออพยพ",
  ],
  medium: [
    "ติดตามแนวโน้มฝน 72 ชม. ล่วงหน้าและระดับน้ำในคลอง/ท่อระบายน้ำใกล้เคียง",
    "เตรียมกระสอบทรายกั้นทางเข้าบ้าน และชาร์จโทรศัพท์/พาวเวอร์แบงก์ให้พร้อม",
    "หลีกเลี่ยงเส้นทางลุ่มต่ำหรือจุดที่มีรายงานน้ำรอระบายบนแผนที่",
  ],
  low: [
    "สถานการณ์ฝนและระดับน้ำปกติ เปิด GPS ทิ้งไว้เพื่อรับแจ้งเตือนข้ามเขตจังหวัด",
    "ตรวจสอบและเคลียร์เศษขยะบริเวณตะแกรงท่อระบายน้ำหน้าบ้าน",
    "หากพบเหตุน้ำท่วมขังหรือท่อระบายน้ำตัน สามารถกดแจ้งเหตุพร้อมภาพถ่ายได้ทันที",
  ],
};

function computeRiskBreakdown(province) {
  if (!province) return { rain: 0, terrain: 0, reports: 0 };
  if (province.riskBreakdown) return province.riskBreakdown;
  const rainMm = Number(province.rain || 0);
  const rainProb = Number(province.rainProbability || 0);
  const elevation = province.elevation ?? null;
  const activeReports = Number(province.affected || 0);
  const rain = rainMm > 0 ? Math.min(65, Math.round(rainMm * 1.35 + (rainProb >= 80 ? 6 : 0))) : 0;
  const terrain =
    (rainMm >= 5 || activeReports > 0) && elevation !== null
      ? Math.max(0, Math.min(20, Math.round((30 - Math.min(30, elevation)) * 0.5)))
      : 0;
  const reports = Math.min(35, activeReports * 12);
  return { rain, terrain, reports };
}

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
  onSelectProvince,
  onReportAt,
  onLocate,
  user,
  myReports,
  onMemberLogin,
  onLogout,
  onDeleteReport,
  onUpvoteReport,
  onOpenNotifications,
  onOpenInstall,
}) {
  const [feedTab, setFeedTab] = useState("all");
  const [previewReport, setPreviewReport] = useState(null);
  const [focusedReport, setFocusedReport] = useState(null);
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
      ? "ข้อแนะนำประจำพื้นที่: มีฝนสะสมหรือรายงานน้ำท่วมสูง ควรเตรียมย้ายสิ่งของขึ้นที่สูงและติดตามประกาศเตือนภัย"
      : province?.risk === "medium"
        ? "ข้อแนะนำประจำพื้นที่: มีโอกาสเกิดฝนตกหนักในพื้นที่ ควรติดตามระดับน้ำและตรวจสอบเส้นทางสัญจร"
        : "ข้อแนะนำประจำพื้นที่: ปริมาณฝนและระดับน้ำปัจจุบันอยู่ในเกณฑ์ปกติ";

  const activeReports = reports.filter((report) => report.status !== "rejected");
  const displayedReports = feedTab === "mine" ? myReports : activeReports.slice(0, 8);
  const newsItems = news?.items || [];

  return (
    <main className="citizen-view">
      {latestAlert && (
        <div className={`alert-ribbon ${latestAlert.level}`}>
          <TriangleAlert />
          <div className="alert-ribbon-content">
            <small>ประกาศแจ้งเตือนภัยฉุกเฉิน · {latestAlert.province}</small>
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
              <Layers /> แผงข้อมูลสถานการณ์น้ำ
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
                  สมาชิกประชาชน ({user.email})
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
                <b>เข้าสู่ระบบ / สมัครสมาชิก</b>
                <small>เข้าสู่ระบบเพื่อแจ้งเหตุน้ำท่วมและติดตามสถานะการช่วยเหลือ</small>
              </span>
              <ArrowRight />
            </button>
          )}

          <section className="live-gps-card" aria-live="polite">
            <div className="live-gps-head">
              <div>
                <span className="eyebrow">Real-time User Location & Live Telemetry</span>
                <h3>
                  <Navigation className="inline-icon" /> ตำแหน่งปัจจุบันของคุณ
                </h3>
              </div>
              <div className="live-gps-actions">
                <button type="button" className="chip-button primary" onClick={() => onLocate(false)}>
                  <LocateFixed /> {userLocation?.loading ? "กำลังค้นหา..." : userLocation?.lat ? "อัปเดตพิกัด" : "เปิด GPS ปัจจุบัน"}
                </button>
              </div>
            </div>

            {userLocation?.lat ? (
              <>
                <div className="live-gps-address">
                  <b>{userLocation.address || "พิกัด GPS ปัจจุบันของคุณ"}</b>
                  <small>
                    พิกัด GPS: {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)} (ความแม่นยำ ±
                    {userLocation.accuracy || 15} ม.)
                  </small>
                  {userLocation.provinceName && (
                    <div className="geofence-citizen-pill">
                      <ShieldCheck /> พื้นที่ยืนยันพิกัด: <b>จ.{userLocation.provinceName} (พร้อมแจ้งเหตุในพื้นที่)</b>
                    </div>
                  )}
                </div>
                <div className="live-gps-metrics">
                  <div>
                    <Thermometer />
                    <small>อุณหภูมิปัจจุบัน</small>
                    <b>{userLocation.temperature !== null ? `${userLocation.temperature} °C` : "รอซิงค์"}</b>
                  </div>
                  <div>
                    <CloudRain />
                    <small>ปริมาณฝน / โอกาสเกิดฝน</small>
                    <b>{userLocation.rainMm !== null ? `${userLocation.rainMm} มม.` : "0 มม."} (โอกาส {userLocation.rainProbability ?? 0}%)</b>
                  </div>
                  <div>
                    <Mountain />
                    <small>ความสูงภูมิประเทศ</small>
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
                    "กรุณาอนุญาตการเข้าถึงตำแหน่ง GPS เพื่อตรวจสอบสภาพอากาศ ปริมาณฝน และระดับความเสี่ยงน้ำท่วมในพื้นที่ของคุณ"}
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
            <button type="button" className="quick-action-btn" onClick={onOpenNotifications}>
              <BellRing /> ศูนย์แจ้งเตือนภัย
            </button>
            <button type="button" className="quick-action-btn" onClick={onOpenInstall}>
              <Smartphone /> ติดตั้งแอปมือถือ
            </button>
          </div>

          <div className="panel-title">
            <div>
              <span className="eyebrow">ระบบเฝ้าระวังอุทกภัย · ครบ {provinces.length} จังหวัดทั่วประเทศ</span>
              <h1>
                ระดับความเสี่ยงอุทกภัย
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
              {(() => {
                const bd = computeRiskBreakdown(province);
                const isManualOverride = province.dataSource === "manual-authority-update";
                return (
                  <div className="explainable-risk-box">
                    <div className="explainable-risk-head">
                      <small>องค์ประกอบคะแนนความเสี่ยง (Explainable Risk)</small>
                      {isManualOverride && (
                        <span className="manual-override-badge">ปรับระดับโดยเจ้าหน้าที่</span>
                      )}
                    </div>
                    <div className="risk-breakdown-bar" aria-label="สัดส่วนปัจจัยความเสี่ยง">
                      <span
                        className="rb-seg rain"
                        style={{ width: `${Math.min(100, bd.rain)}%` }}
                        title={`ปริมาณและโอกาสฝน +${bd.rain}%`}
                      />
                      <span
                        className="rb-seg terrain"
                        style={{ width: `${Math.min(100, bd.terrain)}%` }}
                        title={`ความลุ่มต่ำพื้นที่ +${bd.terrain}%`}
                      />
                      <span
                        className="rb-seg reports"
                        style={{ width: `${Math.min(100, bd.reports)}%` }}
                        title={`รายงานในพื้นที่ +${bd.reports}%`}
                      />
                    </div>
                    <div className="risk-breakdown-legend">
                      <span><i className="rb-dot rain" /> 🌧️ ฝน/โอกาสตก <b>+{bd.rain}%</b></span>
                      <span><i className="rb-dot terrain" /> ⛰️ พื้นที่ลุ่มต่ำ <b>+{bd.terrain}%</b></span>
                      <span><i className="rb-dot reports" /> 📋 รายงานในพื้นที่ <b>+{bd.reports}%</b></span>
                    </div>
                  </div>
                );
              })()}
              {province.forecast3Day?.length > 0 && (
                <div className="forecast-3day-strip">
                  <div className="forecast-strip-head">
                    <small>คาดการณ์ปริมาณฝนล่วงหน้า 3 วัน (72 ชม. Open-Meteo)</small>
                    <span className={`trend-pill ${(trendMeta[province.rainTrend] || trendMeta.stable).cls}`}>
                      {(trendMeta[province.rainTrend] || trendMeta.stable).text}
                    </span>
                  </div>
                  <div className="forecast-days-grid">
                    {province.forecast3Day.map((day) => {
                      const barPct =
                        day.rainMm > 0
                          ? Math.min(100, Math.max(12, Math.round((day.rainMm / 60) * 100)))
                          : Math.min(100, Math.max(6, Math.round((day.prob || 0) * 0.45)));
                      const barTone =
                        day.rainMm >= 35 ? "heavy" : day.rainMm >= 10 ? "medium" : "light";
                      return (
                        <div key={day.label} className="forecast-day-box">
                          <span>{day.label}</span>
                          <b>{day.rainMm} มม.</b>
                          <div className="forecast-bar-track" aria-hidden="true">
                            <span
                              className={`forecast-bar-fill ${barTone}`}
                              style={{ width: `${barPct}%` }}
                            />
                          </div>
                          <small>โอกาสตก {day.prob}%</small>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </article>
          )}

          {province && (
            <section className={`emergency-guide-card ${province.risk || "low"}`}>
              <div className="emergency-guide-head">
                <h3>
                  <ShieldCheck /> แนวทางปฏิบัติตัว (ปภ.) · จ.{province.name}
                </h3>
                <span className={`risk-pill ${province.risk}`}>{riskLabel[province.risk] || "เสี่ยงต่ำ"}</span>
              </div>
              <ol className="action-checklist">
                {(IMPACT_CHECKLIST[province.risk] || IMPACT_CHECKLIST.low).map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <div className="hotline-grid" aria-label="สายด่วนฉุกเฉิน">
                {EMERGENCY_HOTLINES.map((hotline) => (
                  <a key={hotline.number} href={`tel:${hotline.number}`} className="hotline-pill">
                    <PhoneCall />
                    <span>
                      <b>{hotline.number}</b>
                      <small>{hotline.label}</small>
                    </span>
                  </a>
                ))}
              </div>
            </section>
          )}

          <div className="section-title">
            <div>
              <span className="eyebrow">Field Incident Reports · รายงานจากพื้นที่</span>
              <h2>รายงานสถานการณ์น้ำท่วมในพื้นที่</h2>
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
              รายงานทั้งหมด ({activeReports.length})
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
                  upvotes: report.upvotes || 0,
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

                  {report.status !== "rejected" && (
                    <div className="incident-stepper" aria-label="ความคืบหน้าการช่วยเหลือ">
                      <div className="step-node done">
                        <span className="step-dot" />
                        <small>แจ้งเหตุแล้ว</small>
                      </div>
                      <span
                        className={`step-line ${
                          report.status === "verified" || report.status === "resolved" ? "done" : ""
                        }`}
                      />
                      <div
                        className={`step-node ${
                          report.status === "verified" || report.status === "resolved" ? "done" : "pending"
                        }`}
                      >
                        <span className="step-dot" />
                        <small>รับเรื่อง/ส่งทีมกู้ภัย</small>
                      </div>
                      <span className={`step-line ${report.status === "resolved" ? "done" : ""}`} />
                      <div className={`step-node ${report.status === "resolved" ? "done" : ""}`}>
                        <span className="step-dot" />
                        <small>คลี่คลายแล้ว</small>
                      </div>
                    </div>
                  )}

                  {report.authorityNote && (
                    <div className="authority-note-banner">
                      <ShieldCheck />
                      <span>
                        <b>บันทึกจากศูนย์บัญชาการ:</b> {report.authorityNote}
                      </span>
                    </div>
                  )}

                  <div className="incident-footer">
                    <span className={`triage-pill ${triage.priority}`}>
                      <Bot /> {triage.label} ({triage.score}%)
                    </span>
                    <div className="incident-card-actions">
                      {onUpvoteReport && (
                        <button
                          type="button"
                          className="upvote-chip-btn"
                          onClick={() => onUpvoteReport(report.id)}
                          title="ร่วมยืนยันสถานการณ์น้ำท่วมในจุดนี้"
                        >
                          <ThumbsUp /> ร่วมยืนยัน ({report.upvotes || 0})
                        </button>
                      )}
                      <button
                        type="button"
                        className="focus-pin-btn"
                        onClick={() => setFocusedReport({ ...report, _ts: Date.now() })}
                        title="บินไปยังพิกัดหมุดเหตุการณ์บนแผนที่"
                      >
                        <Target /> ดูหมุดบนแผนที่
                      </button>
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
                  </div>
                </article>
              );
            })}
            {!displayedReports.length && (
              <p className="empty-state">
                {feedTab === "mine"
                  ? "คุณยังไม่มีประวัติการแจ้งเหตุ — กดปุ่ม 'แจ้งเหตุใหม่' เพื่อรายงานสถานการณ์ในพื้นที่ของคุณ"
                  : "ยังไม่มีรายงานเหตุน้ำท่วมในขณะนี้"}
              </p>
            )}
          </div>

          <section className="news-agent-panel">
            <div className="section-title">
              <div>
                <span className="eyebrow">Flood Situation News · เกาะติดสถานการณ์น้ำ</span>
                <h2>
                  <Newspaper className="inline-icon" /> ข่าวสารสถานการณ์น้ำประเทศไทย
                </h2>
              </div>
              <button type="button" onClick={onRefreshNews} disabled={newsBusy}>
                <RefreshCw className={newsBusy ? "spin" : ""} /> {newsBusy ? "กำลังอัปเดต..." : "อัปเดตข่าวล่าสุด"}
              </button>
            </div>
            <div className="news-agent-list">
              {newsItems.slice(0, 6).map((item) => (
                <article key={item.id} className={`news-item ${item.severity || "info"}`}>
                  <div className="news-item-top">
                    <span className={`news-badge ${item.severity || "info"}`}>
                      {item.severity === "high" ? "เฝ้าระวังสูง" : "ข่าวสถานการณ์น้ำ"}
                    </span>
                    <small>
                      {item.province} · {item.source}
                    </small>
                  </div>
                  <b>{item.title}</b>
                  {(item.aiSummary || item.summary) && <p>{item.aiSummary || item.summary}</p>}
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noreferrer" className="news-link">
                      อ่านข่าวต้นฉบับ <ExternalLink />
                    </a>
                  )}
                </article>
              ))}
              {!newsItems.length && (
                <p className="empty-state">
                  ยังไม่มีรายการข่าวอัปเดตในขณะนี้ สามารถกดปุ่ม "อัปเดตข่าวล่าสุด" เพื่อตรวจสอบอีกครั้ง
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
            focusedReport={focusedReport}
            onSelectProvince={onSelectProvince}
            onReportAt={onReportAt}
            isAuthority={false}
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
            <span className="eyebrow">ภาพถ่ายประกอบรายงาน · {previewReport.id}</span>
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
