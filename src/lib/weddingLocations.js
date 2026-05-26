/**
 * Resolve venue name + street address from wizard location checkboxes and fields.
 */

function resolveCeremony(wizardAnswers) {
  return {
    name: wizardAnswers.ceremonyVenue || "ceremony venue",
    address: wizardAnswers.ceremonyAddress || "",
  };
}

function resolveReception(wizardAnswers, ceremony) {
  if (wizardAnswers.receptionSameAsCeremony) {
    return { name: ceremony.name, address: ceremony.address };
  }
  return {
    name: wizardAnswers.receptionVenue || "reception venue",
    address: wizardAnswers.receptionAddress || "",
  };
}

function resolveBrideReady(wizardAnswers, ceremony, reception) {
  if (wizardAnswers.brideReadyAtCeremony) {
    return { name: ceremony.name, address: ceremony.address };
  }
  if (wizardAnswers.brideReadyAtReception) {
    return { name: reception.name, address: reception.address };
  }
  return {
    name: wizardAnswers.brideReadyAddress || "Getting Ready Location",
    address: wizardAnswers.brideReadyStreet || "",
  };
}

function resolveGroomReady(wizardAnswers, ceremony, reception, brideReady) {
  if (wizardAnswers.groomReadyAtCeremony) {
    return { name: ceremony.name, address: ceremony.address };
  }
  if (wizardAnswers.groomReadyAtReception) {
    return { name: reception.name, address: reception.address };
  }
  if (wizardAnswers.groomReadyAtBride) {
    return { name: brideReady.name, address: brideReady.address };
  }
  return {
    name: wizardAnswers.groomReadyAddress || "Groom's Getting Ready Location",
    address: wizardAnswers.groomReadyStreet || "",
  };
}

function resolveWeddingLocations(wizardAnswers) {
  const ceremony = resolveCeremony(wizardAnswers);
  const reception = resolveReception(wizardAnswers, ceremony);
  const brideReady = resolveBrideReady(wizardAnswers, ceremony, reception);
  const groomReady = resolveGroomReady(wizardAnswers, ceremony, reception, brideReady);
  const differentReadyLocations = groomReady.name !== brideReady.name;

  const additionalLocations = (wizardAnswers.locations || []).map((loc, i) => ({
    name: loc.name || `Portrait Location ${i + 1}`,
    address: loc.address || "",
  }));

  const addressByName = new Map();
  const register = (name, address) => {
    if (name) addressByName.set(name, address || "");
  };
  register(ceremony.name, ceremony.address);
  register(reception.name, reception.address);
  register(brideReady.name, brideReady.address);
  register(groomReady.name, groomReady.address);
  additionalLocations.forEach((loc) => register(loc.name, loc.address));
  (wizardAnswers.portraitLocations || []).forEach((loc, i) => {
    const name = loc.name || `Portrait Location ${i + 1}`;
    register(name, loc.address || addressByName.get(name) || "");
  });

  return {
    ceremony,
    reception,
    brideReady,
    groomReady,
    differentReadyLocations,
    additionalLocations,
    addressByName,
  };
}

export {
  resolveWeddingLocations,
  resolveCeremony,
  resolveReception,
  resolveBrideReady,
  resolveGroomReady,
};
