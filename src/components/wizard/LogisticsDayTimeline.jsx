import React, { useMemo } from "react";
import { formatClockLabel } from "../../lib/time";
import {
  LOGISTICS_STATUS,
  assignWindowLanes,
  buildHourTicks,
  NARROW_SEGMENT_PCT,
} from "./logisticsPresentation";

const LANE_HEIGHT = 28;
const LANE_GAP = 5;
const PAD_Y = 6;
const LABEL_ROW = 18;

function pct(minutes, dayStart, span) {
  return ((minutes - dayStart) / span) * 100;
}

function LogisticsDayTimeline({
  windows,
  dayStart,
  dayEnd,
  ceremonyStart,
  ceremonyEnd,
  justResolvedIds,
}) {
  const span = Math.max(dayEnd - dayStart, 1);
  const { laneCount, laneById } = useMemo(() => assignWindowLanes(windows), [windows]);
  const hourTicks = useMemo(() => buildHourTicks(dayStart, dayEnd), [dayStart, dayEnd]);

  const trackHeight =
    PAD_Y * 2 + laneCount * LANE_HEIGHT + Math.max(0, laneCount - 1) * LANE_GAP;

  const boundaryMarkers = useMemo(() => {
    const times = new Set();
    windows.forEach((w) => {
      times.add(w.startTime);
      times.add(w.endTime);
    });
    if (ceremonyStart != null) times.add(ceremonyStart);
    if (ceremonyEnd != null) times.add(ceremonyEnd);
    return [...times].sort((a, b) => a - b);
  }, [windows, ceremonyStart, ceremonyEnd]);

  const ceremonyLeft = ceremonyStart != null ? pct(ceremonyStart, dayStart, span) : null;
  const ceremonyWidth =
    ceremonyStart != null && ceremonyEnd != null
      ? Math.max(pct(ceremonyEnd, dayStart, span) - ceremonyLeft, 1.5)
      : null;

  return (
    <div className="wtb-logistics-timeline-wrap">
      <div
        className="wtb-logistics-boundary-markers"
        style={{ position: "relative", height: LABEL_ROW, marginBottom: 4 }}
      >
        {boundaryMarkers.map((t) => {
          const left = pct(t, dayStart, span);
          return (
            <span
              key={t}
              className="wtb-logistics-boundary-label"
              style={{
                position: "absolute",
                left: `${left}%`,
                transform: "translateX(-50%)",
                whiteSpace: "nowrap",
              }}
            >
              {formatClockLabel(t)}
            </span>
          );
        })}
      </div>

      <div
        className="wtb-logistics-segment-labels"
        style={{ position: "relative", minHeight: LABEL_ROW, marginBottom: 6 }}
      >
        {windows.map((w) => {
          const left = pct(w.startTime, dayStart, span);
          const width = Math.max(pct(w.endTime, dayStart, span) - left, 0.5);
          const narrow = width < NARROW_SEGMENT_PCT;
          if (!narrow) return null;
          const st = justResolvedIds.has(w.id)
            ? LOGISTICS_STATUS.ok
            : LOGISTICS_STATUS[w.status] || LOGISTICS_STATUS.ok;
          return (
            <span
              key={`label-${w.id}`}
              className="wtb-logistics-segment-label-above"
              style={{
                position: "absolute",
                left: `${left}%`,
                width: `${width}%`,
                textAlign: "center",
                color: st.color,
              }}
            >
              {w.label}
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
            className="wtb-logistics-ceremony"
            title={`Ceremony — ${formatClockLabel(ceremonyStart)} to ${formatClockLabel(ceremonyEnd)}`}
            style={{
              position: "absolute",
              left: `${ceremonyLeft}%`,
              width: `${ceremonyWidth}%`,
              top: PAD_Y,
              height: trackHeight - PAD_Y * 2,
              zIndex: 3,
              pointerEvents: "none",
            }}
          >
            <span className="wtb-logistics-ceremony-label">Ceremony</span>
          </div>
        )}

        {windows.map((w) => {
          const left = pct(w.startTime, dayStart, span);
          const width = Math.max(pct(w.endTime, dayStart, span) - left, 1.2);
          const resolved = justResolvedIds.has(w.id);
          const st = resolved
            ? LOGISTICS_STATUS.ok
            : LOGISTICS_STATUS[w.status] || LOGISTICS_STATUS.ok;
          const lane = laneById[w.id] ?? 0;
          const top = PAD_Y + lane * (LANE_HEIGHT + LANE_GAP);
          const narrow = width < NARROW_SEGMENT_PCT;
          const isOverflow = w.status === "overflow" && !resolved;

          return (
            <div
              key={w.id}
              className={`wtb-logistics-segment${isOverflow ? " wtb-logistics-segment--overflow" : ""}${resolved ? " wtb-logistics-segment--resolved" : ""}`}
              title={`${w.label}: ${formatClockLabel(w.startTime)} – ${formatClockLabel(w.endTime)}`}
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
              {!narrow && (
                <span className="wtb-logistics-segment-inner-label">{w.label}</span>
              )}
              <span className="wtb-logistics-segment-icon" style={{ color: st.color }}>
                {st.icon}
              </span>
            </div>
          );
        })}
      </div>

      <div className="wtb-logistics-ruler" style={{ position: "relative", height: 28, marginTop: 10 }}>
        <div className="wtb-logistics-ruler-line" />
        {hourTicks.map((tick, i) => (
          <span
            key={`${tick.minutes}-${i}`}
            className="wtb-logistics-ruler-tick"
            style={{
              position: "absolute",
              left: `${tick.pct}%`,
              transform: "translateX(-50%)",
            }}
          >
            {tick.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export { LogisticsDayTimeline };
