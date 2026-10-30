import path from "node:path";
import { fileURLToPath } from "node:url";
import { Router } from "express";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { createReport, deleteReport, listReports, updateReportStatus } from "../data/repository.js";
import { requireAuth, requireAuthority } from "../middleware/auth.js";
import { publishEvent } from "../services/eventBus.js";
import { sanitizeFileName, sanitizeText } from "../utils/sanitize.js";

const router = Router();
const uploadDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../uploads");
const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".heic"]);

const reportPostLimiter = rateLimit({
  windowMs: 10 * 60_000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "คุณส่งรายงานถี่เกินไป กรุณารอสักครู่ก่อนส่งรายงานใหม่" },
});

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDirectory,
    filename: (_req, file, callback) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const safeName = sanitizeFileName(path.basename(file.originalname, ext));
      callback(null, `${Date.now()}-${safeName}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isImageMime = file.mimetype.startsWith("image/") && file.mimetype !== "image/svg+xml";
    if (isImageMime && allowedExtensions.has(ext)) {
      return callback(null, true);
    }
    const error = new Error("INVALID_FILE_TYPE");
    error.code = "INVALID_FILE_TYPE";
    callback(error);
  },
});

router.get("/", async (req, res, next) => {
  try {
    const limit = Math.max(1, Math.min(500, Number(req.query.limit) || 200));
    res.set("Cache-Control", "no-store");
    res.json(await listReports({ status: req.query.status, search: req.query.search, limit }));
  } catch (error) { next(error); }
});

router.post("/", requireAuth, reportPostLimiter, upload.single("photo"), async (req, res, next) => {
  try {
    const required = ["province", "level", "description", "lat", "lng"];
    if (required.some((key) => !String(req.body[key] ?? "").trim())) return res.status(400).json({ message: "ข้อมูลรายงานไม่ครบถ้วน" });
    const report = await createReport({
      ...req.body,
      province: sanitizeText(req.body.province, 100),
      district: sanitizeText(req.body.district, 150) || undefined,
      level: sanitizeText(req.body.level, 50),
      description: sanitizeText(req.body.description, 2000),
      reporterId: req.user.sub === "memory-admin" ? null : req.user.sub,
      reporter: sanitizeText(req.user.name, 150),
      photo: req.file ? `/uploads/${req.file.filename}` : (req.body.photoUrl || req.body.photo || ""),
    });
    publishEvent("report.created", report);
    res.status(201).json(report);
  } catch (error) { next(error); }
});

router.patch("/:id/status", requireAuthority, async (req, res, next) => {
  try {
    const allowed = ["pending", "verified", "resolved", "rejected"];
    if (!allowed.includes(req.body.status)) return res.status(400).json({ message: "สถานะไม่ถูกต้อง" });
    const report = await updateReportStatus(req.params.id, req.body.status);
    if (!report) return res.status(404).json({ message: "ไม่พบรายงาน" });
    publishEvent("report.updated", report);
    res.json(report);
  } catch (error) { next(error); }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const deleted = await deleteReport(req.params.id, req.user);
    if (!deleted) return res.status(404).json({ message: "ไม่พบรายงานที่ต้องการลบ" });
    publishEvent("report.deleted", { id: req.params.id, province: deleted.province });
    res.json({ message: "ลบรายงานสำเร็จ", id: req.params.id });
  } catch (error) {
    if (error.status === 403) return res.status(403).json({ message: error.message });
    next(error);
  }
});

export default router;
