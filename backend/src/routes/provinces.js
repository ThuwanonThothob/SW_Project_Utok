import { Router } from "express";
import { listProvinces, updateProvinceRisk } from "../data/repository.js";
import { requireAuthority } from "../middleware/auth.js";
import { publishEvent } from "../services/eventBus.js";
import { normalizeRiskLevel } from "../services/riskService.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    res.set("Cache-Control", "public, max-age=30, stale-while-revalidate=120");
    res.json(await listProvinces());
  } catch (error) { next(error); }
});

router.patch("/:id/risk", requireAuthority, async (req, res, next) => {
  try {
    const score = Math.max(0, Math.min(100, Number(req.body.score)));
    if (!Number.isFinite(score)) return res.status(400).json({ message: "คะแนนความเสี่ยงไม่ถูกต้อง" });
    const risk = req.body.risk || normalizeRiskLevel(score);
    if (!["high", "medium", "low"].includes(risk)) return res.status(400).json({ message: "ระดับความเสี่ยงไม่ถูกต้อง" });
    const province = await updateProvinceRisk(req.params.id, risk, score);
    if (!province) return res.status(404).json({ message: "ไม่พบจังหวัด" });
    publishEvent("province.updated", province);
    res.json(province);
  } catch (error) { next(error); }
});

export default router;
