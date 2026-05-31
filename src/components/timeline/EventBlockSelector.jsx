import React, { useState, useEffect } from "react";
import { EVENT_BLOCKS } from "../../constants/events";
import { getEventColor } from "../../constants/colors";
import { formatTime, parseTimeInput, snapMinuteToFive, MINUTE_OPTIONS_5 } from "../../lib/time";

function EventBlockSelector({ isVisible, onSelect, onClose, currentEvent, currentTime }) {
  const [customEvent, setCustomEvent] = useState(currentEvent || "");
  const [customDuration, setCustomDuration] = useState("30");
  const [timeHour, setTimeHour] = useState("12");
  const [timeMinute, setTimeMinute] = useState("00");
  const [timePeriod, setTimePeriod] = useState("PM");

  useEffect(() => {
    if (isVisible) {
      setCustomEvent(currentEvent || "");
      if (currentTime) {
        const timeFormatted = formatTime(currentTime);
        setTimeHour(timeFormatted.hour);
        setTimeMinute(snapMinuteToFive(timeFormatted.minute));
        setTimePeriod(timeFormatted.period);
      }
    }
  }, [isVisible, currentEvent, currentTime]);

  const isValidDuration =
    /\d+/.test(customDuration) && parseInt(customDuration, 10) > 0;

  const handleCustomEventSubmit = () => {
    if (!customEvent.trim() || !isValidDuration) return;
    const newTime = parseTimeInput(timeHour, timeMinute, timePeriod);
    onSelect({
      event: customEvent.trim(),
      duration: parseInt(customDuration, 10),
      time: newTime,
    });
  };

  const normalizeCustomDuration = () => {
    if (customDuration === "") return;
    const n = parseInt(customDuration, 10);
    if (isNaN(n) || n <= 0) setCustomDuration("");
    else setCustomDuration(String(n));
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "var(--wtb-overlay-heavy)",
        zIndex: 1100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          backgroundColor: "var(--wtb-surface)",
          border: "1px solid var(--wtb-border)",
          borderRadius: 8,
          padding: 20,
          maxHeight: "80vh",
          overflowY: "auto",
          width: "100%",
          maxWidth: 500,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            background: "var(--wtb-bg)",
            borderBottom: "1px solid var(--wtb-border)",
            margin: "-20px -20px 20px -20px",
            padding: "16px 20px",
          }}
        >
          <h3 style={{ margin: 0, color: "var(--wtb-text)", fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400 }}>Select or Create Event</h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 24,
              cursor: "pointer",
              color: "var(--wtb-text-muted)",
            }}
          >
            ×
          </button>
        </div>

        {/* Custom Event */}
        <div
          style={{
            marginBottom: 20,
            padding: 15,
            backgroundColor: "var(--wtb-surface-raised)",
            borderRadius: 8,
            border: "1px solid var(--wtb-border)",
          }}
        >
          <h4 style={{ margin: "0 0 10px 0", color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif", fontWeight: 400, letterSpacing: "0.1em", textTransform: "uppercase", fontSize: 11 }}>
            Create Custom Event
          </h4>
          <div style={{ marginBottom: 10 }}>
            <label
              style={{
                display: "block",
                marginBottom: 5,
                fontSize: 12,
                color: "var(--wtb-text-muted)",
                fontFamily: "'Jost', sans-serif",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Event Name:
            </label>
            <input
              type="text"
              value={customEvent}
              onChange={(e) => setCustomEvent(e.target.value)}
              placeholder="Enter custom event name..."
              style={{
                width: "100%",
                padding: 8,
                border: "1px solid var(--wtb-border)",
                borderRadius: 4,
                fontSize: 14,
                background: "var(--wtb-surface)",
                color: "var(--wtb-text)",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 20, marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 5,
                  fontSize: 12,
                  color: "var(--wtb-text-muted)",
                  fontFamily: "'Jost', sans-serif",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Start Time:
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <select
                  value={timeHour}
                  onChange={(e) => setTimeHour(e.target.value)}
                  style={{
                    width: 64,
                    height: 32,
                    fontSize: 14,
                    border: '1px solid var(--wtb-border)',
                    borderRadius: 4,
                    background: 'var(--wtb-surface)',
                    color: 'var(--wtb-text)',
                    cursor: 'pointer',
                  }}
                >
                  {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: 16, color: "var(--wtb-text)" }}>:</span>
                <select
                  value={timeMinute}
                  onChange={(e) => setTimeMinute(e.target.value)}
                  style={{
                    width: 64,
                    height: 32,
                    fontSize: 14,
                    border: '1px solid var(--wtb-border)',
                    borderRadius: 4,
                    background: 'var(--wtb-surface)',
                    color: 'var(--wtb-text)',
                    cursor: 'pointer',
                  }}
                >
                  {MINUTE_OPTIONS_5.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value)}
                  style={{
                    width: 70,
                    height: 32,
                    fontSize: 14,
                    border: '1px solid var(--wtb-border)',
                    borderRadius: 4,
                    background: 'var(--wtb-surface)',
                    color: 'var(--wtb-text)',
                    cursor: 'pointer',
                  }}
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
            <div style={{ minWidth: 120 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 5,
                  fontSize: 12,
                  color: "var(--wtb-text-muted)",
                  fontFamily: "'Jost', sans-serif",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Duration (minutes):
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={customDuration}
                onChange={(e) =>
                  setCustomDuration(e.target.value.replace(/\D/g, ""))
                }
                onBlur={normalizeCustomDuration}
                placeholder="e.g. 30"
                style={{
                  width: 100,
                  height: 32,
                  padding: 8,
                  border: "1px solid var(--wtb-border)",
                  borderRadius: 4,
                  fontSize: 14,
                  background: "var(--wtb-surface)",
                  color: "var(--wtb-text)",
                }}
              />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              onClick={handleCustomEventSubmit}
              disabled={!customEvent.trim() || !isValidDuration}
              style={{
                padding: "10px 20px",
                backgroundColor:
                  customEvent.trim() && isValidDuration ? "var(--wtb-accent)" : "var(--wtb-border)",
                color: customEvent.trim() && isValidDuration ? "var(--wtb-on-accent)" : "var(--wtb-text-muted)",
                border: "none",
                borderRadius: 4,
                cursor:
                  customEvent.trim() && isValidDuration
                    ? "pointer"
                    : "not-allowed",
                fontSize: 14,
                fontWeight: "bold",
                fontFamily: "'Jost', sans-serif",
              }}
            >
              Use Custom Event
            </button>
          </div>
        </div>

        <div style={{ marginBottom: 10, color: "var(--wtb-accent)", fontFamily: "'Jost', sans-serif", letterSpacing: "0.15em", textTransform: "uppercase", fontSize: 11 }}>
          Or Select Preset Event:
        </div>

        <div style={{ breakInside: "avoid", WebkitColumnBreakInside: "avoid", marginBottom: 12 }}>
          <div
            style={{
              fontSize: 10,
              color: "#ffffff",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              margin: "10px 0 4px",
              fontFamily: "'Jost', sans-serif",
              fontWeight: 400,
              borderTop: "1px solid var(--wtb-border-subtle)",
              paddingTop: 8,
              textAlign: "center",
            }}
          >
            Travel
          </div>
          <button
            type="button"
            onClick={() => {
              const newTime = parseTimeInput(timeHour, timeMinute, timePeriod);
              onSelect({ type: "location", event: "", duration: 15, time: newTime });
            }}
            style={{
              width: "100%",
              padding: 12,
              margin: "4px 0",
              backgroundColor: "var(--wtb-surface)",
              border: "2px solid #ffffff",
              borderRadius: 8,
              cursor: "pointer",
              textAlign: "left",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 14,
              fontWeight: 500,
              color: "var(--wtb-text)",
            }}
          >
            <span>Location / Travel</span>
            <span style={{ fontSize: 12, color: "var(--wtb-text-muted)", fontWeight: "bold", marginLeft: "16px", whiteSpace: "nowrap" }}>
              15 min
            </span>
          </button>
        </div>

        {(() => {
          const groups = [];
          const groupMap = {};
          EVENT_BLOCKS.forEach(block => {
            const [label, duration] = block.split("::");
            const sep = label.indexOf(": ");
            const category   = sep !== -1 ? label.substring(0, sep) : label;
            const shortLabel = sep !== -1 ? label.substring(sep + 2) : label;
            if (!groupMap[category]) { groupMap[category] = []; groups.push(category); }
            groupMap[category].push({ label, shortLabel, duration: parseInt(duration, 10), block });
          });
          return groups.map(category => (
            <div key={category} style={{ breakInside: "avoid", WebkitColumnBreakInside: "avoid" }}>
              <div style={{ fontSize: 10, color: getEventColor(groupMap[category][0].label), textTransform: "uppercase", letterSpacing: "0.12em", margin: "10px 0 4px", fontFamily: "'Jost', sans-serif", fontWeight: 400, borderTop: "1px solid var(--wtb-border-subtle)", paddingTop: 8, textAlign: "center" }}>{category}</div>
              {groupMap[category].map(({ label, shortLabel, duration, block }) => (
                <button
                  key={block}
                  onClick={() => {
                    const newTime = parseTimeInput(timeHour, timeMinute, timePeriod);
                    onSelect({ event: label, duration, time: newTime });
                  }}
                  style={{ width: "100%", padding: 12, margin: "4px 0", backgroundColor: "var(--wtb-surface)", border: `2px solid ${getEventColor(label)}`, borderRadius: 8, cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14, fontWeight: 500, color: "var(--wtb-text)" }}
                >
                  <span>{shortLabel}</span>
                  <span style={{ fontSize: 12, color: "var(--wtb-text-muted)", fontWeight: "bold", marginLeft: "16px", whiteSpace: "nowrap" }}>{duration} min</span>
                </button>
              ))}
            </div>
          ));
        })()}
      </div>
    </div>
  );
}

export { EventBlockSelector };
