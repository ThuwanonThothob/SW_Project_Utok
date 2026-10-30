import { Router } from "express";
import rateLimit from "express-rate-limit";
import { listProvinces } from "../data/repository.js";
import { analyzeIncidentTriage } from "../services/aiTriageService.js";
import { getFloodNews } from "../services/newsAgentService.js";
import { fetchPointWeatherAndFlood } from "../services/weatherService.js";
import { publishEvent } from "../services/eventBus.js";

const router = Router();

const aiLimiter = rateLimit({
  windowMs: 5 * 60_000,
  limit: 60,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "เรียกใช้งานระบบ AI ถี่เกินไป กรุณารอสักครู่" },
});

router.post("/ai/triage", aiLimiter, async (req, res, next) => {
  try {
    const body = req.body || {};
    let provinceRiskScore = body.provinceRiskScore;
    if (provinceRiskScore == null && body.province) {
      const provinces = await listProvinces();
      const matched = provinces.find((item) => item.name === body.province);
      if (matched) provinceRiskScore = matched.score;
    }
    const aiTriage = analyzeIncidentTriage({
      description: body.description || "",
      level: body.level || "",
      province: body.province || "",
      urgent: body.urgent === true || body.urgent === "true",
      provinceRiskScore: provinceRiskScore ?? 50,
    });
    res.json({ aiTriage });
  } catch (error) {
    next(error);
  }
});

router.get("/weather/point", async (req, res, next) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ message: "กรุณาระบุพิกัด lat และ lng ที่ถูกต้อง" });
    }
    const pointData = await fetchPointWeatherAndFlood({ lat, lng });
    res.json(pointData);
  } catch (error) {
    next(error);
  }
});

router.get("/news", async (_req, res, next) => {
  try {
    const newsPayload = await getFloodNews({ forceRefresh: false });
    res.json(newsPayload);
  } catch (error) {
    next(error);
  }
});

router.post("/news/refresh", aiLimiter, async (_req, res, next) => {
  try {
    const newsPayload = await getFloodNews({ forceRefresh: true });
    publishEvent("news.updated", newsPayload);
    res.json(newsPayload);
  } catch (error) {
    next(error);
  }
});

export default router;
