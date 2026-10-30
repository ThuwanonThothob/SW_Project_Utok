import { provinceCatalog } from "../data/provinceCatalog.js";

const GOOGLE_NEWS_RSS_URL =
  "https://news.google.com/rss/search?q=%E0%B8%99%E0%B9%89%E0%B8%B3%E0%B8%97%E0%B9%88%E0%B8%A7%E0%B8%A1+%E0%B9%84%E0%B8%97%E0%B8%A2&hl=th&gl=TH&ceid=TH:th";

const isTestRun =
  process.env.NODE_ENV === "test" ||
  process.execArgv.includes("--test") ||
  process.argv.some((arg) => arg.includes(".test."));

let cachedNewsPayload = null;
let cachedAtMs = 0;
const CACHE_TTL_MS = 3 * 60_000;

function decodeXmlEntities(text = "") {
  return String(text)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function extractProvince(text = "") {
  for (const p of provinceCatalog) {
    if (text.includes(p.name)) return p.name;
  }
  return "ทั่วประเทศ";
}

function classifyNewsIntelligence(title = "") {
  const highKeywords = ["วิกฤต", "อพยพ", "ล้นตลิ่ง", "น้ำป่า", "ดินถล่ม", "ฉุกเฉิน", "เตือนภัยระดับสีแดง", "เร่งด่วน", "พนังกั้นน้ำ"];
  const mediumKeywords = ["เฝ้าระวัง", "ฝนตกหนัก", "ระบายน้ำ", "เตือน", "น้ำหนุน", "ระดับน้ำเพิ่ม"];

  let severity = "low";
  if (highKeywords.some((kw) => title.includes(kw))) {
    severity = "high";
  } else if (mediumKeywords.some((kw) => title.includes(kw))) {
    severity = "medium";
  }

  const province = extractProvince(title);
  const aiSummary =
    severity === "high"
      ? `AI วิเคราะห์พบสัญญาณเตือนภัยระดับสูงในพื้นที่ ${province}`
      : severity === "medium"
        ? `AI ตรวจพบแนวโน้มฝนตกสะสมและระดับน้ำเปลี่ยนแปลงในพื้นที่ ${province}`
        : `ข่าวสารสถานการณ์น้ำจริงจากแหล่งข่าวในพื้นที่ ${province}`;

  return { severity, province, aiSummary };
}

function parseRssItems(xmlText = "") {
  const items = [];
  const itemMatches = xmlText.match(/<item>([\s\S]*?)<\/item>/gi) || [];
  for (const block of itemMatches.slice(0, 10)) {
    const rawTitle = (block.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || "";
    const rawLink = (block.match(/<link>([\s\S]*?)<\/link>/i) || [])[1] || "";
    const rawPubDate = (block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i) || [])[1] || "";
    const rawSource = (block.match(/<source[^>]*>([\s\S]*?)<\/source>/i) || [])[1] || "Google News Thailand";

    const cleanTitle = decodeXmlEntities(rawTitle);
    if (!cleanTitle) continue;

    const { severity, province, aiSummary } = classifyNewsIntelligence(cleanTitle);
    const parsedDate = rawPubDate ? new Date(rawPubDate) : new Date();
    const publishedAt = Number.isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString();

    items.push({
      id: `news-live-${items.length + 1}-${Date.now().toString().slice(-4)}`,
      title: cleanTitle,
      source: decodeXmlEntities(rawSource) || "สำนักข่าวจริง (Google News RSS)",
      url: decodeXmlEntities(rawLink),
      province,
      severity,
      aiSummary,
      summary: aiSummary,
      publishedAt,
      isLiveRss: true,
    });
  }
  return items;
}

export async function getFloodNews({ forceRefresh = false } = {}) {
  const now = Date.now();
  if (!forceRefresh && cachedNewsPayload && now - cachedAtMs < CACHE_TTL_MS) {
    return cachedNewsPayload;
  }

  let liveItems = [];
  let fetchedLive = false;

  try {
    const response = await fetch(GOOGLE_NEWS_RSS_URL, {
      signal: AbortSignal.timeout(isTestRun ? 400 : 3500),
      headers: {
        "User-Agent": "UTOK-NewsIntelligenceAgent/2.0",
        Accept: "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
      },
    });
    if (response.ok) {
      const xml = await response.text();
      liveItems = parseRssItems(xml);
      fetchedLive = liveItems.length > 0;
    }
  } catch {
    fetchedLive = false;
  }

  const highCount = liveItems.filter((item) => item.severity === "high").length;
  const headlineSummary = fetchedLive
    ? `ดึงข้อมูลข่าวสารสถานการณ์น้ำจริงจาก Google News RSS สำเร็จ ${liveItems.length} รายการ (พบสัญญาณเฝ้าระวังสูง ${highCount} รายการ)`
    : "กำลังรอเชื่อมต่อเครือข่ายข่าวสารสด (ไม่แสดงข้อมูลจำลอง)";

  cachedNewsPayload = {
    agent: {
      id: "flood-news-intelligence",
      name: "Flood News & Intelligence Agent",
      status: fetchedLive ? "active" : "standby",
      mode: fetchedLive ? "live-rss" : "live-only",
      lastUpdatedAt: new Date().toISOString(),
    },
    headlineSummary,
    items: liveItems,
  };
  cachedAtMs = now;

  return cachedNewsPayload;
}
