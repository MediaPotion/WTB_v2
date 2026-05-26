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

function estimateFromDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T12:00:00");
  if (Number.isNaN(d.getTime())) return null;
  const start = MONTH_GH_START[d.getMonth()] ?? 18 * 60;
  const sunset = start + SUNSET_OFFSET;
  return { start, sunset, windowMinutes: SUNSET_OFFSET, source: "estimate" };
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
    utcOffsetHours: longitudeToUtcOffsetHours(lon),
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

/** Sunset estimate from latitude and day-of-year (simplified, UTC minutes). */
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

export function getGoldenHourFromCoords(dateStr, lat, lon, utcOffsetHours) {
  if (!dateStr || lat == null || lon == null) return null;
  const offset =
    utcOffsetHours != null ? Number(utcOffsetHours) : longitudeToUtcOffsetHours(lon);
  const sunsetUtc = sunsetMinutesUtc(dateStr, lat);
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

export function getGoldenHourWindowSync(dateStr, _address) {
  return estimateFromDate(dateStr);
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
