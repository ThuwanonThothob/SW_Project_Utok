(() => {
  "use strict";

  const STORAGE_KEY = "thaiflood-watch-state-v1";
  const DEFAULT_STATE = {
    activeRole: "citizen",
    adminAuthenticated: false,
    notificationsRead: false,
    selectedProvince: "กรุงเทพมหานคร",
    provinces: [
      { id: "bkk", name: "กรุงเทพมหานคร", district: "เขตดุสิต", lat: 13.7768, lng: 100.5206, risk: "medium", score: 68, rain: 82, river: 1.8, elevation: 2.1, affected: 6 },
      { id: "aya", name: "พระนครศรีอยุธยา", district: "อำเภอพระนครศรีอยุธยา", lat: 14.3532, lng: 100.5689, risk: "high", score: 91, rain: 124, river: 0.4, elevation: 1.6, affected: 11 },
      { id: "cnx", name: "เชียงใหม่", district: "อำเภอเมืองเชียงใหม่", lat: 18.7883, lng: 98.9853, risk: "medium", score: 61, rain: 76, river: 2.3, elevation: 310, affected: 4 },
      { id: "ubn", name: "อุบลราชธานี", district: "อำเภอวารินชำราบ", lat: 15.2287, lng: 104.8564, risk: "high", score: 86, rain: 117, river: 0.7, elevation: 118, affected: 9 },
      { id: "skt", name: "สุโขทัย", district: "อำเภอเมืองสุโขทัย", lat: 17.0056, lng: 99.8264, risk: "high", score: 83, rain: 108, river: 0.8, elevation: 46, affected: 7 },
      { id: "nan", name: "น่าน", district: "อำเภอเวียงสา", lat: 18.7838, lng: 100.7714, risk: "high", score: 81, rain: 111, river: 1.1, elevation: 198, affected: 5 },
      { id: "ryk", name: "ระยอง", district: "อำเภอเมืองระยอง", lat: 12.6814, lng: 101.2816, risk: "low", score: 28, rain: 35, river: 4.8, elevation: 12, affected: 1 },
      { id: "nrt", name: "นครศรีธรรมราช", district: "อำเภอเมืองนครศรีธรรมราช", lat: 8.4304, lng: 99.9631, risk: "medium", score: 57, rain: 71, river: 2.6, elevation: 9, affected: 3 }
    ],
    reports: [
      { id: "FR-1028", province: "พระนครศรีอยุธยา", district: "อ.พระนครศรีอยุธยา", reporter: "วิภา ส.", level: "มากกว่า 100 ซม.", description: "น้ำเข้าชุมชนริมคลอง รถทุกชนิดไม่สามารถผ่านได้ ผู้สูงอายุรอการช่วยเหลือ", lat: 14.362, lng: 100.565, urgent: true, status: "verified", createdAt: "2026-10-07T23:55:00+07:00", photo: "" },
      { id: "FR-1027", province: "อุบลราชธานี", district: "อ.วารินชำราบ", reporter: "นพดล ค.", level: "50–100 ซม.", description: "น้ำเอ่อล้นถนนหน้าตลาด ระยะทางประมาณ 300 เมตร", lat: 15.192, lng: 104.866, urgent: true, status: "pending", createdAt: "2026-10-07T23:42:00+07:00", photo: "" },
      { id: "FR-1026", province: "เชียงใหม่", district: "อ.เมืองเชียงใหม่", reporter: "อรทัย พ.", level: "30–50 ซม.", description: "น้ำระบายไม่ทันบริเวณถนนมหิดล รถเล็กควรหลีกเลี่ยง", lat: 18.767, lng: 98.999, urgent: false, status: "verified", createdAt: "2026-10-07T22:58:00+07:00", photo: "" },
      { id: "FR-1025", province: "สุโขทัย", district: "อ.เมืองสุโขทัย", reporter: "ศุภชัย น.", level: "50–100 ซม.", description: "แนวพนังกั้นน้ำชำรุด น้ำไหลเข้าพื้นที่เกษตร", lat: 17.018, lng: 99.812, urgent: true, status: "pending", createdAt: "2026-10-07T22:31:00+07:00", photo: "" },
      { id: "FR-1024", province: "กรุงเทพมหานคร", district: "เขตบางเขน", reporter: "กิตติ ร.", level: "10–30 ซม.", description: "น้ำรอการระบายบนถนนพหลโยธิน ช่องทางซ้าย", lat: 13.875, lng: 100.596, urgent: false, status: "resolved", createdAt: "2026-10-07T21:46:00+07:00", photo: "" },
      { id: "FR-1023", province: "น่าน", district: "อ.เวียงสา", reporter: "มาลี จ.", level: "30–50 ซม.", description: "น้ำป่าไหลผ่านสะพานชุมชน โปรดใช้เส้นทางสำรอง", lat: 18.572, lng: 100.751, urgent: false, status: "pending", createdAt: "2026-10-07T20:15:00+07:00", photo: "" },
      { id: "FR-1022", province: "ระยอง", district: "อ.เมืองระยอง", reporter: "อารีย์ ด.", level: "10–30 ซม.", description: "น้ำขังซอยสุขุมวิท 39 ระดับกำลังลดลง", lat: 12.684, lng: 101.255, urgent: false, status: "resolved", createdAt: "2026-10-07T18:34:00+07:00", photo: "" },
      { id: "FR-1021", province: "นครศรีธรรมราช", district: "อ.เมืองนครศรีธรรมราช", reporter: "สมพร ว.", level: "30–50 ซม.", description: "ฝนตกหนักต่อเนื่อง น้ำเริ่มเข้าบ้านชั้นล่าง", lat: 8.421, lng: 99.972, urgent: false, status: "rejected", createdAt: "2026-10-07T17:20:00+07:00", photo: "" }
    ],
    broadcasts: [
      { id: "BA-203", level: "red", province: "พระนครศรีอยุธยา", headline: "เฝ้าระวังน้ำล้นตลิ่ง จ.พระนครศรีอยุธยา", advisory: "ประชาชนในพื้นที่ลุ่มต่ำริมแม่น้ำเจ้าพระยาและแม่น้ำน้อย โปรดยกของขึ้นที่สูง ติดตามประกาศจากทางการ และเตรียมพร้อมอพยพหากระดับน้ำเพิ่มขึ้น", createdAt: "2026-10-07T23:50:00+07:00" },
      { id: "BA-202", level: "warning", province: "เชียงใหม่", headline: "ติดตามระดับน้ำแม่น้ำปิง", advisory: "หลีกเลี่ยงเส้นทางริมแม่น้ำและพื้นที่น้ำรอการระบาย", createdAt: "2026-10-07T21:10:00+07:00" },
      { id: "BA-201", level: "warning", province: "อุบลราชธานี", headline: "ฝนตกหนักในลุ่มน้ำมูล", advisory: "เก็บเอกสารสำคัญและเครื่องใช้ไฟฟ้าไว้ในที่สูง", createdAt: "2026-10-07T18:40:00+07:00" }
    ]
  };

  const deepClone = (value) => JSON.parse(JSON.stringify(value));
  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];
  const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  const levelClass = (level) => level.includes("100") || level.includes("50–100") ? "critical" : level.includes("30–50") ? "moderate" : "resolved";
  const riskLabel = { high: "เสี่ยงสูง", medium: "เสี่ยงปานกลาง", low: "เสี่ยงต่ำ" };
  const statusLabel = { pending: "รอตรวจสอบ", verified: "ยืนยันแล้ว", resolved: "แก้ไขแล้ว", rejected: "ปฏิเสธ" };
  const alertLabel = { warning: "เฝ้าระวัง", red: "เตือนภัยสูง", evacuation: "อพยพ" };

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!parsed || !Array.isArray(parsed.provinces) || !Array.isArray(parsed.reports)) return deepClone(DEFAULT_STATE);
      return { ...deepClone(DEFAULT_STATE), ...parsed, activeRole: "citizen", adminAuthenticated: false };
    } catch (_) {
      return deepClone(DEFAULT_STATE);
    }
  }

  let state = loadState();
  let map;
  let riskLayer;
  let reportLayer;
  let draftMarker;
  let selectedCoordinate = null;
  let selectedPhotoData = "";

  function saveState() {
    try {
      const serializable = { ...state, activeRole: "citizen", adminAuthenticated: false };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
    } catch (_) {
      showToast("พื้นที่จัดเก็บเต็ม", "ระบบบันทึกข้อมูลล่าสุดไม่ได้ กรุณาใช้ภาพที่มีขนาดเล็กลง", "error");
    }
  }

  function refreshIcons() {
    if (window.lucide) window.lucide.createIcons({ attrs: { "stroke-width": 1.8 } });
  }

  function formatThaiTime(dateString, withDate = false) {
    const date = new Date(dateString);
    const options = withDate
      ? { day: "numeric", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" }
      : { hour: "2-digit", minute: "2-digit" };
    return new Intl.DateTimeFormat("th-TH", options).format(date);
  }

  function relativeTime(dateString) {
    const diffMinutes = Math.max(1, Math.round((Date.now() - new Date(dateString).getTime()) / 60000));
    if (diffMinutes < 60) return `${diffMinutes} นาทีที่แล้ว`;
    if (diffMinutes < 1440) return `${Math.round(diffMinutes / 60)} ชม.ที่แล้ว`;
    return `${Math.round(diffMinutes / 1440)} วันที่แล้ว`;
  }

  function showToast(title, message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span><i data-lucide="${type === "success" ? "check" : type === "error" ? "triangle-alert" : "info"}"></i></span><div><b>${escapeHtml(title)}</b><small>${escapeHtml(message)}</small></div><button aria-label="ปิด"><i data-lucide="x"></i></button>`;
    qs("#toastStack").appendChild(toast);
    refreshIcons();
    const remove = () => toast.remove();
    qs("button", toast).addEventListener("click", remove);
    setTimeout(remove, 4800);
  }

  function setupProvinceOptions() {
    const reportSelect = qs("#reportProvince");
    const broadcastSelect = qs("#broadcastProvince");
    reportSelect.innerHTML = state.provinces.map((province) => `<option value="${escapeHtml(province.name)}">${escapeHtml(province.name)}</option>`).join("");
    broadcastSelect.innerHTML = `<option value="ทั่วประเทศ">ทั่วประเทศ</option>` + state.provinces.map((province) => `<option value="${escapeHtml(province.name)}">${escapeHtml(province.name)}</option>`).join("");
  }

  function renderRiskCard(provinceName = state.selectedProvince) {
    const province = state.provinces.find((item) => item.name === provinceName) || state.provinces[0];
    state.selectedProvince = province.name;
    qs("#currentLocationName").textContent = `${province.name} · ${province.district}`;
    qs("#riskScore").textContent = province.score;
    qs("#riskGauge").style.setProperty("--score", province.score);
    qs("#riskBadge").textContent = riskLabel[province.risk];
    qs("#riskBadge").className = `severity ${province.risk}`;
    qs("#rainFactor").textContent = `${province.rain} มม.`;
    qs("#riverFactor").textContent = `${province.river} กม.`;
    qs("#elevationFactor").textContent = `${province.elevation} ม.`;
    const advice = province.risk === "high"
      ? "เตรียมกระเป๋าฉุกเฉิน ย้ายของขึ้นที่สูง และติดตามคำสั่งอพยพอย่างใกล้ชิด"
      : province.risk === "medium"
        ? "ควรติดตามระดับน้ำทุก 3 ชั่วโมง และเตรียมย้ายของขึ้นที่สูง"
        : "สถานการณ์ปกติ แต่ควรติดตามพยากรณ์ฝนและเส้นทางระบายน้ำ";
    qs("#riskAdvice").textContent = advice;
    saveState();
  }

  function incidentItemTemplate(report) {
    return `<article class="incident-item" data-report-id="${report.id}" tabindex="0">
      <span class="incident-thumb">${report.photo ? `<img src="${escapeHtml(report.photo)}" alt="ภาพเหตุการณ์ ${escapeHtml(report.province)}"/>` : `<i data-lucide="waves"></i>`}</span>
      <div class="incident-info"><b>${escapeHtml(report.province)} · ${escapeHtml(report.district)}</b><span>${escapeHtml(relativeTime(report.createdAt))}<i></i>${escapeHtml(statusLabel[report.status])}</span></div>
      <div class="incident-level"><b>${escapeHtml(report.level)}</b><small>${report.urgent ? "ขอความช่วยเหลือ" : "ระดับน้ำ"}</small></div>
    </article>`;
  }

  function renderIncidentFeed(showAll = false) {
    const reports = state.reports.filter((report) => report.status !== "rejected").slice(0, showAll ? 20 : 4);
    qs("#incidentFeed").innerHTML = reports.length ? reports.map(incidentItemTemplate).join("") : `<div class="empty-state"><i data-lucide="inbox"></i><br/>ยังไม่มีรายงานในขณะนี้</div>`;
    qsa(".incident-item").forEach((item) => {
      const activate = () => focusReport(item.dataset.reportId);
      item.addEventListener("click", activate);
      item.addEventListener("keydown", (event) => { if (event.key === "Enter") activate(); });
    });
    refreshIcons();
  }

  function reportPopup(report) {
    return `<div class="popup-card"><small>${escapeHtml(report.id)} · ${escapeHtml(statusLabel[report.status])}</small><b>${escapeHtml(report.province)}</b><p>${escapeHtml(report.description)}</p><div class="popup-meta"><span>${escapeHtml(formatThaiTime(report.createdAt, true))}</span><strong>${escapeHtml(report.level)}</strong></div></div>`;
  }

  function initMap() {
    if (!window.L) {
      qs("#map").innerHTML = `<div class="empty-state">ไม่สามารถโหลดแผนที่ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต</div>`;
      return;
    }
    map = L.map("map", { zoomControl: false, minZoom: 5, maxBounds: [[5, 94], [22, 108]], maxBoundsViscosity: .5 }).setView([13.736717, 100.523186], 6);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);
    riskLayer = L.layerGroup().addTo(map);
    reportLayer = L.layerGroup().addTo(map);
    map.on("click", (event) => {
      selectedCoordinate = { lat: event.latlng.lat, lng: event.latlng.lng };
      placeDraftMarker();
      openReportDrawer();
    });
    drawMapData();
  }

  function riskColor(risk) {
    return risk === "high" ? "#e5483f" : risk === "medium" ? "#f5b82e" : "#2ca87f";
  }

  function markerIcon(report) {
    return L.divIcon({ className: "", html: `<span class="custom-marker ${levelClass(report.level)}"></span>`, iconSize: [34, 34], iconAnchor: [17, 32], popupAnchor: [0, -27] });
  }

  function drawMapData() {
    if (!map) return;
    riskLayer.clearLayers();
    reportLayer.clearLayers();
    state.provinces.forEach((province) => {
      const circle = L.circle([province.lat, province.lng], {
        radius: province.risk === "high" ? 48000 : province.risk === "medium" ? 36000 : 26000,
        color: riskColor(province.risk), fillColor: riskColor(province.risk), fillOpacity: .15, opacity: .55, weight: 2
      }).addTo(riskLayer);
      circle.bindTooltip(`${province.name}: ${riskLabel[province.risk]} ${province.score}%`, { direction: "top" });
      circle.on("click", (event) => {
        L.DomEvent.stopPropagation(event);
        renderRiskCard(province.name);
      });
    });
    state.reports.filter((report) => report.status !== "rejected").forEach((report) => {
      L.marker([report.lat, report.lng], { icon: markerIcon(report), title: `${report.province} ${report.level}` })
        .bindPopup(reportPopup(report)).addTo(reportLayer);
    });
  }

  function focusReport(reportId) {
    const report = state.reports.find((item) => item.id === reportId);
    if (!report || !map) return;
    map.flyTo([report.lat, report.lng], 11, { duration: .8 });
    reportLayer.eachLayer((layer) => {
      const coordinates = layer.getLatLng();
      if (Math.abs(coordinates.lat - report.lat) < .0001 && Math.abs(coordinates.lng - report.lng) < .0001) layer.openPopup();
    });
  }

  function placeDraftMarker() {
    if (!map || !selectedCoordinate) return;
    if (draftMarker) draftMarker.remove();
    draftMarker = L.marker([selectedCoordinate.lat, selectedCoordinate.lng], {
      icon: L.divIcon({ className: "", html: `<span class="custom-marker pending"></span>`, iconSize: [34,34], iconAnchor: [17,32] })
    }).addTo(map);
    qs("#selectedCoords").textContent = `${selectedCoordinate.lat.toFixed(5)}, ${selectedCoordinate.lng.toFixed(5)}`;
    const nearest = findNearestProvince(selectedCoordinate.lat, selectedCoordinate.lng);
    if (nearest) qs("#reportProvince").value = nearest.name;
  }

  function findNearestProvince(lat, lng) {
    return state.provinces.reduce((nearest, province) => {
      const distance = Math.hypot(province.lat - lat, province.lng - lng);
      return !nearest || distance < nearest.distance ? { ...province, distance } : nearest;
    }, null);
  }

  function locateUser(openForm = false) {
    if (!navigator.geolocation) {
      showToast("ไม่รองรับ GPS", "เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่ง", "error");
      return;
    }
    showToast("กำลังค้นหาตำแหน่ง", "กรุณาอนุญาตการเข้าถึงพิกัดบนอุปกรณ์", "info");
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      selectedCoordinate = { lat: coords.latitude, lng: coords.longitude };
      if (map) map.flyTo([coords.latitude, coords.longitude], 12, { duration: 1 });
      placeDraftMarker();
      const nearest = findNearestProvince(coords.latitude, coords.longitude);
      if (nearest) renderRiskCard(nearest.name);
      if (openForm) openReportDrawer();
      showToast("พบตำแหน่งแล้ว", "อัปเดตคะแนนความเสี่ยงจากพื้นที่ใกล้ที่สุด", "success");
    }, () => showToast("เข้าถึงตำแหน่งไม่ได้", "เลือกจุดบนแผนที่หรือค้นหาจังหวัดแทนได้", "error"), { enableHighAccuracy: true, timeout: 8000 });
  }

  function openReportDrawer() {
    if (!selectedCoordinate) {
      const province = state.provinces.find((item) => item.name === state.selectedProvince) || state.provinces[0];
      selectedCoordinate = { lat: province.lat, lng: province.lng };
      placeDraftMarker();
    }
    qs("#reportDrawer").classList.add("open");
    qs("#reportDrawer").setAttribute("aria-hidden", "false");
    qs("#drawerBackdrop").classList.add("show");
    document.body.style.overflow = "hidden";
  }

  function closeReportDrawer() {
    qs("#reportDrawer").classList.remove("open");
    qs("#reportDrawer").setAttribute("aria-hidden", "true");
    qs("#drawerBackdrop").classList.remove("show");
    document.body.style.overflow = "";
  }

  function renderReportTable() {
    const filter = qs("#statusFilter").value;
    const query = qs("#adminSearch").value.trim().toLowerCase();
    const reports = state.reports.filter((report) => (filter === "all" || report.status === filter) && (!query || `${report.id} ${report.province} ${report.district} ${report.reporter}`.toLowerCase().includes(query)));
    qs("#reportTableBody").innerHTML = reports.length ? reports.map((report) => `<tr>
      <td><div class="report-area"><span class="table-avatar">${escapeHtml(report.reporter.slice(0,1))}</span><div><b>${escapeHtml(report.province)} · ${escapeHtml(report.district)}</b><small>${escapeHtml(report.id)} · ${escapeHtml(report.reporter)}</small></div></div></td>
      <td><span class="water-level">${escapeHtml(report.level)}</span>${report.urgent ? `<span class="urgent-label">ด่วน</span>` : ""}</td>
      <td>${escapeHtml(formatThaiTime(report.createdAt))}</td>
      <td><span class="status-pill ${report.status}">${escapeHtml(statusLabel[report.status])}</span></td>
      <td><div class="table-actions">
        <button data-action="verify" data-id="${report.id}" title="ยืนยันรายงาน"><i data-lucide="badge-check"></i></button>
        <button data-action="resolve" data-id="${report.id}" title="ทำเครื่องหมายว่าแก้ไขแล้ว"><i data-lucide="check-check"></i></button>
        <button class="reject" data-action="reject" data-id="${report.id}" title="ปฏิเสธรายงาน"><i data-lucide="x"></i></button>
      </div></td>
    </tr>`).join("") : `<tr><td colspan="5"><div class="empty-state"><i data-lucide="search-x"></i><br/>ไม่พบรายงานที่ตรงกับตัวกรอง</div></td></tr>`;
    qsa("[data-action]", qs("#reportTableBody")).forEach((button) => button.addEventListener("click", () => updateReportStatus(button.dataset.id, button.dataset.action)));
    refreshIcons();
  }

  function updateReportStatus(reportId, action) {
    const report = state.reports.find((item) => item.id === reportId);
    if (!report) return;
    report.status = action === "verify" ? "verified" : action === "resolve" ? "resolved" : "rejected";
    saveState();
    renderAllData();
    showToast("อัปเดตรายงานแล้ว", `${reportId} เปลี่ยนเป็น “${statusLabel[report.status]}”`, "success");
  }

  function renderMetrics() {
    qs("#totalReportsMetric").textContent = state.reports.length;
    qs("#pendingMetric").textContent = state.reports.filter((report) => report.status === "pending").length;
    qs("#criticalMetric").textContent = state.reports.filter((report) => report.urgent && !["resolved", "rejected"].includes(report.status)).length;
    qs("#highRiskMetric").textContent = state.provinces.filter((province) => province.risk === "high").length;
  }

  function renderZoneManagement() {
    qs("#zoneManagement").innerHTML = state.provinces.map((province) => `<div class="zone-item"><div class="zone-name"><i class="zone-color ${province.risk}"></i><div><b>${escapeHtml(province.name)}</b><small>คะแนน ${province.score}% · ${province.affected} รายงาน</small></div></div><select class="risk-select" data-province="${escapeHtml(province.id)}"><option value="high" ${province.risk === "high" ? "selected" : ""}>เสี่ยงสูง</option><option value="medium" ${province.risk === "medium" ? "selected" : ""}>ปานกลาง</option><option value="low" ${province.risk === "low" ? "selected" : ""}>เสี่ยงต่ำ</option></select></div>`).join("");
    qsa(".risk-select").forEach((select) => select.addEventListener("change", () => {
      const province = state.provinces.find((item) => item.id === select.dataset.province);
      if (!province) return;
      province.risk = select.value;
      province.score = select.value === "high" ? Math.max(province.score, 80) : select.value === "medium" ? Math.min(79, Math.max(45, province.score)) : Math.min(province.score, 44);
      saveState();
      renderAllData();
      showToast("ปรับระดับความเสี่ยงแล้ว", `${province.name}: ${riskLabel[province.risk]}`, "success");
    }));
  }

  function renderBroadcasts() {
    const broadcasts = state.broadcasts.slice(0, 4);
    qs("#broadcastHistory").innerHTML = broadcasts.map((broadcast) => `<article class="broadcast-item"><span class="broadcast-symbol"><i data-lucide="${broadcast.level === "evacuation" ? "route" : broadcast.level === "red" ? "triangle-alert" : "cloud-rain-wind"}"></i></span><div class="broadcast-copy"><b>${escapeHtml(broadcast.headline)}</b><p>${escapeHtml(broadcast.advisory)}</p><small>${escapeHtml(broadcast.province)} · ${escapeHtml(formatThaiTime(broadcast.createdAt, true))}</small></div></article>`).join("");
    const latest = state.broadcasts[0];
    if (latest) {
      qs("#ribbonTitle").textContent = latest.headline;
      qs("#emergencyRibbon").style.background = latest.level === "evacuation" ? "#992c2c" : latest.level === "red" ? "#c54131" : "#a26e14";
    }
    renderNotifications();
    refreshIcons();
  }

  function renderNotifications() {
    const notifications = state.broadcasts.slice(0, 3);
    qs("#notificationList").innerHTML = notifications.map((item) => `<div class="notification-item"><span><i data-lucide="${item.level === "evacuation" ? "route" : "bell-ring"}"></i></span><div><b>${escapeHtml(item.headline)}</b><small>${escapeHtml(item.province)} · ${escapeHtml(relativeTime(item.createdAt))}</small></div></div>`).join("");
    qs("#notificationCount").textContent = state.notificationsRead ? "0" : String(Math.min(9, notifications.length));
    qs("#notificationCount").style.display = state.notificationsRead ? "none" : "block";
    refreshIcons();
  }

  function renderAllData() {
    renderRiskCard();
    renderIncidentFeed();
    renderReportTable();
    renderMetrics();
    renderZoneManagement();
    renderBroadcasts();
    drawMapData();
  }

  function showRole(role) {
    if (role === "authority" && !state.adminAuthenticated) {
      openModal("loginModal");
      return;
    }
    state.activeRole = role;
    qsa(".app-view").forEach((view) => view.classList.toggle("active", view.id === `${role}View`));
    qsa(".role-option").forEach((button) => button.classList.toggle("active", button.dataset.role === role));
    qs("#userName").textContent = role === "authority" ? "ศูนย์บัญชาการกลาง" : "ผู้ใช้งานทั่วไป";
    qs("#userStatus").textContent = role === "authority" ? "เจ้าหน้าที่ผู้ดูแลระบบ" : "โหมดประชาชน";
    qs("#userAvatar").textContent = role === "authority" ? "ศ" : "ป";
    if (role === "citizen" && map) setTimeout(() => map.invalidateSize(), 50);
    closePopovers();
  }

  function openModal(id) {
    qsa(".modal").forEach((modal) => modal.classList.remove("open"));
    qs(`#${id}`).classList.add("open");
    qs("#modalBackdrop").classList.add("show");
    document.body.style.overflow = "hidden";
  }

  function closeModals() {
    qsa(".modal").forEach((modal) => modal.classList.remove("open"));
    qs("#modalBackdrop").classList.remove("show");
    document.body.style.overflow = "";
  }

  function closePopovers() {
    qs("#notificationPopover").classList.remove("open");
    qs("#profilePopover").classList.remove("open");
  }

  function showLatestAlert() {
    const alert = state.broadcasts[0];
    if (!alert) return;
    qs("#alertDetailTitle").textContent = alert.headline;
    qs("#alertDetailArea").innerHTML = `<i data-lucide="map-pin"></i> ${escapeHtml(alert.province)} · ${escapeHtml(alertLabel[alert.level])}`;
    qs("#alertDetailText").textContent = alert.advisory;
    openModal("alertDetailModal");
    refreshIcons();
  }

  function submitIncident(event) {
    event.preventDefault();
    if (!selectedCoordinate) return showToast("ยังไม่มีพิกัด", "กรุณาเลือกจุดบนแผนที่หรือใช้ GPS", "error");
    const provinceName = qs("#reportProvince").value;
    const province = state.provinces.find((item) => item.name === provinceName);
    const report = {
      id: `FR-${1030 + state.reports.length}`,
      province: provinceName,
      district: province ? province.district : "พิกัดที่เลือก",
      reporter: "ผู้ใช้งานทั่วไป",
      level: qs('input[name="waterLevel"]:checked').value,
      description: qs("#reportDescription").value.trim(),
      lat: selectedCoordinate.lat,
      lng: selectedCoordinate.lng,
      urgent: qs("#urgentHelp").checked,
      status: "pending",
      createdAt: new Date().toISOString(),
      photo: selectedPhotoData || qs("#photoUrl").value.trim()
    };
    state.reports.unshift(report);
    if (province) province.affected += 1;
    saveState();
    renderAllData();
    closeReportDrawer();
    qs("#incidentForm").reset();
    selectedPhotoData = "";
    qs("#uploadText").textContent = "เลือกภาพจากเครื่อง";
    showToast("ส่งรายงานสำเร็จ", `${report.id} ถูกส่งให้ศูนย์ตรวจสอบแล้ว`, "success");
    focusReport(report.id);
  }

  function submitBroadcast(event) {
    event.preventDefault();
    const broadcast = {
      id: `BA-${204 + state.broadcasts.length}`,
      level: qs('input[name="alertLevel"]:checked').value,
      province: qs("#broadcastProvince").value,
      headline: qs("#broadcastHeadline").value.trim(),
      advisory: qs("#broadcastAdvisory").value.trim(),
      createdAt: new Date().toISOString()
    };
    state.broadcasts.unshift(broadcast);
    state.notificationsRead = false;
    saveState();
    renderBroadcasts();
    closeModals();
    qs("#broadcastForm").reset();
    showToast("เผยแพร่ประกาศแล้ว", `ส่งถึงพื้นที่ ${broadcast.province} เรียบร้อย`, "success");
  }

  function findProvinceFromSearch() {
    const query = qs("#mapSearch").value.trim().toLowerCase();
    if (!query) return;
    const province = state.provinces.find((item) => item.name.toLowerCase().includes(query) || item.district.toLowerCase().includes(query));
    if (!province) return showToast("ไม่พบพื้นที่", "ลองค้นหา กรุงเทพฯ, อยุธยา, เชียงใหม่ หรืออุบลราชธานี", "error");
    map?.flyTo([province.lat, province.lng], 9, { duration: .8 });
    renderRiskCard(province.name);
    showToast("อัปเดตพื้นที่แล้ว", `กำลังแสดงข้อมูลของ ${province.name}`, "success");
  }

  function wireEvents() {
    qsa(".role-option").forEach((button) => button.addEventListener("click", () => showRole(button.dataset.role)));
    qs("#reportFab").addEventListener("click", openReportDrawer);
    qs("#drawerBackdrop").addEventListener("click", closeReportDrawer);
    qsa("[data-close-drawer]").forEach((button) => button.addEventListener("click", closeReportDrawer));
    qs("#incidentForm").addEventListener("submit", submitIncident);
    qs("#broadcastForm").addEventListener("submit", submitBroadcast);
    qs("#useGpsInForm").addEventListener("click", () => locateUser(true));
    qs("#locateButton").addEventListener("click", () => locateUser(false));
    qs("#mapLocateButton").addEventListener("click", () => locateUser(false));
    qs("#showAllReports").addEventListener("click", () => renderIncidentFeed(true));
    qs("#mapSearch").addEventListener("keydown", (event) => { if (event.key === "Enter") findProvinceFromSearch(); });
    document.addEventListener("keydown", (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); qs("#mapSearch").focus(); }
      if (event.key === "Escape") { closeModals(); closeReportDrawer(); closePopovers(); }
    });

    qs("#photoUpload").addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (!file) return;
      if (file.size > 1800000) { event.target.value = ""; return showToast("ไฟล์มีขนาดใหญ่เกินไป", "กรุณาเลือกภาพไม่เกิน 1.8 MB", "error"); }
      const reader = new FileReader();
      reader.onload = () => { selectedPhotoData = reader.result; qs("#uploadText").textContent = file.name; };
      reader.readAsDataURL(file);
    });

    qs("#loginForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const valid = qs("#loginEmail").value.trim().toLowerCase() === "admin@flood.go.th" && qs("#loginPassword").value === "admin123";
      if (!valid) { qs("#loginError").textContent = "อีเมลหรือรหัสผ่านไม่ถูกต้อง"; return; }
      state.adminAuthenticated = true;
      qs("#loginError").textContent = "";
      closeModals();
      showRole("authority");
      showToast("เข้าสู่ระบบสำเร็จ", "ยินดีต้อนรับสู่ศูนย์บัญชาการ", "success");
    });
    qs("#togglePassword").addEventListener("click", () => {
      const input = qs("#loginPassword");
      input.type = input.type === "password" ? "text" : "password";
    });
    qsa("[data-close-modal]").forEach((button) => button.addEventListener("click", closeModals));
    qs("#modalBackdrop").addEventListener("click", closeModals);
    qs("#openBroadcast").addEventListener("click", () => openModal("broadcastModal"));
    qs("#viewAlertButton").addEventListener("click", showLatestAlert);
    qs("#dismissRibbon").addEventListener("click", () => qs("#emergencyRibbon").style.display = "none");
    qs("#statusFilter").addEventListener("change", renderReportTable);
    qs("#adminSearch").addEventListener("input", renderReportTable);
    qs("#refreshDashboard").addEventListener("click", () => {
      qs("#lastUpdated").textContent = new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short" }).format(new Date());
      renderAllData();
      showToast("ข้อมูลเป็นปัจจุบัน", "ซิงก์ข้อมูลจำลองจากทุกพื้นที่แล้ว", "success");
    });
    qs("#resetZones").addEventListener("click", () => {
      const defaults = deepClone(DEFAULT_STATE.provinces);
      state.provinces = state.provinces.map((province) => ({ ...province, ...defaults.find((item) => item.id === province.id) }));
      saveState(); renderAllData(); showToast("คืนค่าพื้นที่แล้ว", "ระดับความเสี่ยงกลับเป็นค่าตัวอย่างเริ่มต้น", "success");
    });

    qs("#notificationButton").addEventListener("click", (event) => {
      event.stopPropagation(); qs("#profilePopover").classList.remove("open"); qs("#notificationPopover").classList.toggle("open");
    });
    qs("#profileButton").addEventListener("click", (event) => {
      event.stopPropagation(); qs("#notificationPopover").classList.remove("open"); qs("#profilePopover").classList.toggle("open");
    });
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".notification-popover") && !event.target.closest("#notificationButton")) qs("#notificationPopover").classList.remove("open");
      if (!event.target.closest(".profile-popover") && !event.target.closest("#profileButton")) qs("#profilePopover").classList.remove("open");
    });
    qs("#markRead").addEventListener("click", () => { state.notificationsRead = true; saveState(); renderNotifications(); });
    qs("#guestLogin").addEventListener("click", () => { showRole("citizen"); showToast("พร้อมใช้งาน", "ข้อมูลส่วนตัวจะบันทึกไว้บนอุปกรณ์นี้", "success"); });
    qs("#adminLoginShortcut").addEventListener("click", () => { closePopovers(); state.adminAuthenticated ? showRole("authority") : openModal("loginModal"); });
    qs("#resetDemo").addEventListener("click", () => {
      if (!window.confirm("คืนค่าข้อมูลสาธิตทั้งหมดบนอุปกรณ์นี้หรือไม่?")) return;
      localStorage.removeItem(STORAGE_KEY); state = deepClone(DEFAULT_STATE); setupProvinceOptions(); renderAllData(); showRole("citizen"); showToast("คืนค่าข้อมูลแล้ว", "ระบบกลับสู่ข้อมูลตัวอย่างเริ่มต้น", "success");
    });
  }

  function boot() {
    refreshIcons();
    setupProvinceOptions();
    initMap();
    renderAllData();
    wireEvents();
    showRole("citizen");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
