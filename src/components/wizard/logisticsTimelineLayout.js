import { formatClockLabel } from "../../lib/time";

export const MIN_TIME_LABEL_GAP_PX = 50;
export const TIME_LABEL_BAR_GAP_PX = 20;
export const TIME_LABEL_HEIGHT_PX = 16;
export const HIDE_SEGMENT_LABEL_BELOW_PX = 60;
export const CEREMONY_TOOLTIP_ONLY_BELOW_PX = 20;

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
 * Stagger boundary time labels above/below the bar when centers are within minGap.
 * All labels start above; overlapping pairs move the right label to the other side.
 * @returns markers with visible, placement ('above'|'below'), px
 */
export function layoutTimeLabels(markers, barWidthPx, minGap = MIN_TIME_LABEL_GAP_PX) {
  if (!barWidthPx || barWidthPx <= 0) {
    return markers.map((m) => ({ ...m, visible: true, placement: "above", px: 0 }));
  }

  const withPx = markers.map((m) => ({
    ...m,
    px: ((m.pct ?? 0) / 100) * barWidthPx,
    visible: true,
  }));

  const sorted = [...withPx].sort((a, b) => a.px - b.px);
  const placementByKey = new Map(sorted.map((m) => [m.key, "above"]));

  let changed = true;
  let guard = 0;
  while (changed && guard < sorted.length * 8) {
    changed = false;
    guard += 1;
    for (let i = 0; i < sorted.length - 1; i += 1) {
      const left = sorted[i];
      const right = sorted[i + 1];
      if (right.px - left.px >= minGap) continue;

      const pLeft = placementByKey.get(left.key);
      const pRight = placementByKey.get(right.key);
      if (pLeft === pRight) {
        placementByKey.set(
          right.key,
          pLeft === "above" ? "below" : "above"
        );
        changed = true;
      }
    }
  }

  return withPx.map((m) => ({
    ...m,
    placement: placementByKey.get(m.key) || "above",
    visible: true,
  }));
}

/** @returns {{ mode: 'horizontal'|'vertical'|'tooltip-only', label?: string }} */
export function ceremonySegmentDisplay(widthPx) {
  if (widthPx < CEREMONY_TOOLTIP_ONLY_BELOW_PX) {
    return { mode: "tooltip-only" };
  }
  if (widthPx < HIDE_SEGMENT_LABEL_BELOW_PX) {
    return { mode: "vertical", label: "Ceremony" };
  }
  return { mode: "horizontal", label: "Ceremony" };
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
