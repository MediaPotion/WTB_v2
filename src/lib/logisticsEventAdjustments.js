/** Minimum recommended durations for logistics inline editors (minutes). */
export const RECEPTION_DURATION_MINIMUMS = {
  "Reception: Open Dance Floor": 15,
  "Reception: Garder Belt Toss": 10,
  "Reception: Bouquet Toss": 10,
};

export function minimumDurationForEvent(eventName) {
  if (RECEPTION_DURATION_MINIMUMS[eventName] != null) {
    return RECEPTION_DURATION_MINIMUMS[eventName];
  }
  return 5;
}

export function isEventRemoved(adjustments, eventName) {
  return !!adjustments?.[eventName]?.removed;
}

export function durationOverride(adjustments, eventName, defaultDuration) {
  if (isEventRemoved(adjustments, eventName)) return null;
  const d = adjustments?.[eventName]?.duration;
  if (d != null && !Number.isNaN(Number(d))) {
    return Math.max(1, parseInt(d, 10));
  }
  return defaultDuration;
}
