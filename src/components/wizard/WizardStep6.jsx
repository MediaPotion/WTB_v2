import React, { useEffect, useState } from "react";
import { YesNoToggle, LocationDropdown } from "./wizardShared";
import {
  geocodeAddress,
  getGoldenHourFromCoords,
  getGoldenHourWindowSync,
  formatGoldenHourRange,
  goldenHourOverlapsReception,
} from "../../lib/goldenHour";

function WizardStep6(props) {
  const {
    stepCard, wizSectionHeading, wizCheckRowStyle, wizToggleStyle,
    enteredLocationNames,
    date, brideLabel, groomLabel,
    wiz_ceremonyVenue, wiz_ceremonyAddress,
    wiz_receptionHour, wiz_receptionMinute, wiz_receptionPeriod,
    wiz_familyGroups, setWiz_familyGroups, wiz_familyGroupNames, setWiz_familyGroupNames,
    wiz_standardPerson1Solo, setWiz_standardPerson1Solo,
    wiz_standardPerson2Solo, setWiz_standardPerson2Solo,
    wiz_standardBridePartyPortraits, setWiz_standardBridePartyPortraits,
    wiz_standardGroomPartyPortraits, setWiz_standardGroomPartyPortraits,
    wiz_standardWeddingPartyShots, setWiz_standardWeddingPartyShots,
    wiz_standardCouplePortraits, setWiz_standardCouplePortraits,
    wiz_preCeremonyBrideParty, setWiz_preCeremonyBrideParty,
    wiz_preCeremonyGroomParty, setWiz_preCeremonyGroomParty,
    wiz_includeGoldenHour, setWiz_includeGoldenHour,
    wiz_portraitSessions, setWiz_portraitSessions, wiz_portraitSessionNextId, setWiz_portraitSessionNextId,
    wiz_portraitLocations, setWiz_portraitLocations, wiz_portraitLocationNextId, setWiz_portraitLocationNextId,
    setWizardStep,
  } = props;

  const [ghLoading, setGhLoading] = useState(true);
  const [gh, setGh] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setGhLoading(true);
    const run = async () => {
      const estimate = getGoldenHourWindowSync(date, wiz_ceremonyAddress);
      if (!date || !String(wiz_ceremonyAddress || "").trim()) {
        if (!cancelled) { setGh(null); setGhLoading(false); }
        return;
      }
      const coords = await geocodeAddress(wiz_ceremonyAddress);
      const result = coords
        ? getGoldenHourFromCoords(date, coords.lat, coords.lon)
        : estimate;
      if (!cancelled) {
        setGh(result);
        setGhLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [date, wiz_ceremonyAddress]);

  const setBrideParty = (v) => {
    setWiz_standardBridePartyPortraits(v);
    setWiz_preCeremonyBrideParty(v);
  };
  const setGroomParty = (v) => {
    setWiz_standardGroomPartyPortraits(v);
    setWiz_preCeremonyGroomParty(v);
  };

  const dateLabel = date
    ? new Date(date + "T12:00:00").toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
    : "";
  const locationLabel = wiz_ceremonyVenue || wiz_ceremonyAddress || "";
  const ghRange = gh ? formatGoldenHourRange(gh.start, gh.sunset) : null;
  const overlapsReception = gh && goldenHourOverlapsReception(gh, wiz_receptionHour, wiz_receptionMinute, wiz_receptionPeriod);

  const checkRow = (label, checked, onChange) => (
    <label style={{ ...wizCheckRowStyle }}>
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} style={{ width: 22, height: 22, marginTop: 2, cursor: "pointer", flexShrink: 0 }} />
      <div style={{ fontSize: 15, color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" }}>{label}</div>
    </label>
  );

  const groupCount = wiz_familyGroups === "none" ? 0 : parseInt(wiz_familyGroups, 10);
  const inputStyle = { width: "100%", padding: 9, border: "1px solid var(--wtb-border)", borderRadius: 6, fontSize: 14, boxSizing: "border-box", background: "var(--wtb-surface)", color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" };

  return stepCard(
    "Portrait Sessions",
    "We have included the standard portrait sessions for a typical wedding day. Uncheck any you do not want. The app will figure out the best time to schedule each one.",
    <div>
      {wizSectionHeading("Standard Portrait Sessions")}
      {checkRow(`${brideLabel} Solo Portraits`, wiz_standardPerson1Solo, setWiz_standardPerson1Solo)}
      {checkRow(`${groomLabel} Solo Portraits`, wiz_standardPerson2Solo, setWiz_standardPerson2Solo)}
      {checkRow(`${brideLabel} & Bridal Party Portraits`, wiz_standardBridePartyPortraits, setBrideParty)}
      {checkRow(`${groomLabel} & Groomsmen Portraits`, wiz_standardGroomPartyPortraits, setGroomParty)}
      {checkRow("Wedding Party Group Shots", wiz_standardWeddingPartyShots, setWiz_standardWeddingPartyShots)}
      {checkRow(`${brideLabel} & ${groomLabel} Portraits`, wiz_standardCouplePortraits, setWiz_standardCouplePortraits)}

      <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--wtb-border-subtle)" }}>
        <h3 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 400, fontFamily: "'Cormorant Garamond', serif" }}>Golden Hour Portraits</h3>
        <p style={{ fontSize: 13, color: "var(--wtb-text-muted)", lineHeight: 1.55, margin: "0 0 14px", fontFamily: "'Jost', sans-serif" }}>
          Golden hour is the window of time just before sunset when natural light is at its most beautiful — warm, soft, and cinematic. It is often the best time of the entire wedding day for portraits. However it is a brief window that cannot be moved or rescheduled.
        </p>
        {ghLoading ? (
          <p style={{ fontSize: 13, color: "var(--wtb-text-muted)", fontFamily: "'Jost', sans-serif" }}>Calculating golden hour window…</p>
        ) : gh && dateLabel && locationLabel ? (
          <p style={{ fontSize: 14, color: "var(--wtb-accent)", margin: "0 0 12px", lineHeight: 1.5, fontFamily: "'Jost', sans-serif" }}>
            Based on your {dateLabel} wedding in {locationLabel}, golden hour will be from approximately {ghRange} — a {gh.windowMinutes} minute window.
          </p>
        ) : (
          <p style={{ fontSize: 13, color: "var(--wtb-text-muted)", margin: "0 0 12px", fontFamily: "'Jost', sans-serif" }}>
            Enter your ceremony address in Step 2 to see your exact golden hour window.
          </p>
        )}
        {overlapsReception && (
          <p style={{ fontSize: 13, color: "var(--wtb-accent)", margin: "0 0 12px", fontFamily: "'Jost', sans-serif" }}>
            Note: Golden hour falls during your reception. Couples typically step away for 15–20 minutes to capture these shots.
          </p>
        )}
        <p style={{ fontSize: 13, color: "var(--wtb-text-muted)", margin: "0 0 8px", fontFamily: "'Jost', sans-serif" }}>Include golden hour portraits?</p>
        <YesNoToggle
          value={wiz_includeGoldenHour}
          wizToggleStyle={wizToggleStyle}
          onYes={() => {
            setWiz_includeGoldenHour(true);
            setWiz_portraitSessions((prev) => {
              if (prev.some((s) => s.type === "Golden Hour")) return prev;
              return [...prev, { id: wiz_portraitSessionNextId, type: "Golden Hour", location: wiz_ceremonyVenue || "" }];
            });
            setWiz_portraitSessionNextId((n) => n + 1);
          }}
          onNo={() => {
            setWiz_includeGoldenHour(false);
            setWiz_portraitSessions((prev) => prev.filter((s) => s.type !== "Golden Hour"));
          }}
        />
      </div>

      <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--wtb-border-subtle)" }}>
        <h3 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 400, fontFamily: "'Cormorant Garamond', serif" }}>Family Group Photos</h3>
        <p style={{ fontSize: 13, color: "var(--wtb-text-muted)", lineHeight: 1.55, margin: "0 0 12px", fontFamily: "'Jost', sans-serif" }}>
          Family and group photos typically follow directly after the ceremony while your guests are still present and dressed.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
          <button type="button" style={wizToggleStyle(wiz_familyGroups === "5")} onClick={() => setWiz_familyGroups("5")}>5 Groups (~20 min)</button>
          <button type="button" style={wizToggleStyle(wiz_familyGroups === "10")} onClick={() => setWiz_familyGroups("10")}>10 Groups (~45 min)</button>
          <button type="button" style={wizToggleStyle(wiz_familyGroups === "none")} onClick={() => setWiz_familyGroups("none")}>None</button>
        </div>
        {groupCount > 0 && Array.from({ length: groupCount }).map((_, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <label style={{ display: "block", fontSize: 12, color: "var(--wtb-text-muted)", marginBottom: 4 }}>Group {i + 1}</label>
            <input type="text" value={wiz_familyGroupNames[i] || ""} onChange={(e) => { const next = [...wiz_familyGroupNames]; next[i] = e.target.value; setWiz_familyGroupNames(next); }} placeholder="Who is in this group?" style={inputStyle} />
          </div>
        ))}
      </div>

      <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--wtb-border-subtle)" }}>
        <h3 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 400, fontFamily: "'Cormorant Garamond', serif" }}>Additional Portrait Sessions</h3>
        <p style={{ fontSize: 13, color: "var(--wtb-text-muted)", margin: "0 0 12px", fontFamily: "'Jost', sans-serif" }}>
          Have a special portrait destination, a specific type of session, or additional group photos with extended family and friends beyond the standard sessions? Add it here.
        </p>
        {wiz_portraitLocations.map((loc, i) => (
          <div key={loc.id} style={{ border: "1px solid var(--wtb-border-subtle)", borderRadius: 8, padding: 14, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "var(--wtb-text-muted)" }}>Session {i + 1}</span>
              <button type="button" onClick={() => setWiz_portraitLocations((prev) => prev.filter((_, idx) => idx !== i))} style={{ fontSize: 12, background: "none", border: "1px solid var(--wtb-border)", borderRadius: 4, padding: "2px 8px", cursor: "pointer" }}>Remove</button>
            </div>
            <label style={{ display: "block", fontSize: 12, color: "var(--wtb-text-muted)", marginBottom: 4 }}>What kind of session is this?</label>
            <input type="text" value={loc.description || loc.name || ""} onChange={(e) => setWiz_portraitLocations((prev) => { const n = [...prev]; n[i] = { ...n[i], description: e.target.value, name: e.target.value }; return n; })} style={{ ...inputStyle, marginBottom: 8 }} />
            <label style={{ display: "block", fontSize: 12, color: "var(--wtb-text-muted)", marginBottom: 4 }}>Location</label>
            <LocationDropdown value={loc.locationName || loc.name || ""} onChange={(v) => setWiz_portraitLocations((prev) => { const n = [...prev]; n[i] = { ...n[i], locationName: v, name: v || loc.description }; return n; })} locations={enteredLocationNames} />
            <label style={{ display: "block", fontSize: 12, color: "var(--wtb-text-muted)", margin: "8px 0 4px" }}>Estimated duration (minutes)</label>
            <input type="number" min={5} step={5} value={loc.duration || 20} onChange={(e) => setWiz_portraitLocations((prev) => { const n = [...prev]; n[i] = { ...n[i], duration: parseInt(e.target.value, 10) || 20 }; return n; })} style={{ ...inputStyle, width: 100 }} />
          </div>
        ))}
        <button type="button" onClick={() => { setWiz_portraitLocations((prev) => [...prev, { id: wiz_portraitLocationNextId, name: "", description: "", locationName: "", distFromCeremony: "15", distFromReception: "0", duration: 20 }]); setWiz_portraitLocationNextId((n) => n + 1); }} style={{ padding: "9px 18px", background: "var(--wtb-surface-raised)", color: "var(--wtb-accent)", border: "1px solid var(--wtb-accent)", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "'Jost', sans-serif" }}>
          + Add Portrait Session
        </button>
      </div>
    </div>,
    () => setWizardStep(5),
    () => setWizardStep(7)
  );
}

export { WizardStep6 };
