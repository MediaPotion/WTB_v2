import React from "react";
import { TimePickerRow, FlexibilityControl, numberFieldProps } from "./wizardShared";

function WizardStep5(props) {
  const {
    stepCard, wizToggleStyle,
    wiz_ceremonyHour, setWiz_ceremonyHour, wiz_ceremonyMinute, setWiz_ceremonyMinute, wiz_ceremonyPeriod, setWiz_ceremonyPeriod,
    wiz_ceremonyFlexHard, setWiz_ceremonyFlexHard, wiz_ceremonyFlexMinutes, setWiz_ceremonyFlexMinutes,
    wiz_ceremonyType, setWiz_ceremonyType,
    wiz_ceremonyDuration, setWiz_ceremonyDuration,
    wiz_ceremonyOtherDuration, setWiz_ceremonyOtherDuration,
    wiz_ceremonyOutdoor, setWiz_ceremonyOutdoor,
    wiz_guestCount, setWiz_guestCount,
    wiz_ceremonyNotes, setWiz_ceremonyNotes,
    setWizardStep,
  } = props;

  const inputStyle = { padding: 10, border: "1px solid var(--wtb-border)", borderRadius: 6, fontSize: 15, background: "var(--wtb-surface)", color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" };

  const setType = (type) => {
    setWiz_ceremonyType(type);
    if (type === "average") setWiz_ceremonyDuration(30);
    if (type === "catholic") setWiz_ceremonyDuration(60);
  };

  return stepCard(
    "The Ceremony",
    "When the ceremony takes place and what we should know about it.",
    <div>
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 13, color: "var(--wtb-text-muted)", marginBottom: 8, fontFamily: "'Jost', sans-serif" }}>Ceremony start time</label>
        <TimePickerRow hour={wiz_ceremonyHour} minute={wiz_ceremonyMinute} period={wiz_ceremonyPeriod} onHour={setWiz_ceremonyHour} onMinute={setWiz_ceremonyMinute} onPeriod={setWiz_ceremonyPeriod} />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 13, color: "var(--wtb-text-muted)", marginBottom: 6, fontFamily: "'Jost', sans-serif" }}>How flexible is this start time?</label>
        <FlexibilityControl hard={wiz_ceremonyFlexHard} onHardChange={setWiz_ceremonyFlexHard} flexMinutes={wiz_ceremonyFlexMinutes} onFlexMinutesChange={setWiz_ceremonyFlexMinutes} />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 13, color: "var(--wtb-text-muted)", marginBottom: 8, fontFamily: "'Jost', sans-serif" }}>Ceremony type</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {[{ key: "average", label: "Average" }, { key: "catholic", label: "Catholic" }, { key: "other", label: "Other" }].map((t) => (
            <button key={t.key} type="button" style={wizToggleStyle(wiz_ceremonyType === t.key)} onClick={() => setType(t.key)}>{t.label}</button>
          ))}
        </div>
        {wiz_ceremonyType === "average" && (
          <div>
            <label style={{ display: "block", fontSize: 13, color: "var(--wtb-text-muted)", marginBottom: 6 }}>Duration (minutes)</label>
            <input type="number" min={5} max={45} step={5} {...numberFieldProps(wiz_ceremonyDuration, setWiz_ceremonyDuration)} style={{ ...inputStyle, width: 100 }} />
          </div>
        )}
        {wiz_ceremonyType === "catholic" && (
          <div>
            <p style={{ fontSize: 13, color: "var(--wtb-text-muted)", margin: "0 0 8px", fontFamily: "'Jost', sans-serif" }}>Typically 60+ minutes</p>
            <input type="number" min={46} step={5} {...numberFieldProps(wiz_ceremonyDuration, setWiz_ceremonyDuration)} style={{ ...inputStyle, width: 100 }} />
          </div>
        )}
        {wiz_ceremonyType === "other" && (
          <div>
            <label style={{ display: "block", fontSize: 13, color: "var(--wtb-text-muted)", marginBottom: 6 }}>Duration (minutes)</label>
            <input type="number" min={5} step={5} {...numberFieldProps(wiz_ceremonyOtherDuration, setWiz_ceremonyOtherDuration)} style={{ ...inputStyle, width: 100 }} />
          </div>
        )}
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 13, color: "var(--wtb-text-muted)", marginBottom: 8, fontFamily: "'Jost', sans-serif" }}>Ceremony setting</label>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" style={wizToggleStyle(!wiz_ceremonyOutdoor)} onClick={() => setWiz_ceremonyOutdoor(false)}>Indoor</button>
          <button type="button" style={wizToggleStyle(wiz_ceremonyOutdoor)} onClick={() => setWiz_ceremonyOutdoor(true)}>Outdoor</button>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 13, color: "var(--wtb-text-muted)", marginBottom: 6, fontFamily: "'Jost', sans-serif" }}>Anticipated guest count</label>
        <input type="number" min={1} value={wiz_guestCount} onChange={(e) => setWiz_guestCount(e.target.value)} placeholder="e.g. 150" style={{ ...inputStyle, width: 120 }} />
        <p style={{ fontSize: 12, color: "var(--wtb-text-faint)", margin: "8px 0 0", fontFamily: "'Jost', sans-serif" }}>
          Guest count will be added to the ceremony event notes in your timeline
        </p>
      </div>

      <div>
        <label style={{ display: "block", fontSize: 13, color: "var(--wtb-text-muted)", marginBottom: 6, fontFamily: "'Jost', sans-serif" }}>Special notes for the photographer / videographer</label>
        <textarea
          value={wiz_ceremonyNotes}
          onChange={(e) => setWiz_ceremonyNotes(e.target.value)}
          placeholder="Unity candle, ring warming, cultural traditions, anything we should know about…"
          rows={3}
          style={{ width: "100%", padding: 10, border: "1px solid var(--wtb-border)", borderRadius: 6, fontSize: 14, boxSizing: "border-box", background: "var(--wtb-surface)", color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif", resize: "vertical" }}
        />
        <p style={{ fontSize: 12, color: "var(--wtb-text-faint)", margin: "8px 0 0", fontFamily: "'Jost', sans-serif" }}>
          Whatever you enter here will be added to the ceremony event notes in your timeline
        </p>
      </div>
    </div>,
    () => setWizardStep(4),
    () => setWizardStep(6)
  );
}

export { WizardStep5 };
