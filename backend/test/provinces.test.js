import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { provinceCatalog } from "../src/data/provinceCatalog.js";
import { seedProvinces } from "../src/data/seed.js";

const expectedNames = [
  "กรุงเทพมหานคร", "นครปฐม", "นนทบุรี", "ปทุมธานี", "สมุทรปราการ", "สมุทรสาคร",
  "พระนครศรีอยุธยา", "อ่างทอง", "ชัยนาท", "ลพบุรี", "นครนายก", "สระบุรี", "สิงห์บุรี", "สุพรรณบุรี", "กาญจนบุรี", "ราชบุรี", "เพชรบุรี", "ประจวบคีรีขันธ์", "สมุทรสงคราม",
  "เชียงใหม่", "เชียงราย", "ลำปาง", "ลำพูน", "แม่ฮ่องสอน", "น่าน", "พะเยา", "แพร่", "อุตรดิตถ์", "ตาก", "สุโขทัย", "พิษณุโลก", "พิจิตร", "กำแพงเพชร", "นครสวรรค์", "อุทัยธานี", "เพชรบูรณ์",
  "กาฬสินธุ์", "ขอนแก่น", "ชัยภูมิ", "นครพนม", "นครราชสีมา", "บึงกาฬ", "บุรีรัมย์", "มหาสารคาม", "มุกดาหาร", "ยโสธร", "ร้อยเอ็ด", "เลย", "สกลนคร", "สุรินทร์", "ศรีสะเกษ", "หนองคาย", "หนองบัวลำภู", "อำนาจเจริญ", "อุดรธานี", "อุบลราชธานี",
  "ฉะเชิงเทรา", "ชลบุรี", "ระยอง", "จันทบุรี", "ตราด", "ปราจีนบุรี", "สระแก้ว",
  "ชุมพร", "ระนอง", "สุราษฎร์ธานี", "พังงา", "ภูเก็ต", "กระบี่", "นครศรีธรรมราช", "ตรัง", "พัทลุง", "สตูล", "สงขลา", "ปัตตานี", "ยะลา", "นราธิวาส",
];

test("province catalog covers all 77 provinces exactly once", () => {
  assert.equal(provinceCatalog.length, 77);
  assert.equal(new Set(provinceCatalog.map((item) => item.id)).size, 77);
  assert.deepEqual(new Set(provinceCatalog.map((item) => item.name)), new Set(expectedNames));
});

test("province seed has operational risk data for every province", () => {
  assert.equal(seedProvinces.length, 77);
  for (const province of seedProvinces) {
    assert.ok(province.region);
    assert.ok(Number.isFinite(province.lat) && Number.isFinite(province.lng));
    assert.ok(province.score >= 0 && province.score <= 100);
    assert.ok(["low", "medium", "high"].includes(province.risk));
    assert.ok(province.updatedAt);
  }
});

test("regional coverage totals 77 provinces", () => {
  const totals = Object.fromEntries([...new Set(provinceCatalog.map((item) => item.region))].map((region) => [region, provinceCatalog.filter((item) => item.region === region).length]));
  assert.deepEqual(totals, {
    "กรุงเทพมหานครและปริมณฑล": 6,
    "ภาคกลางและตะวันตก": 13,
    "ภาคเหนือ": 17,
    "ภาคตะวันออกเฉียงเหนือ": 20,
    "ภาคตะวันออก": 7,
    "ภาคใต้": 14,
  });
});

test("PostgreSQL seed includes the same 77-province catalog", async () => {
  const sql = await readFile(new URL("../../database/seed.sql", import.meta.url), "utf8");
  for (const province of provinceCatalog) {
    assert.match(sql, new RegExp(`\\('${province.id}','${province.name}'`));
  }
});

test("createBroadcast and deleteBroadcast allow authorities to manage active alerts lifecycle", async () => {
  const { createBroadcast, deleteBroadcast, listBroadcasts } = await import("../src/data/repository.js");
  const created = await createBroadcast({
    level: "red",
    province: "เชียงใหม่",
    headline: "ทดสอบเตือนภัยน้ำท่วม",
    advisory: "ทดสอบการยกเลิกประกาศ",
  });
  assert.ok(created.id);
  const beforeList = await listBroadcasts();
  assert.ok(beforeList.some((b) => b.id === created.id));
  const deleted = await deleteBroadcast(created.id);
  assert.equal(deleted, true);
  const afterList = await listBroadcasts();
  assert.ok(!afterList.some((b) => b.id === created.id));
});
