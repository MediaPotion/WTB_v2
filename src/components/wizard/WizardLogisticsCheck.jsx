import React, { useMemo, useRef, useEffect, useState, useCallback } from "react";
import { generateTimeline as generateTimelineLib } from "../../lib/generateTimeline";
import { calculateLogistics } from "../../lib/calculateLogistics";
import { buildWizardAnswers } from "../../lib/buildWizardAnswers";
import {
  buildLogisticsContext,
  buildInlineHints,
  countOverflowConflicts,
} from "../../lib/logisticsConflictCopy";
import { LogisticsDayTimeline } from "./LogisticsDayTimeline";
import { LogisticsWhatWeFound } from "./LogisticsWhatWeFound";
import { LogisticsWindowCard } from "./LogisticsWindowCard";
import { resolveDayBounds } from "./logisticsPresentation";

function WizardLogisticsCheck(props) {
  const {
    inModal,
    displayStep,
    totalWizardSteps,
    setWizardStep,
    timelineRows,
    onClose,
  } = props;

  const answers = useMemo(() => buildWizardAnswers(props), [props]);
  const rows = useMemo(() => {
    if (timelineRows != null) {
      return [...timelineRows].sort((a, b) => a.time - b.time);
    }
    return generateTimelineLib(answers);
  }, [timelineRows, answers]);
  const report = useMemo(() => calculateLogistics(answers, rows), [answers, rows]);
  const ctx = useMemo(() => buildLogisticsContext(props), [props]);
  const inlineHints = useMemo(
    () => buildInlineHints(report.suggestions, ctx),
    [report.suggestions, ctx]
  );

  const { dayStart, dayEnd } = useMemo(
    () => resolveDayBounds(report.windows, ctx, rows),
    [report.windows, ctx, rows]
  );

  const [expandedWindowId, setExpandedWindowId] = useState(null);
  const [fixHighlightId, setFixHighlightId] = useState(null);

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
  const hasTight = report.windows.some(
    (w) => w.status === "tight" && !justResolvedIds.has(w.id)
  );

  const handleFixWindow = useCallback((windowId) => {
    setExpandedWindowId(windowId);
    setFixHighlightId(windowId);
    setTimeout(() => setFixHighlightId(null), 2400);
  }, []);

  const toggleWindow = (id) => {
    setExpandedWindowId((prev) => (prev === id ? null : id));
    setFixHighlightId(null);
  };

  const sectionHeading = (text) => (
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
      {text}
    </div>
  );

  const content = (
    <div className="wtb-logistics-screen">
      <header style={{ marginBottom: 24 }}>
        <h2
          style={{
            margin: "0 0 8px",
            fontSize: inModal ? 22 : "clamp(22px,4vw,32px)",
            color: "var(--wtb-text)",
            fontWeight: 400,
            fontFamily: "'Cormorant Garamond', serif",
          }}
        >
          Logistics Check
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: "var(--wtb-text-muted)",
            lineHeight: 1.55,
            fontFamily: "'Jost', sans-serif",
            fontWeight: 300,
            maxWidth: 560,
          }}
        >
          Your wedding day at a glance. Tap a time window to adjust settings — everything updates
          instantly.
        </p>
      </header>

      {report.windows.length > 0 && (
        <LogisticsDayTimeline
          windows={report.windows}
          dayStart={dayStart}
          dayEnd={dayEnd}
          ceremonyStart={ctx.ceremonyStart}
          ceremonyEnd={ctx.ceremonyEnd}
          justResolvedIds={justResolvedIds}
        />
      )}

      {sectionHeading("What we found")}
      <LogisticsWhatWeFound
        windows={report.windows}
        bottlenecks={report.bottlenecks}
        ctx={ctx}
        justResolvedIds={justResolvedIds}
        onFixWindow={handleFixWindow}
      />

      {sectionHeading("Time windows")}
      {report.windows.map((w) => {
        const expanded = expandedWindowId === w.id;
        const needsControls =
          w.status === "overflow" ||
          w.status === "tight" ||
          fixHighlightId === w.id;
        return (
          <LogisticsWindowCard
            key={w.id}
            window={w}
            expanded={expanded}
            highlight={fixHighlightId === w.id}
            fixHighlight={fixHighlightId === w.id}
            justResolved={justResolvedIds.has(w.id)}
            onToggle={() => toggleWindow(w.id)}
            showControls={needsControls && expanded}
            windows={report.windows}
            inlineHints={inlineHints}
            {...props}
          />
        );
      })}
    </div>
  );

  const footer = () => {
    if (inModal && onClose) {
      return (
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24, gap: 12 }}>
          <button
            type="button"
            onClick={onClose}
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
            Done
          </button>
        </div>
      );
    }

    if (hasOverflow) {
      return (
        <div style={{ width: "100%", marginTop: 24 }}>
          <div
            style={{
              background: "rgba(139, 69, 69, 0.1)",
              border: "1px solid rgba(139, 69, 69, 0.35)",
              borderRadius: 10,
              padding: "16px 18px",
              marginBottom: 16,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 14,
                color: "#8b4545",
                fontFamily: "'Jost', sans-serif",
                lineHeight: 1.55,
              }}
            >
              {overflowCount} conflict{overflowCount !== 1 ? "s" : ""} still need attention. You can
              keep adjusting above or continue and fine-tune in the timeline editor.
            </p>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
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
                cursor: "pointer",
                fontFamily: "'Jost', sans-serif",
              }}
            >
              Continue Anyway — I will adjust manually
            </button>
          </div>
        </div>
      );
    }

    const summary = hasTight
      ? "Looking good — a few tight spots"
      : "Everything looks great!";
    const nextLabel = hasTight ? "Continue" : "Next";

    return (
      <div style={{ width: "100%", marginTop: 24 }}>
        <p
          style={{
            margin: "0 0 16px",
            fontSize: 16,
            textAlign: "center",
            color: "var(--wtb-text)",
            fontFamily: "'Cormorant Garamond', serif",
          }}
        >
          {summary}
        </p>
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
            {nextLabel}
          </button>
        </div>
      </div>
    );
  };

  if (inModal) {
    return (
      <div style={{ paddingBottom: 8 }}>
        {content}
        {footer()}
      </div>
    );
  }

  return (
    <div
      className="wiz-layout wtb-logistics-wizard"
      style={{
        padding: "16px 0",
        background: "var(--wtb-bg)",
        minHeight: "100vh",
        fontFamily: "'Jost', sans-serif",
        color: "var(--wtb-text)",
      }}
    >
      <div className="wiz-step-col" style={{ maxWidth: "min(960px, 100%)", margin: "0 auto" }}>
        <div style={{ padding: "24px clamp(12px, 3vw, 24px) 40px" }}>
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
              padding: "24px clamp(12px, 3vw, 20px)",
            }}
          >
            {content}
          </div>
          {footer()}
        </div>
      </div>
    </div>
  );
}

export { WizardLogisticsCheck };
