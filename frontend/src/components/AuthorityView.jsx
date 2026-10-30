import {
  BadgeCheck,
  BellRing,
  Bot,
  CheckCheck,
  Clock3,
  ExternalLink,
  Globe2,
  Image as ImageIcon,
  Inbox,
  MapPinned,
  Newspaper,
  RadioTower,
  RefreshCw,
  Search,
  Siren,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { analyzeIncidentClient } from "../services/aiTriage.js";

const statusLabel = { pending: "รอตรวจสอบ", verified: "ยืนยันแล้ว", resolved: "แก้ไขแล้ว", rejected: "ปฏิเสธ" };
const riskLabel = { high: "เสี่ยงสูง", medium: "ปานกลาง", low: "เสี่ยงต่ำ" };

export default function AuthorityView({
  reports,
  provinces,
  broadcasts,
  news,
  onRefreshNews,
  newsBusy,
  onModerate,
  onDeleteReport,
  onRiskChange,
  onOpenBroadcast,
  onOpenNotifications,
  onRefresh,
  onLogout,
}) {
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("ai_priority");
  const [search, setSearch] = useState("");
  const [provinceQuery, setProvinceQuery] = useState("");
  const [region, setRegion] = useState("all");
  const [previewReport, setPreviewReport] = useState(null);

  const enrichedReports = useMemo(
    () =>
      reports.map((report) => ({
        ...report,
        aiTriage:
          report.aiTriage ||
          analyzeIncidentClient({
            description: report.description,
            level: report.level,
            province: report.province,
            urgent: report.urgent,
          }),
      })),
    [reports],
  );

  const filtered = useMemo(() => {
    const list = enrichedReports.filter(
      (report) =>
        (status === "all"
          ? true
          : status === "p1_critical"
            ? (report.aiTriage?.priority === "critical" || report.urgent)
            : report.status === status) &&
        (!search ||
          `${report.id} ${report.province} ${report.district} ${report.reporter} ${report.description}`
            .toLowerCase()
            .includes(search.toLowerCase())),
    );
    if (sortBy === "ai_priority") {
      return [...list].sort((a, b) => (b.aiTriage?.score || 0) - (a.aiTriage?.score || 0));
    }
    return list;
  }, [enrichedReports, status, search, sortBy]);

  const regions = useMemo(() => [...new Set(provinces.map((province) => province.region))].filter(Boolean).sort(), [provinces]);
  const filteredProvinces = useMemo(
    () =>
      provinces.filter(
        (province) =>
          (region === "all" || province.region === region) &&
          (!provinceQuery || `${province.name} ${province.district}`.toLowerCase().includes(provinceQuery.toLowerCase())),
      ),
    [provinces, provinceQuery, region],
  );

  const criticalCount = useMemo(
    () =>
      enrichedReports.filter(
        (item) =>
          (item.aiTriage?.priority === "critical" || item.urgent) && !["resolved", "rejected"].includes(item.status),
      ).length,
    [enrichedReports],
  );

  const metrics = [
    { label: "รายงานจริงทั้งหมด", value: reports.length, detail: "จากผู้ใช้งานจริง", icon: Inbox, tone: "cyan" },
    { label: "รอตรวจสอบ", value: reports.filter((item) => item.status === "pending").length, detail: "ต้องดำเนินการ", icon: Clock3, tone: "amber" },
    { label: "เคสวิกฤต AI (P1/ด่วน)", value: criticalCount, detail: "AI คัดกรองเร่งด่วน", icon: Siren, tone: "red" },
    { label: "พื้นที่เสี่ยงสูงจริง", value: provinces.filter((item) => item.risk === "high").length, detail: "คำนวณจากฝนจริง", icon: MapPinned, tone: "violet" },
    { label: "ครอบคลุมทั่วประเทศ", value: provinces.length, detail: `${regions.length} ภูมิภาค`, icon: Globe2, tone: "green" },
  ];

  const newsItems = news?.items || [];

  return (
    <main className="authority-view">
      <section className="authority-hero">
        <div>
          <span className="eyebrow">ศูนย์บัญชาการสถานการณ์น้ำ · ข้อมูลจริงจาก Open-Meteo & ผู้ใช้งาน</span>
          <h1>ภาพรวมสถานการณ์และการคัดกรองอัจฉริยะ</h1>
          <p>ติดตามความเสี่ยงจริง {provinces.length}/77 จังหวัด · แสดงเฉพาะรายงานและประกาศที่สร้างขึ้นจริง</p>
        </div>
        <div>
          <button className="secondary-button" onClick={onRefresh}>
            <RefreshCw /> ซิงค์ข้อมูลจริงล่าสุด
          </button>
          <button className="secondary-button" onClick={onOpenNotifications}>
            <BellRing /> ทดสอบแจ้งเตือน
          </button>
          <button className="warning-button" onClick={onOpenBroadcast}>
            <RadioTower /> สร้างประกาศเตือนภัย
          </button>
          <button className="secondary-button" onClick={onLogout}>
            ออกจากระบบ
          </button>
        </div>
      </section>

      <section className="metrics">
        {metrics.map(({ label, value, detail, icon: Icon, tone }) => (
          <article key={label}>
            <span className={tone}>
              <Icon />
            </span>
            <div>
              <small>{label}</small>
              <b>{value}</b>
              <em>{detail}</em>
            </div>
          </article>
        ))}
      </section>

      <div className="authority-grid">
        <section className="data-card reports-card">
          <div className="card-head">
            <div>
              <span className="eyebrow">ศูนย์ตรวจสอบข้อมูลและจัดลำดับกู้ภัยด้วย AI</span>
              <h2>รายงานจากประชาชน ({filtered.length})</h2>
            </div>
            <div className="filters">
              <label>
                <Search />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหารายงาน/คำสำคัญ" />
              </label>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="เรียงลำดับรายงาน">
                <option value="ai_priority">เรียงตามความเร่งด่วน AI (P1 → P4)</option>
                <option value="latest">เรียงตามเวลาล่าสุด</option>
              </select>
              <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="กรองตามสถานะ">
                <option value="all">ทุกสถานะ</option>
                <option value="p1_critical">🚨 เฉพาะเคสวิกฤต AI (P1 Critical)</option>
                {Object.entries(statusLabel).map(([key, label]) => (
                  <option value={key} key={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>พื้นที่ / ผู้แจ้ง / รายละเอียด</th>
                  <th>ระดับน้ำ & หลักฐาน</th>
                  <th>ผลวิเคราะห์ AI Triage</th>
                  <th>สถานะ</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((report) => (
                  <tr key={report.id}>
                    <td>
                      <b>
                        {report.province} · {report.district}
                      </b>
                      <small>
                        {report.id} · {report.reporter}
                      </small>
                      {report.description && <p className="table-report-desc">{report.description}</p>}
                    </td>
                    <td>
                      <strong>{report.level}</strong>
                      {report.urgent && <em>ด่วน</em>}
                      {report.photo && (
                        <div className="table-photo-box">
                          <button type="button" className="photo-chip-btn" onClick={() => setPreviewReport(report)}>
                            <ImageIcon /> ดูรูปภาพหลักฐาน
                          </button>
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="table-ai-cell">
                        <span className={`triage-pill ${report.aiTriage.priority}`}>
                          <Bot /> {report.aiTriage.label} · {report.aiTriage.score}%
                        </span>
                        <div className="ai-tag-list compact">
                          {report.aiTriage.tags?.slice(0, 2).map((tag) => (
                            <span key={tag} className="ai-tag">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <small className="table-ai-rec">{report.aiTriage.recommendation}</small>
                      </div>
                    </td>
                    <td>
                      <span className={`status ${report.status}`}>{statusLabel[report.status]}</span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button title="ยืนยัน" onClick={() => onModerate(report.id, "verified")}>
                          <BadgeCheck />
                        </button>
                        <button title="แก้ไขแล้ว" onClick={() => onModerate(report.id, "resolved")}>
                          <CheckCheck />
                        </button>
                        <button title="ปฏิเสธ" onClick={() => onModerate(report.id, "rejected")}>
                          <X />
                        </button>
                        {onDeleteReport && (
                          <button
                            title="ลบรายงาน"
                            className="delete-report-btn"
                            onClick={() => {
                              if (window.confirm(`ต้องการลบรายงาน ${report.id} ถาวรใช่หรือไม่?`)) {
                                onDeleteReport(report.id);
                              }
                            }}
                          >
                            <Trash2 />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filtered.length && (
              <p className="empty-state">
                ยังไม่มีรายงานเหตุน้ำท่วมในระบบ — เมื่อประชาชนส่งรายงานจริงเข้ามา รายการจะปรากฏที่นี่แบบ Real-time
              </p>
            )}
          </div>
        </section>

        <aside className="side-stack">
          <section className="data-card province-card">
            <div className="card-head">
              <div>
                <span className="eyebrow">ข้อมูลจริงรายจังหวัด (Open-Meteo)</span>
                <h2>ระดับความเสี่ยงรายจังหวัด</h2>
              </div>
              <span className="province-count">
                {filteredProvinces.length}/{provinces.length}
              </span>
            </div>
            <div className="province-filters">
              <label>
                <Search />
                <input
                  value={provinceQuery}
                  onChange={(event) => setProvinceQuery(event.target.value)}
                  placeholder="ค้นหาจังหวัด"
                  aria-label="ค้นหาจังหวัด"
                />
              </label>
              <select value={region} onChange={(event) => setRegion(event.target.value)} aria-label="กรองภูมิภาค">
                <option value="all">ทุกภูมิภาค</option>
                {regions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="zone-list">
              {filteredProvinces.map((province) => (
                <div className="zone-row" key={province.id}>
                  <span className={`dot ${province.risk}`} />
                  <div>
                    <b>{province.name}</b>
                    <small>
                      {province.region} · ฝนจริง {province.rain ?? 0} มม. · คะแนน {province.score ?? 0}% · {province.affected || 0} รายงาน
                    </small>
                  </div>
                  <select
                    value={province.risk}
                    aria-label={`ระดับความเสี่ยง ${province.name}`}
                    onChange={(event) => onRiskChange(province, event.target.value)}
                  >
                    {Object.entries(riskLabel).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              {!filteredProvinces.length && <p className="empty-state">ไม่พบจังหวัดที่ค้นหา</p>}
            </div>
          </section>

          <section className="data-card">
            <div className="card-head">
              <div>
                <span className="eyebrow">Live RSS Feed</span>
                <h2>ข่าวสารน้ำท่วมจริง</h2>
              </div>
              <button type="button" className="chip-button" onClick={onRefreshNews} disabled={newsBusy}>
                <RefreshCw className={newsBusy ? "spin" : ""} /> {newsBusy ? "กำลังดึง..." : "ดึงข่าวล่าสุด"}
              </button>
            </div>
            <div className="news-agent-list compact">
              {newsItems.slice(0, 4).map((item) => (
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
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noreferrer" className="news-link">
                      เปิดแหล่งข่าวจริง <ExternalLink />
                    </a>
                  )}
                </article>
              ))}
              {!newsItems.length && <p className="empty-state">ไม่มีรายการข่าวจากฟีดสดในขณะนี้</p>}
            </div>
          </section>

          <section className="data-card">
            <div className="card-head">
              <div>
                <span className="eyebrow">ประกาศที่ออกโดยเจ้าหน้าที่จริง</span>
                <h2>Broadcast feed</h2>
              </div>
              <span className="live-label">LIVE</span>
            </div>
            <div className="broadcast-list">
              {broadcasts.slice(0, 4).map((item) => (
                <article key={item.id}>
                  <RadioTower />
                  <div>
                    <b>{item.headline}</b>
                    <p>{item.advisory}</p>
                    <small>{item.province}</small>
                  </div>
                </article>
              ))}
              {!broadcasts.length && <p className="empty-state">ยังไม่มีประกาศเตือนภัยที่ออกในขณะนี้</p>}
            </div>
          </section>
        </aside>
      </div>

      {previewReport && (
        <div className="modal-layer">
          <button className="overlay" onClick={() => setPreviewReport(null)} aria-label="ปิด" />
          <section className="modal photo-modal">
            <button className="modal-close" onClick={() => setPreviewReport(null)} aria-label="ปิด">
              <X />
            </button>
            <span className="eyebrow">หลักฐานภาพถ่ายรายงานน้ำท่วม · {previewReport.id}</span>
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
