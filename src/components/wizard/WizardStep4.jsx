import React from "react";
import { SETTINGS_SELECT_STYLE, WIZ_INPUT_STYLE } from "../../constants/styles";

function WizardStep4(props) {
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
      const settingsSelectStyle = SETTINGS_SELECT_STYLE;
      const wizInputStyle = WIZ_INPUT_STYLE;
      const wizMinuteNote = <p style={{ fontSize: 12, color: "var(--wtb-text-faint)", margin: "4px 0 0 0" }}>Enter drive time in minutes, not miles</p>;
      return stepCard(
        "Pre-Ceremony",
        "",
        <div>
          {wizSectionHeading("Hair & Makeup")}
          <div style={{ marginBottom: 4 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "var(--wtb-text)", marginBottom: 8, fontFamily: "'Jost', sans-serif" }}>
              When will hair &amp; make-up be completed for {withThe(brideLabel)} and bridesmaids?
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <select value={wiz_hairMakeupDoneHour} onChange={(e) => setWiz_hairMakeupDoneHour(e.target.value)} style={{ ...settingsSelectStyle, fontSize: 15, padding: "8px 10px" }}>
                {["1","2","3","4","5","6","7","8","9","10","11","12"].map(h => <option key={h} value={h}>{h}</option>)}
              </select>
              <span style={{ fontSize: 18, fontWeight: "bold", color: "var(--wtb-text)" }}>:</span>
              <select value={wiz_hairMakeupDoneMinute} onChange={(e) => setWiz_hairMakeupDoneMinute(e.target.value)} style={{ ...settingsSelectStyle, fontSize: 15, padding: "8px 10px" }}>
                {["00","05","10","15","20","25","30","35","40","45","50","55"].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select value={wiz_hairMakeupDonePeriod} onChange={(e) => setWiz_hairMakeupDonePeriod(e.target.value)} style={{ ...settingsSelectStyle, fontSize: 15, padding: "8px 10px" }}>
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
            <p style={{ fontSize: 12, color: "var(--wtb-text-muted)", margin: 0, fontFamily: "'Jost', sans-serif", fontStyle: "italic" }}>Hair &amp; Makeup delays are the #1 reason for being behind schedule. Please have your hair/makeup artists arrive extra early so you have adequate time.</p>
          </div>

          {wizSectionHeading("Shot Types")}
          <p style={{ fontSize: 13, color: "var(--wtb-text-muted)", margin: "0 0 12px 0", fontFamily: "'Jost', sans-serif" }}>What types of shots do you want before the ceremony starts?</p>
          {[
            { key: "brideReady", label: `${brideLabel} Getting Ready`, sub: "Candid getting-ready moments", val: wiz_preCeremonyBrideReady, set: setWiz_preCeremonyBrideReady },
            { key: "groomReady", label: `${groomLabel} Getting Ready`, sub: "Candid getting-ready moments", val: wiz_preCeremonyGroomReady, set: setWiz_preCeremonyGroomReady },
            { key: "details", label: "Detail Shots", sub: "Rings, dress, bouquet, shoes, etc.", val: wiz_preCeremonyDetails, set: setWiz_preCeremonyDetails },
            { key: "preDress", label: "Bridal Party Pre-Dress Portraits", sub: "Portraits of the Bridal Party before dresses are worn. Typically in robes or matching attire.", val: wiz_preCeremonyPreDress, set: setWiz_preCeremonyPreDress },
            { key: "brideParty", label: `${brideLabel} & Party Portraits`, sub: "Bridal party group portraits", val: wiz_preCeremonyBrideParty, set: setWiz_preCeremonyBrideParty },
            { key: "groomParty", label: `${groomLabel} & Party Portraits`, sub: "Groomsmen group portraits", val: wiz_preCeremonyGroomParty, set: setWiz_preCeremonyGroomParty },
          ].map(({ key, label, sub, val, set }) => (
            <label key={key} style={{ ...wizCheckRowStyle }} onClick={() => set(!val)}>
              <input type="checkbox" checked={val} onChange={() => {}} style={{ width: 22, height: 22, marginTop: 2, cursor: "pointer", flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 400, color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" }}>{label}</div>
                <div style={{ fontSize: 13, color: "var(--wtb-text-muted)", marginTop: 2 }}>{sub}</div>
              </div>
            </label>
          ))}
        </div>,
        () => setWizardStep(3),
        () => setWizardStep(5)
      );
}

export { WizardStep4 };
