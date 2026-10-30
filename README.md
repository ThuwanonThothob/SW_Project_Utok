# วารีการ์ด (WareeGuard) — Thailand Flood Risk Assessment & Incident Reporting Platform

[![Agentic SDLC](https://img.shields.io/badge/Agentic_SDLC-18_AI_Agents_Approved-success.svg)](file:///Users/thuwanon/Documents/cpe_sw/SW_Project/docs/AGENTIC_SDLC.md)
[![Automated Tests](https://img.shields.io/badge/Tests-18%2F18_Passing-brightgreen.svg)](file:///Users/thuwanon/Documents/cpe_sw/SW_Project/backend/test)
[![Security Hardened](https://img.shields.io/badge/Security-OWASP_Top_10-blue.svg)](file:///Users/thuwanon/Documents/cpe_sw/SW_Project/docs/SECURITY_GUIDE.md)
[![PWA Ready](https://img.shields.io/badge/Mobile-PWA_Standalone-orange.svg)](file:///Users/thuwanon/Documents/cpe_sw/SW_Project/docs/USER_MANUAL.md)

ระบบดิจิทัลแพลตฟอร์ม (Web & Mobile Application) เพื่อประเมินความเสี่ยง แจ้งเหตุการณ์ฉุกเฉิน และกระจายเสียงเตือนภัยน้ำท่วมประเทศไทย ครอบคลุม 77 จังหวัด เชื่อมโยงข้อมูลสภาพอากาศสดและลำน้ำระดับโลก พัฒนาขึ้นด้วยกระบวนการ **Agentic Engineering** ผ่านทีมวิศวกรปัญญาประดิษฐ์ (Multi-AI Agent SE Team) ตามวงจรการพัฒนาระบบ (SDLC)

> **โครงงานรายวิชา**: การพัฒนาซอฟต์แวร์ด้วยวิศวกรรมเอเจนต์ (Agentic Software Engineering)  
> **ภาควิชา**: วิศวกรรมคอมพิวเตอร์ คณะวิศวกรรมศาสตร์ มหาวิทยาลัยศรีนครินทรวิโรฒ (SWU)  
> **อาจารย์ที่ปรึกษา**: ผศ.วัชรชัย วิริยะสุทธิวงศ์

---

## 📑 สารบัญเอกสารและคู่มือในคลังโค้ด (Git Documentation)

- 📘 [**คู่มือการใช้งานระบบสำหรับผู้ใช้ (USER_MANUAL.md)**](docs/USER_MANUAL.md) — แนะนำวิธีใช้งานของทั้งประชาชน (Citizen) และเจ้าหน้าที่ (Authority), การส่งรายงาน, การดู GPS สด และการติดตั้งลงมือถือ PWA
- 🛡️ [**คู่มือสถาปัตยกรรมความปลอดภัย (SECURITY_GUIDE.md)**](docs/SECURITY_GUIDE.md) — รายละเอียดการป้องกัน OWASP Top 10, Anti-XSS, File Upload Sandboxing, Rate Limiting, และ RBAC
- 🤖 [**คู่มือทีม 18 AI Agents และกระบวนการ SDLC (AGENTIC_SDLC.md)**](docs/AGENTIC_SDLC.md) — เจาะลึกทีมวิศวกร AI 18 บทบาท, Workflow State Machine, Handoffs, และ 5 Human Checkpoints
- 🎬 [**บทสรุปการนำเสนอคลิป 7 ลำดับ (presentation-guide.md)**](agents/artifacts/presentation-guide.md) — สคริปต์และลำดับการนำเสนอคลิปวิดีโอส่งงานอาจารย์

---

## 1. ชื่อโครงการและสัญลักษณ์ระบบ (Project Name & Logo)

* **ชื่อระบบ**: **วารีการ์ด (WareeGuard)**
* **คำจำกัดความ**: แพลตฟอร์มประเมินความเสี่ยงและคัดกรองเหตุน้ำท่วมอัจฉริยะแบบ Real-Time ด้วย Multi-AI Agent ภาควิชาวิศวกรรมคอมพิวเตอร์ มศว
* **สัญลักษณ์ระบบ (Logo)**: ตราสัญลักษณ์คลื่นน้ำท่วมคู่กับตราสัญลักษณ์ทางการของมหาวิทยาลัยศรีนครินทรวิโรฒ (กราฟโค้งการเจริญงอกงาม เทา-แดง และ SWU CPE Badge) สื่อถึงระบบเทคโนโลยีวิศวกรรมคอมพิวเตอร์ที่พร้อมพิทักษ์และเตือนภัยประชาชนอย่างยั่งยืน

---

## 2. ปัญหาและเหตุผลความจำเป็นของระบบ AI (Pain Point & Why AI)

### ปัญหาที่พบในระบบจัดการน้ำท่วมแบบเดิม (Pain Points)
1. **ข้อมูลกระจัดกระจายและไม่เรียลไทม์**: ประชาชนไม่ทราบว่าตำแหน่งที่ตนเองยืนอยู่มีความเสี่ยงมากน้อยเพียงใด จนกระทั่งน้ำท่วมถึงบ้าน
2. **รายงานเหตุการณ์ล้นทะลัก (Report Overload)**: ในช่วงวิกฤต มีประชาชนส่งข้อมูลและโทรแจ้งขอความช่วยเหลือหลายพันสายต่อวัน ทำให้เจ้าหน้าที่แยกแยะไม่ออกว่าจุดใดมีผู้ป่วยติดเตียงหรืออันตรายถึงชีวิต
3. **การประเมินความเร่งด่วนล่าช้า**: การคัดกรองด้วยมนุษย์ทำให้ส่งเรือและอุปกรณ์กู้ภัยไปผิดลำดับความสำคัญ
4. **ข่าวปลอมและข้อมูลบิดเบือน**: ประชาชนตื่นตระหนกจากข่าวลือในโซเชียลมีเดียที่ไม่มีการตรวจสอบ

### ทำไมต้องพัฒนาระบบ AI มาช่วยแก้ปัญหานี้? (Why AI?)
* **AI Incident Triage**: วิเคราะห์ข้อความบรรยายร่วมกับระดับน้ำและตำแหน่งเสี่ยง เพื่อตรวจจับคำสำคัญวิกฤต เช่น *"ผู้ป่วยติดเตียง"*, *"ไฟรั่ว"*, *"น้ำท่วมมิดหลังคา"* และจัดลำดับความเร่งด่วน (**P1 Critical → P4 Normal**) ให้เจ้าหน้าที่ส่งทีมกู้ภัยได้ภายในเสี้ยววินาที
* **AI Situational Intelligence & News Agent**: ติดตามและสังเคราะห์ข่าวสารน้ำท่วมจากสำนักข่าวจริงแบบ Real-time ตัดข่าวลวง และสรุปใจความสำคัญให้เข้าใจง่าย
* **Automated Risk Engine**: ประมวลผลข้อมูลน้ำฝนสดจาก Open-Meteo, อัตราน้ำไหล GloFAS, และความสูงต่ำของภูมิประเทศแบบอัตโนมัติ 77 จังหวัด

---

## 3. สรุปความสามารถและการสาธิตระบบ (System Capabilities & Demo)

ระบบรองรับกลุ่มสมาชิกผู้ใช้งาน **2 กลุ่มหลัก** โดยสมบูรณ์:

### ฝั่งประชาชน (Citizen Experience)
- 📍 **ตรวจจับตำแหน่ง GPS สดอัตโนมัติ**: แสดงจุดที่อยู่ปัจจุบันพร้อมชื่อจังหวัดและอำเภอจริง (Nominatim Reverse Geocoding)
- 🌧️ **รายงานสภาพอากาศสดรายจุด**: ปริมาณฝนจริง, โอกาสฝนตก, อัตราน้ำไหลในแม่น้ำ, ความสูงต่ำ และอุณหภูมิ/ความชื้นสด
- 📝 **แจ้งเหตุน้ำท่วมพร้อมภาพถ่ายจริง**: รองรับการอัปโหลดภาพหลักฐานจากกล้องมือถือ (สูงสุด 5 MB) พร้อมระบุอำเภอและระดับน้ำ
- 🤖 **AI Risk & Triage Preview**: แสดงผลการคัดกรองความเร่งด่วนและคำแนะนำเบื้องต้นขณะกำลังพิมพ์แจ้งเหตุ
- 📂 **แท็บ "รายงานของฉัน" (My Reports)**: ตรวจสอบสถานะการตรวจสอบของเจ้าหน้าที่ และมีปุ่มยกเลิก/ลบรายงานของตนเอง
- 📰 **ศูนย์ข่าวสารน้ำท่วมสด**: ฟีดข่าวสารจริงจาก Google News Thailand RSS พร้อมคำสรุปจาก AI
- 📲 **ติดตั้งลงมือถือได้ทันที (Mobile PWA)**: ใช้งานแบบเต็มจอและรับสัญญาณแจ้งเตือนได้เหมือนแอปทั่วไป

### ฝั่งเจ้าหน้าที่ศูนย์บัญชาการ (Authority Operations Console)
- 📊 **Executive Dashboard**: สรุปสถิติรายงานจริงทั้งหมด, เคสรอการตรวจสอบ, และจำนวนเคสวิกฤต AI P1
- 📋 **ศูนย์คัดกรองกู้ภัยอัจฉริยะ**: ตารางรายงานแบบ Real-time (Server-Sent Events) พร้อมผลวิเคราะห์ AI Triage, แท็กความเสี่ยง, และคำแนะนำกู้ภัย
- 🔍 **ตัวกรองเคสวิกฤต (P1 Critical Filter)**: กดคลิกเดียวเพื่อแสดงเฉพาะเคสที่มีผู้สูงอายุ/ผู้ป่วยติดเตียง/ไฟรั่ว
- 🖼️ **ตรวจสอบภาพหลักฐาน (Photo Lightbox)**: คลิกดูรูปภาพขนาดใหญ่เพื่อยืนยันสภาพน้ำท่วมจริงในพื้นที่
- ⚡ **อนุมัติและจัดการสถานะ**: ยืนยันเหตุการณ์ (Verified), แจ้งแก้ไขแล้ว (Resolved), ปฏิเสธข่าวเท็จ (Rejected) หรือลบรายงานขยะ
- 🗺️ **ปรับความเสี่ยงรายจังหวัด (Manual Risk Override)**: ปรับระดับความเสี่ยงด้วยดุลยพินิจของเจ้าหน้าที่ พร้อมล็อกไม่ให้ระบบอัตโนมัติเขียนทับ
- 📢 **ออกประกาศเตือนภัยฉุกเฉิน (Emergency Broadcast)**: ส่งสัญญาณเตือนภัยพร้อมเสียงไซเรนฉุกเฉินและ Web Push Notification ถึงประชาชนทุกคนทันที

---

## 4. การสร้างทีมวิศวกรซอฟต์แวร์ด้วย Multi AI Agent (Agentic SDLC)

กระบวนการพัฒนาซอฟต์แวร์ทั้งระบบขับเคลื่อนด้วยทีม **Multi-AI Agent 18 บทบาท** ภายใต้ 7 ระยะของ SDLC:

| ระยะ SDLC | AI Agents ในทีม | หน้าที่และความรับผิดชอบ |
| :--- | :--- | :--- |
| **1. Discovery** | • Business Requirements Agent<br>• Flood Domain & Data Agent | วิเคราะห์ Pain Point, สัมภาษณ์ความต้องการผู้ใช้, รวบรวมข้อมูลอุทกวิทยา |
| **2. Product** | • Product Manager Agent | กำหนด PRD, User Stories, แผนการส่งมอบงาน |
| **3. Design** | • UX & Accessibility Agent<br>• GIS & Map Experience Agent | ออกแบบหน้าจอตามมาตรฐาน WCAG 2.1 AA และระบบแสดงผลแผนที่เชิงพื้นที่ |
| **4. Architecture** | • Solution Architect Agent<br>• Database & GIS Architect Agent<br>• Security & API Contract Agent | ออกแบบสถาปัตยกรรม Full-stack Monorepo, สกีมา PostGIS, และสัญญา API OpenAPI |
| **5. Implementation** | • Citizen Portal Frontend Agent<br>• Authority Dashboard Frontend Agent<br>• Identity & Access Backend Agent<br>• Incident, Broadcast & Realtime Agent<br>• Flood Risk & Data Engineering Agent<br>• Flood News & Intelligence Agent | เขียนโค้ดระบบจริงทั้ง Frontend (React/PWA), Backend (Express/SSE), AI Triage Engine, Weather Sync 77 จังหวัด |
| **6. Validation** | • QA Automation Agent<br>• Security & Privacy Review Agent<br>• Accessibility & Performance Agent | ตรวจสอบคุณภาพด้วย Unit Test 18/18 ชุด, ทดสอบเจาะช่องโหว่ OWASP, วัดความเร็ว Performance |
| **7. Operations** | • DevOps & Release Agent | กำหนดคอนฟิก Docker Compose, PWA Service Worker, และคู่มือส่งมอบงาน |

*มีจุดตรวจสอบโดยมนุษย์ (**5 Human Checkpoints**) ทุกครั้งก่อนเปลี่ยนผ่านระหว่างเฟส*

---

## 5. แผนการพัฒนาต่อยอดในอนาคต (Future Work Development)

1. **AI วิเคราะห์ภาพถ่ายดาวเทียมและภาพจากโดรน (Satellite & Drone Vision AI)**: นำโมเดล Computer Vision มาวิเคราะห์ระดับน้ำและขอบเขตพื้นที่น้ำท่วมจากภาพถ่ายทางอากาศแบบอัตโนมัติ
2. **การพยากรณ์น้ำท่วมล่วงหน้าด้วย Deep Learning (Hydrological Machine Learning)**: พัฒนาแบบจำลอง LSTM/Transformer เพื่อทำนายระดับน้ำท่วมล่วงหน้า 24–72 ชั่วโมงโดยวิเคราะห์ความลาดชันและอัตราการซึมของดิน
3. **ระบบนำทางเส้นทางอพยพหลีกเลี่ยงน้ำท่วม (Smart Evacuation Routing)**: เชื่อมต่อ OpenStreetMap Routing API เพื่อนำทางประชาชนไปยังศูนย์พักพิงที่ปลอดภัยที่สุดโดยหลีกเลี่ยงถนนที่ถูกตัดขาด
4. **การเชื่อมต่อกับระบบเตือนภัยระดับชาติ (Cell Broadcast Integration)**: บูรณาการร่วมกับระบบ Cell Broadcast Service (CBS) ของ กสทช. และกรมป้องกันและบรรเทาสาธารณภัย (ปภ.) เพื่อส่งข้อความเตือนภัยตรงเข้ามือถือทุกเครื่องในรัศมีเสี่ยงภัยโดยไม่ต้องต่ออินเทอร์เน็ต

---

## 6. เอกสารอ้างอิง (References)

1. **Department of Disaster Prevention and Mitigation (DDPM)**. (2024). *National Disaster Prevention and Mitigation Plan B.E. 2564–2570*. Ministry of Interior, Thailand.
2. **Open-Meteo Weather Forecast & GloFAS API Documentation**. (2024). *High-Resolution Ensemble Global Weather and River Discharge Data*. Open-Meteo.com.
3. **Open Web Application Security Project (OWASP)**. (2024). *OWASP Top 10 Web Application Security Risks*. OWASP Foundation.
4. **W3C Web Accessibility Initiative (WAI)**. (2023). *Web Content Accessibility Guidelines (WCAG) 2.1*. World Wide Web Consortium.
5. **OpenStreetMap Foundation & Leaflet.js**. (2024). *Geospatial Data Primitives and Interactive Vector Layer Rendering*.

---

## 7. ข้อมูลคณะผู้จัดทำและสถาบัน (Credits)

* **ภาควิชาวิศวกรรมคอมพิวเตอร์ คณะวิศวกรรมศาสตร์ มหาวิทยาลัยศรีนครินทรวิโรฒ (มศว)**
* **อาจารย์ที่ปรึกษา**: ผศ.วัชรชัย วิริยะสุทธิวงศ์

---

## 🚀 วิธีการติดตั้งและรันระบบ (Quick Start)

### ข้อกำหนดระบบ (Prerequisites)
* Node.js เวอร์ชัน 20 ขึ้นไป
* npm เวอร์ชัน 10 ขึ้นไป

### 1. ติดตั้ง Dependencies และเริ่มต้นระบบ
```bash
# จาก root ของโปรเจกต์
npm install

# รันระบบ Full-Stack (Frontend + Backend) พร้อมกัน
npm run dev
```

* **Frontend Web & PWA**: เข้าใช้งานที่ <http://localhost:5173>
* **Backend REST API**: ตรวจสอบสถานะที่ <http://localhost:4000/api/health>

### 2. บัญชีทดสอบสำหรับตรวจงาน (Test Accounts)
* **ประชาชน (Citizen)**: `citizen@example.com` / รหัสผ่าน: `citizen123`
* **เจ้าหน้าที่ (Authority)**: `admin@flood.go.th` / รหัสผ่าน: `admin123`
* *(หรือกดปุ่มสมัครสมาชิกใหม่ได้ทันที รหัสยืนยันเจ้าหน้าที่คือ `1784` หรือ `SWU-CPE-2026`)*

### 3. รันชุดทดสอบความปลอดภัยและการทำงาน
```bash
# รันชุดทดสอบ Backend & Security ทั้งหมด (18 Tests)
npm test

# Build โปรดักชันบันเดิลสำหรับ Web และ PWA
npm run build

# ตรวจสอบสถานะการทำงานของ 18 AI Agents
npm run agents:run
```

### 4. รันด้วย Docker Compose และ PostgreSQL / PostGIS (ทางเลือก)
```bash
docker compose up -d postgres
npm run dev
```
