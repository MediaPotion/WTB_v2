import { formatClockLabel } from "../../lib/time";

export const MIN_TIME_LABEL_GAP_PX = 40;
export const HIDE_SEGMENT_LABEL_BELOW_PX = 60;

const SHORT_LABELS = {
  "Getting Ready & Pre-Ceremony": "Pre-Ceremony",
  "Post-Ceremony Portraits": "Post-Ceremony",
  "Golden Hour": "Golden Hour",
  "Late Reception": "Late Reception",
  "Reception": "Reception",
};

/** Priority: ceremony (3) > window boundary (2). */
export function buildBoundaryMarkers(windows, ceremonyStart, ceremonyEnd) {
  const items = [];
  if (ceremonyStart != null) {
    items.push({
      key: "ceremony-start",
      minutes: ceremonyStart,
      label: formatClockLabel(ceremonyStart),
      priority: 3,
    });
  }
  if (ceremonyEnd != null) {
    items.push({
      key: "ceremony-end",
      minutes: ceremonyEnd,
      label: formatClockLabel(ceremonyEnd),
      priority: 3,
    });
  }
  windows.forEach((w) => {
    items.push({
      key: `${w.id}-start`,
      minutes: w.startTime,
      label: formatClockLabel(w.startTime),
      priority: 2,
    });
    items.push({
      key: `${w.id}-end`,
      minutes: w.endTime,
      label: formatClockLabel(w.endTime),
      priority: 2,
    });
  });

  const byMinutes = new Map();
  for (const item of items) {
    const existing = byMinutes.get(item.minutes);
    if (!existing || item.priority > existing.priority) {
      byMinutes.set(item.minutes, item);
    }
  }
  return [...byMinutes.values()].sort((a, b) => a.minutes - b.minutes);
}

/**
 * Place time labels with min pixel gap; lower priority hidden or staggered to row 2.
 * @returns markers with visible, staggerRow (0|1), px
 */
export function layoutTimeLabels(markers, barWidthPx, minGap = MIN_TIME_LABEL_GAP_PX) {
  if (!barWidthPx || barWidthPx <= 0) {
    return markers.map((m) => ({ ...m, visible: true, staggerRow: 0, px: 0 }));
  }

  const withPx = markers.map((m) => ({
    ...m,
    px: ((m.pct ?? 0) / 100) * barWidthPx,
  }));

  const sorted = [...withPx].sort(
    (a, b) => b.priority - a.priority || a.px - b.px
  );
  const placed = [];

  const result = new Map();
  for (const m of sorted) {
    let visible = false;
    let staggerRow = 0;

    for (const row of [0, 1]) {
      const conflict = placed.some(
        (p) => p.visible && p.staggerRow === row && Math.abs(p.px - m.px) < minGap
      );
      if (!conflict) {
        visible = true;
        staggerRow = row;
        placed.push({ px: m.px, staggerRow, visible: true, priority: m.priority });
        break;
      }
    }

    result.set(m.key, { ...m, visible, staggerRow, px: m.px });
  }

  return markers.map((m) => result.get(m.key) || { ...m, visible: false, staggerRow: 0, px: 0 });
}

export function segmentLabelForWidth(label, widthPx) {
  if (widthPx < HIDE_SEGMENT_LABEL_BELOW_PX) return null;
  if (widthPx < 95) {
    return SHORT_LABELS[label] || label.replace(/&/g, "").split(/\s+/).slice(0, 2).map((w) => w[0]).join("");
  }
  if (widthPx < 130) {
    return SHORT_LABELS[label] || (label.length > 14 ? `${label.slice(0, 12)}…` : label);
  }
  return label;
}

export function segmentShowsIconOnly(widthPx) {
  return widthPx < HIDE_SEGMENT_LABEL_BELOW_PX;
}
