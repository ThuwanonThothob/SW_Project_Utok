import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeFileName, sanitizeText } from "../src/utils/sanitize.js";
import { createReport, deleteReport, listReports } from "../src/data/repository.js";

test("sanitizeText escapes dangerous HTML tags to prevent XSS", () => {
  const dirty = "<script>alert('xss')</script> & <b>น้ำท่วม</b> \"critical\"";
  const cleaned = sanitizeText(dirty);
  assert.equal(cleaned.includes("<script>"), false);
  assert.equal(cleaned.includes("&lt;script&gt;"), true);
  assert.equal(cleaned.includes("&amp;"), true);
  assert.equal(cleaned.includes("&quot;critical&quot;"), true);
});

test("sanitizeFileName strips directory traversal and dangerous characters", () => {
  const dirty = "../../../etc/passwd.jpg";
  const cleaned = sanitizeFileName(dirty);
  assert.equal(cleaned.includes(".."), false);
  assert.equal(cleaned.includes("/"), false);
});

test("deleteReport allows authority or owner to delete a report and updates affected count", async () => {
  const report = await createReport({
    province: "เชียงใหม่",
    district: "อ.เมือง",
    level: "50–100 ซม.",
    description: "น้ำท่วมเข้าบ้าน",
    lat: 18.7883,
    lng: 98.9853,
    reporter: "ทดสอบความปลอดภัย",
    reporterId: "user-owner-123",
  });

  assert.ok(report.id);

  // Unauthorized user cannot delete
  await assert.rejects(
    () => deleteReport(report.id, { role: "citizen", sub: "intruder-999" }),
    (err) => err.status === 403,
  );

  // Owner can delete
  const deleted = await deleteReport(report.id, { role: "citizen", sub: "user-owner-123" });
  assert.ok(deleted);
  assert.equal(deleted.id, report.id);

  // Report should no longer be listed
  const reports = await listReports();
  assert.equal(reports.some((r) => r.id === report.id), false);
});
