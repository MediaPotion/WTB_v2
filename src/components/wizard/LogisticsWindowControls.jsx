import React, { useMemo } from "react";
import { TimePickerRow, YesNoToggle, FlexibilityControl } from "./wizardShared";
import {
  getGoldenHourFromCoords,
  getGoldenHourWindowSync,
  formatMinutes,
} from "../../lib/goldenHour";
import { findGoldenHourOverlap } from "./logisticsPresentation";

const labelStyle = {
  display: "block",
  fontSize: 13,
  color: "var(--wtb-text-muted)",
  marginBottom: 8,
  fontFamily: "'Jost', sans-serif",
};

function HighlightedField({ highlight, hint, children }) {
  return (
    <div
      className={highlight ? "wtb-logistics-control--highlight" : ""}
      style={{
        border: highlight
          ? "2px solid var(--wtb-accent)"
          : "1px solid var(--wtb-border-subtle)",
        borderRadius: 10,
        padding: "14px 16px",
        marginBottom: 12,
        background: highlight ? "rgba(184, 144, 106, 0.08)" : "var(--wtb-surface)",
        transition: "border-color 0.35s ease, background 0.35s ease",
      }}
    >
      {children}
      {hint ? (
        <p
          style={{
            margin: "10px 0 0",
            fontSize: 12,
            color: "var(--wtb-accent)",
            lineHeight: 1.55,
            fontFamily: "'Jost', sans-serif",
          }}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function SessionToggle({ label, checked, onChange, highlight, hint, wizCheckRowStyle, impact }) {
  return (
    <HighlightedField highlight={highlight} hint={hint || impact}>
      <label
        style={{
          ...wizCheckRowStyle,
          marginBottom: 0,
          border: "none",
          background: "transparent",
          padding: 0,
        }}
      >
        <input
          type="checkbox"
          checked={!!checked}
          onChange={(e) => onChange(e.target.checked)}
          style={{ width: 22, height: 22, marginTop: 2, cursor: "pointer", flexShrink: 0 }}
        />
        <div style={{ fontSize: 15, color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" }}>
          {label}
        </div>
      </label>
    </HighlightedField>
  );
}

function FamilyGroupsSelector({ value, onChange, highlight, hint, wizToggleStyle }) {
  const options = [
    { key: "10", label: "10 Groups" },
    { key: "5", label: "5 Groups" },
    { key: "none", label: "None" },
  ];
  return (
    <HighlightedField highlight={highlight} hint={hint}>
      <label style={labelStyle}>Family photos after ceremony</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {options.map((o) => (
          <button key={o.key} type="button" style={wizToggleStyle(value === o.key)} onClick={() => onChange(o.key)}>
            {o.label}
          </button>
        ))}
      </div>
    </HighlightedField>
  );
}

const RECEPTION_TOGGLES = [
  { match: (e) => e.includes("Cake"), key: "cake", label: "Cake cutting", minutes: 10, prop: "wiz_cakeCutting", setter: "setWiz_cakeCutting" },
  { match: (e) => e.includes("First Dance"), key: "dance", label: "First dance", minutes: 5, prop: "wiz_firstDance", setter: "setWiz_firstDance" },
  { match: (e) => e.includes("Parent Dance") && e.includes("Bride"), key: "bpd", label: "Bride parent dance", minutes: 5, prop: "wiz_brideParentDance", setter: "setWiz_brideParentDance" },
  { match: (e) => e.includes("Parent Dance") && e.includes("Groom"), key: "gpd", label: "Groom parent dance", minutes: 5, prop: "wiz_groomParentDance", setter: "setWiz_groomParentDance" },
  { match: (e) => e.includes("Speeches"), key: "speech", label: "Speeches", minutes: 15, prop: "wiz_speeches", setter: "setWiz_speeches" },
  { match: (e) => e.includes("Garter"), key: "garter", label: "Garter toss", minutes: 10, prop: "wiz_garterToss", setter: "setWiz_garterToss" },
  { match: (e) => e.includes("Bouquet"), key: "bouquet", label: "Bouquet toss", minutes: 10, prop: "wiz_bouquetToss", setter: "setWiz_bouquetToss" },
  { match: (e) => e.includes("Grand Entrance"), key: "entrance", label: "Grand entrance", minutes: 5, prop: "wiz_grandEntrance", setter: "setWiz_grandEntrance" },
  { match: (e) => e.includes("Open Dance"), key: "open", label: "Open dance floor", minutes: 0, prop: "wiz_openDanceFloor", setter: "setWiz_openDanceFloor" },
];

function LogisticsWindowControls({ windowId, window: w, windows, inlineHints, highlightAll, ...props }) {
  const {
    wizToggleStyle,
    wizCheckRowStyle,
    brideLabel,
    groomLabel,
    date,
    wiz_dinner,
    wiz_geocodeSuccess,
    wiz_venueLat,
    wiz_venueLng,
    wiz_brideOkayBefore,
    photoStartHour,
    photoStartMinute,
    photoStartPeriod,
    setPhotoStartHour,
    setPhotoStartMinute,
    setPhotoStartPeriod,
    wiz_receptionHour,
    wiz_receptionMinute,
    wiz_receptionPeriod,
    setWiz_receptionHour,
    setWiz_receptionMinute,
    setWiz_receptionPeriod,
    wiz_receptionFlexHard,
    setWiz_receptionFlexHard,
    wiz_receptionFlexMinutes,
    setWiz_receptionFlexMinutes,
    wiz_dinnerStartHour,
    wiz_dinnerStartMinute,
    wiz_dinnerStartPeriod,
    setWiz_dinnerStartHour,
    setWiz_dinnerStartMinute,
    setWiz_dinnerStartPeriod,
    wiz_dinnerFlexHard,
    setWiz_dinnerFlexHard,
    wiz_dinnerFlexMinutes,
    setWiz_dinnerFlexMinutes,
    wiz_standardPerson1Solo,
    setWiz_standardPerson1Solo,
    wiz_standardPerson2Solo,
    setWiz_standardPerson2Solo,
    wiz_standardBridePartyPortraits,
    setWiz_standardBridePartyPortraits,
    wiz_standardGroomPartyPortraits,
    setWiz_standardGroomPartyPortraits,
    wiz_standardWeddingPartyShots,
    setWiz_standardWeddingPartyShots,
    wiz_standardCouplePortraits,
    setWiz_standardCouplePortraits,
    wiz_includeGoldenHour,
    setWiz_includeGoldenHour,
    wiz_familyGroups,
    setWiz_familyGroups,
    wiz_firstLookGroom,
    setWiz_firstLookGroom,
    wiz_preCeremonyDetails,
    setWiz_preCeremonyDetails,
    wiz_drone,
    setWiz_drone,
    wiz_preCeremonyDetailRings,
    setWiz_preCeremonyDetailRings,
    wiz_preCeremonyDetailDress,
    setWiz_preCeremonyDetailDress,
    wiz_preCeremonyDetailDrone,
    setWiz_preCeremonyDetailDrone,
    wiz_cakeCutting,
    setWiz_cakeCutting,
    wiz_firstDance,
    setWiz_firstDance,
    wiz_brideParentDance,
    setWiz_brideParentDance,
    wiz_groomParentDance,
    setWiz_groomParentDance,
    wiz_speeches,
    setWiz_speeches,
    wiz_garterToss,
    setWiz_garterToss,
    wiz_bouquetToss,
    setWiz_bouquetToss,
    wiz_grandEntrance,
    setWiz_grandEntrance,
    wiz_openDanceFloor,
    setWiz_openDanceFloor,
  } = props;

  const hint = (key) => inlineHints[key] || null;
  const hl = (key) => highlightAll || !!inlineHints[key];

  const impactOff = (mins) =>
    mins > 0 ? `Removing saves about ${mins} min in this window` : null;

  const goldenHourLabel = useMemo(() => {
    if (!date || !wiz_includeGoldenHour) return null;
    let gh;
    if (wiz_geocodeSuccess === true && wiz_venueLat != null && wiz_venueLng != null) {
      gh = getGoldenHourFromCoords(date, wiz_venueLat, wiz_venueLng);
    } else {
      gh = getGoldenHourWindowSync(date);
    }
    if (!gh) return null;
    return `${formatMinutes(gh.start)} – ${formatMinutes(gh.sunset)} (45 min window)`;
  }, [date, wiz_includeGoldenHour, wiz_geocodeSuccess, wiz_venueLat, wiz_venueLng]);

  const ghOverlap = useMemo(() => findGoldenHourOverlap(windows), [windows]);

  const canMovePre = wiz_firstLookGroom || wiz_brideOkayBefore === true;

  const eventNames = useMemo(
    () => new Set((w?.events || []).map((r) => r.event).filter(Boolean)),
    [w]
  );

  if (!windowId || !w) return null;

  if (windowId === "A") {
    return (
      <div className="wtb-logistics-window-controls">
        <HighlightedField highlight={hl("photoStart")} hint={hint("photoStart")}>
          <label style={labelStyle}>Start coverage earlier</label>
          <TimePickerRow
            hour={photoStartHour}
            minute={photoStartMinute}
            period={photoStartPeriod}
            onHour={setPhotoStartHour}
            onMinute={setPhotoStartMinute}
            onPeriod={setPhotoStartPeriod}
          />
        </HighlightedField>

        <SessionToggle
          label="Drone coverage"
          checked={wiz_drone}
          onChange={setWiz_drone}
          highlight={hl("preCeremonyDetails")}
          hint={hint("preCeremonyDetails")}
          impact={impactOff(30)}
          wizCheckRowStyle={wizCheckRowStyle}
        />
        <SessionToggle
          label="Pre-ceremony detail shots (rings, dress, etc.)"
          checked={wiz_preCeremonyDetails !== false}
          onChange={setWiz_preCeremonyDetails}
          highlight={hl("preCeremonyDetails")}
          hint={hint("preCeremonyDetails")}
          wizCheckRowStyle={wizCheckRowStyle}
        />
        {wiz_preCeremonyDetails !== false && (
          <>
            <SessionToggle
              label="Detail: rings & invitations"
              checked={wiz_preCeremonyDetailRings !== false}
              onChange={setWiz_preCeremonyDetailRings}
              highlight={hl("preCeremonyDetails")}
              impact={impactOff(15)}
              wizCheckRowStyle={wizCheckRowStyle}
            />
            <SessionToggle
              label="Detail: dress shots"
              checked={wiz_preCeremonyDetailDress !== false}
              onChange={setWiz_preCeremonyDetailDress}
              highlight={hl("preCeremonyDetails")}
              impact={impactOff(15)}
              wizCheckRowStyle={wizCheckRowStyle}
            />
            <SessionToggle
              label="Detail: drone & venue"
              checked={wiz_preCeremonyDetailDrone !== false}
              onChange={setWiz_preCeremonyDetailDrone}
              highlight={hl("preCeremonyDetails")}
              impact={impactOff(30)}
              wizCheckRowStyle={wizCheckRowStyle}
            />
          </>
        )}
        <SessionToggle
          label={`${brideLabel} solo portraits`}
          checked={wiz_standardPerson1Solo}
          onChange={setWiz_standardPerson1Solo}
          highlight={hl("portrait_person1Solo")}
          hint={hint("portrait_person1Solo")}
          wizCheckRowStyle={wizCheckRowStyle}
        />
        <SessionToggle
          label={`${groomLabel} solo portraits`}
          checked={wiz_standardPerson2Solo}
          onChange={setWiz_standardPerson2Solo}
          highlight={hl("portrait_person2Solo")}
          hint={hint("portrait_person2Solo")}
          wizCheckRowStyle={wizCheckRowStyle}
        />
        <SessionToggle
          label={`${brideLabel} & bridal party`}
          checked={wiz_standardBridePartyPortraits}
          onChange={(v) => {
            setWiz_standardBridePartyPortraits(v);
            props.setWiz_preCeremonyBrideParty?.(v);
          }}
          highlight={hl("portrait_brideParty")}
          hint={hint("portrait_brideParty")}
          wizCheckRowStyle={wizCheckRowStyle}
        />
        <SessionToggle
          label={`${groomLabel} & groomsmen`}
          checked={wiz_standardGroomPartyPortraits}
          onChange={(v) => {
            setWiz_standardGroomPartyPortraits(v);
            props.setWiz_preCeremonyGroomParty?.(v);
          }}
          highlight={hl("portrait_groomParty")}
          hint={hint("portrait_groomParty")}
          wizCheckRowStyle={wizCheckRowStyle}
        />
      </div>
    );
  }

  if (windowId === "B") {
    return (
      <div className="wtb-logistics-window-controls">
        <HighlightedField highlight={hl("firstLookGroom")} hint={hint("firstLookGroom")}>
          <label style={labelStyle}>First look with {groomLabel}</label>
          <p
            style={{
              margin: "0 0 10px",
              fontSize: 12,
              color: "var(--wtb-text-muted)",
              fontFamily: "'Jost', sans-serif",
            }}
          >
            Unlocks pre-ceremony portraits
          </p>
          <YesNoToggle
            value={wiz_firstLookGroom}
            onYes={() => setWiz_firstLookGroom(true)}
            onNo={() => setWiz_firstLookGroom(false)}
            wizToggleStyle={wizToggleStyle}
          />
        </HighlightedField>

        {canMovePre && (
          <SessionToggle
            label="Wedding Party Group Shots — move before ceremony (saves ~15 min post-ceremony)"
            checked={wiz_standardWeddingPartyShots}
            onChange={setWiz_standardWeddingPartyShots}
            highlight={hl("portrait_weddingParty")}
            hint={hint("portrait_weddingParty")}
            wizCheckRowStyle={wizCheckRowStyle}
          />
        )}
        {canMovePre && (
          <SessionToggle
            label={`${brideLabel} & ${groomLabel} Portraits — schedule before ceremony (saves ~20 min)`}
            checked={wiz_standardCouplePortraits}
            onChange={setWiz_standardCouplePortraits}
            highlight={hl("portrait_couple")}
            hint={hint("portrait_couple")}
            wizCheckRowStyle={wizCheckRowStyle}
          />
        )}

        {wiz_dinner && ((parseInt(wiz_dinnerFlexMinutes, 10) || 0) > 0 || hl("dinnerFlex")) && (
          <HighlightedField highlight={hl("dinnerStart") || hl("dinnerFlex")} hint={hint("dinnerStart") || hint("dinnerFlex")}>
            <label style={labelStyle}>Dinner start time</label>
            <TimePickerRow
              hour={wiz_dinnerStartHour}
              minute={wiz_dinnerStartMinute}
              period={wiz_dinnerStartPeriod}
              onHour={setWiz_dinnerStartHour}
              onMinute={setWiz_dinnerStartMinute}
              onPeriod={setWiz_dinnerStartPeriod}
            />
            <div style={{ marginTop: 10 }}>
              <FlexibilityControl
                hard={wiz_dinnerFlexHard}
                onHardChange={setWiz_dinnerFlexHard}
                flexMinutes={wiz_dinnerFlexMinutes}
                onFlexMinutesChange={setWiz_dinnerFlexMinutes}
              />
            </div>
          </HighlightedField>
        )}

        {((parseInt(wiz_receptionFlexMinutes, 10) || 0) > 0 || hl("receptionFlex") || hl("receptionStart")) && (
          <HighlightedField
            highlight={hl("receptionStart") || hl("receptionFlex")}
            hint={hint("receptionStart") || hint("receptionFlex")}
          >
            <label style={labelStyle}>Reception start time</label>
            <TimePickerRow
              hour={wiz_receptionHour}
              minute={wiz_receptionMinute}
              period={wiz_receptionPeriod}
              onHour={setWiz_receptionHour}
              onMinute={setWiz_receptionMinute}
              onPeriod={setWiz_receptionPeriod}
            />
            <div style={{ marginTop: 10 }}>
              <FlexibilityControl
                hard={wiz_receptionFlexHard}
                onHardChange={setWiz_receptionFlexHard}
                flexMinutes={wiz_receptionFlexMinutes}
                onFlexMinutesChange={setWiz_receptionFlexMinutes}
              />
            </div>
          </HighlightedField>
        )}

        <FamilyGroupsSelector
          value={wiz_familyGroups}
          onChange={setWiz_familyGroups}
          highlight={hl("familyGroups")}
          hint={hint("familyGroups")}
          wizToggleStyle={wizToggleStyle}
        />
      </div>
    );
  }

  if (windowId === "D") {
    return (
      <div className="wtb-logistics-window-controls">
        <HighlightedField highlight={hl("portrait_goldenHour")} hint={hint("portrait_goldenHour")}>
          <label
            style={{
              ...wizCheckRowStyle,
              marginBottom: 0,
              border: "none",
              background: "transparent",
              padding: 0,
            }}
          >
            <input
              type="checkbox"
              checked={!!wiz_includeGoldenHour}
              onChange={(e) => setWiz_includeGoldenHour(e.target.checked)}
              style={{ width: 22, height: 22, marginTop: 2, cursor: "pointer", flexShrink: 0 }}
            />
            <div style={{ fontSize: 15, color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" }}>
              Include golden hour session
            </div>
          </label>
          {goldenHourLabel && (
            <p
              style={{
                margin: "12px 0 0",
                fontSize: 15,
                color: "var(--wtb-accent)",
                fontFamily: "'Cormorant Garamond', serif",
              }}
            >
              Golden hour: {goldenHourLabel}
            </p>
          )}
          {ghOverlap && wiz_includeGoldenHour && (
            <p
              style={{
                margin: "12px 0 0",
                fontSize: 13,
                color: "#8b4545",
                fontFamily: "'Jost', sans-serif",
                lineHeight: 1.5,
              }}
            >
              Overlaps with {ghOverlap.otherLabel} starting at {ghOverlap.otherStart} by about{" "}
              {ghOverlap.minutes} minutes.
            </p>
          )}
        </HighlightedField>
      </div>
    );
  }

  if (windowId === "C" || windowId === "E") {
    const matched = RECEPTION_TOGGLES.filter((t) =>
      [...eventNames].some((e) => t.match(e))
    );
    const known = new Set(matched.flatMap((t) => [...eventNames].filter((e) => t.match(e))));
    const custom = (w.events || []).filter(
      (r) =>
        r.type !== "constraint" &&
        r.event &&
        ![...known].some((k) => k === r.event) &&
        !RECEPTION_TOGGLES.some((t) => t.match(r.event))
    );

    const stateMap = {
      wiz_cakeCutting: [wiz_cakeCutting, setWiz_cakeCutting],
      wiz_firstDance: [wiz_firstDance, setWiz_firstDance],
      wiz_brideParentDance: [wiz_brideParentDance, setWiz_brideParentDance],
      wiz_groomParentDance: [wiz_groomParentDance, setWiz_groomParentDance],
      wiz_speeches: [wiz_speeches, setWiz_speeches],
      wiz_garterToss: [wiz_garterToss, setWiz_garterToss],
      wiz_bouquetToss: [wiz_bouquetToss, setWiz_bouquetToss],
      wiz_grandEntrance: [wiz_grandEntrance, setWiz_grandEntrance],
      wiz_openDanceFloor: [wiz_openDanceFloor, setWiz_openDanceFloor],
    };

    return (
      <div className="wtb-logistics-window-controls">
        {matched.map((t) => {
          const [checked, setChecked] = stateMap[t.prop] || [true, () => {}];
          const dur = [...eventNames].find((e) => t.match(e));
          const row = (w.events || []).find((r) => r.event === dur);
          const mins = row ? parseInt(row.duration, 10) || t.minutes : t.minutes;
          return (
            <SessionToggle
              key={t.key}
              label={`${t.label}${mins ? ` (${mins} min)` : ""}`}
              checked={checked}
              onChange={setChecked}
              highlight={hl("receptionStart")}
              impact={impactOff(mins)}
              wizCheckRowStyle={wizCheckRowStyle}
            />
          );
        })}

        {custom.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <label style={labelStyle}>Other events in this window</label>
            <ul
              style={{
                margin: 0,
                paddingLeft: 18,
                fontSize: 13,
                color: "var(--wtb-text-muted)",
                fontFamily: "'Jost', sans-serif",
                lineHeight: 1.6,
              }}
            >
              {custom.map((r) => (
                <li key={`${r.event}-${r.time}`}>
                  {r.event}
                  {r.duration ? ` (${r.duration} min)` : ""}
                </li>
              ))}
            </ul>
            <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--wtb-text-muted)" }}>
              Adjust custom events in the timeline editor.
            </p>
          </div>
        )}

        {wiz_dinner && ((parseInt(wiz_dinnerFlexMinutes, 10) || 0) > 0 || hl("dinnerFlex")) && (
          <HighlightedField highlight={hl("dinnerStart") || hl("dinnerFlex")} hint={hint("dinnerStart")}>
            <label style={labelStyle}>Dinner start time</label>
            <TimePickerRow
              hour={wiz_dinnerStartHour}
              minute={wiz_dinnerStartMinute}
              period={wiz_dinnerStartPeriod}
              onHour={setWiz_dinnerStartHour}
              onMinute={setWiz_dinnerStartMinute}
              onPeriod={setWiz_dinnerStartPeriod}
            />
          </HighlightedField>
        )}
      </div>
    );
  }

  return null;
}

export { LogisticsWindowControls };
