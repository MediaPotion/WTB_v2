const COLOR_BUCKETS = {
  Details: "#FFE5B4",
  "Bride (Pre-Dress)": "#FFB6C1",
  "Bride (Dress On)": "#FF69B4",
  "First Look": "#20B2AA",
  "Bride & Groom:": "#DA70D6",
  "Narration:": "#FFA07A",
  "Groom:": "#98FB98",
  "Ceremony:": "#FFD700",
  "Reception:": "#87CEEB",
  "Group Photos:": "#DDA0DD",
  "Wedding Party:": "#B57EDC",
  Other: "#ffffff", // default to white
};

const MINUTE_OPTIONS_5 = Array.from({ length: 12 }, (_, i) =>
  String(i * 5).padStart(2, "0")
);

function snapMinuteToFive(minuteStr) {
  const rawMin = parseInt(minuteStr, 10) || 0;
  return String(Math.round(rawMin / 5) * 5 % 60).padStart(2, "0");
}

function getEventColor(label, fallback = "#ffffff") {
  if (!label) return fallback;
  const key = Object.keys(COLOR_BUCKETS).find((k) => label.startsWith(k));
  return COLOR_BUCKETS[key] || COLOR_BUCKETS.Other;
}

function isBridePreDressEvent(eventName) {
  return String(eventName || "").startsWith("Bride (Pre-Dress):");
}

function defaultIsOutdoorForEvent(eventName) {
  if (isBridePreDressEvent(eventName)) return false;
  return undefined;
}

export { COLOR_BUCKETS, getEventColor, isBridePreDressEvent, defaultIsOutdoorForEvent };
