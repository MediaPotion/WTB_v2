import { generateTimeline } from "./generateTimeline";
import { calculateLogistics } from "./calculateLogistics";
import { buildWizardAnswers } from "./buildWizardAnswers";
import { formatClockLabel, parseTimeInput } from "./time";
import { countOverflowConflicts } from "./logisticsConflictCopy";

export function mergeDraftProps(props, pending) {
  if (!pending || Object.keys(pending).length === 0) return props;
  const merged = { ...props };
  for (const key of Object.keys(pending)) {
    if (key === "wiz_logisticsEventAdjustments") {
      merged.wiz_logisticsEventAdjustments = {
        ...(props.wiz_logisticsEventAdjustments || {}),
        ...pending.wiz_logisticsEventAdjustments,
      };
    } else {
      merged[key] = pending[key];
    }
  }
  return merged;
}

export function patchPendingState(prev, patch) {
  if (!patch || Object.keys(patch).length === 0) return prev || {};
  const next = { ...(prev || {}) };
  for (const key of Object.keys(patch)) {
    if (key === "wiz_logisticsEventAdjustments") {
      next.wiz_logisticsEventAdjustments = {
        ...(prev?.wiz_logisticsEventAdjustments || {}),
        ...patch.wiz_logisticsEventAdjustments,
      };
    } else {
      next[key] = patch[key];
    }
  }
  return next;
}

export function hasPendingChanges(pending) {
  return pending != null && Object.keys(pending).length > 0;
}

function photoEndMinutes(props) {
  if (props.photoEndHour == null) return null;
  return parseTimeInput(
    props.photoEndHour,
    props.photoEndMinute || "00",
    props.photoEndPeriod || "PM"
  );
}

function videoEndMinutes(props) {
  if (props.videoEndHour == null) return null;
  return parseTimeInput(
    props.videoEndHour,
    props.videoEndMinute || "00",
    props.videoEndPeriod || "PM"
  );
}

/** Human-readable summary of all pending edits (for Apply button area). */
export function describePendingSummary(committedProps, pending, window) {
  if (!hasPendingChanges(pending)) return "";
  const draft = mergeDraftProps(committedProps, pending);
  const lines = [];

  const committedPhotoEnd = photoEndMinutes(committedProps);
  const draftPhotoEnd = photoEndMinutes(draft);
  if (
    draftPhotoEnd != null &&
    committedPhotoEnd != null &&
    draftPhotoEnd !== committedPhotoEnd
  ) {
    const delta = draftPhotoEnd - committedPhotoEnd;
    const winLabel = window?.label || "Late Reception";
    lines.push(
      `Coverage will extend to ${formatClockLabel(draftPhotoEnd)}` +
        (delta > 0 ? ` — adds ${delta} minutes to ${winLabel} window` : "")
    );
  }

  const committedVideoEnd = videoEndMinutes(committedProps);
  const draftVideoEnd = videoEndMinutes(draft);
  if (
    draftVideoEnd != null &&
    committedVideoEnd != null &&
    draftVideoEnd !== committedVideoEnd
  ) {
    lines.push(`Video coverage will end at ${formatClockLabel(draftVideoEnd)}`);
  }

  const committedAdj = committedProps.wiz_logisticsEventAdjustments || {};
  const draftAdj = draft.wiz_logisticsEventAdjustments || {};
  for (const eventName of new Set([
    ...Object.keys(committedAdj),
    ...Object.keys(draftAdj),
  ])) {
    const before = committedAdj[eventName] || {};
    const after = draftAdj[eventName] || {};
    if (after.removed && !before.removed) {
      lines.push(`${eventName} will be removed`);
    } else if (
      after.duration != null &&
      after.duration !== before.duration
    ) {
      lines.push(`${eventName} shortened to ${after.duration} minutes`);
    }
  }

  const receptionFlags = [
    ["wiz_openDanceFloor", "Open Dance Floor"],
    ["wiz_garterToss", "Garter Toss"],
    ["wiz_bouquetToss", "Bouquet Toss"],
    ["wiz_speeches", "Speeches"],
    ["wiz_cakeCutting", "Cake cutting"],
    ["wiz_firstDance", "First dance"],
    ["wiz_grandEntrance", "Grand entrance"],
    ["wiz_drone", "Drone coverage"],
    ["wiz_preCeremonyDetails", "Pre-ceremony details"],
    ["wiz_standardWeddingPartyShots", "Wedding party group shots"],
    ["wiz_standardCouplePortraits", "Couple portraits"],
    ["wiz_includeGoldenHour", "Golden hour session"],
    ["wiz_firstLookGroom", "First look with groom"],
  ];
  for (const [key, label] of receptionFlags) {
    if (pending[key] !== undefined && pending[key] !== committedProps[key]) {
      lines.push(
        pending[key] ? `${label} will be included` : `${label} will be removed`
      );
    }
  }

  if (pending.photoStartHour !== undefined) {
    lines.push(
      `Coverage will start at ${formatClockLabel(
        parseTimeInput(
          draft.photoStartHour,
          draft.photoStartMinute,
          draft.photoStartPeriod
        )
      )}`
    );
  }

  if (pending.wiz_receptionHour !== undefined) {
    lines.push(
      `Reception will start at ${formatClockLabel(
        parseTimeInput(
          draft.wiz_receptionHour,
          draft.wiz_receptionMinute,
          draft.wiz_receptionPeriod
        )
      )}`
    );
  }

  if (pending.wiz_familyGroups !== undefined && pending.wiz_familyGroups !== committedProps.wiz_familyGroups) {
    lines.push(`Family groups set to ${pending.wiz_familyGroups}`);
  }

  return lines.join(". ");
}

const PENDING_SETTERS = [
  ["photoEndHour", "setPhotoEndHour"],
  ["photoEndMinute", "setPhotoEndMinute"],
  ["photoEndPeriod", "setPhotoEndPeriod"],
  ["videoEndHour", "setVideoEndHour"],
  ["videoEndMinute", "setVideoEndMinute"],
  ["videoEndPeriod", "setVideoEndPeriod"],
  ["photoStartHour", "setPhotoStartHour"],
  ["photoStartMinute", "setPhotoStartMinute"],
  ["photoStartPeriod", "setPhotoStartPeriod"],
  ["wiz_receptionHour", "setWiz_receptionHour"],
  ["wiz_receptionMinute", "setWiz_receptionMinute"],
  ["wiz_receptionPeriod", "setWiz_receptionPeriod"],
  ["wiz_dinnerStartHour", "setWiz_dinnerStartHour"],
  ["wiz_dinnerStartMinute", "setWiz_dinnerStartMinute"],
  ["wiz_dinnerStartPeriod", "setWiz_dinnerStartPeriod"],
  ["wiz_openDanceFloor", "setWiz_openDanceFloor"],
  ["wiz_garterToss", "setWiz_garterToss"],
  ["wiz_bouquetToss", "setWiz_bouquetToss"],
  ["wiz_speeches", "setWiz_speeches"],
  ["wiz_cakeCutting", "setWiz_cakeCutting"],
  ["wiz_firstDance", "setWiz_firstDance"],
  ["wiz_brideParentDance", "setWiz_brideParentDance"],
  ["wiz_groomParentDance", "setWiz_groomParentDance"],
  ["wiz_grandEntrance", "setWiz_grandEntrance"],
  ["wiz_drone", "setWiz_drone"],
  ["wiz_preCeremonyDetails", "setWiz_preCeremonyDetails"],
  ["wiz_preCeremonyDetailRings", "setWiz_preCeremonyDetailRings"],
  ["wiz_preCeremonyDetailDress", "setWiz_preCeremonyDetailDress"],
  ["wiz_preCeremonyDetailDrone", "setWiz_preCeremonyDetailDrone"],
  ["wiz_standardPerson1Solo", "setWiz_standardPerson1Solo"],
  ["wiz_standardPerson2Solo", "setWiz_standardPerson2Solo"],
  ["wiz_standardBridePartyPortraits", "setWiz_standardBridePartyPortraits"],
  ["wiz_standardGroomPartyPortraits", "setWiz_standardGroomPartyPortraits"],
  ["wiz_standardWeddingPartyShots", "setWiz_standardWeddingPartyShots"],
  ["wiz_standardCouplePortraits", "setWiz_standardCouplePortraits"],
  ["wiz_includeGoldenHour", "setWiz_includeGoldenHour"],
  ["wiz_firstLookGroom", "setWiz_firstLookGroom"],
  ["wiz_familyGroups", "setWiz_familyGroups"],
  ["wiz_preCeremonyBrideParty", "setWiz_preCeremonyBrideParty"],
  ["wiz_preCeremonyGroomParty", "setWiz_preCeremonyGroomParty"],
];

/** Apply pending patches to parent wizard setters. */
export function applyPendingToWizard(props, pending) {
  if (!hasPendingChanges(pending)) return;
  for (const [field, setterName] of PENDING_SETTERS) {
    if (pending[field] !== undefined && typeof props[setterName] === "function") {
      props[setterName](pending[field]);
    }
  }
  if (pending.wiz_logisticsEventAdjustments && props.setWiz_logisticsEventAdjustments) {
    props.setWiz_logisticsEventAdjustments({
      ...(props.wiz_logisticsEventAdjustments || {}),
      ...pending.wiz_logisticsEventAdjustments,
    });
  }
}

export function previewLogistics(committedProps, pending) {
  const draft = mergeDraftProps(committedProps, pending);
  const answers = buildWizardAnswers(draft);
  const rows = generateTimeline(answers);
  const report = calculateLogistics(answers, rows);
  return { answers, rows, report, draft };
}

export function buildApplyConfirmationMessage({
  pending,
  committedProps,
  beforeReport,
  afterReport,
  focusedWindowId,
}) {
  const summaryParts = [];
  const detail = describePendingSummary(committedProps, pending);
  if (detail) {
    const firstSentence = detail.split(".")[0];
    if (firstSentence) summaryParts.push(firstSentence);
  }

  const beforeOverflow = countOverflowConflicts(beforeReport.windows);
  const afterOverflow = countOverflowConflicts(afterReport.windows);

  if (afterOverflow === 0 && beforeOverflow > 0) {
    return {
      text: "Changes applied — all conflicts resolved ✓",
      tone: "success",
    };
  }

  if (focusedWindowId) {
    const beforeWin = beforeReport.windows.find((w) => w.id === focusedWindowId);
    const afterWin = afterReport.windows.find((w) => w.id === focusedWindowId);
    if (
      beforeWin?.status === "overflow" &&
      afterWin &&
      afterWin.status !== "overflow"
    ) {
      return {
        text: `Changes applied — ${afterWin.label} conflict resolved ✓`,
        tone: "success",
      };
    }
  }

  if (afterOverflow > 0) {
    const base = summaryParts[0] || "schedule updated";
    return {
      text: `Changes applied — ${base}. ${afterOverflow} conflict${
        afterOverflow !== 1 ? "s" : ""
      } remaining`,
      tone: "warning",
    };
  }

  const base = summaryParts[0] || "schedule updated";
  return {
    text: `Changes applied — ${base}`,
    tone: "success",
  };
}
