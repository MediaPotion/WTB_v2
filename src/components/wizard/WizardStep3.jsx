import React from "react";
import { TimePickerRow } from "./wizardShared";
import { isWizardCoverageHoursSpecified } from "../../lib/coverageStartBlocks";

function WizardStep3(props) {
  const {
    stepCard, wizSectionHeading, wizCheckRowStyle,
    wiz_photographerCount, setWiz_photographerCount,
    wiz_videographerCount, setWiz_videographerCount,
    wiz_photoCoverageHours, setWiz_photoCoverageHours,
    wiz_videoCoverageHours, setWiz_videoCoverageHours,
    photoStartHour, setPhotoStartHour,
    photoStartMinute, setPhotoStartMinute,
    photoStartPeriod, setPhotoStartPeriod,
    videoStartHour, setVideoStartHour,
    videoStartMinute, setVideoStartMinute,
    videoStartPeriod, setVideoStartPeriod,
    wiz_drone, setWiz_drone, wiz_narration, setWiz_narration,
    setWiz_narrationBride, setWiz_narrationGroom,
    setWizardStep,
  } = props;

  const showPhotoStart =
    isWizardCoverageHoursSpecified(wiz_photoCoverageHours) || wiz_photographerCount >= 1;
  const showVideoStart =
    isWizardCoverageHoursSpecified(wiz_videoCoverageHours) || wiz_videographerCount > 0;

  const numStyle = { width: "100%", padding: 10, border: "1px solid var(--wtb-border)", borderRadius: 6, fontSize: 15, boxSizing: "border-box", background: "var(--wtb-surface)", color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" };

  const checkRow = (label, sub, checked, onChange) => (
    <label style={{ ...wizCheckRowStyle }}>
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} style={{ width: 22, height: 22, marginTop: 2, cursor: "pointer", flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: 15, color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" }}>{label}</div>
        {sub && <div style={{ fontSize: 13, color: "var(--wtb-text-muted)", marginTop: 2 }}>{sub}</div>}
      </div>
    </label>
  );

  return stepCard(
    "Coverage & Package",
    "Tell us about your coverage and what services are included in your package.",
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontSize: 13, color: "var(--wtb-text-muted)", marginBottom: 6, fontFamily: "'Jost', sans-serif" }}>How many photographers are in your package?</label>
          <input type="number" min={1} value={wiz_photographerCount} onChange={(e) => setWiz_photographerCount(Math.max(1, parseInt(e.target.value, 10) || 1))} style={numStyle} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontSize: 13, color: "var(--wtb-text-muted)", marginBottom: 6, fontFamily: "'Jost', sans-serif" }}>How many videographers are in your package?</label>
          <input type="number" min={0} value={wiz_videographerCount} onChange={(e) => setWiz_videographerCount(Math.max(0, parseInt(e.target.value, 10) || 0))} style={numStyle} />
          <p style={{ fontSize: 12, color: "var(--wtb-text-faint)", margin: "6px 0 0", fontFamily: "'Jost', sans-serif" }}>Enter 0 if video is not included</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontSize: 13, color: "var(--wtb-text-muted)", marginBottom: 6, fontFamily: "'Jost', sans-serif" }}>How many hours of photo coverage?</label>
          <input type="number" min={1} max={24} value={wiz_photoCoverageHours} onChange={(e) => setWiz_photoCoverageHours(e.target.value)} placeholder="e.g. 8" style={numStyle} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontSize: 13, color: "var(--wtb-text-muted)", marginBottom: 6, fontFamily: "'Jost', sans-serif" }}>How many hours of video coverage?</label>
          <input type="number" min={0} max={24} value={wiz_videoCoverageHours} onChange={(e) => setWiz_videoCoverageHours(e.target.value)} placeholder="e.g. 8" style={numStyle} />
          <p style={{ fontSize: 12, color: "var(--wtb-text-faint)", margin: "6px 0 0", fontFamily: "'Jost', sans-serif" }}>Enter 0 if video is not included</p>
        </div>
      </div>

      {showPhotoStart && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, color: "var(--wtb-text-muted)", marginBottom: 8, fontFamily: "'Jost', sans-serif" }}>
            When should the photographer start shooting?
          </label>
          <TimePickerRow
            hour={photoStartHour}
            minute={photoStartMinute}
            period={photoStartPeriod}
            onHour={setPhotoStartHour}
            onMinute={setPhotoStartMinute}
            onPeriod={setPhotoStartPeriod}
          />
        </div>
      )}

      {showVideoStart && (
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 13, color: "var(--wtb-text-muted)", marginBottom: 8, fontFamily: "'Jost', sans-serif" }}>
            When should the videographer start shooting?
          </label>
          <TimePickerRow
            hour={videoStartHour}
            minute={videoStartMinute}
            period={videoStartPeriod}
            onHour={setVideoStartHour}
            onMinute={setVideoStartMinute}
            onPeriod={setVideoStartPeriod}
          />
        </div>
      )}

      {wizSectionHeading("What is included in your package?")}
      <p style={{ fontSize: 13, color: "var(--wtb-text-muted)", margin: "0 0 12px", fontFamily: "'Jost', sans-serif" }}>
        Only check services that are part of your booked package
      </p>
      {checkRow("Drone coverage", "Aerial footage and venue exterior shots", wiz_drone, setWiz_drone)}
      {checkRow("Narration recording", "Separate recorded narration sessions for each person", wiz_narration, (v) => {
        setWiz_narration(v);
        if (!v) { setWiz_narrationBride(false); setWiz_narrationGroom(false); }
      })}
    </div>,
    () => setWizardStep(2),
    () => setWizardStep(4)
  );
}

export { WizardStep3 };
