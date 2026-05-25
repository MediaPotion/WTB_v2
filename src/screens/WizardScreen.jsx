import React from "react";
import { WizardStep1 } from "../components/wizard/WizardStep1";
import { WizardStep2 } from "../components/wizard/WizardStep2";
import { WizardStep3 } from "../components/wizard/WizardStep3";
import { WizardStep4 } from "../components/wizard/WizardStep4";
import { WizardStep5 } from "../components/wizard/WizardStep5";
import { WizardStep6 } from "../components/wizard/WizardStep6";
import { WizardStep7 } from "../components/wizard/WizardStep7";
import { WizardStep8 } from "../components/wizard/WizardStep8";
import { WizardConfirm } from "../components/wizard/WizardConfirm";

function renderWizard(props) {
  const { inModal = false, overrideStep = null, wizardStep } = props;
  const effectiveStep = overrideStep !== null ? overrideStep : wizardStep;
  const totalWizardSteps = 8;
  const displayStep = effectiveStep > 7 ? effectiveStep - 1 : effectiveStep;

  const allWizLocations = [
    ...(props.wiz_ceremonyVenue ? [props.wiz_ceremonyVenue] : []),
    ...(!props.wiz_receptionSameAsCeremony && props.wiz_receptionVenue ? [props.wiz_receptionVenue] : []),
    ...(!props.wiz_brideReadyAtCeremony && !props.wiz_brideReadyAtReception && props.wiz_brideReadyAddress ? [props.wiz_brideReadyAddress] : []),
    ...(!props.wiz_groomReadyAtCeremony && !props.wiz_groomReadyAtReception && !props.wiz_groomReadyAtBride && props.wiz_groomReadyAddress ? [props.wiz_groomReadyAddress] : []),
    ...props.wiz_locations.filter(l => l.name).map(l => l.name),
  ];

  const wizToggleStyle = (selected) => ({
    padding: "12px 24px",
    borderRadius: 8,
    border: selected ? "1px solid #b8906a" : "1px solid #2a2520",
    background: selected ? "rgba(184,144,106,0.15)" : "#0f0d0b",
    color: selected ? "#b8906a" : "#6e6358",
    fontFamily: "'Jost', sans-serif",
    fontWeight: selected ? 400 : 300,
    fontSize: 15,
    cursor: "pointer",
    transition: "all 0.2s",
    minWidth: 80,
    minHeight: 44,
  });

  const wizCheckRowStyle = {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    padding: "14px 16px",
    borderRadius: 8,
    border: "1px solid #1e1c19",
    background: "#0f0d0b",
    cursor: "pointer",
    marginBottom: 10,
    transition: "border-color 0.2s",
    minHeight: 44,
  };

  const wizSectionHeading = (text) => (
    <div style={{ fontFamily: "'Jost', sans-serif", fontSize: 11, fontWeight: 300, letterSpacing: "0.18em", textTransform: "uppercase", color: "#b8906a", margin: "20px 0 10px" }}>{text}</div>
  );

  const stepCard = (title, subtitle, content, backFn, nextFn, nextLabel = "Next") => {
    if (inModal) {
      return (
        <div style={{ paddingBottom: 8 }}>
          {subtitle && <p style={{ margin: "0 0 16px", fontSize: 13, color: "#6e6358", fontFamily: "'Jost', sans-serif", lineHeight: 1.5 }}>{subtitle}</p>}
          {content}
        </div>
      );
    }
    return (
      <div className="wiz-layout" style={{ padding: "16px 0", background: "#060504", minHeight: "100vh", fontFamily: "'Jost', sans-serif" }}>
        <div className="wiz-step-col">
          <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 16px 40px" }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6e6358", marginBottom: 6, fontFamily: "'Jost', sans-serif", letterSpacing: "0.1em" }}>
                <span>Step {displayStep} of {totalWizardSteps}</span>
              </div>
              <div style={{ height: 3, background: "#161310", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(displayStep / totalWizardSteps) * 100}%`, background: "linear-gradient(90deg, #b8906a, #cfa882)", borderRadius: 2, transition: "width 0.3s ease" }} />
              </div>
            </div>
            <div style={{ background: "#0f0d0b", border: "1px solid #1e1c19", borderRadius: 12, padding: "24px 20px", marginBottom: 20 }}>
              <h2 style={{ margin: "0 0 8px 0", fontSize: "clamp(22px,4vw,32px)", color: "#ddd0bc", fontWeight: 400, fontFamily: "'Cormorant Garamond', serif" }}>{title}</h2>
              <p style={{ margin: "0 0 24px 0", fontSize: 14, color: "#6e6358", lineHeight: 1.5, fontFamily: "'Jost', sans-serif", fontWeight: 300 }}>{subtitle}</p>
              {content}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <button onClick={backFn} style={{ padding: "12px 28px", border: "1px solid #b8906a", borderRadius: 8, background: "transparent", color: "#ddd0bc", fontSize: 15, cursor: "pointer", fontFamily: "'Jost', sans-serif", fontWeight: 300, transition: "all 0.2s" }}>Back</button>
              <button onClick={nextFn} style={{ padding: "12px 32px", background: "#b8906a", color: "#060504", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 400, cursor: "pointer", fontFamily: "'Jost', sans-serif" }}>{nextLabel}</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const stepProps = {
    ...props,
    inModal,
    effectiveStep,
    totalWizardSteps,
    displayStep,
    allWizLocations,
    wizToggleStyle,
    wizCheckRowStyle,
    wizSectionHeading,
    stepCard,
  };

  if (effectiveStep === 2) return <WizardStep2 {...stepProps} />;
  if (effectiveStep === 1) return <WizardStep1 {...stepProps} />;
  if (effectiveStep === 3) return <WizardStep3 {...stepProps} />;
  if (effectiveStep === 4) return <WizardStep4 {...stepProps} />;
  if (effectiveStep === 5) return <WizardStep5 {...stepProps} />;
  if (effectiveStep === 6) return <WizardStep6 {...stepProps} />;
  if (effectiveStep === 8) return <WizardStep7 {...stepProps} />;
  if (effectiveStep === 9) return <WizardStep8 {...stepProps} />;
  if (effectiveStep === 99) return <WizardConfirm {...stepProps} />;
  return null;
}

export { renderWizard };
