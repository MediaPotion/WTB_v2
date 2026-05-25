import React from "react";

function WizardStep7(props) {
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
    wiz_familyGroups, setWiz_familyGroups, wiz_familyGroupNames, setWiz_familyGroupNames, wiz_goldenHour, setWiz_goldenHour,
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
      const groupCount = wiz_familyGroups === "none" ? 0 : parseInt(wiz_familyGroups, 10);
      return stepCard(
        "Portraits",
        "Tell us about group photos, portrait sessions, and golden hour after the ceremony.",
        <div>
          {wizSectionHeading("Family Group Photos")}
          <p style={{ fontSize: 13, color: "#6e6358", margin: "0 0 6px 0", fontFamily: "'Jost', sans-serif" }}>Family and Group Photos typically follow directly after the ceremony while your guests are still present.</p>
          <p style={{ fontSize: 13, color: "#6e6358", margin: "0 0 10px 0", fontFamily: "'Jost', sans-serif" }}>How many family groupings will be photographed after the ceremony?</p>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <button style={wizToggleStyle(wiz_familyGroups === "5")} onClick={() => setWiz_familyGroups("5")}>5 Groups (~20 min)</button>
            <button style={wizToggleStyle(wiz_familyGroups === "10")} onClick={() => setWiz_familyGroups("10")}>10 Groups (~45 min)</button>
            <button style={wizToggleStyle(wiz_familyGroups === "none")} onClick={() => setWiz_familyGroups("none")}>None</button>
          </div>
          {groupCount > 0 && (
            <div style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 13, color: "#6e6358", margin: "0 0 10px 0", fontFamily: "'Jost', sans-serif" }}>List who is in each group <span style={{ color: "#3a3530" }}>(optional)</span></p>
              {Array.from({ length: groupCount }).map((_, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "#6e6358", marginBottom: 4, fontFamily: "'Jost', sans-serif" }}>Group {i + 1}</label>
                  <input
                    type="text"
                    value={wiz_familyGroupNames[i] || ""}
                    onChange={(e) => {
                      const next = [...wiz_familyGroupNames];
                      next[i] = e.target.value;
                      setWiz_familyGroupNames(next);
                    }}
                    placeholder="e.g. Smith family — bride's parents + 2 siblings"
                    style={{ width: "100%", padding: 9, border: "1px solid #2a2520", borderRadius: 6, fontSize: 14, boxSizing: "border-box", background: "#0f0d0b", color: "#ddd0bc", fontFamily: "'Jost', sans-serif" }}
                  />
                </div>
              ))}
            </div>
          )}

          {wizSectionHeading("Portrait Sessions")}
          <p style={{ fontSize: 13, color: "#6e6358", margin: "0 0 12px 0", fontFamily: "'Jost', sans-serif" }}>Add each portrait session that will happen after the ceremony.</p>
          {wiz_portraitSessions.map((session, i) => (
            <div key={session.id} style={{ border: "1px solid #1e1c19", borderRadius: 8, padding: "14px 14px 10px", marginBottom: 10, background: "#0f0d0b" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 400, color: "#ddd0bc", fontFamily: "'Jost', sans-serif" }}>Portrait Session {i + 1}</span>
                <button
                  onClick={() => setWiz_portraitSessions(prev => prev.filter((_, idx) => idx !== i))}
                  style={{ background: "none", border: "1px solid #2a2520", borderRadius: 4, padding: "3px 10px", fontSize: 12, color: "#6e6358", cursor: "pointer" }}
                >
                  Remove
                </button>
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={{ display: "block", fontSize: 12, color: "#6e6358", marginBottom: 4, fontFamily: "'Jost', sans-serif" }}>Session Type</label>
                <select
                  value={session.type}
                  onChange={(e) => setWiz_portraitSessions(prev => { const next = [...prev]; next[i] = { ...next[i], type: e.target.value }; return next; })}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #2a2520", borderRadius: 6, fontSize: 14, background: "#0f0d0b", color: "#ddd0bc" }}
                >
                  <option value="">Select type…</option>
                  <option value="Bride & Groom">Bride &amp; Groom</option>
                  <option value="Bride & Bridesmaids">Bride &amp; Bridesmaids</option>
                  <option value="Groom & Groomsmen">Groom &amp; Groomsmen</option>
                  <option value="Full Wedding Party">Full Wedding Party</option>
                  <option value="Extended Family">Extended Family</option>
                  <option value="Golden Hour">Golden Hour</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#6e6358", marginBottom: 4, fontFamily: "'Jost', sans-serif" }}>Location</label>
                <select
                  value={session.location}
                  onChange={(e) => setWiz_portraitSessions(prev => { const next = [...prev]; next[i] = { ...next[i], location: e.target.value }; return next; })}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #2a2520", borderRadius: 6, fontSize: 14, background: "#0f0d0b", color: "#ddd0bc" }}
                >
                  <option value="">Select a location…</option>
                  {allWizLocations.map((name, j) => <option key={j} value={name}>{name}</option>)}
                </select>
              </div>
            </div>
          ))}
          <button
            onClick={() => { setWiz_portraitSessions(prev => [...prev, { id: wiz_portraitSessionNextId, type: "", location: "" }]); setWiz_portraitSessionNextId(n => n + 1); }}
            style={{ padding: "9px 18px", background: "#161310", color: "#b8906a", border: "1px solid #b8906a", borderRadius: 8, fontSize: 13, fontWeight: 300, cursor: "pointer", marginBottom: 20, fontFamily: "'Jost', sans-serif" }}
          >
            + Add Portrait Session
          </button>

          {wizSectionHeading("Golden Hour")}
          <p style={{ fontSize: 13, color: "#6e6358", margin: "0 0 10px 0", fontFamily: "'Jost', sans-serif" }}>Golden hour portraits take advantage of the soft light just before sunset.</p>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={wizToggleStyle(wiz_goldenHour === true)} onClick={() => setWiz_goldenHour(true)}>Yes</button>
            <button style={wizToggleStyle(wiz_goldenHour === false)} onClick={() => setWiz_goldenHour(false)}>No</button>
          </div>
        </div>,
        () => setWizardStep(6),
        () => setWizardStep(9)
      );
}

export { WizardStep7 };
