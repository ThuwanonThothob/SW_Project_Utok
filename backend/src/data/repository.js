import { randomUUID } from "node:crypto";
import path from "node:path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import { pool } from "../config/database.js";
import { seedBroadcasts, seedProvinces, seedReports } from "./seed.js";
import { analyzeIncidentTriage } from "../services/aiTriageService.js";
import { syncProvincesWithLiveWeather } from "../services/weatherService.js";

const clone = (value) => JSON.parse(JSON.stringify(value));
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const runtimeStorePath = path.resolve(currentDirectory, "../../data/runtime-store.json");
const isTestRun =
  process.env.NODE_ENV === "test" ||
  process.execArgv.includes("--test") ||
  process.argv.some((arg) => arg.includes(".test."));

const LEGACY_FAKE_REPORT_IDS = new Set(["FR-1028", "FR-1027", "FR-1026", "FR-1025", "FR-1024", "FR-1023"]);
const LEGACY_FAKE_BROADCAST_IDS = new Set(["BA-203", "BA-202"]);

const defaultUsers = [
  {
    id: "memory-admin",
    name: "ศูนย์บัญชาการกลาง",
    email: "admin@flood.go.th",
    password_hash: bcrypt.hashSync("admin123", 10),
    role: "authority",
    agency: "กรมป้องกันและบรรเทาสาธารณภัย (ปภ.)",
    phone: "1784",
    notifyEnabled: true,
    homeProvince: "กรุงเทพมหานคร",
    homeDistrict: "เขตดุสิต",
    lat: 13.7768,
    lng: 100.5206,
  },
  {
    id: "memory-citizen",
    name: "สมชาย ใจดี",
    email: "citizen@example.com",
    password_hash: bcrypt.hashSync("citizen123", 10),
    role: "citizen",
    agency: "",
    phone: "081-234-5678",
    notifyEnabled: true,
    homeProvince: "กรุงเทพมหานคร",
    homeDistrict: "เขตดุสิต",
    lat: 13.7768,
    lng: 100.5206,
  },
];

function mergeProvincesWithSeed(savedProvinces, realReports = []) {
  const reportCounts = new Map();
  for (const r of realReports) {
    if (r?.province) {
      reportCounts.set(r.province, (reportCounts.get(r.province) || 0) + 1);
    }
  }
  if (!Array.isArray(savedProvinces) || savedProvinces.length === 0) {
    return clone(seedProvinces).map((item) => ({
      ...item,
      affected: reportCounts.get(item.name) || 0,
    }));
  }
  const byId = new Map(savedProvinces.map((item) => [item.id, item]));
  return seedProvinces.map((seedItem) => {
    const saved = byId.get(seedItem.id);
    const affected = reportCounts.get(seedItem.name) || 0;
    const isRealSource =
      saved &&
      (saved.dataSource === "Open-Meteo Real-Time API" || saved.dataSource === "manual-authority-update");
    if (isRealSource) {
      return {
        ...clone(seedItem),
        ...clone(saved),
        affected,
      };
    }
    return {
      ...clone(seedItem),
      affected,
    };
  });
}

function mergeUsersWithDefaults(savedUsers) {
  if (!Array.isArray(savedUsers) || savedUsers.length === 0) {
    return clone(defaultUsers);
  }
  const merged = clone(savedUsers).map((user) => ({
    agency: "",
    phone: "",
    notifyEnabled: true,
    homeProvince: "",
    homeDistrict: "",
    lat: null,
    lng: null,
    ...user,
  }));
  for (const def of defaultUsers) {
    if (!merged.some((u) => u.email.toLowerCase() === def.email.toLowerCase())) {
      merged.unshift(clone(def));
    }
  }
  return merged;
}

function loadMemoryStore() {
  if (isTestRun) {
    return {
      provinces: clone(seedProvinces),
      reports: clone(seedReports),
      broadcasts: clone(seedBroadcasts),
      users: clone(defaultUsers),
    };
  }
  try {
    if (existsSync(runtimeStorePath)) {
      const parsed = JSON.parse(readFileSync(runtimeStorePath, "utf8"));
      const realReports = Array.isArray(parsed.reports)
        ? parsed.reports.filter((r) => r && !LEGACY_FAKE_REPORT_IDS.has(r.id))
        : [];
      const realBroadcasts = Array.isArray(parsed.broadcasts)
        ? parsed.broadcasts.filter((b) => b && !LEGACY_FAKE_BROADCAST_IDS.has(b.id))
        : [];
      return {
        provinces: mergeProvincesWithSeed(parsed.provinces, realReports),
        reports: realReports,
        broadcasts: realBroadcasts,
        users: mergeUsersWithDefaults(parsed.users),
      };
    }
  } catch (error) {
    console.warn("Unable to read runtime-store.json, falling back to baseline data:", error.message);
  }
  return {
    provinces: clone(seedProvinces),
    reports: [],
    broadcasts: [],
    users: clone(defaultUsers),
  };
}

const memory = loadMemoryStore();

function saveMemoryStore() {
  if (isTestRun || pool) return;
  try {
    mkdirSync(path.dirname(runtimeStorePath), { recursive: true });
    writeFileSync(runtimeStorePath, JSON.stringify(memory, null, 2), "utf8");
  } catch (error) {
    console.warn("Unable to persist runtime-store.json:", error.message);
  }
}

if (!isTestRun && !pool) {
  saveMemoryStore();
}

function provinceFromRow(row) {
  return {
    id: row.id,
    name: row.province,
    district: row.district,
    region: row.region,
    lat: Number(row.lat),
    lng: Number(row.lng),
    risk: row.risk_level,
    score: Number(row.risk_score),
    rain: Number(row.rainfall_mm),
    river: Number(row.river_distance_km),
    elevation: Number(row.elevation_m),
    affected: Number(row.affected_reports),
    updatedAt: row.updated_at,
  };
}

function enrichReportWithTriage(report) {
  if (!report) return null;
  const matchedProvince =
    memory.provinces.find((item) => item.name === report.province) ||
    seedProvinces.find((item) => item.name === report.province);
  const provinceRiskScore = matchedProvince ? Number(matchedProvince.score) : 50;
  const description = report.description ?? "";
  const photo = report.photo ?? "";
  const aiTriage =
    report.aiTriage ||
    analyzeIncidentTriage({
      description,
      level: report.level,
      province: report.province,
      urgent: report.urgent,
      provinceRiskScore,
    });
  return {
    ...report,
    description,
    photo,
    aiTriage,
  };
}

function reportFromRow(row) {
  return enrichReportWithTriage({
    id: row.public_id,
    province: row.province,
    district: row.district,
    reporter: row.reporter_name,
    level: row.water_level,
    description: row.description || "",
    photo: row.photo_url || "",
    urgent: row.urgent_help,
    status: row.status,
    lat: Number(row.lat),
    lng: Number(row.lng),
    createdAt: row.created_at,
  });
}

function broadcastFromRow(row) {
  return {
    id: row.public_id,
    level: row.risk_level,
    province: row.target_province,
    headline: row.headline,
    advisory: row.advisory,
    createdAt: row.created_at,
  };
}

function userFromRow(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password_hash: row.password_hash,
    role: row.role,
    agency: row.agency || "",
    phone: row.phone || "",
    notifyEnabled: row.notify_enabled ?? true,
    homeProvince: row.home_province || "",
    homeDistrict: row.home_district || "",
    lat: row.lat == null ? null : Number(row.lat),
    lng: row.lng == null ? null : Number(row.lng),
  };
}

export async function listProvinces() {
  if (!pool) {
    await syncProvincesWithLiveWeather(memory.provinces);
    saveMemoryStore();
    return clone(memory.provinces);
  }
  const { rows } = await pool.query(`
    SELECT id, province, district, region, risk_level, risk_score, rainfall_mm,
      river_distance_km, elevation_m, affected_reports,
      updated_at, ST_Y(center::geometry) AS lat, ST_X(center::geometry) AS lng
    FROM risk_zones ORDER BY risk_score DESC
  `);
  return rows.map(provinceFromRow);
}

export async function updateProvinceRisk(id, risk, score) {
  if (!pool) {
    const province = memory.provinces.find((item) => item.id === id);
    if (!province) return null;
    province.risk = risk;
    province.score = score;
    province.dataSource = "manual-authority-update";
    province.updatedAt = new Date().toISOString();
    saveMemoryStore();
    return clone(province);
  }
  const { rows } = await pool.query(`
    UPDATE risk_zones SET risk_level = $2, risk_score = $3, updated_at = NOW()
    WHERE id = $1
    RETURNING id, province, district, region, risk_level, risk_score, rainfall_mm,
      river_distance_km, elevation_m, affected_reports,
      updated_at, ST_Y(center::geometry) AS lat, ST_X(center::geometry) AS lng
  `, [id, risk, score]);
  return rows[0] ? provinceFromRow(rows[0]) : null;
}

export async function listReports({ status, search, limit = 200 } = {}) {
  if (!pool) {
    return clone(
      memory.reports
        .filter(
          (report) =>
            (!status || status === "all" || report.status === status) &&
            (!search ||
              `${report.id} ${report.province} ${report.district} ${report.reporter} ${report.description || ""}`
                .toLowerCase()
                .includes(search.toLowerCase()))
        )
        .slice(0, limit)
        .map(enrichReportWithTriage)
    );
  }
  const conditions = [];
  const values = [];
  if (status && status !== "all") {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }
  if (search) {
    values.push(`%${search}%`);
    conditions.push(`(public_id ILIKE $${values.length} OR province ILIKE $${values.length} OR district ILIKE $${values.length} OR reporter_name ILIKE $${values.length})`);
  }
  values.push(limit);
  const limitParameter = `$${values.length}`;
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const { rows } = await pool.query(`
    SELECT public_id, reporter_name, province, district, water_level, description,
      photo_url, urgent_help, status, created_at,
      ST_Y(location::geometry) AS lat, ST_X(location::geometry) AS lng
    FROM flood_reports ${where} ORDER BY created_at DESC LIMIT ${limitParameter}
  `, values);
  return rows.map(reportFromRow);
}

export async function createReport(input) {
  const publicId = `FR-${Date.now().toString().slice(-7)}`;
  const baseReport = {
    id: publicId,
    province: input.province,
    district: input.district || "พิกัดที่รายงาน",
    reporter: input.reporter || "ผู้ใช้งานทั่วไป",
    reporterId: input.reporterId || null,
    level: input.level,
    description: input.description || "",
    photo: input.photo || "",
    urgent: input.urgent === true || input.urgent === "true",
    status: "pending",
    lat: Number(input.lat),
    lng: Number(input.lng),
    createdAt: new Date().toISOString(),
  };
  const report = enrichReportWithTriage(baseReport);
  if (!pool) {
    memory.reports.unshift(report);
    const province = memory.provinces.find((item) => item.name === report.province);
    if (province) {
      province.affected = memory.reports.filter(
        (r) => r.province === report.province && r.status !== "rejected" && r.status !== "resolved",
      ).length;
    }
    saveMemoryStore();
    return clone(report);
  }
  const { rows } = await pool.query(`
    INSERT INTO flood_reports
      (public_id, reporter_id, reporter_name, province, district, water_level, description, photo_url, urgent_help, status, location)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending',ST_SetSRID(ST_MakePoint($10,$11),4326)::geography)
    RETURNING public_id, reporter_name, province, district, water_level, description,
      photo_url, urgent_help, status, created_at,
      ST_Y(location::geometry) AS lat, ST_X(location::geometry) AS lng
  `, [publicId, report.reporterId, report.reporter, report.province, report.district, report.level, report.description, report.photo || null, report.urgent, report.lng, report.lat]);
  await pool.query("UPDATE risk_zones SET affected_reports = affected_reports + 1 WHERE province = $1", [report.province]);
  return reportFromRow(rows[0]);
}

export async function updateReportStatus(publicId, status) {
  if (!pool) {
    const report = memory.reports.find((item) => item.id === publicId);
    if (!report) return null;
    report.status = status;
    Object.assign(report, enrichReportWithTriage(report));
    const province = memory.provinces.find((item) => item.name === report.province);
    if (province) {
      province.affected = memory.reports.filter(
        (r) => r.province === report.province && r.status !== "rejected" && r.status !== "resolved",
      ).length;
    }
    saveMemoryStore();
    return clone(report);
  }
  const { rows } = await pool.query(`
    UPDATE flood_reports SET status = $2, updated_at = NOW() WHERE public_id = $1
    RETURNING public_id, reporter_name, province, district, water_level, description,
      photo_url, urgent_help, status, created_at,
      ST_Y(location::geometry) AS lat, ST_X(location::geometry) AS lng
  `, [publicId, status]);
  if (rows[0]) {
    const updated = reportFromRow(rows[0]);
    const countRes = await pool.query(
      "SELECT COUNT(*)::int AS count FROM flood_reports WHERE province = $1 AND status NOT IN ('rejected', 'resolved')",
      [updated.province],
    );
    await pool.query("UPDATE risk_zones SET affected_reports = $1 WHERE province = $2", [
      countRes.rows[0]?.count || 0,
      updated.province,
    ]);
    return updated;
  }
  return null;
}

export async function deleteReport(publicId, requester = null) {
  if (!pool) {
    const index = memory.reports.findIndex((item) => item.id === publicId);
    if (index === -1) return null;
    const target = memory.reports[index];
    if (requester && requester.role !== "authority" && target.reporterId !== requester.sub) {
      const err = new Error("ไม่มีสิทธิ์ลบรายงานนี้");
      err.status = 403;
      throw err;
    }
    const [removed] = memory.reports.splice(index, 1);
    const province = memory.provinces.find((item) => item.name === removed.province);
    if (province) {
      province.affected = memory.reports.filter(
        (r) => r.province === removed.province && r.status !== "rejected" && r.status !== "resolved",
      ).length;
    }
    saveMemoryStore();
    return clone(removed);
  }
  const check = await pool.query("SELECT public_id, reporter_id, province FROM flood_reports WHERE public_id = $1", [publicId]);
  if (!check.rows.length) return null;
  const existing = check.rows[0];
  if (requester && requester.role !== "authority" && existing.reporter_id !== requester.sub) {
    const err = new Error("ไม่มีสิทธิ์ลบรายงานนี้");
    err.status = 403;
    throw err;
  }
  await pool.query("DELETE FROM flood_reports WHERE public_id = $1", [publicId]);
  const countRes = await pool.query(
    "SELECT COUNT(*)::int AS count FROM flood_reports WHERE province = $1 AND status NOT IN ('rejected', 'resolved')",
    [existing.province],
  );
  await pool.query("UPDATE risk_zones SET affected_reports = $1 WHERE province = $2", [
    countRes.rows[0]?.count || 0,
    existing.province,
  ]);
  return { id: publicId, province: existing.province };
}

export async function listBroadcasts() {
  if (!pool) return clone(memory.broadcasts.slice(0, 50));
  const { rows } = await pool.query(`
    SELECT public_id, risk_level, target_province, headline, advisory, created_at
    FROM broadcasts ORDER BY created_at DESC LIMIT 50
  `);
  return rows.map(broadcastFromRow);
}

export async function createBroadcast(input, userId = null) {
  const publicId = `BA-${Date.now().toString().slice(-7)}`;
  const broadcast = {
    id: publicId,
    level: input.level,
    province: input.province,
    headline: input.headline,
    advisory: input.advisory,
    createdAt: new Date().toISOString(),
  };
  if (!pool) {
    memory.broadcasts.unshift(broadcast);
    saveMemoryStore();
    return clone(broadcast);
  }
  const { rows } = await pool.query(`
    INSERT INTO broadcasts (public_id, created_by, risk_level, target_province, headline, advisory)
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING public_id, risk_level, target_province, headline, advisory, created_at
  `, [publicId, userId, broadcast.level, broadcast.province, broadcast.headline, broadcast.advisory]);
  return broadcastFromRow(rows[0]);
}

export async function findUserByEmail(email) {
  if (!pool) return clone(memory.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null);
  const { rows } = await pool.query(`
    SELECT users.id, users.name, users.email, users.password_hash, roles.name AS role,
      users.home_province, users.home_district,
      ST_Y(users.home_location::geometry) AS lat, ST_X(users.home_location::geometry) AS lng
    FROM users JOIN roles ON roles.id = users.role_id
    WHERE LOWER(users.email) = LOWER($1)
  `, [email]);
  return rows[0] ? userFromRow(rows[0]) : null;
}

export async function findUserById(id) {
  if (!pool) return clone(memory.users.find((user) => user.id === id) || null);
  const { rows } = await pool.query(`
    SELECT users.id, users.name, users.email, users.password_hash, roles.name AS role,
      users.home_province, users.home_district,
      ST_Y(users.home_location::geometry) AS lat, ST_X(users.home_location::geometry) AS lng
    FROM users JOIN roles ON roles.id = users.role_id WHERE users.id = $1
  `, [id]);
  return rows[0] ? userFromRow(rows[0]) : null;
}

export async function createUser(input) {
  const role = input.role === "authority" ? "authority" : "citizen";
  if (!pool) {
    const user = {
      id: randomUUID(),
      ...input,
      role,
      agency: input.agency ?? (role === "authority" ? "ศูนย์ป้องกันและบรรเทาสาธารณภัย" : ""),
      phone: input.phone ?? "",
      notifyEnabled: input.notifyEnabled ?? true,
      homeProvince: input.homeProvince ?? "",
      homeDistrict: input.homeDistrict ?? "",
      lat: input.lat ?? null,
      lng: input.lng ?? null,
    };
    memory.users.push(user);
    saveMemoryStore();
    return clone(user);
  }
  const { rows } = await pool.query(`
    INSERT INTO users (name, email, password_hash, role_id, home_province, home_district, home_location)
    SELECT $1,$2,$3,roles.id,$4,$5,
      CASE WHEN $6::double precision IS NULL OR $7::double precision IS NULL THEN NULL
      ELSE ST_SetSRID(ST_MakePoint($7,$6),4326)::geography END
    FROM roles WHERE roles.name = $8
    RETURNING id, name, email, password_hash, $8::text AS role, home_province, home_district,
      ST_Y(home_location::geometry) AS lat, ST_X(home_location::geometry) AS lng
  `, [input.name, input.email, input.password_hash, input.homeProvince || null, input.homeDistrict || null, input.lat ?? null, input.lng ?? null, role]);
  return {
    ...userFromRow(rows[0]),
    agency: input.agency ?? "",
    phone: input.phone ?? "",
    notifyEnabled: input.notifyEnabled ?? true,
  };
}

export async function createCitizen(input) {
  return createUser({ ...input, role: input.role || "citizen" });
}

export async function createAuthority(input) {
  return createUser({ ...input, role: "authority" });
}

export async function updateCitizenProfile(id, input) {
  if (!pool) {
    const user = memory.users.find((item) => item.id === id);
    if (!user) return null;
    Object.assign(user, {
      name: input.name !== undefined ? input.name : user.name,
      homeProvince: input.homeProvince !== undefined ? input.homeProvince : (user.homeProvince || ""),
      homeDistrict: input.homeDistrict !== undefined ? input.homeDistrict : (user.homeDistrict || ""),
      phone: input.phone !== undefined ? input.phone : (user.phone || ""),
      agency: input.agency !== undefined ? input.agency : (user.agency || ""),
      notifyEnabled: input.notifyEnabled !== undefined ? Boolean(input.notifyEnabled) : (user.notifyEnabled ?? true),
      lat: input.lat !== undefined ? (input.lat ?? null) : user.lat,
      lng: input.lng !== undefined ? (input.lng ?? null) : user.lng,
    });
    saveMemoryStore();
    return clone(user);
  }
  const { rows } = await pool.query(`
    UPDATE users SET name=$2, home_province=$3, home_district=$4,
      home_location=CASE WHEN $5::double precision IS NULL OR $6::double precision IS NULL THEN NULL
      ELSE ST_SetSRID(ST_MakePoint($6,$5),4326)::geography END
    WHERE id=$1
    RETURNING id,name,email,password_hash,(SELECT name FROM roles WHERE roles.id = users.role_id) AS role,home_province,home_district,
      ST_Y(home_location::geometry) AS lat,ST_X(home_location::geometry) AS lng
  `, [id, input.name, input.homeProvince || null, input.homeDistrict || null, input.lat ?? null, input.lng ?? null]);
  if (!rows[0]) return null;
  return {
    ...userFromRow(rows[0]),
    phone: input.phone ?? "",
    agency: input.agency ?? "",
    notifyEnabled: input.notifyEnabled ?? true,
  };
}

export async function listReportsByUser(userId) {
  if (!pool) return clone(memory.reports.filter((report) => report.reporterId === userId).map(enrichReportWithTriage));
  const { rows } = await pool.query(`
    SELECT public_id,reporter_name,province,district,water_level,description,photo_url,
      urgent_help,status,created_at,ST_Y(location::geometry) AS lat,ST_X(location::geometry) AS lng
    FROM flood_reports WHERE reporter_id=$1 ORDER BY created_at DESC LIMIT 100
  `, [userId]);
  return rows.map(reportFromRow);
}
