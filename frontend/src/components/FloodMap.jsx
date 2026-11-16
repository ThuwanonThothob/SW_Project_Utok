import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { CloudRain, Crosshair, MapPin, Plus, Satellite, Search, ShieldAlert, Siren, Tent, X } from "lucide-react";

const riskColor = (risk) => (risk === "high" ? "#ef4444" : risk === "medium" ? "#f59e0b" : "#10b981");
const riskBorder = (risk) => (risk === "high" ? "#dc2626" : risk === "medium" ? "#d97706" : "#059669");

const statusLabelMap = {
  pending: "รอตรวจสอบ",
  verified: "ยืนยันแล้ว / ส่งทีมกู้ภัย",
  resolved: "คลี่คลายแล้ว",
  rejected: "ปฏิเสธ",
};

function calcDistanceKm(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const rainColor = (mm) => {
  const rain = Number(mm || 0);
  if (rain >= 50) return "#9333ea"; // ฝนหนักมาก >50 มม. (ม่วง)
  if (rain >= 25) return "#2563eb"; // ฝนหนัก 25–50 มม. (น้ำเงิน)
  if (rain >= 10) return "#06b6d4"; // ฝนปานกลาง 10–25 มม. (ฟ้าเข้ม)
  if (rain > 0) return "#38bdf8";  // ฝนเล็กน้อย 0–10 มม. (ฟ้าอ่อน)
  return "#94a3b8";                 // ไม่มีฝน 0 มม. (เทา)
};

const rainBorder = (mm) => {
  const rain = Number(mm || 0);
  if (rain >= 50) return "#7e22ce";
  if (rain >= 25) return "#1d4ed8";
  if (rain >= 10) return "#0891b2";
  if (rain > 0) return "#0284c7";
  return "#64748b";
};

const markerClass = (level) =>
  level.includes("100") || level.includes("50–100") ? "critical" : level.includes("30–50") ? "moderate" : "resolved";

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
}

export default function FloodMap({
  provinces,
  reports,
  selectedProvince,
  userLocation,
  focusedReport = null,
  onSelectProvince,
  onReportAt,
  onLocate,
  isAuthority = false,
}) {
  const nodeRef = useRef(null);
  const mapRef = useRef(null);
  const baseTileLayerRef = useRef(null);
  const provinceLayerRef = useRef(null);
  const radarLayerRef = useRef(null);
  const reportLayerRef = useRef(null);
  const shelterLayerRef = useRef(null);
  const userLocationLayerRef = useRef(null);
  const reportMarkersByIdRef = useRef({});
  const hasCenteredOnUserRef = useRef(false);
  const reportHandlerRef = useRef(onReportAt);
  const searchContainerRef = useRef(null);

  const [mapMode, setMapMode] = useState("risk"); // "risk" | "rain"
  const [isSatellite, setIsSatellite] = useState(false);
  const [showShelters, setShowShelters] = useState(false);
  const [filterCriticalOnly, setFilterCriticalOnly] = useState(false);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    reportHandlerRef.current = onReportAt;
  }, [onReportAt]);

  // Load Thailand 77 Provinces GeoJSON on mount
  useEffect(() => {
    let active = true;
    fetch("/thailand-provinces.geojson")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.features) setGeoJsonData(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    if (mapRef.current || !nodeRef.current) return undefined;
    const map = L.map(nodeRef.current, {
      zoomControl: false,
      preferCanvas: true,
      minZoom: 5,
      maxBounds: [
        [5, 94],
        [22, 108],
      ],
    }).setView([13.736717, 100.523186], 6);

    L.control.zoom({ position: "bottomright" }).addTo(map);
    baseTileLayerRef.current = L.layerGroup().addTo(map);
    provinceLayerRef.current = L.layerGroup().addTo(map);
    radarLayerRef.current = L.layerGroup().addTo(map);
    reportLayerRef.current = L.layerGroup().addTo(map);
    shelterLayerRef.current = L.layerGroup().addTo(map);
    userLocationLayerRef.current = L.layerGroup().addTo(map);

    map.on("click", ({ latlng }) => {
      if (!isAuthority && reportHandlerRef.current) {
        reportHandlerRef.current({ lat: latlng.lat, lng: latlng.lng });
      }
    });
    mapRef.current = map;

    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    });
    if (nodeRef.current) {
      resizeObserver.observe(nodeRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Switch between Standard OSM and Satellite Hybrid base tiles
  useEffect(() => {
    const baseGroup = baseTileLayerRef.current;
    if (!baseGroup || !mapRef.current) return;
    baseGroup.clearLayers();

    if (isSatellite) {
      const satImagery = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 19,
          zIndex: 1,
          attribution:
            "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics | UTOK อุทก (มศว)",
        },
      );
      const hybridLabels = L.tileLayer(
        "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 19,
          zIndex: 2,
          opacity: 0.88,
        },
      );
      baseGroup.addLayer(satImagery);
      baseGroup.addLayer(hybridLabels);
    } else {
      const osmTile = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        zIndex: 1,
        attribution: "&copy; OpenStreetMap contributors | UTOK อุทก (มศว)",
      });
      baseGroup.addLayer(osmTile);
    }
  }, [isSatellite]);

  // Fetch and manage live RainViewer radar overlay when mapMode is "rain"
  useEffect(() => {
    const radarGroup = radarLayerRef.current;
    if (!radarGroup || !mapRef.current) return;
    radarGroup.clearLayers();

    if (mapMode !== "rain") return;

    let active = true;
    fetch("https://api.rainviewer.com/public/weather-maps.json")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data?.radar?.past?.length) return;
        const latest = data.radar.past[data.radar.past.length - 1];
        const tileUrl = `${data.host}${latest.path}/256/{z}/{x}/{y}/2/1_1.png`;
        const radarTile = L.tileLayer(tileUrl, {
          opacity: 0.55,
          zIndex: 350,
          maxNativeZoom: 12,
          maxZoom: 18,
        });
        radarTile.on("tileerror", (e) => {
          if (e.tile) e.tile.style.display = "none";
        });
        radarGroup.addLayer(radarTile);
      })
      .catch(() => {});

    return () => {
      active = false;
      radarGroup.clearLayers();
    };
  }, [mapMode]);

  // Province Boundaries Rendering (GeoJSON without circle overlaps!)
  useEffect(() => {
    const layer = provinceLayerRef.current;
    if (!layer || !mapRef.current) return;
    layer.clearLayers();

    const provinceMap = new Map();
    provinces.forEach((p) => {
      provinceMap.set(p.name, p);
      if (p.id) provinceMap.set(p.id, p);
    });

    if (geoJsonData && geoJsonData.features) {
      // Render clean GeoJSON province boundaries (No overlapping circles!)
      const geoLayer = L.geoJSON(geoJsonData, {
        style: (feature) => {
          const p = provinceMap.get(feature.properties.thaiName) || provinceMap.get(feature.properties.id);
          const isSelected = selectedProvince && (selectedProvince.name === feature.properties.thaiName || selectedProvince.id === feature.properties.id);

          if (mapMode === "rain") {
            const rainMm = p?.rain ?? 0;
            return {
              fillColor: rainColor(rainMm),
              fillOpacity: isSatellite ? (isSelected ? 0.45 : 0.22) : isSelected ? 0.65 : 0.42,
              color: isSelected ? "#ffffff" : rainBorder(rainMm),
              weight: isSelected ? (isSatellite ? 2.8 : 2.5) : isSatellite ? 1.5 : 1.2,
              dashArray: isSelected ? "4 3" : "",
            };
          }

          // Risk mode
          const risk = p?.risk || "low";
          return {
            fillColor: riskColor(risk),
            fillOpacity: isSatellite ? (isSelected ? 0.45 : 0.22) : isSelected ? 0.65 : 0.38,
            color: isSelected ? "#ffffff" : riskBorder(risk),
            weight: isSelected ? (isSatellite ? 2.8 : 2.5) : isSatellite ? 1.5 : 1.2,
            dashArray: isSelected ? "4 3" : "",
          };
        },
        onEachFeature: (feature, polygonLayer) => {
          const p = provinceMap.get(feature.properties.thaiName) || provinceMap.get(feature.properties.id);
          const provinceName = escapeHtml(p?.name || feature.properties.thaiName);
          const districtName = escapeHtml(p?.district || feature.properties.district);
          const rainText = p?.rain !== null && p?.rain !== undefined ? `${p.rain} มม.` : "กำลังซิงค์";
          const scoreText = p?.score ?? 0;
          const affectedCount = p?.affected ?? 0;

          const tooltipHtml =
            mapMode === "rain"
              ? `<div class="map-polygon-tooltip">
                   <b>${provinceName}</b> <small>(${districtName})</small>
                   <div>🌧️ ฝนตรวจวัดสด (Real-time): <strong>${rainText}</strong></div>
                   <div>📈 โอกาสฝนตกรายวัน (Forecast): <strong>${p?.rainProbability ?? 0}%</strong></div>
                   <div>🚨 ความเสี่ยงน้ำท่วมฉับพลัน: <strong class="risk-${p?.risk || "low"}">${scoreText}%</strong></div>
                 </div>`
              : `<div class="map-polygon-tooltip">
                   <b>${provinceName}</b> <small>(${districtName})</small>
                   <div>🚨 ความเสี่ยงน้ำท่วมฉับพลัน: <strong class="risk-${p?.risk || "low"}">${scoreText}% (${p?.risk === "high" ? "เสี่ยงสูง" : p?.risk === "medium" ? "ปานกลาง" : "เสี่ยงต่ำ"})</strong></div>
                   <div>🌧️ ฝนตรวจวัดสด: <strong>${rainText}</strong> · โอกาสฝน: <strong>${p?.rainProbability ?? 0}%</strong></div>
                   <div>📋 รายงานในพื้นที่: <strong>${affectedCount} เคส</strong></div>
                 </div>`;

          polygonLayer.bindTooltip(tooltipHtml, { sticky: true, opacity: 0.95 });

          polygonLayer.on({
            mouseover: (e) => {
              const target = e.target;
              target.setStyle({
                fillOpacity: isSatellite ? 0.5 : 0.72,
                weight: 2.5,
                color: "#ffffff",
              });
              if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                target.bringToFront();
              }
            },
            mouseout: (e) => {
              geoLayer.resetStyle(e.target);
            },
            click: (e) => {
              L.DomEvent.stopPropagation(e);
              if (p) selectFromUserSwitch(p);
            },
          });
        },
      });

      layer.addLayer(geoLayer);
    } else {
      // Graceful fallback to small clean center dots if GeoJSON not yet loaded
      provinces.forEach((province) => {
        const marker = L.circleMarker([province.lat, province.lng], {
          radius: mapMode === "rain" ? 8 : 9,
          color: mapMode === "rain" ? rainBorder(province.rain) : riskBorder(province.risk),
          fillColor: mapMode === "rain" ? rainColor(province.rain) : riskColor(province.risk),
          fillOpacity: 0.65,
          weight: 2,
        }).addTo(layer);

        marker.bindTooltip(`<b>${escapeHtml(province.name)}</b> (${escapeHtml(province.district)})`);
        marker.on("click", (event) => {
          L.DomEvent.stopPropagation(event);
          selectFromUserSwitch(province);
        });
      });
    }
  }, [geoJsonData, provinces, selectedProvince, mapMode, isSatellite]);

  // Citizen Incident Reports Layer
  useEffect(() => {
    const layer = reportLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    reportMarkersByIdRef.current = {};
    reports
      .filter((report) => {
        if (report.status === "rejected") return false;
        if (!filterCriticalOnly) return true;
        return (
          report.aiTriage?.priority === "critical" ||
          report.urgent ||
          markerClass(report.level) === "critical"
        );
      })
      .forEach((report) => {
        const isCriticalP1 = report.aiTriage?.priority === "critical" || report.urgent;
        const icon = L.divIcon({
          className: "",
          html: `<span class="custom-marker ${markerClass(report.level)} ${isCriticalP1 ? "p1-pulse" : ""}"></span>`,
          iconSize: [34, 34],
          iconAnchor: [17, 32],
        });
        const upvotesCount = Number(report.upvotes || 0);
        const triageText = report.aiTriage?.label
          ? `${escapeHtml(report.aiTriage.label)} (${report.aiTriage.score ?? 0}%)`
          : isCriticalP1
            ? "P1 วิกฤตเร่งด่วน"
            : "เฝ้าระวัง";
        const statusText = statusLabelMap[report.status] || "รอตรวจสอบ";
        const noteHtml = report.authorityNote
          ? `<div class="popup-note">🛡️ เจ้าหน้าที่: ${escapeHtml(report.authorityNote)}</div>`
          : "";
        const marker = L.marker([report.lat, report.lng], {
          icon,
          title: `${report.province} ${report.level}`,
          zIndexOffset: isCriticalP1 ? 500 : 100,
        })
          .bindPopup(
            `<div class="popup"><small>${escapeHtml(report.id)} · 👍 ร่วมยืนยัน ${upvotesCount} คน</small><b>${escapeHtml(report.province)} · ${escapeHtml(report.district)}</b><div class="popup-badges"><span class="popup-triage ${escapeHtml(report.aiTriage?.priority || (isCriticalP1 ? "critical" : "moderate"))}">${triageText}</span><span class="popup-status ${escapeHtml(report.status || "pending")}">${escapeHtml(statusText)}</span></div><p>${escapeHtml(report.description)}</p><strong>ระดับน้ำ: ${escapeHtml(report.level)}</strong>${noteHtml}</div>`,
          )
          .addTo(layer);
        reportMarkersByIdRef.current[report.id] = marker;
      });
  }, [reports, filterCriticalOnly]);

  // Fly to focused incident report & open its popup
  useEffect(() => {
    if (!focusedReport?.lat || !focusedReport?.lng || !mapRef.current) return;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    mapRef.current.flyTo([Number(focusedReport.lat), Number(focusedReport.lng)], 13, {
      duration: reducedMotion ? 0 : 0.85,
    });
    const marker = reportMarkersByIdRef.current[focusedReport.id];
    if (marker) {
      setTimeout(() => {
        marker.openPopup();
      }, reducedMotion ? 0 : 350);
    }
  }, [focusedReport]);

  // Safe Evacuation Shelters & High-Ground Coordination Centers Layer
  useEffect(() => {
    const layer = shelterLayerRef.current;
    if (!layer || !mapRef.current) return;
    layer.clearLayers();
    if (!showShelters) return;

    const targetProvinces = [];
    if (selectedProvince?.lat && selectedProvince?.lng) {
      targetProvinces.push(selectedProvince);
    }
    if (
      userLocation?.provinceName &&
      selectedProvince?.name !== userLocation.provinceName
    ) {
      const userProv = provinces.find((p) => p.name === userLocation.provinceName);
      if (userProv) targetProvinces.push(userProv);
    }
    if (!targetProvinces.length && provinces[0]) {
      targetProvinces.push(provinces[0]);
    }

    const originLat = Number(userLocation?.lat || selectedProvince?.lat || provinces[0]?.lat || 13.736717);
    const originLng = Number(userLocation?.lng || selectedProvince?.lng || provinces[0]?.lng || 100.523186);

    const allShelters = [];
    targetProvinces.forEach((prov) => {
      const candidates = [
        {
          name: `ศูนย์ประสานงานช่วยเหลือ / ศาลากลาง จ.${prov.name}`,
          type: "ศูนย์บัญชาการและพักพิงชั่วคราวประจำจังหวัด",
          lat: Number(prov.lat) + 0.008,
          lng: Number(prov.lng) + 0.006,
        },
        {
          name: `จุดอพยพพื้นที่สูงปลอดภัย (${prov.district || prov.name})`,
          type: "จุดรวมพลพื้นที่สูง & ประสานงาน ปภ. เขต",
          lat: Number(prov.lat) + 0.022,
          lng: Number(prov.lng) - 0.015,
        },
      ];
      candidates.forEach((shelter) => {
        allShelters.push({
          ...shelter,
          distKm: calcDistanceKm(originLat, originLng, shelter.lat, shelter.lng),
        });
      });
    });

    allShelters.sort((a, b) => a.distKm - b.distKm);
    const nearestShelter = allShelters[0];
    let routeLine = null;
    if (nearestShelter) {
      routeLine = L.polyline(
        [
          [originLat, originLng],
          [nearestShelter.lat, nearestShelter.lng],
        ],
        {
          color: "#059669",
          weight: 3,
          dashArray: "6 6",
          opacity: 0.85,
        },
      ).addTo(layer);
    }

    allShelters.forEach((shelter, idx) => {
      const icon = L.divIcon({
        className: "",
        html: `<span class="shelter-marker-pin ${idx === 0 ? "nearest" : ""}" title="${escapeHtml(shelter.name)}">⛺</span>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });
      const distLabel = `📏 ระยะห่าง: ประมาณ ${shelter.distKm.toFixed(1)} กม.`;
      const marker = L.marker([shelter.lat, shelter.lng], { icon, zIndexOffset: 650 })
        .bindTooltip(
          `<b>${escapeHtml(shelter.name)}</b><br/>${distLabel}${idx === 0 ? " (ใกล้ที่สุด)" : ""}`,
          { direction: "top", offset: [0, -12] },
        )
        .bindPopup(
          `<div class="popup"><small>⛺ จุดพักพิง / พื้นที่ปลอดภัย (DDPM Reference)${idx === 0 ? " · ใกล้จุดอ้างอิงที่สุด" : ""}</small><b>${escapeHtml(shelter.name)}</b><p>${escapeHtml(shelter.type)} · แจ้งขอรถอพยพโทรสายด่วน ปภ. <a href="tel:1784"><b>1784</b></a></p><strong>${distLabel}</strong><div style="margin-top:6px"><a href="https://www.google.com/maps/dir/?api=1&destination=${shelter.lat.toFixed(5)},${shelter.lng.toFixed(5)}" target="_blank" rel="noreferrer"><b>📍 นำทางด้วย Google Maps</b></a></div></div>`,
        )
        .addTo(layer);

      marker.on("click", () => {
        if (routeLine) {
          routeLine.setLatLngs([
            [originLat, originLng],
            [shelter.lat, shelter.lng],
          ]);
        }
      });
    });
  }, [showShelters, selectedProvince, userLocation?.lat, userLocation?.lng, userLocation?.provinceName, provinces]);

  // Real-time GPS Location Marker
  useEffect(() => {
    const layer = userLocationLayerRef.current;
    if (!layer || !mapRef.current) return;
    layer.clearLayers();
    if (!userLocation?.lat || !userLocation?.lng) return;

    const accuracyRadius = Math.max(userLocation.accuracy || 50, 90);
    L.circle([userLocation.lat, userLocation.lng], {
      radius: accuracyRadius,
      color: "#0284c7",
      fillColor: "#38bdf8",
      fillOpacity: 0.18,
      weight: 2,
    }).addTo(layer);

    const gpsIcon = L.divIcon({
      className: "",
      html: `<span class="user-gps-marker" title="ตำแหน่งปัจจุบันของคุณ"></span>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const addressText = userLocation.address ? escapeHtml(userLocation.address) : `${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)}`;
    const districtText = userLocation.districtName ? ` · ${escapeHtml(userLocation.districtName)}` : "";
    const weatherText =
      userLocation.temperature !== null && userLocation.temperature !== undefined
        ? `อุณหภูมิ ${userLocation.temperature}°C · ฝน ${userLocation.rainMm ?? 0} มม.`
        : "กำลังอัปเดตข้อมูลสภาพอากาศ";

    const marker = L.marker([userLocation.lat, userLocation.lng], {
      icon: gpsIcon,
      zIndexOffset: 1000,
    })
      .bindPopup(
        `<div class="popup"><small>📍 ตำแหน่งปัจจุบันของคุณ (Real-time GPS)</small><b>${addressText}${districtText}</b><p>${weatherText}</p><strong>พิกัด ${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)} (±${userLocation.accuracy || 20} ม.)</strong></div>`,
      )
      .addTo(layer);

    if (!hasCenteredOnUserRef.current) {
      hasCenteredOnUserRef.current = true;
      const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      mapRef.current.flyTo([userLocation.lat, userLocation.lng], 11, { duration: reducedMotion ? 0 : 0.7 });
      marker.openPopup();
    }
  }, [userLocation]);

  useEffect(() => {
    if (selectedProvince && mapRef.current && !hasCenteredOnUserRef.current) {
      const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      mapRef.current.flyTo([selectedProvince.lat, selectedProvince.lng], 9, { duration: reducedMotion ? 0 : 0.45 });
    }
  }, [selectedProvince]);

  function selectFromUserSwitch(province) {
    if (!province || !mapRef.current) return;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    mapRef.current.flyTo([province.lat, province.lng], 10, { duration: reducedMotion ? 0 : 0.45 });
    onSelectProvince(province);
    setSearchQuery(`${province.name} (${province.district})`);
    setShowSuggestions(false);
  }

  // Filtered search suggestions covering Province and District
  const searchSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || q.length < 1) return [];
    return provinces
      .filter((p) => p.name.toLowerCase().includes(q) || (p.district && p.district.toLowerCase().includes(q)))
      .slice(0, 6);
  }, [searchQuery, provinces]);

  function handleSearchSubmit(event) {
    event.preventDefault();
    if (searchSuggestions.length > 0) {
      selectFromUserSwitch(searchSuggestions[0]);
    }
  }

  const defaultReportCoords = userLocation?.lat
    ? { lat: userLocation.lat, lng: userLocation.lng }
    : selectedProvince
      ? { lat: selectedProvince.lat, lng: selectedProvince.lng }
      : { lat: 13.736717, lng: 100.523186 };

  return (
    <section className="map-stage">
      <div ref={nodeRef} className="map-node" aria-label="แผนที่ความเสี่ยงน้ำท่วมและเรดาร์ฝนประเทศไทย" />

      {/* Map Mode Switcher (Flood Risk vs Rain Mode) */}
      <div className="map-mode-bar" role="group" aria-label="โหมดแสดงผลแผนที่">
        <button
          type="button"
          className={`map-mode-btn ${mapMode === "risk" ? "active" : ""}`}
          onClick={() => setMapMode("risk")}
        >
          <ShieldAlert /> <span>ความเสี่ยงน้ำท่วม</span>
        </button>
        <button
          type="button"
          className={`map-mode-btn ${mapMode === "rain" ? "active" : ""}`}
          onClick={() => setMapMode("rain")}
        >
          <CloudRain /> <span>เรดาร์ & ปริมาณฝน</span>
        </button>
        <button
          type="button"
          className={`map-mode-btn ${showShelters ? "shelter-active" : ""}`}
          onClick={() => setShowShelters((prev) => !prev)}
          aria-pressed={showShelters}
          title="แสดง/ซ่อนจุดประสานงานพักพิงและพื้นที่สูงปลอดภัย"
        >
          <Tent /> <span>จุดพักพิง</span>
        </button>
        <button
          type="button"
          className={`map-mode-btn ${filterCriticalOnly ? "critical-active" : ""}`}
          onClick={() => setFilterCriticalOnly((prev) => !prev)}
          aria-pressed={filterCriticalOnly}
          title="กรองแสดงเฉพาะหมุดเหตุการณ์วิกฤตเร่งด่วน (P1 Critical)"
        >
          <Siren /> <span>เฉพาะเคส P1</span>
        </button>
        <button
          type="button"
          className={`map-mode-btn ${isSatellite ? "satellite-active" : ""}`}
          onClick={() => setIsSatellite((prev) => !prev)}
          aria-pressed={isSatellite}
          title="สลับแผนที่ภาพถ่ายดาวเทียมความละเอียดสูง (Satellite Hybrid Layer)"
        >
          <Satellite /> <span>ดาวเทียม</span>
        </button>
      </div>

      {/* Location Search Bar with District Support */}
      <div
        ref={searchContainerRef}
        className={`map-search-container ${showSuggestions && searchSuggestions.length > 0 ? "has-suggestions" : ""}`}
      >
        <form className="map-search" onSubmit={handleSearchSubmit}>
          <Search />
          <input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="ค้นหาตามจังหวัด หรือ อำเภอ (เช่น วารินชำราบ, ดุสิต)"
            aria-label="ค้นหาจังหวัดหรืออำเภอ"
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => {
                setSearchQuery("");
                setShowSuggestions(false);
              }}
              aria-label="ล้างการค้นหา"
              title="ล้างการค้นหา"
            >
              <X />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              hasCenteredOnUserRef.current = false;
              onLocate();
            }}
            aria-label="ตำแหน่ง GPS ปัจจุบันของฉัน"
            title="ไปที่ตำแหน่ง GPS ปัจจุบันของฉัน"
          >
            <Crosshair />
          </button>
        </form>

        {showSuggestions && searchSuggestions.length > 0 && (
          <div className="map-search-suggestions">
            {searchSuggestions.map((item) => (
              <button
                key={item.id}
                type="button"
                className="suggestion-item"
                onClick={() => selectFromUserSwitch(item)}
              >
                <MapPin />
                <div className="suggestion-info">
                  <b>{item.name}</b>
                  <small>{item.district} · {item.region}</small>
                </div>
                <span className={`suggestion-badge ${mapMode === "rain" ? "rain" : item.risk}`}>
                  {mapMode === "rain" ? `${item.rain ?? 0} มม.` : `${item.score}%`}
                </span>
              </button>
            ))}
          </div>
        )}
        {(!showSuggestions || searchSuggestions.length === 0) && (
          <div className="map-hint">
            {isAuthority ? (
              userLocation?.lat
                ? `📍 GPS เจ้าหน้าที่: ${userLocation.districtName || userLocation.provinceName || "พิกัดของคุณ"} (${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}) · คลิกเขตจังหวัดเพื่อตรวจสอบสถานการณ์`
                : "คลิกเขตจังหวัดหรือหมุดรายงานเพื่อตรวจสอบสถานการณ์และคัดกรองเหตุ"
            ) : userLocation?.lat ? (
              `📍 GPS เปิดอยู่: ${userLocation.districtName || userLocation.provinceName || "พิกัดของคุณ"} (${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}) · คลิกปุ่ม + แจ้งเหตุด้านล่าง`
            ) : (
              "คลิกปุ่มเป้าเล็งเพื่อเปิดพิกัด GPS หรือคลิกบนแผนที่เพื่อแจ้งเหตุ"
            )}
          </div>
        )}
      </div>

      {/* Dynamic Map Legend based on mapMode */}
      <div className="map-legend">
        {mapMode === "risk" ? (
          <>
            <b>ระดับความเสี่ยง</b>
            <span><i className="high" /> สูง (≥70%)</span>
            <span><i className="medium" /> ปานกลาง (40–69%)</span>
            <span><i className="low" /> ต่ำ (&lt;40%)</span>
            <span><i className="gps" /> ตำแหน่งฉัน</span>
          </>
        ) : (
          <>
            <b>ปริมาณน้ำฝนสด (Open-Meteo & Radar)</b>
            <span><i className="rain-heavy-alert" /> &gt;50 มม. (หนักมาก)</span>
            <span><i className="rain-heavy" /> 25–50 มม.</span>
            <span><i className="rain-med" /> 10–25 มม.</span>
            <span><i className="rain-light" /> 0–10 มม.</span>
            <span><i className="rain-none" /> ไม่มีฝน</span>
          </>
        )}
      </div>

      {!isAuthority && onReportAt && (
        <button
          type="button"
          className="report-fab"
          onClick={() => onReportAt(defaultReportCoords)}
          aria-label="แจ้งเหตุน้ำท่วม ณ จุดนี้"
        >
          <Plus /> แจ้งเหตุน้ำท่วม ณ พิกัดปัจจุบัน
        </button>
      )}
    </section>
  );
}
