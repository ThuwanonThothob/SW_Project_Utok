export function analyzeIncidentClient({
  description = "",
  level = "10–30 ซม.",
  province = "",
  urgent = false,
  provinceScore = 50,
} = {}) {
  const text = `${description} ${level} ${province}`.toLowerCase();
  const tags = [];
  let score = 20;

  if (level.includes("มากกว่า 100") || level.includes("> 100")) {
    score += 34;
    tags.push("น้ำลึกเกิน 100 ซม.");
  } else if (level.includes("50–100")) {
    score += 24;
    tags.push("น้ำสูง 50–100 ซม.");
  } else if (level.includes("30–50")) {
    score += 15;
    tags.push("น้ำท่วมขัง 30–50 ซม.");
  } else {
    score += 8;
  }

  if (urgent) {
    score += 18;
    tags.push("ร้องขอความช่วยเหลือด่วน");
  }

  const rules = [
    {
      pattern: /ผู้สูงอายุ|คนแก่|ผู้ป่วยติดเตียง|ผู้ป่วย|เด็กเล็ก|เด็ก|คนท้อง|พิการ/,
      weight: 22,
      tag: "กลุ่มเปราะบาง/ผู้ป่วยติดเตียง",
    },
    {
      pattern: /ไฟรั่ว|ไฟดูด|เสาไฟ|หม้อแปลง|กระแสไฟ/,
      weight: 20,
      tag: "อันตรายกระแสไฟฟ้ารั่ว",
    },
    {
      pattern: /มิดหลังคา|ชั้นสอง|ชั้น 2|ท่วมถึงอก|ท่วมถึงคอ|ติดอยู่ในบ้าน|ออกไม่ได้/,
      weight: 20,
      tag: "ติดค้างในพื้นที่/น้ำท่วมสูง",
    },
    {
      pattern: /น้ำเชี่ยว|น้ำป่า|ดินถล่ม|ถนนขาด|สะพานขาด|พนังกั้นน้ำแตก/,
      weight: 18,
      tag: "กระแสน้ำเชี่ยว/เส้นทางถูกตัดขาด",
    },
    {
      pattern: /ขาดอาหาร|ขาดน้ำ|ไม่มีน้ำดื่ม|ยารักษาโรค|แบตหมด/,
      weight: 12,
      tag: "ต้องการเสบียง/เวชภัณฑ์",
    },
    {
      pattern: /รถเล็กผ่านไม่ได้|น้ำเข้าบ้าน|ท่วมถนน|จราจรติดขัด/,
      weight: 8,
      tag: "กระทบการสัญจร/ที่พักอาศัย",
    },
  ];

  for (const rule of rules) {
    if (rule.pattern.test(text)) {
      score += rule.weight;
      if (!tags.includes(rule.tag)) tags.push(rule.tag);
    }
  }

  score += Math.round((Number(provinceScore) || 50) * 0.14);
  const finalScore = Math.max(15, Math.min(99, score));

  let priority = "normal";
  let label = "ติดตามตามลำดับ (P4)";
  let recommendation = "บันทึกพิกัดในแผนที่เฝ้าระวังและแจ้งเตือนประชาชนหลีกเลี่ยงเส้นทางน้ำท่วมขัง";

  if (finalScore >= 82) {
    priority = "critical";
    label = "วิกฤตเร่งด่วนสูงสุด (P1)";
    recommendation =
      "ส่งชุดกู้ภัยทางน้ำและเรือท้องแบนเข้าพื้นที่ทันที ประสานการไฟฟ้าตัดกระแสไฟและเตรียมอพยพกลุ่มเปราะบาง";
  } else if (finalScore >= 65) {
    priority = "high";
    label = "เร่งด่วนสูง (P2)";
    recommendation = "จัดส่งเจ้าหน้าที่ ปภ./กู้ภัยเข้าตรวจสอบภายใน 30 นาที พร้อมเตรียมกระสอบทรายและรถยกสูง";
  } else if (finalScore >= 45) {
    priority = "moderate";
    label = "เฝ้าระวังใกล้ชิด (P3)";
    recommendation = "ประสานเทศบาลเดินเครื่องสูบน้ำและแจ้งเตือนประชาชนยกสิ่งของขึ้นที่สูง";
  }

  if (!tags.length) {
    tags.push("รายงานสถานการณ์น้ำท่วมทั่วไป");
  }

  return {
    score: finalScore,
    priority,
    label,
    tags,
    recommendation,
    model: "WareeGuard-AI-Triage-v2",
  };
}
