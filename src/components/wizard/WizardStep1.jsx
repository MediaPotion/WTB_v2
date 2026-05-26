import React from "react";

function WizardStep1(props) {
  const {
    stepCard,
    date, setDate,
    bride, setBride, groom, setGroom,
    brideLabel, setBrideLabel, groomLabel, setGroomLabel,
    wiz_photoCoverageHours, setWiz_photoCoverageHours,
    wiz_videoCoverageHours, setWiz_videoCoverageHours,
    setWizardStep, setScreen,
  } = props;

  return stepCard(
    "The Couple",
    "Tell us about the couple and your coverage hours for the day.",
    <div>
      <div style={{ marginBottom: 28, textAlign: "center" }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "var(--wtb-text-muted)", marginBottom: 8, fontFamily: "'Jost', sans-serif" }}>
          Wedding Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ padding: 12, border: "1px solid var(--wtb-border)", borderRadius: 6, fontSize: 16, background: "var(--wtb-surface)", color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "var(--wtb-text-muted)", marginBottom: 6, fontFamily: "'Jost', sans-serif" }}>
          Person 1 title
        </label>
        <select
          value={brideLabel}
          onChange={(e) => setBrideLabel(e.target.value)}
          style={{ width: "100%", padding: 10, border: "1px solid var(--wtb-border)", borderRadius: 6, fontSize: 15, background: "var(--wtb-surface)", color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" }}
        >
          <option value="Bride">Bride</option>
          <option value="Partner 1">Partner 1</option>
        </select>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "var(--wtb-text-muted)", marginBottom: 6, fontFamily: "'Jost', sans-serif" }}>
          Person 1 name
        </label>
        <input
          type="text"
          value={bride}
          onChange={(e) => setBride(e.target.value)}
          placeholder="Full name"
          style={{ width: "100%", padding: 10, border: "1px solid var(--wtb-border)", borderRadius: 6, fontSize: 15, boxSizing: "border-box", background: "var(--wtb-surface)", color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "var(--wtb-text-muted)", marginBottom: 6, fontFamily: "'Jost', sans-serif" }}>
          Person 2 title
        </label>
        <select
          value={groomLabel}
          onChange={(e) => setGroomLabel(e.target.value)}
          style={{ width: "100%", padding: 10, border: "1px solid var(--wtb-border)", borderRadius: 6, fontSize: 15, background: "var(--wtb-surface)", color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" }}
        >
          <option value="Groom">Groom</option>
          <option value="Partner 2">Partner 2</option>
        </select>
      </div>
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "var(--wtb-text-muted)", marginBottom: 6, fontFamily: "'Jost', sans-serif" }}>
          Person 2 name
        </label>
        <input
          type="text"
          value={groom}
          onChange={(e) => setGroom(e.target.value)}
          placeholder="Full name"
          style={{ width: "100%", padding: 10, border: "1px solid var(--wtb-border)", borderRadius: 6, fontSize: 15, boxSizing: "border-box", background: "var(--wtb-surface)", color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" }}
        />
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "var(--wtb-text-muted)", marginBottom: 6, fontFamily: "'Jost', sans-serif" }}>
            Photo coverage (hours)
          </label>
          <input
            type="number"
            value={wiz_photoCoverageHours}
            onChange={(e) => setWiz_photoCoverageHours(e.target.value)}
            placeholder="e.g. 8"
            min={1}
            max={24}
            style={{ width: "100%", padding: 10, border: "1px solid var(--wtb-border)", borderRadius: 6, fontSize: 15, boxSizing: "border-box", background: "var(--wtb-surface)", color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "var(--wtb-text-muted)", marginBottom: 6, fontFamily: "'Jost', sans-serif" }}>
            Video coverage (hours)
          </label>
          <input
            type="number"
            value={wiz_videoCoverageHours}
            onChange={(e) => setWiz_videoCoverageHours(e.target.value)}
            placeholder="e.g. 8"
            min={1}
            max={24}
            style={{ width: "100%", padding: 10, border: "1px solid var(--wtb-border)", borderRadius: 6, fontSize: 15, boxSizing: "border-box", background: "var(--wtb-surface)", color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" }}
          />
        </div>
      </div>
    </div>,
    () => setScreen("welcome"),
    () => setWizardStep(2)
  );
}

export { WizardStep1 };
