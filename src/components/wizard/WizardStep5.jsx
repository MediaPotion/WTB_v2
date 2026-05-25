import React from "react";

function WizardStep5(props) {
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
        "First Looks",
        "First looks affect the order of portraits and group photos in your timeline.",
        <div>
          {wizSectionHeading("Pre-Ceremony Visibility")}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 300, color: "var(--wtb-text)", marginBottom: 10, fontFamily: "'Jost', sans-serif" }}>Can {withThe(brideLabel)} be seen by {withThe(groomLabel)} before the Ceremony?</label>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={wizToggleStyle(wiz_brideOkayBefore === true)} onClick={() => setWiz_brideOkayBefore(true)}>Yes</button>
              <button style={wizToggleStyle(wiz_brideOkayBefore === false)} onClick={() => setWiz_brideOkayBefore(false)}>No</button>
            </div>
          </div>

          {wizSectionHeading("First Looks")}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 300, color: "var(--wtb-text)", marginBottom: 10, fontFamily: "'Jost', sans-serif" }}>Will there be any first looks before the ceremony?</label>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={wizToggleStyle(wiz_hasFirstLooks === true)} onClick={() => setWiz_hasFirstLooks(true)}>Yes</button>
              <button style={wizToggleStyle(wiz_hasFirstLooks === false)} onClick={() => { setWiz_hasFirstLooks(false); setWiz_firstLookGroom(false); setWiz_firstLookParent(false); setWiz_firstLookBridesmaids(false); setWiz_firstLookOther(false); }}>No</button>
            </div>
          </div>
          {wiz_hasFirstLooks === true && (
            <div>
              <label style={{ display: "block", fontSize: 14, fontWeight: 300, color: "var(--wtb-text)", marginBottom: 10, fontFamily: "'Jost', sans-serif" }}>Who are the first looks with?</label>
              {[
                { key: "groom", label: "Groom", sub: "Couple's first look before the ceremony", val: wiz_firstLookGroom, set: setWiz_firstLookGroom, locVal: wiz_firstLookGroomLocation, setLoc: setWiz_firstLookGroomLocation },
                { key: "parent", label: "Parent(s)", sub: `${brideLabel} sees parent(s) for the first time`, val: wiz_firstLookParent, set: setWiz_firstLookParent, locVal: wiz_firstLookParentLocation, setLoc: setWiz_firstLookParentLocation },
                { key: "bridesmaids", label: "Bridesmaids", sub: `${brideLabel} reveals look to the bridal party`, val: wiz_firstLookBridesmaids, set: setWiz_firstLookBridesmaids, locVal: wiz_firstLookBridesmaidsLocation, setLoc: setWiz_firstLookBridesmaidsLocation },
              ].map(({ key, label, sub, val, set, locVal, setLoc }) => (
                <label key={key} style={{ ...wizCheckRowStyle }} onClick={() => set(!val)}>
                  <input type="checkbox" checked={val} onChange={() => {}} style={{ width: 22, height: 22, marginTop: 2, cursor: "pointer", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 400, color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" }}>{label}</div>
                    <div style={{ fontSize: 13, color: "var(--wtb-text-muted)", marginTop: 2 }}>{sub}</div>
                    {val && (
                      <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--wtb-border-subtle)" }} onClick={e => e.stopPropagation()}>
                        <label style={{ display: "block", fontSize: 12, color: "var(--wtb-text-muted)", marginBottom: 4, fontFamily: "'Jost', sans-serif" }}>Where will this first look take place?</label>
                        <select
                          value={locVal}
                          onChange={e => setLoc(e.target.value)}
                          style={{ width: "100%", padding: "6px 8px", border: "1px solid var(--wtb-border)", borderRadius: 6, fontSize: 14, background: "var(--wtb-surface)", color: "var(--wtb-text)" }}
                        >
                          <option value="">Select a location…</option>
                          {allWizLocations.map((name, i) => (
                            <option key={i} value={name}>{name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </label>
              ))}

              {wizSectionHeading("Additional First Looks")}
              {wiz_customFirstLooks.map((fl, i) => (
                <div key={fl.id} style={{ border: "1px solid var(--wtb-border-subtle)", borderRadius: 8, padding: "14px 14px 10px", marginBottom: 10, background: "var(--wtb-surface)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: "var(--wtb-text-muted)", fontFamily: "'Jost', sans-serif" }}>Custom First Look {i + 1}</span>
                    <button
                      onClick={() => setWiz_customFirstLooks(prev => prev.filter((_, idx) => idx !== i))}
                      style={{ background: "none", border: "1px solid var(--wtb-border)", borderRadius: 4, padding: "3px 10px", fontSize: 12, color: "var(--wtb-text-muted)", cursor: "pointer" }}
                    >
                      Remove
                    </button>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <label style={{ display: "block", fontSize: 12, color: "var(--wtb-text-muted)", marginBottom: 4, fontFamily: "'Jost', sans-serif" }}>Label</label>
                    <input
                      type="text"
                      value={fl.label}
                      onChange={(e) => setWiz_customFirstLooks(prev => { const next = [...prev]; next[i] = { ...next[i], label: e.target.value }; return next; })}
                      placeholder="e.g. Bride & Flower Girl"
                      style={{ width: "100%", padding: "8px 10px", border: "1px solid var(--wtb-border)", borderRadius: 6, fontSize: 14, boxSizing: "border-box", background: "var(--wtb-surface)", color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: "var(--wtb-text-muted)", marginBottom: 4, fontFamily: "'Jost', sans-serif" }}>Location</label>
                    <select
                      value={fl.location}
                      onChange={(e) => setWiz_customFirstLooks(prev => { const next = [...prev]; next[i] = { ...next[i], location: e.target.value }; return next; })}
                      style={{ width: "100%", padding: "8px 10px", border: "1px solid var(--wtb-border)", borderRadius: 6, fontSize: 14, background: "var(--wtb-surface)", color: "var(--wtb-text)" }}
                    >
                      <option value="">Select a location…</option>
                      {allWizLocations.map((name, j) => <option key={j} value={name}>{name}</option>)}
                    </select>
                  </div>
                </div>
              ))}
              <button
                onClick={() => { setWiz_customFirstLooks(prev => [...prev, { id: wiz_customFirstLookNextId, label: "", location: "" }]); setWiz_customFirstLookNextId(n => n + 1); }}
                style={{ padding: "9px 18px", background: "var(--wtb-surface-raised)", color: "var(--wtb-accent)", border: "1px solid var(--wtb-accent)", borderRadius: 8, fontSize: 13, fontWeight: 300, cursor: "pointer", fontFamily: "'Jost', sans-serif" }}
              >
                + Add First Look
              </button>
            </div>
          )}
        </div>,
        () => setWizardStep(4),
        () => setWizardStep(6)
      );
}

export { WizardStep5 };
