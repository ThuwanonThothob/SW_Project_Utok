import os from "node:os";
import path from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.js";
import broadcastRoutes from "./routes/broadcasts.js";
import eventRoutes from "./routes/events.js";
import intelligenceRoutes from "./routes/intelligence.js";
import provinceRoutes from "./routes/provinces.js";
import reportRoutes from "./routes/reports.js";
import { databaseStatus } from "./config/database.js";

const app = express();
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const uploadDirectory = path.resolve(currentDirectory, "../uploads");
const webDirectory = path.resolve(currentDirectory, "../../frontend/dist");

app.disable("x-powered-by");
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    noSniff: true,
    xssFilter: true,
  }),
);
app.use(cors({ origin: true, credentials: false }));
app.use(compression({ filter: (req, res) => req.path !== "/api/events" && compression.filter(req, res) }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Static uploads with no-sniff security header
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; sandbox");
    next();
  },
  express.static(uploadDirectory, { maxAge: "1h" }),
);

const generalApiLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 600,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "คำขอใช้งาน API ถี่เกินไป กรุณารอสักครู่" },
});
app.use("/api", generalApiLimiter);

app.get("/api/health", async (_req, res) => {
  const database = await databaseStatus();
  res.status(database.connected ? 200 : 503).json({ status: database.connected ? "ok" : "degraded", database, timestamp: new Date().toISOString() });
});

app.get("/api/network-info", (_req, res) => {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const entries of Object.values(interfaces)) {
    for (const entry of entries || []) {
      if ((entry.family === "IPv4" || entry.family === 4) && !entry.internal && entry.address) {
        ips.push(entry.address);
      }
    }
  }
  const backendPort = Number(process.env.PORT || 4000);
  const frontendPort = 5173;
  res.json({
    ips,
    lanAddresses: ips,
    backendPort,
    frontendPort,
    port: frontendPort,
    lanUrls: ips.map((ip) => `http://${ip}:${frontendPort}`),
  });
});

app.use("/api/auth", rateLimit({ windowMs: 15 * 60_000, limit: 30, standardHeaders: "draft-7", legacyHeaders: false }), authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/provinces", provinceRoutes);
app.use("/api/broadcasts", broadcastRoutes);
app.use("/api/events", eventRoutes);
app.use("/api", intelligenceRoutes);

if (existsSync(webDirectory)) {
  app.use(express.static(webDirectory, { maxAge: "1h" }));
  app.get("*", (req, res, next) => req.accepts("html") ? res.sendFile(path.join(webDirectory, "index.html")) : next());
}

app.use((req, res) => res.status(404).json({ message: `ไม่พบ endpoint ${req.method} ${req.originalUrl}` }));
app.use((error, _req, res, _next) => {
  console.error(error);
  if (error.code === "LIMIT_FILE_SIZE") return res.status(413).json({ message: "รูปภาพต้องมีขนาดไม่เกิน 5 MB" });
  if (error.code === "INVALID_FILE_TYPE") return res.status(400).json({ message: "อนุญาตเฉพาะไฟล์รูปภาพ (.jpg, .jpeg, .png, .webp, .gif, .heic)" });
  res.status(500).json({ message: "ระบบขัดข้องชั่วคราว", detail: process.env.NODE_ENV === "development" ? error.message : undefined });
});

export default app;
