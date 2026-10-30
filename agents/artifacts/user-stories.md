# User Stories & Acceptance Criteria

## Citizen

### US-C01 — สมัครสมาชิก

ในฐานะประชาชน ฉันต้องการสมัครสมาชิกพร้อมพื้นที่บ้าน เพื่อให้ระบบแสดงบริบทความเสี่ยงที่เกี่ยวข้องกับฉัน

- Given ผู้ใช้กรอกชื่อ อีเมล รหัสผ่านอย่างน้อย 8 ตัว และพื้นที่บ้าน
- When ส่งแบบฟอร์มสมัครสมาชิก
- Then ระบบสร้างบัญชี role `citizen`, hash รหัสผ่าน และออก JWT
- And อีเมลที่ซ้ำต้องได้รับ HTTP 409

### US-C02 — Login และดูข้อมูลสมาชิก

- Given บัญชี Citizen ที่ถูกต้อง
- When Login สำเร็จ
- Then ระบบแสดงชื่อ พื้นที่บ้าน และจำนวนรายงานของฉัน
- And token ต้องไม่ให้สิทธิ์ moderation หรือ broadcast

### US-C03 — รายงานน้ำท่วม

- Given Citizen Login แล้วและเลือกพิกัด
- When ระบุระดับน้ำ รายละเอียด และส่งรายงาน
- Then ระบบสร้างสถานะ `pending` และผูกรายงานกับ user ID
- And แสดงรายงานบนแผนที่และประวัติของสมาชิก

### US-C04 — ทดสอบระบบแจ้งเตือนภัยน้ำท่วม (Notification Test Lab)

- Given ผู้ใช้เปิดศูนย์การแจ้งเตือน (Notification Center & Test Lab)
- When กดปุ่มเปิดสิทธิ์การแจ้งเตือนและกดปุ่มทดสอบการแจ้งเตือน (Local Push หรือ Real-time SSE Broadcast)
- Then อุปกรณ์แสดง System/Mobile Push Notification พร้อมส่งเสียงสัญญาณเตือนภัยฉุกเฉิน
- And ทุกเบราว์เซอร์หรือมือถือที่เชื่อมต่ออยู่ได้รับข้อความแจ้งเตือนแบบ Real-time ทันที

### US-C05 — ติดตั้งเป็นแอปพลิเคชันลงมือถือ (Install Mobile App / PWA)

- Given ผู้ใช้เปิดระบบผ่านเบราว์เซอร์บนมือถือ (iOS Safari / Android Chrome) หรือกดปุ่ม "แอปมือถือ"
- When กดปุ่มติดตั้งแอป (Install App / Add to Home Screen)
- Then ระบบติดตั้งไอคอน ThaiFlood ลงบนหน้าจอหลักของมือถือและเปิดใช้งานแบบ Full-screen Standalone App ได้

### US-C06 — AI วิเคราะห์ความรุนแรงอัตโนมัติ (AI Incident Triage) และดูประวัติรายงานของฉัน

- Given ประชาชนกำลังกรอกรายละเอียดแจ้งเหตุน้ำท่วมและแนบรูปภาพ
- When ระบุคำสำคัญ เช่น ผู้สูงอายุ ผู้ป่วยติดเตียง ไฟรั่ว หรือน้ำท่วมมิดหลังคา
- Then โมดูล AI Triage คำนวณคะแนนความเร่งด่วน (P1–P4) สกัดป้ายความเสี่ยง และสรุปคำแนะนำการกู้ภัยอัตโนมัติแสดงทั้งฝั่งประชาชนและตารางของเจ้าหน้าที่
- And ประชาชนสามารถกดสลับแท็บ "รายงานของฉัน" เพื่อติดตามสถานะการตรวจสอบและดูรูปภาพที่แนบได้

### US-C07 — ติดตามข่าวสารน้ำท่วมในไทยแบบ Real-time ด้วย AI News Agent

- Given ผู้ใช้เปิดดูส่วนข่าวสารสถานการณ์น้ำท่วม
- When กดปุ่มสั่ง AI Agent สแกนข่าวล่าสุด
- Then `Flood News & Situational Intelligence Agent` ดึงข่าวสารน้ำท่วมในไทย วิเคราะห์ระดับความรุนแรง ระบุจังหวัดที่เกี่ยวข้อง และส่งอัปเดตแบบ Real-time ผ่าน SSE

## Authority

### US-A01 — Login และสมัครสมาชิกเจ้าหน้าที่

- Given บัญชี role `authority` หรือเจ้าหน้าที่ใหม่ที่มีรหัสยืนยันหน่วยงาน (`1784` / `SWU-CPE-2026`)
- When สมัครสมาชิกหรือ Login สำเร็จ
- Then เปิด Authority dashboard ได้และบันทึกบัญชีลงฐานข้อมูลอย่างถาวร
- And บัญชี Citizen หรือผู้ไม่มีรหัสยืนยันที่พยายามเข้า Authority mode ต้องถูกปฏิเสธ

### US-A02 — ตรวจสอบรายงาน

- Given Authority Login แล้ว
- When เลือก Verify, Resolve หรือ Reject
- Then API เปลี่ยนสถานะและส่ง SSE event ให้ client อื่น refresh

### US-A03 — Broadcast

- Given Authority Login แล้ว
- When กรอกระดับ พื้นที่ หัวข้อ และคำแนะนำ
- Then ประกาศใหม่ต้องปรากฏใน Citizen portal แบบ real-time พร้อมแจ้งเตือนเสียงและ Push Notification

## Human Orchestrator

### US-H01 — กำกับ Agentic workflow

- Given agent artifacts ของ phase ปัจจุบันเสร็จแล้ว
- When workflow ถึง checkpoint
- Then ระบบอ่าน `human-approvals.json`
- And หยุด workflow หากสถานะยังเป็น `pending`
- And บันทึกทุก agent run ลง JSONL เพื่อ audit ได้
