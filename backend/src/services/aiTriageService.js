const WATER_LEVEL_WEIGHTS = [
  { match: ["มากกว่า 100", "> 100", "100 ซม"], points: 35, tag: "ระดับน้ำวิกฤต (>100 ซม.)" },
  { match: ["50–100", "50-100"], points: 25, tag: "ระดับน้ำสูง (50–100 ซม.)" },
  { match: ["30–50", "30-50"], points: 15, tag: "ระดับน้ำปานกลาง (30–50 ซม.)" },
  { match: ["10–30", "10-30"], points: 8, tag: "น้ำขัง/รอการระบาย (10–30 ซม.)" },
];

const KEYWORD_RULES = [
  {
    id: "hazard",
    points: 25,
    tag: "อันตรายต่อชีวิต/กระแสไฟ/น้ำเชี่ยว",
    keywords: ["ไฟรั่ว", "ไฟดูด", "เสาไฟ", "น้ำเชี่ยว", "มิดหลังคา", "ชั้นสอง", "ถนนขาด", "ดินถล่ม", "จมน้ำ", "พนังกั้นน้ำชำรุด"],
  },
  {
    id: "vulnerable",
    points: 22,
    tag: "กลุ่มเปราะบาง (ผู้สูงอายุ/ผู้ป่วย/เด็ก)",
    keywords: ["ผู้สูงอายุ", "คนแก่", "ผู้ป่วยติดเตียง", "ผู้ป่วย", "เด็ก", "ทารก", "คนท้อง", "พิการ"],
  },
  {
    id: "trapped",
    points: 15,
    tag: "ผู้ประสบภัยติดค้าง/ขาดแคลน",
    keywords: ["ติดอยู่ในบ้าน", "ออกไม่ได้", "ติดค้าง", "ขาดอาหาร", "ขาดน้ำ", "ขอความช่วยเหลือ", "รอการช่วยเหลือ"],
  },
  {
    id: "mobility",
    points: 10,
    tag: "กระทบการสัญจร/น้ำเข้าที่พัก",
    keywords: ["รถเล็กผ่านไม่ได้", "ไม่สามารถผ่านได้", "สัญจรไม่ได้", "ท่วมถนน", "เข้าบ้าน", "น้ำเข้าชุมชน"],
  },
];

const CRITICAL_LIFE_THREAT_TERMS = ["ไฟรั่ว", "ไฟดูด", "ผู้ป่วยติดเตียง", "จมน้ำ", "มิดหลังคา"];

export function analyzeIncidentTriage({
  description = "",
  level = "",
  province = "",
  urgent = false,
  provinceRiskScore = 50,
} = {}) {
  const cleanDesc = String(description || "").trim();
  const cleanLevel = String(level || "").trim();
  const isUrgent = urgent === true || urgent === "true";
  const normalizedProvScore = Number.isFinite(Number(provinceRiskScore)) ? Number(provinceRiskScore) : 50;

  let rawScore = 14 + Math.round(normalizedProvScore * 0.15);
  const tags = [];
  const matchedRuleIds = new Set();

  for (const item of WATER_LEVEL_WEIGHTS) {
    if (item.match.some((token) => cleanLevel.includes(token))) {
      rawScore += item.points;
      tags.push(item.tag);
      break;
    }
  }

  if (isUrgent) {
    rawScore += 20;
    tags.push("ร้องขอความช่วยเหลือเร่งด่วน (SOS)");
  }

  for (const rule of KEYWORD_RULES) {
    if (rule.keywords.some((kw) => cleanDesc.includes(kw))) {
      rawScore += rule.points;
      tags.push(rule.tag);
      matchedRuleIds.add(rule.id);
    }
  }

  if (
    CRITICAL_LIFE_THREAT_TERMS.some((term) => cleanDesc.includes(term)) ||
    (matchedRuleIds.has("hazard") && matchedRuleIds.has("vulnerable")) ||
    (matchedRuleIds.has("vulnerable") && isUrgent)
  ) {
    rawScore = Math.max(rawScore, 84);
  }

  const score = Math.min(99, Math.max(15, rawScore));

  let priority = "normal";
  let label = "ติดตามตามลำดับ (P4)";
  if (score >= 80) {
    priority = "critical";
    label = "วิกฤตเร่งด่วนสูงสุด (P1)";
  } else if (score >= 60) {
    priority = "high";
    label = "เร่งด่วนสูง (P2)";
  } else if (score >= 40) {
    priority = "moderate";
    label = "เฝ้าระวังใกล้ชิด (P3)";
  }

  if (tags.length === 0) {
    tags.push("รายงานสถานการณ์น้ำท่วมทั่วไป");
  }

  let recommendation = "ประสานองค์กรปกครองส่วนท้องถิ่นตรวจสอบจุดน้ำขังและเร่งระบายน้ำ";
  if (matchedRuleIds.has("hazard") && matchedRuleIds.has("vulnerable")) {
    recommendation =
      "แจ้งการไฟฟ้าตัดกระแสไฟทันที และจัดส่งเรือท้องแบนพร้อมทีมแพทย์ฉุกเฉินเคลื่อนย้ายผู้ป่วย/ผู้สูงอายุออกจากพื้นที่วิกฤตเป็นลำดับแรก";
  } else if (matchedRuleIds.has("hazard")) {
    recommendation = "แจ้งการไฟฟ้าตัดกระแสไฟทันที กั้นแนวเขตอันตราย และส่งชุดกู้ภัยทางน้ำเข้าพื้นที่";
  } else if (matchedRuleIds.has("vulnerable")) {
    recommendation = "จัดส่งเรือท้องแบนและทีมแพทย์ฉุกเฉินเคลื่อนย้ายผู้ป่วย/ผู้สูงอายุเป็นลำดับแรก";
  } else if (matchedRuleIds.has("trapped") || isUrgent) {
    recommendation = "ส่งชุดปฏิบัติการกู้ภัยและถุงยังชีพเข้าช่วยเหลือผู้ติดค้างภายใน 1–2 ชั่วโมง";
  } else if (matchedRuleIds.has("mobility") || score >= 40) {
    recommendation = "ติดตั้งป้ายเตือนเส้นทางน้ำท่วม จัดเจ้าหน้าที่อำนวยการจราจร และเดินเครื่องสูบน้ำเคลื่อนที่";
  }

  const confidence = Math.min(
    96,
    88 + Math.min(8, matchedRuleIds.size * 2 + (cleanLevel ? 2 : 0) + (cleanDesc.length > 20 ? 2 : 0))
  );

  return {
    score,
    priority,
    label,
    tags,
    recommendation,
    confidence,
    province: province || undefined,
    analyzedBy: "AI Incident Triage Agent v2.0",
  };
}
