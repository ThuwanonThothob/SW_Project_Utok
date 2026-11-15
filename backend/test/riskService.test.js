import test from "node:test";
import assert from "node:assert/strict";
import { calculateRiskScore, normalizeRiskLevel } from "../src/services/riskService.js";
import { analyzeIncidentTriage } from "../src/services/aiTriageService.js";
import { getFloodNews } from "../src/services/newsAgentService.js";
import { createReport, listReports, upvoteReport } from "../src/data/repository.js";

test("normalizeRiskLevel separates low, medium, and high risk", () => {
  assert.equal(normalizeRiskLevel(20), "low");
  assert.equal(normalizeRiskLevel(45), "medium");
  assert.equal(normalizeRiskLevel(80), "high");
});

test("calculateRiskScore raises risk for heavy rain, nearby rivers, and low elevation", () => {
  const dangerous = calculateRiskScore({ rainfallMm: 150, riverDistanceKm: 0.2, elevationM: 1 });
  const safe = calculateRiskScore({ rainfallMm: 15, riverDistanceKm: 8, elevationM: 120 });
  assert.ok(dangerous.score > safe.score);
  assert.equal(dangerous.level, "high");
  assert.equal(safe.level, "low");
});

test("analyzeIncidentTriage assigns critical priority for vulnerable groups and electrical hazards", () => {
  const result = analyzeIncidentTriage({
    description: "น้ำท่วมเข้าบ้าน มีผู้สูงอายุและผู้ป่วยติดเตียง มีไฟรั่วที่เสาไฟหน้าบ้าน",
    level: "มากกว่า 100 ซม.",
    province: "พระนครศรีอยุธยา",
    urgent: true,
    provinceRiskScore: 91,
  });
  assert.equal(result.priority, "critical");
  assert.ok(result.score >= 80);
  assert.ok(result.tags.includes("อันตรายต่อชีวิต/กระแสไฟ/น้ำเชี่ยว"));
  assert.ok(result.tags.includes("กลุ่มเปราะบาง (ผู้สูงอายุ/ผู้ป่วย/เด็ก)"));
  assert.match(result.recommendation, /ตัดกระแสไฟ|เรือท้องแบน/);
  assert.equal(result.analyzedBy, "AI Incident Triage Agent v2.0");
});

test("listReports attaches aiTriage, description, and photo to created reports without fake seed reports", async () => {
  const created = await createReport({
    province: "เชียงใหม่",
    district: "อ.เมืองเชียงใหม่",
    reporter: "ผู้รายงานจริง",
    level: "50–100 ซม.",
    description: "น้ำท่วมถนนหน้าหมู่บ้าน รถเล็กผ่านไม่ได้",
    urgent: true,
    lat: 18.7883,
    lng: 98.9853,
  });
  assert.ok(created.aiTriage);
  const reports = await listReports({ limit: 5 });
  assert.ok(reports.length >= 1);
  for (const report of reports) {
    assert.ok(report.aiTriage);
    assert.equal(typeof report.aiTriage.score, "number");
    assert.equal(typeof report.description, "string");
    assert.equal(typeof report.photo, "string");
  }
});

test("getFloodNews returns live-only Flood News & Intelligence Agent without fake curated items", async () => {
  const feed = await getFloodNews({ forceRefresh: true });
  assert.equal(feed.agent.id, "flood-news-intelligence");
  assert.ok(["live-rss", "live-only"].includes(feed.agent.mode));
  assert.ok(Array.isArray(feed.items));
  for (const item of feed.items) {
    assert.equal(item.isLiveRss, true);
  }
});

test("upvoteReport increments community corroboration, blocks duplicate voterKey, and boosts AI Triage confidence", async () => {
  const created = await createReport({
    province: "พระนครศรีอยุธยา",
    district: "อ.พระนครศรีอยุธยา",
    reporter: "ประชาชนในพื้นที่",
    level: "30–50 ซม.",
    description: "น้ำท่วมถนนทางเข้าชุมชน",
    urgent: false,
    lat: 14.3532,
    lng: 100.5689,
  });
  assert.equal(created.upvotes, 0);
  const initialScore = created.aiTriage.score;
  const initialConfidence = created.aiTriage.confidence;

  const afterFirstVote = await upvoteReport(created.id, "user:1");
  assert.equal(afterFirstVote.upvotes, 1);
  assert.ok(afterFirstVote.aiTriage.score > initialScore);
  assert.ok(afterFirstVote.aiTriage.confidence >= initialConfidence);
  assert.ok(afterFirstVote.aiTriage.tags.some((t) => t.includes("ยืนยันซ้ำจากชุมชน")));

  // Duplicate vote from the same voterKey should not increment again
  const afterDuplicateVote = await upvoteReport(created.id, "user:1");
  assert.equal(afterDuplicateVote.upvotes, 1);

  // Vote from a second distinct voter should increment to 2
  const afterSecondVote = await upvoteReport(created.id, "user:2");
  assert.equal(afterSecondVote.upvotes, 2);
  assert.ok(afterSecondVote.aiTriage.score >= afterFirstVote.aiTriage.score);
  assert.ok(afterSecondVote.aiTriage.confidence >= afterFirstVote.aiTriage.confidence);
  assert.equal("upvotedBy" in afterSecondVote, false);
});
