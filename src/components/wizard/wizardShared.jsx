import React from "react";
import { SETTINGS_SELECT_STYLE } from "../../constants/styles";

export const HOUR_OPTIONS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
export const MINUTE_OPTIONS = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

const inputStyle = {
  width: "100%",
  padding: 9,
  border: "1px solid var(--wtb-border)",
  borderRadius: 6,
  fontSize: 14,
  boxSizing: "border-box",
  background: "var(--wtb-surface)",
  color: "var(--wtb-text)",
  fontFamily: "'Jost', sans-serif",
};

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

export function FlexibilityControl({ hard, onHardChange, flexMinutes, onFlexMinutesChange }) {
  const btn = (selected, label, onClick) => (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "8px 14px",
        borderRadius: 6,
        border: selected ? "1px solid var(--wtb-accent)" : "1px solid var(--wtb-border)",
        background: selected ? "rgba(184,144,106,0.15)" : "var(--wtb-surface)",
        color: selected ? "var(--wtb-accent)" : "var(--wtb-text-muted)",
        fontSize: 13,
        cursor: "pointer",
        fontFamily: "'Jost', sans-serif",
      }}
    >
      {label}
    </button>
  );
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {btn(hard, "Hard Start", () => onHardChange(true))}
        {btn(!hard, "Flexible", () => onHardChange(false))}
      </div>
      {!hard && (
        <div style={{ marginTop: 10 }}>
          <label style={{ display: "block", fontSize: 13, color: "var(--wtb-text-muted)", marginBottom: 4, fontFamily: "'Jost', sans-serif" }}>
            Up to how many minutes can it flex?
          </label>
          <input
            type="number"
            min={1}
            value={flexMinutes}
            onChange={(e) => onFlexMinutesChange(parseInt(e.target.value, 10) || 30)}
            style={{ ...inputStyle, width: 100 }}
          />
        </div>
      )}
    </div>
  );
}

export function TravelStepper({ value, onChange, label }) {
  const mins = parseInt(value, 10) || 0;
  return (
    <div style={{ marginBottom: 14 }}>
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

export function GettingReadyFields({
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
}) {
  const boxStyle = { border: "1px solid var(--wtb-border-subtle)", borderRadius: 8, padding: "14px 14px 12px", marginBottom: 16, background: "var(--wtb-surface-raised)" };
  const labelStyle = { display: "block", fontSize: 13, fontWeight: 300, color: "var(--wtb-text-muted)", marginBottom: 4, fontFamily: "'Jost', sans-serif" };
  const check = (checked, onClick, text) => (
    <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, cursor: "pointer" }} onClick={onClick}>
      <input type="checkbox" checked={checked} readOnly style={{ width: 18, height: 18, flexShrink: 0 }} />
      <span style={{ fontSize: 14, color: "var(--wtb-text-muted)" }}>{text}</span>
    </label>
  );

  return (
    <div style={boxStyle}>
      {check(atCeremony, () => { setAtCeremony(!atCeremony); if (!atCeremony) { setAtReception(false); if (setAtPartner) setAtPartner(false); } }, "Same as ceremony venue")}
      {check(atReception, () => { setAtReception(!atReception); if (!atReception) { setAtCeremony(false); if (setAtPartner) setAtPartner(false); } }, "Same as reception venue")}
      {setAtPartner && check(atPartner, () => { setAtPartner(!atPartner); if (!atPartner) { setAtCeremony(false); setAtReception(false); } }, `Same as ${partnerLabel} getting ready location`)}
      {!atCeremony && !atReception && !atPartner && (
        <>
          <div style={{ marginTop: 10, marginBottom: 10 }}>
            <label style={labelStyle}>Venue name</label>
            <input type="text" value={venueName} onChange={(e) => setVenueName(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Address</label>
            <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} style={inputStyle} />
          </div>
        </>
      )}
    </div>
  );
}

export function LocationDropdown({ value, onChange, locations, placeholder = "Select location…" }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle}>
      <option value="">{placeholder}</option>
      {locations.map((name) => (
        <option key={name} value={name}>{name}</option>
      ))}
    </select>
  );
}
