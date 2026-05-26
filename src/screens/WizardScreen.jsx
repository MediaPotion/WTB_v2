import React, { useLayoutEffect, useRef } from "react";
import { getEnteredLocationNames } from "../lib/wizardLocations";
import { WizardStep1 } from "../components/wizard/WizardStep1";
import { WizardStep2 } from "../components/wizard/WizardStep2";
import { WizardStep3 } from "../components/wizard/WizardStep3";
import { WizardStep4 } from "../components/wizard/WizardStep4";
import { WizardStep5 } from "../components/wizard/WizardStep5";
import { WizardStep6 } from "../components/wizard/WizardStep6";
import { WizardStep7 } from "../components/wizard/WizardStep7";
import { WizardConfirm } from "../components/wizard/WizardConfirm";
import { WizardLogisticsCheck } from "../components/wizard/WizardLogisticsCheck";

export const WIZARD_PROGRESS_STEPS = [1, 2, 3, 4, 5, 6, 7];
export const WIZARD_LOGISTICS_STEP = 8;
export const WIZARD_CONFIRM_STEP = 99;

function scrollWizardToTop(rootEl, inModal) {
  window.scrollTo(0, 0);
  rootEl?.scrollIntoView({ block: "start", inline: "nearest" });
  if (!inModal || !rootEl) return;
  let parent = rootEl.parentElement;
  while (parent) {
    const { overflowY } = getComputedStyle(parent);
    if (overflowY === "auto" || overflowY === "scroll") {
      parent.scrollTop = 0;
    }
    parent = parent.parentElement;
  }
}

function WizardScreen(props) {
  const wizardRootRef = useRef(null);
  const { inModal = false, overrideStep = null, wizardStep } = props;
  const effectiveStep = overrideStep !== null ? overrideStep : wizardStep;

  useLayoutEffect(() => {
    scrollWizardToTop(wizardRootRef.current, inModal);
  }, [effectiveStep, inModal]);
  const totalWizardSteps = WIZARD_PROGRESS_STEPS.length;
  const progressIndex = WIZARD_PROGRESS_STEPS.indexOf(effectiveStep);
  const displayStep =
    effectiveStep === WIZARD_CONFIRM_STEP || effectiveStep === WIZARD_LOGISTICS_STEP
      ? totalWizardSteps
      : progressIndex >= 0
        ? progressIndex + 1
        : totalWizardSteps;

  const enteredLocationNames = getEnteredLocationNames(props);

  const wizToggleStyle = (selected) => ({
    padding: "12px 24px",
    borderRadius: 8,
    border: selected ? "1px solid var(--wtb-accent)" : "1px solid var(--wtb-border)",
    background: selected ? "rgba(184,144,106,0.15)" : "var(--wtb-surface)",
    color: selected ? "var(--wtb-accent)" : "var(--wtb-text-muted)",
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
    border: "1px solid var(--wtb-border-subtle)",
    background: "var(--wtb-surface)",
    cursor: "pointer",
    marginBottom: 10,
    transition: "border-color 0.2s",
    minHeight: 44,
  };

  const wizSectionHeading = (text) => (
    <div style={{ fontFamily: "'Jost', sans-serif", fontSize: 11, fontWeight: 300, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--wtb-accent)", margin: "20px 0 10px" }}>{text}</div>
  );

  const stepCard = (title, subtitle, content, backFn, nextFn, nextLabel = "Next") => {
    if (inModal) {
      return (
        <div style={{ paddingBottom: 8 }}>
          {subtitle && <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--wtb-text-muted)", fontFamily: "'Jost', sans-serif", lineHeight: 1.5 }}>{subtitle}</p>}
          {content}
        </div>
      );
    }
    return (
      <div className="wiz-layout" style={{ padding: "16px 0", background: "var(--wtb-bg)", minHeight: "100vh", fontFamily: "'Jost', sans-serif", color: "var(--wtb-text)" }}>
        <div className="wiz-step-col">
          <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 16px 40px" }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--wtb-text-muted)", marginBottom: 6, fontFamily: "'Jost', sans-serif", letterSpacing: "0.1em" }}>
                <span>Step {displayStep} of {totalWizardSteps}</span>
              </div>
              <div style={{ height: 3, background: "var(--wtb-surface-raised)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(displayStep / totalWizardSteps) * 100}%`, background: "linear-gradient(90deg, var(--wtb-accent), #cfa882)", borderRadius: 2, transition: "width 0.3s ease" }} />
              </div>
            </div>
            <div style={{ background: "var(--wtb-surface)", border: "1px solid var(--wtb-border-subtle)", borderRadius: 12, padding: "24px 20px", marginBottom: 20 }}>
              <h2 style={{ margin: "0 0 8px 0", fontSize: "clamp(22px,4vw,32px)", color: "var(--wtb-text)", fontWeight: 400, fontFamily: "'Cormorant Garamond', serif" }}>{title}</h2>
              {subtitle && <p style={{ margin: "0 0 24px 0", fontSize: 14, color: "var(--wtb-text-muted)", lineHeight: 1.5, fontFamily: "'Jost', sans-serif", fontWeight: 300 }}>{subtitle}</p>}
              {content}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <button type="button" onClick={backFn} style={{ padding: "12px 28px", border: "1px solid var(--wtb-accent)", borderRadius: 8, background: "transparent", color: "var(--wtb-text)", fontSize: 15, cursor: "pointer", fontFamily: "'Jost', sans-serif", fontWeight: 300 }}>Back</button>
              <button type="button" onClick={nextFn} style={{ padding: "12px 32px", background: "var(--wtb-accent)", color: "var(--wtb-on-accent)", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 400, cursor: "pointer", fontFamily: "'Jost', sans-serif" }}>{nextLabel}</button>
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
    enteredLocationNames,
    wizToggleStyle,
    wizCheckRowStyle,
    wizSectionHeading,
    stepCard,
  };

  let stepContent = null;
  if (effectiveStep === 1) stepContent = <WizardStep1 {...stepProps} />;
  else if (effectiveStep === 2) stepContent = <WizardStep2 {...stepProps} />;
  else if (effectiveStep === 3) stepContent = <WizardStep3 {...stepProps} />;
  else if (effectiveStep === 4) stepContent = <WizardStep4 {...stepProps} />;
  else if (effectiveStep === 5) stepContent = <WizardStep5 {...stepProps} />;
  else if (effectiveStep === 6) stepContent = <WizardStep6 {...stepProps} />;
  else if (effectiveStep === 7) stepContent = <WizardStep7 {...stepProps} />;
  else if (effectiveStep === WIZARD_LOGISTICS_STEP) {
    stepContent = <WizardLogisticsCheck {...stepProps} />;
  } else if (effectiveStep === WIZARD_CONFIRM_STEP) {
    stepContent = <WizardConfirm {...stepProps} />;
  }

  return (
    <div ref={wizardRootRef} className="wtb-wizard-root" data-wizard-step={effectiveStep}>
      {stepContent}
    </div>
  );
}

function renderWizard(props) {
  return <WizardScreen {...props} />;
}

export { renderWizard, WizardScreen };
