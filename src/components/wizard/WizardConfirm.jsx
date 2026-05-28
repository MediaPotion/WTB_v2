import React from "react";
import { formatClockLabel, parseTimeInput } from "../../lib/time";
import { isWizardCoverageHoursSpecified } from "../../lib/coverageStartBlocks";

function WizardConfirm(props) {
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
    wiz_photoCoverageHours, setWiz_photoCoverageHours, wiz_videoCoverageHours, setWiz_videoCoverageHours,
    photoStartHour, photoStartMinute, photoStartPeriod,
    videoStartHour, videoStartMinute, videoStartPeriod,
    wiz_ceremonyOutdoor, setWiz_ceremonyOutdoor,
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
      const cardStyle = { background: "var(--wtb-surface)", border: "1px solid var(--wtb-border-subtle)", borderRadius: 8, padding: "20px", marginBottom: 12 };
      const sectionHeading = (label) => (
        <h3 style={{ margin: "0 0 14px 0", fontSize: 12, color: "var(--wtb-accent)", fontWeight: 300, fontFamily: "'Jost', sans-serif", letterSpacing: "0.15em", textTransform: "uppercase" }}>{label}</h3>
      );
      const reviewRow = (label, value, incomplete = false) => (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "8px 0", borderBottom: "1px solid var(--wtb-surface-raised)", ...(incomplete ? { borderLeft: "2px solid var(--wtb-accent)", paddingLeft: 8 } : {}) }}>
          <span style={{ color: "var(--wtb-text-muted)", fontFamily: "'Jost', sans-serif", fontSize: 13, fontWeight: 300, flexShrink: 0, marginRight: 12 }}>{label}</span>
          <span style={{ color: incomplete ? "var(--wtb-accent)" : "var(--wtb-text)", textAlign: "right", fontFamily: "'Jost', sans-serif", fontSize: 13 }}>{value}</span>
        </div>
      );
      const noneSelected = <p style={{ fontSize: 13, color: "var(--wtb-text-muted)", fontFamily: "'Jost', sans-serif", margin: 0 }}>None selected</p>;

      // Pre-Ceremony shot types
      const preCeremonyShots = [
        wiz_preCeremonyBrideReady && `${brideLabel} Getting Ready`,
        wiz_preCeremonyGroomReady && `${groomLabel} Getting Ready`,
        wiz_preCeremonyDetails && "Detail Shots",
        wiz_preCeremonyPreDress && "Bridal Party Pre-Dress Portraits",
        wiz_preCeremonyBrideParty && `${brideLabel} & Party Portraits`,
        wiz_preCeremonyGroomParty && `${groomLabel} & Party Portraits`,
      ].filter(Boolean);

      // Reception events
      const receptionEvents = [
        wiz_cakeCutting && "Cake Cutting",
        wiz_firstDance && "First Dance",
        wiz_brideParentDance && `${brideLabel} & Parent Dance`,
        wiz_groomParentDance && `${groomLabel} & Parent Dance`,
        wiz_specialDance && "Special Dance",
        wiz_openDanceFloor && "Open Dance Floor",
        wiz_garterToss && "Garter Toss",
        wiz_bouquetToss && "Bouquet Toss",
      ].filter(Boolean);

      // Person 1 getting ready value
      const brideReadyValue = wiz_brideReadyAtCeremony
        ? "At ceremony venue"
        : wiz_brideReadyAtReception
        ? "At reception venue"
        : wiz_brideReadyAddress
        ? (wiz_brideReadyStreet ? `${wiz_brideReadyAddress}\n${wiz_brideReadyStreet}` : wiz_brideReadyAddress)
        : "(not entered)";
      const brideReadyIncomplete = !wiz_brideReadyAtCeremony && !wiz_brideReadyAtReception && !wiz_brideReadyAddress;

      // Person 2 getting ready value
      const groomReadyValue = wiz_groomReadyAtCeremony
        ? "At ceremony venue"
        : wiz_groomReadyAtReception
        ? "At reception venue"
        : wiz_groomReadyAddress
        ? wiz_groomReadyAddress
        : "(not entered)";
      const groomReadyIncomplete = !wiz_groomReadyAtCeremony && !wiz_groomReadyAtReception && !wiz_groomReadyAddress;

      // First looks — has any?
      const hasAnyFirstLook = wiz_firstLookGroom || wiz_firstLookParent || wiz_firstLookBridesmaids || wiz_firstLookOther || wiz_customFirstLooks.length > 0;
      const noFirstLooks = wiz_hasFirstLooks === false || (!wiz_hasFirstLooks && !hasAnyFirstLook);

      return (
        <div className="wiz-layout" style={{ padding: "16px 0" }}>
          <div className="wiz-step-col">
            <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 16px 40px" }}>
              <h2 style={{ margin: "0 0 6px 0", fontSize: "clamp(22px,4vw,32px)", color: "var(--wtb-text)", fontWeight: 400, fontFamily: "'Cormorant Garamond', serif" }}>Ready to Generate Draft</h2>
              <p style={{ margin: "0 0 20px 0", fontSize: 14, color: "var(--wtb-text-muted)", fontFamily: "'Jost', sans-serif", fontWeight: 300 }}>Review your selections below, then click Generate Timeline.</p>

              {/* 1. The Couple */}
              <div style={cardStyle}>
                {sectionHeading("The Couple")}
                {reviewRow("Titles", `${brideLabel} & ${groomLabel}`)}
                {reviewRow(`${brideLabel}`, bride || "(not entered)", !bride)}
                {reviewRow(`${groomLabel}`, groom || "(not entered)", !groom)}
                {reviewRow("Wedding Date", date || "(not entered)", !date)}
              </div>

              {/* 2. Package */}
              <div style={cardStyle}>
                {sectionHeading("Package")}
                {reviewRow("Photo Coverage", wiz_photoCoverageHours ? wiz_photoCoverageHours + " hrs" : "(not entered)", !wiz_photoCoverageHours)}
                {reviewRow("Photographers", String(wiz_photographerCount))}
                {isWizardCoverageHoursSpecified(wiz_photoCoverageHours) &&
                  reviewRow(
                    "Photographer starts shooting",
                    formatClockLabel(
                      parseTimeInput(photoStartHour, photoStartMinute, photoStartPeriod)
                    )
                  )}
                {reviewRow("Video Coverage", wiz_videoCoverageHours ? wiz_videoCoverageHours + " hrs" : "(not entered)", !wiz_videoCoverageHours)}
                {reviewRow("Videographers", String(wiz_videographerCount))}
                {isWizardCoverageHoursSpecified(wiz_videoCoverageHours) &&
                  reviewRow(
                    "Videographer starts shooting",
                    formatClockLabel(
                      parseTimeInput(videoStartHour, videoStartMinute, videoStartPeriod)
                    )
                  )}
                {reviewRow("Drone Coverage", wiz_drone ? "Yes" : "No")}
                {reviewRow("Narration Recording", wiz_narration ? "Yes" : "No")}
              </div>

              {/* 3. Locations */}
              <div style={cardStyle}>
                {sectionHeading("Locations")}
                {reviewRow(`${brideLabel} Getting Ready`, brideReadyValue, brideReadyIncomplete)}
                {reviewRow(`${groomLabel} Getting Ready`, groomReadyValue, groomReadyIncomplete)}
                {reviewRow("Ceremony Venue", wiz_ceremonyVenue || "(not entered)", !wiz_ceremonyVenue)}
                {reviewRow("Ceremony Address", wiz_ceremonyAddress || "(not entered)", !wiz_ceremonyAddress)}
                {reviewRow(
                  "Reception Venue",
                  wiz_receptionSameAsCeremony ? "Same as ceremony" : (wiz_receptionVenue || "(not entered)"),
                  !wiz_receptionSameAsCeremony && !wiz_receptionVenue
                )}
                {!wiz_receptionSameAsCeremony && reviewRow(
                  "Reception Address",
                  wiz_receptionAddress || "(not entered)",
                  !wiz_receptionAddress
                )}
                {wiz_locations.length > 0
                  ? wiz_locations.map((loc, i) => (
                      <div key={i}>{reviewRow(`Additional Location ${i + 1}`, [loc.name, loc.address].filter(Boolean).join(" — ") || "(unnamed)")}</div>
                    ))
                  : reviewRow("Additional Locations", "None added")}
              </div>

              {/* 4. Pre-Ceremony */}
              <div style={cardStyle}>
                {sectionHeading("Pre-Ceremony")}
                {reviewRow("Hair & Makeup Done By", `${wiz_hairMakeupDoneHour}:${wiz_hairMakeupDoneMinute} ${wiz_hairMakeupDonePeriod}`)}
                {reviewRow("Shot Types", preCeremonyShots.length > 0 ? preCeremonyShots.join(", ") : "None")}
                {reviewRow(
                  `Can ${groomLabel} see ${brideLabel} before Ceremony?`,
                  wiz_brideOkayBefore === null ? "(not answered)" : wiz_brideOkayBefore ? "Yes" : "No",
                  wiz_brideOkayBefore === null && !wiz_firstLookGroom
                )}
              </div>

              {/* 5. First Looks */}
              <div style={cardStyle}>
                {sectionHeading("First Looks")}
                {noFirstLooks ? noneSelected : (
                  <>
                    {wiz_firstLookGroom && reviewRow(`with ${groomLabel}`, wiz_firstLookGroomLocation || "(location not set)")}
                    {wiz_firstLookParent && reviewRow("with Parent(s)", wiz_firstLookParentLocation || "(location not set)")}
                    {wiz_firstLookBridesmaids && reviewRow("with Bridesmaids", wiz_firstLookBridesmaidsLocation || "(location not set)")}
                    {wiz_firstLookOther && reviewRow("Other First Look", wiz_firstLookOtherLocation || "(location not set)")}
                    {wiz_customFirstLooks.map((fl, i) => (
                      <div key={i}>{reviewRow(fl.label || "Custom", fl.location || "(location not set)")}</div>
                    ))}
                  </>
                )}
              </div>

              {/* 6. Ceremony */}
              <div style={cardStyle}>
                {sectionHeading("Ceremony")}
                {reviewRow("Start Time", `${wiz_ceremonyHour}:${wiz_ceremonyMinute} ${wiz_ceremonyPeriod}`)}
                {reviewRow("Duration", `${wiz_ceremonyDuration} min`)}
                {reviewRow("Guest Count", wiz_guestCount || "(not entered)", !wiz_guestCount)}
                {reviewRow("Setting", wiz_ceremonyOutdoor ? "Outdoor" : "Indoor")}
                {wiz_ceremonyNotes && reviewRow("Notes", wiz_ceremonyNotes)}
              </div>

              {/* 7. Portraits */}
              <div style={cardStyle}>
                {sectionHeading("Portraits")}
                {wiz_portraitLocations.length > 0
                  ? wiz_portraitLocations.map((loc, i) => (
                      <div key={i}>{reviewRow(`Portrait Location ${i + 1}`, [loc.name || "(unnamed)", loc.address].filter(Boolean).join(" — "))}</div>
                    ))
                  : reviewRow("Portrait Sessions", "None added")}
                {reviewRow("Family Groups", wiz_familyGroups === "none" ? "None" : wiz_familyGroups === "5" ? "5 Groups (~20 min)" : "10 Groups (~45 min)")}
                {wiz_familyGroups !== "none" && wiz_familyGroupNames.some(n => n) && reviewRow("Group Names", wiz_familyGroupNames.filter(Boolean).join(", "))}
              </div>

              {/* 8. Reception */}
              <div style={cardStyle}>
                {sectionHeading("Reception")}
                {reviewRow("Start Time", `${wiz_receptionHour}:${wiz_receptionMinute} ${wiz_receptionPeriod}`)}
                {reviewRow("Grand Entrance", wiz_grandEntrance ? "Yes" : "No")}
                {reviewRow("Dinner", wiz_dinner ? `${wiz_dinnerStartHour}:${wiz_dinnerStartMinute} ${wiz_dinnerStartPeriod}${wiz_dinnerStyle ? " — " + wiz_dinnerStyle : ""}` : "No")}
                {reviewRow("Reception Events", receptionEvents.length > 0 ? receptionEvents.join(", ") : "None")}
                {reviewRow("Speeches", wiz_speeches ? `${wiz_speechCount} speaker${wiz_speechCount !== 1 ? "s" : ""}` : "No")}
                {wiz_customReceptionEvents.length > 0 && wiz_customReceptionEvents.map((ev, i) => (
                  <div key={i}>{reviewRow(ev.label || "Custom", ev.duration ? ev.duration + " min" : "")}</div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 8 }}>
                <button onClick={() => setWizardStep(8)} style={{ padding: "12px 28px", border: "1px solid var(--wtb-accent)", borderRadius: 8, background: "transparent", color: "var(--wtb-text)", fontSize: 15, cursor: "pointer", fontFamily: "'Jost', sans-serif", fontWeight: 300 }}>
                  Go Back
                </button>
                <button onClick={generateTimeline} className="generate-btn" style={{ padding: "18px 48px", color: "var(--wtb-on-accent)", border: "none", borderRadius: 10, fontSize: 22, fontWeight: 400, cursor: "pointer", fontFamily: "'Cormorant Garamond', serif" }}>
                  Generate Timeline
                </button>
              </div>
            </div>
          </div>
        </div>
      );
}

export { WizardConfirm };
