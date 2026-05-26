import React from "react";

function WizardStep3(props) {
  const {
    stepCard, wizSectionHeading, wizToggleStyle, wizCheckRowStyle, inModal, effectiveStep, displayStep, totalWizardSteps, allWizLocations,
    date, setDate, bride, setBride, groom, setGroom, brideLabel, setBrideLabel, groomLabel, setGroomLabel,
    wiz_locations, setWiz_locations, wiz_locationNextId, setWiz_locationNextId, addWizLocation, updateWizLocation, removeWizLocation,
    wiz_receptionVenue, setWiz_receptionVenue, wiz_receptionAddress, setWiz_receptionAddress, wiz_receptionSameAsCeremony, setWiz_receptionSameAsCeremony,
    wiz_ceremonyHour, setWiz_ceremonyHour, wiz_ceremonyMinute, setWiz_ceremonyMinute, wiz_ceremonyPeriod, setWiz_ceremonyPeriod,
    wiz_ceremonyDuration, setWiz_ceremonyDuration, wiz_ceremonyVenue, setWiz_ceremonyVenue, wiz_ceremonyAddress, setWiz_ceremonyAddress,
    wiz_guestCount, setWiz_guestCount, wiz_portraitLocations, setWiz_portraitLocations,
    wiz_brideReadyAddress, setWiz_brideReadyAddress, wiz_brideReadyStreet, setWiz_brideReadyStreet,
    wiz_groomReadyAddress, setWiz_groomReadyAddress, wiz_groomReadyStreet, setWiz_groomReadyStreet,
    wiz_distanceBetweenReady, setWiz_distanceBetweenReady, wiz_distanceBrideToCeremony, setWiz_distanceBrideToCeremony,
    wiz_distanceGroomToCeremony, setWiz_distanceGroomToCeremony, wiz_distanceReceptionToCeremony, setWiz_distanceReceptionToCeremony,
    wiz_sameLocation, setWiz_sameLocation, wiz_portraitsAtReadyLocations, setWiz_portraitsAtReadyLocations,
    wiz_bridePortraitsAtReadyLocation, setWiz_bridePortraitsAtReadyLocation, wiz_groomPortraitsAtReadyLocation, setWiz_groomPortraitsAtReadyLocation,
    wiz_hairMakeupDoneHour, setWiz_hairMakeupDoneHour, wiz_hairMakeupDoneMinute, setWiz_hairMakeupDoneMinute, wiz_hairMakeupDonePeriod, setWiz_hairMakeupDonePeriod,
    wiz_photoCoverageHours, setWiz_photoCoverageHours, wiz_videoCoverageHours, setWiz_videoCoverageHours, wiz_ceremonyOutdoor, setWiz_ceremonyOutdoor,
    wiz_photographerCount, setWiz_photographerCount, wiz_videographerCount, setWiz_videographerCount, wiz_drone, setWiz_drone, wiz_narration, setWiz_narration,
    wiz_hasFirstLooks, setWiz_hasFirstLooks, wiz_firstLookGroom, setWiz_firstLookGroom, wiz_firstLookParent, setWiz_firstLookParent,
    wiz_firstLookBridesmaids, setWiz_firstLookBridesmaids, wiz_firstLookOther, setWiz_firstLookOther,
    wiz_firstLookGroomLocation, setWiz_firstLookGroomLocation, wiz_firstLookParentLocation, setWiz_firstLookParentLocation,
    wiz_firstLookBridesmaidsLocation, setWiz_firstLookBridesmaidsLocation, wiz_firstLookOtherLocation, setWiz_firstLookOtherLocation,
    wiz_brideOkayBefore, setWiz_brideOkayBefore,
    wiz_receptionHour, setWiz_receptionHour, wiz_receptionMinute, setWiz_receptionMinute, wiz_receptionPeriod, setWiz_receptionPeriod,
    wiz_grandEntrance, setWiz_grandEntrance, wiz_cakeCutting, setWiz_cakeCutting, wiz_firstDance, setWiz_firstDance,
    wiz_brideParentDance, setWiz_brideParentDance, wiz_groomParentDance, setWiz_groomParentDance, wiz_specialDance, setWiz_specialDance,
    wiz_speeches, setWiz_speeches, wiz_speechCount, setWiz_speechCount, wiz_dinner, setWiz_dinner,
    wiz_dinnerStartHour, setWiz_dinnerStartHour, wiz_dinnerStartMinute, setWiz_dinnerStartMinute, wiz_dinnerStartPeriod, setWiz_dinnerStartPeriod,
    wiz_dinnerStyle, setWiz_dinnerStyle, wiz_openDanceFloor, setWiz_openDanceFloor, wiz_garterToss, setWiz_garterToss, wiz_bouquetToss, setWiz_bouquetToss,
    wiz_familyGroups, setWiz_familyGroups, wiz_familyGroupNames, setWiz_familyGroupNames,
    wiz_brideReadyAtCeremony, setWiz_brideReadyAtCeremony, wiz_brideReadyAtReception, setWiz_brideReadyAtReception,
    wiz_groomReadyAtCeremony, setWiz_groomReadyAtCeremony, wiz_groomReadyAtReception, setWiz_groomReadyAtReception, wiz_groomReadyAtBride, setWiz_groomReadyAtBride,
    wiz_preCeremonyBrideReady, setWiz_preCeremonyBrideReady, wiz_preCeremonyGroomReady, setWiz_preCeremonyGroomReady,
    wiz_preCeremonyDetails, setWiz_preCeremonyDetails, wiz_preCeremonyBrideParty, setWiz_preCeremonyBrideParty,
    wiz_preCeremonyGroomParty, setWiz_preCeremonyGroomParty, wiz_preCeremonyPreDress, setWiz_preCeremonyPreDress,
    wiz_ceremonyNotes, setWiz_ceremonyNotes, wiz_customFirstLooks, setWiz_customFirstLooks, wiz_customFirstLookNextId, setWiz_customFirstLookNextId,
    wiz_portraitSessions, setWiz_portraitSessions, wiz_portraitSessionNextId, setWiz_portraitSessionNextId,
    wiz_grandEntranceSub, setWiz_grandEntranceSub, wiz_customReceptionEvents, setWiz_customReceptionEvents, wiz_customReceptionEventNextId, setWiz_customReceptionEventNextId,
    setWizardStep, setScreen, generateTimeline, withThe,
  } = props;
      return stepCard(
        "What's Included in Your Package?",
        "Only check services that are part of your booked package.",
        <div>
          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "var(--wtb-text-muted)", marginBottom: 5, fontFamily: "'Jost', sans-serif" }}>Photo Coverage <span style={{ color: "var(--wtb-text-muted)" }}>(hours)</span></label>
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
              <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "var(--wtb-text-muted)", marginBottom: 5, fontFamily: "'Jost', sans-serif" }}>Video Coverage <span style={{ color: "var(--wtb-text-muted)" }}>(hours)</span></label>
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
          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "var(--wtb-text-muted)", marginBottom: 8, fontFamily: "'Jost', sans-serif" }}>Photographers</label>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button onClick={() => setWiz_photographerCount(Math.max(0, wiz_photographerCount - 1))} style={{ width: 32, height: 32, background: "var(--wtb-surface)", border: "1px solid var(--wtb-border)", borderRadius: 6, color: "var(--wtb-text)", fontSize: 18, lineHeight: 1, cursor: "pointer", flexShrink: 0 }}>−</button>
                <span style={{ minWidth: 28, textAlign: "center", fontSize: 16, color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" }}>{wiz_photographerCount}</span>
                <button onClick={() => setWiz_photographerCount(wiz_photographerCount + 1)} style={{ width: 32, height: 32, background: "var(--wtb-surface)", border: "1px solid var(--wtb-border)", borderRadius: 6, color: "var(--wtb-text)", fontSize: 18, lineHeight: 1, cursor: "pointer", flexShrink: 0 }}>+</button>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "var(--wtb-text-muted)", marginBottom: 8, fontFamily: "'Jost', sans-serif" }}>Videographers</label>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button onClick={() => setWiz_videographerCount(Math.max(0, wiz_videographerCount - 1))} style={{ width: 32, height: 32, background: "var(--wtb-surface)", border: "1px solid var(--wtb-border)", borderRadius: 6, color: "var(--wtb-text)", fontSize: 18, lineHeight: 1, cursor: "pointer", flexShrink: 0 }}>−</button>
                <span style={{ minWidth: 28, textAlign: "center", fontSize: 16, color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" }}>{wiz_videographerCount}</span>
                <button onClick={() => setWiz_videographerCount(wiz_videographerCount + 1)} style={{ width: 32, height: 32, background: "var(--wtb-surface)", border: "1px solid var(--wtb-border)", borderRadius: 6, color: "var(--wtb-text)", fontSize: 18, lineHeight: 1, cursor: "pointer", flexShrink: 0 }}>+</button>
              </div>
            </div>
          </div>
          <label style={{ ...wizCheckRowStyle }} onClick={() => setWiz_drone(!wiz_drone)}>
            <input type="checkbox" checked={wiz_drone} onChange={() => {}} style={{ width: 22, height: 22, marginTop: 2, cursor: "pointer", flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 400, color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" }}>Drone Coverage</div>
              <div style={{ fontSize: 13, color: "var(--wtb-text-muted)", marginTop: 2 }}>Aerial footage and venue exterior shots</div>
            </div>
          </label>
          <label style={{ ...wizCheckRowStyle }} onClick={() => setWiz_narration(!wiz_narration)}>
            <input type="checkbox" checked={wiz_narration} onChange={() => {}} style={{ width: 22, height: 22, marginTop: 2, cursor: "pointer", flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 400, color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" }}>Narration Recording</div>
              <div style={{ fontSize: 13, color: "var(--wtb-text-muted)", marginTop: 2 }}>Separate narration sessions for bride and groom</div>
            </div>
          </label>
        </div>,
        () => setWizardStep(2),
        () => setWizardStep(4)
      );
}

export { WizardStep3 };
