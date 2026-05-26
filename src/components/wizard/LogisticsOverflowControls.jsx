import React from "react";
import { TimePickerRow } from "./wizardShared";
import { formatClockLabel } from "../../lib/time";
import {
  minimumDurationForEvent,
  RECEPTION_DURATION_MINIMUMS,
} from "../../lib/logisticsEventAdjustments";

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

function LogisticsOverflowControls({ window: w, rows = [], ...props }) {
  const {
    photoEnabled,
    videoEnabled,
    photoEndHour,
    photoEndMinute,
    photoEndPeriod,
    setPhotoEndHour,
    setPhotoEndMinute,
    setPhotoEndPeriod,
    videoEndHour,
    videoEndMinute,
    videoEndPeriod,
    setVideoEndHour,
    setVideoEndMinute,
    setVideoEndPeriod,
    photoStartHour,
    photoStartMinute,
    photoStartPeriod,
    wiz_logisticsEventAdjustments = {},
    setWiz_logisticsEventAdjustments,
    wiz_openDanceFloor,
    setWiz_openDanceFloor,
    wiz_garterToss,
    setWiz_garterToss,
    wiz_bouquetToss,
    setWiz_bouquetToss,
    wiz_speeches,
    setWiz_speeches,
    wiz_cakeCutting,
    setWiz_cakeCutting,
    wiz_firstDance,
    setWiz_firstDance,
    wiz_grandEntrance,
    setWiz_grandEntrance,
  } = props;

  const events = schedulableWindowEvents(w);
  const timelineRunEnd = rows.length
    ? Math.max(...rows.filter((r) => r.type !== "constraint").map((r) => r.time + (parseInt(r.duration, 10) || 0)))
    : w.endTime;
  const coverageEnd = w.endTime;
  const extendMinutes = Math.max(0, timelineRunEnd - coverageEnd);

  const setAdjustment = (eventName, patch) => {
    setWiz_logisticsEventAdjustments((prev) => ({
      ...prev,
      [eventName]: { ...(prev[eventName] || {}), ...patch },
    }));
  };

  const togglePropForEvent = (eventName) => {
    if (eventName.includes("Open Dance")) return [wiz_openDanceFloor, setWiz_openDanceFloor];
    if (eventName.includes("Garder") || eventName.includes("Garter")) {
      return [wiz_garterToss, setWiz_garterToss];
    }
    if (eventName.includes("Bouquet")) return [wiz_bouquetToss, setWiz_bouquetToss];
    if (eventName.includes("Speeches")) return [wiz_speeches, setWiz_speeches];
    if (eventName.includes("Cake")) return [wiz_cakeCutting, setWiz_cakeCutting];
    if (eventName.includes("Bride & Groom Dance")) return [wiz_firstDance, setWiz_firstDance];
    if (eventName.includes("Grand Entrance")) return [wiz_grandEntrance, setWiz_grandEntrance];
    return [true, null];
  };

  const handleRemoveToggle = (eventName, removed) => {
    setAdjustment(eventName, { removed });
    const [enabled, setter] = togglePropForEvent(eventName);
    if (setter && !removed && !enabled) setter(true);
    if (setter && removed) setter(false);
  };

  return (
    <div className="wtb-logistics-overflow-controls" style={{ marginTop: 16 }}>
      <p style={{ ...bodyText, color: "#8b4545", marginBottom: 16 }}>
        This window is over capacity. Use one or more options below — you can combine them.
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
              hour={photoEndHour}
              minute={photoEndMinute}
              period={photoEndPeriod}
              onHour={setPhotoEndHour}
              onMinute={setPhotoEndMinute}
              onPeriod={setPhotoEndPeriod}
            />
          </div>
        )}
        {videoEnabled && (
          <div>
            <label style={{ ...bodyText, display: "block", marginBottom: 8 }}>
              Video coverage end
            </label>
            <TimePickerRow
              hour={videoEndHour}
              minute={videoEndMinute}
              period={videoEndPeriod}
              onHour={setVideoEndHour}
              onMinute={setVideoEndMinute}
              onPeriod={setVideoEndPeriod}
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
          Reduce how long events run in this window. Changes apply immediately to the timeline and
          bar above.
        </p>
        {events.map((row) => {
          const eventName = row.event;
          const current = parseInt(row.duration, 10) || 0;
          const min = minimumDurationForEvent(eventName);
          const adj = wiz_logisticsEventAdjustments[eventName];
          const value = adj?.duration != null ? adj.duration : current;
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
        <p style={{ ...bodyText }}>
          Turn off an event to drop it from the timeline. The schedule and logistics bar update
          right away.
        </p>
        {events.map((row) => {
          const eventName = row.event;
          const removed = !!wiz_logisticsEventAdjustments[eventName]?.removed;
          const [enabled] = togglePropForEvent(eventName);
          const checked = !removed && enabled !== false;
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
                onChange={(e) => handleRemoveToggle(eventName, !e.target.checked)}
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
