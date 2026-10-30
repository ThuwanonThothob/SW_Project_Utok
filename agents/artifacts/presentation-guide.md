# คู่มือการนำเสนอและถ่ายทำคลิปส่งงาน (Presentation & Clip Guideline)

เอกสารนี้จัดทำตามโครงสร้างการนำเสนอ 7 ลำดับของรายวิชา เพื่อให้พร้อมสำหรับการนัด Run ตรวจและอัดคลิปส่งงาน

---

## ลำดับที่ 1) ชื่อ Software Project + Logo ระบบ

- **ชื่อระบบ**: **ThaiFlood Watch — Thailand Flood Risk Assessment & Incident Reporting Platform** (ระบบประเมินความเสี่ยง รายงานเหตุการณ์ และแจ้งเตือนภัยน้ำท่วมประเทศไทย 77 จังหวัด)
- **Logo ระบบ**: แสดงบนมุมซ้ายบนของเว็บไซต์ และไฟล์ไอคอนแอปพลิเคชันมือถือ [`frontend/public/icon-512.svg`](../../frontend/public/icon-512.svg)

---

## ลำดับที่ 2) Pain Point และทำไมต้องพัฒนาระบบ AI มาช่วยแก้ปัญหา

- **ปัญหา (Pain Point)**:
  1. ข้อมูลน้ำท่วมกระจัดกระจาย ประชาชนไม่ทราบระดับความเสี่ยงเฉพาะพื้นที่พักอาศัยของตนเองก่อนมวลน้ำมาถึง
  2. การแจ้งเหตุขอความช่วยเหลือของประชาชนขาดพิกัดที่แม่นยำและขาดการติดตามสถานะแบบ Real-time
  3. เจ้าหน้าที่ศูนย์บัญชาการรับข้อมูลจากหลายช่องทางทำให้คัดกรองความเร่งด่วน (Triage) และส่งสัญญาณเตือนภัยฉุกเฉินล่าช้า
- **ทำไมต้องพัฒนาระบบ AI & Agentic Engineering มาช่วยแก้ปัญหานี้**:
  1. **Explainable Flood Risk Scoring Model**: ประมวลผลปัจจัยอุทกวิทยาและภูมิสารสนเทศ 3 มิติ (ปริมาณน้ำฝนสะสม, ระยะห่างจากแม่น้ำสายหลัก, ความสูงภูมิประเทศ) ร่วมกับจำนวนรายงานเหตุจริงในพื้นที่ เพื่อคำนวณคะแนนความเสี่ยง (0–100%) และแปลผลเป็นคำแนะนำการปฏิบัติตนอัตโนมัติครบ 77 จังหวัด
  2. **Multi-Agent Software Engineering (Agentic SDLC)**: ใช้ทีม AI Agents เฉพาะทาง 17 ตัวทำงานร่วมกันตั้งแต่การวิเคราะห์โดเมนอุทกภัย ออกแบบ GIS/UX สถาปัตยกรรม PostGIS พัฒนาระบบ Real-time SSE ไปจนถึงการตรวจสอบความปลอดภัยและประสิทธิภาพ โดยมีมนุษย์ควบคุมคุณภาพทุก Checkpoint

---

## ลำดับที่ 3) Demo การทำงานของระบบ (ครบทุกกรณีที่ระบบทำได้)

1. **การสมัครสมาชิกจริงและเข้าสู่ระบบของกลุ่มผู้ใช้ 2 กลุ่ม (Persistent Registration & Login)**:
   - **กลุ่มที่ 1: ประชาชน (`Citizen`)** — กดปุ่มเข้าสู่ระบบ → เลือกแท็บ **สมัครสมาชิกจริง** → กรอกชื่อ อีเมล รหัสผ่าน เบอร์โทร และเลือกจังหวัด/อำเภอที่พักอาศัย → ระบบบันทึกบัญชีลงฐานข้อมูลถาวรและเข้าสู่ระบบทันที
   - **กลุ่มที่ 2: เจ้าหน้าที่ (`Authority`)** — สลับไปโหมดเจ้าหน้าที่ → สมัครสมาชิกเจ้าหน้าที่ใหม่ด้วยรหัสยืนยันหน่วยงาน (`1784` หรือ `SWU-CPE-2026`) หรือเข้าสู่ระบบศูนย์บัญชาการ
2. **การสำรวจแผนที่ความเสี่ยง 77 จังหวัด & แจ้งเหตุน้ำท่วม (Citizen Flow)**:
   - ค้นหาหรือคลิกจังหวัดบนแผนที่ประเทศไทย ดูคะแนนความเสี่ยง ปริมาณฝน ระยะแม่น้ำ และความสูงพื้นที่
   - คลิกพิกัดบนแผนที่หรือกดปุ่มแจ้งเหตุ → เลือกระดับน้ำ แนบรูปภาพ กดขอความช่วยเหลือด่วน → รายงานปรากฏบนแผนที่และในประวัติรายงานของฉันทันที
3. **การตรวจสอบรายงาน ปรับระดับความเสี่ยง และประกาศเตือนภัย (Authority Flow)**:
   - เจ้าหน้าที่ดู Dashboard สรุปสถิติ ค้นหา/กรองรายงาน กด **ยืนยัน (Verify)** หรือ **แก้ไขแล้ว (Resolve)** → สถานะฝั่งประชาชนอัปเดตแบบ Real-time
   - ปรับระดับความเสี่ยงรายจังหวัด (ต่ำ / ปานกลาง / สูง) และสร้างประกาศเตือนภัยฉุกเฉิน (Broadcast)
4. **การทดสอบระบบแจ้งเตือนจริง (Notification Test Lab)**:
   - กดไอคอนกระดิ่งแจ้งเตือน (หรือปุ่ม **ทดสอบแจ้งเตือน**) → กดเปิดสิทธิ์แจ้งเตือนบนอุปกรณ์ → กดปุ่ม **"ทดสอบแจ้งเตือน + เสียงบนอุปกรณ์นี้"** และ **"ยิงทดสอบ Real-time ไปยังทุกเครื่อง"** → แสดง Push Notification ของระบบปฏิบัติการพร้อมเสียงสัญญาณเตือนภัยฉุกเฉิน
5. **การติดตั้งเป็นแอปพลิเคชันบนมือถือ (Mobile App / PWA)**:
   - กดปุ่ม **"แอปมือถือ"** บนแถบด้านบน → แสดงวิธีติดตั้งแอปลงหน้าจอมือถือ (Install App / Add to Home Screen) ทั้ง iOS และ Android พร้อมลิงก์ Wi-Fi LAN และแถบเมนูด้านล่างสำหรับใช้งานบนมือถือ

---

## ลำดับที่ 4) การสร้าง Software Engineer Team ด้วย Multi AI Agent ตาม SDLC

### 4.1 Software Engineer Team : 17 AI Agents (7 Phases)
- **Phase 1 — Discovery**: `Business Requirements Agent`, `Flood Domain & Data Agent`
- **Phase 2 — Product**: `Product Manager Agent`
- **Phase 3 — Design**: `UX & Accessibility Agent`, `GIS & Map Experience Agent`
- **Phase 4 — Architecture**: `Solution Architect Agent`, `Database & GIS Architect Agent`, `Security & API Contract Agent`
- **Phase 5 — Implementation**: `Citizen Portal Frontend Agent`, `Authority Dashboard Frontend Agent`, `Identity & Access Backend Agent`, `Incident, Broadcast & Realtime Agent`, `Flood Risk & Data Engineering Agent`
- **Phase 6 — Validation**: `QA Automation Agent`, `Security & Privacy Review Agent`, `Accessibility & Performance Agent`
- **Phase 7 — Operations**: `DevOps & Release Agent`

### 4.2 AI Agents Workflow
- ทำงานตามโครงสร้าง Dependency Graph (46 Handoffs) และมี **5 Human-in-the-Loop Checkpoints** (`requirements`, `experience`, `architecture`, `integration`, `release`)
- ทุกชิ้นงาน (Artifacts & Source Files) ถูกตรวจสอบและบันทึกหลักฐานด้วยรหัส SHA-256 ลงใน `agents/logs/workflow-state.json`

### 4.3 Design & Dev Tools
- **Frontend & Mobile PWA**: React 18, Vite, Leaflet GIS Map, Lucide Icons, Service Worker & Web App Manifest, Web Audio & Notification API
- **Backend & Realtime**: Node.js 20+, Express.js, Server-Sent Events (SSE), JWT, bcryptjs, Multer, Helmet
- **Database & Dataset**: PostgreSQL 16 + PostGIS 3.4, Persistent JSON Runtime Store (`runtime-store.json`), Thailand 77 Provinces Flood Risk Dataset (`.csv` / `.json`)
- **Agentic Orchestration**: Custom Node.js Agentic SDLC Runner (`npm run agents:status`, `npm run agents:run`, `npm run agents:approve`)

---

## ลำดับที่ 5) Future Work Development

1. **Real-time Hydrology & Satellite Integration**: เชื่อมต่อ API คลังข้อมูลน้ำแห่งชาติ (ThaiWater) ของ สสน. และข้อมูลดาวเทียม GISTDA เพื่อดึงค่าฝนและระดับน้ำจริงแบบอัตโนมัติ
2. **AI Computer Vision & Deep Learning Forecasting**: ใช้โมเดลภาพวิเคราะห์ระดับน้ำจากรูปถ่ายที่ประชาชนอัปโหลดอัตโนมัติ และใช้โมเดล Time-Series พยากรณ์น้ำท่วมล่วงหน้า 24–72 ชั่วโมง
3. **Omnichannel Emergency Broadcast**: เชื่อมต่อระบบ SMS Gateway, LINE Official Account และ Cell Broadcast สำหรับแจ้งเตือนประชาชนในพื้นที่ที่อินเทอร์เน็ตขัดข้อง
4. **Smart Rescue Dispatch**: ระบบบริหารจัดการยานพาหนะกู้ภัย เรือท้องแบน และศูนย์พักพิง พร้อมจัดคิวช่วยเหลือผู้ประสบภัยกลุ่มเปราะบาง

---

## ลำดับที่ 6) References (รายการอ้างอิง)

1. สถาบันสารสนเทศทรัพยากรน้ำ (องค์การมหาชน). (2567). *คลังข้อมูลน้ำแห่งชาติ (ThaiWater)*. สืบค้นจาก https://www.thaiwater.net
2. สำนักงานพัฒนาเทคโนโลยีอวกาศและภูมิสารสนเทศ (GISTDA). (2567). *ระบบติดตามสถานการณ์น้ำท่วมจากดาวเทียม (Thailand Flood Monitoring System)*. สืบค้นจาก https://flood.gistda.or.th
3. กรมป้องกันและบรรเทาสาธารณภัย กระทรวงมหาดไทย. (2567). *แนวทางการแจ้งเตือนภัยพิบัติและศูนย์นิรภัย 1784*. สืบค้นจาก https://www.disaster.go.th
4. PostGIS Project Steering Committee. (2024). *PostGIS Spatial and Geographic Objects for PostgreSQL Documentation*. Retrieved from https://postgis.net/documentation/
5. Mozilla Developer Network (MDN) & W3C. (2024). *Progressive Web Apps (PWA), Service Worker API, and Web Notifications Specification*. Retrieved from https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps

---

## ลำดับที่ 7) ข้อมูลผู้จัดทำและอาจารย์ที่ปรึกษา

- **คณะผู้จัดทำ**: *(ใส่ชื่อ–นามสกุลสมาชิกในกลุ่ม ไม่ต้องใส่คำนำหน้า นาย/นางสาว และไม่ต้องแสดงรหัสนิสิต + แนบภาพหมู่สมาชิก)*
- **สังกัด**: ภาควิชาวิศวกรรมคอมพิวเตอร์ คณะวิศวกรรมศาสตร์ มหาวิทยาลัยศรีนครินทรวิโรฒ *(พร้อมแสดงภาพ LOGO มศว)*
- **อาจารย์ที่ปรึกษา**: ผศ.วัชรชัย วิริยะสุทธิวงศ์
