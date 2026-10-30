# Agentic Engineering Workflow

โฟลเดอร์นี้เป็นหลักฐานว่า ThaiFlood Watch ใช้ทีม Software Engineering Agents แบบแบ่งความรับผิดชอบและมี Human-in-the-loop ไม่ใช่การใช้ AI สร้างโค้ดครั้งเดียว

## Team topology

ระบบประกอบด้วย **17 specialized agents ใน 7 phases**:

| Phase | Agents | Human gate |
| --- | --- | --- |
| Discovery | Business Requirements; Flood Domain & Data | — |
| Product | Product Manager | Requirements approval |
| Design | UX & Accessibility; GIS & Map Experience | Experience approval |
| Architecture | Solution; Database & GIS; Security & API Contract | Architecture approval |
| Implementation | Citizen Frontend; Authority Frontend; Identity Backend; Incident/Broadcast/Realtime; Risk & Data Engineering | Integration approval |
| Validation | QA Automation; Security & Privacy Review; Accessibility & Performance | — |
| Operations | DevOps & Release | Release approval |

นิสิตเป็น **Human Orchestrator** มีหน้าที่กำหนดโจทย์ ตรวจ outputs ส่ง feedback และอนุมัติ checkpoints ระบบจะหยุดทันทีหาก gate ใดยังเป็น `pending`.

## Clear division of work

แต่ละ Agent ใน `team.json` ต้องประกาศข้อมูลต่อไปนี้:

- `workstream` — ขอบเขตงานที่ Agent เป็นเจ้าของ
- `responsibilities` — งานที่ต้องรับผิดชอบ
- `inputs` — ข้อมูลจาก Agent ต้นทาง
- `dependsOn` — Agent ที่ต้องทำงานเสร็จก่อน
- `outputs` — ไฟล์หลักฐานที่ตรวจสอบได้
- `handoffTo` — Agent หรือ Human ที่รับช่วงต่อ

Runtime ตรวจว่า Agent ID ไม่ซ้ำ, dependency มีอยู่จริงและมาจาก phase ก่อนหน้า, handoff มีผู้รับจริง และทุก Agent มี output อย่างน้อยหนึ่งรายการ หาก topology ไม่ถูกต้อง workflow จะไม่เริ่มทำงาน

แผน dependency และ handoff ฉบับอ่านง่ายอยู่ที่ [`artifacts/agent-operating-model.md`](artifacts/agent-operating-model.md).

## Run and inspect

```bash
npm run agents:status
npm run agents:run
```

`agents:status` แสดง phase, workstream, upstream dependencies และ downstream handoffs ของ Agents ทุกตัว

`agents:run` ทำงานตาม dependency order, ตรวจ prompt และ output, สร้าง SHA-256 evidence แล้วบันทึก:

- `logs/agent-execution.jsonl` — ผลการทำงานราย Agent
- `logs/workflow-state.json` — สถานะทั้ง workflow, checkpoints และ handoff records

## Human approval

Release gate ตั้งเป็น `pending` โดยตั้งใจ หลังนิสิตตรวจ PRD, architecture, tests, security review, accessibility report และ deployment runbook แล้วจึงอนุมัติ:

```bash
npm run agents:approve -- release "Student Name" "ตรวจหลักฐานและอนุมัติส่งงาน"
npm run agents:run
```

ไฟล์ `human-approvals.json` จะบันทึก actor, timestamp และหมายเหตุ ห้ามอนุมัติ release เพียงเพื่อให้ workflow เป็นสีเขียวโดยไม่ได้ตรวจหลักฐาน

## Optional external LLM

ค่าเริ่มต้นใช้ local artifact verifier เพื่อให้สาธิตได้โดยไม่เปิดเผย API key หากต้องการให้ Agent ส่ง prompt ไปยัง LLM ที่รองรับ Chat Completions API:

```bash
export AGENT_LLM_ENDPOINT=https://your-provider.example/v1/chat/completions
export AGENT_LLM_API_KEY=your-key
export AGENT_LLM_MODEL=your-model
npm run agents:run
```

API key อยู่ใน environment เท่านั้นและไม่ถูกบันทึกลง repository หรือ execution logs
