import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bell, Check, Info, Map, PlusCircle, RadioTower, RefreshCw, Smartphone, TriangleAlert, X } from "lucide-react";
import { api } from "./services/api.js";
import {
  fetchLiveProvinceWeather,
  fetchLiveThailandFloodNewsClient,
  fetchUserLocationWeatherAndAddress,
} from "./services/liveData.js";
import { playAlertSound, sendSystemNotification } from "./services/notifications.js";
import Header from "./components/Header.jsx";
import CitizenView from "./components/CitizenView.jsx";
import AuthorityView from "./components/AuthorityView.jsx";
import ReportDrawer from "./components/ReportDrawer.jsx";
import LoginModal from "./components/LoginModal.jsx";
import BroadcastModal from "./components/BroadcastModal.jsx";
import NotificationModal from "./components/NotificationModal.jsx";
import InstallAppModal from "./components/InstallAppModal.jsx";

function loadStoredToken() {
  try {
    return localStorage.getItem("thaiflood-token") || sessionStorage.getItem("thaiflood-token") || "";
  } catch {
    return "";
  }
}

function loadStoredUser() {
  try {
    const raw = localStorage.getItem("thaiflood-user") || sessionStorage.getItem("thaiflood-user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(token, user) {
  try {
    localStorage.setItem("thaiflood-token", token);
    localStorage.setItem("thaiflood-user", JSON.stringify(user));
    sessionStorage.setItem("thaiflood-token", token);
    sessionStorage.setItem("thaiflood-user", JSON.stringify(user));
  } catch {
    // ignore storage quota errors
  }
}

function clearSession() {
  try {
    localStorage.removeItem("thaiflood-token");
    localStorage.removeItem("thaiflood-user");
    sessionStorage.removeItem("thaiflood-token");
    sessionStorage.removeItem("thaiflood-user");
  } catch {
    // ignore storage errors
  }
}

export default function App() {
  const [token, setToken] = useState(loadStoredToken);
  const [user, setUser] = useState(loadStoredUser);
  const [mode, setMode] = useState(() => (loadStoredUser()?.role === "authority" ? "authority" : "citizen"));
  const [provinces, setProvinces] = useState([]);
  const provincesRef = useRef([]);
  const lastNotifiedProvinceRef = useRef("");
  const [reports, setReports] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [news, setNews] = useState({ updatedAt: null, items: [] });
  const [newsBusy, setNewsBusy] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [userLocation, setUserLocation] = useState({
    lat: null,
    lng: null,
    accuracy: null,
    address: "",
    provinceName: "",
    districtName: "",
    temperature: null,
    humidity: null,
    rainMm: null,
    rainProbability: null,
    elevation: null,
    riverDischarge: null,
    loading: false,
    error: "",
  });
  const [isSimulated, setIsSimulated] = useState(false);
  const isSimulatedRef = useRef(false);
  const realGpsCoordsRef = useRef(null);

  useEffect(() => {
    isSimulatedRef.current = isSimulated;
  }, [isSimulated]);
  const [coordinate, setCoordinate] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginIntent, setLoginIntent] = useState("citizen");
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [installOpen, setInstallOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const soundEnabledRef = useRef(true);
  const [myReports, setMyReports] = useState([]);
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    provincesRef.current = provinces;
  }, [provinces]);

  const toast = useCallback((title, message, type = "info") => {
    const id = crypto.randomUUID ? crypto.randomUUID() : `toast-${Date.now()}-${Math.random()}`;
    setToasts((items) => [...items, { id, title, message, type }]);
    setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 5000);
  }, []);

  useEffect(() => {
    const handler = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function triggerInstallPrompt() {
    if (!deferredPrompt) {
      setInstallOpen(true);
      return;
    }
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice.catch(() => null);
    if (choice?.outcome === "accepted") {
      toast("ติดตั้งแอปสำเร็จ", "เพิ่ม UTOK (อุทก) ลงบนอุปกรณ์เรียบร้อยแล้ว", "success");
      setDeferredPrompt(null);
      setInstallOpen(false);
    }
  }

  const updateFromCoords = useCallback(
    async (coords, silent = false, fromSimulation = false) => {
      const lat = coords.latitude;
      const lng = coords.longitude;
      const accuracy = Math.round(coords.accuracy || 20);

      if (!fromSimulation) {
        realGpsCoordsRef.current = { latitude: lat, longitude: lng, accuracy };
        setIsSimulated(false);
      } else {
        setIsSimulated(true);
      }

      setUserLocation((prev) => ({
        ...prev,
        lat,
        lng,
        accuracy,
        loading: false,
        error: "",
      }));
      setCoordinate((prev) => prev || { lat, lng });

      const currentProvinces = provincesRef.current;
      const nearest = currentProvinces.length
        ? currentProvinces.reduce((best, item) => {
            const distance = Math.hypot(item.lat - lat, item.lng - lng);
            return !best || distance < best.distance ? { ...item, distance } : best;
          }, null)
        : null;

      const liveTelemetry = await fetchUserLocationWeatherAndAddress(lat, lng);
      const detectedProvince = liveTelemetry.provinceName || (nearest ? nearest.name : "");
      const matched = currentProvinces.find(
        (item) => item.name === detectedProvince || (detectedProvince && (detectedProvince.includes(item.name) || item.name.includes(detectedProvince))),
      ) || nearest;

      setUserLocation((prev) => ({
        ...prev,
        ...liveTelemetry,
        provinceName: matched?.name || liveTelemetry.provinceName || "",
        districtName: liveTelemetry.districtName || matched?.district || "",
        lat,
        lng,
        accuracy,
        loading: false,
        error: "",
      }));

      if (matched) setSelectedProvince(matched);

      // 🚨 Province Boundary Crossing & Entry Alert
      if (matched?.name && matched.name !== lastNotifiedProvinceRef.current) {
        const previous = lastNotifiedProvinceRef.current;
        lastNotifiedProvinceRef.current = matched.name;

        const riskTh = matched.risk === "high" ? "เสี่ยงสูง" : matched.risk === "medium" ? "เสี่ยงปานกลาง" : "ปกติ";
        const rainInfo = matched.rain !== null && matched.rain !== undefined ? ` · ปริมาณฝน ${matched.rain} มม.` : "";
        const alertHeadline = previous
          ? `ข้ามเขตเข้าสู่พื้นที่ จ.${matched.name}`
          : `เข้าสู่พื้นที่ จ.${matched.name}`;
        const alertDetail = `สถานะพื้นที่: ${riskTh}${rainInfo} (ระบบล็อกสิทธิ์ให้รายงานเหตุน้ำท่วมเฉพาะใน จ.${matched.name})`;

        toast(
          `📍 ${alertHeadline}`,
          alertDetail,
          matched.risk === "high" ? "error" : matched.risk === "medium" ? "warning" : "info",
        );
        playAlertSound(matched.risk === "high" ? "critical" : "warning");
        sendSystemNotification({
          title: `📍 UTOK: ${alertHeadline}`,
          body: alertDetail,
          level: matched.risk === "high" ? "red" : "warning",
        }).catch(() => {});
      } else if (!silent) {
        toast(
          fromSimulation ? `จำลองตำแหน่ง จ.${matched?.name || ""}` : "เชื่อมต่อพิกัดปัจจุบันสำเร็จ",
          liveTelemetry.address || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          "success",
        );
      }
    },
    [toast],
  );

  const locate = useCallback(
    (silent = false) => {
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        const msg = "เบราว์เซอร์นี้ไม่รองรับ GPS กรุณาเลือกค้นหาพื้นที่บนแผนที่";
        setUserLocation((prev) => ({ ...prev, loading: false, error: msg }));
        if (!silent) toast("ไม่รองรับ GPS", msg, "error");
        return;
      }

      // Check insecure context on LAN IP (e.g. http://192.168.x.x)
      if (
        typeof window !== "undefined" &&
        !window.isSecureContext &&
        window.location.hostname !== "localhost" &&
        window.location.hostname !== "127.0.0.1"
      ) {
        const msg =
          "เบราว์เซอร์จำกัด GPS เมื่อเปิดผ่าน HTTP วง LAN (ต้องใช้ localhost หรือ HTTPS) ท่านสามารถพิมพ์ค้นหาหรือคลิกเลือกจังหวัดบนแผนที่ได้โดยตรงครับ";
        setUserLocation((prev) => ({ ...prev, loading: false, error: msg }));
        if (!silent) toast("เบราว์เซอร์จำกัดสิทธิ์ GPS", msg, "warning");
        return;
      }

      setUserLocation((prev) => ({ ...prev, loading: true, error: "" }));

      // Try High Accuracy first, if timeout try low accuracy (works indoors/without satellites)
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          updateFromCoords(coords, silent, false);
        },
        () => {
          navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
              updateFromCoords(coords, silent, false);
            },
            (err) => {
              const isDenied = err?.code === 1;
              const isTimeout = err?.code === 3;
              const msg = isDenied
                ? "เบราว์เซอร์ยังไม่ได้รับอนุญาตให้เข้าถึงตำแหน่ง กรุณากดไอคอนแม่กุญแจ/การตั้งค่าที่แถบ URL เพื่อกดเปิด 'Allow Location'"
                : isTimeout
                  ? "การเชื่อมต่อสัญญาณ GPS หมดเวลา กรุณาลองใหม่อีกครั้ง หรือพิมพ์ค้นหาอำเภอ/จังหวัดบนแผนที่"
                  : "ไม่สามารถดึงพิกัด GPS ได้ในขณะนี้ คุณสามารถพิมพ์ค้นหาอำเภอ/จังหวัดบนแผนที่เพื่อระบุตำแหน่งได้";
              setUserLocation((prev) => ({ ...prev, loading: false, error: msg }));
              if (!silent) toast("เข้าถึงตำแหน่งไม่ได้", msg, "error");
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
          );
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 30000 },
      );
    },
    [toast, updateFromCoords],
  );

  const resetToRealGps = useCallback(() => {
    setIsSimulated(false);
    if (realGpsCoordsRef.current) {
      updateFromCoords(realGpsCoordsRef.current, false, false);
      toast("กลับสู่ตำแหน่งจริงแล้ว", "รีเซ็ตพิกัดกลับสู่พิกัด GPS อุปกรณ์จริงของคุณ", "success");
    } else {
      locate(false);
    }
  }, [updateFromCoords, locate, toast]);

  const loadData = useCallback(
    async (silent = false) => {
      try {
        const [health, provinceData, reportData, broadcastData, newsData] = await Promise.all([
          api.health(),
          api.provinces(),
          api.reports(),
          api.broadcasts(),
          api.news().catch(() => ({ updatedAt: null, items: [] })),
        ]);
        setConnected(health.status === "ok");
        setReports(reportData);
        setBroadcasts(broadcastData);

        const enrichedProvinces = await fetchLiveProvinceWeather(provinceData, reportData);
        setProvinces(enrichedProvinces);
        provincesRef.current = enrichedProvinces;
        setSelectedProvince((current) =>
          current ? enrichedProvinces.find((item) => item.id === current.id) || enrichedProvinces[0] : enrichedProvinces[0],
        );

        if (newsData?.items?.length) {
          setNews(newsData);
        } else {
          const liveClientNews = await fetchLiveThailandFloodNewsClient(enrichedProvinces);
          if (liveClientNews?.items?.length) setNews(liveClientNews);
          else setNews({ updatedAt: new Date().toISOString(), items: [] });
        }

        if (!silent) toast("ซิงค์ข้อมูลจริงสำเร็จ", "อัปเดตสภาพอากาศ Open-Meteo และฐานข้อมูลล่าสุดแล้ว", "success");
      } catch (error) {
        setConnected(false);
        toast("เชื่อมต่อ API ไม่ได้", `${error.message} — ตรวจสอบว่า backend กำลังทำงาน`, "error");
      }
    },
    [toast],
  );

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Automatically enable and watch the user's real GPS location on startup
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return undefined;
    locate(true);
    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        setUserLocation((prev) => {
          const moved =
            !prev.lat || Math.hypot(prev.lat - coords.latitude, prev.lng - coords.longitude) > 0.001;
          if (moved && !isSimulatedRef.current) {
            updateFromCoords(coords, true, false);
          }
          return {
            ...prev,
            lat: coords.latitude,
            lng: coords.longitude,
            accuracy: Math.round(coords.accuracy || 20),
            loading: false,
            error: "",
          };
        });
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 15000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [locate, updateFromCoords]);

  async function refreshNewsFeed() {
    setNewsBusy(true);
    try {
      const updated = await api.refreshNews().catch(() => null);
      if (updated?.items?.length) {
        setNews(updated);
        toast("ดึงข่าวจริงสำเร็จ", `พบข่าวสารสถานการณ์น้ำ ${updated.items.length} รายการ`, "success");
      } else {
        const liveClientNews = await fetchLiveThailandFloodNewsClient(provincesRef.current);
        if (liveClientNews?.items?.length) {
          setNews(liveClientNews);
          toast("ดึงข่าวจริงจาก Live RSS สำเร็จ", `พบข่าวสารล่าสุด ${liveClientNews.items.length} รายการ`, "success");
        } else {
          setNews({ updatedAt: new Date().toISOString(), items: [] });
          toast("ไม่พบข่าวใหม่ในขณะนี้", "ระบบแสดงเฉพาะข่าวจริงจากฟีดข่าวเท่านั้น", "info");
        }
      }
    } catch (error) {
      toast("อัปเดตข่าวไม่สำเร็จ", error.message, "error");
    } finally {
      setNewsBusy(false);
    }
  }

  useEffect(() => {
    if (!token) return;
    api
      .me(token)
      .then((member) => {
        setUser(member);
        saveSession(token, member);
        if (member.role === "citizen") {
          api
            .myReports(token)
            .then(setMyReports)
            .catch(() => setMyReports([]));
        }
      })
      .catch(() => {
        clearSession();
        setToken("");
        setUser(null);
      });
  }, [token]);

  useEffect(() => {
    const events = new EventSource(api.eventsUrl);
    const readPayload = (event) => {
      try {
        return JSON.parse(event.data).data;
      } catch {
        return null;
      }
    };
    const onReportCreated = (event) => {
      const report = readPayload(event);
      if (report) setReports((items) => [report, ...items.filter((item) => item.id !== report.id)]);
    };
    const onReportUpdated = (event) => {
      const report = readPayload(event);
      if (report) {
        setReports((items) => items.map((item) => (item.id === report.id ? report : item)));
        setMyReports((items) => items.map((item) => (item.id === report.id ? report : item)));
      }
    };
    const onProvinceUpdated = (event) => {
      const province = readPayload(event);
      if (province) {
        setProvinces((items) => items.map((item) => (item.id === province.id ? { ...item, ...province } : item)));
        setSelectedProvince((current) => (current?.id === province.id ? { ...current, ...province } : current));
      }
    };
    const onBroadcastCreated = (event) => {
      const broadcast = readPayload(event);
      if (broadcast) {
        setBroadcasts((items) => [broadcast, ...items.filter((item) => item.id !== broadcast.id)]);
        setNotifications((items) => [
          { ...broadcast, source: "ประกาศเตือนภัยด่วน" },
          ...items.filter((item) => item.id !== broadcast.id),
        ]);
        toast(`ประกาศเตือนภัย · ${broadcast.province}`, broadcast.headline, "error");
        if (soundEnabledRef.current) playAlertSound(broadcast.level || "red");
        sendSystemNotification({
          title: `เตือนภัยน้ำท่วม · ${broadcast.province}`,
          body: `${broadcast.headline} — ${broadcast.advisory}`,
          tag: broadcast.id,
          level: broadcast.level || "red",
        });
      }
    };
    const onNotificationTest = (event) => {
      const notif = readPayload(event);
      if (notif) {
        setNotifications((items) => [
          { ...notif, source: `ทดสอบระบบ (${notif.sender || "ผู้ใช้"})` },
          ...items.filter((item) => item.id !== notif.id),
        ]);
        toast(
          `แจ้งเตือนฉุกเฉิน · ${notif.province}`,
          `${notif.headline} — ${notif.advisory}`,
          notif.level === "evacuation" || notif.level === "red" ? "error" : "info",
        );
        if (soundEnabledRef.current) playAlertSound(notif.level || "warning");
        sendSystemNotification({
          title: `${notif.province} · ${notif.headline}`,
          body: notif.advisory,
          tag: notif.id,
          level: notif.level || "warning",
        });
      }
    };
    const onNewsUpdated = (event) => {
      const payload = readPayload(event);
      if (payload?.items?.length) {
        setNews(payload);
      }
    };
    const onReportDeleted = (event) => {
      const payload = readPayload(event);
      if (payload?.id) {
        setReports((items) => items.filter((item) => item.id !== payload.id));
        setMyReports((items) => items.filter((item) => item.id !== payload.id));
      }
    };
    const onBroadcastDeleted = (event) => {
      const payload = readPayload(event);
      if (payload?.id) {
        setBroadcasts((items) => items.filter((item) => item.id !== payload.id));
        setNotifications((items) => items.filter((item) => item.id !== payload.id));
      }
    };
    events.addEventListener("report.created", onReportCreated);
    events.addEventListener("report.updated", onReportUpdated);
    events.addEventListener("report.deleted", onReportDeleted);
    events.addEventListener("province.updated", onProvinceUpdated);
    events.addEventListener("broadcast.created", onBroadcastCreated);
    events.addEventListener("broadcast.deleted", onBroadcastDeleted);
    events.addEventListener("notification.test", onNotificationTest);
    events.addEventListener("news.updated", onNewsUpdated);
    events.onopen = () => setConnected(true);
    events.onerror = () => setConnected(false);
    return () => events.close();
  }, [toast]);

  const simulateProvince = useCallback(
    (provinceName) => {
      const target = provinces.find((p) => p.name === provinceName || p.name.includes(provinceName));
      if (!target) return;
      updateFromCoords({ latitude: target.lat, longitude: target.lng, accuracy: 15 }, false, true);
      setSelectedProvince(target);
      setCoordinate({ lat: target.lat, lng: target.lng });
    },
    [provinces, updateFromCoords],
  );

  const onReportAt = useCallback(
    (point) => {
      if (mode === "authority" || user?.role === "authority") {
        toast(
          "สิทธิ์การใช้งานของเจ้าหน้าที่",
          "บัญชีเจ้าหน้าที่ดูแลระบบและคัดกรองเหตุการณ์ ไม่สามารถส่งรายงานในฐานะประชาชนได้",
          "info",
        );
        return;
      }

      let targetPoint = point;
      if (userLocation?.lat && userLocation?.provinceName) {
        if (point) {
          const distKm = Math.hypot(point.lat - userLocation.lat, point.lng - userLocation.lng) * 111;
          if (distKm > 120) {
            toast(
              "ป้องกันรายงานเท็จ",
              `ระบบล็อกพิกัดแจ้งเหตุให้อยู่ใน จ.${userLocation.provinceName} ตามตำแหน่ง GPS จริงของคุณ`,
              "warning",
            );
            targetPoint = { lat: userLocation.lat, lng: userLocation.lng };
          }
        } else {
          targetPoint = { lat: userLocation.lat, lng: userLocation.lng };
        }
      } else {
        locate(true);
        targetPoint =
          point ||
          (userLocation?.lat ? { lat: userLocation.lat, lng: userLocation.lng } : null) ||
          (selectedProvince ? { lat: selectedProvince.lat, lng: selectedProvince.lng } : { lat: 13.736717, lng: 100.523186 });
      }

      setCoordinate(targetPoint);
      if (!token) {
        setLoginIntent("citizen");
        setLoginOpen(true);
        return;
      }
      setReportOpen(true);
    },
    [token, user, mode, userLocation, selectedProvince, locate, toast],
  );
  const onSelectProvince = useCallback((province) => setSelectedProvince(province), []);

  function changeMode(nextMode) {
    if (user?.role === "authority") {
      toast(
        "สิทธิ์เจ้าหน้าที่",
        "บัญชีเจ้าหน้าที่ถูกล็อกให้อยู่ในระบบศูนย์บัญชาการสถานการณ์น้ำ ไม่สามารถสลับไปโหมดประชาชนได้ หากต้องการใช้งานในฐานะประชาชน กรุณากดออกจากระบบก่อน",
        "warning",
      );
      return;
    }
    if (nextMode === "authority") {
      setLoginIntent("authority");
      setLoginOpen(true);
      return;
    }
    setMode("citizen");
  }

  // Enforce strict role confinement: Authorities can NEVER be in citizen mode
  useEffect(() => {
    if (user?.role === "authority" && mode !== "authority") {
      setMode("authority");
    } else if (user?.role !== "authority" && mode === "authority") {
      setMode("citizen");
    }
  }, [user?.role, mode]);

  async function login(email, password, intent) {
    setBusy(true);
    try {
      const result = await api.login(email, password);
      if (intent === "authority" && result.user.role !== "authority") throw new Error("บัญชีนี้ไม่มีสิทธิ์เจ้าหน้าที่");
      saveSession(result.token, result.user);
      setToken(result.token);
      setUser(result.user);
      setLoginOpen(false);
      setMode(result.user.role === "authority" ? "authority" : "citizen");
      if (result.user.role === "citizen") {
        setMyReports(await api.myReports(result.token));
        if (coordinate) setReportOpen(true);
      }
      toast(
        "เข้าสู่ระบบสำเร็จ",
        result.user.role === "authority" ? `ยินดีต้อนรับเจ้าหน้าที่ ${result.user.name}` : `ยินดีต้อนรับ ${result.user.name}`,
        "success",
      );
    } finally {
      setBusy(false);
    }
  }

  async function register(payload) {
    setBusy(true);
    try {
      const province = provinces.find((item) => item.name === payload.homeProvince);
      const result = await api.register({
        ...payload,
        lat: userLocation?.lat ?? province?.lat ?? null,
        lng: userLocation?.lng ?? province?.lng ?? null,
      });
      saveSession(result.token, result.user);
      setToken(result.token);
      setUser(result.user);
      setMyReports([]);
      setLoginOpen(false);
      const nextMode = result.user.role === "authority" ? "authority" : "citizen";
      setMode(nextMode);
      if (result.user.role === "citizen" && coordinate) setReportOpen(true);
      toast(
        "สมัครสมาชิกสำเร็จ",
        result.user.role === "authority"
          ? `ลงทะเบียนเจ้าหน้าที่ ${result.user.name} สำเร็จ`
          : `สร้างบัญชีของ ${result.user.name} พร้อมใช้งานแล้ว`,
        "success",
      );
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    clearSession();
    setToken("");
    setUser(null);
    setMode("citizen");
    setReportOpen(false);
    setMyReports([]);
    toast("ออกจากระบบแล้ว", "กลับสู่หน้าหลักประชาชน", "info");
  }

  async function submitReport(formData) {
    if (user?.role === "authority") {
      toast("ไม่สามารถส่งรายงานได้", "บัญชีเจ้าหน้าที่ไม่ได้รับอนุญาตให้ส่งรายงานเหตุน้ำท่วมในฐานะประชาชน", "error");
      return;
    }
    setBusy(true);
    try {
      const report = await api.createReport(formData, token);
      setReports((items) => [report, ...items.filter((item) => item.id !== report.id)]);
      if (user) setMyReports((items) => [report, ...items.filter((item) => item.id !== report.id)]);
      setReportOpen(false);
      toast("ส่งรายงานสำเร็จ", `${report.id} · ${report.aiTriage?.label || "บันทึกในระบบแล้ว"}`, "success");
    } catch (error) {
      toast("ส่งรายงานไม่สำเร็จ", error.message, "error");
      throw error;
    } finally {
      setBusy(false);
    }
  }

  async function moderate(id, status) {
    try {
      const updated = await api.updateReportStatus(id, status, token);
      setReports((items) => items.map((item) => (item.id === id ? updated : item)));
      toast("อัปเดตรายงานแล้ว", `${id} เปลี่ยนสถานะเรียบร้อย`, "success");
    } catch (error) {
      toast("อัปเดตไม่สำเร็จ", error.message, "error");
    }
  }

  async function removeReport(id) {
    if (!token) return;
    try {
      await api.deleteReport(id, token);
      setReports((items) => items.filter((item) => item.id !== id));
      setMyReports((items) => items.filter((item) => item.id !== id));
      toast("ลบรายงานสำเร็จ", `ลบรายงานรหัส ${id} เรียบร้อยแล้ว`, "info");
    } catch (error) {
      toast("ลบรายงานไม่สำเร็จ", error.message, "error");
    }
  }

  async function updateRisk(province, risk) {
    const score =
      risk === "high"
        ? Math.max(80, province.score || 80)
        : risk === "medium"
          ? Math.min(79, Math.max(45, province.score || 55))
          : Math.min(39, province.score || 20);
    try {
      const updated = await api.updateProvince(province.id, risk, score, token);
      setProvinces((items) => items.map((item) => (item.id === province.id ? { ...item, ...updated } : item)));
      setSelectedProvince((current) => (current?.id === province.id ? { ...current, ...updated } : current));
      toast("ปรับความเสี่ยงแล้ว", `${province.name} · ${score}%`, "success");
    } catch (error) {
      toast("ปรับความเสี่ยงไม่สำเร็จ", error.message, "error");
    }
  }

  async function submitBroadcast(payload) {
    setBusy(true);
    try {
      const broadcast = await api.createBroadcast(payload, token);
      setBroadcasts((items) => [broadcast, ...items.filter((item) => item.id !== broadcast.id)]);
      setBroadcastOpen(false);
      toast("เผยแพร่ประกาศแล้ว", `ส่งถึงพื้นที่ ${broadcast.province}`, "success");
    } catch (error) {
      toast("ส่งประกาศไม่สำเร็จ", error.message, "error");
      throw error;
    } finally {
      setBusy(false);
    }
  }

  async function removeBroadcast(id) {
    if (!token) return;
    try {
      await api.deleteBroadcast(id, token);
      setBroadcasts((items) => items.filter((item) => item.id !== id));
      setNotifications((items) => items.filter((item) => item.id !== id));
      toast("ยกเลิกประกาศแล้ว", `ลบประกาศรหัส ${id} เรียบร้อยแล้ว`, "info");
    } catch (error) {
      toast("ลบประกาศไม่สำเร็จ", error.message, "error");
    }
  }

  async function sendTestNotification(payload) {
    setBusy(true);
    try {
      await api.testNotification(payload, token);
    } catch (error) {
      toast("ส่งสัญญาณทดสอบไม่สำเร็จ", error.message, "error");
    } finally {
      setBusy(false);
    }
  }

  function handleLocalTestNotification(item) {
    setNotifications((items) => [item, ...items]);
    toast(`ทดสอบแจ้งเตือนสำเร็จ · ${item.province}`, item.headline, "success");
  }

  const notificationCount = useMemo(
    () => Math.min(99, broadcasts.length + notifications.length),
    [broadcasts.length, notifications.length],
  );

  return (
    <div id="top" className="app-shell">
      <Header
        mode={mode}
        onModeChange={changeMode}
        connected={connected}
        user={user}
        userLocation={userLocation}
        selectedProvince={selectedProvince}
        notificationCount={notificationCount}
        onLocate={() => locate(false)}
        onOpenNotifications={() => setNotificationOpen(true)}
        onOpenInstall={() => setInstallOpen(true)}
        onUserClick={() => {
          if (user) {
            toast("บัญชีที่กำลังใช้งาน", `${user.name} (${user.email})`, "info");
          } else {
            setLoginIntent("citizen");
            setLoginOpen(true);
          }
        }}
        onLogout={logout}
      />
      {mode === "citizen" ? (
        <CitizenView
          provinces={provinces}
          reports={reports}
          broadcasts={broadcasts}
          news={news}
          onRefreshNews={refreshNewsFeed}
          newsBusy={newsBusy}
          selectedProvince={selectedProvince}
          userLocation={userLocation}
          isSimulated={isSimulated}
          onResetRealGps={resetToRealGps}
          onSelectProvince={onSelectProvince}
          onReportAt={onReportAt}
          onLocate={locate}
          user={user}
          myReports={myReports}
          onMemberLogin={() => {
            setLoginIntent("citizen");
            setLoginOpen(true);
          }}
          onLogout={logout}
          onDeleteReport={removeReport}
          onOpenNotifications={() => setNotificationOpen(true)}
          onOpenInstall={() => setInstallOpen(true)}
        />
      ) : (
        <AuthorityView
          reports={reports}
          provinces={provinces}
          broadcasts={broadcasts}
          news={news}
          onRefreshNews={refreshNewsFeed}
          newsBusy={newsBusy}
          onModerate={moderate}
          onDeleteReport={removeReport}
          onDeleteBroadcast={removeBroadcast}
          onRiskChange={updateRisk}
          onOpenBroadcast={() => setBroadcastOpen(true)}
          onOpenNotifications={() => setNotificationOpen(true)}
          onRefresh={() => loadData(false)}
          onLogout={logout}
          selectedProvince={selectedProvince}
          userLocation={userLocation}
          onSelectProvince={onSelectProvince}
          onLocate={() => locate(false)}
        />
      )}
      {!provinces.length && (
        <div className="loading-screen">
          <span />
          <b>กำลังดึงข้อมูลจริงจาก Open-Meteo API และศูนย์ข้อมูลน้ำ...</b>
          <small>รัน `npm run dev` ที่ root ของโปรเจกต์</small>
        </div>
      )}

      {mode === "authority" ? (
        <nav className="mobile-bottom-nav authority-nav" aria-label="เมนูหลักเจ้าหน้าที่">
          <button
            type="button"
            className={!broadcastOpen && !notificationOpen ? "active" : ""}
            onClick={() => {
              setBroadcastOpen(false);
              setNotificationOpen(false);
            }}
          >
            <Map />
            <span>บัญชาการ GIS</span>
          </button>
          <button
            type="button"
            className={broadcastOpen ? "active" : ""}
            onClick={() => setBroadcastOpen(true)}
          >
            <RadioTower />
            <span>สร้างเตือนภัย</span>
          </button>
          <button
            type="button"
            className={notificationOpen ? "active" : ""}
            onClick={() => setNotificationOpen(true)}
          >
            <Bell />
            <span>แจ้งเตือน ({notificationCount})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              loadData(false);
              toast("ซิงค์ข้อมูลจริง", "ดึงข้อมูลตรวจวัดและรายงานล่าสุดเรียบร้อย", "success");
            }}
          >
            <RefreshCw />
            <span>ซิงค์ข้อมูล</span>
          </button>
        </nav>
      ) : (
        <nav className="mobile-bottom-nav" aria-label="เมนูหลักบนมือถือ">
          <button
            type="button"
            className={!reportOpen && !notificationOpen && !installOpen ? "active" : ""}
            onClick={() => {
              setReportOpen(false);
              setNotificationOpen(false);
              setInstallOpen(false);
            }}
          >
            <Map />
            <span>แผนที่</span>
          </button>
          <button
            type="button"
            className={reportOpen ? "active" : ""}
            onClick={() =>
              onReportAt(
                userLocation?.lat
                  ? { lat: userLocation.lat, lng: userLocation.lng }
                  : selectedProvince
                    ? { lat: selectedProvince.lat, lng: selectedProvince.lng }
                    : null,
              )
            }
          >
            <PlusCircle />
            <span>แจ้งเหตุ</span>
          </button>
          <button type="button" className={notificationOpen ? "active" : ""} onClick={() => setNotificationOpen(true)}>
            <Bell />
            <span>แจ้งเตือน ({notificationCount})</span>
          </button>
          <button type="button" className={installOpen ? "active" : ""} onClick={() => setInstallOpen(true)}>
            <Smartphone />
            <span>แอปมือถือ</span>
          </button>
        </nav>
      )}

      <ReportDrawer
        open={reportOpen}
        coordinate={coordinate}
        provinces={provinces}
        userLocation={userLocation}
        onClose={() => {
          setReportOpen(false);
        }}
        onSubmit={submitReport}
        onLocate={() => locate(false)}
        busy={busy}
      />
      <LoginModal
        open={loginOpen}
        intent={loginIntent}
        provinces={provinces}
        onClose={() => setLoginOpen(false)}
        onLogin={login}
        onRegister={register}
        busy={busy}
      />
      <BroadcastModal
        open={broadcastOpen}
        provinces={provinces}
        onClose={() => setBroadcastOpen(false)}
        onSubmit={submitBroadcast}
        busy={busy}
      />
      <NotificationModal
        open={notificationOpen}
        user={user}
        provinces={provinces}
        notifications={notifications}
        broadcasts={broadcasts}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        onSendTestNotification={sendTestNotification}
        onLocalTestNotification={handleLocalTestNotification}
        onSimulateProvince={simulateProvince}
        onClose={() => setNotificationOpen(false)}
        busy={busy}
      />
      <InstallAppModal
        open={installOpen}
        deferredPrompt={deferredPrompt}
        onInstallPrompt={triggerInstallPrompt}
        onClose={() => setInstallOpen(false)}
      />
      <div className="toast-stack">
        {toasts.map((item) => (
          <article key={item.id} className={`toast ${item.type}`}>
            <span>{item.type === "success" ? <Check /> : item.type === "error" ? <TriangleAlert /> : <Info />}</span>
            <div>
              <b>{item.title}</b>
              <small>{item.message}</small>
            </div>
            <button onClick={() => setToasts((items) => items.filter((toastItem) => toastItem.id !== item.id))}>
              <X />
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
