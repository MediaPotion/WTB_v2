import React from "react";

function WizardStep1(props) {
  const {
    stepCard,
    date, setDate,
    bride, setBride, groom, setGroom,
    brideLabel, setBrideLabel, groomLabel, setGroomLabel,
    setWizardStep, setScreen,
  } = props;

  const isBrideGroom = brideLabel === "Bride" && groomLabel === "Groom";

  const setTitlePair = (pair) => {
    if (pair === "bride-groom") {
      setBrideLabel("Bride");
      setGroomLabel("Groom");
    } else {
      setBrideLabel("Partner 1");
      setGroomLabel("Partner 2");
    }
  };

  const pairBtn = (selected, label, pair) => (
    <button
      type="button"
      onClick={() => setTitlePair(pair)}
      style={{
        flex: 1,
        padding: "20px 16px",
        borderRadius: 10,
        border: selected ? "2px solid var(--wtb-accent)" : "1px solid var(--wtb-border)",
        background: selected ? "rgba(184,144,106,0.12)" : "var(--wtb-surface)",
        color: selected ? "var(--wtb-accent)" : "var(--wtb-text)",
        fontSize: 18,
        fontWeight: 400,
        cursor: "pointer",
        fontFamily: "'Cormorant Garamond', serif",
      }}
    >
      {label}
    </button>
  );

  const fieldStyle = { width: "100%", padding: 10, border: "1px solid var(--wtb-border)", borderRadius: 6, fontSize: 15, boxSizing: "border-box", background: "var(--wtb-surface)", color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" };

  return stepCard(
    "The Couple",
    "Let us start with the basics about your wedding day.",
    <div>
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "var(--wtb-text-muted)", marginBottom: 10, fontFamily: "'Jost', sans-serif" }}>
          Wedding date
        </label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ padding: 14, border: "1px solid var(--wtb-border)", borderRadius: 8, fontSize: 18, background: "var(--wtb-surface)", color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" }} />
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: "block", fontSize: 14, fontWeight: 300, color: "var(--wtb-text)", marginBottom: 10, fontFamily: "'Jost', sans-serif" }}>
          What titles would you like to use for the couple?
        </label>
        <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
          {pairBtn(isBrideGroom, "Bride & Groom", "bride-groom")}
          {pairBtn(!isBrideGroom, "Partner 1 & Partner 2", "partners")}
        </div>
        <p style={{ fontSize: 12, color: "var(--wtb-text-faint)", margin: 0, fontFamily: "'Jost', sans-serif" }}>
          These labels will be used throughout the entire wizard and timeline
        </p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 13, color: "var(--wtb-text-muted)", marginBottom: 6, fontFamily: "'Jost', sans-serif" }}>{brideLabel} name</label>
        <input type="text" value={bride} onChange={(e) => setBride(e.target.value)} placeholder="Full name" style={fieldStyle} />
      </div>
      <div>
        <label style={{ display: "block", fontSize: 13, color: "var(--wtb-text-muted)", marginBottom: 6, fontFamily: "'Jost', sans-serif" }}>{groomLabel} name</label>
        <input type="text" value={groom} onChange={(e) => setGroom(e.target.value)} placeholder="Full name" style={fieldStyle} />
      </div>
    </div>,
    () => setScreen("welcome"),
    () => setWizardStep(2)
  );
}

export { WizardStep1 };
