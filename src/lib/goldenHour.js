import { parseTimeInput } from "./time";

/** Default coords (Traverse City / Northern Michigan) when geocoding is unavailable. */
export const NORTHERN_MICHIGAN_DEFAULT_LAT = 44.76;
export const NORTHERN_MICHIGAN_DEFAULT_LON = -85.62;

const SUNSET_OFFSET = 45;

export function formatMinutes(mins) {
  const h24 = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

export function formatGoldenHourRange(startMins, sunsetMins) {
  return `${formatMinutes(startMins)} to ${formatMinutes(sunsetMins)}`;
}

export function formatCoordPair(lat, lon) {
  return `${Number(lat).toFixed(2)}, ${Number(lon).toFixed(2)}`;
}

/** Rough timezone offset from longitude (hours from UTC). */
export function longitudeToUtcOffsetHours(lon) {
  return Math.round(Number(lon) / 15);
}

/** Day-of-year (1–366) for a YYYY-MM-DD string. */
function dayOfYearFromDateStr(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
}

/** US Eastern: second Sunday in March (inclusive) through first Sunday in November (exclusive). */
function isUsEasternDaylightTime(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  if (Number.isNaN(d.getTime())) return false;
  const year = d.getFullYear();
  const secondSundayMarch = nthWeekdayOfMonth(year, 0, 2, 2);
  const firstSundayNovember = nthWeekdayOfMonth(year, 0, 1, 10);
  return d >= secondSundayMarch && d < firstSundayNovember;
}

/** @param month 0-based; weekday 0 = Sunday */
function nthWeekdayOfMonth(year, weekday, n, month) {
  const first = new Date(year, month, 1);
  const firstWeekday = first.getDay();
  let day = 1 + ((weekday - firstWeekday + 7) % 7) + (n - 1) * 7;
  return new Date(year, month, day);
}

/**
 * US Eastern civil offset from UTC (hours). EDT = -4, EST = -5.
 * Michigan and Northern Michigan weddings use this zone.
 */
export function getEasternUtcOffsetHours(dateStr) {
  return isUsEasternDaylightTime(dateStr) ? -4 : -5;
}

function equationOfTimeMinutes(day) {
  const b = ((360 / 365) * (day - 81) * Math.PI) / 180;
  return 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
}

async function nominatimSearch(query) {
  const q = String(query || "").trim();
  if (!q) return null;
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "WeddingTimelineBuilder/1.0",
    },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const hit = data?.[0];
  if (!hit?.lat || !hit?.lon) return null;
  const lat = parseFloat(hit.lat);
  const lon = parseFloat(hit.lon);
  if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
  return {
    lat,
    lon,
    utcOffsetHours: null,
    label: hit.display_name || q,
  };
}

/**
 * Geocode a venue address via OpenStreetMap Nominatim.
 * Tries the full string, then simpler comma-separated parts.
 * @returns {{ lat: number, lon: number, utcOffsetHours: number, label: string } | null}
 */
export async function geocodeAddress(address) {
  const q = String(address || "").trim();
  if (!q) return null;
  try {
    const attempts = [q];
    const parts = q.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length >= 2) attempts.push(parts.slice(-2).join(", "));
    if (parts.length >= 1) attempts.push(parts[parts.length - 1]);
    const seen = new Set();
    for (const attempt of attempts) {
      if (!attempt || seen.has(attempt)) continue;
      seen.add(attempt);
      const hit = await nominatimSearch(attempt);
      if (hit) return hit;
    }
    return null;
  } catch {
    return null;
  }
}

/** Try several venue/address combinations (Step 2 ceremony fields). */
export async function geocodeCeremonyLocation(venueName, streetAddress) {
  const venue = String(venueName || "").trim();
  const address = String(streetAddress || "").trim();
  const queries = [
    [venue, address].filter(Boolean).join(", "),
    address,
    venue,
  ].filter((q, i, arr) => q && arr.indexOf(q) === i);
  for (const q of queries) {
    const hit = await geocodeAddress(q);
    if (hit) return hit;
  }
  return null;
}

/** Sunset in minutes from midnight UTC (solar + longitude + equation of time). */
function sunsetMinutesUtc(dateStr, lat, lon) {
  const day = dayOfYearFromDateStr(dateStr);
  const decl = 23.45 * Math.sin(((360 / 365) * (day - 81) * Math.PI) / 180);
  const latRad = (lat * Math.PI) / 180;
  const declRad = (decl * Math.PI) / 180;
  const cosHa = -Math.tan(latRad) * Math.tan(declRad);
  const haDeg = Math.acos(Math.max(-1, Math.min(1, cosHa))) * (180 / Math.PI);
  const solarNoonUtc = 720 - 4 * lon - equationOfTimeMinutes(day);
  return Math.round(solarNoonUtc + 4 * haDeg);
}

/**
 * Golden hour from coordinates using US Eastern civil time (EDT/EST by wedding date).
 *
 * Test cases (lat 44.76, lng -85.62, Traverse City area):
 * - 2026-05-29: sunset ~9:07 PM EDT, golden hour start ~8:22 PM EDT (45 min window)
 * - 2026-12-15: sunset ~5:15 PM EST, golden hour start ~4:30 PM EST (45 min window)
 */
export function getGoldenHourFromCoords(dateStr, lat, lon, _utcOffsetHours) {
  if (!dateStr || lat == null || lon == null) return null;
  const offset = getEasternUtcOffsetHours(dateStr);
  const sunsetUtc = sunsetMinutesUtc(dateStr, lat, lon);
  const offsetMins = Math.round(offset * 60);
  const sunsetLocal = ((sunsetUtc + offsetMins) % 1440 + 1440) % 1440;
  const start = Math.max(0, sunsetLocal - SUNSET_OFFSET);
  return {
    start,
    sunset: sunsetLocal,
    windowMinutes: SUNSET_OFFSET,
    source: "geocode",
    lat,
    lon,
  };
}

/** Same solar + Eastern DST path as geocoded coords, using Northern Michigan defaults. */
export function getGoldenHourWindowSync(dateStr, _address) {
  if (!dateStr) return null;
  const result = getGoldenHourFromCoords(
    dateStr,
    NORTHERN_MICHIGAN_DEFAULT_LAT,
    NORTHERN_MICHIGAN_DEFAULT_LON
  );
  return result ? { ...result, source: "estimate" } : null;
}

export function goldenHourOverlapsReception(gh, receptionHour, receptionMinute, receptionPeriod) {
  if (!gh?.start || !gh?.sunset) return false;
  const recStart = parseTimeInput(receptionHour, receptionMinute, receptionPeriod);
  return recStart >= gh.start && recStart < gh.sunset;
}

export function parseCoordInput(value) {
  const n = parseFloat(String(value ?? "").trim());
  return Number.isFinite(n) ? n : null;
}

export function isValidLatitude(lat) {
  return lat != null && lat >= -90 && lat <= 90;
}

export function isValidLongitude(lon) {
  return lon != null && lon >= -180 && lon <= 180;
}
