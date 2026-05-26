import React from "react";
import { YesNoToggle, TimePickerRow, LocationDropdown } from "./wizardShared";

function WizardStep4(props) {
  const {
    stepCard, wizSectionHeading, wizCheckRowStyle, wizToggleStyle,
    enteredLocationNames,
    brideLabel, groomLabel, withThe,
    wiz_drone, wiz_narration,
    wiz_preCeremonyBrideReady, setWiz_preCeremonyBrideReady,
    wiz_preCeremonyGroomReady, setWiz_preCeremonyGroomReady,
    wiz_preCeremonyDetailRings, setWiz_preCeremonyDetailRings,
    wiz_preCeremonyDetailDress, setWiz_preCeremonyDetailDress,
    wiz_preCeremonyDetailDrone, setWiz_preCeremonyDetailDrone,
    wiz_preCeremonyDetails, setWiz_preCeremonyDetails,
    wiz_narrationBride, setWiz_narrationBride,
    wiz_narrationGroom, setWiz_narrationGroom,
    setWiz_narration,
    wiz_hasFirstLooks, setWiz_hasFirstLooks,
    wiz_firstLookGroom, setWiz_firstLookGroom,
    wiz_firstLookParent, setWiz_firstLookParent,
    wiz_firstLookBridesmaids, setWiz_firstLookBridesmaids,
    wiz_firstLookGroomLocation, setWiz_firstLookGroomLocation,
    wiz_firstLookParentLocation, setWiz_firstLookParentLocation,
    wiz_firstLookBridesmaidsLocation, setWiz_firstLookBridesmaidsLocation,
    wiz_customFirstLooks, setWiz_customFirstLooks, wiz_customFirstLookNextId, setWiz_customFirstLookNextId,
    wiz_brideOkayBefore, setWiz_brideOkayBefore,
    wiz_hasPreCeremonyHardStarts, setWiz_hasPreCeremonyHardStarts,
    wiz_preCeremonyHardStarts, setWiz_preCeremonyHardStarts,
    wiz_preCeremonyHardStartNextId, setWiz_preCeremonyHardStartNextId,
    setWizardStep,
  } = props;

  const syncDetails = (rings, dress, drone) => {
    setWiz_preCeremonyDetails(rings || dress || (drone && wiz_drone));
  };
  const syncNarration = (b, g) => setWiz_narration(b || g);

  const checkRow = (label, checked, onChange) => (
    <label style={{ ...wizCheckRowStyle }}>
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} style={{ width: 22, height: 22, marginTop: 2, cursor: "pointer", flexShrink: 0 }} />
      <div style={{ fontSize: 15, color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" }}>{label}</div>
    </label>
  );

  const inputStyle = { width: "100%", padding: 9, border: "1px solid var(--wtb-border)", borderRadius: 6, fontSize: 14, boxSizing: "border-box", background: "var(--wtb-surface)", color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" };
  const showVisibility = wiz_hasFirstLooks === true ? !wiz_firstLookGroom : wiz_hasFirstLooks === false;

  return stepCard(
    "Before the Ceremony",
    "What happens before the ceremony begins.",
    <div>
      {wizSectionHeading("Pre-Ceremony Coverage")}
      <p style={{ fontSize: 13, color: "var(--wtb-text-muted)", margin: "0 0 12px", fontFamily: "'Jost', sans-serif" }}>
        These are the standard pre-ceremony sessions. Uncheck anything you do not need.
      </p>
      <p style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--wtb-accent)", margin: "8px 0 6px", fontFamily: "'Jost', sans-serif" }}>Getting Ready Coverage</p>
      {checkRow(`${brideLabel} getting ready coverage`, wiz_preCeremonyBrideReady, setWiz_preCeremonyBrideReady)}
      {checkRow(`${groomLabel} getting ready coverage`, wiz_preCeremonyGroomReady, setWiz_preCeremonyGroomReady)}
      <p style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--wtb-accent)", margin: "16px 0 6px", fontFamily: "'Jost', sans-serif" }}>Detail Shots</p>
      {checkRow("Rings, Invitations & Accessories", wiz_preCeremonyDetailRings, (v) => { setWiz_preCeremonyDetailRings(v); syncDetails(v, wiz_preCeremonyDetailDress, wiz_preCeremonyDetailDrone); })}
      {checkRow("Dress Shots", wiz_preCeremonyDetailDress, (v) => { setWiz_preCeremonyDetailDress(v); syncDetails(wiz_preCeremonyDetailRings, v, wiz_preCeremonyDetailDrone); })}
      {wiz_drone && checkRow("Drone & Venue Shots", wiz_preCeremonyDetailDrone, (v) => { setWiz_preCeremonyDetailDrone(v); syncDetails(wiz_preCeremonyDetailRings, wiz_preCeremonyDetailDress, v); })}
      {wiz_narration && (
        <>
          <p style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--wtb-accent)", margin: "16px 0 6px", fontFamily: "'Jost', sans-serif" }}>Narration</p>
          {checkRow(`${brideLabel} narration recording`, wiz_narrationBride, (v) => { setWiz_narrationBride(v); syncNarration(v, wiz_narrationGroom); })}
          {checkRow(`${groomLabel} narration recording`, wiz_narrationGroom, (v) => { setWiz_narrationGroom(v); syncNarration(wiz_narrationBride, v); })}
        </>
      )}

      {wizSectionHeading("First Looks")}
      <p style={{ fontSize: 13, color: "var(--wtb-text-muted)", margin: "0 0 8px", fontFamily: "'Jost', sans-serif" }}>Will there be any first looks before the ceremony?</p>
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
          <label style={{ ...wizCheckRowStyle }}>
            <input type="checkbox" checked={wiz_firstLookGroom} onChange={(e) => setWiz_firstLookGroom(e.target.checked)} style={{ width: 22, height: 22, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontFamily: "'Jost', sans-serif" }}>{groomLabel} first look</div>
              {wiz_firstLookGroom && (
                <div style={{ marginTop: 8 }}>
                  <p style={{ fontSize: 12, color: "var(--wtb-text-muted)", margin: "0 0 4px" }}>Where will this first look take place?</p>
                  <LocationDropdown value={wiz_firstLookGroomLocation} onChange={setWiz_firstLookGroomLocation} locations={enteredLocationNames} />
                </div>
              )}
            </div>
          </label>
          <label style={{ ...wizCheckRowStyle }}>
            <input type="checkbox" checked={wiz_firstLookParent} onChange={(e) => setWiz_firstLookParent(e.target.checked)} style={{ width: 22, height: 22, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontFamily: "'Jost', sans-serif" }}>Parent(s) first look</div>
              {wiz_firstLookParent && (
                <div style={{ marginTop: 8 }}>
                  <p style={{ fontSize: 12, color: "var(--wtb-text-muted)", margin: "0 0 4px" }}>Where will this first look take place?</p>
                  <LocationDropdown value={wiz_firstLookParentLocation} onChange={setWiz_firstLookParentLocation} locations={enteredLocationNames} />
                </div>
              )}
            </div>
          </label>
          <label style={{ ...wizCheckRowStyle }}>
            <input type="checkbox" checked={wiz_firstLookBridesmaids} onChange={(e) => setWiz_firstLookBridesmaids(e.target.checked)} style={{ width: 22, height: 22, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontFamily: "'Jost', sans-serif" }}>Bridal party first look</div>
              {wiz_firstLookBridesmaids && (
                <div style={{ marginTop: 8 }}>
                  <p style={{ fontSize: 12, color: "var(--wtb-text-muted)", margin: "0 0 4px" }}>Where will this first look take place?</p>
                  <LocationDropdown value={wiz_firstLookBridesmaidsLocation} onChange={setWiz_firstLookBridesmaidsLocation} locations={enteredLocationNames} />
                </div>
              )}
            </div>
          </label>
          {wiz_customFirstLooks.map((fl, i) => (
            <div key={fl.id} style={{ border: "1px solid var(--wtb-border-subtle)", borderRadius: 8, padding: 12, marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "var(--wtb-text-muted)" }}>Custom first look</span>
                <button type="button" onClick={() => setWiz_customFirstLooks((prev) => prev.filter((_, idx) => idx !== i))} style={{ fontSize: 12, background: "none", border: "1px solid var(--wtb-border)", borderRadius: 4, padding: "2px 8px", cursor: "pointer" }}>Remove</button>
              </div>
              <input type="text" value={fl.label} placeholder="Label" onChange={(e) => setWiz_customFirstLooks((prev) => { const n = [...prev]; n[i] = { ...n[i], label: e.target.value }; return n; })} style={{ ...inputStyle, marginBottom: 6 }} />
              <LocationDropdown value={fl.location} onChange={(v) => setWiz_customFirstLooks((prev) => { const n = [...prev]; n[i] = { ...n[i], location: v }; return n; })} locations={enteredLocationNames} />
            </div>
          ))}
          <button type="button" onClick={() => { setWiz_customFirstLooks((prev) => [...prev, { id: wiz_customFirstLookNextId, label: "", location: "" }]); setWiz_customFirstLookNextId((n) => n + 1); }} style={{ padding: "9px 18px", background: "var(--wtb-surface-raised)", color: "var(--wtb-accent)", border: "1px solid var(--wtb-accent)", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "'Jost', sans-serif" }}>
            + Add First Look
          </button>
        </div>
      )}
      {showVisibility && (
        <div style={{ marginTop: 20 }}>
          <p style={{ fontSize: 14, color: "var(--wtb-text)", margin: "0 0 8px", fontFamily: "'Jost', sans-serif" }}>
            Is {withThe(brideLabel)} comfortable with {withThe(groomLabel)} seeing them before the ceremony?
          </p>
          <p style={{ fontSize: 12, color: "var(--wtb-text-faint)", margin: "0 0 8px", fontFamily: "'Jost', sans-serif" }}>
            This affects whether couple and wedding party portraits can be scheduled before the ceremony
          </p>
          <YesNoToggle value={wiz_brideOkayBefore} wizToggleStyle={wizToggleStyle} onYes={() => setWiz_brideOkayBefore(true)} onNo={() => setWiz_brideOkayBefore(false)} />
        </div>
      )}

      {wizSectionHeading("Fixed Start Times Before the Ceremony")}
      <p style={{ fontSize: 13, color: "var(--wtb-text-muted)", margin: "0 0 8px", fontFamily: "'Jost', sans-serif" }}>Does anything before the ceremony have a fixed start time?</p>
      <YesNoToggle
        value={wiz_hasPreCeremonyHardStarts}
        wizToggleStyle={wizToggleStyle}
        onYes={() => setWiz_hasPreCeremonyHardStarts(true)}
        onNo={() => { setWiz_hasPreCeremonyHardStarts(false); setWiz_preCeremonyHardStarts([]); }}
      />
      {wiz_hasPreCeremonyHardStarts && (
        <div style={{ marginTop: 14 }}>
          {wiz_preCeremonyHardStarts.map((item, i) => (
            <div key={item.id} style={{ border: "1px solid var(--wtb-border-subtle)", borderRadius: 8, padding: 14, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "var(--wtb-text-muted)" }}>Fixed time {i + 1}</span>
                <button type="button" onClick={() => setWiz_preCeremonyHardStarts((prev) => prev.filter((_, idx) => idx !== i))} style={{ fontSize: 12, background: "none", border: "1px solid var(--wtb-border)", borderRadius: 4, padding: "2px 8px", cursor: "pointer" }}>Remove</button>
              </div>
              <input type="text" value={item.eventName} placeholder="Event name" onChange={(e) => setWiz_preCeremonyHardStarts((prev) => { const n = [...prev]; n[i] = { ...n[i], eventName: e.target.value }; return n; })} style={{ ...inputStyle, marginBottom: 8 }} />
              <TimePickerRow hour={item.hour} minute={item.minute} period={item.period} onHour={(v) => setWiz_preCeremonyHardStarts((prev) => { const n = [...prev]; n[i] = { ...n[i], hour: v }; return n; })} onMinute={(v) => setWiz_preCeremonyHardStarts((prev) => { const n = [...prev]; n[i] = { ...n[i], minute: v }; return n; })} onPeriod={(v) => setWiz_preCeremonyHardStarts((prev) => { const n = [...prev]; n[i] = { ...n[i], period: v }; return n; })} />
              <label style={{ display: "block", fontSize: 12, color: "var(--wtb-text-muted)", marginTop: 8 }}>Duration in minutes</label>
              <input type="number" min={5} step={5} value={item.duration} onChange={(e) => setWiz_preCeremonyHardStarts((prev) => { const n = [...prev]; n[i] = { ...n[i], duration: parseInt(e.target.value, 10) || 15 }; return n; })} style={{ ...inputStyle, width: 100 }} />
            </div>
          ))}
          <button type="button" onClick={() => { setWiz_preCeremonyHardStarts((prev) => [...prev, { id: wiz_preCeremonyHardStartNextId, eventName: "", hour: "12", minute: "00", period: "PM", duration: 30 }]); setWiz_preCeremonyHardStartNextId((n) => n + 1); }} style={{ padding: "9px 18px", background: "var(--wtb-surface-raised)", color: "var(--wtb-accent)", border: "1px solid var(--wtb-accent)", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "'Jost', sans-serif" }}>
            + Add Hard Start Time
          </button>
        </div>
      )}
      <p style={{ fontSize: 12, color: "var(--wtb-text-faint)", marginTop: 12, fontStyle: "italic", fontFamily: "'Jost', sans-serif" }}>
        For example: hair and makeup artist arrival, venue access time, or a scheduled vendor
      </p>
    </div>,
    () => setWizardStep(3),
    () => setWizardStep(5)
  );
}

export { WizardStep4 };
