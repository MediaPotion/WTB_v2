import React, { useEffect, useRef } from "react";
import { formatClockLabel } from "../../lib/time";
import { LOGISTICS_STATUS, formatWindowTimeSummary } from "./logisticsPresentation";
import { LogisticsWindowControls } from "./LogisticsWindowControls";

function LogisticsWindowCard({
  window: w,
  expanded,
  highlight,
  justResolved,
  onToggle,
  showControls,
  windows,
  inlineHints,
  fixHighlight,
  rows,
  ...controlProps
}) {
  const ref = useRef(null);
  const st = justResolved ? LOGISTICS_STATUS.ok : LOGISTICS_STATUS[w.status] || LOGISTICS_STATUS.ok;
  const activeEvents = (w.events || []).filter(
    (r) => r.type !== "constraint" && String(r.event || "").trim()
  );

  useEffect(() => {
    if ((expanded || highlight) && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [expanded, highlight]);

  const borderColor =
    w.status === "overflow" && !justResolved
      ? "rgba(139, 69, 69, 0.45)"
      : w.status === "tight" && !justResolved
        ? "rgba(184, 144, 106, 0.5)"
        : justResolved
          ? "rgba(107, 143, 113, 0.45)"
          : "var(--wtb-border-subtle)";

  return (
    <div
      ref={ref}
      className={`wtb-logistics-window-card${expanded ? " wtb-logistics-window-card--expanded" : ""}${fixHighlight ? " wtb-logistics-window-card--fix" : ""}`}
      style={{
        background: expanded ? "var(--wtb-surface-raised)" : "var(--wtb-surface)",
        border: `1px solid ${borderColor}`,
        borderRadius: 10,
        marginBottom: 12,
        overflow: "hidden",
        transition: "background 0.3s ease, border-color 0.5s ease, box-shadow 0.3s ease",
        boxShadow: fixHighlight ? "0 0 0 2px rgba(184, 144, 106, 0.35)" : "none",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: "100%",
          textAlign: "left",
          background: "none",
          border: "none",
          padding: "16px 18px",
          cursor: "pointer",
          fontFamily: "'Jost', sans-serif",
          color: "var(--wtb-text)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: `${st.color}22`,
              color: st.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              flexShrink: 0,
              transition: "color 0.5s ease, background 0.5s ease",
            }}
          >
            {st.icon}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 400,
                fontFamily: "'Cormorant Garamond', serif",
                marginBottom: 4,
              }}
            >
              {w.label} — {formatClockLabel(w.startTime)} to {formatClockLabel(w.endTime)}
            </div>
            <div style={{ fontSize: 13, color: "var(--wtb-text-muted)", lineHeight: 1.5 }}>
              {formatWindowTimeSummary(w, justResolved)}
            </div>
          </div>
          <span style={{ color: "var(--wtb-text-muted)", fontSize: 18, lineHeight: 1 }}>
            {expanded ? "▾" : "▸"}
          </span>
        </div>
      </button>

      {expanded && (
        <div style={{ padding: "0 18px 18px", borderTop: "1px solid var(--wtb-border-subtle)" }}>
          {activeEvents.length > 0 && (
            <div style={{ marginTop: 14, marginBottom: showControls ? 16 : 0 }}>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--wtb-accent)",
                  marginBottom: 8,
                  fontFamily: "'Jost', sans-serif",
                }}
              >
                Events in this window
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 18,
                  fontSize: 13,
                  color: "var(--wtb-text-muted)",
                  lineHeight: 1.55,
                }}
              >
                {activeEvents.map((r) => (
                  <li key={`${r.event}-${r.time}`}>
                    {r.event}
                    {r.duration ? ` (${r.duration} min)` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {showControls && (
            <LogisticsWindowControls
              windowId={w.id}
              window={w}
              windows={windows}
              rows={rows}
              inlineHints={inlineHints}
              highlightAll={fixHighlight}
              {...controlProps}
            />
          )}
        </div>
      )}
    </div>
  );
}

export { LogisticsWindowCard };
