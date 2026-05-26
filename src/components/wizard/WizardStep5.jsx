import React from "react";
import { getGoldenHourWindow, formatGoldenHourRange } from "../../lib/goldenHour";
import { YesNoToggle } from "./wizardShared";

function WizardStep5(props) {
  const {
    stepCard, wizSectionHeading, wizCheckRowStyle, wizToggleStyle, allWizLocations,
    date, brideLabel, groomLabel, wiz_ceremonyVenue, wiz_ceremonyAddress,
    wiz_familyGroups, setWiz_familyGroups, wiz_familyGroupNames, setWiz_familyGroupNames,
    wiz_standardBridePartyPortraits, setWiz_standardBridePartyPortraits,
    wiz_standardGroomPartyPortraits, setWiz_standardGroomPartyPortraits,
    wiz_standardWeddingPartyShots, setWiz_standardWeddingPartyShots,
    wiz_standardCouplePortraits, setWiz_standardCouplePortraits,
    wiz_includeGoldenHour, setWiz_includeGoldenHour,
    wiz_portraitSessions, setWiz_portraitSessions, wiz_portraitSessionNextId, setWiz_portraitSessionNextId,
    wiz_portraitLocations, setWiz_portraitLocations,
    wiz_portraitLocationNextId, setWiz_portraitLocationNextId,
    wiz_hasFirstLooks, setWiz_hasFirstLooks,
    wiz_firstLookGroom, setWiz_firstLookGroom,
    wiz_firstLookParent, setWiz_firstLookParent,
    wiz_firstLookBridesmaids, setWiz_firstLookBridesmaids,
    wiz_firstLookGroomLocation, setWiz_firstLookGroomLocation,
    wiz_firstLookParentLocation, setWiz_firstLookParentLocation,
    wiz_firstLookBridesmaidsLocation, setWiz_firstLookBridesmaidsLocation,
    wiz_customFirstLooks, setWiz_customFirstLooks, wiz_customFirstLookNextId, setWiz_customFirstLookNextId,
    wiz_brideOkayBefore, setWiz_brideOkayBefore,
    wiz_preCeremonyBrideReady, setWiz_preCeremonyBrideReady,
    wiz_preCeremonyBrideParty, setWiz_preCeremonyBrideParty,
    wiz_preCeremonyGroomReady, setWiz_preCeremonyGroomReady,
    wiz_preCeremonyGroomParty, setWiz_preCeremonyGroomParty,
    withThe,
    setWizardStep,
  } = props;

  const gh = getGoldenHourWindow(date, wiz_ceremonyAddress);
  const ghRange = gh.available ? formatGoldenHourRange(gh.start, gh.sunset) : null;
  const dateLabel = date
    ? new Date(date + "T12:00:00").toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
    : "your wedding date";
  const locationLabel = wiz_ceremonyVenue || wiz_ceremonyAddress || "your ceremony location";

  const setBrideParty = (v) => {
    setWiz_standardBridePartyPortraits(v);
    setWiz_preCeremonyBrideReady(v);
    setWiz_preCeremonyBrideParty(v);
  };
  const setGroomParty = (v) => {
    setWiz_standardGroomPartyPortraits(v);
    setWiz_preCeremonyGroomReady(v);
    setWiz_preCeremonyGroomParty(v);
  };

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
    "We have included the standard portrait sessions for a typical wedding day. Uncheck any sessions you do not want. The app will figure out the best time to schedule each one based on your day.",
    <div>
      {wizSectionHeading("Standard Portrait Sessions")}
      {checkRow(`${brideLabel} & Bridal Party Portraits`, wiz_standardBridePartyPortraits, setBrideParty)}
      {checkRow(`${groomLabel} & Groomsmen Portraits`, wiz_standardGroomPartyPortraits, setGroomParty)}
      {checkRow("Wedding Party Group Shots", wiz_standardWeddingPartyShots, setWiz_standardWeddingPartyShots)}
      {checkRow(`${brideLabel} & ${groomLabel} Portraits`, wiz_standardCouplePortraits, setWiz_standardCouplePortraits)}

      <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--wtb-border-subtle)" }}>
        <h3 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 400, fontFamily: "'Cormorant Garamond', serif", color: "var(--wtb-text)" }}>Golden Hour Portraits</h3>
        <p style={{ fontSize: 13, color: "var(--wtb-text-muted)", lineHeight: 1.55, margin: "0 0 14px", fontFamily: "'Jost', sans-serif" }}>
          Golden hour is typically the most beautiful time for portraits — warm soft light just before sunset. There is only a brief window and it cannot be moved.
        </p>
        {gh.available ? (
          <p style={{ fontSize: 14, color: "var(--wtb-accent)", margin: "0 0 16px", fontFamily: "'Jost', sans-serif", lineHeight: 1.5 }}>
            Based on your wedding date ({dateLabel}) and ceremony location ({locationLabel}), golden hour will be from approximately {ghRange}.
          </p>
        ) : (
          <p style={{ fontSize: 13, color: "var(--wtb-text-muted)", margin: "0 0 16px", fontFamily: "'Jost', sans-serif" }}>
            Enter your wedding date and ceremony address on earlier steps to see an estimated golden hour window.
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
        {wiz_includeGoldenHour && (
          <p style={{ fontSize: 12, color: "var(--wtb-text-faint)", marginTop: 12, fontFamily: "'Jost', sans-serif" }}>
            The app will schedule these automatically at the right time. You may need to step away briefly from the reception.
          </p>
        )}
      </div>

      <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--wtb-border-subtle)" }}>
        <h3 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 400, fontFamily: "'Cormorant Garamond', serif", color: "var(--wtb-text)" }}>Family Group Photos</h3>
        <p style={{ fontSize: 13, color: "var(--wtb-text-muted)", lineHeight: 1.55, margin: "0 0 12px", fontFamily: "'Jost', sans-serif" }}>
          Family and group photos typically happen immediately after the ceremony while your guests are still present.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
          <button type="button" style={wizToggleStyle(wiz_familyGroups === "5")} onClick={() => setWiz_familyGroups("5")}>5 Groups (~20 min)</button>
          <button type="button" style={wizToggleStyle(wiz_familyGroups === "10")} onClick={() => setWiz_familyGroups("10")}>10 Groups (~45 min)</button>
          <button type="button" style={wizToggleStyle(wiz_familyGroups === "none")} onClick={() => setWiz_familyGroups("none")}>None</button>
        </div>
        {groupCount > 0 && Array.from({ length: groupCount }).map((_, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <label style={{ display: "block", fontSize: 12, color: "var(--wtb-text-muted)", marginBottom: 4, fontFamily: "'Jost', sans-serif" }}>Group {i + 1}</label>
            <input type="text" value={wiz_familyGroupNames[i] || ""} onChange={(e) => { const next = [...wiz_familyGroupNames]; next[i] = e.target.value; setWiz_familyGroupNames(next); }} placeholder="Who is in this group?" style={inputStyle} />
          </div>
        ))}
      </div>

      <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--wtb-border-subtle)" }}>
        <h3 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 400, fontFamily: "'Cormorant Garamond', serif", color: "var(--wtb-text)" }}>Additional Portrait Sessions</h3>
        <p style={{ fontSize: 13, color: "var(--wtb-text-muted)", margin: "0 0 12px", fontFamily: "'Jost', sans-serif" }}>
          Optional — special destinations or specific photo sessions beyond the standard set.
        </p>
        {wiz_portraitLocations.map((loc, i) => (
          <div key={loc.id} style={{ border: "1px solid var(--wtb-border-subtle)", borderRadius: 8, padding: 14, marginBottom: 10, background: "var(--wtb-surface)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "var(--wtb-text-muted)" }}>Session {i + 1}</span>
              <button type="button" onClick={() => setWiz_portraitLocations((prev) => prev.filter((_, idx) => idx !== i))} style={{ fontSize: 12, background: "none", border: "1px solid var(--wtb-border)", borderRadius: 4, padding: "2px 8px", cursor: "pointer", color: "var(--wtb-text-muted)" }}>Remove</button>
            </div>
            <label style={{ display: "block", fontSize: 12, color: "var(--wtb-text-muted)", marginBottom: 4 }}>What kind of session is this?</label>
            <input type="text" value={loc.description || loc.name || ""} onChange={(e) => setWiz_portraitLocations((prev) => { const n = [...prev]; n[i] = { ...n[i], description: e.target.value, name: e.target.value }; return n; })} style={{ ...inputStyle, marginBottom: 8 }} />
            <label style={{ display: "block", fontSize: 12, color: "var(--wtb-text-muted)", marginBottom: 4 }}>Location</label>
            <select value={loc.locationName || ""} onChange={(e) => setWiz_portraitLocations((prev) => { const n = [...prev]; n[i] = { ...n[i], locationName: e.target.value, name: e.target.value || loc.description }; return n; })} style={inputStyle}>
              <option value="">Select…</option>
              {allWizLocations.map((name, j) => <option key={j} value={name}>{name}</option>)}
            </select>
            <label style={{ display: "block", fontSize: 12, color: "var(--wtb-text-muted)", margin: "8px 0 4px" }}>Estimated duration (minutes)</label>
            <input type="number" min={5} step={5} value={loc.duration || 20} onChange={(e) => setWiz_portraitLocations((prev) => { const n = [...prev]; n[i] = { ...n[i], duration: parseInt(e.target.value, 10) || 20 }; return n; })} style={{ ...inputStyle, width: 100 }} />
          </div>
        ))}
        <button type="button" onClick={() => { setWiz_portraitLocations((prev) => [...prev, { id: wiz_portraitLocationNextId, name: "", description: "", locationName: "", distFromCeremony: "15", distFromReception: "0", duration: 20 }]); setWiz_portraitLocationNextId((n) => n + 1); }} style={{ padding: "9px 18px", background: "var(--wtb-surface-raised)", color: "var(--wtb-accent)", border: "1px solid var(--wtb-accent)", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "'Jost', sans-serif" }}>
          + Add Portrait Session
        </button>
      </div>

      <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--wtb-border-subtle)" }}>
        <h3 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 400, fontFamily: "'Cormorant Garamond', serif", color: "var(--wtb-text)" }}>First Looks</h3>
        <p style={{ fontSize: 13, color: "var(--wtb-text-muted)", margin: "0 0 10px", fontFamily: "'Jost', sans-serif" }}>Will there be any first looks before the ceremony?</p>
        <YesNoToggle
          value={wiz_hasFirstLooks}
          wizToggleStyle={wizToggleStyle}
          onYes={() => setWiz_hasFirstLooks(true)}
          onNo={() => {
            setWiz_hasFirstLooks(false);
            setWiz_firstLookGroom(false);
            setWiz_firstLookParent(false);
            setWiz_firstLookBridesmaids(false);
            setWiz_customFirstLooks([]);
          }}
        />
        {wiz_hasFirstLooks && (
          <div style={{ marginTop: 14 }}>
            {[
              { key: "groom", label: groomLabel, val: wiz_firstLookGroom, set: setWiz_firstLookGroom, loc: wiz_firstLookGroomLocation, setLoc: setWiz_firstLookGroomLocation },
              { key: "parent", label: "Parent(s)", val: wiz_firstLookParent, set: setWiz_firstLookParent, loc: wiz_firstLookParentLocation, setLoc: setWiz_firstLookParentLocation },
              { key: "party", label: "Bridal Party", val: wiz_firstLookBridesmaids, set: setWiz_firstLookBridesmaids, loc: wiz_firstLookBridesmaidsLocation, setLoc: setWiz_firstLookBridesmaidsLocation },
            ].map(({ key, label, val, set, loc, setLoc }) => (
              <label key={key} style={{ ...wizCheckRowStyle }}>
                <input type="checkbox" checked={val} onChange={(e) => set(e.target.checked)} style={{ width: 22, height: 22, marginTop: 2, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" }}>{label}</div>
                  {val && (
                    <select value={loc} onChange={(e) => setLoc(e.target.value)} style={{ ...inputStyle, marginTop: 8 }} onClick={(e) => e.stopPropagation()}>
                      <option value="">Location…</option>
                      {allWizLocations.map((name, j) => <option key={j} value={name}>{name}</option>)}
                    </select>
                  )}
                </div>
              </label>
            ))}
            {wiz_customFirstLooks.map((fl, i) => (
              <div key={fl.id} style={{ border: "1px solid var(--wtb-border-subtle)", borderRadius: 8, padding: 12, marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "var(--wtb-text-muted)" }}>Custom first look</span>
                  <button type="button" onClick={() => setWiz_customFirstLooks((prev) => prev.filter((_, idx) => idx !== i))} style={{ fontSize: 12, background: "none", border: "1px solid var(--wtb-border)", borderRadius: 4, padding: "2px 8px", cursor: "pointer" }}>Remove</button>
                </div>
                <input type="text" value={fl.label} placeholder="Label" onChange={(e) => setWiz_customFirstLooks((prev) => { const n = [...prev]; n[i] = { ...n[i], label: e.target.value }; return n; })} style={{ ...inputStyle, marginBottom: 6 }} />
                <select value={fl.location} onChange={(e) => setWiz_customFirstLooks((prev) => { const n = [...prev]; n[i] = { ...n[i], location: e.target.value }; return n; })} style={inputStyle}>
                  <option value="">Location…</option>
                  {allWizLocations.map((name, j) => <option key={j} value={name}>{name}</option>)}
                </select>
              </div>
            ))}
            <button type="button" onClick={() => { setWiz_customFirstLooks((prev) => [...prev, { id: wiz_customFirstLookNextId, label: "", location: "" }]); setWiz_customFirstLookNextId((n) => n + 1); }} style={{ padding: "9px 18px", background: "var(--wtb-surface-raised)", color: "var(--wtb-accent)", border: "1px solid var(--wtb-accent)", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "'Jost', sans-serif" }}>
              + Add First Look
            </button>
          </div>
        )}
        {wiz_hasFirstLooks && !wiz_firstLookGroom && (
          <div style={{ marginTop: 20 }}>
            <p style={{ fontSize: 14, color: "var(--wtb-text)", margin: "0 0 8px", fontFamily: "'Jost', sans-serif" }}>
              Is {withThe(brideLabel)} okay with {withThe(groomLabel)} seeing them before the ceremony?
            </p>
            <YesNoToggle value={wiz_brideOkayBefore} wizToggleStyle={wizToggleStyle} onYes={() => setWiz_brideOkayBefore(true)} onNo={() => setWiz_brideOkayBefore(false)} />
          </div>
        )}
      </div>
    </div>,
    () => setWizardStep(4),
    () => setWizardStep(6)
  );
}

export { WizardStep5 };
