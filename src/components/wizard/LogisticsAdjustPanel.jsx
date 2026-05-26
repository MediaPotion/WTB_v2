import React, { useMemo } from "react";
import {
  TimePickerRow,
  YesNoToggle,
  FlexibilityControl,
} from "./wizardShared";
import {
  getGoldenHourFromCoords,
  getGoldenHourWindowSync,
  formatMinutes,
} from "../../lib/goldenHour";

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
      style={{
        border: highlight
          ? "2px solid var(--wtb-accent)"
          : "1px solid var(--wtb-border-subtle)",
        borderRadius: 10,
        padding: "14px 16px",
        marginBottom: 12,
        background: highlight ? "rgba(184, 144, 106, 0.06)" : "var(--wtb-surface-raised)",
        transition: "border-color 0.35s ease, box-shadow 0.35s ease, background 0.35s ease",
        boxShadow: highlight ? "0 0 12px rgba(184, 144, 106, 0.15)" : "none",
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

function PortraitToggle({ label, checked, onChange, highlight, hint, wizCheckRowStyle }) {
  return (
    <HighlightedField highlight={highlight} hint={hint}>
      <label style={{ ...wizCheckRowStyle, marginBottom: 0, border: "none", background: "transparent", padding: 0 }}>
        <input
          type="checkbox"
          checked={!!checked}
          onChange={(e) => onChange(e.target.checked)}
          style={{ width: 22, height: 22, marginTop: 2, cursor: "pointer", flexShrink: 0 }}
        />
        <div style={{ fontSize: 15, color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" }}>{label}</div>
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
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {options.map((o) => (
          <button
            key={o.key}
            type="button"
            style={wizToggleStyle(value === o.key)}
            onClick={() => onChange(o.key)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </HighlightedField>
  );
}

function LogisticsAdjustPanel(props) {
  const {
    inlineHints,
    wizSectionHeading,
    wizToggleStyle,
    wizCheckRowStyle,
    brideLabel,
    groomLabel,
    date,
    wiz_dinner,
    wiz_geocodeSuccess,
    wiz_venueLat,
    wiz_venueLng,
    photoStartHour,
    photoStartMinute,
    photoStartPeriod,
    setPhotoStartHour,
    setPhotoStartMinute,
    setPhotoStartPeriod,
    wiz_ceremonyHour,
    wiz_ceremonyMinute,
    wiz_ceremonyPeriod,
    setWiz_ceremonyHour,
    setWiz_ceremonyMinute,
    setWiz_ceremonyPeriod,
    wiz_ceremonyFlexHard,
    setWiz_ceremonyFlexHard,
    wiz_ceremonyFlexMinutes,
    setWiz_ceremonyFlexMinutes,
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
    wiz_preCeremonyBrideParty,
    setWiz_preCeremonyBrideParty,
    wiz_preCeremonyGroomParty,
    setWiz_preCeremonyGroomParty,
    wiz_familyGroups,
    setWiz_familyGroups,
    wiz_firstLookGroom,
    setWiz_firstLookGroom,
    wiz_preCeremonyDetails,
    setWiz_preCeremonyDetails,
  } = props;

  const hint = (key) => inlineHints[key] || null;
  const hl = (key) => !!inlineHints[key];

  const goldenHourLabel = useMemo(() => {
    if (!date || !wiz_includeGoldenHour) return null;
    let gh;
    if (wiz_geocodeSuccess === true && wiz_venueLat != null && wiz_venueLng != null) {
      gh = getGoldenHourFromCoords(date, wiz_venueLat, wiz_venueLng);
    } else {
      gh = getGoldenHourWindowSync(date);
    }
    if (!gh) return null;
    return `${formatMinutes(gh.start)} – ${formatMinutes(gh.sunset)}`;
  }, [date, wiz_includeGoldenHour, wiz_geocodeSuccess, wiz_venueLat, wiz_venueLng]);

  const setBrideParty = (v) => {
    setWiz_standardBridePartyPortraits(v);
    setWiz_preCeremonyBrideParty(v);
  };
  const setGroomParty = (v) => {
    setWiz_standardGroomPartyPortraits(v);
    setWiz_preCeremonyGroomParty(v);
  };

  return (
    <div
      style={{
        background: "var(--wtb-surface-raised)",
        border: "1px solid var(--wtb-border-subtle)",
        borderRadius: 12,
        padding: "20px 18px",
        marginBottom: 28,
      }}
    >
      <h3
        style={{
          margin: "0 0 6px",
          fontSize: 20,
          fontWeight: 400,
          fontFamily: "'Cormorant Garamond', serif",
          color: "var(--wtb-text)",
        }}
      >
        Adjust Your Schedule
      </h3>
      <p
        style={{
          margin: "0 0 20px",
          fontSize: 13,
          color: "var(--wtb-text-muted)",
          lineHeight: 1.55,
          fontFamily: "'Jost', sans-serif",
        }}
      >
        Change any setting below — your timeline and conflict check update instantly.
      </p>

      {wizSectionHeading("Key Times")}

      <HighlightedField highlight={hl("photoStart")} hint={hint("photoStart")}>
        <label style={labelStyle}>Coverage start time</label>
        <TimePickerRow
          hour={photoStartHour}
          minute={photoStartMinute}
          period={photoStartPeriod}
          onHour={setPhotoStartHour}
          onMinute={setPhotoStartMinute}
          onPeriod={setPhotoStartPeriod}
        />
      </HighlightedField>

      <HighlightedField highlight={hl("ceremonyStart")} hint={hint("ceremonyStart")}>
        <label style={labelStyle}>Ceremony start time</label>
        <TimePickerRow
          hour={wiz_ceremonyHour}
          minute={wiz_ceremonyMinute}
          period={wiz_ceremonyPeriod}
          onHour={setWiz_ceremonyHour}
          onMinute={setWiz_ceremonyMinute}
          onPeriod={setWiz_ceremonyPeriod}
        />
        <div style={{ marginTop: 10 }}>
          <FlexibilityControl
            hard={wiz_ceremonyFlexHard}
            onHardChange={setWiz_ceremonyFlexHard}
            flexMinutes={wiz_ceremonyFlexMinutes}
            onFlexMinutesChange={setWiz_ceremonyFlexMinutes}
          />
        </div>
      </HighlightedField>

      <HighlightedField highlight={hl("receptionStart") || hl("receptionFlex")} hint={hint("receptionStart") || hint("receptionFlex")}>
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

      {wiz_dinner && (
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

      {wizSectionHeading("Portrait Sessions")}

      <PortraitToggle
        label={`${brideLabel} Solo Portraits`}
        checked={wiz_standardPerson1Solo}
        onChange={setWiz_standardPerson1Solo}
        highlight={hl("portrait_person1Solo")}
        hint={hint("portrait_person1Solo")}
        wizCheckRowStyle={wizCheckRowStyle}
      />
      <PortraitToggle
        label={`${groomLabel} Solo Portraits`}
        checked={wiz_standardPerson2Solo}
        onChange={setWiz_standardPerson2Solo}
        highlight={hl("portrait_person2Solo")}
        hint={hint("portrait_person2Solo")}
        wizCheckRowStyle={wizCheckRowStyle}
      />
      <PortraitToggle
        label={`${brideLabel} & Bridal Party Portraits`}
        checked={wiz_standardBridePartyPortraits}
        onChange={setBrideParty}
        highlight={hl("portrait_brideParty")}
        hint={hint("portrait_brideParty")}
        wizCheckRowStyle={wizCheckRowStyle}
      />
      <PortraitToggle
        label={`${groomLabel} & Groomsmen Portraits`}
        checked={wiz_standardGroomPartyPortraits}
        onChange={setGroomParty}
        highlight={hl("portrait_groomParty")}
        hint={hint("portrait_groomParty")}
        wizCheckRowStyle={wizCheckRowStyle}
      />
      <PortraitToggle
        label="Wedding Party Group Shots"
        checked={wiz_standardWeddingPartyShots}
        onChange={setWiz_standardWeddingPartyShots}
        highlight={hl("portrait_weddingParty")}
        hint={hint("portrait_weddingParty")}
        wizCheckRowStyle={wizCheckRowStyle}
      />
      <PortraitToggle
        label={`${brideLabel} & ${groomLabel} Portraits`}
        checked={wiz_standardCouplePortraits}
        onChange={setWiz_standardCouplePortraits}
        highlight={hl("portrait_couple")}
        hint={hint("portrait_couple")}
        wizCheckRowStyle={wizCheckRowStyle}
      />
      <HighlightedField highlight={hl("portrait_goldenHour")} hint={hint("portrait_goldenHour")}>
        <label style={{ ...wizCheckRowStyle, marginBottom: 0, border: "none", background: "transparent", padding: 0 }}>
          <input
            type="checkbox"
            checked={!!wiz_includeGoldenHour}
            onChange={(e) => setWiz_includeGoldenHour(e.target.checked)}
            style={{ width: 22, height: 22, marginTop: 2, cursor: "pointer", flexShrink: 0 }}
          />
          <div style={{ fontSize: 15, color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" }}>
            Golden Hour Portraits
            {goldenHourLabel ? (
              <span style={{ display: "block", fontSize: 12, color: "var(--wtb-text-muted)", marginTop: 4 }}>
                {goldenHourLabel}
              </span>
            ) : null}
          </div>
        </label>
      </HighlightedField>

      {wizSectionHeading("Family Photos")}
      <FamilyGroupsSelector
        value={wiz_familyGroups}
        onChange={setWiz_familyGroups}
        highlight={hl("familyGroups")}
        hint={hint("familyGroups")}
        wizToggleStyle={wizToggleStyle}
      />

      {wizSectionHeading(`First Look with ${groomLabel}`)}
      <HighlightedField highlight={hl("firstLookGroom")} hint={hint("firstLookGroom")}>
        <YesNoToggle
          value={wiz_firstLookGroom}
          onYes={() => setWiz_firstLookGroom(true)}
          onNo={() => setWiz_firstLookGroom(false)}
          wizToggleStyle={wizToggleStyle}
        />
        {!hint("firstLookGroom") && (
          <p
            style={{
              margin: "12px 0 0",
              fontSize: 12,
              color: "var(--wtb-text-muted)",
              lineHeight: 1.55,
              fontFamily: "'Jost', sans-serif",
            }}
          >
            A first look with {groomLabel} allows portrait sessions to happen before the ceremony,
            which can relieve time pressure after the ceremony.
          </p>
        )}
      </HighlightedField>

      {(hl("preCeremonyDetails") || hint("preCeremonyDetails")) && (
        <>
          {wizSectionHeading("Pre-Ceremony Details")}
          <HighlightedField highlight={hl("preCeremonyDetails")} hint={hint("preCeremonyDetails")}>
            <label style={{ ...wizCheckRowStyle, marginBottom: 0, border: "none", background: "transparent", padding: 0 }}>
              <input
                type="checkbox"
                checked={wiz_preCeremonyDetails !== false}
                onChange={(e) => setWiz_preCeremonyDetails(e.target.checked)}
                style={{ width: 22, height: 22, marginTop: 2, cursor: "pointer", flexShrink: 0 }}
              />
              <div style={{ fontSize: 15, color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" }}>
                Include pre-ceremony detail shots
              </div>
            </label>
          </HighlightedField>
        </>
      )}
    </div>
  );
}

export { LogisticsAdjustPanel };
