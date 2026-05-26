import React, { useMemo, useRef, useState, useLayoutEffect } from "react";
import { formatClockLabel } from "../../lib/time";
import { LOGISTICS_STATUS, assignWindowLanes } from "./logisticsPresentation";
import {
  buildBoundaryMarkers,
  ceremonySegmentDisplay,
  layoutTimeLabels,
  segmentLabelForWidth,
  segmentShowsIconOnly,
  TIME_LABEL_BAR_GAP_PX,
  TIME_LABEL_HEIGHT_PX,
} from "./logisticsTimelineLayout";

const LANE_HEIGHT = 28;
const LANE_GAP = 5;
const PAD_Y = 6;
const BOUNDARY_BLOCK_H = TIME_LABEL_HEIGHT_PX + TIME_LABEL_BAR_GAP_PX;

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
  const ceremonyDisplay = ceremonySegmentDisplay(ceremonyWidthPx);
  const ceremonyTooltip = `Ceremony — ${formatClockLabel(ceremonyStart)} to ${formatClockLabel(ceremonyEnd)}`;

  return (
    <div className="wtb-logistics-timeline-wrap" ref={wrapRef}>
      <div className="wtb-logistics-timeline-stack">
        <div
          className="wtb-logistics-boundary-layer"
          style={{ height: BOUNDARY_BLOCK_H }}
          aria-hidden
        >
          {boundaryLabels.map((m) => {
            if (!m.visible || m.placement !== "above") return null;
            return (
              <div
                key={`${m.key}-above`}
                className="wtb-logistics-boundary-marker"
                style={{ left: `${m.pct}%` }}
              >
                <span className="wtb-logistics-boundary-label">{m.label}</span>
                <span className="wtb-logistics-boundary-line" />
              </div>
            );
          })}
        </div>

        <div
          className="wtb-logistics-track"
          style={{ position: "relative", height: trackHeight, width: "100%" }}
        >
          {ceremonyWidth != null && (
            <div
              className={`wtb-logistics-segment wtb-logistics-ceremony${
                ceremonyDisplay.mode === "vertical"
                  ? " wtb-logistics-ceremony--vertical-label"
                  : ""
              }`}
              title={ceremonyTooltip}
              style={{
                position: "absolute",
                left: `${ceremonyLeft}%`,
                width: `${ceremonyWidth}%`,
                top: ceremonyTop,
                height: LANE_HEIGHT,
                zIndex: 4,
              }}
            >
              {ceremonyDisplay.mode === "horizontal" && (
                <span className="wtb-logistics-segment-inner-label wtb-logistics-ceremony-text">
                  {ceremonyDisplay.label}
                </span>
              )}
              {ceremonyDisplay.mode === "vertical" && (
                <span className="wtb-logistics-segment-inner-label wtb-logistics-ceremony-text wtb-logistics-ceremony-text--vertical">
                  {ceremonyDisplay.label}
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
          className="wtb-logistics-boundary-layer wtb-logistics-boundary-layer--below"
          style={{ height: BOUNDARY_BLOCK_H }}
          aria-hidden
        >
          {boundaryLabels.map((m) => {
            if (!m.visible || m.placement !== "below") return null;
            return (
              <div
                key={`${m.key}-below`}
                className="wtb-logistics-boundary-marker wtb-logistics-boundary-marker--below"
                style={{ left: `${m.pct}%` }}
              >
                <span className="wtb-logistics-boundary-line" />
                <span className="wtb-logistics-boundary-label">{m.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { LogisticsDayTimeline };
