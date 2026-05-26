import React from "react";
import { TimePickerRow } from "./wizardShared";
import { formatClockLabel } from "../../lib/time";
import {
  minimumDurationForEvent,
  RECEPTION_DURATION_MINIMUMS,
} from "../../lib/logisticsEventAdjustments";
import { mergeDraftProps } from "../../lib/logisticsPendingChanges";

const sectionTitle = {
  fontFamily: "'Jost', sans-serif",
  fontSize: 11,
  fontWeight: 400,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--wtb-accent)",
  margin: "0 0 8px",
};

const optionHeading = {
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: 17,
  fontWeight: 400,
  color: "var(--wtb-text)",
  margin: "0 0 6px",
};

const bodyText = {
  margin: "0 0 12px",
  fontSize: 13,
  color: "var(--wtb-text-muted)",
  lineHeight: 1.55,
  fontFamily: "'Jost', sans-serif",
};

const inputStyle = {
  width: 72,
  padding: "8px 10px",
  border: "1px solid var(--wtb-border)",
  borderRadius: 6,
  textAlign: "center",
  background: "var(--wtb-surface)",
  color: "var(--wtb-text)",
  fontFamily: "'Jost', sans-serif",
  fontSize: 14,
};

function schedulableWindowEvents(window) {
  return (window.events || []).filter(
    (r) => r.type !== "constraint" && String(r.event || "").trim()
  );
}

function LogisticsOverflowControls({ window: w, rows = [], logisticsPending, onLogisticsPendingPatch, ...props }) {
  const draft = mergeDraftProps(props, logisticsPending);
  const patch = (updates) => onLogisticsPendingPatch?.(updates);

  const {
    photoEnabled,
    videoEnabled,
    wiz_openDanceFloor,
    wiz_garterToss,
    wiz_bouquetToss,
    wiz_speeches,
    wiz_cakeCutting,
    wiz_firstDance,
    wiz_grandEntrance,
  } = props;

  const committedAdj = props.wiz_logisticsEventAdjustments || {};
  const draftAdj = draft.wiz_logisticsEventAdjustments || {};

  const events = schedulableWindowEvents(w);
  const timelineRunEnd = rows.length
    ? Math.max(
        ...rows
          .filter((r) => r.type !== "constraint")
          .map((r) => r.time + (parseInt(r.duration, 10) || 0))
      )
    : w.endTime;
  const coverageEnd = w.endTime;
  const extendMinutes = Math.max(0, timelineRunEnd - coverageEnd);

  const setAdjustment = (eventName, patchFields) => {
    patch({
      wiz_logisticsEventAdjustments: {
        [eventName]: {
          ...(committedAdj[eventName] || {}),
          ...(draftAdj[eventName] || {}),
          ...patchFields,
        },
      },
    });
  };

  const receptionFlagPatch = (eventName, removed) => {
    if (eventName.includes("Open Dance")) patch({ wiz_openDanceFloor: !removed });
    else if (eventName.includes("Garder") || eventName.includes("Garter")) {
      patch({ wiz_garterToss: !removed });
    } else if (eventName.includes("Bouquet")) patch({ wiz_bouquetToss: !removed });
    else if (eventName.includes("Speeches")) patch({ wiz_speeches: !removed });
    else if (eventName.includes("Cake")) patch({ wiz_cakeCutting: !removed });
    else if (eventName.includes("Bride & Groom Dance")) patch({ wiz_firstDance: !removed });
    else if (eventName.includes("Grand Entrance")) patch({ wiz_grandEntrance: !removed });
  };

  const handleRemoveToggle = (eventName, include) => {
    if (include) {
      setAdjustment(eventName, { removed: false });
      receptionFlagPatch(eventName, false);
    } else {
      setAdjustment(eventName, { removed: true });
      receptionFlagPatch(eventName, true);
    }
  };

  const isEventIncluded = (eventName) => {
    const adj = { ...committedAdj[eventName], ...draftAdj[eventName] };
    if (adj.removed) return false;
    if (eventName.includes("Open Dance")) return draft.wiz_openDanceFloor !== false;
    if (eventName.includes("Garder") || eventName.includes("Garter")) {
      return draft.wiz_garterToss !== false;
    }
    if (eventName.includes("Bouquet")) return draft.wiz_bouquetToss !== false;
    if (eventName.includes("Speeches")) return draft.wiz_speeches !== false;
    if (eventName.includes("Cake")) return draft.wiz_cakeCutting !== false;
    if (eventName.includes("Bride & Groom Dance")) return draft.wiz_firstDance !== false;
    if (eventName.includes("Grand Entrance")) return draft.wiz_grandEntrance !== false;
    return true;
  };

  return (
    <div className="wtb-logistics-overflow-controls" style={{ marginTop: 16 }}>
      <p style={{ ...bodyText, color: "#8b4545", marginBottom: 16 }}>
        This window is over capacity. Use one or more options below — you can combine them, then
        click Apply Changes.
      </p>

      <div
        style={{
          border: "1px solid var(--wtb-border-subtle)",
          borderRadius: 10,
          padding: "14px 16px",
          marginBottom: 14,
          background: "var(--wtb-surface)",
        }}
      >
        <p style={sectionTitle}>Option A</p>
        <h4 style={optionHeading}>Extend coverage</h4>
        <p style={bodyText}>
          Your coverage ends at {formatClockLabel(coverageEnd)} but the timeline runs until{" "}
          {formatClockLabel(timelineRunEnd)}.
          {extendMinutes > 0
            ? ` Extending coverage by ${extendMinutes} minutes would resolve this.`
            : " Adjust coverage end to fit your events."}
        </p>
        {photoEnabled && (
          <div style={{ marginBottom: videoEnabled ? 12 : 0 }}>
            <label style={{ ...bodyText, display: "block", marginBottom: 8 }}>
              Photo coverage end
            </label>
            <TimePickerRow
              hour={draft.photoEndHour}
              minute={draft.photoEndMinute}
              period={draft.photoEndPeriod}
              onHour={(h) => patch({ photoEndHour: h })}
              onMinute={(m) => patch({ photoEndMinute: m })}
              onPeriod={(p) => patch({ photoEndPeriod: p })}
            />
          </div>
        )}
        {videoEnabled && (
          <div>
            <label style={{ ...bodyText, display: "block", marginBottom: 8 }}>
              Video coverage end
            </label>
            <TimePickerRow
              hour={draft.videoEndHour}
              minute={draft.videoEndMinute}
              period={draft.videoEndPeriod}
              onHour={(h) => patch({ videoEndHour: h })}
              onMinute={(m) => patch({ videoEndMinute: m })}
              onPeriod={(p) => patch({ videoEndPeriod: p })}
            />
          </div>
        )}
      </div>

      <div
        style={{
          border: "1px solid var(--wtb-border-subtle)",
          borderRadius: 10,
          padding: "14px 16px",
          marginBottom: 14,
          background: "var(--wtb-surface)",
        }}
      >
        <p style={sectionTitle}>Option B</p>
        <h4 style={optionHeading}>Shorten event duration</h4>
        <p style={bodyText}>
          Reduce how long events run in this window. Preview updates when you apply changes.
        </p>
        {events.map((row) => {
          const eventName = row.event;
          const current = parseInt(row.duration, 10) || 0;
          const min = minimumDurationForEvent(eventName);
          const adj = { ...committedAdj[eventName], ...draftAdj[eventName] };
          const value = adj.duration != null ? adj.duration : current;
          return (
            <div
              key={`${eventName}-${row.time}`}
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 10,
                marginBottom: 12,
                paddingBottom: 12,
                borderBottom: "1px solid var(--wtb-border-subtle)",
              }}
            >
              <div style={{ flex: "1 1 180px", fontSize: 14, color: "var(--wtb-text)" }}>
                {eventName}
                <span style={{ color: "var(--wtb-text-muted)", fontSize: 12 }}>
                  {" "}
                  (currently {current} min)
                </span>
              </div>
              <input
                type="number"
                min={min}
                step={5}
                value={value}
                onChange={(e) =>
                  setAdjustment(eventName, {
                    duration: Math.max(min, parseInt(e.target.value, 10) || min),
                  })
                }
                style={inputStyle}
                aria-label={`Duration for ${eventName}`}
              />
              <span style={{ fontSize: 12, color: "var(--wtb-text-muted)" }}>min</span>
              <p style={{ ...bodyText, width: "100%", margin: 0, fontSize: 12 }}>
                Recommended minimum: {min} min
                {!RECEPTION_DURATION_MINIMUMS[eventName] ? " (custom event)" : ""}
              </p>
            </div>
          );
        })}
      </div>

      <div
        style={{
          border: "1px solid var(--wtb-border-subtle)",
          borderRadius: 10,
          padding: "14px 16px",
          background: "var(--wtb-surface)",
        }}
      >
        <p style={sectionTitle}>Option C</p>
        <h4 style={optionHeading}>Remove the event</h4>
        <p style={bodyText}>
          Turn off an event to drop it from the timeline after you apply changes.
        </p>
        {events.map((row) => {
          const eventName = row.event;
          const checked = isEventIncluded(eventName);
          return (
            <label
              key={`rm-${eventName}-${row.time}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 10,
                cursor: "pointer",
                fontSize: 14,
                color: "var(--wtb-text)",
                fontFamily: "'Jost', sans-serif",
              }}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => handleRemoveToggle(eventName, e.target.checked)}
                style={{ width: 18, height: 18 }}
              />
              Include {eventName}
            </label>
          );
        })}
      </div>
    </div>
  );
}

export { LogisticsOverflowControls };
