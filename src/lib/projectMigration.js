import { COVERAGE_START_EVENT } from "./coverageStartBlocks";

// Event names that are always pinned when an old file is migrated.
// (Event names are lookup keys — see NOTES "Gotchas".)
const CEREMONY_EVENTS = ["Ceremony: Average", "Ceremony: Catholic"];

const durationOf = (row) => Math.max(0, parseInt(row.duration, 10) || 0);

/**
 * Version 2 → 3. In version 2 the list was shown sorted by time and times
 * were set by hand; in version 3 row order is the truth and unpinned rows
 * flow one after another (src/lib/flow.js).
 *
 * Sort once by time (on a tie, 0-minute markers such as "Coverage Start" go
 * first; otherwise the saved order is kept, as v2 displayed them), then
 * pin every row that doesn't start exactly when the previous row ends — plus
 * ceremonies and coverage starts — so the timeline opens with identical times.
 */
function migrateRowsV2toV3(rows) {
  const sorted = [...(rows || [])].sort(
    (a, b) =>
      (a.time ?? 0) - (b.time ?? 0) ||
      (durationOf(a) === 0 ? 0 : 1) - (durationOf(b) === 0 ? 0 : 1)
  );
  let cursor = null;
  return sorted.map((row) => {
    if (row.type === "constraint") return row;
    const mustPin =
      row.isTimeLocked ||
      CEREMONY_EVENTS.includes(row.event) ||
      row.event === COVERAGE_START_EVENT ||
      (cursor !== null && row.time !== cursor);
    cursor = row.time + durationOf(row);
    return mustPin && !row.isTimeLocked ? { ...row, isTimeLocked: true } : row;
  });
}

/** Rows from a saved file or autosave, upgraded to the current version. */
function migrateSavedRows(rows, version) {
  if (!version || version < 3) return migrateRowsV2toV3(rows);
  return rows || [];
}

export { migrateRowsV2toV3, migrateSavedRows, CEREMONY_EVENTS };
