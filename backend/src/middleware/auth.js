import jwt from "jsonwebtoken";

const secret = () => process.env.JWT_SECRET || "development-only-secret-change-before-production";

export function signAuthToken(payload) {
  return jwt.sign(payload, secret(), { algorithm: "HS256", expiresIn: "8h", issuer: "thaiflood-api" });
}

export function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ message: "กรุณาเข้าสู่ระบบสมาชิก" });
  try {
    const user = jwt.verify(token, secret(), { algorithms: ["HS256"], issuer: "thaiflood-api" });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Session หมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง" });
  }
}

export function requireAuthority(req, res, next) {
  return requireAuth(req, res, () => {
    if (req.user.role !== "authority") return res.status(403).json({ message: "สงวนสิทธิ์สำหรับเจ้าหน้าที่" });
    next();
  });
}

export function requireCitizen(req, res, next) {
  return requireAuth(req, res, () => {
    if (req.user.role !== "citizen") return res.status(403).json({ message: "สงวนสิทธิ์สำหรับสมาชิกประชาชน" });
    next();
  });
}
