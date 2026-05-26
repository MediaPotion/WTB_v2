import { parseTimeInput, formatClockLabel } from "./time";
import { resolveCeremonyDuration } from "./buildWizardAnswers";

const WEDDING_PARTY_EVENT = "Wedding Party: Group Shots";
const BRIDE_GROOM_PORTRAITS_EVENT = "Bride & Groom: Portraits";

/** Build schedule context for plain-English conflict copy. */
export function buildLogisticsContext(state) {
  const ceremonyStart = parseTimeInput(
    state.wiz_ceremonyHour || "12",
    state.wiz_ceremonyMinute || "00",
    state.wiz_ceremonyPeriod || "PM"
  );
  const ceremonyDuration = resolveCeremonyDuration(state);
  const ceremonyEnd = ceremonyStart + ceremonyDuration;
  const receptionStart = parseTimeInput(
    state.wiz_receptionHour || "6",
    state.wiz_receptionMinute || "00",
    state.wiz_receptionPeriod || "PM"
  );
  const dinnerStart =
    state.wiz_dinner && state.wiz_dinnerStartHour != null
      ? parseTimeInput(
          state.wiz_dinnerStartHour,
          state.wiz_dinnerStartMinute || "00",
          state.wiz_dinnerStartPeriod || "PM"
        )
      : null;
  const coverageStart =
    state.photoStartHour != null
      ? parseTimeInput(
          state.photoStartHour,
          state.photoStartMinute || "00",
          state.photoStartPeriod || "PM"
        )
      : null;

  return {
    ceremonyStart,
    ceremonyEnd,
    ceremonyDuration,
    receptionStart,
    dinnerStart,
    coverageStart,
    groomLabel: state.groomLabel || "Groom",
    brideLabel: state.brideLabel || "Bride",
  };
}

/** Plain-English bottleneck text using actual times. */
export function describeBottleneckDetailed(window, ctx) {
  const available = window.availableMinutes;
  const used = window.usedMinutes;
  const over = window.overflowMinutes;
  const ceremonyEndLabel = formatClockLabel(ctx.ceremonyEnd);
  const receptionStartLabel = formatClockLabel(ctx.receptionStart);

  if (window.id === "B") {
    return `There is not enough time between the ceremony ending at ${ceremonyEndLabel} and the reception starting at ${receptionStartLabel} for all planned portrait sessions. You need ${used} minutes but only have ${available} minutes (${over} minutes short). Try adding a first look with ${ctx.groomLabel}, pushing dinner back, or moving wedding party shots before the ceremony.`;
  }
  if (window.id === "A") {
    const coverageLabel = ctx.coverageStart != null ? formatClockLabel(ctx.coverageStart) : "your coverage start";
    const neededStart = ctx.coverageStart != null ? formatClockLabel(ctx.coverageStart - over) : "earlier";
    return `Your pre-ceremony window is tight. Coverage would need to start at ${neededStart} to fit everything in (currently ${coverageLabel}). Consider removing some pre-ceremony sessions or starting coverage earlier.`;
  }
  return `There is not enough time in ${window.label} (${formatClockLabel(window.startTime)} – ${formatClockLabel(window.endTime)}) for all planned events. You need ${used} minutes but only have ${available} minutes (${over} minutes short).`;
}

/** Map suggestion → control keys and inline helper copy. */
export function buildInlineHints(suggestions, ctx) {
  const hints = {};
  const add = (key, text) => {
    if (!text) return;
    hints[key] = hints[key] ? `${hints[key]} ${text}` : text;
  };

  for (const s of suggestions) {
    switch (s.type) {
      case "move_pre_ceremony":
        if (s.targetEvents?.includes(WEDDING_PARTY_EVENT)) {
          add(
            "portrait_weddingParty",
            `Moving this before the ceremony would free up ${s.minutesSaved} minutes in your post-ceremony window.`
          );
          add(
            "firstLookGroom",
            `A first look with ${ctx.groomLabel} allows portrait sessions before the ceremony, which can relieve time pressure after the ceremony.`
          );
        }
        if (s.targetEvents?.includes(BRIDE_GROOM_PORTRAITS_EVENT)) {
          add(
            "portrait_couple",
            `Scheduling couple portraits before the ceremony could free up about ${s.minutesSaved} minutes after the ceremony.`
          );
          add(
            "firstLookGroom",
            `A first look with ${ctx.groomLabel} allows portrait sessions before the ceremony, which can relieve time pressure after the ceremony.`
          );
        }
        break;
      case "flex_dinner":
        add(
          "dinnerStart",
          `Pushing dinner later by up to ${s.minutesSaved} minutes would add time for portraits before the reception.`
        );
        add("dinnerFlex", "Mark dinner as flexible so the schedule can shift if needed.");
        break;
      case "flex_reception":
        add(
          "receptionStart",
          `A later reception start (up to ${s.minutesSaved} minutes) would widen your post-ceremony portrait window.`
        );
        add("receptionFlex", "Mark the reception start as flexible so the schedule can shift if needed.");
        break;
      case "earlier_start":
        add(
          "photoStart",
          `Starting coverage ${s.minutesSaved} minutes earlier would give your pre-ceremony window enough room.`
        );
        break;
      case "move_details":
        add(
          "preCeremonyDetails",
          "Moving detail shots to the reception would free up time before the ceremony."
        );
        break;
      case "move_drone":
        add(
          "preCeremonyDetails",
          "Moving drone shots to the reception venue could save about 30 minutes before the ceremony."
        );
        break;
      case "reduce_groups":
        add(
          "familyGroups",
          "Fewer family groupings means less time immediately after the ceremony."
        );
        break;
      default:
        break;
    }
  }

  return hints;
}

export function countOverflowConflicts(windows) {
  return windows.filter((w) => w.status === "overflow").length;
}
