import { parseTimeInput } from "./time";

const MONTH_GH_START = {
  0: 16 * 60 + 30,
  1: 17 * 60 + 0,
  2: 17 * 60 + 30,
  3: 18 * 60 + 0,
  4: 18 * 60 + 30,
  5: 19 * 60 + 0,
  6: 19 * 60 + 0,
  7: 18 * 60 + 30,
  8: 18 * 60 + 0,
  9: 17 * 60 + 30,
  10: 16 * 60 + 30,
  11: 16 * 60 + 0,
};

const SUNSET_OFFSET = 50;

function formatMinutes(mins) {
  const h24 = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

export function formatGoldenHourRange(startMins, sunsetMins) {
  return `${formatMinutes(startMins)} to ${formatMinutes(sunsetMins)}`;
}

function estimateFromDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T12:00:00");
  if (Number.isNaN(d.getTime())) return null;
  const start = MONTH_GH_START[d.getMonth()] ?? 18 * 60;
  const sunset = start + SUNSET_OFFSET;
  return { start, sunset, windowMinutes: SUNSET_OFFSET, source: "estimate" };
}

export async function geocodeAddress(address) {
  const q = String(address || "").trim();
  if (!q) return null;
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const hit = data?.results?.[0];
    if (!hit?.latitude || !hit?.longitude) return null;
    return { lat: hit.latitude, lon: hit.longitude, label: hit.name };
  } catch {
    return null;
  }
}

/** Sunset estimate from latitude and day-of-year (simplified). */
function sunsetMinutesUtc(dateStr, lat) {
  const d = new Date(dateStr + "T12:00:00");
  const day = Math.floor(
    (d - new Date(d.getFullYear(), 0, 0)) / 86400000
  );
  const decl = 23.45 * Math.sin(((360 / 365) * (day - 81) * Math.PI) / 180);
  const latRad = (lat * Math.PI) / 180;
  const declRad = (decl * Math.PI) / 180;
  const cosHa = -Math.tan(latRad) * Math.tan(declRad);
  const ha = Math.acos(Math.max(-1, Math.min(1, cosHa))) * (180 / Math.PI);
  const sunsetUtcHours = 12 + ha / 15;
  return Math.round(sunsetUtcHours * 60);
}

export function getGoldenHourFromCoords(dateStr, lat, lon) {
  if (!dateStr || lat == null || lon == null) return null;
  const sunset = sunsetMinutesUtc(dateStr, lat);
  const start = Math.max(0, sunset - SUNSET_OFFSET);
  return {
    start,
    sunset,
    windowMinutes: SUNSET_OFFSET,
    source: "geocode",
    lat,
    lon,
  };
}

export function getGoldenHourWindowSync(dateStr, _address) {
  return estimateFromDate(dateStr);
}

export function goldenHourOverlapsReception(gh, receptionHour, receptionMinute, receptionPeriod) {
  if (!gh?.start || !gh?.sunset) return false;
  const recStart = parseTimeInput(receptionHour, receptionMinute, receptionPeriod);
  return recStart >= gh.start && recStart < gh.sunset;
}
