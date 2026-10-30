import { Router } from "express";
import rateLimit from "express-rate-limit";
import { createBroadcast, listBroadcasts } from "../data/repository.js";
import { requireAuthority } from "../middleware/auth.js";
import { publishEvent } from "../services/eventBus.js";
import { sanitizeText } from "../utils/sanitize.js";

const router = Router();

const broadcastLimiter = rateLimit({
  windowMs: 10 * 60_000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "คุณสร้างประกาศเตือนภัยถี่เกินไป กรุณารอสักครู่" },
});

router.get("/", async (_req, res, next) => {
  try {
    res.set("Cache-Control", "public, max-age=10, stale-while-revalidate=30");
    res.json(await listBroadcasts());
  } catch (error) { next(error); }
});

router.post("/", requireAuthority, broadcastLimiter, async (req, res, next) => {
  try {
    const { level, province, headline, advisory } = req.body;
    if (!["warning", "red", "evacuation"].includes(level) || !province || !headline || !advisory) return res.status(400).json({ message: "ข้อมูลประกาศไม่ครบถ้วน" });
    const cleanPayload = {
      level,
      province: sanitizeText(province, 100),
      headline: sanitizeText(headline, 255),
      advisory: sanitizeText(advisory, 2000),
    };
    const broadcast = await createBroadcast(cleanPayload, req.user.sub === "memory-admin" ? null : req.user.sub);
    publishEvent("broadcast.created", broadcast);
    res.status(201).json(broadcast);
  } catch (error) { next(error); }
});

router.post("/test-notification", async (req, res, next) => {
  try {
    const {
      level = "warning",
      province = "กรุงเทพมหานคร",
      headline = "ทดสอบระบบแจ้งเตือนภัยน้ำท่วม (Test Alert)",
      advisory = "นี่คือการทดสอบส่งสัญญาณแจ้งเตือนแบบ Real-time ไปยังแอปพลิเคชันและเบราว์เซอร์",
      sender = "ระบบทดสอบการแจ้งเตือน วารีการ์ด (WareeGuard)",
    } = req.body || {};

    const payload = {
      id: `TEST-${Date.now().toString().slice(-7)}`,
      level: ["warning", "red", "evacuation"].includes(level) ? level : "warning",
      province: sanitizeText(province, 100) || "กรุงเทพมหานคร",
      headline: sanitizeText(headline, 255) || "ทดสอบระบบแจ้งเตือนภัยน้ำท่วม (Test Alert)",
      advisory: sanitizeText(advisory, 2000) || "นี่คือการทดสอบส่งสัญญาณแจ้งเตือนแบบ Real-time ไปยังแอปพลิเคชันและเบราว์เซอร์",
      sender: sanitizeText(sender, 150) || "ระบบทดสอบการแจ้งเตือน วารีการ์ด (WareeGuard)",
      isTest: true,
      createdAt: new Date().toISOString(),
    };

    publishEvent("notification.test", payload);
    res.status(201).json(payload);
  } catch (error) { next(error); }
});

export default router;
