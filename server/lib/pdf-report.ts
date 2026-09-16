/**
 * Premium Vedic Astrology Report — South Indian Temple Aesthetic
 * Designed for spiritual elegance and professional readability
 */
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { BirthDetails, AstrologyReport } from "./astrology-ai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function logoPath(): string | null {
  const candidates = [
    path.resolve(__dirname, "../../public/logo-mark.png"),
    path.resolve(__dirname, "../../../public/logo-mark.png"),
    path.resolve(process.cwd(), "public/logo-mark.png"),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function clean(text: string | undefined | null): string {
  if (!text) return "—";
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/`(.+?)`/g, "$1")
    .replace(/_{2}(.+?)_{2}/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .trim();
}

// ── Premium Spiritual Colour Palette ────────────────────────
const DEEP_MAROON   = "#5C0A2C";   // rich, spiritual
const SAFFRON       = "#D4821F";   // warm, vibrant
const GOLD          = "#B8970C";   // luxury
const CREAM         = "#F5F1E8";   // premium off-white
const DARK_TEXT     = "#2C1810";   // readable, warm
const MUTED_TEXT    = "#6B5D50";   // secondary text
const ACCENT_GOLD   = "#E6B800";   // bright accents
const HEADER_BG     = "#3E1B2E";   // dark header
const FOOTER_BG     = "#2C0A1C";   // dark footer

function formatDate(dob: string): string {
  try {
    return new Date(dob).toLocaleDateString("en-IN", {
      day: "numeric", month: "long", year: "numeric",
    });
  } catch { return dob; }
}

function formatTime(tob: string): string {
  if (!tob) return "—";
  const [hStr, mStr] = tob.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return tob;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${String(hour12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
}

function splitToItems(text: string): string[] {
  if (!text) return [];
  return text
    .split(/\n+/)
    .map(l => l.replace(/^[\d]+[\.\)]\s*/, "").replace(/^[•\-\*✦➤]\s*/, "").trim())
    .filter(l => l.length > 3);
}

function estimateTextHeight(text: string, width: number, fontSize: number): number {
  if (!text) return 20;
  const charsPerLine = Math.floor(width / (fontSize * 0.52));
  const lines = text.split("\n").reduce((acc, l) => acc + Math.max(1, Math.ceil(l.length / charsPerLine)), 0);
  return lines * (fontSize + 4);
}

// ── PDF Entry Point ────────────────────────────────────────────
export function generateReportPdf(
  birth: BirthDetails,
  report: AstrologyReport,
  serviceTitle: string,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      bufferPages: true,
      info: {
        Title: `Vedic Astrology Report — ${birth.name}`,
        Author: "Sampath Kumara Guruji — My Vedic Astrology",
        Subject: serviceTitle,
      },
    });

    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end",  () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const PW = doc.page.width;
    const PH = doc.page.height;
    const ML = 45;
    const W  = PW - ML * 2;

    // ════════════════════════════════════════════════════════════
    // PAGE 1 — HEADER + BIRTH DETAILS
    // ════════════════════════════════════════════════════════════
    doc.on("pageAdded", () => {
      doc.rect(0, 0, PW, PH).fill(CREAM);
    });

    doc.rect(0, 0, PW, PH).fill(CREAM);

    // ── Premium Header ──────────────────────────────────────────
    doc.rect(0, 0, PW, 110).fill(DEEP_MAROON);

    // Decorative top border
    doc.moveTo(20, 8).lineTo(PW - 20, 8).lineWidth(1).strokeColor(ACCENT_GOLD).stroke();
    doc.moveTo(20, 12).lineTo(PW - 20, 12).lineWidth(0.4).strokeColor(SAFFRON).stroke();

    // Logo
    const logo = logoPath();
    if (logo) {
      try {
        doc.image(logo, ML, 16, { height: 48, fit: [48, 48] });
      } catch {}
    }

    // Brand & Contact Info
    doc.fontSize(20).font("Helvetica-Bold").fillColor("#FFF9E6")
      .text("My Vedic Astrology", ML + 56, 18, { width: W - 56, lineBreak: false });
    doc.fontSize(8.5).font("Helvetica").fillColor(ACCENT_GOLD)
      .text("Sampath Kumara Guruji", ML + 56, 42, { width: W - 56 });
    doc.fontSize(7.5).font("Helvetica").fillColor("#E0C0A0")
      .text("Bangalore  |  +91 98861 00565  |  myvedicastrology.in", ML + 56, 53, { width: W - 56 });

    // Service Title (elegant)
    doc.fontSize(9.5).font("Helvetica-Bold").fillColor(SAFFRON)
      .text(serviceTitle.toUpperCase(), ML, 70, { width: W, align: "center" });
    doc.fontSize(8).font("Helvetica").fillColor("#C9A977")
      .text("Personalized Vedic Consultation Report", ML, 82, { width: W, align: "center" });

    // Decorative bottom border
    doc.moveTo(20, 105).lineTo(PW - 20, 105).lineWidth(0.4).strokeColor(SAFFRON).stroke();
    doc.moveTo(20, 108).lineTo(PW - 20, 108).lineWidth(1).strokeColor(ACCENT_GOLD).stroke();

    // ── Prepared For Band ───────────────────────────────────────
    const prepY = 120;
    doc.rect(0, prepY, PW, 35).fill(SAFFRON);
    doc.fontSize(9).font("Helvetica").fillColor(DARK_TEXT)
      .text("PREPARED FOR", ML, prepY + 6, { width: W, align: "center" });
    doc.fontSize(16).font("Helvetica-Bold").fillColor(DEEP_MAROON)
      .text(birth.name.toUpperCase(), ML, prepY + 13, { width: W, align: "center" });
    doc.fontSize(8).font("Helvetica").fillColor(MUTED_TEXT)
      .text(formatDate(birth.dob) + "  |  " + formatTime(birth.tob), ML, prepY + 24, { width: W, align: "center" });

    doc.y = prepY + 45;

    // ── BIRTH INFORMATION (compact, no overlap) ───────────
    doc.fontSize(10).font("Helvetica-Bold").fillColor(DEEP_MAROON)
      .text("BIRTH INFORMATION", ML, doc.y, { width: W, align: "center" });
    doc.moveDown(0.6);

    const LABEL_W = 140;
    const VALUE_W = W - LABEL_W - 16;
    const birthInfo = [
      { label: "Full Name", value: birth.name },
      { label: "Date of Birth", value: formatDate(birth.dob) },
      { label: "Time of Birth", value: formatTime(birth.tob) },
      { label: "Place of Birth", value: birth.pob },
      { label: "Gender", value: birth.gender || "—" },
    ];

    const birthTableTop = doc.y;
    birthInfo.forEach(({ label, value }, i) => {
      const rH = 18;
      const ry = doc.y;
      const bgColor = i % 2 === 0 ? CREAM : "#FFFCF7";

      doc.save().rect(ML, ry, W, rH).fill(bgColor).restore();
      if (i > 0) {
        doc.save()
          .moveTo(ML, ry).lineTo(ML + W, ry)
          .lineWidth(0.2).strokeColor(ACCENT_GOLD).stroke()
          .restore();
      }

      doc.fontSize(7.5).font("Helvetica-Bold").fillColor(MUTED_TEXT)
        .text(label, ML + 8, ry + 4, { width: LABEL_W - 12, lineBreak: false });
      doc.fontSize(9).font("Helvetica-Bold").fillColor(DARK_TEXT)
        .text(value, ML + LABEL_W + 10, ry + 4, { width: VALUE_W - 12, lineBreak: false });

      doc.y = ry + rH;
    });

    const birthTableEnd = doc.y;
    doc.save()
      .lineWidth(1).rect(ML, birthTableTop, W, birthTableEnd - birthTableTop)
      .strokeColor(GOLD).stroke()
      .restore();
    doc.save()
      .moveTo(ML + LABEL_W + 5, birthTableTop)
      .lineTo(ML + LABEL_W + 5, birthTableEnd)
      .lineWidth(0.5).strokeColor(SAFFRON).stroke()
      .restore();

    doc.y = birthTableEnd + 12;

    // ── COSMIC IDENTITY (separate, no overlap) ─────────────
    doc.fontSize(10).font("Helvetica-Bold").fillColor(DEEP_MAROON)
      .text("YOUR COSMIC IDENTITY", ML, doc.y, { width: W, align: "center" });
    doc.moveDown(0.6);

    const cosmicCards = [
      { label: "Nakshatra (Birth Star)", value: report.nakshatra },
      { label: "Rashi (Moon Sign)", value: report.rashi },
      { label: "Lagna (Ascendant)", value: report.lagna },
      { label: "Ruling Planet / Dasha", value: report.ruling_planet },
    ];

    const cosmicTableTop = doc.y;
    cosmicCards.forEach(({ label, value }, i) => {
      const rH = 20;
      const ry = doc.y;

      doc.save().rect(ML, ry, W, rH).fill("#F5E6D3").restore();
      doc.save().rect(ML, ry, 3, rH).fill(SAFFRON).restore();

      if (i > 0) {
        doc.save()
          .moveTo(ML, ry).lineTo(ML + W, ry)
          .lineWidth(0.2).strokeColor(ACCENT_GOLD).stroke()
          .restore();
      }

      doc.fontSize(7.5).font("Helvetica-Bold").fillColor(SAFFRON)
        .text(label, ML + 10, ry + 3, { width: LABEL_W - 18, lineBreak: false });
      doc.fontSize(9.5).font("Helvetica-Bold").fillColor(DEEP_MAROON)
        .text(value, ML + LABEL_W + 10, ry + 3, { width: VALUE_W - 12, lineBreak: false });

      doc.y = ry + rH;
    });

    const cosmicTableEnd = doc.y;
    doc.save()
      .lineWidth(1).rect(ML, cosmicTableTop, W, cosmicTableEnd - cosmicTableTop)
      .strokeColor(GOLD).stroke()
      .restore();

    doc.y = cosmicTableEnd + 12;

    // ── YOUR CONCERN (separate elegant box) ────────────────
    if (birth.concern) {
      const concernText = clean(birth.concern);
      const concernBoxH = Math.min(estimateTextHeight(concernText, W - 24, 9) + 20, 80);
      const cBy = doc.y;

      doc.save().rect(ML, cBy, W, concernBoxH).fill("#FFF8E7").restore();
      doc.save()
        .lineWidth(1).rect(ML, cBy, W, concernBoxH).strokeColor(SAFFRON).stroke()
        .restore();
      doc.save().rect(ML, cBy, 4, concernBoxH).fill(SAFFRON).restore();

      doc.fontSize(8).font("Helvetica-Bold").fillColor(SAFFRON)
        .text("YOUR CONCERN / QUESTION", ML + 12, cBy + 6);
      doc.fontSize(8.5).font("Helvetica").fillColor(DARK_TEXT)
        .text(concernText, ML + 12, cBy + 18, { width: W - 24, align: "left", lineGap: 1.5 });

      doc.y = cBy + concernBoxH + 12;
    }

    // ════════════════════════════════════════════════════════════
    // PAGE 2+ — ANALYSIS & GUIDANCE
    // ════════════════════════════════════════════════════════════
    doc.addPage();

    // Page header on page 2+
    doc.rect(0, 0, PW, 40).fill(DEEP_MAROON);
    doc.fontSize(10).font("Helvetica-Bold").fillColor(ACCENT_GOLD)
      .text(birth.name + "'s Vedic Astrology Report  —  Detailed Analysis", ML, 12, { width: W, align: "center" });
    doc.y = 50;

    // ── Problem Analysis ────────────────────────────────────────
    sectionBox(doc, "THE ISSUE YOU'RE FACING", clean(report.problem_analysis), ML, W, PW, PH);

    // ── Astrological Reason ────────────────────────────────────
    sectionBox(doc, "WHY THIS IS HAPPENING", clean(report.astrological_reason), ML, W, PW, PH);

    // ── Planetary Positions ────────────────────────────────────
    sectionBox(doc, "YOUR PLANETARY POSITIONS", clean(report.planetary_positions), ML, W, PW, PH);

    // ════════════════════════════════════════════════════════════
    // PAGE 3+ — REMEDIES & MANTRAS
    // ════════════════════════════════════════════════════════════
    doc.addPage();
    doc.rect(0, 0, PW, 40).fill(DEEP_MAROON);
    doc.fontSize(10).font("Helvetica-Bold").fillColor(ACCENT_GOLD)
      .text(birth.name + "'s Remedies & Spiritual Practices", ML, 12, { width: W, align: "center" });
    doc.y = 50;

    // ── Remedies (proper pagination) ──────────────────────────
    const remedyItems = splitToItems(report.remedies);
    if (remedyItems.length > 0) {
      remedySection(doc, remedyItems, ML, W, PW, PH);
    }

    // ── Mantra ────────────────────────────────────────────────
    mantraSection(doc, report.mantras, ML, W, PH);

    // ════════════════════════════════════════════════════════════
    // PAGE 4+ — GEMSTONE & AUSPICIOUS DAYS
    // ════════════════════════════════════════════════════════════
    doc.addPage();
    doc.rect(0, 0, PW, 40).fill(DEEP_MAROON);
    doc.fontSize(10).font("Helvetica-Bold").fillColor(ACCENT_GOLD)
      .text(birth.name + "'s Gemstone & Auspicious Dates", ML, 12, { width: W, align: "center" });
    doc.y = 50;

    // ── Gemstone ──────────────────────────────────────────────
    gemstoneSection(doc, report.gemstone_advice, ML, W, PH);

    // ── Auspicious Days ───────────────────────────────────────
    auspiciousSection(doc, report.auspicious_days, ML, W, PH);

    // ── Closing Blessing ──────────────────────────────────────
    doc.moveDown(1.5);
    const bY = doc.y;
    doc.save()
      .lineWidth(1).rect(ML, bY, W, 50)
      .fillAndStroke("#F5E6D3", GOLD)
      .restore();
    doc.moveTo(ML + 12, bY + 4).lineTo(ML + W - 12, bY + 4).lineWidth(0.6).strokeColor(SAFFRON).stroke();
    doc.moveTo(ML + 12, bY + 46).lineTo(ML + W - 12, bY + 46).lineWidth(0.6).strokeColor(SAFFRON).stroke();

    doc.fontSize(9).font("Helvetica-Bold").fillColor(DEEP_MAROON)
      .text(
        "The planets guide, but your devotion decides. Follow these remedies with sincerity and faith.",
        ML + 14, bY + 12, { width: W - 28, align: "center", lineGap: 1.5 }
      );
    doc.fontSize(8).font("Helvetica").fillColor(MUTED_TEXT)
      .text("— Sampath Kumara Guruji", ML, bY + 34, { width: W, align: "center" });

    // ── Footers on all pages ───────────────────────────────────
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(range.start + i);
      const fY = PH - 74;
      doc.rect(0, fY, PW, 74).fill(FOOTER_BG);
      doc.moveTo(0, fY + 2).lineTo(PW, fY + 2).lineWidth(1.5).strokeColor(ACCENT_GOLD).stroke();

      doc.fontSize(7.5).font("Helvetica-Bold").fillColor(ACCENT_GOLD)
        .text(`Report for ${birth.name}  |  Parasara Hora Shastra  |  Lahiri Ayanamsa`, ML, fY + 10, { width: W, align: "center" });
      doc.fontSize(7).font("Helvetica").fillColor("#B8972E")
        .text("info@myvedicastrology.in  |  +91 98861 00565  |  myvedicastrology.in  |  Bangalore, India", ML, fY + 22, { width: W, align: "center" });
      doc.fontSize(6.5).font("Helvetica").fillColor("#8B7D76")
        .text("For spiritual guidance only. Not medical, legal or financial advice.", ML, fY + 33, { width: W, align: "center" });
      doc.fontSize(6.5).font("Helvetica").fillColor(MUTED_TEXT)
        .text(`© 2026 My Vedic Astrology  |  Page ${i + 1} of ${range.count}`, ML, fY + 42, { width: W, align: "center" });
      doc.moveTo(ML, fY + 48).lineTo(PW - ML, fY + 48).lineWidth(0.4).strokeColor(SAFFRON).stroke();
      doc.fontSize(6).font("Helvetica").fillColor(MUTED_TEXT)
        .text("Report generated on " + new Date().toLocaleDateString("en-IN"), ML, fY + 54, { width: W, align: "center" });
    }

    doc.end();
  });
}

// ── Premium Section Box ─────────────────────────────────────────
function sectionBox(doc: InstanceType<typeof PDFDocument>, title: string, text: string, ML: number, W: number, PW: number, PH: number) {
  if (doc.y > PH - 160 - 80) doc.addPage(); // leave 80px for footer

  // Title bar
  const titleY = doc.y;
  doc.rect(0, titleY, PW, 28).fill("#F5E6D3");
  doc.rect(0, titleY, 5, 28).fill(SAFFRON);
  doc.moveTo(0, titleY + 28).lineTo(PW, titleY + 28).lineWidth(0.8).strokeColor(GOLD).stroke();
  doc.fontSize(11).font("Helvetica-Bold").fillColor(DEEP_MAROON)
    .text(title, ML + 8, titleY + 7, { width: W - 16, lineBreak: false });
  doc.y = titleY + 38;

  // Write text first to know actual height
  const boxTop = doc.y;
  doc.fontSize(10).font("Helvetica").fillColor(DARK_TEXT)
    .text(text, ML + 14, boxTop + 10, { width: W - 28, align: "justify", lineGap: 2.5 });
  const boxBot = doc.y + 8;

  // Draw decorative box retroactively (on top of text — use save/restore for layering)
  doc.save()
    .rect(ML, boxTop, W, boxBot - boxTop)
    .lineWidth(0.8).strokeColor(GOLD).stroke()
    .restore();
  doc.save().rect(ML, boxTop, 4, boxBot - boxTop).fill(SAFFRON).restore();

  doc.y = boxBot + 14;
}

// ── Remedy Cards (with proper pagination) ───────────────────────
function remedySection(doc: InstanceType<typeof PDFDocument>, items: string[], ML: number, W: number, PW: number, PH: number = 841) {
  doc.fontSize(10).font("Helvetica-Bold").fillColor(DEEP_MAROON)
    .text("HEALING PRACTICES & REMEDIES", ML, doc.y, { width: W, align: "center" });
  doc.moveDown(1);

  items.forEach((item, i) => {
    if (doc.y > PH - 210) doc.addPage();

    const estimatedH = Math.max(50, estimateTextHeight(item, W - 70, 9) + 24);
    const cy = doc.y;

    doc.save().rect(ML, cy, W, estimatedH).fill("#FFFCF7").restore();
    doc.save().lineWidth(1).rect(ML, cy, W, estimatedH).strokeColor(GOLD).stroke().restore();
    doc.save().rect(ML, cy, 42, estimatedH).fill(SAFFRON).restore();
    doc.fontSize(16).font("Helvetica-Bold").fillColor("white")
      .text(String(i + 1), ML, cy + estimatedH / 2 - 10, { width: 42, align: "center", lineBreak: false });

    doc.fontSize(9.5).font("Helvetica").fillColor(DARK_TEXT)
      .text(clean(item), ML + 50, cy + 10, { width: W - 60, lineGap: 2 });

    doc.y = Math.max(doc.y, cy + estimatedH) + 8;
  });
}

// ── Mantra Section ──────────────────────────────────────────────
function mantraSection(doc: InstanceType<typeof PDFDocument>, text: string, ML: number, W: number, PH: number = 841) {
  if (doc.y > PH - 220) doc.addPage();

  doc.moveDown(0.5);
  const lines = clean(text).split(/\n+/).filter(Boolean);
  const mantra = lines[0] || text;

  const mantY = doc.y;
  doc.save()
    .rect(ML, mantY, W, 85)
    .fill("#F5E6D3")
    .lineWidth(1.5).strokeColor(SAFFRON).stroke()
    .restore();

  doc.moveTo(ML + 12, mantY + 5).lineTo(ML + W - 12, mantY + 5).lineWidth(0.8).strokeColor(GOLD).stroke();
  doc.moveTo(ML + 12, mantY + 80).lineTo(ML + W - 12, mantY + 80).lineWidth(0.8).strokeColor(GOLD).stroke();

  doc.fontSize(13).font("Helvetica-Bold").fillColor(DEEP_MAROON)
    .text(mantra, ML, mantY + 18, { width: W, align: "center" });
  doc.fontSize(8).font("Helvetica").fillColor(MUTED_TEXT)
    .text("Chant 108 times daily at sunrise, facing East  |  With full devotion", ML, mantY + 48, { width: W, align: "center" });
  doc.fontSize(7.5).font("Helvetica").fillColor(SAFFRON)
    .text("Duration: 40-108 consecutive days for best results", ML, mantY + 63, { width: W, align: "center" });

  doc.y = mantY + 95;
}

// ── Gemstone Section ────────────────────────────────────────────
function gemstoneSection(doc: InstanceType<typeof PDFDocument>, text: string, ML: number, W: number, PH: number = 841) {
  const items = splitToItems(text);
  if (items.length === 0) return;

  doc.fontSize(10).font("Helvetica-Bold").fillColor(DEEP_MAROON)
    .text("GEMSTONE RECOMMENDATIONS", ML, doc.y, { width: W, align: "center" });
  doc.moveDown(0.8);

  const colW = (W - 8) / 2;
  let cx = ML, cy = doc.y;

  items.forEach((line, i) => {
    if (cy > PH - 220) {
      doc.addPage();
      cx = ML;
      cy = doc.y;
    }

    const parts = line.split(/[:–\-]+/);
    const label = parts[0]?.trim() || "";
    const value = parts.slice(1).join(" ").trim() || line;
    const cH = 45;
    const fill = i % 2 === 0 ? "#F5E6D3" : "#FFFCF7";

    doc.save().rect(cx, cy, colW, cH).fill(fill).restore();
    doc.save().lineWidth(0.8).rect(cx, cy, colW, cH).strokeColor(GOLD).stroke().restore();
    doc.save().rect(cx, cy, 3, cH).fill(SAFFRON).restore();

    doc.fontSize(7.5).font("Helvetica-Bold").fillColor(SAFFRON)
      .text(label, cx + 10, cy + 6, { width: colW - 14 });
    doc.fontSize(9).font("Helvetica-Bold").fillColor(DEEP_MAROON)
      .text(value, cx + 10, cy + 18, { width: colW - 14 });

    if (cx === ML) {
      cx = ML + colW + 8;
    } else {
      cx = ML;
      cy += cH + 4;
    }
  });

  doc.y = cy + 50;
}

// ── Auspicious Days Section ──────────────────────────────────────
function auspiciousSection(doc: InstanceType<typeof PDFDocument>, text: string, ML: number, W: number, PH: number = 841) {
  const items = splitToItems(text);
  if (items.length === 0) return;

  doc.fontSize(10).font("Helvetica-Bold").fillColor(DEEP_MAROON)
    .text("AUSPICIOUS DATES THIS MONTH", ML, doc.y, { width: W, align: "center" });
  doc.moveDown(0.8);

  let cx = ML, cy = doc.y;
  const pillH = 28;

  items.forEach(day => {
    if (cx + 100 > ML + W + 4) { cx = ML; cy += pillH + 6; }
    if (cy > PH - 220) {
      doc.addPage();
      cx = ML;
      cy = doc.y;
    }

    const pillW = Math.min(Math.max(doc.widthOfString(day) + 24, 85), 140);
    doc.save().rect(cx, cy, pillW, pillH).fill("#F5E6D3").restore();
    doc.save().lineWidth(0.8).rect(cx, cy, pillW, pillH).strokeColor(SAFFRON).stroke().restore();
    doc.rect(cx, cy, 3, pillH).fill(SAFFRON);

    doc.fontSize(8.5).font("Helvetica-Bold").fillColor(DEEP_MAROON)
      .text(day, cx + 8, cy + 8, { width: pillW - 12 });
    cx += pillW + 6;
  });

  doc.y = cy + pillH + 16;
}
