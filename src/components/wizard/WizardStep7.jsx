import React from "react";
import { TimePickerRow, FlexibilityControl } from "./wizardShared";

function WizardStep7(props) {
  const {
    stepCard, wizSectionHeading, wizCheckRowStyle, wizToggleStyle,
    brideLabel, groomLabel,
    wiz_receptionHour, setWiz_receptionHour, wiz_receptionMinute, setWiz_receptionMinute, wiz_receptionPeriod, setWiz_receptionPeriod,
    wiz_receptionFlexHard, setWiz_receptionFlexHard, wiz_receptionFlexMinutes, setWiz_receptionFlexMinutes,
    wiz_grandEntrance, setWiz_grandEntrance, wiz_grandEntranceSub, setWiz_grandEntranceSub,
    wiz_dinner, setWiz_dinner,
    wiz_dinnerStartHour, setWiz_dinnerStartHour, wiz_dinnerStartMinute, setWiz_dinnerStartMinute, wiz_dinnerStartPeriod, setWiz_dinnerStartPeriod,
    wiz_dinnerFlexHard, setWiz_dinnerFlexHard, wiz_dinnerFlexMinutes, setWiz_dinnerFlexMinutes,
    wiz_dinnerStyle, setWiz_dinnerStyle,
    wiz_cakeCutting, setWiz_cakeCutting, wiz_firstDance, setWiz_firstDance,
    wiz_brideParentDance, setWiz_brideParentDance, wiz_groomParentDance, setWiz_groomParentDance,
    wiz_openDanceFloor, setWiz_openDanceFloor, wiz_garterToss, setWiz_garterToss, wiz_bouquetToss, setWiz_bouquetToss,
    wiz_speeches, setWiz_speeches, wiz_speechCount, setWiz_speechCount,
    wiz_speechMinutesPerSpeaker, setWiz_speechMinutesPerSpeaker,
    wiz_customReceptionEvents, setWiz_customReceptionEvents, wiz_customReceptionEventNextId, setWiz_customReceptionEventNextId,
    setWizardStep,
  } = props;

  const eventRow = (label, val, set) => (
    <label style={{ ...wizCheckRowStyle }}>
      <input type="checkbox" checked={!!val} onChange={(e) => set(e.target.checked)} style={{ width: 22, height: 22, marginTop: 2, cursor: "pointer", flexShrink: 0 }} />
      <div style={{ fontSize: 15, color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" }}>{label}</div>
    </label>
  );

  return stepCard(
    "The Reception",
    "When the reception begins and what happens once you arrive.",
    <div>
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 13, color: "var(--wtb-text-muted)", marginBottom: 8, fontFamily: "'Jost', sans-serif" }}>Reception start time</label>
        <TimePickerRow hour={wiz_receptionHour} minute={wiz_receptionMinute} period={wiz_receptionPeriod} onHour={setWiz_receptionHour} onMinute={setWiz_receptionMinute} onPeriod={setWiz_receptionPeriod} />
      </div>
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: "block", fontSize: 13, color: "var(--wtb-text-muted)", marginBottom: 6, fontFamily: "'Jost', sans-serif" }}>How flexible is this start time?</label>
        <FlexibilityControl hard={wiz_receptionFlexHard} onHardChange={setWiz_receptionFlexHard} flexMinutes={wiz_receptionFlexMinutes} onFlexMinutesChange={setWiz_receptionFlexMinutes} />
      </div>

      {wizSectionHeading("Reception Events")}

      <label style={{ ...wizCheckRowStyle }}>
        <input type="checkbox" checked={wiz_grandEntrance} onChange={(e) => setWiz_grandEntrance(e.target.checked)} style={{ width: 22, height: 22, marginTop: 2, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontFamily: "'Jost', sans-serif" }}>Grand Entrance</div>
          {wiz_grandEntrance && (
            <div style={{ display: "flex", gap: 8, marginTop: 10 }} onClick={(e) => e.stopPropagation()}>
              <button type="button" style={wizToggleStyle(wiz_grandEntranceSub === "full")} onClick={() => setWiz_grandEntranceSub("full")}>Full wedding party entrances</button>
              <button type="button" style={wizToggleStyle(wiz_grandEntranceSub === "couple")} onClick={() => setWiz_grandEntranceSub("couple")}>Just {brideLabel} & {groomLabel}</button>
            </div>
          )}
        </div>
      </label>

      <label style={{ ...wizCheckRowStyle }}>
        <input type="checkbox" checked={wiz_dinner} onChange={(e) => setWiz_dinner(e.target.checked)} style={{ width: 22, height: 22, marginTop: 2, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontFamily: "'Jost', sans-serif" }}>Dinner</div>
          {wiz_dinner && (
            <div style={{ marginTop: 12 }} onClick={(e) => e.stopPropagation()}>
              <label style={{ display: "block", fontSize: 13, color: "var(--wtb-text-muted)", marginBottom: 6 }}>Dinner start time</label>
              <TimePickerRow hour={wiz_dinnerStartHour} minute={wiz_dinnerStartMinute} period={wiz_dinnerStartPeriod} onHour={setWiz_dinnerStartHour} onMinute={setWiz_dinnerStartMinute} onPeriod={setWiz_dinnerStartPeriod} />
              <p style={{ fontSize: 13, color: "var(--wtb-text-muted)", margin: "12px 0 6px" }}>How flexible is dinner?</p>
              <FlexibilityControl hard={wiz_dinnerFlexHard} onHardChange={setWiz_dinnerFlexHard} flexMinutes={wiz_dinnerFlexMinutes} onFlexMinutesChange={setWiz_dinnerFlexMinutes} />
              <p style={{ fontSize: 12, color: "var(--wtb-text-faint)", margin: "8px 0 12px", fontFamily: "'Jost', sans-serif" }}>
                Dinner start time flexibility helps the app resolve scheduling conflicts when needed
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                {["Plated", "Buffet"].map((s) => (
                  <button key={s} type="button" style={wizToggleStyle(wiz_dinnerStyle === s)} onClick={() => setWiz_dinnerStyle(s)}>{s}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </label>

      {eventRow("Cake Cutting", wiz_cakeCutting, setWiz_cakeCutting)}
      {eventRow("First Dance", wiz_firstDance, setWiz_firstDance)}
      {eventRow(`${brideLabel} & Parent Dance`, wiz_brideParentDance, setWiz_brideParentDance)}
      {eventRow(`${groomLabel} & Parent Dance`, wiz_groomParentDance, setWiz_groomParentDance)}
      {eventRow("Open Dance Floor", wiz_openDanceFloor, setWiz_openDanceFloor)}
      {eventRow("Garter Toss", wiz_garterToss, setWiz_garterToss)}
      {eventRow("Bouquet Toss", wiz_bouquetToss, setWiz_bouquetToss)}

      <label style={{ ...wizCheckRowStyle }}>
        <input type="checkbox" checked={wiz_speeches} onChange={(e) => setWiz_speeches(e.target.checked)} style={{ width: 22, height: 22, marginTop: 2, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontFamily: "'Jost', sans-serif" }}>Speeches</div>
          {wiz_speeches && (
            <div style={{ marginTop: 8 }} onClick={(e) => e.stopPropagation()}>
              <label style={{ fontSize: 13, color: "var(--wtb-text-muted)", display: "block", marginBottom: 4 }}>Number of speakers</label>
              <input type="number" min={1} value={wiz_speechCount} onChange={(e) => setWiz_speechCount(parseInt(e.target.value, 10) || 1)} style={{ padding: 6, border: "1px solid var(--wtb-border)", borderRadius: 6, width: 60, marginBottom: 10, background: "var(--wtb-surface)", color: "var(--wtb-text)" }} />
              <label style={{ fontSize: 13, color: "var(--wtb-text-muted)", display: "block", marginBottom: 4 }}>Time per speaker (minutes)</label>
              <input type="number" min={1} value={wiz_speechMinutesPerSpeaker} onChange={(e) => setWiz_speechMinutesPerSpeaker(parseInt(e.target.value, 10) || 10)} style={{ padding: 6, border: "1px solid var(--wtb-border)", borderRadius: 6, width: 60, background: "var(--wtb-surface)", color: "var(--wtb-text)" }} />
              <p style={{ fontSize: 12, color: "var(--wtb-text-muted)", margin: "8px 0 0", fontFamily: "'Jost', sans-serif" }}>
                Include anyone doing a blessing or prayer. You can adjust individual speaker times in the timeline after generation.
              </p>
            </div>
          )}
        </div>
      </label>

      {wizSectionHeading("Custom Events")}
      {wiz_customReceptionEvents.map((ev, i) => (
        <div key={ev.id} style={{ border: "1px solid var(--wtb-border-subtle)", borderRadius: 8, padding: 14, marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: "var(--wtb-text-muted)" }}>Custom event {i + 1}</span>
            <button type="button" onClick={() => setWiz_customReceptionEvents((prev) => prev.filter((_, idx) => idx !== i))} style={{ fontSize: 12, background: "none", border: "1px solid var(--wtb-border)", borderRadius: 4, padding: "2px 8px", cursor: "pointer" }}>Remove</button>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <input type="text" value={ev.label} placeholder="Event name" onChange={(e) => setWiz_customReceptionEvents((prev) => { const n = [...prev]; n[i] = { ...n[i], label: e.target.value }; return n; })} style={{ flex: 1, padding: "8px 10px", border: "1px solid var(--wtb-border)", borderRadius: 6, fontSize: 14, background: "var(--wtb-surface)", color: "var(--wtb-text)" }} />
            <input type="number" min={5} step={5} value={ev.duration} onChange={(e) => setWiz_customReceptionEvents((prev) => { const n = [...prev]; n[i] = { ...n[i], duration: parseInt(e.target.value, 10) || 15 }; return n; })} style={{ width: 72, padding: "8px 10px", border: "1px solid var(--wtb-border)", borderRadius: 6, textAlign: "center", background: "var(--wtb-surface)", color: "var(--wtb-text)" }} />
          </div>
        </div>
      ))}
      <button type="button" onClick={() => { setWiz_customReceptionEvents((prev) => [...prev, { id: wiz_customReceptionEventNextId, label: "", duration: 15 }]); setWiz_customReceptionEventNextId((n) => n + 1); }} style={{ padding: "9px 18px", background: "var(--wtb-surface-raised)", color: "var(--wtb-accent)", border: "1px solid var(--wtb-accent)", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "'Jost', sans-serif" }}>
        + Add Custom Event
      </button>
    </div>,
    () => setWizardStep(6),
    () => setWizardStep(8),
    "Next"
  );
}

export { WizardStep7 };
