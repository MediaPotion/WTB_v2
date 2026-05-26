import React, { useMemo, useRef, useState, useLayoutEffect } from "react";
import {
  LOGISTICS_STATUS,
  assignWindowLanes,
  buildHourTicks,
} from "./logisticsPresentation";
import {
  buildBoundaryMarkers,
  buildRulerMarkers,
  layoutTimeLabels,
  segmentLabelForWidth,
  segmentShowsIconOnly,
} from "./logisticsTimelineLayout";

const LANE_HEIGHT = 28;
const LANE_GAP = 5;
const PAD_Y = 6;
const LABEL_ROW_H = 16;

function pct(minutes, dayStart, span) {
  return ((minutes - dayStart) / span) * 100;
}

function useBarWidth(ref) {
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const update = () => setWidth(el.offsetWidth || 0);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return width;
}

function LogisticsDayTimeline({
  windows,
  dayStart,
  dayEnd,
  ceremonyStart,
  ceremonyEnd,
  justResolvedIds,
}) {
  const wrapRef = useRef(null);
  const barWidthPx = useBarWidth(wrapRef);

  const span = Math.max(dayEnd - dayStart, 1);
  const { laneCount, laneById } = useMemo(() => assignWindowLanes(windows), [windows]);
  const hourTicks = useMemo(() => buildHourTicks(dayStart, dayEnd), [dayStart, dayEnd]);

  const trackHeight =
    PAD_Y * 2 + laneCount * LANE_HEIGHT + Math.max(0, laneCount - 1) * LANE_GAP;

  const boundaryRaw = useMemo(
    () =>
      buildBoundaryMarkers(windows, ceremonyStart, ceremonyEnd).map((m) => ({
        ...m,
        pct: pct(m.minutes, dayStart, span),
      })),
    [windows, ceremonyStart, ceremonyEnd, dayStart, span]
  );

  const boundaryLabels = useMemo(
    () => layoutTimeLabels(boundaryRaw, barWidthPx),
    [boundaryRaw, barWidthPx]
  );

  const boundaryHasStagger = boundaryLabels.some((m) => m.visible && m.staggerRow === 1);
  const boundaryAreaHeight = boundaryHasStagger ? LABEL_ROW_H * 2 + 4 : LABEL_ROW_H + 4;

  const rulerRaw = useMemo(() => buildRulerMarkers(hourTicks), [hourTicks]);
  const rulerLabels = useMemo(
    () => layoutTimeLabels(rulerRaw, barWidthPx),
    [rulerRaw, barWidthPx]
  );
  const rulerHasStagger = rulerLabels.some((m) => m.visible && m.staggerRow === 1);
  const rulerAreaHeight = rulerHasStagger ? LABEL_ROW_H * 2 + 10 : 28;

  const ceremonyLeft = ceremonyStart != null ? pct(ceremonyStart, dayStart, span) : null;
  const ceremonyWidth =
    ceremonyStart != null && ceremonyEnd != null
      ? Math.max(pct(ceremonyEnd, dayStart, span) - ceremonyLeft, 1.2)
      : null;
  const ceremonyWidthPx =
    ceremonyWidth != null && barWidthPx
      ? (ceremonyWidth / 100) * barWidthPx
      : 0;
  const ceremonyTop = PAD_Y;

  return (
    <div className="wtb-logistics-timeline-wrap" ref={wrapRef}>
      <div
        className="wtb-logistics-boundary-markers"
        style={{ position: "relative", height: boundaryAreaHeight, marginBottom: 4 }}
      >
        {boundaryLabels.map((m) => {
          if (!m.visible) return null;
          return (
            <span
              key={m.key}
              className="wtb-logistics-boundary-label"
              style={{
                position: "absolute",
                left: `${m.pct}%`,
                top: m.staggerRow * LABEL_ROW_H,
                transform: "translateX(-50%)",
                whiteSpace: "nowrap",
              }}
            >
              {m.label}
            </span>
          );
        })}
      </div>

      <div
        className="wtb-logistics-track"
        style={{ position: "relative", height: trackHeight, width: "100%" }}
      >
        {ceremonyWidth != null && (
          <div
            className="wtb-logistics-segment wtb-logistics-ceremony"
            title={`Ceremony — ${formatClockLabel(ceremonyStart)} to ${formatClockLabel(ceremonyEnd)}`}
            style={{
              position: "absolute",
              left: `${ceremonyLeft}%`,
              width: `${ceremonyWidth}%`,
              top: ceremonyTop,
              height: LANE_HEIGHT,
              zIndex: 4,
            }}
          >
            {segmentLabelForWidth("Ceremony", ceremonyWidthPx) && (
              <span className="wtb-logistics-segment-inner-label wtb-logistics-ceremony-text">
                {segmentLabelForWidth("Ceremony", ceremonyWidthPx)}
              </span>
            )}
          </div>
        )}

        {windows.map((w) => {
          const left = pct(w.startTime, dayStart, span);
          const width = Math.max(pct(w.endTime, dayStart, span) - left, 1.2);
          const widthPx = barWidthPx ? (width / 100) * barWidthPx : 0;
          const resolved = justResolvedIds.has(w.id);
          const st = resolved
            ? LOGISTICS_STATUS.ok
            : LOGISTICS_STATUS[w.status] || LOGISTICS_STATUS.ok;
          const lane = laneById[w.id] ?? 0;
          const top = PAD_Y + lane * (LANE_HEIGHT + LANE_GAP);
          const isOverflow = w.status === "overflow" && !resolved;
          const iconOnly = segmentShowsIconOnly(widthPx);
          const displayLabel = segmentLabelForWidth(w.label, widthPx);
          const tooltip = `${w.label}: ${formatClockLabel(w.startTime)} – ${formatClockLabel(w.endTime)}`;

          return (
            <div
              key={w.id}
              className={`wtb-logistics-segment${isOverflow ? " wtb-logistics-segment--overflow" : ""}${resolved ? " wtb-logistics-segment--resolved" : ""}`}
              title={tooltip}
              style={{
                position: "absolute",
                left: `${left}%`,
                width: `${width}%`,
                top,
                height: LANE_HEIGHT,
                background: st.bg,
                borderColor: st.color,
                zIndex: 2,
              }}
            >
              {displayLabel && !iconOnly ? (
                <span className="wtb-logistics-segment-inner-label">{displayLabel}</span>
              ) : (
                <span className="wtb-logistics-segment-icon" style={{ color: st.color }}>
                  {st.icon}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div
        className="wtb-logistics-ruler"
        style={{ position: "relative", height: rulerAreaHeight, marginTop: 10 }}
      >
        <div className="wtb-logistics-ruler-line" />
        {rulerLabels.map((m) => {
          if (!m.visible) return null;
          return (
            <span
              key={m.key}
              className="wtb-logistics-ruler-tick"
              style={{
                position: "absolute",
                left: `${m.pct}%`,
                top: 6 + m.staggerRow * LABEL_ROW_H,
                transform: "translateX(-50%)",
              }}
            >
              {m.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export { LogisticsDayTimeline };
