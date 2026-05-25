import { formatTime } from "./time";

function setTimeFromMinutes(setters, totalMinutes) {
  const t = formatTime(totalMinutes);
  if (setters.setHour) setters.setHour(t.hour);
  if (setters.setMinute) setters.setMinute(t.minute);
  if (setters.setPeriod) setters.setPeriod(t.period);
}

/**
 * Apply a logistics suggestion to wizard state (via setter callbacks).
 * Returns the suggestion record to store in appliedLogisticsSuggestions.
 */
export function applyLogisticsSuggestion(suggestion, handlers) {
  const applied = { ...suggestion, appliedAt: Date.now() };

  switch (suggestion.type) {
    case "move_pre_ceremony":
      if (
        suggestion.targetEvents?.includes("Wedding Party: Group Shots") &&
        handlers.setBrideOkayBefore
      ) {
        handlers.setBrideOkayBefore(true);
      }
      if (
        suggestion.targetEvents?.includes("Bride & Groom: Portraits") &&
        handlers.setBrideOkayBefore
      ) {
        handlers.setBrideOkayBefore(true);
      }
      break;

    case "flex_dinner":
      if (suggestion.newTime != null && handlers.setDinnerStartHour) {
        setTimeFromMinutes(
          {
            setHour: handlers.setDinnerStartHour,
            setMinute: handlers.setDinnerStartMinute,
            setPeriod: handlers.setDinnerStartPeriod,
          },
          suggestion.newTime
        );
      }
      break;

    case "flex_reception":
      if (suggestion.newTime != null && handlers.setReceptionHour) {
        setTimeFromMinutes(
          {
            setHour: handlers.setReceptionHour,
            setMinute: handlers.setReceptionMinute,
            setPeriod: handlers.setReceptionPeriod,
          },
          suggestion.newTime
        );
      }
      break;

    case "earlier_start":
      if (suggestion.newTime != null && handlers.setPhotoStartHour) {
        setTimeFromMinutes(
          {
            setHour: handlers.setPhotoStartHour,
            setMinute: handlers.setPhotoStartMinute,
            setPeriod: handlers.setPhotoStartPeriod,
          },
          suggestion.newTime
        );
      }
      break;

    case "move_drone":
      break;

    case "move_details":
      if (handlers.setPreCeremonyDetails) handlers.setPreCeremonyDetails(false);
      break;

    case "reduce_groups":
      if (handlers.setFamilyGroups) {
        if (handlers.getFamilyGroups?.() === "10") handlers.setFamilyGroups("5");
        else if (handlers.getFamilyGroups?.() === "5") handlers.setFamilyGroups("none");
      }
      break;

    default:
      break;
  }

  return applied;
}

/** Plain-English bottleneck description for the logistics UI. */
export function describeBottleneck(window) {
  const available = window.availableMinutes;
  const used = window.usedMinutes;
  const over = window.overflowMinutes;
  if (window.id === "B") {
    return `There is not enough time between the ceremony and reception for all planned portrait sessions. You need ${used} minutes but only have ${available} minutes available (${over} minutes over).`;
  }
  return `There is not enough time in ${window.label} for all planned events. You need ${used} minutes but only have ${available} minutes available (${over} minutes over).`;
}
