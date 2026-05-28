import { parseTimeInput } from "./time";
import { DEFAULT_ROW_TIER_FIELDS } from "../constants/tiers";

export const COVERAGE_START_EVENT = "Coverage Start";

export function isWizardCoverageHoursSpecified(hoursValue) {
  const trimmed = String(hoursValue ?? "").trim();
  if (!trimmed) return false;
  const n = parseFloat(trimmed);
  return !Number.isNaN(n) && n > 0;
}

export function isPhotoCoverageConfigured({
  photoEnabled,
  enteredViaWizard = false,
  wiz_photoCoverageHours = "",
}) {
  if (!photoEnabled) return false;
  if (!enteredViaWizard) return true;
  return isWizardCoverageHoursSpecified(wiz_photoCoverageHours);
}

export function isVideoCoverageConfigured({
  videoEnabled,
  enteredViaWizard = false,
  wiz_videoCoverageHours = "",
}) {
  if (!videoEnabled) return false;
  if (!enteredViaWizard) return true;
  return isWizardCoverageHoursSpecified(wiz_videoCoverageHours);
}

/**
 * @returns {{ timeMin: number, notes: string, photo: boolean, video: boolean }[]}
 */
export function buildCoverageStartBlockDefs({
  photoEnabled,
  videoEnabled,
  photoStartHour,
  photoStartMinute,
  photoStartPeriod,
  videoStartHour,
  videoStartMinute,
  videoStartPeriod,
  enteredViaWizard = false,
  wiz_photoCoverageHours = "",
  wiz_videoCoverageHours = "",
}) {
  const photoActive = isPhotoCoverageConfigured({
    photoEnabled,
    enteredViaWizard,
    wiz_photoCoverageHours,
  });
  const videoActive = isVideoCoverageConfigured({
    videoEnabled,
    enteredViaWizard,
    wiz_videoCoverageHours,
  });

  const photoMin = photoActive
    ? parseTimeInput(photoStartHour, photoStartMinute, photoStartPeriod)
    : null;
  const videoMin = videoActive
    ? parseTimeInput(videoStartHour, videoStartMinute, videoStartPeriod)
    : null;

  if (photoMin == null && videoMin == null) return [];

  if (photoMin != null && videoMin != null && photoMin === videoMin) {
    return [
      {
        timeMin: photoMin,
        notes:
          "Photographer and videographer begin shooting at this time.",
        photo: true,
        video: true,
      },
    ];
  }

  const defs = [];
  if (photoMin != null) {
    defs.push({
      timeMin: photoMin,
      notes: "Photographer begins shooting at this time.",
      photo: true,
      video: false,
    });
  }
  if (videoMin != null) {
    defs.push({
      timeMin: videoMin,
      notes: "Videographer begins shooting at this time.",
      photo: false,
      video: true,
    });
  }
  return defs.sort((a, b) => a.timeMin - b.timeMin);
}

/** Timeline row objects for coverage-start location blocks. */
export function coverageDefsToUserRows(defs, { startId = 1, photoEnabled = true, videoEnabled = true } = {}) {
  return defs.map((def, i) => ({
    id: startId + i,
    type: "location",
    event: COVERAGE_START_EVENT,
    time: def.timeMin,
    duration: 0,
    location: "",
    address: "",
    notes: def.notes,
    isOutdoor: false,
    photo: def.photo && photoEnabled,
    video: def.video && videoEnabled,
    isTimeLocked: false,
    color: "",
    ...DEFAULT_ROW_TIER_FIELDS,
  }));
}

/** Insert coverage-start location blocks into generated wizard blocks (with times set). */
export function insertCoverageStartBlocks(allBlocks, wizardAnswers) {
  const defs = buildCoverageStartBlockDefs({
    photoEnabled: wizardAnswers.photoEnabled !== false,
    videoEnabled: wizardAnswers.videoEnabled !== false,
    photoStartHour: wizardAnswers.photoStartHour,
    photoStartMinute: wizardAnswers.photoStartMinute,
    photoStartPeriod: wizardAnswers.photoStartPeriod,
    videoStartHour: wizardAnswers.videoStartHour,
    videoStartMinute: wizardAnswers.videoStartMinute,
    videoStartPeriod: wizardAnswers.videoStartPeriod,
    enteredViaWizard: wizardAnswers.enteredViaWizard !== false,
    wiz_photoCoverageHours: wizardAnswers.photoCoverageHours,
    wiz_videoCoverageHours: wizardAnswers.videoCoverageHours,
  });
  for (const def of defs) {
    allBlocks.push({
      type: "location",
      event: COVERAGE_START_EVENT,
      address: "",
      duration: 0,
      notes: def.notes,
      time: def.timeMin,
      photo: def.photo,
      video: def.video,
    });
  }
  if (defs.length > 0) {
    allBlocks.sort((a, b) => (a.time ?? 0) - (b.time ?? 0));
  }
}
