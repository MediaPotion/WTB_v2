import React from "react";
import mediaPotionLogo from "../assets/mediapotion_logo.png";

function WelcomeScreen({ showAutosaveBanner, restoreAutosave, clearAutosave, setWizardStep, setScreen, loadProject }) {
  return (
    <div className="wtb-welcome-screen">
      <div style={{ textAlign: "center", maxWidth: 500, width: "100%" }}>
        {showAutosaveBanner && (
          <div style={{ marginBottom: 24, padding: "14px 16px", background: "var(--wtb-surface-raised)", border: "1px solid var(--wtb-accent)", borderRadius: 8, textAlign: "left" }}>
            <p style={{ margin: "0 0 12px 0", fontSize: 14, color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif", fontWeight: 300, lineHeight: 1.5 }}>
              You have an unsaved timeline from your last session. Would you like to restore it?
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={restoreAutosave}
                style={{ padding: "8px 16px", background: "var(--wtb-accent)", color: "var(--wtb-on-accent)", border: "none", borderRadius: 6, fontSize: 13, cursor: "pointer", fontFamily: "'Jost', sans-serif", fontWeight: 300 }}
              >
                Restore Timeline
              </button>
              <button
                onClick={clearAutosave}
                style={{ padding: "8px 16px", background: "transparent", color: "var(--wtb-text-muted)", border: "1px solid var(--wtb-border)", borderRadius: 6, fontSize: 13, cursor: "pointer", fontFamily: "'Jost', sans-serif", fontWeight: 300 }}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
        <h1 className="welcome-fade-up" style={{ fontSize: "clamp(36px,6vw,72px)", fontWeight: 300, color: "var(--wtb-text)", margin: "0 0 8px 0", fontFamily: "'Cormorant Garamond', serif", letterSpacing: "0.05em" }}>
          Wedding Timeline Builder
        </h1>
        <div className="welcome-fade-up" style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 48 }}>
          <button
            onClick={() => { setWizardStep(1); setScreen("wizard"); }}
            style={{ padding: "18px 32px", backgroundColor: "var(--wtb-accent)", color: "var(--wtb-on-accent)", border: "none", borderRadius: 8, fontSize: 18, fontWeight: 300, cursor: "pointer", width: "100%", fontFamily: "'Jost', sans-serif", letterSpacing: "0.05em" }}
          >
            Create New Timeline
          </button>

          <label
            style={{ padding: "16px 32px", background: "transparent", color: "var(--wtb-accent)", border: "1px solid var(--wtb-accent)", borderRadius: 8, fontSize: 16, fontWeight: 300, cursor: "pointer", width: "100%", boxSizing: "border-box", textAlign: "center", fontFamily: "'Jost', sans-serif" }}
          >
            Load Existing Timeline
            <input type="file" accept=".json" onChange={loadProject} style={{ display: "none" }} />
          </label>
        </div>

        <div style={{ marginTop: 48, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "var(--wtb-text-muted)", fontFamily: "'Jost', sans-serif", fontWeight: 200, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>by</div>
          <img src={mediaPotionLogo} alt="Media Potion" style={{ width: 180, display: "block", margin: "0 auto 6px" }} />
          <div style={{ fontSize: 11, color: "var(--wtb-text-muted)", fontFamily: "'Jost', sans-serif", fontWeight: 200 }}>
            © {new Date().getFullYear()} Media Potion. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}

export { WelcomeScreen };
