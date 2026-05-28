import React, { useState, useEffect, useRef } from "react";
import { formatTime } from "./time";
import { getEventColor } from "../constants/colors";
import weddingPotionLogo from "../assets/wedding-potion-logo.png";

const PW = 612, PH = 792;          // US Letter
const MX = 38, MY_TOP = 48, MY_BOT = 36;
const CW = PW - 2 * MX;           // 536
const HDR_NAMES_FONT = 24;
const LOGO_ASPECT = 103 / 800;
const LOGO_DISPLAY_H = HDR_NAMES_FONT / 2;
const LOGO_DISPLAY_W = LOGO_DISPLAY_H / LOGO_ASPECT;
/** Gap between stacked header blocks in PDF (pt). */
const HDR_BLOCK_GAP = 6;
/** jsPDF text() y is the baseline; offset below a top-aligned box bottom. */
function pdfBaselineBelow(bottomY, fontSize, gap = HDR_BLOCK_GAP) {
  return bottomY + gap + fontSize * 0.75;
}

let logoDataUrlPromise = null;
function getLogoDataUrl() {
  if (!logoDataUrlPromise) {
    logoDataUrlPromise = fetch(weddingPotionLogo)
      .then((r) => r.blob())
      .then(
        (blob) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          })
      );
  }
  return logoDataUrlPromise;
}
const RH_COL  = 18;  // column-header row
const RH_EVT  = 22;  // event row (no notes)
const RH_NOTE = 13;  // per wrapped note line
const RH_LOC  = 46;  // location block
const RH_CON  = 32;  // constraint block
const RH_GAP  = 3;   // gap after standard event / constraint rows
const LOC_ROW_GAP = 5; // extra gap after location blocks
const HDR_H   = 122; // first-page header height
const FTR_H   = 22;  // footer height
const COL_TIME = 66, COL_DUR = 34, COL_SET = 28;
const LOC_TEXT_W = CW - 16;
const PDF_LOC_TIME_X = MX + 5;
const PDF_LOC_BODY_X = MX + COL_TIME;
const PDF_LOC_BODY_W = CW - COL_TIME - 8;
const PDF_EVT_TIME_X = MX + 5;
const PDF_EVT_BODY_X = MX + COL_TIME;
const PDF_EVT_BODY_W = CW - COL_TIME - COL_DUR - COL_SET - 4;
const EVT_NOTES_W = CW - COL_TIME - COL_DUR - COL_SET - 8;
const PDF_PAGE_BOTTOM = PH - MY_BOT - FTR_H - 8;
const LOC_PAD_TOP = 10;
const LOC_PAD_BOTTOM = 10;
const LOC_LINE_GAP = 3;
const EVT_PAD_TOP = 4;
const PDF_ACCENT_RGB = [184, 144, 106];
const PDF_TIME_WEIGHT = "bold";
/** Fallback per-line heights when jsPDF is not available (preview layout). */
const PREVIEW_LINE_H = { event: 12, address: 11, note: 14 };

/** Sort by time ascending and drop duplicate row ids (keeps first occurrence). */
function prepareTimelineExportRows(rows) {
  const sorted = [...(rows || [])].sort((a, b) => {
    const t = (a.time ?? 0) - (b.time ?? 0);
    if (t !== 0) return t;
    return (a.id ?? 0) - (b.id ?? 0);
  });
  const seen = new Set();
  return sorted.filter((row) => {
    if (row.id == null) return true;
    if (seen.has(row.id)) return false;
    seen.add(row.id);
    return true;
  });
}

function rowGapAfter(row) {
  return row?.type === "location" ? LOC_ROW_GAP : RH_GAP;
}

function measuredRowHeight(row, doc = null) {
  if (!row) return RH_EVT + RH_GAP;
  if (row.type === "location") return measureLocationBlock(row, doc).locH + rowGapAfter(row);
  if (row.type === "constraint") return RH_CON + rowGapAfter(row);
  return measureEventRow(row, doc).rowH + rowGapAfter(row);
}

/** Word-wrap estimate; uses jsPDF when doc is provided for PDF-accurate line counts. */
function wrapTextLines(text, maxWidth, fontSize, doc) {
  const s = (text || "").trim();
  if (!s) return [];
  if (doc) {
    doc.setFontSize(fontSize);
    return doc.splitTextToSize(s, maxWidth);
  }
  const charsPerLine = Math.max(28, Math.floor(maxWidth / (fontSize * 0.48)));
  const words = s.split(/\s+/);
  const lines = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > charsPerLine) {
      if (cur) lines.push(cur);
      cur = w.length > charsPerLine ? w.slice(0, charsPerLine) : w;
      while (cur.length > charsPerLine) {
        lines.push(cur.slice(0, charsPerLine));
        cur = cur.slice(charsPerLine);
      }
    } else {
      cur = next;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

/** Pixel height of a wrapped text block (PDF-accurate when doc is provided). */
function textBlockHeight(lines, fontSize, maxWidth, doc, previewLineH) {
  if (!lines.length) return 0;
  if (doc) {
    doc.setFontSize(fontSize);
    return doc.getTextDimensions(lines, { maxWidth }).h;
  }
  return lines.length * previewLineH;
}

/** jsPDF stacked-line height (baseline-to-baseline advance). PDF export only. */
function pdfStackedTextHeight(doc, fontSize, textOrLines, maxWidth) {
  doc.setFontSize(fontSize);
  const lines =
    typeof textOrLines === "string"
      ? maxWidth
        ? doc.splitTextToSize(textOrLines, maxWidth)
        : [textOrLines]
      : textOrLines;
  if (!lines?.length) return fontSize * 1.15;
  const opts = maxWidth ? { maxWidth } : {};
  return doc.getTextDimensions(lines, opts).h;
}

/** Measure PDF location inner stack (preview uses measureLocationBlock with doc=null). */
function measurePdfLocationBlock(row, doc) {
  const eventLines = wrapTextLines(row.event || "(Travel)", PDF_LOC_BODY_W, 10, doc);
  const addressLines = row.address?.trim()
    ? wrapTextLines(row.address, PDF_LOC_BODY_W, 8, doc)
    : [];
  const noteLines = row.notes?.trim()
    ? wrapTextLines(row.notes, PDF_LOC_BODY_W, 8, doc)
    : [];
  const travelText = `Travel time: ${row.duration} min`;

  let inner = pdfStackedTextHeight(doc, 7.5, "12:00 PM", COL_TIME - 10);
  inner += LOC_LINE_GAP;
  inner += pdfStackedTextHeight(doc, 10, eventLines, PDF_LOC_BODY_W) + LOC_LINE_GAP;
  if (addressLines.length) {
    inner += pdfStackedTextHeight(doc, 8, addressLines, PDF_LOC_BODY_W) + LOC_LINE_GAP;
  }
  inner += pdfStackedTextHeight(doc, 7.5, travelText, PDF_LOC_BODY_W);
  if (noteLines.length) {
    inner += LOC_LINE_GAP + pdfStackedTextHeight(doc, 8, noteLines, PDF_LOC_BODY_W);
  }

  return {
    locH: LOC_PAD_TOP + inner + LOC_PAD_BOTTOM,
    eventLines,
    addressLines,
    noteLines,
    travelText,
  };
}

/** Total inner height for a location block (content + notes), excluding RH_GAP. */
function measureLocationBlock(row, doc = null) {
  const eventLines = wrapTextLines(row.event || "(Travel)", LOC_TEXT_W, 10, doc);
  const addressLines = row.address?.trim()
    ? wrapTextLines(row.address, LOC_TEXT_W, 8, doc)
    : [];
  const noteLines = row.notes?.trim()
    ? wrapTextLines(row.notes, LOC_TEXT_W, 8, doc)
    : [];

  if (doc) {
    return measurePdfLocationBlock(row, doc);
  }

  let inner = 12; // time
  inner += textBlockHeight(eventLines, 10, LOC_TEXT_W, doc, PREVIEW_LINE_H.event);
  if (eventLines.length) inner += LOC_LINE_GAP;
  if (addressLines.length) {
    inner += textBlockHeight(addressLines, 8, LOC_TEXT_W, doc, PREVIEW_LINE_H.address) + LOC_LINE_GAP;
  }
  inner += 12; // travel
  if (noteLines.length) {
    inner += LOC_LINE_GAP + textBlockHeight(noteLines, 8, LOC_TEXT_W, doc, PREVIEW_LINE_H.note);
  }

  return {
    locH: LOC_PAD_TOP + inner + LOC_PAD_BOTTOM,
    eventLines,
    addressLines,
    noteLines,
  };
}

function measurePdfEventRow(row, doc) {
  const eventLines = wrapTextLines(row.event || "(empty)", PDF_EVT_BODY_W, 9, doc);
  const noteLines = row.notes?.trim()
    ? wrapTextLines(row.notes, EVT_NOTES_W, 8, doc)
    : [];
  const timeSample = "12:00 PM";
  const mainH = Math.max(
    pdfStackedTextHeight(doc, 8.5, timeSample, COL_TIME - 10),
    pdfStackedTextHeight(doc, 9, eventLines.length ? eventLines : ["(empty)"], PDF_EVT_BODY_W)
  );
  let inner = EVT_PAD_TOP + mainH + 4;
  if (noteLines.length) {
    inner += pdfStackedTextHeight(doc, 8, noteLines, EVT_NOTES_W) + 2;
  }
  inner += 4;
  return { rowH: Math.max(RH_EVT, inner), noteLines, eventLines };
}

function measureEventRow(row, doc = null) {
  if (doc) {
    return measurePdfEventRow(row, doc);
  }
  const noteLines = row.notes?.trim()
    ? wrapTextLines(row.notes, EVT_NOTES_W, 8, doc)
    : [];
  const notesH = noteLines.length
    ? textBlockHeight(noteLines, 8, EVT_NOTES_W, doc, PREVIEW_LINE_H.note)
    : 0;
  return { rowH: RH_EVT + notesH, noteLines };
}

function previewRowH(row) {
  return measuredRowHeight(row);
}

function layoutPreviewPages(rows) {
  const timelineRows = prepareTimelineExportRows(rows);
  const firstAvail = PH - MY_TOP - HDR_H - RH_COL - MY_BOT - FTR_H - 8;
  const otherAvail = PH - MY_TOP - RH_COL  - MY_BOT - FTR_H - 8;
  const pages = [];
  let curr = [], used = 0;
  for (const row of timelineRows) {
    const h = previewRowH(row);
    const avail = pages.length === 0 ? firstAvail : otherAvail;
    if (curr.length > 0 && used + h > avail) { pages.push(curr); curr = []; used = 0; }
    curr.push(row); used += h;
  }
  pages.push(curr);
  return pages;
}

/** PDF pagination using jsPDF text metrics (preview layout unchanged). */
function layoutPdfPages(rows, doc) {
  const timelineRows = prepareTimelineExportRows(rows);
  const firstAvail = PH - MY_TOP - HDR_H - RH_COL - PDF_PAGE_BOTTOM;
  const otherAvail = PH - MY_TOP - RH_COL - PDF_PAGE_BOTTOM;
  const pages = [];
  let curr = [];
  let used = 0;
  for (const row of timelineRows) {
    const h = measuredRowHeight(row, doc);
    const avail = pages.length === 0 ? firstAvail : otherAvail;
    if (curr.length > 0 && used + h > avail) {
      pages.push(curr);
      curr = [];
      used = 0;
    }
    curr.push(row);
    used += h;
  }
  pages.push(curr);
  return pages;
}

async function drawPdfFirstPageHeader(doc, header) {
  const {
    bride,
    groom,
    date,
    photoStartHour,
    photoStartMinute,
    photoStartPeriod,
    photoEndHour,
    photoEndMinute,
    photoEndPeriod,
    videoStartHour,
    videoStartMinute,
    videoStartPeriod,
    videoEndHour,
    videoEndMinute,
    videoEndPeriod,
    photoEnabled,
    videoEnabled,
  } = header;

  const dataUrl = await getLogoDataUrl();
  const logoY = MY_TOP + 8;
  doc.addImage(dataUrl, "PNG", (PW - LOGO_DISPLAY_W) / 2, logoY, LOGO_DISPLAY_W, LOGO_DISPLAY_H);
  const logoBottom = logoY + LOGO_DISPLAY_H;

  const namesText = `${bride || "Bride"} & ${groom || "Groom"}`;
  doc.setFont("times", "normal");
  doc.setFontSize(HDR_NAMES_FONT);
  doc.setTextColor(26, 26, 26);
  let hy = pdfBaselineBelow(logoBottom, HDR_NAMES_FONT);
  doc.text(namesText, PW / 2, hy, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  hy += HDR_NAMES_FONT + HDR_BLOCK_GAP;
  doc.text(fmtDateLong(date), PW / 2, hy, { align: "center", charSpace: 0.5 });
  const covParts = [];
  if (photoEnabled) {
    covParts.push(
      `Photo: ${photoStartHour}:${photoStartMinute} ${photoStartPeriod} - ${photoEndHour}:${photoEndMinute} ${photoEndPeriod}`
    );
  }
  if (videoEnabled) {
    covParts.push(
      `Video: ${videoStartHour}:${videoStartMinute} ${videoStartPeriod} - ${videoEndHour}:${videoEndMinute} ${videoEndPeriod}`
    );
  }
  if (covParts.length > 0) {
    hy += 9 + HDR_BLOCK_GAP;
    doc.setFontSize(7.5);
    doc.setTextColor(140, 140, 140);
    doc.text(covParts.join("   -   "), PW / 2, hy, { align: "center" });
  }
  doc.setDrawColor(...PDF_ACCENT_RGB);
  doc.setLineWidth(0.75);
  doc.line(MX, MY_TOP + HDR_H - 6, PW - MX, MY_TOP + HDR_H - 6);
}

function fmtDateLong(dateStr) {
  if (!dateStr) return '';
  const dt = new Date(dateStr.includes('-') && !dateStr.includes('T') ? dateStr + 'T00:00:00' : dateStr);
  if (isNaN(dt.getTime())) return dateStr;
  return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function hexToRgb(hex) {
  const h = (hex || '#ffffff').replace('#', '').padEnd(6, '0');
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}

/** Draw a location block on PDF; returns vertical space consumed (height + gap). */
function drawPdfLocationRow(doc, row, y, ts) {
  const { locH, eventLines, addressLines, noteLines, travelText } =
    measurePdfLocationBlock(row, doc);

  doc.setFillColor(248, 246, 243);
  doc.rect(MX, y, CW, locH, "F");
  doc.setFillColor(...PDF_ACCENT_RGB);
  doc.rect(MX, y, 3, locH, "F");

  let ly = y + LOC_PAD_TOP;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(160, 160, 160);
  doc.text(ts, PDF_LOC_TIME_X, ly);
  ly += pdfStackedTextHeight(doc, 7.5, ts, COL_TIME - 10) + LOC_LINE_GAP;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(26, 26, 26);
  doc.text(eventLines, PDF_LOC_BODY_X, ly);
  ly += pdfStackedTextHeight(doc, 10, eventLines, PDF_LOC_BODY_W) + LOC_LINE_GAP;

  if (addressLines.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(addressLines, PDF_LOC_BODY_X, ly);
    ly += pdfStackedTextHeight(doc, 8, addressLines, PDF_LOC_BODY_W) + LOC_LINE_GAP;
  }

  doc.setFontSize(7.5);
  doc.setTextColor(150, 150, 150);
  doc.text(travelText, PDF_LOC_BODY_X, ly);
  ly += pdfStackedTextHeight(doc, 7.5, travelText, PDF_LOC_BODY_W);

  if (noteLines.length) {
    ly += LOC_LINE_GAP;
    doc.setFont("times", "italic");
    doc.setFontSize(8);
    doc.setTextColor(130, 130, 130);
    doc.text(noteLines, PDF_LOC_BODY_X, ly);
  }

  return locH + LOC_ROW_GAP;
}

/** Draw a standard/custom event row on PDF; returns vertical space consumed. */
function drawPdfEventRow(doc, row, y, ts) {
  const { rowH, noteLines, eventLines } = measurePdfEventRow(row, doc);
  const [ar, ag, ab] = hexToRgb(getEventColor(row.event));

  doc.setFillColor(ar, ag, ab);
  doc.rect(MX, y, 2.5, rowH, "F");
  doc.setDrawColor(240, 237, 232);
  doc.setLineWidth(0.4);
  doc.line(MX, y + rowH, PW - MX, y + rowH);

  let ly = y + EVT_PAD_TOP;
  const mainBase = ly;

  doc.setFont("helvetica", PDF_TIME_WEIGHT);
  doc.setFontSize(8.5);
  doc.setTextColor(50, 50, 50);
  doc.text(ts, PDF_EVT_TIME_X, mainBase);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(26, 26, 26);
  doc.text(eventLines, PDF_EVT_BODY_X, mainBase, { maxWidth: PDF_EVT_BODY_W });

  doc.setFontSize(8.5);
  doc.setTextColor(110, 110, 110);
  doc.text(String(row.duration), PW - MX - COL_SET - 4, mainBase, { align: "right" });
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text(row.isOutdoor ? "OUT" : "IN", PW - MX - COL_SET / 2, mainBase, { align: "center" });

  const mainH = Math.max(
    pdfStackedTextHeight(doc, 8.5, ts, COL_TIME - 10),
    pdfStackedTextHeight(doc, 9, eventLines, PDF_EVT_BODY_W)
  );
  ly = mainBase + mainH + 4;

  if (noteLines.length) {
    doc.setFont("times", "italic");
    doc.setFontSize(8);
    doc.setTextColor(130, 130, 130);
    doc.text(noteLines, PDF_EVT_BODY_X, ly);
  }

  return rowH + RH_GAP;
}

function drawPdfConstraintRow(doc, row, y, ts) {
  doc.setFillColor(255, 245, 245);
  doc.rect(MX, y, CW, RH_CON, "F");
  doc.setFillColor(204, 68, 68);
  doc.rect(MX, y, 3, RH_CON, "F");

  const midY = y + RH_CON / 2 + 3;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(ts, PDF_EVT_TIME_X, midY);
  doc.setTextColor(204, 68, 68);
  doc.setFontSize(9);
  doc.text("[!] TIME CONSTRAINT", PDF_EVT_BODY_X, midY);

  return RH_CON + RH_GAP;
}

function drawPdfTimelineRows(doc, pageRows, csY) {
  let y = csY + RH_COL + 4;

  for (const row of pageRows) {
    const t = formatTime(row.time);
    const ts = `${t.hour}:${t.minute} ${t.period}`;

    if (row.type === "location") {
      y += drawPdfLocationRow(doc, row, y, ts);
    } else if (row.type === "constraint") {
      y += drawPdfConstraintRow(doc, row, y, ts);
    } else {
      y += drawPdfEventRow(doc, row, y, ts);
    }
  }
}

// ── Preview sub-components (all measurements in raw pt/px — PreviewPage scales via CSS transform) ──
function PvHeader({ bride, groom, date, photoStartHour, photoStartMinute, photoStartPeriod, photoEndHour, photoEndMinute, photoEndPeriod, videoStartHour, videoStartMinute, videoStartPeriod, videoEndHour, videoEndMinute, videoEndPeriod, photoEnabled, videoEnabled }) {
  const covParts = [];
  if (photoEnabled) covParts.push(`Photo: ${photoStartHour}:${photoStartMinute} ${photoStartPeriod} – ${photoEndHour}:${photoEndMinute} ${photoEndPeriod}`);
  if (videoEnabled) covParts.push(`Video: ${videoStartHour}:${videoStartMinute} ${videoStartPeriod} – ${videoEndHour}:${videoEndMinute} ${videoEndPeriod}`);
  return (
    <div style={{ height: HDR_H, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
      <img
        src={weddingPotionLogo}
        alt="Wedding Potion"
        style={{ width: LOGO_DISPLAY_W, height: LOGO_DISPLAY_H, objectFit: 'contain', display: 'block' }}
      />
      <div style={{ fontSize: HDR_NAMES_FONT, fontFamily: "'Cormorant Garamond', serif", color: '#1a1a1a', fontWeight: 300, lineHeight: 1 }}>{bride || 'Bride'} &amp; {groom || 'Groom'}</div>
      <div style={{ fontSize: 9, fontFamily: "'Jost', sans-serif", color: '#555', fontWeight: 300, letterSpacing: '0.08em' }}>{fmtDateLong(date)}</div>
      {covParts.length > 0 && <div style={{ fontSize: 7.5, fontFamily: "'Jost', sans-serif", color: '#888', fontWeight: 300 }}>{covParts.join('  ·  ')}</div>}
      <div style={{ width: '100%', height: 0.75, background: 'var(--wtb-accent)', marginTop: 4 }} />
    </div>
  );
}

function PvColHeaders() {
  const lbl = { fontSize: 6.5, fontFamily: "'Jost', sans-serif", fontWeight: 400, color: 'var(--wtb-accent)', textTransform: 'uppercase', letterSpacing: '0.1em' };
  return (
    <div style={{ display: 'flex', height: RH_COL, flexShrink: 0, alignItems: 'center', borderBottom: '0.5px solid var(--wtb-accent)', marginBottom: 3 }}>
      <div style={{ ...lbl, width: COL_TIME }}>Time</div>
      <div style={{ ...lbl, flex: 1 }}>Event</div>
      <div style={{ ...lbl, width: COL_DUR, textAlign: 'right' }}>Min</div>
      <div style={{ ...lbl, width: COL_SET, textAlign: 'center' }}>Setting</div>
    </div>
  );
}

function PvRow({ row }) {
  const t = formatTime(row.time);
  const timeStr = `${t.hour}:${t.minute} ${t.period}`;
  if (row.type === "location") {
    const { locH, eventLines, addressLines, noteLines } = measureLocationBlock(row);
    const lineStyle = { margin: 0, lineHeight: 1.25 };
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          height: locH,
          minHeight: locH,
          flexShrink: 0,
          marginBottom: LOC_ROW_GAP,
          paddingTop: LOC_PAD_TOP,
          paddingBottom: LOC_PAD_BOTTOM,
          paddingLeft: 7,
          paddingRight: 4,
          background: "#f8f6f3",
          borderLeft: "3px solid var(--wtb-accent)",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        <div style={{ fontSize: 7.5, color: "#aaa", fontFamily: "'Jost', sans-serif", ...lineStyle, marginBottom: LOC_LINE_GAP }}>
          {timeStr}
        </div>
        {eventLines.map((line, i) => (
          <div
            key={`ev-${i}`}
            style={{ fontSize: 10, color: "#1a1a1a", fontFamily: "'Jost', sans-serif", fontWeight: 500, ...lineStyle, marginBottom: i < eventLines.length - 1 ? 2 : LOC_LINE_GAP }}
          >
            {line}
          </div>
        ))}
        {addressLines.map((line, i) => (
          <div
            key={`ad-${i}`}
            style={{ fontSize: 8, color: "#666", fontFamily: "'Jost', sans-serif", ...lineStyle, marginBottom: i < addressLines.length - 1 ? 2 : LOC_LINE_GAP }}
          >
            {line}
          </div>
        ))}
        <div style={{ fontSize: 7.5, color: "#aaa", fontFamily: "'Jost', sans-serif", ...lineStyle, marginBottom: noteLines.length ? LOC_LINE_GAP : 0 }}>
          Travel time: {row.duration} min
        </div>
        {noteLines.map((line, i) => (
          <div
            key={`nt-${i}`}
            style={{
              fontSize: 8,
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              color: "#777",
              ...lineStyle,
              marginBottom: i < noteLines.length - 1 ? 2 : 0,
            }}
          >
            {line}
          </div>
        ))}
      </div>
    );
  }
  if (row.type === 'constraint') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', height: RH_CON, flexShrink: 0, marginBottom: RH_GAP, paddingLeft: 7, paddingRight: 4, background: 'repeating-linear-gradient(45deg,#fff8f8,#fff8f8 6px,#fff2f2 6px,#fff2f2 12px)', borderLeft: '3px solid #cc4444', gap: 10 }}>
        <div style={{ fontSize: 8, color: '#999', fontFamily: "'Jost', sans-serif", flexShrink: 0 }}>{timeStr}</div>
        <div style={{ fontSize: 8.5, color: '#cc4444', fontFamily: "'Jost', sans-serif", fontWeight: 500 }}>⚠ Time Constraint</div>
        {row.notes && row.notes.trim() && <div style={{ fontSize: 7.5, color: '#888', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', marginLeft: 'auto' }}>{row.notes}</div>}
      </div>
    );
  }
  const accent = getEventColor(row.event);
  const { rowH, noteLines } = measureEventRow(row);
  const lineStyle = { margin: 0, lineHeight: 1.25 };
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', height: rowH, minHeight: rowH, flexShrink: 0, marginBottom: RH_GAP, paddingTop: EVT_PAD_TOP, paddingLeft: 5, paddingRight: 4, borderLeft: `2.5px solid ${accent}`, borderBottom: '0.4px solid #f0ede8', overflow: 'hidden', boxSizing: 'border-box' }}>
      <div style={{ width: COL_TIME - 5, fontSize: 8.5, fontFamily: "'Jost', sans-serif", color: '#333', fontWeight: 700, flexShrink: 0, paddingTop: 2 }}>{timeStr}</div>
      <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
        <div style={{ fontSize: 9, fontFamily: "'Jost', sans-serif", color: '#1a1a1a', ...lineStyle }}>{row.event || '(empty)'}</div>
        {noteLines.map((line, i) => (
          <div
            key={`en-${i}`}
            style={{
              fontSize: 8,
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              color: '#777',
              ...lineStyle,
              marginTop: i === 0 ? 2 : 0,
              marginBottom: i < noteLines.length - 1 ? 2 : 0,
            }}
          >
            {line}
          </div>
        ))}
      </div>
      <div style={{ width: COL_DUR, fontSize: 8.5, fontFamily: "'Jost', sans-serif", color: '#666', textAlign: 'right', flexShrink: 0, paddingTop: 2 }}>{row.duration}</div>
      <div style={{ width: COL_SET, fontSize: 9, textAlign: 'center', flexShrink: 0, paddingTop: 2 }}>{row.isOutdoor ? '☀' : '⌂'}</div>
    </div>
  );
}

function PvFooter({ pageNum, totalPages, bride, groom, date }) {
  return (
    <div style={{ position: 'absolute', bottom: 10, left: MX, right: MX, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '0.4px solid #ddd', paddingTop: 5 }}>
      <div style={{ fontSize: 7, fontFamily: "'Jost', sans-serif", color: '#bbb' }}>{bride || 'Bride'} &amp; {groom || 'Groom'} · {fmtDateLong(date)}</div>
      <div style={{ fontSize: 7, fontFamily: "'Jost', sans-serif", color: '#bbb' }}>{pageNum} of {totalPages}</div>
    </div>
  );
}

// The page is always rendered at PW×PH in layout space.
// The outer wrapper has dimensions PW*sc × PH*sc (the visual footprint),
// and CSS transform: scale(sc) shrinks/enlarges the inner page visually
// without affecting the layout of the surrounding container.
function PreviewPage({ items, isFirst, pageNum, totalPages, sc, bride, groom, date, photoStartHour, photoStartMinute, photoStartPeriod, photoEndHour, photoEndMinute, photoEndPeriod, videoStartHour, videoStartMinute, videoStartPeriod, videoEndHour, videoEndMinute, videoEndPeriod, photoEnabled, videoEnabled }) {
  return (
    <div style={{ width: PW * sc, height: PH * sc, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
      <div style={{ width: PW, height: PH, background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.18)', position: 'absolute', top: 0, left: 0, transform: `scale(${sc})`, transformOrigin: 'top left' }}>
        <div style={{ position: 'absolute', left: MX, right: MX, top: MY_TOP, bottom: MY_BOT + FTR_H + 4, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {isFirst && <PvHeader bride={bride} groom={groom} date={date} photoStartHour={photoStartHour} photoStartMinute={photoStartMinute} photoStartPeriod={photoStartPeriod} photoEndHour={photoEndHour} photoEndMinute={photoEndMinute} photoEndPeriod={photoEndPeriod} videoStartHour={videoStartHour} videoStartMinute={videoStartMinute} videoStartPeriod={videoStartPeriod} videoEndHour={videoEndHour} videoEndMinute={videoEndMinute} videoEndPeriod={videoEndPeriod} photoEnabled={photoEnabled} videoEnabled={videoEnabled} />}
          <PvColHeaders />
          {items.map((row, i) => <PvRow key={row.id ?? i} row={row} />)}
        </div>
        <PvFooter pageNum={pageNum} totalPages={totalPages} bride={bride} groom={groom} date={date} />
      </div>
    </div>
  );
}

function TimelinePreview({ rows, bride, groom, date, photoStartHour, photoStartMinute, photoStartPeriod, photoEndHour, photoEndMinute, photoEndPeriod, videoStartHour, videoStartMinute, videoStartPeriod, videoEndHour, videoEndMinute, videoEndPeriod, photoEnabled, videoEnabled }) {
  const containerRef = useRef(null);
  const [panelW, setPanelW] = useState(500);
  const [userZoom, setUserZoom] = useState(1);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(entries => setPanelW(entries[0].contentRect.width));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const baseScale = Math.max(0.2, (panelW - 32) / PW);
  const sc = baseScale * userZoom;
  const pages = layoutPreviewPages(rows);

  const brideFirst = (bride || 'Bride').trim().split(/\s+/)[0];
  const groomFirst = (groom || 'Groom').trim().split(/\s+/)[0];

  const handleExport = async () => {
    setExporting(true);
    try {
      const doc = await buildTimelinePdfDoc({
        userRows: rows,
        bride,
        groom,
        date,
        photoStartHour,
        photoStartMinute,
        photoStartPeriod,
        photoEndHour,
        photoEndMinute,
        photoEndPeriod,
        videoStartHour,
        videoStartMinute,
        videoStartPeriod,
        videoEndHour,
        videoEndMinute,
        videoEndPeriod,
        photoEnabled,
        videoEnabled,
      });
      doc.save(`${brideFirst}-${groomFirst}-Wedding-Timeline.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const toolBtn = (extra = {}) => ({ padding: '4px 10px', background: 'transparent', border: '1px solid var(--wtb-border)', borderRadius: 4, color: 'var(--wtb-accent)', fontSize: 11, fontFamily: "'Jost', sans-serif", cursor: 'pointer', ...extra });
  const isEmpty = pages.length === 0 || (pages.length === 1 && pages[0].length === 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingBottom: 8, flexShrink: 0 }}>
        <button style={toolBtn()} onClick={() => setUserZoom(z => Math.max(0.4, +(z - 0.15).toFixed(2)))}>−</button>
        <span style={{ fontSize: 11, color: 'var(--wtb-text-muted)', fontFamily: "'Jost', sans-serif", minWidth: 38, textAlign: 'center' }}>{Math.round(userZoom * 100)}%</span>
        <button style={toolBtn()} onClick={() => setUserZoom(z => Math.min(2.5, +(z + 0.15).toFixed(2)))}>+</button>
      </div>
      <div ref={containerRef} style={{ flex: 1, minHeight: 0, overflow: 'auto', background: 'var(--wtb-surface-raised)', borderRadius: 6, padding: '16px 16px 32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          {isEmpty ? (
            <div style={{ padding: 40, color: 'var(--wtb-text-muted)', fontSize: 12, fontFamily: "'Jost', sans-serif", textAlign: 'center', letterSpacing: '0.05em' }}>
              Generate a timeline to preview it here.
            </div>
          ) : pages.map((items, i) => (
            <PreviewPage key={i} items={items} isFirst={i === 0} pageNum={i + 1} totalPages={pages.length} sc={sc}
              bride={bride} groom={groom} date={date}
              photoStartHour={photoStartHour} photoStartMinute={photoStartMinute} photoStartPeriod={photoStartPeriod}
              photoEndHour={photoEndHour} photoEndMinute={photoEndMinute} photoEndPeriod={photoEndPeriod}
              videoStartHour={videoStartHour} videoStartMinute={videoStartMinute} videoStartPeriod={videoStartPeriod}
              videoEndHour={videoEndHour} videoEndMinute={videoEndMinute} videoEndPeriod={videoEndPeriod}
              photoEnabled={photoEnabled} videoEnabled={videoEnabled}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

async function buildTimelinePdfDoc(params) {
  const {
    userRows,
    bride,
    groom,
    date,
    photoStartHour,
    photoStartMinute,
    photoStartPeriod,
    photoEndHour,
    photoEndMinute,
    photoEndPeriod,
    videoStartHour,
    videoStartMinute,
    videoStartPeriod,
    videoEndHour,
    videoEndMinute,
    videoEndPeriod,
    photoEnabled,
    videoEnabled,
  } = params;

  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const timelineRows = prepareTimelineExportRows(userRows);
  const allPages = layoutPdfPages(timelineRows, doc);
  const headerParams = {
    bride, groom, date,
    photoStartHour, photoStartMinute, photoStartPeriod,
    photoEndHour, photoEndMinute, photoEndPeriod,
    videoStartHour, videoStartMinute, videoStartPeriod,
    videoEndHour, videoEndMinute, videoEndPeriod,
    photoEnabled, videoEnabled,
  };

  for (let pi = 0; pi < allPages.length; pi++) {
    const pageRows = allPages[pi];
    if (pi > 0) doc.addPage();
    if (pi === 0) await drawPdfFirstPageHeader(doc, headerParams);

    const csY = pi === 0 ? MY_TOP + HDR_H : MY_TOP;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...PDF_ACCENT_RGB);
    doc.text('TIME', MX, csY + 13);
    doc.text('EVENT', MX + COL_TIME, csY + 13);
    doc.text('MIN', PW - MX - COL_SET - 2, csY + 13, { align: 'right' });
    doc.text('SETTING', PW - MX - COL_SET / 2, csY + 13, { align: 'center' });
    doc.setDrawColor(...PDF_ACCENT_RGB);
    doc.setLineWidth(0.5);
    doc.line(MX, csY + RH_COL, PW - MX, csY + RH_COL);
    drawPdfTimelineRows(doc, pageRows, csY);

    const ftrY = PH - MY_BOT + 4;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.4);
    doc.line(MX, ftrY - 6, PW - MX, ftrY - 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(180, 180, 180);
    doc.text(`${bride || 'Bride'} & ${groom || 'Groom'} - ${fmtDateLong(date)}`, MX, ftrY);
    doc.text(`${pi + 1} of ${allPages.length}`, PW - MX, ftrY, { align: 'right' });
  }

  return doc;
}

function openPdfForPrint(doc) {
  doc.autoPrint({ variant: 'non-conform' });
  const url = doc.output('bloburl');
  const iframe = document.createElement('iframe');
  iframe.setAttribute('title', 'Print timeline');
  iframe.style.cssText =
    'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
  iframe.src = url;
  document.body.appendChild(iframe);
  iframe.onload = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      const win = window.open(url, '_blank');
      if (!win) window.alert('Please allow pop-ups to print your timeline.');
    }
    setTimeout(() => {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      URL.revokeObjectURL(url);
    }, 120000);
  };
}

export async function exportPDF(params) {
  const { setExporting, setShowExportMenu, closeMobileGearMenu } = params;
  setExporting?.(true);
  setShowExportMenu?.(false);
  closeMobileGearMenu?.();
  try {
    const doc = await buildTimelinePdfDoc(params);
    const brideFirst = (params.bride || 'Bride').trim().split(/\s+/)[0];
    const groomFirst = (params.groom || 'Groom').trim().split(/\s+/)[0];
    doc.save(`${brideFirst}-${groomFirst}-Wedding-Timeline.pdf`);
  } catch (err) {
    console.error('PDF export failed:', err);
  } finally {
    setExporting?.(false);
  }
}

export async function printTimeline(params) {
  const { setShowExportMenu, closeMobileGearMenu } = params;
  setShowExportMenu?.(false);
  closeMobileGearMenu?.();
  try {
    const doc = await buildTimelinePdfDoc(params);
    openPdfForPrint(doc);
  } catch (err) {
    console.error('Print failed:', err);
  }
}

export {
  TimelinePreview,
  layoutPreviewPages,
  prepareTimelineExportRows,
  fmtDateLong,
  hexToRgb,
};
