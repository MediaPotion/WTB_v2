import React, { useState } from "react";
import { YesNoToggle, GettingReadyFields, TravelStepper } from "./wizardShared";
import { getTravelTimeFields } from "../../lib/wizardLocations";

function WizardStep2(props) {
  const {
    stepCard, wizSectionHeading, wizToggleStyle,
    brideLabel, groomLabel,
    wiz_ceremonyVenue, setWiz_ceremonyVenue, wiz_ceremonyAddress, setWiz_ceremonyAddress,
    wiz_receptionSameAsCeremony, setWiz_receptionSameAsCeremony,
    wiz_receptionVenue, setWiz_receptionVenue, wiz_receptionAddress, setWiz_receptionAddress,
    wiz_brideReadyAtCeremony, setWiz_brideReadyAtCeremony,
    wiz_brideReadyAtReception, setWiz_brideReadyAtReception,
    wiz_brideReadyAddress, setWiz_brideReadyAddress,
    wiz_brideReadyStreet, setWiz_brideReadyStreet,
    wiz_groomReadyAtCeremony, setWiz_groomReadyAtCeremony,
    wiz_groomReadyAtReception, setWiz_groomReadyAtReception,
    wiz_groomReadyAtBride, setWiz_groomReadyAtBride,
    wiz_groomReadyAddress, setWiz_groomReadyAddress,
    wiz_groomReadyStreet, setWiz_groomReadyStreet,
    wiz_locations, addWizLocation, updateWizLocation, removeWizLocation,
    setWizardStep,
  } = props;

  const [showAddressReminder, setShowAddressReminder] = useState(false);
  const inputStyle = { width: "100%", padding: 9, border: "1px solid var(--wtb-border)", borderRadius: 6, fontSize: 14, boxSizing: "border-box", background: "var(--wtb-surface)", color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" };
  const labelStyle = { display: "block", fontSize: 13, fontWeight: 300, color: "var(--wtb-text-muted)", marginBottom: 4, fontFamily: "'Jost', sans-serif" };
  const boxStyle = { border: "1px solid var(--wtb-border-subtle)", borderRadius: 8, padding: "14px 14px 12px", marginBottom: 16, background: "var(--wtb-surface-raised)" };

  const travelFields = getTravelTimeFields(props, brideLabel, groomLabel);

  const tryNext = () => {
    if (!String(wiz_ceremonyVenue || "").trim() || !String(wiz_ceremonyAddress || "").trim()) {
      setShowAddressReminder(true);
      return;
    }
    setShowAddressReminder(false);
    setWizardStep(3);
  };

  return stepCard(
    "Your Locations",
    "Enter all the locations you will visit on your wedding day. These are used to calculate travel time and golden hour timing.",
    <div>
      <div style={boxStyle}>
        <label style={labelStyle}>Ceremony venue name (required)</label>
        <input type="text" value={wiz_ceremonyVenue} onChange={(e) => setWiz_ceremonyVenue(e.target.value)} style={{ ...inputStyle, marginBottom: 10 }} />
        <label style={labelStyle}>Ceremony venue address (required)</label>
        <input
          type="text"
          value={wiz_ceremonyAddress}
          onChange={(e) => { setWiz_ceremonyAddress(e.target.value); setShowAddressReminder(false); }}
          style={{ ...inputStyle, borderColor: showAddressReminder ? "var(--wtb-accent)" : undefined }}
        />
        <p style={{ fontSize: 12, color: "var(--wtb-text-faint)", margin: "8px 0 0", fontFamily: "'Jost', sans-serif" }}>
          We need this address to calculate golden hour timing for your wedding day
        </p>
        {showAddressReminder && (
          <p style={{ fontSize: 13, color: "var(--wtb-accent)", margin: "10px 0 0", fontFamily: "'Jost', sans-serif" }}>
            Please enter both ceremony venue name and address before continuing.
          </p>
        )}
      </div>

      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 14, color: "var(--wtb-text)", margin: "0 0 8px", fontFamily: "'Jost', sans-serif" }}>
          Is the reception at the same location as the ceremony?
        </p>
        <YesNoToggle
          value={wiz_receptionSameAsCeremony}
          wizToggleStyle={wizToggleStyle}
          onYes={() => setWiz_receptionSameAsCeremony(true)}
          onNo={() => setWiz_receptionSameAsCeremony(false)}
        />
        {!wiz_receptionSameAsCeremony && (
          <div style={{ ...boxStyle, marginTop: 14 }}>
            <label style={labelStyle}>Reception venue name</label>
            <input type="text" value={wiz_receptionVenue} onChange={(e) => setWiz_receptionVenue(e.target.value)} style={{ ...inputStyle, marginBottom: 10 }} />
            <label style={labelStyle}>Reception venue address</label>
            <input type="text" value={wiz_receptionAddress} onChange={(e) => setWiz_receptionAddress(e.target.value)} style={inputStyle} />
          </div>
        )}
      </div>

      <p style={{ fontSize: 14, color: "var(--wtb-text)", margin: "0 0 8px", fontFamily: "'Jost', sans-serif" }}>
        Where will {brideLabel} be getting ready?
      </p>
      <GettingReadyFields
        atCeremony={wiz_brideReadyAtCeremony}
        setAtCeremony={setWiz_brideReadyAtCeremony}
        atReception={wiz_brideReadyAtReception}
        setAtReception={setWiz_brideReadyAtReception}
        venueName={wiz_brideReadyAddress}
        setVenueName={setWiz_brideReadyAddress}
        street={wiz_brideReadyStreet}
        setStreet={setWiz_brideReadyStreet}
      />

      <p style={{ fontSize: 14, color: "var(--wtb-text)", margin: "0 0 8px", fontFamily: "'Jost', sans-serif" }}>
        Where will {groomLabel} be getting ready?
      </p>
      <GettingReadyFields
        atCeremony={wiz_groomReadyAtCeremony}
        setAtCeremony={setWiz_groomReadyAtCeremony}
        atReception={wiz_groomReadyAtReception}
        setAtReception={setWiz_groomReadyAtReception}
        atPartner={wiz_groomReadyAtBride}
        setAtPartner={setWiz_groomReadyAtBride}
        partnerLabel={brideLabel}
        venueName={wiz_groomReadyAddress}
        setVenueName={setWiz_groomReadyAddress}
        street={wiz_groomReadyStreet}
        setStreet={setWiz_groomReadyStreet}
      />

      {wizSectionHeading("Any other locations you will be visiting?")}
      <p style={{ fontSize: 13, color: "var(--wtb-text-muted)", margin: "0 0 12px", fontFamily: "'Jost', sans-serif" }}>
        Such as portrait destinations or special stops.
      </p>
      {wiz_locations.map((loc, i) => (
        <div key={loc.id} style={{ border: "1px solid var(--wtb-border-subtle)", borderRadius: 8, padding: 14, marginBottom: 10, background: "var(--wtb-surface)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: "var(--wtb-text-muted)" }}>Location {i + 1}</span>
            <button type="button" onClick={() => removeWizLocation(loc.id)} style={{ fontSize: 12, background: "none", border: "1px solid var(--wtb-border)", borderRadius: 4, padding: "2px 8px", cursor: "pointer", color: "var(--wtb-text-muted)" }}>Remove</button>
          </div>
          <label style={labelStyle}>Location name</label>
          <input type="text" value={loc.name} onChange={(e) => updateWizLocation(loc.id, "name", e.target.value)} style={{ ...inputStyle, marginBottom: 8 }} />
          <label style={labelStyle}>Address (optional)</label>
          <input type="text" value={loc.address} onChange={(e) => updateWizLocation(loc.id, "address", e.target.value)} style={inputStyle} />
        </div>
      ))}
      <button type="button" onClick={addWizLocation} style={{ padding: "10px 20px", background: "var(--wtb-surface-raised)", color: "var(--wtb-accent)", border: "1px solid var(--wtb-accent)", borderRadius: 8, fontSize: 14, cursor: "pointer", fontFamily: "'Jost', sans-serif" }}>
        + Add Location
      </button>

      {travelFields.length > 0 && (
        <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--wtb-border-subtle)" }}>
          {wizSectionHeading("Travel times")}
          <p style={{ fontSize: 13, color: "var(--wtb-text-muted)", margin: "0 0 8px", fontFamily: "'Jost', sans-serif" }}>
            Enter drive times in minutes between locations. This helps us build accurate travel blocks.
          </p>
          <p style={{ fontSize: 12, color: "var(--wtb-text-faint)", margin: "0 0 14px", fontStyle: "italic", fontFamily: "'Jost', sans-serif" }}>
            Enter drive time in minutes, not miles
          </p>
          {travelFields.map((f) => (
            <TravelStepper key={f.key} label={f.label} value={f.value} onChange={f.set} />
          ))}
        </div>
      )}
    </div>,
    () => setWizardStep(1),
    tryNext
  );
}

export { WizardStep2 };
