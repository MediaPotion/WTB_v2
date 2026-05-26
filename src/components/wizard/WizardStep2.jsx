import React, { useState } from "react";

function WizardStep2(props) {
  const {
    stepCard, wizSectionHeading,
    wiz_ceremonyVenue, setWiz_ceremonyVenue, wiz_ceremonyAddress, setWiz_ceremonyAddress,
    wiz_receptionVenue, setWiz_receptionVenue, wiz_receptionAddress, setWiz_receptionAddress,
    wiz_receptionSameAsCeremony, setWiz_receptionSameAsCeremony,
    wiz_distanceReceptionToCeremony, setWiz_distanceReceptionToCeremony,
    wiz_locations, addWizLocation, updateWizLocation, removeWizLocation,
    setWizardStep,
  } = props;

  const [showAddressReminder, setShowAddressReminder] = useState(false);

  const mandatoryLocStyle = { border: "1px solid var(--wtb-border-subtle)", borderRadius: 8, padding: "14px 14px 12px", marginBottom: 16, background: "var(--wtb-surface-raised)" };
  const mandatoryLabelStyle = { display: "block", fontSize: 13, fontWeight: 300, color: "var(--wtb-text-muted)", marginBottom: 4, fontFamily: "'Jost', sans-serif", letterSpacing: "0.05em" };
  const mandatoryInputStyle = { width: "100%", padding: 9, border: "1px solid var(--wtb-border)", borderRadius: 6, fontSize: 14, boxSizing: "border-box", background: "var(--wtb-surface)", color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" };

  const travelStepper = (value, onChange, label) => {
    const mins = parseInt(value, 10) || 0;
    return (
      <div style={{ marginTop: 12 }}>
        <label style={{ ...mandatoryLabelStyle, marginBottom: 6 }}>{label}</label>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button type="button" onClick={() => onChange(String(Math.max(0, mins - 5)))} style={{ width: 32, height: 32, background: "var(--wtb-surface)", border: "1px solid var(--wtb-border)", borderRadius: 6, color: "var(--wtb-text)", fontSize: 18, cursor: "pointer" }}>−</button>
          <span style={{ minWidth: 28, textAlign: "center", fontSize: 16, color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" }}>{mins}</span>
          <button type="button" onClick={() => onChange(String(mins + 5))} style={{ width: 32, height: 32, background: "var(--wtb-surface)", border: "1px solid var(--wtb-border)", borderRadius: 6, color: "var(--wtb-text)", fontSize: 18, cursor: "pointer" }}>+</button>
          <span style={{ fontSize: 13, color: "var(--wtb-text-muted)", fontFamily: "'Jost', sans-serif" }}>minutes</span>
        </div>
      </div>
    );
  };

  const tryNext = () => {
    if (!String(wiz_ceremonyAddress || "").trim()) {
      setShowAddressReminder(true);
      return;
    }
    setShowAddressReminder(false);
    setWizardStep(3);
  };

  return stepCard(
    "Your Locations",
    "Enter the key venues for your wedding day. These are used for travel blocks and golden hour timing.",
    <div>
      {wizSectionHeading("Ceremony Location")}
      <div style={mandatoryLocStyle}>
        <div style={{ marginBottom: 10 }}>
          <label style={mandatoryLabelStyle}>Venue Name</label>
          <input type="text" value={wiz_ceremonyVenue} onChange={(e) => setWiz_ceremonyVenue(e.target.value)} placeholder="e.g. St. Mary's Church" style={mandatoryInputStyle} />
        </div>
        <div>
          <label style={mandatoryLabelStyle}>Address (required)</label>
          <input
            type="text"
            value={wiz_ceremonyAddress}
            onChange={(e) => { setWiz_ceremonyAddress(e.target.value); setShowAddressReminder(false); }}
            placeholder="e.g. 123 Main St, Springfield, MI"
            style={{ ...mandatoryInputStyle, borderColor: showAddressReminder ? "var(--wtb-accent)" : undefined }}
          />
        </div>
        {showAddressReminder && (
          <p style={{ margin: "10px 0 0", fontSize: 13, color: "var(--wtb-accent)", fontFamily: "'Jost', sans-serif", lineHeight: 1.5 }}>
            We need your ceremony location to calculate golden hour timing for your wedding day.
          </p>
        )}
      </div>

      {wizSectionHeading("Reception Location")}
      <div style={mandatoryLocStyle}>
        <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: wiz_receptionSameAsCeremony ? 0 : 12, cursor: "pointer" }}
          onClick={() => setWiz_receptionSameAsCeremony(!wiz_receptionSameAsCeremony)}>
          <input type="checkbox" checked={wiz_receptionSameAsCeremony} readOnly style={{ width: 18, height: 18, flexShrink: 0 }} />
          <span style={{ fontSize: 14, color: "var(--wtb-text-muted)" }}>Same as ceremony location</span>
        </label>
        {!wiz_receptionSameAsCeremony && (
          <>
            <div style={{ marginBottom: 10, marginTop: 10 }}>
              <label style={mandatoryLabelStyle}>Venue Name</label>
              <input type="text" value={wiz_receptionVenue} onChange={(e) => setWiz_receptionVenue(e.target.value)} placeholder="e.g. The Grand Ballroom" style={mandatoryInputStyle} />
            </div>
            <div>
              <label style={mandatoryLabelStyle}>Address</label>
              <input type="text" value={wiz_receptionAddress} onChange={(e) => setWiz_receptionAddress(e.target.value)} placeholder="e.g. 456 Oak Ave" style={mandatoryInputStyle} />
            </div>
            {travelStepper(wiz_distanceReceptionToCeremony, setWiz_distanceReceptionToCeremony, "Travel time from ceremony to reception (minutes)")}
          </>
        )}
      </div>

      {wizSectionHeading("Additional Locations")}
      <p style={{ fontSize: 13, color: "var(--wtb-text-faint)", marginBottom: 12, fontFamily: "'Jost', sans-serif" }}>
        Optional portrait spots or other destinations you may visit.
      </p>
      {wiz_locations.map((loc, i) => (
        <div key={loc.id} style={{ border: "1px solid var(--wtb-border-subtle)", borderRadius: 8, padding: "14px 14px 10px", marginBottom: 12, background: "var(--wtb-surface)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 14, color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" }}>Location {i + 1}</span>
            <button type="button" onClick={() => removeWizLocation(loc.id)} style={{ background: "none", border: "1px solid var(--wtb-border)", borderRadius: 4, padding: "3px 10px", fontSize: 12, color: "var(--wtb-text-muted)", cursor: "pointer" }}>Remove</button>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={mandatoryLabelStyle}>Location Name</label>
            <input type="text" value={loc.name} onChange={(e) => updateWizLocation(loc.id, "name", e.target.value)} style={mandatoryInputStyle} />
          </div>
          <div>
            <label style={mandatoryLabelStyle}>Address (optional)</label>
            <input type="text" value={loc.address} onChange={(e) => updateWizLocation(loc.id, "address", e.target.value)} style={mandatoryInputStyle} />
          </div>
          {travelStepper(loc.distFromCeremony, (val) => updateWizLocation(loc.id, "distFromCeremony", val), "Travel time to ceremony (minutes)")}
          {travelStepper(loc.distFromReception, (val) => updateWizLocation(loc.id, "distFromReception", val), "Travel time to reception (minutes)")}
        </div>
      ))}
      <button type="button" onClick={addWizLocation} style={{ padding: "10px 20px", background: "var(--wtb-surface-raised)", color: "var(--wtb-accent)", border: "1px solid var(--wtb-accent)", borderRadius: 8, fontSize: 14, cursor: "pointer", fontFamily: "'Jost', sans-serif" }}>
        + Add Location
      </button>
    </div>,
    () => setWizardStep(1),
    tryNext
  );
}

export { WizardStep2 };
