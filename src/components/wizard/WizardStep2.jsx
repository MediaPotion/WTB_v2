import React from "react";

function WizardStep2(props) {
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
      const mandatoryLocStyle = { border: "1px solid var(--wtb-border-subtle)", borderRadius: 8, padding: "14px 14px 12px", marginBottom: 16, background: "var(--wtb-surface-raised)" };
      const mandatoryLabelStyle = { display: "block", fontSize: 13, fontWeight: 300, color: "var(--wtb-text-muted)", marginBottom: 4, fontFamily: "'Jost', sans-serif", letterSpacing: "0.05em" };
      const mandatoryInputStyle = { width: "100%", padding: 9, border: "1px solid var(--wtb-border)", borderRadius: 6, fontSize: 14, boxSizing: "border-box", background: "var(--wtb-surface)", color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" };
      const travelStepper = (value, onChange, label = "How far is this location to the ceremony location?") => {
        const mins = parseInt(value) || 0;
        return (
          <div style={{ marginTop: 12 }}>
            <label style={{ ...mandatoryLabelStyle, marginBottom: 6 }}>{label}</label>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => onChange(String(Math.max(0, mins - 5)))} style={{ width: 32, height: 32, background: "var(--wtb-surface)", border: "1px solid var(--wtb-border)", borderRadius: 6, color: "var(--wtb-text)", fontSize: 18, lineHeight: 1, cursor: "pointer", flexShrink: 0 }}>−</button>
              <span style={{ minWidth: 28, textAlign: "center", fontSize: 16, color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" }}>{mins}</span>
              <button onClick={() => onChange(String(mins + 5))} style={{ width: 32, height: 32, background: "var(--wtb-surface)", border: "1px solid var(--wtb-border)", borderRadius: 6, color: "var(--wtb-text)", fontSize: 18, lineHeight: 1, cursor: "pointer", flexShrink: 0 }}>+</button>
              <span style={{ fontSize: 13, color: "var(--wtb-text-muted)", fontFamily: "'Jost', sans-serif" }}>minutes</span>
            </div>
          </div>
        );
      };
      return stepCard(
        "Wedding Day Locations",
        "Enter the key venues for the wedding day. These are used to build travel blocks and keep your timeline organized.",
        <div>
          {wizSectionHeading("Ceremony Location")}
          <div style={mandatoryLocStyle}>
            <div style={{ marginBottom: 10 }}>
              <label style={mandatoryLabelStyle}>Venue Name</label>
              <input
                type="text"
                value={wiz_ceremonyVenue}
                onChange={(e) => setWiz_ceremonyVenue(e.target.value)}
                placeholder="e.g. St. Mary's Church"
                style={mandatoryInputStyle}
              />
            </div>
            <div>
              <label style={mandatoryLabelStyle}>Address</label>
              <input
                type="text"
                value={wiz_ceremonyAddress}
                onChange={(e) => setWiz_ceremonyAddress(e.target.value)}
                placeholder="e.g. 123 Main St, Springfield, MI"
                style={mandatoryInputStyle}
              />
            </div>
          </div>

          {wizSectionHeading("Reception Location")}
          <div style={mandatoryLocStyle}>
            <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: wiz_receptionSameAsCeremony ? 0 : 12, cursor: "pointer" }}
              onClick={() => setWiz_receptionSameAsCeremony(!wiz_receptionSameAsCeremony)}>
              <input type="checkbox" checked={wiz_receptionSameAsCeremony} onChange={() => {}} style={{ width: 18, height: 18, cursor: "pointer", flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: "var(--wtb-text-muted)" }}>Same as ceremony location</span>
            </label>
            {!wiz_receptionSameAsCeremony && (
              <>
                <div style={{ marginBottom: 10 }}>
                  <label style={mandatoryLabelStyle}>Venue Name</label>
                  <input
                    type="text"
                    value={wiz_receptionVenue}
                    onChange={(e) => setWiz_receptionVenue(e.target.value)}
                    placeholder="e.g. The Grand Ballroom"
                    style={mandatoryInputStyle}
                  />
                </div>
                <div>
                  <label style={mandatoryLabelStyle}>Address</label>
                  <input
                    type="text"
                    value={wiz_receptionAddress}
                    onChange={(e) => setWiz_receptionAddress(e.target.value)}
                    placeholder="e.g. 456 Oak Ave, Springfield, MI"
                    style={mandatoryInputStyle}
                  />
                </div>
                {travelStepper(wiz_distanceReceptionToCeremony, setWiz_distanceReceptionToCeremony)}
              </>
            )}
          </div>

          {wizSectionHeading(`${brideLabel} Getting Ready`)}
          <div style={mandatoryLocStyle}>
            <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: wiz_brideReadyAtCeremony || wiz_brideReadyAtReception ? 6 : 12, cursor: "pointer" }}
              onClick={() => { setWiz_brideReadyAtCeremony(!wiz_brideReadyAtCeremony); if (!wiz_brideReadyAtCeremony) setWiz_brideReadyAtReception(false); }}>
              <input type="checkbox" checked={wiz_brideReadyAtCeremony} onChange={() => {}} style={{ width: 18, height: 18, cursor: "pointer", flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: "var(--wtb-text-muted)" }}>Same as ceremony location</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: wiz_brideReadyAtCeremony || wiz_brideReadyAtReception ? 0 : 12, cursor: "pointer" }}
              onClick={() => { setWiz_brideReadyAtReception(!wiz_brideReadyAtReception); if (!wiz_brideReadyAtReception) setWiz_brideReadyAtCeremony(false); }}>
              <input type="checkbox" checked={wiz_brideReadyAtReception} onChange={() => {}} style={{ width: 18, height: 18, cursor: "pointer", flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: "var(--wtb-text-muted)" }}>Same as reception location</span>
            </label>
            {!wiz_brideReadyAtCeremony && !wiz_brideReadyAtReception && (
              <>
                <div style={{ marginBottom: 10 }}>
                  <label style={mandatoryLabelStyle}>Venue Name</label>
                  <input
                    type="text"
                    value={wiz_brideReadyAddress}
                    onChange={(e) => setWiz_brideReadyAddress(e.target.value)}
                    placeholder="e.g. The Bridal Suite, Hotel Grand"
                    style={mandatoryInputStyle}
                  />
                </div>
                <div>
                  <label style={mandatoryLabelStyle}>Address</label>
                  <input
                    type="text"
                    value={wiz_brideReadyStreet}
                    onChange={(e) => setWiz_brideReadyStreet(e.target.value)}
                    placeholder="e.g. 123 Main St, Springfield, MI"
                    style={mandatoryInputStyle}
                  />
                </div>
                {travelStepper(wiz_distanceBrideToCeremony, setWiz_distanceBrideToCeremony)}
              </>
            )}
          </div>

          {wizSectionHeading(`${groomLabel} Getting Ready`)}
          <div style={mandatoryLocStyle}>
            <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, cursor: "pointer" }}
              onClick={() => { setWiz_groomReadyAtCeremony(!wiz_groomReadyAtCeremony); if (!wiz_groomReadyAtCeremony) { setWiz_groomReadyAtReception(false); setWiz_groomReadyAtBride(false); } }}>
              <input type="checkbox" checked={wiz_groomReadyAtCeremony} onChange={() => {}} style={{ width: 18, height: 18, cursor: "pointer", flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: "var(--wtb-text-muted)" }}>Same as ceremony location</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, cursor: "pointer" }}
              onClick={() => { setWiz_groomReadyAtReception(!wiz_groomReadyAtReception); if (!wiz_groomReadyAtReception) { setWiz_groomReadyAtCeremony(false); setWiz_groomReadyAtBride(false); } }}>
              <input type="checkbox" checked={wiz_groomReadyAtReception} onChange={() => {}} style={{ width: 18, height: 18, cursor: "pointer", flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: "var(--wtb-text-muted)" }}>Same as reception location</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: wiz_groomReadyAtCeremony || wiz_groomReadyAtReception || wiz_groomReadyAtBride ? 0 : 12, cursor: "pointer" }}
              onClick={() => { setWiz_groomReadyAtBride(!wiz_groomReadyAtBride); if (!wiz_groomReadyAtBride) { setWiz_groomReadyAtCeremony(false); setWiz_groomReadyAtReception(false); } }}>
              <input type="checkbox" checked={wiz_groomReadyAtBride} onChange={() => {}} style={{ width: 18, height: 18, cursor: "pointer", flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: "var(--wtb-text-muted)" }}>Same as {brideLabel} Getting Ready location</span>
            </label>
            {!wiz_groomReadyAtCeremony && !wiz_groomReadyAtReception && !wiz_groomReadyAtBride && (
              <>
                <div style={{ marginBottom: 10 }}>
                  <label style={mandatoryLabelStyle}>Venue Name</label>
                  <input
                    type="text"
                    value={wiz_groomReadyAddress}
                    onChange={(e) => setWiz_groomReadyAddress(e.target.value)}
                    placeholder="e.g. The Groomsmen Suite, Hotel Grand"
                    style={mandatoryInputStyle}
                  />
                </div>
                <div>
                  <label style={mandatoryLabelStyle}>Address</label>
                  <input
                    type="text"
                    value={wiz_groomReadyStreet}
                    onChange={(e) => setWiz_groomReadyStreet(e.target.value)}
                    placeholder="e.g. 123 Main St, Springfield, MI"
                    style={mandatoryInputStyle}
                  />
                </div>
                {travelStepper(wiz_distanceGroomToCeremony, setWiz_distanceGroomToCeremony)}
                <div style={{ marginTop: 12 }}>
                  <label style={{ ...mandatoryLabelStyle, marginBottom: 6 }}>How far is this location from {withThe(brideLabel)}'s Getting Ready location?</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button onClick={() => setWiz_distanceBetweenReady(String(Math.max(0, (parseInt(wiz_distanceBetweenReady) || 0) - 5)))} style={{ width: 32, height: 32, background: "var(--wtb-surface)", border: "1px solid var(--wtb-border)", borderRadius: 6, color: "var(--wtb-text)", fontSize: 18, lineHeight: 1, cursor: "pointer", flexShrink: 0 }}>−</button>
                    <span style={{ minWidth: 28, textAlign: "center", fontSize: 16, color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" }}>{parseInt(wiz_distanceBetweenReady) || 0}</span>
                    <button onClick={() => setWiz_distanceBetweenReady(String((parseInt(wiz_distanceBetweenReady) || 0) + 5))} style={{ width: 32, height: 32, background: "var(--wtb-surface)", border: "1px solid var(--wtb-border)", borderRadius: 6, color: "var(--wtb-text)", fontSize: 18, lineHeight: 1, cursor: "pointer", flexShrink: 0 }}>+</button>
                    <span style={{ fontSize: 13, color: "var(--wtb-text-muted)", fontFamily: "'Jost', sans-serif" }}>minutes</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {wizSectionHeading("Additional Locations")}
          <p style={{ fontSize: 13, color: "var(--wtb-text-faint)", marginBottom: 12 }}>Any other locations you&apos;ll be visiting — such as portrait spots or destinations?</p>
          {wiz_locations.map((loc, i) => (
            <div key={loc.id} style={{ border: "1px solid var(--wtb-border-subtle)", borderRadius: 8, padding: "14px 14px 10px", marginBottom: 12, background: "var(--wtb-surface)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 400, color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" }}>Location {i + 1}</span>
                <button
                  onClick={() => removeWizLocation(loc.id)}
                  style={{ background: "none", border: "1px solid var(--wtb-border)", borderRadius: 4, padding: "3px 10px", fontSize: 12, color: "var(--wtb-text-muted)", cursor: "pointer" }}
                >
                  Remove
                </button>
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "var(--wtb-text-muted)", marginBottom: 4, fontFamily: "'Jost', sans-serif" }}>Location Name</label>
                <input
                  type="text"
                  value={loc.name}
                  onChange={(e) => updateWizLocation(loc.id, "name", e.target.value)}
                  placeholder="e.g. Riverside Park, Hotel Lobby"
                  style={{ width: "100%", padding: 9, border: "1px solid var(--wtb-border)", borderRadius: 6, fontSize: 14, boxSizing: "border-box", background: "var(--wtb-surface)", color: "var(--wtb-text)" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "var(--wtb-text-muted)", marginBottom: 4, fontFamily: "'Jost', sans-serif" }}>Address <span style={{ color: "var(--wtb-text-faint)" }}>(optional)</span></label>
                <input
                  type="text"
                  value={loc.address}
                  onChange={(e) => updateWizLocation(loc.id, "address", e.target.value)}
                  placeholder="e.g. 123 Main St, Springfield, MI"
                  style={{ width: "100%", padding: 9, border: "1px solid var(--wtb-border)", borderRadius: 6, fontSize: 14, boxSizing: "border-box", background: "var(--wtb-surface)", color: "var(--wtb-text)" }}
                />
              </div>
              {travelStepper(loc.distFromCeremony, (val) => updateWizLocation(loc.id, "distFromCeremony", val))}
              {travelStepper(loc.distFromReception, (val) => updateWizLocation(loc.id, "distFromReception", val), "How far is this location to the reception location?")}
            </div>
          ))}
          <button
            onClick={addWizLocation}
            style={{ padding: "10px 20px", background: "var(--wtb-surface-raised)", color: "var(--wtb-accent)", border: "1px solid var(--wtb-accent)", borderRadius: 8, fontSize: 14, fontWeight: 300, cursor: "pointer", fontFamily: "'Jost', sans-serif" }}
          >
            + Add Location
          </button>
        </div>,
        () => setWizardStep(1),
        () => setWizardStep(3)
      );
}

export { WizardStep2 };
