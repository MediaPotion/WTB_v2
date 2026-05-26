import { formatClockLabel } from "../../lib/time";

export const LOGISTICS_STATUS = {
  ok: {
    color: "#6b8f71",
    bg: "rgba(107, 143, 113, 0.35)",
    icon: "✓",
    label: "Comfortable",
  },
  tight: {
    color: "var(--wtb-accent)",
    bg: "rgba(184, 144, 106, 0.4)",
    icon: "!",
    label: "Tight",
  },
  overflow: {
    color: "#8b4545",
    bg: "rgba(139, 69, 69, 0.45)",
    icon: "✕",
    label: "Over capacity",
  },
};

export const NARROW_SEGMENT_PCT = 8;

/** Assign each window to a horizontal lane so overlapping ranges stack vertically. */
export function assignWindowLanes(windows) {
  const sorted = [...windows].sort(
    (a, b) => a.startTime - b.startTime || a.endTime - b.endTime
  );
  const laneEnds = [];
  const laneById = {};

  for (const w of sorted) {
    let lane = laneEnds.findIndex((end) => w.startTime >= end);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(w.endTime);
    } else {
      laneEnds[lane] = Math.max(laneEnds[lane], w.endTime);
    }
    laneById[w.id] = lane;
  }

  return { laneCount: Math.max(laneEnds.length, 1), laneById };
}

export function resolveDayBounds(windows, ctx, rows) {
  let dayStart =
    ctx.coverageStart ??
    (windows.length ? Math.min(...windows.map((w) => w.startTime)) : 0);
  let dayEnd = windows.length ? Math.max(...windows.map((w) => w.endTime)) : dayStart + 120;

  if (ctx.ceremonyStart != null) dayStart = Math.min(dayStart, ctx.ceremonyStart);
  if (ctx.ceremonyEnd != null) dayEnd = Math.max(dayEnd, ctx.ceremonyEnd);

  const active = (rows || []).filter(
    (r) => r.type !== "constraint" && String(r.event || "").trim()
  );
  for (const r of active) {
    dayStart = Math.min(dayStart, r.time);
    dayEnd = Math.max(dayEnd, r.time + (parseInt(r.duration, 10) || 0));
  }

  return { dayStart, dayEnd: Math.max(dayEnd, dayStart + 60) };
}

/** Hour tick positions for the time ruler. */
export function buildHourTicks(dayStart, dayEnd) {
  const span = Math.max(dayEnd - dayStart, 1);
  const firstHour = Math.ceil(dayStart / 60) * 60;
  const ticks = [{ minutes: dayStart, label: formatClockLabel(dayStart), pct: 0 }];
  for (let t = firstHour; t < dayEnd; t += 60) {
    ticks.push({
      minutes: t,
      label: formatClockLabel(t),
      pct: ((t - dayStart) / span) * 100,
    });
  }
  ticks.push({
    minutes: dayEnd,
    label: formatClockLabel(dayEnd),
    pct: 100,
  });
  return ticks;
}

export function buildOverflowHeadline(window, ctx) {
  const start = formatClockLabel(window.startTime);
  const end = formatClockLabel(window.endTime);
  const { availableMinutes: avail, usedMinutes: used, overflowMinutes: over } = window;

  if (window.id === "B") {
    return `Not enough time after the ceremony — you need ${used} minutes but only have ${avail} between ${formatClockLabel(ctx.ceremonyEnd)} and ${formatClockLabel(ctx.receptionStart)}`;
  }
  if (window.id === "A") {
    return `Pre-ceremony is over capacity — you need ${used} minutes but only have ${avail} between ${start} and ${end}`;
  }
  return `Not enough time in ${window.label} — you need ${used} minutes but only have ${avail} between ${start} and ${end} (${over} min short)`;
}

export function buildOverflowExplanation(window, ctx) {
  if (window.id === "B") {
    return `Portrait sessions and family photos after the ceremony are using more time than exists before the reception starts at ${formatClockLabel(ctx.receptionStart)}.`;
  }
  if (window.id === "A") {
    return "Too many pre-ceremony sessions are scheduled before the ceremony — detail shots, portraits, or getting-ready coverage may need to move or start earlier.";
  }
  const top = [...(window.events || [])]
    .filter((r) => r.type !== "constraint" && r.event)
    .sort((a, b) => (parseInt(b.duration, 10) || 0) - (parseInt(a.duration, 10) || 0))[0];
  if (top) {
    return `${top.event} and other events in this window need more time than the schedule allows.`;
  }
  return "Scheduled events in this window exceed the available time.";
}

export function buildTightHeadline(window) {
  return `Heads up — ${window.label} is tight (${window.remainingMinutes} min buffer between ${formatClockLabel(window.startTime)} and ${formatClockLabel(window.endTime)})`;
}

export function formatWindowTimeSummary(window, justResolved) {
  const st = justResolved ? "ok" : window.status;
  const avail = window.availableMinutes;
  const used = window.usedMinutes;
  if (st === "overflow") {
    return `${avail} minutes available — ${used} minutes scheduled — ${window.overflowMinutes} minutes over`;
  }
  if (
    window.id === "E" &&
    window.coverageOvertimeMinutes > 0 &&
    window.coverageOvertimeMinutes <= 15
  ) {
    return `${avail} minutes available — ${used} minutes scheduled — runs ${window.coverageOvertimeMinutes} min past coverage end (within flexible grace)`;
  }
  return `${avail} minutes available — ${used} minutes scheduled — ${window.remainingMinutes} minutes remaining`;
}

export function findGoldenHourOverlap(windows) {
  const d = windows.find((w) => w.id === "D");
  const e = windows.find((w) => w.id === "E");
  if (!d || !e) return null;
  const start = Math.max(d.startTime, e.startTime);
  const end = Math.min(d.endTime, e.endTime);
  if (end <= start) return null;
  return {
    minutes: end - start,
    otherLabel: e.label,
    otherStart: formatClockLabel(e.startTime),
  };
}
