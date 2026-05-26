/**
 * Build the wizard answers object used by generateTimeline and calculateLogistics.
 */

export function resolveCeremonyDurationForGeneration(state) {
  const type = state.wiz_ceremonyType || "average";
  if (type === "catholic") {
    return Math.max(parseInt(state.wiz_ceremonyDuration, 10) || 60, 46);
  }
  if (type === "other") {
    return parseInt(state.wiz_ceremonyOtherDuration, 10) || 30;
  }
  return Math.min(parseInt(state.wiz_ceremonyDuration, 10) || 30, 45);
}

export function buildWizardAnswers(state) {
  const ceremonyDuration = resolveCeremonyDurationForGeneration(state);

  return {
    date: state.date,
    photoEnabled: state.photoEnabled,
    videoEnabled: state.videoEnabled,
    photoStartHour: state.photoStartHour,
    photoStartMinute: state.photoStartMinute,
    photoStartPeriod: state.photoStartPeriod,
    photoCoverageHours: state.wiz_photoCoverageHours,
    videoCoverageHours: state.wiz_videoCoverageHours,
    ceremonyDuration,
    ceremonyHour: state.wiz_ceremonyHour,
    ceremonyMinute: state.wiz_ceremonyMinute,
    ceremonyPeriod: state.wiz_ceremonyPeriod,
    receptionHour: state.wiz_receptionHour,
    receptionMinute: state.wiz_receptionMinute,
    receptionPeriod: state.wiz_receptionPeriod,
    firstLookGroom: state.wiz_firstLookGroom,
    brideOkayBefore: state.wiz_brideOkayBefore,
    grandEntrance: state.wiz_grandEntrance,
    dinner: state.wiz_dinner,
    dinnerStartHour: state.wiz_dinnerStartHour,
    dinnerStartMinute: state.wiz_dinnerStartMinute,
    dinnerStartPeriod: state.wiz_dinnerStartPeriod,
    dinnerStyle: state.wiz_dinnerStyle,
    familyGroups: state.wiz_familyGroups,
    familyGroupNames: state.wiz_familyGroupNames,
    groomReadyAtCeremony: state.wiz_groomReadyAtCeremony,
    groomReadyAtReception: state.wiz_groomReadyAtReception,
    groomReadyAtBride: state.wiz_groomReadyAtBride,
    groomReadyAddress: state.wiz_groomReadyAddress,
    ceremonyVenue: state.wiz_ceremonyVenue,
    receptionSameAsCeremony: state.wiz_receptionSameAsCeremony,
    receptionVenue: state.wiz_receptionVenue,
    receptionAddress: state.wiz_receptionAddress,
    ceremonyAddress: state.wiz_ceremonyAddress,
    brideReadyAddress: state.wiz_brideReadyAddress,
    brideReadyStreet: state.wiz_brideReadyStreet,
    brideReadyAtCeremony: state.wiz_brideReadyAtCeremony,
    brideReadyAtReception: state.wiz_brideReadyAtReception,
    groomReadyStreet: state.wiz_groomReadyStreet,
    locations: state.wiz_locations,
    portraitSessions: state.wiz_portraitSessions,
    goldenHour: state.wiz_includeGoldenHour,
    firstLookParent: state.wiz_firstLookParent,
    firstLookBridesmaids: state.wiz_firstLookBridesmaids,
    firstLookOther: state.wiz_firstLookOther,
    firstLookGroomLocation: state.wiz_firstLookGroomLocation,
    firstLookParentLocation: state.wiz_firstLookParentLocation,
    firstLookBridesmaidsLocation: state.wiz_firstLookBridesmaidsLocation,
    firstLookOtherLocation: state.wiz_firstLookOtherLocation,
    drone: state.wiz_drone,
    narration: state.wiz_narration,
    portraitLocations: (state.wiz_portraitLocations || []).map((loc) => ({
      ...loc,
      name: loc.name || loc.description || "",
    })),
    distanceBetweenReady: state.wiz_distanceBetweenReady,
    distanceGroomToCeremony: state.wiz_distanceGroomToCeremony,
    distanceBrideToCeremony: state.wiz_distanceBrideToCeremony,
    distanceReceptionToCeremony: state.wiz_distanceReceptionToCeremony,
    ceremonyOutdoor: state.wiz_ceremonyOutdoor,
    cakeCutting: state.wiz_cakeCutting,
    firstDance: state.wiz_firstDance,
    brideParentDance: state.wiz_brideParentDance,
    groomParentDance: state.wiz_groomParentDance,
    specialDance: state.wiz_specialDance,
    speeches: state.wiz_speeches,
    speechCount: state.wiz_speechCount,
    openDanceFloor: state.wiz_openDanceFloor,
    garterToss: state.wiz_garterToss,
    bouquetToss: state.wiz_bouquetToss,
    preCeremonyBrideReady: state.wiz_preCeremonyBrideReady,
    preCeremonyPreDress: state.wiz_preCeremonyPreDress,
    preCeremonyDetails: state.wiz_preCeremonyDetails,
    preCeremonyBrideParty: state.wiz_preCeremonyBrideParty,
    preCeremonyGroomReady: state.wiz_preCeremonyGroomReady,
    preCeremonyGroomParty: state.wiz_preCeremonyGroomParty,
    dinnerFlexibility: state.wiz_dinnerFlexibility,
    receptionStartFlexibility: state.wiz_receptionStartFlexibility,
    appliedLogisticsSuggestions: state.wiz_appliedLogisticsSuggestions || [],
  };
}
