import React, { useState, useEffect, useRef } from "react";
import { formatTime } from "./time";
import { getEventColor } from "../constants/colors";

const PW = 612, PH = 792;          // US Letter
const MX = 38, MY_TOP = 48, MY_BOT = 36;
const CW = PW - 2 * MX;           // 536
const RH_COL  = 18;  // column-header row
const RH_EVT  = 22;  // event row (no notes)
const RH_NOTE = 13;  // per wrapped note line
const RH_LOC  = 46;  // location block
const RH_CON  = 32;  // constraint block
const RH_GAP  = 3;   // gap after each row
const HDR_H   = 122; // first-page header height
const FTR_H   = 22;  // footer height
const COL_TIME = 66, COL_DUR = 34, COL_SET = 28;

function previewRowH(row) {
  if (!row) return RH_EVT + RH_GAP;
  if (row.type === 'location') return RH_LOC + RH_GAP;
  if (row.type === 'constraint') return RH_CON + RH_GAP;
  const noteLines = row.notes && row.notes.trim()
    ? Math.ceil(row.notes.trim().length / 58) : 0;
  return RH_EVT + noteLines * RH_NOTE + RH_GAP;
}

function layoutPreviewPages(rows) {
  const firstAvail = PH - MY_TOP - HDR_H - RH_COL - MY_BOT - FTR_H - 8;
  const otherAvail = PH - MY_TOP - RH_COL  - MY_BOT - FTR_H - 8;
  const pages = [];
  let curr = [], used = 0;
  for (const row of rows) {
    const h = previewRowH(row);
    const avail = pages.length === 0 ? firstAvail : otherAvail;
    if (curr.length > 0 && used + h > avail) { pages.push(curr); curr = []; used = 0; }
    curr.push(row); used += h;
  }
  pages.push(curr);
  return pages;
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

// ── Preview sub-components (all measurements in raw pt/px — PreviewPage scales via CSS transform) ──
function PvHeader({ bride, groom, date, photoStartHour, photoStartMinute, photoStartPeriod, photoEndHour, photoEndMinute, photoEndPeriod, videoStartHour, videoStartMinute, videoStartPeriod, videoEndHour, videoEndMinute, videoEndPeriod, photoEnabled, videoEnabled }) {
  const covParts = [];
  if (photoEnabled) covParts.push(`Photo: ${photoStartHour}:${photoStartMinute} ${photoStartPeriod} – ${photoEndHour}:${photoEndMinute} ${photoEndPeriod}`);
  if (videoEnabled) covParts.push(`Video: ${videoStartHour}:${videoStartMinute} ${videoStartPeriod} – ${videoEndHour}:${videoEndMinute} ${videoEndPeriod}`);
  return (
    <div style={{ height: HDR_H, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
      <div style={{ fontSize: 7.5, letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: "'Jost', sans-serif", color: '#b8906a', fontWeight: 300 }}>Wedding Potion</div>
      <div style={{ fontSize: 24, fontFamily: "'Cormorant Garamond', serif", color: '#1a1a1a', fontWeight: 300, lineHeight: 1 }}>{bride || 'Bride'} &amp; {groom || 'Groom'}</div>
      <div style={{ fontSize: 9, fontFamily: "'Jost', sans-serif", color: '#555', fontWeight: 300, letterSpacing: '0.08em' }}>{fmtDateLong(date)}</div>
      {covParts.length > 0 && <div style={{ fontSize: 7.5, fontFamily: "'Jost', sans-serif", color: '#888', fontWeight: 300 }}>{covParts.join('  ·  ')}</div>}
      <div style={{ width: '100%', height: 0.75, background: '#b8906a', marginTop: 4 }} />
    </div>
  );
}

function PvColHeaders() {
  const lbl = { fontSize: 6.5, fontFamily: "'Jost', sans-serif", fontWeight: 400, color: '#b8906a', textTransform: 'uppercase', letterSpacing: '0.1em' };
  return (
    <div style={{ display: 'flex', height: RH_COL, flexShrink: 0, alignItems: 'center', borderBottom: '0.5px solid #b8906a', marginBottom: 3 }}>
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
  if (row.type === 'location') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: RH_LOC, flexShrink: 0, marginBottom: RH_GAP, paddingLeft: 7, paddingRight: 4, background: '#f8f6f3', borderLeft: '3px solid #b8906a' }}>
        <div style={{ fontSize: 7.5, color: '#aaa', fontFamily: "'Jost', sans-serif", marginBottom: 2 }}>{timeStr}</div>
        <div style={{ fontSize: 10, color: '#1a1a1a', fontFamily: "'Jost', sans-serif", fontWeight: 500 }}>📍 {row.event || '(Travel)'}</div>
        {row.address && row.address.trim() && <div style={{ fontSize: 8, color: '#666', fontFamily: "'Jost', sans-serif", marginTop: 2 }}>{row.address}</div>}
        <div style={{ fontSize: 7.5, color: '#aaa', fontFamily: "'Jost', sans-serif", marginTop: 2 }}>Travel time: {row.duration} min</div>
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
  const noteLines = row.notes && row.notes.trim() ? Math.ceil(row.notes.trim().length / 58) : 0;
  const rowH = RH_EVT + noteLines * RH_NOTE;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', height: rowH, flexShrink: 0, marginBottom: RH_GAP, paddingTop: 4, paddingLeft: 5, paddingRight: 4, borderLeft: `2.5px solid ${accent}`, borderBottom: '0.4px solid #f0ede8' }}>
      <div style={{ width: COL_TIME - 5, fontSize: 8.5, fontFamily: "'Jost', sans-serif", color: '#333', fontWeight: 500, flexShrink: 0 }}>{timeStr}</div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ fontSize: 9, fontFamily: "'Jost', sans-serif", color: '#1a1a1a', lineHeight: 1.25 }}>{row.event || '(empty)'}</div>
        {row.notes && row.notes.trim() && <div style={{ fontSize: 8, fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: '#777', marginTop: 2, lineHeight: 1.2 }}>{row.notes}</div>}
      </div>
      <div style={{ width: COL_DUR, fontSize: 8.5, fontFamily: "'Jost', sans-serif", color: '#666', textAlign: 'right', flexShrink: 0 }}>{row.duration}</div>
      <div style={{ width: COL_SET, fontSize: 9, textAlign: 'center', flexShrink: 0 }}>{row.isOutdoor ? '☀' : '⌂'}</div>
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
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'pt', format: 'letter' });
      const allPages = layoutPreviewPages(rows);

      allPages.forEach((pageRows, pi) => {
        if (pi > 0) doc.addPage();

        if (pi === 0) {
          let hy = MY_TOP + 14;
          doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(184, 144, 106);
          doc.text('WEDDING POTION', PW / 2, hy, { align: 'center', charSpace: 1.5 });
          hy += 24;
          doc.setFont('times', 'normal'); doc.setFontSize(24); doc.setTextColor(26, 26, 26);
          doc.text(`${bride || 'Bride'} & ${groom || 'Groom'}`, PW / 2, hy, { align: 'center' });
          hy += 18;
          doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(90, 90, 90);
          doc.text(fmtDateLong(date), PW / 2, hy, { align: 'center', charSpace: 0.5 });
          hy += 13;
          const covParts = [];
          if (photoEnabled) covParts.push(`Photo: ${photoStartHour}:${photoStartMinute} ${photoStartPeriod} - ${photoEndHour}:${photoEndMinute} ${photoEndPeriod}`);
          if (videoEnabled) covParts.push(`Video: ${videoStartHour}:${videoStartMinute} ${videoStartPeriod} - ${videoEndHour}:${videoEndMinute} ${videoEndPeriod}`);
          if (covParts.length > 0) { doc.setFontSize(7.5); doc.setTextColor(140, 140, 140); doc.text(covParts.join('   -   '), PW / 2, hy, { align: 'center' }); }
          doc.setDrawColor(184, 144, 106); doc.setLineWidth(0.75);
          doc.line(MX, MY_TOP + HDR_H - 6, PW - MX, MY_TOP + HDR_H - 6);
        }

        const csY = pi === 0 ? MY_TOP + HDR_H : MY_TOP;
        doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(184, 144, 106);
        doc.text('TIME', MX, csY + 13);
        doc.text('EVENT', MX + COL_TIME, csY + 13);
        doc.text('MIN', PW - MX - COL_SET - 2, csY + 13, { align: 'right' });
        doc.text('SETTING', PW - MX - COL_SET / 2, csY + 13, { align: 'center' });
        doc.setDrawColor(184, 144, 106); doc.setLineWidth(0.5);
        doc.line(MX, csY + RH_COL, PW - MX, csY + RH_COL);

        let y = csY + RH_COL + 4;
        for (const row of pageRows) {
          const t = formatTime(row.time);
          const ts = `${t.hour}:${t.minute} ${t.period}`;
          if (row.type === 'location') {
            doc.setFillColor(248, 246, 243); doc.rect(MX, y, CW, RH_LOC, 'F');
            doc.setFillColor(184, 144, 106); doc.rect(MX, y, 3, RH_LOC, 'F');
            doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(160, 160, 160);
            doc.text(ts, MX + 8, y + 11);
            doc.setFontSize(10); doc.setTextColor(26, 26, 26);
            doc.text(row.event || '(Travel)', MX + 8, y + 23, { maxWidth: CW - 16 });
            if (row.address && row.address.trim()) { doc.setFontSize(8); doc.setTextColor(100, 100, 100); doc.text(row.address.trim(), MX + 8, y + 34, { maxWidth: CW - 16 }); }
            doc.setFontSize(7.5); doc.setTextColor(150, 150, 150);
            doc.text(`Travel: ${row.duration} min`, MX + 8, y + RH_LOC - 5);
            y += RH_LOC + RH_GAP;
          } else if (row.type === 'constraint') {
            doc.setFillColor(255, 245, 245); doc.rect(MX, y, CW, RH_CON, 'F');
            doc.setFillColor(204, 68, 68); doc.rect(MX, y, 3, RH_CON, 'F');
            doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(150, 150, 150);
            doc.text(ts, MX + 8, y + RH_CON / 2 + 3);
            doc.setTextColor(204, 68, 68); doc.setFontSize(9);
            doc.text('[!] TIME CONSTRAINT', MX + COL_TIME, y + RH_CON / 2 + 3);
            y += RH_CON + RH_GAP;
          } else {
            const [ar, ag, ab] = hexToRgb(getEventColor(row.event));
            doc.setFillColor(ar, ag, ab); doc.rect(MX, y, 2.5, RH_EVT, 'F');
            doc.setDrawColor(240, 237, 232); doc.setLineWidth(0.4);
            doc.line(MX, y + RH_EVT, PW - MX, y + RH_EVT);
            doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(50, 50, 50);
            doc.text(ts, MX + 5, y + 14);
            doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(26, 26, 26);
            doc.text(row.event || '(empty)', MX + COL_TIME, y + 14, { maxWidth: CW - COL_TIME - COL_DUR - COL_SET - 4 });
            doc.setFontSize(8.5); doc.setTextColor(110, 110, 110);
            doc.text(String(row.duration), PW - MX - COL_SET - 4, y + 14, { align: 'right' });
            doc.setFontSize(8); doc.setTextColor(80, 80, 80);
            doc.text(row.isOutdoor ? 'OUT' : 'IN', PW - MX - COL_SET / 2, y + 14, { align: 'center' });
            y += RH_EVT;
            if (row.notes && row.notes.trim()) {
              doc.setFont('times', 'italic'); doc.setFontSize(8); doc.setTextColor(130, 130, 130);
              const wrapped = doc.splitTextToSize(row.notes.trim(), CW - COL_TIME - COL_DUR - COL_SET - 8);
              doc.text(wrapped, MX + COL_TIME, y + 10);
              y += wrapped.length * RH_NOTE;
            }
            y += RH_GAP;
          }
        }

        const ftrY = PH - MY_BOT + 4;
        doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.4);
        doc.line(MX, ftrY - 6, PW - MX, ftrY - 6);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(180, 180, 180);
        doc.text(`${bride || 'Bride'} & ${groom || 'Groom'} - ${fmtDateLong(date)}`, MX, ftrY);
        doc.text(`${pi + 1} of ${allPages.length}`, PW - MX, ftrY, { align: 'right' });
      });

      doc.save(`${brideFirst}-${groomFirst}-Wedding-Timeline.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const toolBtn = (extra = {}) => ({ padding: '4px 10px', background: 'transparent', border: '1px solid #2a2520', borderRadius: 4, color: '#b8906a', fontSize: 11, fontFamily: "'Jost', sans-serif", cursor: 'pointer', ...extra });
  const isEmpty = pages.length === 0 || (pages.length === 1 && pages[0].length === 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingBottom: 8, flexShrink: 0 }}>
        <button style={toolBtn()} onClick={() => setUserZoom(z => Math.max(0.4, +(z - 0.15).toFixed(2)))}>−</button>
        <span style={{ fontSize: 11, color: '#6e6358', fontFamily: "'Jost', sans-serif", minWidth: 38, textAlign: 'center' }}>{Math.round(userZoom * 100)}%</span>
        <button style={toolBtn()} onClick={() => setUserZoom(z => Math.min(2.5, +(z + 0.15).toFixed(2)))}>+</button>
      </div>
      <div ref={containerRef} style={{ flex: 1, minHeight: 0, overflow: 'auto', background: '#f0ece6', borderRadius: 6, padding: '16px 16px 32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          {isEmpty ? (
            <div style={{ padding: 40, color: '#8a7a6a', fontSize: 12, fontFamily: "'Jost', sans-serif", textAlign: 'center', letterSpacing: '0.05em' }}>
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

export async function exportPDF(params) {
  setExporting(true);
  setShowExportMenu(false);
  closeMobileGearMenu();
  try {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'pt', format: 'letter' });
    const allPages = layoutPreviewPages(userRows);
    const brideFirst = (bride || 'Bride').trim().split(/\s+/)[0];
    const groomFirst = (groom || 'Groom').trim().split(/\s+/)[0];

    allPages.forEach((pageRows, pi) => {
      if (pi > 0) doc.addPage();
      if (pi === 0) {
        let hy = MY_TOP + 14;
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(184, 144, 106);
        doc.text('WEDDING POTION', PW / 2, hy, { align: 'center', charSpace: 1.5 });
        hy += 24;
        doc.setFont('times', 'normal'); doc.setFontSize(24); doc.setTextColor(26, 26, 26);
        doc.text(`${bride || 'Bride'} & ${groom || 'Groom'}`, PW / 2, hy, { align: 'center' });
        hy += 18;
        doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(90, 90, 90);
        doc.text(fmtDateLong(date), PW / 2, hy, { align: 'center', charSpace: 0.5 });
        hy += 13;
        const covParts = [];
        if (photoEnabled) covParts.push(`Photo: ${photoStartHour}:${photoStartMinute} ${photoStartPeriod} - ${photoEndHour}:${photoEndMinute} ${photoEndPeriod}`);
        if (videoEnabled) covParts.push(`Video: ${videoStartHour}:${videoStartMinute} ${videoStartPeriod} - ${videoEndHour}:${videoEndMinute} ${videoEndPeriod}`);
        if (covParts.length > 0) { doc.setFontSize(7.5); doc.setTextColor(140, 140, 140); doc.text(covParts.join('   -   '), PW / 2, hy, { align: 'center' }); }
        doc.setDrawColor(184, 144, 106); doc.setLineWidth(0.75);
        doc.line(MX, MY_TOP + HDR_H - 6, PW - MX, MY_TOP + HDR_H - 6);
      }
      const csY = pi === 0 ? MY_TOP + HDR_H : MY_TOP;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(184, 144, 106);
      doc.text('TIME', MX, csY + 13);
      doc.text('EVENT', MX + COL_TIME, csY + 13);
      doc.text('MIN', PW - MX - COL_SET - 2, csY + 13, { align: 'right' });
      doc.text('SETTING', PW - MX - COL_SET / 2, csY + 13, { align: 'center' });
      doc.setDrawColor(184, 144, 106); doc.setLineWidth(0.5);
      doc.line(MX, csY + RH_COL, PW - MX, csY + RH_COL);
      let y = csY + RH_COL + 4;
      for (const row of pageRows) {
        const t = formatTime(row.time);
        const ts = `${t.hour}:${t.minute} ${t.period}`;
        if (row.type === 'location') {
          doc.setFillColor(248, 246, 243); doc.rect(MX, y, CW, RH_LOC, 'F');
          doc.setFillColor(184, 144, 106); doc.rect(MX, y, 3, RH_LOC, 'F');
          doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(160, 160, 160);
          doc.text(ts, MX + 8, y + 11);
          doc.setFontSize(10); doc.setTextColor(26, 26, 26);
          doc.text(row.event || '(Travel)', MX + 8, y + 23, { maxWidth: CW - 16 });
          if (row.address && row.address.trim()) { doc.setFontSize(8); doc.setTextColor(100, 100, 100); doc.text(row.address.trim(), MX + 8, y + 34, { maxWidth: CW - 16 }); }
          doc.setFontSize(7.5); doc.setTextColor(150, 150, 150);
          doc.text(`Travel: ${row.duration} min`, MX + 8, y + RH_LOC - 5);
          y += RH_LOC + RH_GAP;
        } else if (row.type === 'constraint') {
          doc.setFillColor(255, 245, 245); doc.rect(MX, y, CW, RH_CON, 'F');
          doc.setFillColor(204, 68, 68); doc.rect(MX, y, 3, RH_CON, 'F');
          doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(150, 150, 150);
          doc.text(ts, MX + 8, y + RH_CON / 2 + 3);
          doc.setTextColor(204, 68, 68); doc.setFontSize(9);
          doc.text('[!] TIME CONSTRAINT', MX + COL_TIME, y + RH_CON / 2 + 3);
          y += RH_CON + RH_GAP;
        } else {
          const [ar, ag, ab] = hexToRgb(getEventColor(row.event));
          doc.setFillColor(ar, ag, ab); doc.rect(MX, y, 2.5, RH_EVT, 'F');
          doc.setDrawColor(240, 237, 232); doc.setLineWidth(0.4);
          doc.line(MX, y + RH_EVT, PW - MX, y + RH_EVT);
          doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(50, 50, 50);
          doc.text(ts, MX + 5, y + 14);
          doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(26, 26, 26);
          doc.text(row.event || '(empty)', MX + COL_TIME, y + 14, { maxWidth: CW - COL_TIME - COL_DUR - COL_SET - 4 });
          doc.setFontSize(8.5); doc.setTextColor(110, 110, 110);
          doc.text(String(row.duration), PW - MX - COL_SET - 4, y + 14, { align: 'right' });
          doc.setFontSize(8); doc.setTextColor(80, 80, 80);
          doc.text(row.isOutdoor ? 'OUT' : 'IN', PW - MX - COL_SET / 2, y + 14, { align: 'center' });
          y += RH_EVT;
          if (row.notes && row.notes.trim()) {
            doc.setFont('times', 'italic'); doc.setFontSize(8); doc.setTextColor(130, 130, 130);
            const wrapped = doc.splitTextToSize(row.notes.trim(), CW - COL_TIME - COL_DUR - COL_SET - 8);
            doc.text(wrapped, MX + COL_TIME, y + 10);
            y += wrapped.length * RH_NOTE;
          }
          y += RH_GAP;
        }
      }
      const ftrY = PH - MY_BOT + 4;
      doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.4);
      doc.line(MX, ftrY - 6, PW - MX, ftrY - 6);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(180, 180, 180);
      doc.text(`${bride || 'Bride'} & ${groom || 'Groom'} - ${fmtDateLong(date)}`, MX, ftrY);
      doc.text(`${pi + 1} of ${allPages.length}`, PW - MX, ftrY, { align: 'right' });
    });
    doc.save(`${brideFirst}-${groomFirst}-Wedding-Timeline.pdf`);
  } catch (err) {
    console.error('PDF export failed:', err);
  } finally {
    setExporting(false);
  }
}

export { TimelinePreview, layoutPreviewPages, fmtDateLong, hexToRgb };
