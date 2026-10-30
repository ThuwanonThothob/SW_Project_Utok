# Product Requirement Document

## Product

**ThaiFlood Watch — Thailand Flood Risk Assessment & Incident Reporting System**

## Problem statement

ประชาชนต้องการช่องทางเดียวสำหรับตรวจสอบความเสี่ยงน้ำท่วม รายงานเหตุจากพื้นที่ และรับประกาศฉุกเฉิน ขณะที่เจ้าหน้าที่ต้องสามารถตรวจสอบข้อมูลภาคประชาชน ปรับระดับความเสี่ยง และกระจายคำเตือนได้อย่างรวดเร็ว

## User groups

### Citizen member

- สมัครสมาชิกและเข้าสู่ระบบด้วยอีเมล/รหัสผ่าน
- บันทึกจังหวัดและอำเภอของที่พักอาศัย
- ตรวจคะแนนความเสี่ยงบนแผนที่
- ส่งรายงานพร้อมพิกัด ระดับน้ำ รายละเอียด รูปภาพ และคำขอความช่วยเหลือ
- ดูประวัติรายงานของตนเองและรับ emergency broadcast

### Authority / Rescuer

- เข้าสู่ระบบด้วยบัญชีที่มี role `authority`
- ดูตัวชี้วัดและรายงานทุกพื้นที่
- ยืนยัน ปิดเคส หรือปฏิเสธรายงาน
- ปรับคะแนนและระดับความเสี่ยงรายจังหวัด
- ส่งประกาศ Warning, Red Alert หรือ Evacuation

## Functional requirements

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-01 | Citizen registration/login และ JWT session | Must |
| FR-02 | Authority login และ role-based access control | Must |
| FR-03 | Interactive flood map และ risk zones | Must |
| FR-04 | Incident report พร้อมพิกัด รูป และ urgent flag | Must |
| FR-05 | Authority moderation workflow | Must |
| FR-06 | Emergency broadcast และ real-time SSE update | Must |
| FR-07 | Citizen home area และ personal report history | Must |
| FR-08 | PostgreSQL/PostGIS persistence พร้อม demo memory mode | Should |
| FR-09 | Responsive mobile/desktop experience | Must |
| FR-10 | ข้อมูลและการจัดการความเสี่ยงครอบคลุมครบ 77 จังหวัด แยกตามภูมิภาค | Must |
| FR-11 | ระบบสมัครสมาชิกและบันทึกข้อมูลจริงแบบถาวร (Persistent Storage) ทั้ง Citizen และ Authority | Must |
| FR-12 | ระบบแจ้งเตือนจริง (Web Push / Service Worker / เสียงเตือนภัย) พร้อมศูนย์ทดสอบการแจ้งเตือน (Notification Test Lab) | Must |
| FR-13 | รองรับการติดตั้งเป็นแอปพลิเคชันบนมือถือ (Progressive Web App — iOS & Android Standalone App) | Must |
| FR-14 | โมดูล AI วิเคราะห์ความรุนแรงและคัดกรองเหตุอัตโนมัติ (AI Risk & Incident Triage) พร้อมแนะนำการปฏิบัติการกู้ภัย | Must |
| FR-15 | AI Agent ติดตามข่าวสารน้ำท่วมในประเทศไทยแบบ Real-time (Flood News & Situational Intelligence Agent) | Must |

## Non-functional requirements

- Password hash ด้วย bcrypt; JWT หมดอายุภายใน 8 ชั่วโมง และคงสถานะเข้าสู่ระบบบนอุปกรณ์ด้วย Persistent Storage
- ข้อมูลสมาชิก รายงาน และประกาศถูกบันทึกลงดิสก์อย่างถาวร (`runtime-store.json` หรือ PostgreSQL/PostGIS)
- SQL ต้องใช้ parameterized queries
- รูปภาพต้องเป็นชนิด image และไม่เกิน 2 MB
- หน้าเว็บต้อง build ได้ด้วย Vite รองรับ Service Worker + Web App Manifest สำหรับติดตั้งลงมือถือ
- API ต้องมี health endpoint, network-info endpoint และ graceful shutdown
- ข้อมูลตัวอย่างต้องระบุชัดว่าไม่ใช่ประกาศทางการ

## Success criteria

1. สมาชิก Citizen และ Authority สมัครสมาชิกจริงและเข้าสู่ระบบด้วยบัญชีคนละ role ได้อย่างถาวร
2. Citizen ส่งรายงานที่ผูกกับ user ID ของตนเองได้
3. Citizen ไม่สามารถเรียก authority endpoints ได้
4. Authority เปลี่ยนสถานะรายงานและส่ง broadcast ได้
5. ผู้ใช้สามารถกดทดสอบระบบแจ้งเตือน (Notification Test Lab) ทั้งแบบแจ้งเตือนบนอุปกรณ์พร้อมเสียงสัญญาณเตือนภัย และแบบ Real-time SSE ไปยังทุกเครื่องได้
6. สามารถติดตั้งเป็นแอปพลิเคชันลงมือถือ (Add to Home Screen / Install App) ได้ทั้ง iOS และ Android
7. Unit tests, production build และ npm audit ผ่าน

## Future Work Development (แนวทางการพัฒนาต่อยอดในอนาคต)

1. **เชื่อมต่อ API ข้อมูลอุทกวิทยาและดาวเทียมแบบ Real-time**: เชื่อมต่อคลังข้อมูลน้ำแห่งชาติ (ThaiWater API ของ สสน.) และภาพถ่ายดาวเทียมน้ำท่วมจาก GISTDA เพื่ออัปเดตปริมาณน้ำฝนและพื้นที่น้ำท่วมขังจริงอัตโนมัติ
2. **ยกระดับโมเดล AI พยากรณ์น้ำท่วมและคัดกรองเหตุวิกฤต (AI/ML Forecasting & Multimodal Triage)**: ใช้ Computer Vision วิเคราะห์ระดับน้ำจากภาพถ่ายที่ประชาชนส่งเข้ามาอัตโนมัติ และใช้ Time-Series Deep Learning (LSTM/Transformer) พยากรณ์ระดับน้ำล่วงหน้า 24–72 ชั่วโมง
3. **ขยายช่องทางแจ้งเตือนฉุกเฉินหลายช่องทาง (Omnichannel Alerting)**: เชื่อมต่อระบบ Cell Broadcast, SMS Gateway และ LINE Official Account สำหรับพื้นที่อับสัญญาณอินเทอร์เน็ต
4. **ระบบบริหารจัดการทรัพยากรกู้ภัย (Rescue Dispatch & Asset Tracking)**: ติดตามพิกัดเรือท้องแบน รถกู้ภัย และศูนย์พักพิงชั่วคราว พร้อมจัดลำดับคิวช่วยเหลือตามความเร่งด่วน

## References

1. สถาบันสารสนเทศทรัพยากรน้ำ (องค์การมหาชน) — *คลังข้อมูลน้ำแห่งชาติ (ThaiWater)*: https://www.thaiwater.net
2. สำนักงานพัฒนาเทคโนโลยีอวกาศและภูมิสารสนเทศ (GISTDA) — *ระบบติดตามสถานการณ์น้ำท่วมจากดาวเทียม (Thailand Flood Monitoring System)*: https://flood.gistda.or.th
3. กรมป้องกันและบรรเทาสาธารณภัย (ปภ.) กระทรวงมหาดไทย — *มาตรฐานการแจ้งเตือนภัยและสายด่วนนิรภัย 1784*: https://www.disaster.go.th
4. PostGIS Project Steering Committee — *PostGIS 3.4 Spatial and Geographic Objects for PostgreSQL Documentation*: https://postgis.net/documentation/
5. World Wide Web Consortium (W3C) & MDN — *Progressive Web Apps (PWA), Service Workers, and Web Notifications API Specification*: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps
