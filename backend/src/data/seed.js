import { provinceCatalog } from "./provinceCatalog.js";

export const seedProvinces = provinceCatalog.map((province) => ({
  ...province,
  score: 0,
  rain: 0,
  river: 0,
  elevation: 0,
  affected: 0,
  risk: "low",
  dataSource: "real-time-open-meteo",
  liveWeatherConnected: false,
  updatedAt: new Date().toISOString(),
}));

export const seedReports = [];

export const seedBroadcasts = [];
