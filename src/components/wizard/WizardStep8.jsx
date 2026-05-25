import React from "react";

function WizardStep8(props) {
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
      const hourOptions = ["1","2","3","4","5","6","7","8","9","10","11","12"];
      const minuteOptions = ["00","05","10","15","20","25","30","35","40","45","50","55"];
      return stepCard(
        "Reception",
        "Select what's happening at the reception so we can build out that part of your timeline.",
        <div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "#6e6358", marginBottom: 8, fontFamily: "'Jost', sans-serif" }}>Reception Start Time</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <select value={wiz_receptionHour} onChange={(e) => setWiz_receptionHour(e.target.value)} style={{ ...settingsSelectStyle, fontSize: 15, padding: "8px 10px" }}>
                {hourOptions.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
              <span style={{ fontSize: 18, fontWeight: "bold" }}>:</span>
              <select value={wiz_receptionMinute} onChange={(e) => setWiz_receptionMinute(e.target.value)} style={{ ...settingsSelectStyle, fontSize: 15, padding: "8px 10px" }}>
                {minuteOptions.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <select value={wiz_receptionPeriod} onChange={(e) => setWiz_receptionPeriod(e.target.value)} style={{ ...settingsSelectStyle, fontSize: 15, padding: "8px 10px" }}>
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>

          {wizSectionHeading("Reception Events")}

          {/* Grand Entrance */}
          <label style={{ ...wizCheckRowStyle }} onClick={() => setWiz_grandEntrance(!wiz_grandEntrance)}>
            <input type="checkbox" checked={wiz_grandEntrance} onChange={() => {}} style={{ width: 22, height: 22, marginTop: 2, cursor: "pointer", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 400, color: "#ddd0bc", fontFamily: "'Jost', sans-serif" }}>Grand Entrance</div>
              <div style={{ fontSize: 13, color: "#6e6358", marginTop: 2 }}>Couple introduced to the reception</div>
              {wiz_grandEntrance && (
                <div style={{ marginTop: 10 }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => setWiz_grandEntranceSub("couple")}
                      style={wizToggleStyle(wiz_grandEntranceSub === "couple")}
                    >
                      Just {brideLabel} &amp; {groomLabel}
                    </button>
                    <button
                      onClick={() => setWiz_grandEntranceSub("full")}
                      style={wizToggleStyle(wiz_grandEntranceSub === "full")}
                    >
                      Full wedding party
                    </button>
                  </div>
                </div>
              )}
            </div>
          </label>

          {/* Dinner */}
          <label style={{ ...wizCheckRowStyle }} onClick={() => setWiz_dinner(!wiz_dinner)}>
            <input type="checkbox" checked={wiz_dinner} onChange={() => {}} style={{ width: 22, height: 22, marginTop: 2, cursor: "pointer", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 400, color: "#ddd0bc", fontFamily: "'Jost', sans-serif" }}>Dinner</div>
              <div style={{ fontSize: 13, color: "#6e6358", marginTop: 2 }}>Sit-down meal service</div>
              {wiz_dinner && (
                <div style={{ marginTop: 12 }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "#6e6358", marginBottom: 6, fontFamily: "'Jost', sans-serif" }}>Dinner Start Time</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <select value={wiz_dinnerStartHour} onChange={(e) => setWiz_dinnerStartHour(e.target.value)} style={{ ...settingsSelectStyle, fontSize: 15, padding: "8px 10px" }}>
                        {hourOptions.map((h) => <option key={h} value={h}>{h}</option>)}
                      </select>
                      <span style={{ fontSize: 18, fontWeight: "bold" }}>:</span>
                      <select value={wiz_dinnerStartMinute} onChange={(e) => setWiz_dinnerStartMinute(e.target.value)} style={{ ...settingsSelectStyle, fontSize: 15, padding: "8px 10px" }}>
                        {minuteOptions.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <select value={wiz_dinnerStartPeriod} onChange={(e) => setWiz_dinnerStartPeriod(e.target.value)} style={{ ...settingsSelectStyle, fontSize: 15, padding: "8px 10px" }}>
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "#6e6358", marginBottom: 6, fontFamily: "'Jost', sans-serif" }}>Dinner Style</label>
                    <div style={{ display: "flex", gap: 10 }}>
                      {["Plated", "Buffet"].map((s) => (
                        <button
                          key={s}
                          onClick={() => setWiz_dinnerStyle(s)}
                          style={wizToggleStyle(wiz_dinnerStyle === s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </label>

          {/* Remaining reception events (no Special Dance) */}
          {[
            { label: "Cake Cutting", sub: "", val: wiz_cakeCutting, set: setWiz_cakeCutting },
            { label: "First Dance", sub: `${brideLabel} & ${groomLabel} first dance`, val: wiz_firstDance, set: setWiz_firstDance },
            { label: `${brideLabel} & Parent Dance`, sub: "", val: wiz_brideParentDance, set: setWiz_brideParentDance },
            { label: `${groomLabel} & Parent Dance`, sub: "", val: wiz_groomParentDance, set: setWiz_groomParentDance },
            { label: "Open Dance Floor", sub: "", val: wiz_openDanceFloor, set: setWiz_openDanceFloor },
            { label: "Garter Toss", sub: "", val: wiz_garterToss, set: setWiz_garterToss },
            { label: "Bouquet Toss", sub: "", val: wiz_bouquetToss, set: setWiz_bouquetToss },
          ].map(({ label, sub, val, set }) => (
            <label key={label} style={{ ...wizCheckRowStyle }} onClick={() => set(!val)}>
              <input type="checkbox" checked={val} onChange={() => {}} style={{ width: 22, height: 22, marginTop: 2, cursor: "pointer", flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 400, color: "#ddd0bc", fontFamily: "'Jost', sans-serif" }}>{label}</div>
                {sub && <div style={{ fontSize: 13, color: "#6e6358", marginTop: 2 }}>{sub}</div>}
              </div>
            </label>
          ))}

          {/* Speeches */}
          <label style={{ ...wizCheckRowStyle }} onClick={() => setWiz_speeches(!wiz_speeches)}>
            <input type="checkbox" checked={wiz_speeches} onChange={() => {}} style={{ width: 22, height: 22, marginTop: 2, cursor: "pointer", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 400, color: "#ddd0bc", fontFamily: "'Jost', sans-serif" }}>Speeches</div>
              {wiz_speeches && (
                <div onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                    <label style={{ fontSize: 13, color: "#6e6358", fontWeight: 300, fontFamily: "'Jost', sans-serif" }}>How many speakers?</label>
                    <input
                      type="number"
                      value={wiz_speechCount}
                      min={1}
                      step={1}
                      onChange={(e) => setWiz_speechCount(parseInt(e.target.value, 10) || 1)}
                      style={{ padding: 6, border: "1px solid #2a2520", borderRadius: 6, fontSize: 14, width: 60, textAlign: "center", background: "#0f0d0b", color: "#ddd0bc" }}
                    />
                  </div>
                  <p style={{ fontSize: 12, color: "#6e6358", margin: "6px 0 0 0", fontFamily: "'Jost', sans-serif" }}>Include anyone doing a blessing or prayer in this count.</p>
                  <p style={{ fontSize: 12, color: "#6e6358", margin: "4px 0 0 0", fontFamily: "'Jost', sans-serif" }}>Typically 10 minutes per speaker is enough. You can change this to be longer or shorter in your first draft.</p>
                </div>
              )}
            </div>
          </label>

          {/* Custom Events */}
          {wizSectionHeading("Custom Events")}
          {wiz_customReceptionEvents.map((ev, i) => (
            <div key={ev.id} style={{ border: "1px solid #1e1c19", borderRadius: 8, padding: "14px 14px 10px", marginBottom: 10, background: "#0f0d0b" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "#6e6358", fontFamily: "'Jost', sans-serif" }}>Custom Event {i + 1}</span>
                <button
                  onClick={() => setWiz_customReceptionEvents(prev => prev.filter((_, idx) => idx !== i))}
                  style={{ background: "none", border: "1px solid #2a2520", borderRadius: 4, padding: "3px 10px", fontSize: 12, color: "#6e6358", cursor: "pointer" }}
                >
                  Remove
                </button>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 12, color: "#6e6358", marginBottom: 4, fontFamily: "'Jost', sans-serif" }}>Label</label>
                  <input
                    type="text"
                    value={ev.label}
                    onChange={(e) => setWiz_customReceptionEvents(prev => { const next = [...prev]; next[i] = { ...next[i], label: e.target.value }; return next; })}
                    placeholder="Event name"
                    style={{ width: "100%", padding: "8px 10px", border: "1px solid #2a2520", borderRadius: 6, fontSize: 14, boxSizing: "border-box", background: "#0f0d0b", color: "#ddd0bc", fontFamily: "'Jost', sans-serif" }}
                  />
                </div>
                <div style={{ width: 80 }}>
                  <label style={{ display: "block", fontSize: 12, color: "#6e6358", marginBottom: 4, fontFamily: "'Jost', sans-serif" }}>Minutes</label>
                  <input
                    type="number"
                    value={ev.duration}
                    min={5}
                    step={5}
                    onChange={(e) => setWiz_customReceptionEvents(prev => { const next = [...prev]; next[i] = { ...next[i], duration: parseInt(e.target.value, 10) || 15 }; return next; })}
                    style={{ width: "100%", padding: "8px 10px", border: "1px solid #2a2520", borderRadius: 6, fontSize: 14, boxSizing: "border-box", background: "#0f0d0b", color: "#ddd0bc", textAlign: "center" }}
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={() => { setWiz_customReceptionEvents(prev => [...prev, { id: wiz_customReceptionEventNextId, label: "", duration: 15 }]); setWiz_customReceptionEventNextId(n => n + 1); }}
            style={{ padding: "9px 18px", background: "#161310", color: "#b8906a", border: "1px solid #b8906a", borderRadius: 8, fontSize: 13, fontWeight: 300, cursor: "pointer", fontFamily: "'Jost', sans-serif" }}
          >
            + Add Custom Event
          </button>
        </div>,
        () => setWizardStep(8),
        () => setWizardStep(99),
        "Review & Generate"
      );
}

export { WizardStep8 };
