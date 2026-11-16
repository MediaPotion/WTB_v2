/**
 * Where new rows go. `displayRows` is the list as the user sees it (sorted by
 * time); `userRows` is the stored array, whose order breaks ties between rows
 * with the same start time.
 */

const DEFAULT_START = 12 * 60;

/** Start time for a row of `duration` minutes inserted at display position `insertIndex`. */
function insertTimeAt(displayRows, insertIndex, duration) {
  if (displayRows.length === 0) return DEFAULT_START;
  if (insertIndex <= 0) {
    return Math.max(0, displayRows[0].time - (duration || 0));
  }
  const prev = displayRows[Math.min(insertIndex, displayRows.length) - 1];
  const prevEnd = prev.time + (prev.duration || 0);
  if (insertIndex >= displayRows.length) return prevEnd;
  const next = displayRows[insertIndex];
  // No gap left before the next row: start halfway between the two starts so
  // the new row still sorts between them.
  return prevEnd <= next.time ? prevEnd : Math.floor((prev.time + next.time) / 2);
}

/**
 * Returns a new userRows array with `newRow` placed so it shows at display
 * position `insertIndex` (ties on time keep array order).
 */
function insertRowAt(userRows, displayRows, insertIndex, newRow) {
  const result = [...userRows];
  let position = result.length;
  if (insertIndex < displayRows.length) {
    const before = displayRows[insertIndex];
    const i = result.findIndex((r) => r.id === before.id);
    if (i !== -1) position = i;
  }
  result.splice(position, 0, newRow);
  return result;
}

function isEmptyEventRow(row) {
  return (row.type || "event") === "event" && !String(row.event || "").trim();
}

/**
 * What a sidebar block dropped on `overId` should do:
 * - between rows ("between-N"): insert at N
 * - on an empty row: fill it
 * - on a filled row: insert below it
 * Returns null when the target is not part of the timeline.
 */
function resolveBlockDrop(displayRows, overId) {
  const id = String(overId || "");
  if (id.startsWith("between-")) {
    const index = parseInt(id.slice("between-".length), 10);
    if (Number.isNaN(index)) return null;
    return { mode: "insert", index: Math.max(0, Math.min(index, displayRows.length)) };
  }
  if (id.startsWith("row-")) {
    const rowId = id.slice("row-".length);
    const index = displayRows.findIndex((r) => String(r.id) === rowId);
    if (index === -1) return null;
    if (isEmptyEventRow(displayRows[index])) return { mode: "fill", index };
    return { mode: "insert", index: index + 1 };
  }
  return null;
}

export { insertTimeAt, insertRowAt, resolveBlockDrop, isEmptyEventRow };
