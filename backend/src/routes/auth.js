import { Router } from "express";
import bcrypt from "bcryptjs";
import { createAuthority, createCitizen, findUserByEmail, findUserById, listReportsByUser, updateCitizenProfile } from "../data/repository.js";
import { requireAuth, requireCitizen, signAuthToken } from "../middleware/auth.js";
import { sanitizeText } from "../utils/sanitize.js";

const router = Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function getAllowedAuthorityCodes() {
  return ["1784", "SWU-CPE-2026", "THAI-FLOOD-AUTH", process.env.AUTHORITY_INVITE_CODE].filter(Boolean);
}

export function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    agency: user.agency || "",
    phone: user.phone || "",
    notifyEnabled: user.notifyEnabled ?? true,
    homeProvince: user.homeProvince || "",
    homeDistrict: user.homeDistrict || "",
    lat: user.lat ?? null,
    lng: user.lng ?? null,
  };
}

function authResponse(user) {
  const safeUser = publicUser(user);
  return { token: signAuthToken({ sub: user.id, email: user.email, name: user.name, role: user.role }), user: safeUser };
}

export async function registerUserHandler(req, res, next) {
  try {
    const name = sanitizeText(req.body.name, 150);
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const requestedRole = req.body.role === "authority" ? "authority" : "citizen";

    if (name.length < 2 || !emailPattern.test(email) || password.length < 8) {
      return res.status(400).json({ message: "กรุณากรอกชื่อ อีเมล และรหัสผ่านอย่างน้อย 8 ตัวอักษร" });
    }

    if (requestedRole === "authority") {
      const code = String(req.body.authorityCode || "").trim();
      const allowedCodes = getAllowedAuthorityCodes();
      if (!code || !allowedCodes.includes(code)) {
        return res.status(403).json({ message: "รหัสยืนยันเจ้าหน้าที่ไม่ถูกต้อง (ใช้รหัส 1784 หรือ SWU-CPE-2026)" });
      }
    }

    if (await findUserByEmail(email)) return res.status(409).json({ message: "อีเมลนี้เป็นสมาชิกอยู่แล้ว" });
    const password_hash = await bcrypt.hash(password, 12);

    const commonPayload = {
      name,
      email,
      password_hash,
      phone: sanitizeText(req.body.phone, 50),
      notifyEnabled: req.body.notifyEnabled === undefined ? true : Boolean(req.body.notifyEnabled),
      homeProvince: sanitizeText(req.body.homeProvince, 100),
      homeDistrict: sanitizeText(req.body.homeDistrict, 150),
      lat: req.body.lat === "" || req.body.lat == null ? null : Number(req.body.lat),
      lng: req.body.lng === "" || req.body.lng == null ? null : Number(req.body.lng),
    };

    const user =
      requestedRole === "authority"
        ? await createAuthority({
            ...commonPayload,
            agency: sanitizeText(req.body.agency || "ศูนย์ป้องกันและบรรเทาสาธารณภัย", 150),
          })
        : await createCitizen({
            ...commonPayload,
            agency: "",
          });

    res.status(201).json(authResponse(user));
  } catch (error) {
    if (error.code === "23505") return res.status(409).json({ message: "อีเมลนี้เป็นสมาชิกอยู่แล้ว" });
    if (next) return next(error);
    throw error;
  }
}

router.post("/register", registerUserHandler);

router.post("/login", async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const user = await findUserByEmail(email);
    const valid = user && await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    res.json(authResponse(user));
  } catch (error) { next(error); }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await findUserById(req.user.sub);
    if (!user) return res.status(404).json({ message: "ไม่พบบัญชีผู้ใช้" });
    res.json(publicUser(user));
  } catch (error) { next(error); }
});

router.patch("/profile", requireAuth, async (req, res, next) => {
  try {
    const user = await updateCitizenProfile(req.user.sub, {
      name: sanitizeText(req.body.name || req.user.name, 150),
      homeProvince: req.body.homeProvince !== undefined ? sanitizeText(req.body.homeProvince, 100) : undefined,
      homeDistrict: req.body.homeDistrict !== undefined ? sanitizeText(req.body.homeDistrict, 150) : undefined,
      phone: req.body.phone !== undefined ? sanitizeText(req.body.phone, 50) : undefined,
      agency: req.body.agency !== undefined ? sanitizeText(req.body.agency, 150) : undefined,
      notifyEnabled: req.body.notifyEnabled !== undefined ? Boolean(req.body.notifyEnabled) : undefined,
      lat: req.body.lat === undefined ? undefined : (req.body.lat === "" || req.body.lat == null ? null : Number(req.body.lat)),
      lng: req.body.lng === undefined ? undefined : (req.body.lng === "" || req.body.lng == null ? null : Number(req.body.lng)),
    });
    if (!user) return res.status(404).json({ message: "ไม่พบบัญชีผู้ใช้" });
    res.json(publicUser(user));
  } catch (error) { next(error); }
});

router.get("/my-reports", requireCitizen, async (req, res, next) => {
  try { res.json(await listReportsByUser(req.user.sub)); }
  catch (error) { next(error); }
});

export default router;
