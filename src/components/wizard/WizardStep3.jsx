import React from "react";
import { GettingReadyBlock } from "./wizardShared";
import { TimePickerRow, YesNoToggle } from "./wizardShared";

function WizardStep3(props) {
  const {
    stepCard, wizSectionHeading, wizCheckRowStyle, wizToggleStyle, allWizLocations,
    brideLabel, groomLabel,
    wiz_brideReadyAddress, setWiz_brideReadyAddress, wiz_brideReadyStreet, setWiz_brideReadyStreet,
    wiz_groomReadyAddress, setWiz_groomReadyAddress, wiz_groomReadyStreet, setWiz_groomReadyStreet,
    wiz_distanceBetweenReady, setWiz_distanceBetweenReady,
    wiz_distanceBrideToCeremony, setWiz_distanceBrideToCeremony,
    wiz_distanceGroomToCeremony, setWiz_distanceGroomToCeremony,
    wiz_brideReadyAtCeremony, setWiz_brideReadyAtCeremony,
    wiz_brideReadyAtReception, setWiz_brideReadyAtReception,
    wiz_groomReadyAtCeremony, setWiz_groomReadyAtCeremony,
    wiz_groomReadyAtReception, setWiz_groomReadyAtReception,
    wiz_groomReadyAtBride, setWiz_groomReadyAtBride,
    wiz_drone, setWiz_drone, wiz_narration, setWiz_narration,
    wiz_preCeremonyBrideReady, setWiz_preCeremonyBrideReady,
    wiz_preCeremonyGroomReady, setWiz_preCeremonyGroomReady,
    wiz_preCeremonyDetails, setWiz_preCeremonyDetails,
    wiz_preCeremonyBrideParty, setWiz_preCeremonyBrideParty,
    wiz_preCeremonyGroomParty, setWiz_preCeremonyGroomParty,
    wiz_preCeremonyDetailRings, setWiz_preCeremonyDetailRings,
    wiz_preCeremonyDetailDress, setWiz_preCeremonyDetailDress,
    wiz_preCeremonyDetailDrone, setWiz_preCeremonyDetailDrone,
    wiz_narrationBride, setWiz_narrationBride,
    wiz_narrationGroom, setWiz_narrationGroom,
    wiz_hasPreCeremonyHardStarts, setWiz_hasPreCeremonyHardStarts,
    wiz_preCeremonyHardStarts, setWiz_preCeremonyHardStarts,
    wiz_preCeremonyHardStartNextId, setWiz_preCeremonyHardStartNextId,
    setWizardStep,
  } = props;

  const mandatoryLocStyle = { border: "1px solid var(--wtb-border-subtle)", borderRadius: 8, padding: "14px 14px 12px", marginBottom: 16, background: "var(--wtb-surface-raised)" };
  const mandatoryLabelStyle = { display: "block", fontSize: 13, fontWeight: 300, color: "var(--wtb-text-muted)", marginBottom: 4, fontFamily: "'Jost', sans-serif" };
  const mandatoryInputStyle = { width: "100%", padding: 9, border: "1px solid var(--wtb-border)", borderRadius: 6, fontSize: 14, boxSizing: "border-box", background: "var(--wtb-surface)", color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" };

  const syncDetails = (rings, dress, drone) => {
    setWiz_preCeremonyDetails(rings || dress || (drone && wiz_drone));
  };
  const syncNarration = (b, g) => {
    setWiz_narration(b || g);
  };

  const checkRow = (label, sub, checked, onChange) => (
    <label style={{ ...wizCheckRowStyle }}>
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} style={{ width: 22, height: 22, marginTop: 2, cursor: "pointer", flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: 15, fontWeight: 400, color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" }}>{label}</div>
        {sub && <div style={{ fontSize: 13, color: "var(--wtb-text-muted)", marginTop: 2 }}>{sub}</div>}
      </div>
    </label>
  );

  return stepCard(
    "Before the Ceremony",
    "Getting ready, package coverage, and anything with a fixed start time before the ceremony.",
    <div>
      {wizSectionHeading("Getting Ready")}
      <p style={{ fontSize: 13, color: "var(--wtb-text-muted)", margin: "0 0 12px", fontFamily: "'Jost', sans-serif" }}>
        Where will each person be getting ready?
      </p>
      <p style={{ fontSize: 12, color: "var(--wtb-text-faint)", margin: "0 0 8px", fontFamily: "'Jost', sans-serif" }}>{brideLabel}</p>
      <GettingReadyBlock
        personLabel={brideLabel}
        atCeremony={wiz_brideReadyAtCeremony}
        setAtCeremony={setWiz_brideReadyAtCeremony}
        atReception={wiz_brideReadyAtReception}
        setAtReception={setWiz_brideReadyAtReception}
        venueName={wiz_brideReadyAddress}
        setVenueName={setWiz_brideReadyAddress}
        street={wiz_brideReadyStreet}
        setStreet={setWiz_brideReadyStreet}
        travelToCeremony={wiz_distanceBrideToCeremony}
        setTravelToCeremony={setWiz_distanceBrideToCeremony}
        allWizLocations={allWizLocations}
        mandatoryLocStyle={mandatoryLocStyle}
        mandatoryLabelStyle={mandatoryLabelStyle}
        mandatoryInputStyle={mandatoryInputStyle}
      />
      <p style={{ fontSize: 12, color: "var(--wtb-text-faint)", margin: "16px 0 8px", fontFamily: "'Jost', sans-serif" }}>{groomLabel}</p>
      <GettingReadyBlock
        personLabel={groomLabel}
        atCeremony={wiz_groomReadyAtCeremony}
        setAtCeremony={setWiz_groomReadyAtCeremony}
        atReception={wiz_groomReadyAtReception}
        setAtReception={setWiz_groomReadyAtReception}
        atPartner={wiz_groomReadyAtBride}
        setAtPartner={setWiz_groomReadyAtBride}
        partnerLabel={brideLabel}
        venueName={wiz_groomReadyAddress}
        setVenueName={setWiz_groomReadyAddress}
        street={wiz_groomReadyStreet}
        setStreet={setWiz_groomReadyStreet}
        travelToCeremony={wiz_distanceGroomToCeremony}
        setTravelToCeremony={setWiz_distanceGroomToCeremony}
        travelBetweenReady={wiz_distanceBetweenReady}
        setTravelBetweenReady={setWiz_distanceBetweenReady}
        showBetweenTravel={!wiz_groomReadyAtBride && !wiz_groomReadyAtCeremony && !wiz_groomReadyAtReception}
        allWizLocations={allWizLocations}
        mandatoryLocStyle={mandatoryLocStyle}
        mandatoryLabelStyle={mandatoryLabelStyle}
        mandatoryInputStyle={mandatoryInputStyle}
      />

      {wizSectionHeading("What's Included in Your Package")}
      <p style={{ fontSize: 13, color: "var(--wtb-text-muted)", margin: "0 0 12px", fontFamily: "'Jost', sans-serif" }}>
        Only check services included in your booked package.
      </p>
      {checkRow("Drone coverage", "Aerial footage and venue exterior shots", wiz_drone, setWiz_drone)}
      {checkRow("Narration recording", "Separate narration sessions for each person", wiz_narration, (v) => {
        setWiz_narration(v);
        if (!v) { setWiz_narrationBride(false); setWiz_narrationGroom(false); }
      })}

      {wizSectionHeading("Pre-Ceremony Coverage")}
      <p style={{ fontSize: 13, color: "var(--wtb-text-muted)", margin: "0 0 12px", fontFamily: "'Jost', sans-serif" }}>
        Standard blocks included in your timeline. Uncheck anything you do not need.
      </p>
      <p style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--wtb-accent)", margin: "8px 0 6px", fontFamily: "'Jost', sans-serif" }}>Getting Ready Coverage</p>
      {checkRow(`${brideLabel} getting ready coverage`, null, wiz_preCeremonyBrideReady, setWiz_preCeremonyBrideReady)}
      {checkRow(`${groomLabel} getting ready coverage`, null, wiz_preCeremonyGroomReady, setWiz_preCeremonyGroomReady)}
      <p style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--wtb-accent)", margin: "16px 0 6px", fontFamily: "'Jost', sans-serif" }}>Detail Shots</p>
      {checkRow("Rings, Invitations & Accessories", null, wiz_preCeremonyDetailRings, (v) => { setWiz_preCeremonyDetailRings(v); syncDetails(v, wiz_preCeremonyDetailDress, wiz_preCeremonyDetailDrone); })}
      {checkRow("Dress Shots", null, wiz_preCeremonyDetailDress, (v) => { setWiz_preCeremonyDetailDress(v); syncDetails(wiz_preCeremonyDetailRings, v, wiz_preCeremonyDetailDrone); })}
      {wiz_drone && checkRow("Drone & Venue Shots", null, wiz_preCeremonyDetailDrone, (v) => { setWiz_preCeremonyDetailDrone(v); syncDetails(wiz_preCeremonyDetailRings, wiz_preCeremonyDetailDress, v); })}
      {wiz_narration && (
        <>
          <p style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--wtb-accent)", margin: "16px 0 6px", fontFamily: "'Jost', sans-serif" }}>Narration</p>
          {checkRow(`${brideLabel} narration recording`, null, wiz_narrationBride, (v) => { setWiz_narrationBride(v); syncNarration(v, wiz_narrationGroom); })}
          {checkRow(`${groomLabel} narration recording`, null, wiz_narrationGroom, (v) => { setWiz_narrationGroom(v); syncNarration(wiz_narrationBride, v); })}
        </>
      )}

      {wizSectionHeading("Hard Start Times Before the Ceremony")}
      <p style={{ fontSize: 13, color: "var(--wtb-text-muted)", margin: "0 0 10px", fontFamily: "'Jost', sans-serif" }}>
        Does anything before the ceremony have a fixed start time?
      </p>
      <YesNoToggle
        value={wiz_hasPreCeremonyHardStarts}
        wizToggleStyle={wizToggleStyle}
        onYes={() => setWiz_hasPreCeremonyHardStarts(true)}
        onNo={() => { setWiz_hasPreCeremonyHardStarts(false); setWiz_preCeremonyHardStarts([]); }}
      />
      {wiz_hasPreCeremonyHardStarts && (
        <div style={{ marginTop: 16 }}>
          {wiz_preCeremonyHardStarts.map((item, i) => (
            <div key={item.id} style={{ border: "1px solid var(--wtb-border-subtle)", borderRadius: 8, padding: 14, marginBottom: 10, background: "var(--wtb-surface)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "var(--wtb-text-muted)" }}>Fixed time {i + 1}</span>
                <button type="button" onClick={() => setWiz_preCeremonyHardStarts((prev) => prev.filter((_, idx) => idx !== i))} style={{ fontSize: 12, color: "var(--wtb-text-muted)", background: "none", border: "1px solid var(--wtb-border)", borderRadius: 4, padding: "2px 8px", cursor: "pointer" }}>Remove</button>
              </div>
              <input type="text" value={item.eventName} placeholder="Event name" onChange={(e) => setWiz_preCeremonyHardStarts((prev) => { const n = [...prev]; n[i] = { ...n[i], eventName: e.target.value }; return n; })} style={{ ...mandatoryInputStyle, marginBottom: 8 }} />
              <TimePickerRow hour={item.hour} minute={item.minute} period={item.period} onHour={(v) => setWiz_preCeremonyHardStarts((prev) => { const n = [...prev]; n[i] = { ...n[i], hour: v }; return n; })} onMinute={(v) => setWiz_preCeremonyHardStarts((prev) => { const n = [...prev]; n[i] = { ...n[i], minute: v }; return n; })} onPeriod={(v) => setWiz_preCeremonyHardStarts((prev) => { const n = [...prev]; n[i] = { ...n[i], period: v }; return n; })} />
              <label style={{ ...mandatoryLabelStyle, marginTop: 8 }}>Duration (minutes)</label>
              <input type="number" min={5} step={5} value={item.duration} onChange={(e) => setWiz_preCeremonyHardStarts((prev) => { const n = [...prev]; n[i] = { ...n[i], duration: parseInt(e.target.value, 10) || 15 }; return n; })} style={{ ...mandatoryInputStyle, width: 100 }} />
            </div>
          ))}
          <button type="button" onClick={() => { setWiz_preCeremonyHardStarts((prev) => [...prev, { id: wiz_preCeremonyHardStartNextId, eventName: "", hour: "12", minute: "00", period: "PM", duration: 30 }]); setWiz_preCeremonyHardStartNextId((n) => n + 1); }} style={{ padding: "9px 18px", background: "var(--wtb-surface-raised)", color: "var(--wtb-accent)", border: "1px solid var(--wtb-accent)", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "'Jost', sans-serif" }}>
            + Add Hard Start Time
          </button>
        </div>
      )}
      <p style={{ fontSize: 12, color: "var(--wtb-text-faint)", marginTop: 12, fontStyle: "italic", fontFamily: "'Jost', sans-serif" }}>
        For example: hair and makeup artist arrival, venue access time, or a scheduled vendor.
      </p>
    </div>,
    () => setWizardStep(2),
    () => setWizardStep(4)
  );
}

export { WizardStep3 };
