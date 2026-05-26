import React from "react";
import { FlexibilitySelector, TimePickerRow } from "./wizardShared";

function WizardStep4(props) {
  const {
    stepCard, wizSectionHeading, wizToggleStyle, allWizLocations,
    wiz_ceremonyHour, setWiz_ceremonyHour, wiz_ceremonyMinute, setWiz_ceremonyMinute, wiz_ceremonyPeriod, setWiz_ceremonyPeriod,
    wiz_ceremonyFlexibility, setWiz_ceremonyFlexibility,
    wiz_ceremonyDuration, setWiz_ceremonyDuration,
    wiz_ceremonyType, setWiz_ceremonyType,
    wiz_ceremonyOtherDuration, setWiz_ceremonyOtherDuration,
    wiz_ceremonyVenue, setWiz_ceremonyVenue,
    wiz_ceremonyOutdoor, setWiz_ceremonyOutdoor,
    wiz_guestCount, setWiz_guestCount,
    wiz_ceremonyNotes, setWiz_ceremonyNotes,
    setWizardStep,
  } = props;

  const inputStyle = { padding: 10, border: "1px solid var(--wtb-border)", borderRadius: 6, fontSize: 15, background: "var(--wtb-surface)", color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" };

  return stepCard(
    "The Ceremony",
    "When and where the ceremony takes place.",
    <div>
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "var(--wtb-text-muted)", marginBottom: 8, fontFamily: "'Jost', sans-serif" }}>
          Ceremony start time
        </label>
        <TimePickerRow
          hour={wiz_ceremonyHour}
          minute={wiz_ceremonyMinute}
          period={wiz_ceremonyPeriod}
          onHour={setWiz_ceremonyHour}
          onMinute={setWiz_ceremonyMinute}
          onPeriod={setWiz_ceremonyPeriod}
        />
        <FlexibilitySelector value={wiz_ceremonyFlexibility} onChange={setWiz_ceremonyFlexibility} />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "var(--wtb-text-muted)", marginBottom: 8, fontFamily: "'Jost', sans-serif" }}>
          Ceremony type
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {[
            { key: "average", label: "Average" },
            { key: "catholic", label: "Catholic" },
            { key: "other", label: "Other" },
          ].map((t) => (
            <button key={t.key} type="button" style={wizToggleStyle(wiz_ceremonyType === t.key)} onClick={() => setWiz_ceremonyType(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
        {wiz_ceremonyType === "average" && (
          <div>
            <label style={{ display: "block", fontSize: 13, color: "var(--wtb-text-muted)", marginBottom: 6, fontFamily: "'Jost', sans-serif" }}>Duration (minutes)</label>
            <input type="number" min={5} step={5} max={45} value={wiz_ceremonyDuration} onChange={(e) => setWiz_ceremonyDuration(parseInt(e.target.value, 10) || 30)} style={{ ...inputStyle, width: 100 }} />
          </div>
        )}
        {wiz_ceremonyType === "catholic" && (
          <p style={{ fontSize: 13, color: "var(--wtb-text-muted)", margin: 0, fontFamily: "'Jost', sans-serif" }}>Typically 60+ minutes — adjust duration if needed below.</p>
        )}
        {wiz_ceremonyType === "catholic" && (
          <input type="number" min={46} step={5} value={wiz_ceremonyDuration} onChange={(e) => setWiz_ceremonyDuration(parseInt(e.target.value, 10) || 60)} style={{ ...inputStyle, width: 100, marginTop: 8 }} />
        )}
        {wiz_ceremonyType === "other" && (
          <div>
            <label style={{ display: "block", fontSize: 13, color: "var(--wtb-text-muted)", marginBottom: 6, fontFamily: "'Jost', sans-serif" }}>Duration (minutes)</label>
            <input type="number" min={5} step={5} value={wiz_ceremonyOtherDuration} onChange={(e) => setWiz_ceremonyOtherDuration(parseInt(e.target.value, 10) || 30)} style={{ ...inputStyle, width: 100 }} />
          </div>
        )}
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "var(--wtb-text-muted)", marginBottom: 6, fontFamily: "'Jost', sans-serif" }}>
          Ceremony venue
        </label>
        <select value={wiz_ceremonyVenue} onChange={(e) => setWiz_ceremonyVenue(e.target.value)} style={{ width: "100%", padding: 10, border: "1px solid var(--wtb-border)", borderRadius: 6, fontSize: 15, background: "var(--wtb-surface)", color: "var(--wtb-text)" }}>
          <option value="">Select ceremony location…</option>
          {allWizLocations.map((name, i) => (
            <option key={i} value={name}>{name}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "var(--wtb-text-muted)", marginBottom: 8, fontFamily: "'Jost', sans-serif" }}>Setting</label>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" style={wizToggleStyle(!wiz_ceremonyOutdoor)} onClick={() => setWiz_ceremonyOutdoor(false)}>Indoor</button>
          <button type="button" style={wizToggleStyle(wiz_ceremonyOutdoor)} onClick={() => setWiz_ceremonyOutdoor(true)}>Outdoor</button>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "var(--wtb-text-muted)", marginBottom: 6, fontFamily: "'Jost', sans-serif" }}>Guest count</label>
        <input type="number" min={1} value={wiz_guestCount} onChange={(e) => setWiz_guestCount(e.target.value)} placeholder="e.g. 150" style={{ ...inputStyle, width: 120 }} />
      </div>

      <div>
        <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "var(--wtb-text-muted)", marginBottom: 6, fontFamily: "'Jost', sans-serif" }}>
          Special notes for photographer / videographer
        </label>
        <textarea
          value={wiz_ceremonyNotes}
          onChange={(e) => setWiz_ceremonyNotes(e.target.value)}
          placeholder="Unity candle, ring warming, cultural traditions…"
          rows={3}
          style={{ width: "100%", padding: 10, border: "1px solid var(--wtb-border)", borderRadius: 6, fontSize: 14, boxSizing: "border-box", background: "var(--wtb-surface)", color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif", resize: "vertical" }}
        />
      </div>
    </div>,
    () => setWizardStep(3),
    () => setWizardStep(5)
  );
}

export { WizardStep4 };
