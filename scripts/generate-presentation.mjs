import PptxGenJS from "pptxgenjs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.resolve(__dirname, "../UTOK_Presentation.pptx");
const logoPath = path.resolve(__dirname, "../frontend/public/swu-eng-logo.jpg");

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_16x9";
pptx.author = "ภาควิชาวิศวกรรมคอมพิวเตอร์ คณะวิศวกรรมศาสตร์ มหาวิทยาลัยศรีนครินทรวิโรฒ";
pptx.company = "CPE SWU - Software Engineering";
pptx.title = "UTOK (อุทก) - Software Engineering Presentation";
pptx.subject = "Thailand Flood Risk Assessment & Incident Reporting Platform";

// Color Palette
const C = {
  bg: "0F172A",          // Deep Slate Navy
  cardBg: "1E293B",      // Card Background
  cardBorder: "334155",  // Slate Border
  textWhite: "FFFFFF",
  textMuted: "94A3B8",
  textDim: "64748B",
  blue: "0284C7",        // Sky Blue Accent
  blueLight: "38BDF8",   // Light Sky Blue
  green: "10B981",       // Low Risk / Success
  amber: "F59E0B",       // Moderate Risk / Warning
  red: "EF4444",         // High Risk / Critical Alert
  purple: "8B5CF6",      // Agentic AI
};

const FONT_TH = "Calibri";

// Helper: Add consistent header to content slides
function addHeader(slide, title, category, slideNum) {
  // Category Pill
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 0.4,
    w: 2.4,
    h: 0.32,
    rectRadius: 0.16,
    fill: { color: C.cardBg },
    line: { color: C.blue, width: 1 },
  });
  slide.addText(category, {
    x: 0.8,
    y: 0.4,
    w: 2.4,
    h: 0.32,
    fontSize: 10,
    fontFace: FONT_TH,
    color: C.blueLight,
    bold: true,
    align: "center",
    valign: "middle",
  });

  // Main Slide Title
  slide.addText(title, {
    x: 0.8,
    y: 0.78,
    w: 8.0,
    h: 0.5,
    fontSize: 20,
    fontFace: FONT_TH,
    color: C.textWhite,
    bold: true,
    valign: "middle",
  });

  // Slide Number Pill
  slide.addText(`${slideNum} / 13`, {
    x: 8.4,
    y: 0.4,
    w: 0.8,
    h: 0.3,
    fontSize: 10,
    fontFace: FONT_TH,
    color: C.textDim,
    align: "right",
    valign: "middle",
  });

  // Top Accent Line
  slide.addShape(pptx.ShapeType.line, {
    x: 0.8,
    y: 1.35,
    w: 8.4,
    h: 0,
    line: { color: C.cardBorder, width: 1 },
  });
}

// -------------------------------------------------------------------------
// SLIDE 1: Cover Slide (Title & Project Logo)
// -------------------------------------------------------------------------
{
  const s1 = pptx.addSlide();
  s1.background = { color: C.bg };

  // Background decoration shapes
  s1.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 0.8,
    w: 8.4,
    h: 4.0,
    rectRadius: 0.25,
    fill: { color: C.cardBg },
    line: { color: C.cardBorder, width: 1.5 },
  });

  // Badge: Software Engineering Project
  s1.addShape(pptx.ShapeType.roundRect, {
    x: 1.2,
    y: 1.1,
    w: 4.2,
    h: 0.35,
    rectRadius: 0.17,
    fill: { color: "0B3B60" },
    line: { color: C.blueLight, width: 1 },
  });
  s1.addText("CPE SOFTWARE ENGINEERING PROJECT • SWU", {
    x: 1.2,
    y: 1.1,
    w: 4.2,
    h: 0.35,
    fontSize: 10,
    fontFace: FONT_TH,
    color: C.blueLight,
    bold: true,
    align: "center",
    valign: "middle",
  });

  // Main Project Name & Logo
  try {
    s1.addImage({ path: logoPath, x: 7.2, y: 1.1, w: 1.6, h: 1.6 });
  } catch (e) {}

  s1.addText("UTOK (อุทก)", {
    x: 1.2,
    y: 1.55,
    w: 5.8,
    h: 0.7,
    fontSize: 34,
    fontFace: FONT_TH,
    color: C.textWhite,
    bold: true,
    valign: "middle",
  });

  // Subtitle
  s1.addText("Thailand Flood Risk Assessment & Incident Reporting Platform", {
    x: 1.2,
    y: 2.25,
    w: 7.6,
    h: 0.4,
    fontSize: 15,
    fontFace: FONT_TH,
    color: C.blueLight,
    bold: true,
  });

  // Thai Description
  s1.addText("ระบบประเมินความเสี่ยง รายงานเหตุการณ์ และแจ้งเตือนภัยน้ำท่วมประเทศไทย 77 จังหวัด\nขับเคลื่อนด้วยสถาปัตยกรรม Multi-Agent AI Software Engineering & PostGIS Real-time", {
    x: 1.2,
    y: 2.7,
    w: 7.6,
    h: 0.6,
    fontSize: 12,
    fontFace: FONT_TH,
    color: C.textMuted,
  });

  // Bottom Info Box (Institution & Advisor)
  s1.addShape(pptx.ShapeType.roundRect, {
    x: 1.2,
    y: 3.45,
    w: 7.6,
    h: 1.05,
    rectRadius: 0.15,
    fill: { color: "131F33" },
    line: { color: C.cardBorder, width: 1 },
  });

  s1.addText("ภาควิชาวิศวกรรมคอมพิวเตอร์ คณะวิศวกรรมศาสตร์ มหาวิทยาลัยศรีนครินทรวิโรฒ (มศว)", {
    x: 1.4,
    y: 3.55,
    w: 7.2,
    h: 0.3,
    fontSize: 11,
    fontFace: FONT_TH,
    color: C.textWhite,
    bold: true,
  });

  s1.addText([
    { text: "อาจารย์ที่ปรึกษา: ", options: { bold: true, color: C.amber } },
    { text: "ผศ.วัชรชัย วิริยะสุทธิวงศ์   |   ", options: { color: C.textWhite } },
    { text: "คณะผู้จัดทำ: ", options: { bold: true, color: C.blueLight } },
    { text: "[ใส่ชื่อ-นามสกุล สมาชิกกลุ่มทุกคน ไม่ต้องมีคำนำหน้าและรหัสนิสิต]", options: { color: C.textMuted } }
  ], {
    x: 1.4,
    y: 3.85,
    w: 7.2,
    h: 0.5,
    fontSize: 10,
    fontFace: FONT_TH,
  });

  s1.addNotes(`บทพูดนำเสนอ (Slide 1):
"สวัสดีครับอาจารย์และเพื่อนๆ ทุกคน วันนี้กลุ่มของพวกเราขอเสนองานในรายวิชา Software Engineering โครงงาน UTOK (อุทก) — Thailand Flood Risk Assessment & Incident Reporting Platform หรือระบบประเมินความเสี่ยง คัดกรองเหตุการณ์ และแจ้งเตือนภัยน้ำท่วมประเทศไทย ครอบคลุมครบทั้ง 77 จังหวัด
โดยโครงงานนี้พัฒนายกระดับด้วยกระบวนการ Multi-Agent AI Software Engineering และระบบสารสนเทศภูมิศาสตร์ GIS แบบ Real-Time โดยมี ผศ.วัชรชัย วิริยะสุทธิวงศ์ เป็นอาจารย์ที่ปรึกษาครับ"`);
}

// -------------------------------------------------------------------------
// SLIDE 2: Pain Points (ปัญหาที่พบในปัจจุบัน)
// -------------------------------------------------------------------------
{
  const s2 = pptx.addSlide();
  s2.background = { color: C.bg };
  addHeader(s2, "Pain Points: ปัญหาความวิกฤตของการจัดการอุทกภัยในไทย", "ลำดับที่ 2 • PROBLEM STATEMENT", 2);

  const painPoints = [
    {
      num: "01",
      title: "ข้อมูลกระจัดกระจายและไม่เฉพาะเจาะจง",
      desc: "ประชาชนไม่ทราบระดับความเสี่ยงเฉพาะพื้นที่พักอาศัยของตนเองล่วงหน้า การเตือนภัยมักประกาศภาพรวมระดับลุ่มน้ำ ทำให้เตรียมตัวรับมือไม่ทันก่อนมวลน้ำหลาก",
      badge: "DATA FRAGMENTATION",
      color: C.amber
    },
    {
      num: "02",
      title: "การแจ้งเหตุขาดพิกัดแม่นยำ & ไร้ Real-time Tracking",
      desc: "การขอความช่วยเหลือผ่านโซเชียลมีเดียหรือโทรศัพท์ไม่มีการปักหมุดพิกัด GPS ขาดข้อมูลระดับน้ำจริง และประชาชนไม่สามารถติดตามสถานะการช่วยเหลือได้",
      badge: "LACK OF PRECISION & TRACKING",
      color: C.red
    },
    {
      num: "03",
      title: "ศูนย์สั่งการคัดกรองเหตุ (Triage) ล่าช้า",
      desc: "เจ้าหน้าที่กู้ภัยและศูนย์บัญชาการได้รับข้อมูลซ้ำซ้อนจากหลายทาง ขาดระบบ AI จัดลำดับความเร่งด่วนสำหรับผู้ป่วยติดเตียงและเด็ก ทำให้ส่งเรือและหน่วยแพทย์ล่าช้า",
      badge: "DELAYED RESCUE DISPATCH",
      color: C.blueLight
    }
  ];

  painPoints.forEach((p, idx) => {
    const cardX = 0.8 + idx * 2.85;
    s2.addShape(pptx.ShapeType.roundRect, {
      x: cardX,
      y: 1.6,
      w: 2.7,
      h: 3.5,
      rectRadius: 0.2,
      fill: { color: C.cardBg },
      line: { color: C.cardBorder, width: 1 },
    });

    // Number Accent
    s2.addText(p.num, {
      x: cardX + 0.2,
      y: 1.8,
      w: 2.3,
      h: 0.5,
      fontSize: 26,
      fontFace: FONT_TH,
      color: p.color,
      bold: true,
    });

    // Badge
    s2.addShape(pptx.ShapeType.roundRect, {
      x: cardX + 0.2,
      y: 2.35,
      w: 2.3,
      h: 0.26,
      rectRadius: 0.05,
      fill: { color: "131F33" },
      line: { color: p.color, width: 0.8 },
    });
    s2.addText(p.badge, {
      x: cardX + 0.2,
      y: 2.35,
      w: 2.3,
      h: 0.26,
      fontSize: 8,
      fontFace: FONT_TH,
      color: p.color,
      bold: true,
      align: "center",
      valign: "middle",
    });

    // Title
    s2.addText(p.title, {
      x: cardX + 0.2,
      y: 2.75,
      w: 2.3,
      h: 0.6,
      fontSize: 13,
      fontFace: FONT_TH,
      color: C.textWhite,
      bold: true,
    });

    // Description
    s2.addText(p.desc, {
      x: cardX + 0.2,
      y: 3.4,
      w: 2.3,
      h: 1.5,
      fontSize: 10.5,
      fontFace: FONT_TH,
      color: C.textMuted,
    });
  });

  s2.addNotes(`บทพูดนำเสนอ (Slide 2):
"เริ่มต้นที่ปัญหา Pain Points หลัก 3 ข้อที่เราพบครับ:
ข้อแรก ข้อมูลน้ำท่วมในปัจจุบันกระจัดกระจาย ประชาชนไม่ทราบว่าบ้านของตัวเองมีความเสี่ยงแค่ไหนในระดับอำเภอหรือตำบลก่อนมวลน้ำจะมาถึง
ข้อสอง เมื่อเกิดเหตุฉุกเฉิน การแจ้งขอความช่วยเหลือมักทำผ่านกลุ่มเฟซบุ๊กหรือสายด่วน ซึ่งขาดพิกัด GIS ที่แม่นยำ และประชาชนไม่รู้ว่ามีเจ้าหน้าที่รับเรื่องแล้วหรือยัง
และข้อสาม ทางฝั่งเจ้าหน้าที่ศูนย์บัญชาการ ต้องรับข้อมูลมหาศาลจากหลายช่องทาง ทำให้คัดกรองเคสฉุกเฉินวิกฤต เช่น ผู้ป่วยติดเตียงหรือเด็ก ได้ล่าช้าครับ"`);
}

// -------------------------------------------------------------------------
// SLIDE 3: Why AI & Agentic Engineering
// -------------------------------------------------------------------------
{
  const s3 = pptx.addSlide();
  s3.background = { color: C.bg };
  addHeader(s3, "ทำไมต้องเป็น AI & Agentic Engineering ในการแก้ปัญหา?", "ลำดับที่ 2 • WHY AI SOLUTION", 3);

  const pillars = [
    {
      title: "1. Explainable Flood Risk Scoring Model",
      badge: "HYDROLOGY + GIS AI (0-100%)",
      color: C.blueLight,
      points: [
        "วิเคราะห์ 3 มิติทางกายภาพ: ปริมาณน้ำฝนสะสม (มม.), ระยะห่างจากแม่น้ำสายหลัก (กม.), และความสูงต่ำของภูมิประเทศ (เมตร)",
        "คำนวณร่วมกับจำนวนรายงานเหตุจริงในพื้นที่แบบ Dynamic",
        "แปลผลคะแนนเป็นระดับความเสี่ยง (เขียว/เหลือง/แดง) พร้อมคำแนะนำการปฏิบัติตนอัตโนมัติครบทั้ง 77 จังหวัด"
      ]
    },
    {
      title: "2. Real-time AI Incident Triage Engine",
      badge: "NATURAL LANGUAGE & SEVERITY TRIAGE",
      color: C.amber,
      points: [
        "สแกนข้อความขอความช่วยเหลือและระดับน้ำที่ส่งเข้ามาโดยอัตโนมัติ",
        "ตรวจจับคีย์เวิร์ดวิกฤต (กระแสไฟฟ้ารั่ว, น้ำเชี่ยว, น้ำท่วมมิดหลังคา, ติดค้าง)",
        "ตรวจจับกลุ่มเปราะบาง (ผู้ป่วยติดเตียง, คนชรา, เด็กทารก, คนท้อง)",
        "จัดลำดับความสำคัญฉุกเฉิน P1 (วิกฤตสูงสุด) ถึง P4 ทันทีที่ประชาชนพิมพ์ส่ง"
      ]
    },
    {
      title: "3. Multi-Agent Software Engineering",
      badge: "17 SPECIALIZED AI AGENTS & SDLC",
      color: C.purple,
      points: [
        "ใช้ AI Agents เฉพาะทาง 17 ตัว ร่วมพัฒนาตลอดวงจร SDLC 7 Phases",
        "ควบคุมคุณภาพและป้องกันความผิดพลาดด้วย 5 Human-in-the-Loop Checkpoints",
        "เก็บบันทึกหลักฐาน Artifacts และ Hash SHA-256 เพื่อความโปร่งใสและตรวจสอบได้"
      ]
    }
  ];

  pillars.forEach((item, idx) => {
    const cardY = 1.55 + idx * 1.25;
    s3.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: cardY,
      w: 8.4,
      h: 1.15,
      rectRadius: 0.12,
      fill: { color: C.cardBg },
      line: { color: C.cardBorder, width: 1 },
    });

    s3.addShape(pptx.ShapeType.roundRect, {
      x: 1.0,
      y: cardY + 0.15,
      w: 2.8,
      h: 0.26,
      rectRadius: 0.05,
      fill: { color: "131F33" },
      line: { color: item.color, width: 1 },
    });
    s3.addText(item.badge, {
      x: 1.0,
      y: cardY + 0.15,
      w: 2.8,
      h: 0.26,
      fontSize: 8,
      fontFace: FONT_TH,
      color: item.color,
      bold: true,
      align: "center",
      valign: "middle",
    });

    s3.addText(item.title, {
      x: 4.0,
      y: cardY + 0.12,
      w: 5.0,
      h: 0.3,
      fontSize: 13,
      fontFace: FONT_TH,
      color: C.textWhite,
      bold: true,
    });

    s3.addText(item.points.map(pt => `•  ${pt}`).join("\n"), {
      x: 1.0,
      y: cardY + 0.45,
      w: 8.0,
      h: 0.65,
      fontSize: 9.5,
      fontFace: FONT_TH,
      color: C.textMuted,
    });
  });

  s3.addNotes(`บทพูดนำเสนอ (Slide 3):
"เพื่อแก้ปัญหาดังกล่าว เราจึงนำ AI เข้ามาขับเคลื่อนใน 3 ด้านหลักครับ:
ด้านแรก คือ Explainable Flood Risk Scoring Model ที่คำนวณคะแนนความเสี่ยงจากปัจจัยกายภาพจริง ทั้งปริมาณน้ำฝน ระยะแม่น้ำ และความสูงพื้นที่ ออกมาเป็นคะแนน 0-100% พร้อมคำแนะนำการปฏิบัติตัวครบ 77 จังหวัด
ด้านที่สอง คือ AI Incident Triage Engine ที่ทำหน้าที่สแกนข้อความขอความช่วยเหลือ ตรวจจับกลุ่มเปราะบาง เช่น ผู้ป่วยติดเตียง หรืออันตรายจากไฟรั่ว เพื่อจัดลำดับความเร่งด่วน P1 ถึง P4 ส่งให้เจ้าหน้าที่เข้าช่วยได้ทันที
และด้านที่สาม คือการใช้ Multi-Agent AI ถึง 17 ตัวในการร่วมกันออกแบบและพัฒนาซอฟต์แวร์ทั้งระบบตาม SDLC โดยมีมนุษย์คอยกำกับทุกด่านครับ"`);
}

// -------------------------------------------------------------------------
// SLIDE 4: System Architecture
// -------------------------------------------------------------------------
{
  const s4 = pptx.addSlide();
  s4.background = { color: C.bg };
  addHeader(s4, "System Architecture: สถาปัตยกรรมระบบแบบ Full-Stack Real-time", "สถาปัตยกรรมระบบ • ARCHITECTURE", 4);

  const boxes = [
    { title: "Frontend Client", tech: "React 18 + Leaflet GIS", desc: "Vite, PWA Service Worker, Web Audio API, Canvas Map Layer 77 จังหวัด", color: C.blueLight, x: 0.8 },
    { title: "Backend API Gateway", tech: "Node.js 20 + Express", desc: "JWT Auth, RBAC, Multer, Helmet, Rate Limiter, AI Triage & News Engine", color: C.green, x: 3.7 },
    { title: "Database & Spatial", tech: "PostgreSQL 16 + PostGIS", desc: "Persistent Runtime Store, GIS Spatial Queries, Incident & User Records", color: C.amber, x: 6.6 }
  ];

  boxes.forEach(b => {
    s4.addShape(pptx.ShapeType.roundRect, {
      x: b.x,
      y: 1.55,
      w: 2.6,
      h: 2.1,
      rectRadius: 0.15,
      fill: { color: C.cardBg },
      line: { color: b.color, width: 1.5 },
    });

    s4.addText(b.title, {
      x: b.x + 0.15,
      y: 1.7,
      w: 2.3,
      h: 0.35,
      fontSize: 14,
      fontFace: FONT_TH,
      color: C.textWhite,
      bold: true,
      align: "center",
    });

    s4.addText(b.tech, {
      x: b.x + 0.15,
      y: 2.05,
      w: 2.3,
      h: 0.3,
      fontSize: 10,
      fontFace: FONT_TH,
      color: b.color,
      bold: true,
      align: "center",
    });

    s4.addText(b.desc, {
      x: b.x + 0.15,
      y: 2.45,
      w: 2.3,
      h: 1.0,
      fontSize: 9.5,
      fontFace: FONT_TH,
      color: C.textMuted,
      align: "center",
    });
  });

  // Real-time Event Bus Bar
  s4.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 3.85,
    w: 8.4,
    h: 1.25,
    rectRadius: 0.15,
    fill: { color: "131F33" },
    line: { color: C.blue, width: 1 },
  });

  s4.addText("⚡ Server-Sent Events (SSE) Real-Time Data Flow", {
    x: 1.1,
    y: 3.95,
    w: 7.8,
    h: 0.3,
    fontSize: 12,
    fontFace: FONT_TH,
    color: C.blueLight,
    bold: true,
  });

  s4.addText("• เมื่อประชาชนแจ้งเหตุ หรือเจ้าหน้าที่ปรับระดับความเสี่ยง/ส่ง Emergency Broadcast ข้อมูลจะถูกกระจายผ่าน SSE ไปยังทุกเบราว์เซอร์และมือถือทันที\n• รองรับ In-Memory Fallback ทำให้ทดสอบและรัน Demo ได้ทันทีโดยไม่ต้องต่อฐานข้อมูลภายนอก และรองรับ PostGIS สำหรับการใช้งานจริง", {
    x: 1.1,
    y: 4.25,
    w: 7.8,
    h: 0.75,
    fontSize: 9.5,
    fontFace: FONT_TH,
    color: C.textMuted,
  });

  s4.addNotes(`บทพูดนำเสนอ (Slide 4):
"ในส่วนของสถาปัตยกรรมระบบ เราออกแบบเป็น Full-Stack ที่ตอบสนองแบบ Real-Time:
ฝั่ง Frontend พัฒนาด้วย React 18, Vite และ Leaflet GIS โดยใช้เทคนิค Canvas Rendering วาดความเสี่ยง 77 จังหวัดได้ลื่นไหล ไม่กระตุก
ฝั่ง Backend ใช้ Node.js และ Express ทำงานร่วมกับ PostgreSQL และ PostGIS ในการจัดการข้อมูลพิกัดภูมิศาสตร์
และไฮไลต์สำคัญคือท่อสื่อสาร Server-Sent Events (SSE) ที่ทำหน้าที่กระจายข่าวเตือนภัยและการเปลี่ยนสถานะรายงานไปยังทุกอุปกรณ์ที่เปิดระบบอยู่แบบ Real-time ทันทีครับ"`);
}

// -------------------------------------------------------------------------
// SLIDE 5: Demo Part 1 - Citizen Experience
// -------------------------------------------------------------------------
{
  const s5 = pptx.addSlide();
  s5.background = { color: C.bg };
  addHeader(s5, "Demo: การทำงานของระบบฝั่งประชาชน (Citizen Flow)", "ลำดับที่ 3 • SYSTEM DEMO (PART 1)", 5);

  const features = [
    {
      step: "ขั้นตอนที่ 1",
      title: "การสมัครสมาชิกและเข้าสู่ระบบจริง",
      desc: "ประชาชนกรอกชื่อ อีเมล รหัสผ่าน และเลือกจังหวัด/อำเภอที่พักอาศัย บัญชีถูกเข้ารหัสด้วย bcrypt และบันทึกลง Persistent Storage ถาวร",
      color: C.green
    },
    {
      step: "ขั้นตอนที่ 2",
      title: "สำรวจแผนที่ความเสี่ยง 77 จังหวัด",
      desc: "คลิกเลือกจังหวัดบนแผนที่เพื่อดูคะแนนความเสี่ยง สภาพอากาศ ปริมาณฝนสะสม และระดับความสูง พร้อมคำแนะนำการเตรียมตัว",
      color: C.blueLight
    },
    {
      step: "ขั้นตอนที่ 3",
      title: "แจ้งเหตุพร้อม AI Incident Triage",
      desc: "คลิกปักหมุดบนแผนที่ เลือกระดับน้ำ อัปโหลดรูปถ่าย ระบุกลุ่มเปราะบาง ระบบ AI คำนวณความเร่งด่วน P1-P4 แสดงผลแบบ Real-time",
      color: C.amber
    }
  ];

  features.forEach((f, idx) => {
    const cardX = 0.8 + idx * 2.85;
    s5.addShape(pptx.ShapeType.roundRect, {
      x: cardX,
      y: 1.6,
      w: 2.7,
      h: 2.1,
      rectRadius: 0.15,
      fill: { color: C.cardBg },
      line: { color: C.cardBorder, width: 1 },
    });

    s5.addText(f.step, {
      x: cardX + 0.2,
      y: 1.75,
      w: 2.3,
      h: 0.25,
      fontSize: 10,
      fontFace: FONT_TH,
      color: f.color,
      bold: true,
    });

    s5.addText(f.title, {
      x: cardX + 0.2,
      y: 2.05,
      w: 2.3,
      h: 0.45,
      fontSize: 13,
      fontFace: FONT_TH,
      color: C.textWhite,
      bold: true,
    });

    s5.addText(f.desc, {
      x: cardX + 0.2,
      y: 2.55,
      w: 2.3,
      h: 1.05,
      fontSize: 9.5,
      fontFace: FONT_TH,
      color: C.textMuted,
    });
  });

  // Mockup Box Frame for Screenshots
  s5.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 3.9,
    w: 8.4,
    h: 1.25,
    rectRadius: 0.15,
    fill: { color: "131F33" },
    line: { color: C.cardBorder, width: 1, dashType: "dash" },
  });

  s5.addText("📸 [กรอบสำหรับวางภาพหน้าจอแคปเจอร์จริง: แผนที่ประเทศไทย 77 จังหวัด + ฟอร์มแจ้งเหตุพร้อมกล่องวิเคราะห์ AI Triage]", {
    x: 1.0,
    y: 4.3,
    w: 8.0,
    h: 0.5,
    fontSize: 11,
    fontFace: FONT_TH,
    color: C.blueLight,
    align: "center",
    valign: "middle",
  });

  s5.addNotes(`บทพูดนำเสนอ (Slide 5):
"มาดูการสาธิตการทำงานจริงของระบบฝั่งประชาชนกันครับ:
เริ่มต้นผู้ใช้สามารถสมัครสมาชิกจริง โดยเลือกบันทึกพื้นที่พักอาศัยของตนเองได้
จากนั้นบนหน้าแผนที่แบบ Interactive ประชาชนสามารถกดดูระดับความเสี่ยงของทั้ง 77 จังหวัดได้แบบละเอียด
และเมื่อต้องการแจ้งเหตุ ประชาชนเพียงคลิกบนแผนที่หรือใช้ GPS ระบบจะให้ระบุระดับน้ำ แนบภาพถ่าย และพิมพ์รายละเอียด ซึ่งโมดูล AI Incident Triage ของเราจะประเมินคะแนนความรุนแรงและปักหมุดส่งไปยังศูนย์บัญชาการทันทีครับ"`);
}

// -------------------------------------------------------------------------
// SLIDE 6: Demo Part 2 - Authority Experience
// -------------------------------------------------------------------------
{
  const s6 = pptx.addSlide();
  s6.background = { color: C.bg };
  addHeader(s6, "Demo: ศูนย์บัญชาการและจัดการภัยพิบัติ (Authority Flow)", "ลำดับที่ 3 • SYSTEM DEMO (PART 2)", 6);

  const authFeatures = [
    {
      title: "1. เข้าสู่ระบบเจ้าหน้าที่ (Security Code)",
      desc: "สมัครและเข้าสู่ระบบศูนย์บัญชาการด้วยรหัสยืนยันหน่วยงาน ('1784' หรือ 'SWU-CPE-2026') เพื่อแยกสิทธิ์ Role-Based Access Control อย่างเคร่งครัด",
      badge: "STRICT RBAC & AUDIT",
      color: C.blueLight
    },
    {
      title: "2. คัดกรองและเปลี่ยนสถานะรายงาน (Triage)",
      desc: "เจ้าหน้าที่เห็นรายงานพร้อมป้าย P1-P4 สามารถคลิกดูรูป พิกัด และกด 'ยืนยัน (Verify)' หรือ 'แก้ไขแล้ว (Resolve)' ซึ่งฝั่งประชาชนจะอัปเดต Real-time",
      badge: "INCIDENT MODERATION",
      color: C.green
    },
    {
      title: "3. ปรับระดับความเสี่ยง & ส่ง Emergency Broadcast",
      desc: "สามารถปรับคะแนนความเสี่ยงรายจังหวัด (ต่ำ/กลาง/สูง) และสร้างประกาศเตือนภัยฉุกเฉินระดับ Red Alert พร้อมส่งตรงถึงหน้าจอประชาชนทันที",
      badge: "EMERGENCY BROADCAST",
      color: C.red
    }
  ];

  authFeatures.forEach((item, idx) => {
    const cardY = 1.55 + idx * 1.2;
    s6.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: cardY,
      w: 8.4,
      h: 1.1,
      rectRadius: 0.12,
      fill: { color: C.cardBg },
      line: { color: C.cardBorder, width: 1 },
    });

    s6.addText(item.title, {
      x: 1.0,
      y: cardY + 0.15,
      w: 5.4,
      h: 0.35,
      fontSize: 13,
      fontFace: FONT_TH,
      color: C.textWhite,
      bold: true,
    });

    s6.addShape(pptx.ShapeType.roundRect, {
      x: 6.6,
      y: cardY + 0.15,
      w: 2.4,
      h: 0.25,
      rectRadius: 0.05,
      fill: { color: "131F33" },
      line: { color: item.color, width: 1 },
    });
    s6.addText(item.badge, {
      x: 6.6,
      y: cardY + 0.15,
      w: 2.4,
      h: 0.25,
      fontSize: 8,
      fontFace: FONT_TH,
      color: item.color,
      bold: true,
      align: "center",
      valign: "middle",
    });

    s6.addText(item.desc, {
      x: 1.0,
      y: cardY + 0.5,
      w: 8.0,
      h: 0.5,
      fontSize: 9.5,
      fontFace: FONT_TH,
      color: C.textMuted,
    });
  });

  s6.addNotes(`บทพูดนำเสนอ (Slide 6):
"ถัดมาเป็นฝั่งของเจ้าหน้าที่ศูนย์สั่งการครับ:
การเข้าสู่ระบบต้องใช้รหัสความปลอดภัยหน่วยงานเพื่อป้องกันสิทธิ์ โดยเมื่อเข้าสู่หน้า Dashboard เจ้าหน้าที่จะเห็นรายงานทั้งหมดที่ส่งเข้ามา
ระบบช่วยคัดกรองเคส P1 ซึ่งเป็นเคสวิกฤตไว้บนสุด เจ้าหน้าที่สามารถกด Verify เพื่อรับเรื่อง หรือ Resolve เมื่อช่วยเหลือเสร็จสิ้น
นอกจากนี้ ยังสามารถปรับระดับความเสี่ยงของแต่ละจังหวัด และส่งสัญญาณประกาศเตือนภัยฉุกเฉิน Broadcast ไปยังประชาชนทุกคนได้ทันทีครับ"`);
}

// -------------------------------------------------------------------------
// SLIDE 7: Demo Part 3 - Notification Lab & PWA
// -------------------------------------------------------------------------
{
  const s7 = pptx.addSlide();
  s7.background = { color: C.bg };
  addHeader(s7, "Demo: ศูนย์ทดสอบแจ้งเตือนจริง & รองรับแอปมือถือ (PWA)", "ลำดับที่ 3 • SYSTEM DEMO (PART 3)", 7);

  // Left Card: Notification Test Lab
  s7.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.55,
    w: 4.05,
    h: 3.5,
    rectRadius: 0.18,
    fill: { color: C.cardBg },
    line: { color: C.blue, width: 1.5 },
  });

  s7.addText("🔔 ศูนย์ทดสอบแจ้งเตือนจริง (Test Lab)", {
    x: 1.0,
    y: 1.75,
    w: 3.65,
    h: 0.35,
    fontSize: 13,
    fontFace: FONT_TH,
    color: C.blueLight,
    bold: true,
  });

  s7.addText([
    { text: "• Web Push Notification:\n", options: { bold: true, color: C.textWhite } },
    { text: "  ส่งการแจ้งเตือนระดับ OS ขึ้นหน้าจอคอมพิวเตอร์และมือถือจริง\n\n", options: { color: C.textMuted } },
    { text: "• Web Audio Siren Alert:\n", options: { bold: true, color: C.textWhite } },
    { text: "  เล่นเสียงสัญญาณไซเรนเตือนภัยฉุกเฉินเมื่อมีประกาศความเสี่ยงสูง\n\n", options: { color: C.textMuted } },
    { text: "• Real-time SSE Multi-Device Test:\n", options: { bold: true, color: C.textWhite } },
    { text: "  กดทดสอบครั้งเดียวยิงเตือนภัยไปยังทุกเครื่องที่เปิดเว็บอยู่พร้อมกัน", options: { color: C.textMuted } },
  ], {
    x: 1.0,
    y: 2.15,
    w: 3.65,
    h: 2.7,
    fontSize: 9.5,
    fontFace: FONT_TH,
  });

  // Right Card: Mobile PWA
  s7.addShape(pptx.ShapeType.roundRect, {
    x: 5.15,
    y: 1.55,
    w: 4.05,
    h: 3.5,
    rectRadius: 0.18,
    fill: { color: C.cardBg },
    line: { color: C.green, width: 1.5 },
  });

  s7.addText("📱 รองรับแอปพลิเคชันมือถือ (PWA)", {
    x: 5.35,
    y: 1.75,
    w: 3.65,
    h: 0.35,
    fontSize: 13,
    fontFace: FONT_TH,
    color: C.green,
    bold: true,
  });

  s7.addText([
    { text: "• Progressive Web App (PWA):\n", options: { bold: true, color: C.textWhite } },
    { text: "  รองรับ Service Worker และ Web App Manifest เต็มรูปแบบ\n\n", options: { color: C.textMuted } },
    { text: "• Add to Home Screen:\n", options: { bold: true, color: C.textWhite } },
    { text: "  ติดตั้งลงหน้าจอมือถือได้ทั้ง iOS และ Android ไม่ต้องผ่าน Store\n\n", options: { color: C.textMuted } },
    { text: "• Mobile Navigation Bar:\n", options: { bold: true, color: C.textWhite } },
    { text: "  มีแถบเมนูด้านล่างสำหรับการใช้งานมือเดียวได้อย่างคล่องตัวในพื้นที่น้ำท่วม", options: { color: C.textMuted } },
  ], {
    x: 5.35,
    y: 2.15,
    w: 3.65,
    h: 2.7,
    fontSize: 9.5,
    fontFace: FONT_TH,
  });

  s7.addNotes(`บทพูดนำเสนอ (Slide 7):
"นอกจากนี้ ระบบของเรายังมาพร้อม 2 ฟีเจอร์สำคัญ:
ฟีเจอร์แรกคือ Notification Test Lab ที่สามารถทดสอบการแจ้งเตือน Push Notification ขึ้นที่ระดับระบบปฏิบัติการของเครื่อง พร้อมเสียงสัญญาณไซเรนฉุกเฉิน และทดสอบยิง Real-time ข้ามอุปกรณ์ได้ทันที
และฟีเจอร์ที่สอง คือการรองรับ Progressive Web App (PWA) ทำให้ประชาชนในพื้นที่ประสบภัยสามารถกด 'Add to Home Screen' ติดตั้งเป็นแอปบนมือถือได้ทั้ง iOS และ Android ทันที มีเมนูนำทางด้านล่างที่ใช้งานง่ายด้วยมือเดียวครับ"`);
}

// -------------------------------------------------------------------------
// SLIDE 8: Multi-Agent Software Engineering Team (17 Agents)
// -------------------------------------------------------------------------
{
  const s8 = pptx.addSlide();
  s8.background = { color: C.bg };
  addHeader(s8, "Software Engineer Team: 17 AI Agents ครอบคลุม 7 Phases SDLC", "ลำดับที่ 4.1 • MULTI-AGENT SDLC", 8);

  const phases = [
    { name: "Phase 1: Discovery", agents: "• Business Requirements Agent\n• Flood Domain & Data Agent", color: C.blueLight },
    { name: "Phase 2: Product", agents: "• Product Manager Agent (PRD & Stories)", color: C.amber },
    { name: "Phase 3: Design", agents: "• UX & Accessibility Agent\n• GIS & Map Experience Agent", color: C.purple },
    { name: "Phase 4: Architecture", agents: "• Solution Architect Agent\n• Database & GIS Architect Agent\n• Security & API Contract Agent", color: C.green },
    { name: "Phase 5: Implementation", agents: "• Citizen Frontend Agent\n• Authority Frontend Agent\n• Identity Backend Agent\n• Incident & Realtime Agent\n• Flood Risk Data Engineer", color: C.blueLight },
    { name: "Phase 6: Validation", agents: "• QA Automation Agent\n• Security & Privacy Review Agent\n• Accessibility & Performance Agent", color: C.red },
    { name: "Phase 7: Operations", agents: "• DevOps & Release Agent", color: C.amber },
  ];

  // Grid Layout for Phases
  phases.forEach((ph, idx) => {
    let col = idx % 4;
    let row = Math.floor(idx / 4);
    let cardW = 2.0;
    let cardH = 1.65;
    let x = 0.8 + col * 2.15;
    let y = 1.55 + row * 1.8;

    if (idx === 4) { // Implementation is bigger
      cardW = 4.15;
      x = 0.8;
      y = 3.35;
    } else if (idx === 5) {
      cardW = 2.0;
      x = 5.1;
      y = 3.35;
    } else if (idx === 6) {
      cardW = 2.0;
      x = 7.25;
      y = 3.35;
    }

    s8.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w: cardW,
      h: cardH,
      rectRadius: 0.1,
      fill: { color: C.cardBg },
      line: { color: ph.color, width: 1 },
    });

    s8.addText(ph.name, {
      x: x + 0.1,
      y: y + 0.1,
      w: cardW - 0.2,
      h: 0.25,
      fontSize: 10,
      fontFace: FONT_TH,
      color: ph.color,
      bold: true,
    });

    s8.addText(ph.agents, {
      x: x + 0.1,
      y: y + 0.35,
      w: cardW - 0.2,
      h: cardH - 0.45,
      fontSize: 8.5,
      fontFace: FONT_TH,
      color: C.textWhite,
    });
  });

  s8.addNotes(`บทพูดนำเสนอ (Slide 8):
"ในส่วนของหัวข้อการสร้าง Software Engineer Team ตามกระบวนการ SDLC:
เราได้สร้างทีม AI Engineering เฉพาะทางทั้งหมด 17 ตัว ทำงานร่วมกันใน 7 ลำดับขั้นอย่างเป็นระบบ:
เริ่มตั้งแต่ Phase 1 Discovery วิเคราะห์โดเมนอุทกภัย, Phase 2 ร่าง PRD, Phase 3 ออกแบบ GIS และ UX,
Phase 4 วางโครงสร้างสถาปัตยกรรมและ Schema ฐานข้อมูล, Phase 5 แยกพัฒนาระบบฝั่งหน้าบ้าน หลังบ้าน และ Real-time,
Phase 6 การตรวจสอบ QA, Security และ Accessibility และจบที่ Phase 7 การจัดการ Release ครับ"`);
}

// -------------------------------------------------------------------------
// SLIDE 9: Agent Workflow & Human Checkpoints
// -------------------------------------------------------------------------
{
  const s9 = pptx.addSlide();
  s9.background = { color: C.bg };
  addHeader(s9, "AI Workflow: 46 Handoffs & 5 Human-in-the-Loop Checkpoints", "ลำดับที่ 4.2 • GOVERNANCE & GATES", 9);

  const gates = [
    { num: "GATE 1", name: "Requirements Gate", role: "อนุมัติขอบเขต PRD, User Stories และ Functional Baseline", actor: "Project Owner" },
    { num: "GATE 2", name: "Experience Gate", role: "อนุมัติ UX Flow, แบบแผนที่ GIS และการเข้าถึง Accessibility", actor: "UX Lead" },
    { num: "GATE 3", name: "Architecture Gate", role: "อนุมัติสถาปัตยกรรม PostGIS, REST API และ Security Boundaries", actor: "Architect" },
    { num: "GATE 4", name: "Integration Gate", role: "อนุมัติผลการทดสอบการเชื่อมต่อ Frontend, Backend และ Real-time", actor: "Tech Lead" },
    { num: "GATE 5", name: "Release Gate", role: "อนุมัติแพ็กเกจ Release ใช้งานจริงพร้อมหลักฐาน Audit Hashes", actor: "Human Lead (Thuwanon)" }
  ];

  gates.forEach((g, idx) => {
    const cardX = 0.8 + idx * 1.7;
    s9.addShape(pptx.ShapeType.roundRect, {
      x: cardX,
      y: 1.6,
      w: 1.6,
      h: 2.3,
      rectRadius: 0.12,
      fill: { color: C.cardBg },
      line: { color: C.blue, width: 1 },
    });

    s9.addShape(pptx.ShapeType.roundRect, {
      x: cardX + 0.1,
      y: 1.75,
      w: 1.4,
      h: 0.25,
      rectRadius: 0.05,
      fill: { color: "0B3B60" },
      line: { color: C.blueLight, width: 0.8 },
    });
    s9.addText(g.num, {
      x: cardX + 0.1,
      y: 1.75,
      w: 1.4,
      h: 0.25,
      fontSize: 9,
      fontFace: FONT_TH,
      color: C.blueLight,
      bold: true,
      align: "center",
      valign: "middle",
    });

    s9.addText(g.name, {
      x: cardX + 0.1,
      y: 2.1,
      w: 1.4,
      h: 0.45,
      fontSize: 10.5,
      fontFace: FONT_TH,
      color: C.textWhite,
      bold: true,
      align: "center",
    });

    s9.addText(g.role, {
      x: cardX + 0.1,
      y: 2.6,
      w: 1.4,
      h: 0.85,
      fontSize: 8.5,
      fontFace: FONT_TH,
      color: C.textMuted,
      align: "center",
    });

    s9.addText(`✓ Approved by\n${g.actor}`, {
      x: cardX + 0.1,
      y: 3.45,
      w: 1.4,
      h: 0.4,
      fontSize: 7.5,
      fontFace: FONT_TH,
      color: C.green,
      align: "center",
      bold: true,
    });
  });

  // SHA-256 Audit Box
  s9.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 4.1,
    w: 8.4,
    h: 1.05,
    rectRadius: 0.12,
    fill: { color: "131F33" },
    line: { color: C.cardBorder, width: 1 },
  });

  s9.addText("🔒 ความโปร่งใสและการควบคุมคุณภาพ (Auditability & Determinism)", {
    x: 1.0,
    y: 4.18,
    w: 8.0,
    h: 0.25,
    fontSize: 11,
    fontFace: FONT_TH,
    color: C.amber,
    bold: true,
  });

  s9.addText("• ทุกขั้นตอนมี 46 Handoffs ส่งมอบงานตามลำดับ และต้องผ่านการอนุมัติจากมนุษย์ (Human Gate) ก่อนข้ามไปยังขั้นตอนถัดไป\n• บันทึกหลักฐานเอกสารและโค้ดด้วยการคำนวณค่า SHA-256 Hash ลงใน workflow-state.json ไม่มีการรันข้ามหรือดัดแปลงผลลัพธ์โดยพลการ", {
    x: 1.0,
    y: 4.45,
    w: 8.0,
    h: 0.6,
    fontSize: 9,
    fontFace: FONT_TH,
    color: C.textMuted,
  });

  s9.addNotes(`บทพูดนำเสนอ (Slide 9):
"สิ่งที่สำคัญที่สุดในกระบวนการนี้ คือการไม่ปล่อยให้ AI ทำงานโดยไร้การควบคุมครับ:
เรามีกลไก 5 Human-in-the-Loop Checkpoints กำกับในทุกจุดเปลี่ยนผ่านสำคัญ ได้แก่ Requirements Gate, Experience Gate, Architecture Gate, Integration Gate และ Release Gate
และทุกชิ้นงาน Artifact จะถูกเข้ารหัสคำนวณค่า SHA-256 บันทึกลงใน Workflow State ทำให้กระบวนการทั้งหมดมีความโปร่งใส ตรวจสอบย้อนกลับได้ 100% ครับ"`);
}

// -------------------------------------------------------------------------
// SLIDE 10: Design & Dev Tools
// -------------------------------------------------------------------------
{
  const s10 = pptx.addSlide();
  s10.background = { color: C.bg };
  addHeader(s10, "Design & Development Tools: เครื่องมือที่ใช้ในการพัฒนา", "ลำดับที่ 4.3 • TECH STACK & TOOLS", 10);

  const tools = [
    { cat: "Frontend & UI", items: "React 18 • Vite • Leaflet GIS • Lucide Icons • Progressive Web App (PWA) • Tailwind CSS", color: C.blueLight },
    { cat: "Backend & Realtime", items: "Node.js 20+ • Express.js • Server-Sent Events (SSE) • JSON Web Token (JWT) • bcryptjs • Multer", color: C.green },
    { cat: "Database & GIS", items: "PostgreSQL 16 • PostGIS 3.4 Spatial Extension • In-memory Fallback • 77 Provinces Dataset", color: C.amber },
    { cat: "Agentic Engineering", items: "Custom Node.js Agentic Runner • Human Approval CLI • SHA-256 Audit Logger • VS Code Tasks", color: C.purple }
  ];

  tools.forEach((t, idx) => {
    const cardY = 1.6 + idx * 0.88;
    s10.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: cardY,
      w: 8.4,
      h: 0.78,
      rectRadius: 0.1,
      fill: { color: C.cardBg },
      line: { color: C.cardBorder, width: 1 },
    });

    s10.addShape(pptx.ShapeType.roundRect, {
      x: 1.0,
      y: cardY + 0.18,
      w: 2.2,
      h: 0.42,
      rectRadius: 0.08,
      fill: { color: "131F33" },
      line: { color: t.color, width: 1 },
    });
    s10.addText(t.cat, {
      x: 1.0,
      y: cardY + 0.18,
      w: 2.2,
      h: 0.42,
      fontSize: 10,
      fontFace: FONT_TH,
      color: t.color,
      bold: true,
      align: "center",
      valign: "middle",
    });

    s10.addText(t.items, {
      x: 3.4,
      y: cardY + 0.18,
      w: 5.6,
      h: 0.42,
      fontSize: 10.5,
      fontFace: FONT_TH,
      color: C.textWhite,
      valign: "middle",
    });
  });

  s10.addNotes(`บทพูดนำเสนอ (Slide 10):
"นี่คือชุดเครื่องมือและเทคโนโลยีทั้งหมดที่เราเลือกใช้ครับ:
ด้านหน้าบ้านใช้ React 18, Leaflet และ PWA
ด้านหลังบ้านใช้ Node.js, Express และ SSE สำหรับระบบ Real-time
ฐานข้อมูลใช้ PostgreSQL ร่วมกับ PostGIS รองรับการคำนวณพิกัดภูมิศาสตร์
และในส่วนของการจัดการ AI เราเขียน Node.js Agentic SDLC Runner ขึ้นมาควบคุม Workflow และตรวจสอบสถานะ Checkpoint อัตโนมัติครับ"`);
}

// -------------------------------------------------------------------------
// SLIDE 11: Future Work Development
// -------------------------------------------------------------------------
{
  const s11 = pptx.addSlide();
  s11.background = { color: C.bg };
  addHeader(s11, "Future Work Development: แนวทางการพัฒนาต่อยอดในอนาคต", "ลำดับที่ 5 • FUTURE ROADMAP", 11);

  const future = [
    {
      num: "01",
      title: "Real-time Hydrology & Satellite Integration",
      desc: "เชื่อมต่อ API คลังข้อมูลน้ำแห่งชาติ (ThaiWater ของ สสน.) และภาพถ่ายดาวเทียมน้ำท่วมจาก GISTDA เพื่อดึงค่าฝนและระดับน้ำจริงแบบอัตโนมัติ 24 ชม.",
      color: C.blueLight
    },
    {
      num: "02",
      title: "AI Computer Vision & Deep Learning Forecasting",
      desc: "ใช้โมเดล Computer Vision วิเคราะห์ระดับน้ำจากภาพถ่ายที่ประชาชนส่งมาอัตโนมัติ และใช้โมเดล Time-Series พยากรณ์น้ำท่วมล่วงหน้า 24–72 ชั่วโมง",
      color: C.amber
    },
    {
      num: "03",
      title: "Omnichannel Emergency Broadcast",
      desc: "ขยายระบบแจ้งเตือนภัยผ่านช่องทาง SMS Gateway, LINE Official Account และ Cell Broadcast เพื่อเตือนประชาชนในพื้นที่อับสัญญาณอินเทอร์เน็ต",
      color: C.red
    },
    {
      num: "04",
      title: "Smart Rescue Dispatch & Resource Allocation",
      desc: "ระบบบริหารจัดการยานพาหนะกู้ภัย เรือท้องแบน และศูนย์พักพิงชั่วคราว พร้อมจัดคิวช่วยเหลือผู้ประสบภัยกลุ่มเปราะบางอย่างมีประสิทธิภาพสูงสุด",
      color: C.green
    }
  ];

  future.forEach((f, idx) => {
    let col = idx % 2;
    let row = Math.floor(idx / 2);
    let x = 0.8 + col * 4.3;
    let y = 1.55 + row * 1.8;

    s11.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w: 4.1,
      h: 1.65,
      rectRadius: 0.15,
      fill: { color: C.cardBg },
      line: { color: C.cardBorder, width: 1 },
    });

    s11.addText(f.num, {
      x: x + 0.15,
      y: y + 0.15,
      w: 0.6,
      h: 0.35,
      fontSize: 16,
      fontFace: FONT_TH,
      color: f.color,
      bold: true,
    });

    s11.addText(f.title, {
      x: x + 0.8,
      y: y + 0.15,
      w: 3.15,
      h: 0.45,
      fontSize: 12,
      fontFace: FONT_TH,
      color: C.textWhite,
      bold: true,
    });

    s11.addText(f.desc, {
      x: x + 0.15,
      y: y + 0.65,
      w: 3.8,
      h: 0.9,
      fontSize: 9.5,
      fontFace: FONT_TH,
      color: C.textMuted,
    });
  });

  s11.addNotes(`บทพูดนำเสนอ (Slide 11):
"สำหรับทิศทางการพัฒนาต่อยอดในอนาคต เราวางแผนไว้ 4 ส่วนสำคัญครับ:
1. การเชื่อมต่อ API ข้อมูลจริงจากคลังข้อมูลน้ำแห่งชาติ ThaiWater และดาวเทียม GISTDA
2. การนำ Computer Vision มาอ่านระดับน้ำจากรูปถ่ายประชาชนอัตโนมัติ และใช้ Deep Learning พยากรณ์น้ำล่วงหน้า 3 วัน
3. การขยายช่องทางแจ้งเตือนผ่าน SMS, LINE OA และ Cell Broadcast เพื่อให้ถึงประชาชนแม้เน็ตขัดข้อง
และ 4. ระบบ Smart Rescue Dispatch ช่วยจัดคิวเรือและทีมแพทย์เข้าช่วยผู้ประสบภัยกลุ่มเปราะบางครับ"`);
}

// -------------------------------------------------------------------------
// SLIDE 12: References
// -------------------------------------------------------------------------
{
  const s12 = pptx.addSlide();
  s12.background = { color: C.bg };
  addHeader(s12, "References: เอกสารและแหล่งข้อมูลอ้างอิง", "ลำดับที่ 6 • CITATIONS", 12);

  const refs = [
    {
      title: "1. คลังข้อมูลน้ำแห่งชาติ (ThaiWater)",
      author: "สถาบันสารสนเทศทรัพยากรน้ำ (องค์การมหาชน). (2567).",
      source: "ระบบสารสนเทศทรัพยากรน้ำและการคาดการณ์อุทกภัย. สืบค้นจาก https://www.thaiwater.net"
    },
    {
      title: "2. ระบบติดตามสถานการณ์น้ำท่วมจากดาวเทียม (Thailand Flood Monitoring System)",
      author: "สำนักงานพัฒนาเทคโนโลยีอวกาศและภูมิสารสนเทศ (องค์การมหาชน) - GISTDA. (2567).",
      source: "ข้อมูลพื้นที่น้ำท่วมขังเชิงพื้นที่ประเทศไทย. สืบค้นจาก https://flood.gistda.or.th"
    },
    {
      title: "3. แนวทางการแจ้งเตือนภัยพิบัติและศูนย์นิรภัย 1784",
      author: "กรมป้องกันและบรรเทาสาธารณภัย กระทรวงมหาดไทย. (2567).",
      source: "คู่มือมาตรฐานการปฏิบัติการตอบโต้ภาวะฉุกเฉินและเตือนภัยพิบัติ. สืบค้นจาก https://www.disaster.go.th"
    },
    {
      title: "4. PostGIS Spatial and Geographic Objects for PostgreSQL",
      author: "PostGIS Project Steering Committee. (2024).",
      source: "PostGIS 3.4 Spatial Database Manual. Retrieved from https://postgis.net/documentation/"
    },
    {
      title: "5. Progressive Web Apps (PWA) & Web Notifications Specification",
      author: "Mozilla Developer Network (MDN) & World Wide Web Consortium (W3C). (2024).",
      source: "Service Worker and Web App Manifest Standard. Retrieved from https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps"
    }
  ];

  refs.forEach((r, idx) => {
    const cardY = 1.55 + idx * 0.72;
    s12.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: cardY,
      w: 8.4,
      h: 0.65,
      rectRadius: 0.08,
      fill: { color: C.cardBg },
      line: { color: C.cardBorder, width: 1 },
    });

    s12.addText(r.title, {
      x: 1.0,
      y: cardY + 0.08,
      w: 8.0,
      h: 0.25,
      fontSize: 10.5,
      fontFace: FONT_TH,
      color: C.blueLight,
      bold: true,
    });

    s12.addText(`${r.author} ${r.source}`, {
      x: 1.0,
      y: cardY + 0.32,
      w: 8.0,
      h: 0.28,
      fontSize: 8.5,
      fontFace: FONT_TH,
      color: C.textMuted,
    });
  });

  s12.addNotes(`บทพูดนำเสนอ (Slide 12):
"นี่คือรายการเอกสารและมาตรฐานอ้างอิงที่เราใช้ในการค้นคว้าและพัฒนาโปรเจกต์นี้ครับ ทั้งจากสถาบันสารสนเทศทรัพยากรน้ำ สสน., ดาวเทียม GISTDA, กรมป้องกันและบรรเทาสาธารณภัย ปภ. 1784, เอกสารมาตรฐาน PostGIS และข้อกำหนด W3C PWA ครับ"`);
}

// -------------------------------------------------------------------------
// SLIDE 13: Team Members & Advisor
// -------------------------------------------------------------------------
{
  const s13 = pptx.addSlide();
  s13.background = { color: C.bg };
  addHeader(s13, "ข้อมูลคณะผู้จัดทำและอาจารย์ที่ปรึกษา", "ลำดับที่ 7 • TEAM & ADVISOR", 13);

  // Left Box: Team Members
  s13.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.55,
    w: 4.8,
    h: 3.5,
    rectRadius: 0.18,
    fill: { color: C.cardBg },
    line: { color: C.blue, width: 1.5 },
  });

  s13.addText("👥 คณะผู้จัดทำ (Members)", {
    x: 1.0,
    y: 1.75,
    w: 4.4,
    h: 0.35,
    fontSize: 14,
    fontFace: FONT_TH,
    color: C.textWhite,
    bold: true,
  });

  s13.addText([
    { text: "*(กติกาการนำเสนอ: ไม่ใส่คำนำหน้า นาย/นางสาว และไม่ต้องแสดงรหัสนิสิต)*\n\n", options: { color: C.amber, fontSize: 8.5 } },
    { text: "1. ธุวานนท์ [ใส่นามสกุลสมาชิก]\n", options: { bold: true, color: C.textWhite, fontSize: 11 } },
    { text: "   รับผิดชอบ: Full-Stack Architecture, Real-Time SSE, AI Incident Triage\n\n", options: { color: C.textMuted, fontSize: 9 } },
    { text: "2. [ใส่ชื่อ - นามสกุล สมาชิกคนที่ 2]\n", options: { bold: true, color: C.textWhite, fontSize: 11 } },
    { text: "   รับผิดชอบ: Frontend React 18, Leaflet GIS Map Experience, Mobile PWA\n\n", options: { color: C.textMuted, fontSize: 9 } },
    { text: "3. [ใส่ชื่อ - นามสกุล สมาชิกคนที่ 3 (ถ้ามี)]\n", options: { bold: true, color: C.textWhite, fontSize: 11 } },
    { text: "   รับผิดชอบ: Backend Express API, Database Schema, QA & Testing", options: { color: C.textMuted, fontSize: 9 } },
  ], {
    x: 1.0,
    y: 2.1,
    w: 4.4,
    h: 2.8,
    fontFace: FONT_TH,
  });

  // Right Top Box: Advisor
  s13.addShape(pptx.ShapeType.roundRect, {
    x: 5.8,
    y: 1.55,
    w: 3.4,
    h: 1.6,
    rectRadius: 0.18,
    fill: { color: C.cardBg },
    line: { color: C.cardBorder, width: 1 },
  });

  s13.addText("🎓 อาจารย์ที่ปรึกษาโครงงาน", {
    x: 6.0,
    y: 1.75,
    w: 3.0,
    h: 0.3,
    fontSize: 12,
    fontFace: FONT_TH,
    color: C.blueLight,
    bold: true,
  });

  s13.addText("ผศ.วัชรชัย วิริยะสุทธิวงศ์", {
    x: 6.0,
    y: 2.1,
    w: 3.0,
    h: 0.4,
    fontSize: 14,
    fontFace: FONT_TH,
    color: C.textWhite,
    bold: true,
  });

  s13.addText("ภาควิชาวิศวกรรมคอมพิวเตอร์ คณะวิศวกรรมศาสตร์\nมหาวิทยาลัยศรีนครินทรวิโรฒ (มศว)", {
    x: 6.0,
    y: 2.5,
    w: 3.0,
    h: 0.5,
    fontSize: 9.5,
    fontFace: FONT_TH,
    color: C.textMuted,
  });

  // Right Bottom Box: Photo Placeholder
  s13.addShape(pptx.ShapeType.roundRect, {
    x: 5.8,
    y: 3.3,
    w: 3.4,
    h: 1.75,
    rectRadius: 0.15,
    fill: { color: "131F33" },
    line: { color: C.cardBorder, width: 1, dashType: "dash" },
  });

  try {
    s13.addImage({ path: logoPath, x: 7.9, y: 3.4, w: 1.15, h: 1.15 });
  } catch (e) {}

  s13.addText("📷 [วางภาพถ่ายหมู่สมาชิกกลุ่ม]\n+ ตราสัญลักษณ์คณะวิศวกรรมศาสตร์ มศว", {
    x: 5.9,
    y: 3.4,
    w: 1.9,
    h: 1.2,
    fontSize: 9.5,
    fontFace: FONT_TH,
    color: C.blueLight,
    align: "center",
    valign: "middle",
  });

  s13.addNotes(`บทพูดนำเสนอ (Slide 13):
"สุดท้ายนี้ กลุ่มของพวกเราขอขอบพระคุณ ผศ.วัชรชัย วิริยะสุทธิวงศ์ อาจารย์ที่ปรึกษา ที่ให้คำแนะนำและตรวจทานโครงงานนี้เป็นอย่างดียิ่ง
และหากอาจารย์หรือเพื่อนๆ มีข้อสงสัยหรือข้อเสนอแนะเพิ่มเติม กลุ่มของพวกเรายินดีตอบทุกคำถาม ขอบคุณครับ"`);
}

// Generate Presentation File
async function main() {
  console.log("Generating presentation at:", outputPath);
  await pptx.writeFile({ fileName: outputPath });
  console.log("Successfully generated presentation PowerPoint (.pptx) file!");
}

main().catch(err => {
  console.error("Error generating presentation:", err);
  process.exit(1);
});
