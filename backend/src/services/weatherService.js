const isTestRun =
  process.env.NODE_ENV === "test" ||
  process.execArgv.includes("--test") ||
  process.argv.some((arg) => arg.includes(".test."));

let lastProvinceWeatherSyncMs = 0;
const WEATHER_SYNC_TTL_MS = 10 * 60_000;

export function computeRealProvinceRisk({ rain = 0, elevation = 0, affected = 0 }) {
  const realRain = Math.max(0, Number(rain) || 0);
  const realAffected = Math.max(0, Number(affected) || 0);
  const realElevation = Math.max(0, Number(elevation) || 0);

  if (realRain === 0 && realAffected === 0) {
    return { score: 0, risk: "low" };
  }

  const rainComponent = Math.min(75, realRain * 1.25);
  const reportComponent = Math.min(45, realAffected * 15);
  const lowElevationBonus = realRain >= 5 && realElevation > 0 && realElevation <= 20 ? Math.round((20 - realElevation) * 0.6) : 0;

  const score = Math.min(100, Math.round(rainComponent + reportComponent + lowElevationBonus));
  const risk = score >= 80 ? "high" : score >= 45 ? "medium" : "low";
  return { score, risk };
}

export async function syncProvincesWithLiveWeather(provinces, { force = false } = {}) {
  if (!Array.isArray(provinces) || provinces.length === 0) return provinces;
  if (isTestRun) return provinces;

  const now = Date.now();
  if (!force && lastProvinceWeatherSyncMs > 0 && now - lastProvinceWeatherSyncMs < WEATHER_SYNC_TTL_MS) {
    return provinces;
  }

  const lats = provinces.map((p) => p.lat).join(",");
  const lngs = provinces.map((p) => p.lng).join(",");
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}&current=precipitation,rain,weather_code,temperature_2m,relative_humidity_2m&daily=precipitation_sum&timezone=Asia%2FBangkok&forecast_days=1`;

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(4500),
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return provinces;

    const payload = await response.json();
    const results = Array.isArray(payload) ? payload : [payload];
    const timestamp = new Date().toISOString();

    for (let i = 0; i < provinces.length; i += 1) {
      const item = results[i];
      if (!item) continue;
      const province = provinces[i];
      const currentPrecip = Number(item.current?.precipitation ?? item.current?.rain ?? 0);
      const dailyPrecip = Number(item.daily?.precipitation_sum?.[0] ?? 0);
      const rain = Number(Math.max(currentPrecip, dailyPrecip).toFixed(1));
      const elevation = Number(Number(item.elevation ?? province.elevation ?? 0).toFixed(1));
      const { score, risk } = computeRealProvinceRisk({
        rain,
        elevation,
        affected: province.affected || 0,
      });

      province.rain = rain;
      province.elevation = elevation;
      province.temperature = item.current?.temperature_2m ?? null;
      province.humidity = item.current?.relative_humidity_2m ?? null;
      province.weatherCode = item.current?.weather_code ?? null;
      province.score = score;
      province.risk = risk;
      province.liveWeatherConnected = true;
      province.dataSource = "Open-Meteo Real-Time API";
      province.updatedAt = timestamp;
    }

    lastProvinceWeatherSyncMs = now;
    return provinces;
  } catch {
    return provinces;
  }
}

export async function fetchPointWeatherAndFlood({ lat, lng }) {
  const numLat = Number(lat);
  const numLng = Number(lng);
  if (!Number.isFinite(numLat) || !Number.isFinite(numLng)) {
    throw new Error("Invalid coordinates");
  }

  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${numLat}&longitude=${numLng}&current=precipitation,rain,weather_code,temperature_2m,relative_humidity_2m,wind_speed_10m&daily=precipitation_sum,precipitation_probability_max&timezone=Asia%2FBangkok&forecast_days=1`;
  const floodUrl = `https://flood-api.open-meteo.com/v1/flood?latitude=${numLat}&longitude=${numLng}&daily=river_discharge,river_discharge_max&forecast_days=1`;
  const geocodeUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${numLat}&lon=${numLng}&accept-language=th`;

  const [weatherRes, floodRes, geoRes] = await Promise.allSettled([
    fetch(weatherUrl, { signal: AbortSignal.timeout(3500) }).then((r) => (r.ok ? r.json() : null)),
    fetch(floodUrl, { signal: AbortSignal.timeout(3500) }).then((r) => (r.ok ? r.json() : null)),
    fetch(geocodeUrl, {
      signal: AbortSignal.timeout(3500),
      headers: { "User-Agent": "WareeGuard/2.0" },
    }).then((r) => (r.ok ? r.json() : null)),
  ]);

  const weather = weatherRes.status === "fulfilled" ? weatherRes.value : null;
  const flood = floodRes.status === "fulfilled" ? floodRes.value : null;
  const geo = geoRes.status === "fulfilled" ? geoRes.value : null;

  const currentPrecip = Number(weather?.current?.precipitation ?? weather?.current?.rain ?? 0);
  const dailyPrecip = Number(weather?.daily?.precipitation_sum?.[0] ?? 0);
  const rainMm = Number(Math.max(currentPrecip, dailyPrecip).toFixed(1));
  const elevationM = weather?.elevation != null ? Number(Number(weather.elevation).toFixed(1)) : null;
  const riverDischargeM3s =
    flood?.daily?.river_discharge?.[0] != null ? Number(flood.daily.river_discharge[0]) : null;

  const { score, risk } = computeRealProvinceRisk({
    rain: rainMm,
    elevation: elevationM ?? 0,
    affected: 0,
  });

  return {
    lat: numLat,
    lng: numLng,
    connected: Boolean(weather || flood || geo),
    dataSource: weather ? "Open-Meteo & GloFAS Real-Time API" : "offline",
    locationName: geo?.display_name || "",
    address: geo?.address || null,
    elevationM,
    rainMm,
    precipitationProbability: weather?.daily?.precipitation_probability_max?.[0] ?? null,
    temperatureC: weather?.current?.temperature_2m ?? null,
    humidityPercent: weather?.current?.relative_humidity_2m ?? null,
    windSpeedKmh: weather?.current?.wind_speed_10m ?? null,
    riverDischargeM3s,
    riskScore: score,
    riskLevel: risk,
    timestamp: new Date().toISOString(),
  };
}
