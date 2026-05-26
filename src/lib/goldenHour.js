import { formatTime } from "./time";

const GOLDEN_HOUR_START_BY_MONTH = [
  990, 1035, 1125, 1170, 1200, 1230, 1215, 1170, 1125, 1080, 990, 960,
];
const SUNSET_OFFSET_MINUTES = 45;

/**
 * Estimate golden hour window from wedding date (month) and ceremony location.
 * Address is required for display; month-based estimates use Northern Michigan defaults.
 */
export function getGoldenHourWindow(date, ceremonyAddress) {
  if (!date || !String(ceremonyAddress || "").trim()) {
    return { available: false, start: null, sunset: null, end: null };
  }
  const parts = String(date).split("-");
  if (parts.length < 2) {
    return { available: false, start: null, sunset: null, end: null };
  }
  const monthIndex = parseInt(parts[1], 10) - 1;
  if (monthIndex < 0 || monthIndex > 11) {
    return { available: false, start: null, sunset: null, end: null };
  }
  const start = GOLDEN_HOUR_START_BY_MONTH[monthIndex];
  const sunset = start + SUNSET_OFFSET_MINUTES;
  return { available: true, start, sunset, end: start + 20 };
}

export function formatGoldenHourRange(start, sunset) {
  if (start == null || sunset == null) return "";
  const s = formatTime(start);
  const e = formatTime(sunset);
  return `${s.hour}:${s.minute} ${s.period} to ${e.hour}:${e.minute} ${e.period}`;
}
