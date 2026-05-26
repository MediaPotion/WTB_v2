import React from "react";
import {
  LOGISTICS_STATUS,
  buildOverflowHeadline,
  buildOverflowExplanation,
  buildTightHeadline,
} from "./logisticsPresentation";
import { describeBottleneckDetailed } from "../../lib/logisticsConflictCopy";

function LogisticsWhatWeFound({
  windows,
  bottlenecks,
  ctx,
  justResolvedIds,
  onFixWindow,
}) {
  const overflowWindows = windows.filter(
    (w) => w.status === "overflow" && !justResolvedIds.has(w.id)
  );
  const tightWindows = windows.filter(
    (w) => w.status === "tight" && !justResolvedIds.has(w.id)
  );
  const allClear = overflowWindows.length === 0 && tightWindows.length === 0;

  if (allClear) {
    return (
      <div
        className="wtb-logistics-found-card wtb-logistics-found-card--ok"
        style={{
          background: "rgba(107, 143, 113, 0.12)",
          border: "1px solid rgba(107, 143, 113, 0.4)",
          borderRadius: 10,
          padding: "18px 20px",
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span style={{ fontSize: 22, color: LOGISTICS_STATUS.ok.color }}>✓</span>
          <div>
            <div
              style={{
                fontSize: 17,
                fontFamily: "'Cormorant Garamond', serif",
                color: "var(--wtb-text)",
                marginBottom: 6,
              }}
            >
              Your schedule looks great!
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                color: "var(--wtb-text-muted)",
                fontFamily: "'Jost', sans-serif",
                lineHeight: 1.55,
              }}
            >
              Everything fits comfortably within your time windows.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 24 }}>
      {overflowWindows.map((w) => {
        const bn = bottlenecks.find((b) => b.windowId === w.id);
        return (
          <div
            key={w.id}
            className="wtb-logistics-found-card wtb-logistics-found-card--overflow"
            style={{
              background: "rgba(139, 69, 69, 0.1)",
              border: "1px solid rgba(139, 69, 69, 0.4)",
              borderRadius: 10,
              padding: "18px 20px",
              marginBottom: 12,
              transition: "opacity 0.5s ease, transform 0.5s ease",
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontFamily: "'Cormorant Garamond', serif",
                color: "var(--wtb-text)",
                marginBottom: 8,
                lineHeight: 1.4,
              }}
            >
              {buildOverflowHeadline(w, ctx)}
            </div>
            <p
              style={{
                margin: "0 0 14px",
                fontSize: 13,
                color: "var(--wtb-text-muted)",
                fontFamily: "'Jost', sans-serif",
                lineHeight: 1.55,
              }}
            >
              {bn ? describeBottleneckDetailed(w, ctx) : buildOverflowExplanation(w, ctx)}
            </p>
            <button
              type="button"
              onClick={() => onFixWindow(w.id)}
              style={{
                padding: "10px 20px",
                background: "var(--wtb-accent)",
                color: "var(--wtb-on-accent)",
                border: "none",
                borderRadius: 6,
                fontSize: 14,
                cursor: "pointer",
                fontFamily: "'Jost', sans-serif",
              }}
            >
              Fix This
            </button>
          </div>
        );
      })}

      {tightWindows.map((w) => (
        <div
          key={`tight-${w.id}`}
          className="wtb-logistics-found-card wtb-logistics-found-card--tight"
          style={{
            background: "rgba(184, 144, 106, 0.1)",
            border: "1px solid rgba(184, 144, 106, 0.45)",
            borderRadius: 10,
            padding: "16px 20px",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontFamily: "'Cormorant Garamond', serif",
              color: "var(--wtb-text)",
              marginBottom: 6,
            }}
          >
            {buildTightHeadline(w)}
          </div>
          <p
            style={{
              margin: "0 0 12px",
              fontSize: 13,
              color: "var(--wtb-text-muted)",
              fontFamily: "'Jost', sans-serif",
              lineHeight: 1.5,
            }}
          >
            Still workable — review this window if you want more breathing room.
          </p>
          <button
            type="button"
            onClick={() => onFixWindow(w.id)}
            style={{
              padding: "8px 16px",
              background: "transparent",
              color: "var(--wtb-accent)",
              border: "1px solid var(--wtb-accent)",
              borderRadius: 6,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "'Jost', sans-serif",
            }}
          >
            Review
          </button>
        </div>
      ))}
    </div>
  );
}

export { LogisticsWhatWeFound };
