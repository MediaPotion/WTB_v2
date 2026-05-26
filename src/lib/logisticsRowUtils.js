/** Shared row inspection helpers for logistics (no calculateLogistics dependency). */

export function rowDuration(row) {
  if (row.type === "constraint") return 0;
  return parseInt(row.duration, 10) || 0;
}

export function isActiveRow(row) {
  return row.type !== "constraint" && String(row.event || "").trim().length > 0;
}

export function isSchedulableEvent(row) {
  return isActiveRow(row) && row.type !== "location";
}

export function isCeremonyEvent(event) {
  return event === "Ceremony" || (event && event.startsWith("Ceremony:"));
}

export function isFirstLookRow(row) {
  return isSchedulableEvent(row) && /first look/i.test(String(row.event || ""));
}

export function findFirstLookWithGroom(rows, groomLabel = "Groom") {
  const groomKey = String(groomLabel || "Groom").toLowerCase();
  return (
    rows.find((r) => {
      const e = String(r.event || "").toLowerCase();
      return e.includes("first look") && e.includes("groom");
    }) ||
    rows.find((r) => {
      const e = String(r.event || "").toLowerCase();
      return e.includes("first look") && e.includes(groomKey);
    }) ||
    null
  );
}

export function hasFirstLookScheduled(rows) {
  return rows.some(isFirstLookRow);
}

export function eventScheduledBefore(rows, eventName, beforeTime) {
  return rows.some(
    (r) => isSchedulableEvent(r) && r.event === eventName && r.time < beforeTime
  );
}
