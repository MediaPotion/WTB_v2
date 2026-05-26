import React, { useMemo, useRef, useEffect, useState } from "react";
import { generateTimeline as generateTimelineLib } from "../../lib/generateTimeline";
import { calculateLogistics } from "../../lib/calculateLogistics";
import { buildWizardAnswers } from "../../lib/buildWizardAnswers";
import {
  buildLogisticsContext,
  buildInlineHints,
  countOverflowConflicts,
  describeBottleneckDetailed,
} from "../../lib/logisticsConflictCopy";
import { formatClockLabel } from "../../lib/time";
import { LogisticsAdjustPanel } from "./LogisticsAdjustPanel";

const STATUS = {
  ok: { color: "#6b8f71", icon: "✓", label: "Comfortable" },
  tight: { color: "var(--wtb-accent)", icon: "!", label: "Tight" },
  overflow: { color: "#8b4545", icon: "✕", label: "Over capacity" },
};

function LogisticsTimelineBar({ windows, dayStart, dayEnd, justResolvedIds }) {
  const span = Math.max(dayEnd - dayStart, 1);
  return (
    <div style={{ marginBottom: 28 }}>
      <div
        style={{
          position: "relative",
          height: 52,
          borderRadius: 8,
          background: "rgba(184, 144, 106, 0.22)",
          border: "1px solid rgba(184, 144, 106, 0.35)",
          overflow: "hidden",
        }}
      >
        {windows.map((w) => {
          const left = ((w.startTime - dayStart) / span) * 100;
          const width = Math.max(((w.endTime - w.startTime) / span) * 100, 2);
          const st = STATUS[w.status] || STATUS.ok;
          const resolved = justResolvedIds.has(w.id);
          return (
            <div
              key={w.id}
              title={`${w.label}: ${w.availableMinutes} min available, ${w.usedMinutes} min scheduled`}
              style={{
                position: "absolute",
                left: `${left}%`,
                width: `${width}%`,
                top: 4,
                bottom: 4,
                background: resolved ? STATUS.ok.color : st.color,
                opacity: w.status === "ok" || resolved ? 0.85 : 0.9,
                borderRadius: 4,
                minWidth: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 4px",
                boxSizing: "border-box",
                overflow: "hidden",
                transition: "background 0.6s ease, opacity 0.6s ease",
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 400,
                  color: "var(--wtb-on-accent)",
                  fontFamily: "'Jost', sans-serif",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  maxWidth: "100%",
                }}
              >
                {w.id}
              </span>
            </div>
          );
        })}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 8,
          fontSize: 11,
          color: "var(--wtb-text-muted)",
          fontFamily: "'Jost', sans-serif",
        }}
      >
        <span>{formatClockLabel(dayStart)}</span>
        <span>{formatClockLabel(dayEnd)}</span>
      </div>
    </div>
  );
}

function WindowSummaryCard({ window: w, justResolved }) {
  const st = justResolved ? STATUS.ok : STATUS[w.status] || STATUS.ok;
  let detail = `${w.availableMinutes} minutes available, ${w.usedMinutes} minutes of events scheduled`;
  if (w.status === "overflow" && !justResolved) {
    detail = `${detail}, ${w.overflowMinutes} minutes over — needs attention`;
  } else if (w.status === "tight" && !justResolved) {
    detail = `${detail}, only ${w.remainingMinutes} minutes of buffer — cutting it close`;
  } else {
    detail = `${detail}, ${w.remainingMinutes} minutes remaining`;
  }

  return (
    <div
      style={{
        background: "var(--wtb-surface)",
        border: `1px solid ${
          w.status === "overflow" && !justResolved
            ? "rgba(139, 69, 69, 0.45)"
            : justResolved
              ? "rgba(107, 143, 113, 0.45)"
              : "var(--wtb-border-subtle)"
        }`,
        borderRadius: 10,
        padding: "16px 18px",
        marginBottom: 12,
        transition: "border-color 0.5s ease",
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
            fontFamily: "'Jost', sans-serif",
            transition: "color 0.5s ease, background 0.5s ease",
          }}
        >
          {st.icon}
        </span>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 400,
              color: "var(--wtb-text)",
              fontFamily: "'Cormorant Garamond', serif",
              marginBottom: 4,
            }}
          >
            {w.label}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--wtb-text-muted)",
              fontFamily: "'Jost', sans-serif",
              marginBottom: 6,
            }}
          >
            {formatClockLabel(w.startTime)} – {formatClockLabel(w.endTime)}
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--wtb-text-muted)",
              fontFamily: "'Jost', sans-serif",
              lineHeight: 1.5,
            }}
          >
            {detail}
          </div>
        </div>
      </div>
    </div>
  );
}

function WizardLogisticsCheck(props) {
  const { inModal, displayStep, totalWizardSteps, setWizardStep, wizSectionHeading } = props;

  const answers = useMemo(() => buildWizardAnswers(props), [props]);
  const rows = useMemo(() => generateTimelineLib(answers), [answers]);
  const report = useMemo(() => calculateLogistics(answers, rows), [answers, rows]);
  const ctx = useMemo(() => buildLogisticsContext(props), [props]);
  const inlineHints = useMemo(
    () => buildInlineHints(report.suggestions, ctx),
    [report.suggestions, ctx]
  );

  const prevStatusesRef = useRef({});
  const [flashResolvedIds, setFlashResolvedIds] = useState(() => new Set());

  useEffect(() => {
    const newlyResolved = [];
    for (const w of report.windows) {
      if (prevStatusesRef.current[w.id] === "overflow" && w.status !== "overflow") {
        newlyResolved.push(w.id);
      }
    }
    const next = {};
    report.windows.forEach((w) => {
      next[w.id] = w.status;
    });
    prevStatusesRef.current = next;

    if (newlyResolved.length === 0) return undefined;
    setFlashResolvedIds((prev) => {
      const n = new Set(prev);
      newlyResolved.forEach((id) => n.add(id));
      return n;
    });
    const timer = setTimeout(() => {
      setFlashResolvedIds((prev) => {
        const n = new Set(prev);
        newlyResolved.forEach((id) => n.delete(id));
        return n;
      });
    }, 900);
    return () => clearTimeout(timer);
  }, [report.windows]);

  const justResolvedIds = flashResolvedIds;

  const overflowCount = countOverflowConflicts(report.windows);
  const hasOverflow = overflowCount > 0;
  const hasTight = report.windows.some((w) => w.status === "tight");
  const hasBottlenecks = report.bottlenecks.length > 0;

  const dayStart = report.windows.length
    ? Math.min(...report.windows.map((w) => w.startTime))
    : 0;
  const dayEnd = report.windows.length
    ? Math.max(...report.windows.map((w) => w.endTime))
    : report.totalDayMinutes;

  const headerStatus = hasOverflow
    ? {
        color: "#8b4545",
        icon: "✕",
        title: "Scheduling conflicts need attention",
        body: "Adjust the settings below — your timeline updates as you go.",
      }
    : hasTight
      ? {
          color: "var(--wtb-accent)",
          icon: "!",
          title: "A few tight spots",
          body: "Your schedule is tight in a few places but workable. Review and adjust if you like.",
        }
      : {
          color: "#6b8f71",
          icon: "✓",
          title: "Your schedule looks great",
          body: "Everything fits comfortably within your time windows.",
        };

  const conflictTally = (
    <div
      style={{
        textAlign: "center",
        marginBottom: 20,
        fontFamily: "'Jost', sans-serif",
        fontSize: 14,
      }}
    >
      {overflowCount === 0 ? (
        <span style={{ color: STATUS.ok.color, display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 22 }}>✓</span>
          All conflicts resolved
        </span>
      ) : (
        <span style={{ color: STATUS.overflow.color }}>
          {overflowCount} conflict{overflowCount !== 1 ? "s" : ""} remaining
        </span>
      )}
    </div>
  );

  const content = (
    <div>
      <div
        style={{
          textAlign: "center",
          padding: "12px 12px 20px",
          borderBottom: "1px solid var(--wtb-border-subtle)",
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 36, color: headerStatus.color, marginBottom: 10, lineHeight: 1 }}>
          {headerStatus.icon}
        </div>
        <p
          style={{
            margin: 0,
            fontSize: 15,
            color: "var(--wtb-text)",
            fontFamily: "'Jost', sans-serif",
            lineHeight: 1.6,
            maxWidth: 480,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {headerStatus.body}
        </p>
      </div>

      {conflictTally}

      {report.windows.length > 0 && (
        <>
          <div
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: 11,
              fontWeight: 300,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--wtb-accent)",
              marginBottom: 12,
            }}
          >
            Day overview
          </div>
          <LogisticsTimelineBar
            windows={report.windows}
            dayStart={dayStart}
            dayEnd={dayEnd}
            justResolvedIds={justResolvedIds}
          />
          <div
            style={{
              display: "flex",
              gap: 16,
              marginBottom: 20,
              flexWrap: "wrap",
              fontSize: 11,
              fontFamily: "'Jost', sans-serif",
              color: "var(--wtb-text-muted)",
            }}
          >
            <span>
              <span style={{ color: STATUS.ok.color }}>■</span> Comfortable
            </span>
            <span>
              <span style={{ color: STATUS.tight.color }}>■</span> Tight
            </span>
            <span>
              <span style={{ color: STATUS.overflow.color }}>■</span> Over capacity
            </span>
          </div>
        </>
      )}

      <LogisticsAdjustPanel {...props} inlineHints={inlineHints} />

      <div
        style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: 11,
          fontWeight: 300,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--wtb-accent)",
          margin: "8px 0 12px",
        }}
      >
        Time windows
      </div>
      {report.windows.map((w) => (
        <WindowSummaryCard key={w.id} window={w} justResolved={justResolvedIds.has(w.id)} />
      ))}

      {hasBottlenecks && (
        <>
          <div
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: 11,
              fontWeight: 300,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--wtb-accent)",
              margin: "28px 0 14px",
            }}
          >
            What we found
          </div>
          {report.bottlenecks.map((bn) => {
            const window = report.windows.find((w) => w.id === bn.windowId);
            if (!window) return null;
            return (
              <div
                key={bn.windowId}
                style={{
                  background: "var(--wtb-surface)",
                  border: "1px solid var(--wtb-border-subtle)",
                  borderRadius: 10,
                  padding: "16px 18px",
                  marginBottom: 12,
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    color: "var(--wtb-text)",
                    fontFamily: "'Jost', sans-serif",
                    lineHeight: 1.6,
                  }}
                >
                  {describeBottleneckDetailed(window, ctx)}
                </p>
              </div>
            );
          })}
        </>
      )}
    </div>
  );

  const footer = () => {
    if (hasOverflow) {
      return (
        <div style={{ width: "100%" }}>
          <div
            style={{
              background: "rgba(139, 69, 69, 0.12)",
              border: "1px solid rgba(139, 69, 69, 0.35)",
              borderRadius: 10,
              padding: "16px 18px",
              marginBottom: 16,
            }}
          >
            {report.bottlenecks.map((bn) => {
              const window = report.windows.find((w) => w.id === bn.windowId);
              if (!window || window.status !== "overflow") return null;
              return (
                <p
                  key={bn.windowId}
                  style={{
                    margin: "0 0 10px",
                    fontSize: 13,
                    color: "var(--wtb-text)",
                    fontFamily: "'Jost', sans-serif",
                    lineHeight: 1.55,
                  }}
                >
                  {describeBottleneckDetailed(window, ctx)}
                </p>
              );
            })}
            <p
              style={{
                margin: 0,
                fontSize: 12,
                color: "var(--wtb-text-muted)",
                fontFamily: "'Jost', sans-serif",
                lineHeight: 1.5,
              }}
            >
              You can continue and fine-tune manually in the timeline editor.
            </p>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setWizardStep(7)}
              style={{
                padding: "12px 28px",
                border: "1px solid var(--wtb-accent)",
                borderRadius: 8,
                background: "transparent",
                color: "var(--wtb-text)",
                fontSize: 15,
                cursor: "pointer",
                fontFamily: "'Jost', sans-serif",
                fontWeight: 300,
              }}
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setWizardStep(99)}
              style={{
                padding: "12px 28px",
                background: "var(--wtb-accent)",
                color: "var(--wtb-on-accent)",
                border: "none",
                borderRadius: 8,
                fontSize: 15,
                cursor: "pointer",
                fontFamily: "'Jost', sans-serif",
              }}
            >
              Continue Anyway
            </button>
          </div>
        </div>
      );
    }

    const allClear = !hasTight;
    return (
      <div style={{ width: "100%" }}>
        <div
          style={{
            textAlign: "center",
            marginBottom: 16,
            padding: "12px 0",
          }}
        >
          <div
            style={{
              fontSize: 40,
              color: allClear ? STATUS.ok.color : STATUS.tight.color,
              marginBottom: 8,
            }}
          >
            ✓
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 16,
              color: "var(--wtb-text)",
              fontFamily: "'Cormorant Garamond', serif",
            }}
          >
            {allClear ? "Your schedule looks great!" : "Your schedule is tight but workable"}
          </p>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <button
            type="button"
            onClick={() => setWizardStep(7)}
            style={{
              padding: "12px 28px",
              border: "1px solid var(--wtb-accent)",
              borderRadius: 8,
              background: "transparent",
              color: "var(--wtb-text)",
              fontSize: 15,
              cursor: "pointer",
              fontFamily: "'Jost', sans-serif",
              fontWeight: 300,
            }}
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => setWizardStep(99)}
            style={{
              padding: "12px 32px",
              background: "var(--wtb-accent)",
              color: "var(--wtb-on-accent)",
              border: "none",
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 400,
              cursor: "pointer",
              fontFamily: "'Jost', sans-serif",
            }}
          >
            {allClear ? "Next" : "Looks Good — Continue"}
          </button>
        </div>
      </div>
    );
  };

  if (inModal) {
    return <div style={{ paddingBottom: 8 }}>{content}</div>;
  }

  return (
    <div
      className="wiz-layout"
      style={{
        padding: "16px 0",
        background: "var(--wtb-bg)",
        minHeight: "100vh",
        fontFamily: "'Jost', sans-serif",
        color: "var(--wtb-text)",
      }}
    >
      <div className="wiz-step-col">
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 16px 40px" }}>
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
                color: "var(--wtb-text-muted)",
                marginBottom: 6,
                fontFamily: "'Jost', sans-serif",
                letterSpacing: "0.1em",
              }}
            >
              <span>
                Step {displayStep} of {totalWizardSteps}
              </span>
            </div>
            <div
              style={{
                height: 3,
                background: "var(--wtb-surface-raised)",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${(displayStep / totalWizardSteps) * 100}%`,
                  background: "linear-gradient(90deg, var(--wtb-accent), #cfa882)",
                  borderRadius: 2,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>
          <div
            style={{
              background: "var(--wtb-surface)",
              border: "1px solid var(--wtb-border-subtle)",
              borderRadius: 12,
              padding: "24px 20px",
              marginBottom: 20,
            }}
          >
            <h2
              style={{
                margin: "0 0 8px 0",
                fontSize: "clamp(22px,4vw,32px)",
                color: "var(--wtb-text)",
                fontWeight: 400,
                fontFamily: "'Cormorant Garamond', serif",
              }}
            >
              Logistics Check
            </h2>
            <p
              style={{
                margin: "0 0 24px 0",
                fontSize: 14,
                color: "var(--wtb-text-muted)",
                lineHeight: 1.5,
                fontFamily: "'Jost', sans-serif",
                fontWeight: 300,
              }}
            >
              We&apos;ve reviewed your wedding day schedule. Adjust anything below and watch the
              timeline update in real time.
            </p>
            {content}
          </div>
          {footer()}
        </div>
      </div>
    </div>
  );
}

export { WizardLogisticsCheck };
