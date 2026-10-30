const baseUrl = process.env.PERF_BASE_URL || "http://127.0.0.1:4000";

function percentile(values, ratio) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * ratio) - 1)];
}

async function benchmark(path, total = 40, concurrency = 8) {
  const durations = [];
  let cursor = 0;
  async function worker() {
    while (cursor < total) {
      cursor += 1;
      const started = performance.now();
      const response = await fetch(`${baseUrl}${path}`);
      await response.arrayBuffer();
      if (!response.ok) throw new Error(`${path} returned HTTP ${response.status}`);
      durations.push(performance.now() - started);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, total) }, worker));
  return {
    requests: durations.length,
    averageMs: Number((durations.reduce((sum, value) => sum + value, 0) / durations.length).toFixed(2)),
    p50Ms: Number(percentile(durations, 0.5).toFixed(2)),
    p95Ms: Number(percentile(durations, 0.95).toFixed(2)),
    maxMs: Number(Math.max(...durations).toFixed(2)),
  };
}

const provinceResponse = await fetch(`${baseUrl}/api/provinces`);
const provinces = await provinceResponse.json();
if (provinceResponse.status !== 200 || provinces.length !== 77) {
  throw new Error(`Expected 77 provinces, received ${provinces.length || 0}`);
}

const results = {
  baseUrl,
  provinceCount: provinces.length,
  regionCount: new Set(provinces.map((province) => province.region)).size,
  cacheControl: provinceResponse.headers.get("cache-control"),
  endpoints: {
    health: await benchmark("/api/health"),
    provinces: await benchmark("/api/provinces"),
    reports: await benchmark("/api/reports"),
  },
};

const slowEndpoint = Object.entries(results.endpoints).find(([, metrics]) => metrics.p95Ms > 1500);
if (slowEndpoint) throw new Error(`${slowEndpoint[0]} p95 exceeded 1500 ms`);
console.log(JSON.stringify(results, null, 2));
