import React, { useMemo, useState, useCallback } from "react";
import { generateTimeline as generateTimelineLib } from "../../lib/generateTimeline";
import { calculateLogistics } from "../../lib/calculateLogistics";
import { buildWizardAnswers } from "../../lib/buildWizardAnswers";
import { applyLogisticsSuggestion, describeBottleneck } from "../../lib/applyLogisticsSuggestion";
import { formatClockLabel } from "../../lib/time";

const STATUS = {
  ok: { color: "#6b8f71", icon: "✓", label: "Comfortable" },
  tight: { color: "var(--wtb-accent)", icon: "!", label: "Tight" },
  overflow: { color: "#8b4545", icon: "✕", label: "Over capacity" },
};

function LogisticsTimelineBar({ windows, dayStart, dayEnd }) {
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
                background: st.color,
                opacity: w.status === "ok" ? 0.75 : 0.9,
                borderRadius: 4,
                minWidth: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 4px",
                boxSizing: "border-box",
                overflow: "hidden",
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

function WindowSummaryCard({ window: w }) {
  const st = STATUS[w.status] || STATUS.ok;
  let detail = `${w.availableMinutes} minutes available, ${w.usedMinutes} minutes of events scheduled`;
  if (w.status === "overflow") {
    detail = `${detail}, ${w.overflowMinutes} minutes over — needs attention`;
  } else if (w.status === "tight") {
    detail = `${detail}, only ${w.remainingMinutes} minutes of buffer — cutting it close`;
  } else {
    detail = `${detail}, ${w.remainingMinutes} minutes remaining`;
  }

  return (
    <div
      style={{
        background: "var(--wtb-surface)",
        border: `1px solid ${w.status === "overflow" ? "rgba(139, 69, 69, 0.45)" : "var(--wtb-border-subtle)"}`,
        borderRadius: 10,
        padding: "16px 18px",
        marginBottom: 12,
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
          <div style={{ fontSize: 13, color: "var(--wtb-text-muted)", fontFamily: "'Jost', sans-serif", lineHeight: 1.5 }}>
            {detail}
          </div>
        </div>
      </div>
    </div>
  );
}

function WizardLogisticsCheck(props) {
  const {
    inModal,
    displayStep,
    totalWizardSteps,
    setWizardStep,
    wiz_appliedLogisticsSuggestions,
    setWiz_appliedLogisticsSuggestions,
    setWiz_brideOkayBefore,
    setWiz_dinnerStartHour,
    setWiz_dinnerStartMinute,
    setWiz_dinnerStartPeriod,
    setWiz_receptionHour,
    setWiz_receptionMinute,
    setWiz_receptionPeriod,
    setPhotoStartHour,
    setPhotoStartMinute,
    setPhotoStartPeriod,
    setWiz_preCeremonyDetails,
    setWiz_familyGroups,
    wiz_familyGroups,
  } = props;

  const [skippedIds, setSkippedIds] = useState([]);

  const answers = useMemo(() => buildWizardAnswers(props), [props, wiz_appliedLogisticsSuggestions]);
  const rows = useMemo(() => generateTimelineLib(answers), [answers]);
  const report = useMemo(() => calculateLogistics(answers, rows), [answers, rows]);

  const hasOverflow = report.windows.some((w) => w.status === "overflow");
  const hasTight = report.windows.some((w) => w.status === "tight");
  const hasBottlenecks = report.bottlenecks.length > 0;

  const dayStart = report.windows.length
    ? Math.min(...report.windows.map((w) => w.startTime))
    : 0;
  const dayEnd = report.windows.length
    ? Math.max(...report.windows.map((w) => w.endTime))
    : report.totalDayMinutes;

  const appliedIds = new Set(wiz_appliedLogisticsSuggestions.map((s) => s.id));

  const visibleSuggestions = report.suggestions.filter(
    (s) => !skippedIds.includes(s.id) && !appliedIds.has(s.id)
  );

  const isSuggestionResolved = useCallback(
    (suggestionId) => {
      const applied = wiz_appliedLogisticsSuggestions.find((s) => s.id === suggestionId);
      if (!applied) return false;
      const win = report.windows.find((w) => w.id === applied.windowId);
      return win && win.status !== "overflow";
    },
    [wiz_appliedLogisticsSuggestions, report.windows]
  );

  const handleApply = (suggestion) => {
    const applied = applyLogisticsSuggestion(suggestion, {
      setBrideOkayBefore: setWiz_brideOkayBefore,
      setDinnerStartHour: setWiz_dinnerStartHour,
      setDinnerStartMinute: setWiz_dinnerStartMinute,
      setDinnerStartPeriod: setWiz_dinnerStartPeriod,
      setReceptionHour: setWiz_receptionHour,
      setReceptionMinute: setWiz_receptionMinute,
      setReceptionPeriod: setWiz_receptionPeriod,
      setPhotoStartHour,
      setPhotoStartMinute,
      setPhotoStartPeriod,
      setPreCeremonyDetails: setWiz_preCeremonyDetails,
      setFamilyGroups: setWiz_familyGroups,
      getFamilyGroups: () => wiz_familyGroups,
    });
    setWiz_appliedLogisticsSuggestions((prev) => [...prev, applied]);
  };

  const handleSkip = (suggestionId) => {
    setSkippedIds((prev) => [...prev, suggestionId]);
  };

  const headerStatus = hasOverflow
    ? { color: "#8b4545", icon: "✕", title: "Scheduling conflicts need attention", body: "There are some scheduling conflicts that could not be automatically resolved. You can continue and adjust manually, or go back and modify your selections." }
    : hasTight
      ? { color: "var(--wtb-accent)", icon: "!", title: "A few tight spots", body: "Your schedule is tight in a few places but workable. Review the details below." }
      : { color: "#6b8f71", icon: "✓", title: "Your schedule looks great", body: "Everything fits comfortably within your time windows." };

  const content = (
    <div>
      <div
        style={{
          textAlign: "center",
          padding: "20px 12px 28px",
          borderBottom: "1px solid var(--wtb-border-subtle)",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            fontSize: 36,
            color: headerStatus.color,
            marginBottom: 12,
            lineHeight: 1,
          }}
        >
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
          <LogisticsTimelineBar windows={report.windows} dayStart={dayStart} dayEnd={dayEnd} />
          <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap", fontSize: 11, fontFamily: "'Jost', sans-serif", color: "var(--wtb-text-muted)" }}>
            <span><span style={{ color: STATUS.ok.color }}>■</span> Comfortable</span>
            <span><span style={{ color: STATUS.tight.color }}>■</span> Tight</span>
            <span><span style={{ color: STATUS.overflow.color }}>■</span> Over capacity</span>
          </div>
        </>
      )}

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
        <WindowSummaryCard key={w.id} window={w} />
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
            Schedule conflicts
          </div>
          {report.bottlenecks.map((bn) => {
            const window = report.windows.find((w) => w.id === bn.windowId);
            if (!window) return null;
            const bnSuggestions = [
              ...wiz_appliedLogisticsSuggestions.filter((s) => s.windowId === bn.windowId),
              ...visibleSuggestions.filter((s) => s.windowId === bn.windowId),
            ];
            return (
              <div
                key={bn.windowId}
                style={{
                  background: "var(--wtb-surface-raised)",
                  border: "1px solid var(--wtb-border-subtle)",
                  borderRadius: 10,
                  padding: "18px 18px 12px",
                  marginBottom: 16,
                }}
              >
                <p
                  style={{
                    margin: "0 0 16px 0",
                    fontSize: 14,
                    color: "var(--wtb-text)",
                    fontFamily: "'Jost', sans-serif",
                    lineHeight: 1.55,
                  }}
                >
                  {describeBottleneck(window)}
                </p>
                {bnSuggestions.map((s) => {
                  const resolved = isSuggestionResolved(s.id);
                  const isApplied = appliedIds.has(s.id);
                  return (
                    <div
                      key={s.id}
                      style={{
                        background: "var(--wtb-surface)",
                        border: `1px solid ${resolved ? "rgba(107, 143, 113, 0.4)" : "var(--wtb-border-subtle)"}`,
                        borderRadius: 8,
                        padding: "14px 16px",
                        marginBottom: 10,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        {resolved && (
                          <span style={{ color: STATUS.ok.color, fontSize: 18, flexShrink: 0 }}>✓</span>
                        )}
                        <div style={{ flex: 1 }}>
                          <p
                            style={{
                              margin: "0 0 6px 0",
                              fontSize: 14,
                              color: "var(--wtb-text)",
                              fontFamily: "'Jost', sans-serif",
                            }}
                          >
                            {s.description}
                          </p>
                          {s.minutesSaved > 0 && (
                            <p
                              style={{
                                margin: 0,
                                fontSize: 12,
                                color: "var(--wtb-text-muted)",
                                fontFamily: "'Jost', sans-serif",
                              }}
                            >
                              Saves approximately {s.minutesSaved} minutes
                            </p>
                          )}
                          {resolved && (
                            <p
                              style={{
                                margin: "8px 0 0 0",
                                fontSize: 12,
                                color: STATUS.ok.color,
                                fontFamily: "'Jost', sans-serif",
                              }}
                            >
                              Resolved — this window now fits
                            </p>
                          )}
                        </div>
                      </div>
                      {!isApplied && !resolved && (
                        <div style={{ display: "flex", gap: 10, marginTop: 12, justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            onClick={() => handleSkip(s.id)}
                            style={{
                              padding: "8px 18px",
                              border: "1px solid var(--wtb-border)",
                              borderRadius: 6,
                              background: "transparent",
                              color: "var(--wtb-text-muted)",
                              fontSize: 13,
                              cursor: "pointer",
                              fontFamily: "'Jost', sans-serif",
                            }}
                          >
                            Skip
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApply(s)}
                            style={{
                              padding: "8px 22px",
                              border: "none",
                              borderRadius: 6,
                              background: "var(--wtb-accent)",
                              color: "var(--wtb-on-accent)",
                              fontSize: 13,
                              cursor: "pointer",
                              fontFamily: "'Jost', sans-serif",
                            }}
                          >
                            Apply
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </>
      )}
    </div>
  );

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
              We&apos;ve reviewed your wedding day schedule. Here&apos;s what we found.
            </p>
            {content}
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
            {hasOverflow ? (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => setWizardStep(7)}
                  style={{
                    padding: "12px 24px",
                    border: "1px solid var(--wtb-border)",
                    borderRadius: 8,
                    background: "transparent",
                    color: "var(--wtb-text-muted)",
                    fontSize: 15,
                    cursor: "pointer",
                    fontFamily: "'Jost', sans-serif",
                  }}
                >
                  Go Back
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
            ) : (
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
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export { WizardLogisticsCheck };
