import React from "react";
import { SETTINGS_SELECT_STYLE } from "../../constants/styles";

export const HOUR_OPTIONS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
export const MINUTE_OPTIONS = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

export function FlexibilitySelector({ value, onChange, compact }) {
  const options = [
    { v: 0, label: "Hard Start" },
    { v: 30, label: "Flexible ±30 min" },
    { v: 60, label: "Flexible ±60 min" },
  ];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: compact ? 6 : 8, marginTop: compact ? 0 : 8 }}>
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(o.v)}
          style={{
            padding: compact ? "6px 12px" : "8px 14px",
            borderRadius: 6,
            border: value === o.v ? "1px solid var(--wtb-accent)" : "1px solid var(--wtb-border)",
            background: value === o.v ? "rgba(184,144,106,0.15)" : "var(--wtb-surface)",
            color: value === o.v ? "var(--wtb-accent)" : "var(--wtb-text-muted)",
            fontSize: compact ? 12 : 13,
            cursor: "pointer",
            fontFamily: "'Jost', sans-serif",
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function TimePickerRow({ hour, minute, period, onHour, onMinute, onPeriod }) {
  const sel = SETTINGS_SELECT_STYLE;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <select value={hour} onChange={(e) => onHour(e.target.value)} style={{ ...sel, fontSize: 15, padding: "8px 10px" }}>
        {HOUR_OPTIONS.map((h) => (
          <option key={h} value={h}>{h}</option>
        ))}
      </select>
      <span style={{ fontSize: 18, fontWeight: "bold", color: "var(--wtb-text)" }}>:</span>
      <select value={minute} onChange={(e) => onMinute(e.target.value)} style={{ ...sel, fontSize: 15, padding: "8px 10px" }}>
        {MINUTE_OPTIONS.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
      <select value={period} onChange={(e) => onPeriod(e.target.value)} style={{ ...sel, fontSize: 15, padding: "8px 10px" }}>
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}

export function YesNoToggle({ value, onYes, onNo, wizToggleStyle }) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      <button type="button" style={wizToggleStyle(value === true)} onClick={onYes}>Yes</button>
      <button type="button" style={wizToggleStyle(value === false)} onClick={onNo}>No</button>
    </div>
  );
}

function TravelStepper({ value, onChange, label }) {
  const mins = parseInt(value, 10) || 0;
  return (
    <div style={{ marginTop: 12 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "var(--wtb-text-muted)", marginBottom: 6, fontFamily: "'Jost', sans-serif" }}>
        {label}
      </label>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button type="button" onClick={() => onChange(String(Math.max(0, mins - 5)))} style={{ width: 32, height: 32, background: "var(--wtb-surface)", border: "1px solid var(--wtb-border)", borderRadius: 6, color: "var(--wtb-text)", fontSize: 18, cursor: "pointer" }}>−</button>
        <span style={{ minWidth: 28, textAlign: "center", fontSize: 16, color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" }}>{mins}</span>
        <button type="button" onClick={() => onChange(String(mins + 5))} style={{ width: 32, height: 32, background: "var(--wtb-surface)", border: "1px solid var(--wtb-border)", borderRadius: 6, color: "var(--wtb-text)", fontSize: 18, cursor: "pointer" }}>+</button>
        <span style={{ fontSize: 13, color: "var(--wtb-text-muted)", fontFamily: "'Jost', sans-serif" }}>minutes</span>
      </div>
    </div>
  );
}

export function GettingReadyBlock({
  personLabel,
  atCeremony,
  setAtCeremony,
  atReception,
  setAtReception,
  atPartner,
  setAtPartner,
  partnerLabel,
  venueName,
  setVenueName,
  street,
  setStreet,
  travelToCeremony,
  setTravelToCeremony,
  travelBetweenReady,
  setTravelBetweenReady,
  showBetweenTravel,
  allWizLocations,
  mandatoryLocStyle,
  mandatoryLabelStyle,
  mandatoryInputStyle,
}) {
  return (
    <div style={mandatoryLocStyle}>
      <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, cursor: "pointer" }}
        onClick={() => { setAtCeremony(!atCeremony); if (!atCeremony) setAtReception(false); }}>
        <input type="checkbox" checked={atCeremony} readOnly style={{ width: 18, height: 18, flexShrink: 0 }} />
        <span style={{ fontSize: 14, color: "var(--wtb-text-muted)" }}>Same as ceremony location</span>
      </label>
      <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, cursor: "pointer" }}
        onClick={() => { setAtReception(!atReception); if (!atReception) setAtCeremony(false); }}>
        <input type="checkbox" checked={atReception} readOnly style={{ width: 18, height: 18, flexShrink: 0 }} />
        <span style={{ fontSize: 14, color: "var(--wtb-text-muted)" }}>Same as reception location</span>
      </label>
      {setAtPartner && (
        <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: atCeremony || atReception || atPartner ? 0 : 12, cursor: "pointer" }}
          onClick={() => { setAtPartner(!atPartner); if (!atPartner) { setAtCeremony(false); setAtReception(false); } }}>
          <input type="checkbox" checked={atPartner} readOnly style={{ width: 18, height: 18, flexShrink: 0 }} />
          <span style={{ fontSize: 14, color: "var(--wtb-text-muted)" }}>Same as {partnerLabel}&apos;s getting ready location</span>
        </label>
      )}
      {!atCeremony && !atReception && !atPartner && (
        <>
          <div style={{ marginBottom: 10, marginTop: 10 }}>
            <label style={mandatoryLabelStyle}>Location</label>
            <select
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              style={{ ...mandatoryInputStyle, marginBottom: 8 }}
            >
              <option value="">Select or type below…</option>
              {allWizLocations.map((name, i) => (
                <option key={i} value={name}>{name}</option>
              ))}
            </select>
            <input
              type="text"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              placeholder="Venue name"
              style={mandatoryInputStyle}
            />
          </div>
          <div>
            <label style={mandatoryLabelStyle}>Address</label>
            <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Street address" style={mandatoryInputStyle} />
          </div>
          {setTravelToCeremony && (
            <TravelStepper value={travelToCeremony} onChange={setTravelToCeremony} label="Travel time to ceremony (minutes)" />
          )}
          {showBetweenTravel && setTravelBetweenReady && (
            <TravelStepper value={travelBetweenReady} onChange={setTravelBetweenReady} label={`Travel time from ${partnerLabel}'s getting ready location (minutes)`} />
          )}
        </>
      )}
    </div>
  );
}
