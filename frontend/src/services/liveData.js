export async function fetchLiveProvinceWeather(provinces = [], reports = []) {
  if (!Array.isArray(provinces) || !provinces.length) return provinces;
  try {
    const lats = provinces.map((p) => p.lat.toFixed(4)).join(",");
    const lngs = provinces.map((p) => p.lng.toFixed(4)).join(",");
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}&current=precipitation,rain,temperature_2m,relative_humidity_2m,weather_code&daily=precipitation_sum,precipitation_probability_max&timezone=Asia%2FBangkok&forecast_days=1`;
    const response = await fetch(url);
    if (!response.ok) return provinces;
    const payload = await response.json();
    const results = Array.isArray(payload) ? payload : [payload];
    const nowIso = new Date().toISOString();

    return provinces.map((province, index) => {
      const data = results[index];
      if (!data) return province;
      const currentRain = Number(data.current?.precipitation ?? data.current?.rain ?? 0);
      const dailyRain = Number(data.daily?.precipitation_sum?.[0] ?? currentRain);
      const rainMm = Math.round(Math.max(currentRain, dailyRain) * 10) / 10;
      const rainProb = Number(data.daily?.precipitation_probability_max?.[0] ?? 0);
      const elevation = Number.isFinite(data.elevation) ? Math.round(data.elevation) : province.elevation;
      const temperature = Number.isFinite(data.current?.temperature_2m)
        ? Math.round(data.current.temperature_2m * 10) / 10
        : null;
      const humidity = Number.isFinite(data.current?.relative_humidity_2m)
        ? Math.round(data.current.relative_humidity_2m)
        : null;

      const activeReports = reports.filter(
        (r) => r.province === province.name && r.status !== "rejected" && r.status !== "resolved",
      ).length;

      // Real-time flood risk calculation:
      // Actual measured rainfall (rainMm) is the physical hazard.
      // Forecast probability (rainProb) is only a minor antecedent factor when actual rain is present.
      const rainComponent = rainMm > 0
        ? Math.min(65, Math.round(rainMm * 1.35 + (rainProb >= 80 ? 6 : 0)))
        : 0;
      const terrainComponent = (rainMm >= 5 || activeReports > 0) && elevation !== null
        ? Math.max(0, Math.min(20, Math.round((30 - Math.min(30, elevation)) * 0.5)))
        : 0;
      const reportComponent = Math.min(35, activeReports * 12);
      const score = Math.max(0, Math.min(99, rainComponent + terrainComponent + reportComponent));
      const risk = score >= 75 ? "high" : score >= 45 ? "medium" : "low";

      const isManual = province.dataSource === "manual-authority-update";

      return {
        ...province,
        rain: rainMm,
        rainProbability: rainProb,
        elevation,
        temperature,
        humidity,
        affected: activeReports,
        score: isManual ? province.score : score,
        risk: isManual ? province.risk : risk,
        dataSource: isManual ? province.dataSource : "Open-Meteo Live API",
        updatedAt: isManual ? province.updatedAt : nowIso,
      };
    });
  } catch {
    return provinces;
  }
}

export async function fetchUserLocationWeatherAndAddress(lat, lng) {
  const result = {
    lat,
    lng,
    address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    provinceName: "",
    districtName: "",
    subdistrictName: "",
    temperature: null,
    humidity: null,
    windSpeed: null,
    rainMm: null,
    rainProbability: null,
    elevation: null,
    riverDischarge: null,
    updatedAt: new Date().toISOString(),
  };

  const geoPromise = fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=th`,
  )
    .then((res) => (res.ok ? res.json() : null))
    .catch(() => null);

  const weatherPromise = fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=precipitation,rain,temperature_2m,relative_humidity_2m,wind_speed_10m&daily=precipitation_sum,precipitation_probability_max&timezone=Asia%2FBangkok&forecast_days=1`,
  )
    .then((res) => (res.ok ? res.json() : null))
    .catch(() => null);

  const floodPromise = fetch(
    `https://flood-api.open-meteo.com/v1/flood?latitude=${lat}&longitude=${lng}&daily=river_discharge&forecast_days=1`,
  )
    .then((res) => (res.ok ? res.json() : null))
    .catch(() => null);

  const [geo, weather, flood] = await Promise.all([geoPromise, weatherPromise, floodPromise]);

  if (geo?.address) {
    const addr = geo.address;
    const rawProvince = addr.province || addr.state || addr.city || "";
    result.provinceName = rawProvince.replace(/^จังหวัด\s*/, "").trim();
    result.districtName =
      addr.city_district || addr.district || addr.county || addr.municipality || addr.suburb || "";
    result.subdistrictName = addr.suburb || addr.quarter || addr.village || addr.hamlet || addr.town || "";
    const parts = [result.subdistrictName, result.districtName, result.provinceName].filter(Boolean);
    result.address = parts.length ? parts.join(" · ") : geo.display_name || result.address;
  }

  if (weather) {
    const currentPrecip = Number(weather.current?.precipitation ?? weather.current?.rain ?? 0);
    const dailyPrecip = Number(weather.daily?.precipitation_sum?.[0] ?? currentPrecip);
    result.rainMm = Math.round(Math.max(currentPrecip, dailyPrecip) * 10) / 10;
    result.rainProbability = Number(weather.daily?.precipitation_probability_max?.[0] ?? 0);
    result.temperature = Number.isFinite(weather.current?.temperature_2m)
      ? Math.round(weather.current.temperature_2m * 10) / 10
      : null;
    result.humidity = Number.isFinite(weather.current?.relative_humidity_2m)
      ? Math.round(weather.current.relative_humidity_2m)
      : null;
    result.windSpeed = Number.isFinite(weather.current?.wind_speed_10m)
      ? Math.round(weather.current.wind_speed_10m * 10) / 10
      : null;
    result.elevation = Number.isFinite(weather.elevation) ? Math.round(weather.elevation) : null;
  }

  if (flood?.daily?.river_discharge?.length) {
    const discharge = Number(flood.daily.river_discharge[0]);
    if (Number.isFinite(discharge)) {
      result.riverDischarge = Math.round(discharge * 10) / 10;
    }
  }

  return result;
}

export async function fetchLiveThailandFloodNewsClient(provinces = []) {
  try {
    const rssUrl =
      "https://news.google.com/rss/search?q=" +
      encodeURIComponent("น้ำท่วม OR เตือนภัยน้ำท่วม OR กรมอุตุนิยมวิทยา") +
      "&hl=th&gl=TH&ceid=TH:th";
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    const response = await fetch(apiUrl);
    if (!response.ok) return null;
    const data = await response.json();
    if (!Array.isArray(data?.items) || !data.items.length) return null;

    const items = data.items.slice(0, 10).map((item, idx) => {
      const title = (item.title || "").trim();
      const matchedProvince = provinces.find((p) => title.includes(p.name));
      const isUrgent = /วิกฤต|ด่วน|อพยพ|น้ำป่า|ทะลัก|ท่วมหนัก|เตือนภัย/.test(title);
      return {
        id: `LIVE-RSS-${idx}-${Date.now()}`,
        title,
        summary: item.description ? item.description.replace(/<[^>]+>/g, "").slice(0, 180) : "",
        url: item.link,
        source: item.author || "Google News Thailand (Live RSS)",
        province: matchedProvince ? matchedProvince.name : "ทั่วประเทศ",
        severity: isUrgent ? "high" : "medium",
        publishedAt: item.pubDate || new Date().toISOString(),
      };
    });

    return {
      updatedAt: new Date().toISOString(),
      source: "live-rss-browser",
      items,
    };
  } catch {
    return null;
  }
}
