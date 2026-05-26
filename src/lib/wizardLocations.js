import { resolveWeddingLocations } from "./weddingLocations";

/** Location names the user has actually entered (for dropdowns). */
export function getEnteredLocationNames(props) {
  const names = [];
  const add = (n) => {
    const t = String(n ?? "").trim();
    if (t && !names.includes(t)) names.push(t);
  };
  add(props.wiz_ceremonyVenue);
  if (!props.wiz_receptionSameAsCeremony) add(props.wiz_receptionVenue);
  if (!props.wiz_brideReadyAtCeremony && !props.wiz_brideReadyAtReception) {
    add(props.wiz_brideReadyAddress);
  }
  if (
    !props.wiz_groomReadyAtCeremony &&
    !props.wiz_groomReadyAtReception &&
    !props.wiz_groomReadyAtBride
  ) {
    add(props.wiz_groomReadyAddress);
  }
  (props.wiz_locations || []).forEach((loc) => add(loc.name));
  return names;
}

function propsToWizardAnswers(props) {
  return {
    ceremonyVenue: props.wiz_ceremonyVenue,
    ceremonyAddress: props.wiz_ceremonyAddress,
    receptionSameAsCeremony: props.wiz_receptionSameAsCeremony,
    receptionVenue: props.wiz_receptionVenue,
    receptionAddress: props.wiz_receptionAddress,
    brideReadyAtCeremony: props.wiz_brideReadyAtCeremony,
    brideReadyAtReception: props.wiz_brideReadyAtReception,
    brideReadyAddress: props.wiz_brideReadyAddress,
    brideReadyStreet: props.wiz_brideReadyStreet,
    groomReadyAtCeremony: props.wiz_groomReadyAtCeremony,
    groomReadyAtReception: props.wiz_groomReadyAtReception,
    groomReadyAtBride: props.wiz_groomReadyAtBride,
    groomReadyAddress: props.wiz_groomReadyAddress,
    groomReadyStreet: props.wiz_groomReadyStreet,
    locations: props.wiz_locations,
  };
}

function isDifferent(a, b) {
  const na = String(a?.name ?? "").trim();
  const nb = String(b?.name ?? "").trim();
  return na && nb && na !== nb;
}

/** Travel time fields to show on Step 2, in display order. */
export function getTravelTimeFields(props, brideLabel, groomLabel) {
  const { ceremony, reception, brideReady, groomReady } = resolveWeddingLocations(
    propsToWizardAnswers(props)
  );
  const fields = [];

  if (isDifferent(brideReady, ceremony)) {
    fields.push({
      key: "brideToCeremony",
      label: `${brideLabel} getting ready → Ceremony venue`,
      value: props.wiz_distanceBrideToCeremony,
      set: props.setWiz_distanceBrideToCeremony,
    });
  }
  if (isDifferent(groomReady, ceremony)) {
    fields.push({
      key: "groomToCeremony",
      label: `${groomLabel} getting ready → Ceremony venue`,
      value: props.wiz_distanceGroomToCeremony,
      set: props.setWiz_distanceGroomToCeremony,
    });
  }
  if (isDifferent(brideReady, groomReady)) {
    fields.push({
      key: "betweenReady",
      label: `${brideLabel} getting ready → ${groomLabel} getting ready`,
      value: props.wiz_distanceBetweenReady,
      set: props.setWiz_distanceBetweenReady,
    });
  }
  if (isDifferent(ceremony, reception)) {
    fields.push({
      key: "ceremonyToReception",
      label: "Ceremony venue → Reception venue",
      value: props.wiz_distanceReceptionToCeremony,
      set: props.setWiz_distanceReceptionToCeremony,
    });
  }

  (props.wiz_locations || []).forEach((loc) => {
    if (!loc.name?.trim()) return;
    const locName = loc.name.trim();
    if (isDifferent({ name: locName }, ceremony)) {
      fields.push({
        key: `loc-${loc.id}-ceremony`,
        label: `${locName} → Ceremony venue`,
        value: loc.distFromCeremony,
        set: (val) => props.updateWizLocation(loc.id, "distFromCeremony", val),
      });
    }
    if (isDifferent({ name: locName }, reception)) {
      fields.push({
        key: `loc-${loc.id}-reception`,
        label: `${locName} → Reception venue`,
        value: loc.distFromReception,
        set: (val) => props.updateWizLocation(loc.id, "distFromReception", val),
      });
    }
  });

  return fields;
}
