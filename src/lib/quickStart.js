import { generateTimeline } from "./generateTimeline";
import { migrateRowsV2toV3 } from "./projectMigration";
import { flowTimes } from "./flow";
import { formatTime } from "./time";
import { buildCoverageStartBlockDefs, coverageDefsToUserRows } from "./coverageStartBlocks";

/**
 * Quick start (Phase 3): a handful of answers → a full-day draft, using the
 * existing generator with sensible defaults for everything it would
 * otherwise ask.
 */
const QUICK_START_DEFAULTS = {
  bride: "",
  groom: "",
  date: "",
  ceremonyTime: 16 * 60, // 4:00 PM
  ceremonyLength: 30, // 30 = typical, 60 = full Mass
  firstLook: false,
  twoVenues: false, // ceremony and reception in different places
  coverageStart: 12 * 60, // when photo/video coverage begins
  coverageHours: 8,
};

const COCKTAIL_HOUR = 60;
const TRAVEL_BETWEEN_VENUES = 20;

const roundTo5 = (m) => Math.round(m / 5) * 5;
const clock = (minutes) => {
  const t = formatTime(((minutes % 1440) + 1440) % 1440);
  return { hour: t.hour, minute: t.minute, period: t.period };
};

/** Quick-start input → the generator's wizard answers. */
function buildQuickStartAnswers(input = {}) {
  const q = { ...QUICK_START_DEFAULTS, ...input };
  const ceremony = clock(q.ceremonyTime);
  const receptionStart = roundTo5(
    q.ceremonyTime + q.ceremonyLength + COCKTAIL_HOUR + (q.twoVenues ? TRAVEL_BETWEEN_VENUES : 0)
  );
  const reception = clock(receptionStart);
  const dinner = clock(receptionStart + 15);
  const ceremonyVenue = "Ceremony";
  const receptionVenue = q.twoVenues ? "Reception" : ceremonyVenue;

  return {
    date: q.date,
    brideLabel: q.bride,
    groomLabel: q.groom,
    photoEnabled: true,
    videoEnabled: true,
    // No coverage start here on purpose: given one, the generator slides the
    // whole day (ceremony included) to begin at it. The quick start adds its
    // own pinned "Coverage Start" row instead (generateQuickStartRows).
    enteredViaWizard: true,
    photoCoverageHours: "",
    videoCoverageHours: "",

    ceremonyHour: ceremony.hour,
    ceremonyMinute: ceremony.minute,
    ceremonyPeriod: ceremony.period,
    ceremonyDuration: q.ceremonyLength,
    ceremonyVenue,
    ceremonyAddress: "",
    receptionSameAsCeremony: !q.twoVenues,
    receptionVenue,
    receptionAddress: "",
    distanceReceptionToCeremony: q.twoVenues ? String(TRAVEL_BETWEEN_VENUES) : "0",
    receptionHour: reception.hour,
    receptionMinute: reception.minute,
    receptionPeriod: reception.period,

    firstLookGroom: !!q.firstLook,
    firstLookGroomLocation: q.firstLook ? ceremonyVenue : "",
    brideOkayBefore: !!q.firstLook,

    familyGroups: "5",
    familyGroupNames: [],
    portraitLocations: [],
    locations: [],
    weddingPartyGroupShots: true,
    couplePortraits: true,
    preCeremonyBrideReady: true,
    preCeremonyDetails: true,
    preCeremonyBrideParty: true,
    preCeremonyGroomReady: true,
    preCeremonyGroomParty: true,

    grandEntrance: true,
    dinner: true,
    dinnerStartHour: dinner.hour,
    dinnerStartMinute: dinner.minute,
    dinnerStartPeriod: dinner.period,
    speeches: true,
    speechCount: 2,
    firstDance: true,
    brideParentDance: true,
    groomParentDance: true,
    cakeCutting: true,
    openDanceFloor: true,
    garterToss: false,
    bouquetToss: false,
    goldenHour: false,
    includeGoldenHour: false,
    drone: false,
    narration: false,
    appliedLogisticsSuggestions: [],
  };
}

/**
 * Quick-start input → timeline rows in the current (version 3) model: in
 * order, the ceremony and coverage start pinned, anything else that doesn't
 * follow on pinned so the draft keeps the generator's times.
 */
function generateQuickStartRows(input = {}) {
  const q = { ...QUICK_START_DEFAULTS, ...input };
  const generated = generateTimeline(buildQuickStartAnswers(q));
  const start = clock(q.coverageStart);
  const coverageRows = coverageDefsToUserRows(
    buildCoverageStartBlockDefs({
      photoEnabled: true,
      videoEnabled: true,
      photoStartHour: start.hour,
      photoStartMinute: start.minute,
      photoStartPeriod: start.period,
      videoStartHour: start.hour,
      videoStartMinute: start.minute,
      videoStartPeriod: start.period,
    }),
    { startId: generated.length + 1 }
  );
  return flowTimes(migrateRowsV2toV3([...coverageRows, ...generated]));
}

/** Project settings (names, date, coverage window) for the quick-start input. */
function quickStartProjectSettings(input = {}) {
  const q = { ...QUICK_START_DEFAULTS, ...input };
  const start = clock(q.coverageStart);
  const end = clock(q.coverageStart + Math.round(q.coverageHours * 60));
  return {
    bride: q.bride,
    groom: q.groom,
    date: q.date,
    photoStartHour: start.hour,
    photoStartMinute: start.minute,
    photoStartPeriod: start.period,
    photoEndHour: end.hour,
    photoEndMinute: end.minute,
    photoEndPeriod: end.period,
    videoStartHour: start.hour,
    videoStartMinute: start.minute,
    videoStartPeriod: start.period,
    videoEndHour: end.hour,
    videoEndMinute: end.minute,
    videoEndPeriod: end.period,
  };
}

export { QUICK_START_DEFAULTS, buildQuickStartAnswers, generateQuickStartRows, quickStartProjectSettings };
