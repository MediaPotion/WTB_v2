/**
 * Timing model (Phase 1). Row ORDER is the source of truth:
 *
 * - The first row starts at the day's start time.
 * - Each row starts when the one before it ends ...
 * - ... unless it is pinned (`isTimeLocked`): then it keeps its own time.
 * - A row marked `withPrevious` happens at the same time as the row above it
 *   (e.g. bride and groom portraits by two shooters). It starts with that row,
 *   and the next row waits until both have ended. No overlap warning.
 *
 * Constraint rows (old wizard) are left alone and don't affect the flow.
 */

const durationOf = (row) => Math.max(0, parseInt(row.duration, 10) || 0);
const isFlowRow = (row) => row.type !== "constraint";

/**
 * Walk rows in order and call `place(row, i, expectedStart, prevStart)` for each
 * flowable row; it returns the row's actual start. Shared by flowTimes and
 * pinnedNotices so both agree on what "expected" means.
 */
function walk(rows, startTime, place) {
  let cursor = null; // when the next row would start
  let groupEnd = null; // latest end among the previous row and rows running with it
  let prevStart = null;
  rows.forEach((row, i) => {
    if (!isFlowRow(row)) return;
    const expected = cursor === null ? (startTime ?? row.time) : cursor;
    const start = place(row, i, expected, prevStart);
    const end = start + durationOf(row);
    const joinsPrevious = row.withPrevious && prevStart !== null && !row.isTimeLocked;
    groupEnd = joinsPrevious ? Math.max(groupEnd, end) : end;
    cursor = groupEnd;
    prevStart = start;
  });
}

function startFor(row, expected, prevStart, isFirst) {
  if (row.isTimeLocked) return row.time;
  if (isFirst) return expected;
  if (row.withPrevious && prevStart !== null) return prevStart;
  return expected;
}

/**
 * Returns rows (same order) with flowed start times. Rows whose time doesn't
 * change are returned as the same objects.
 *
 * @param {object[]} rows
 * @param {{ startTime?: number }} [opts] start of the day; defaults to the
 *   first row's current time. Pass the old first row's time after a reorder
 *   so the day keeps its start.
 */
function flowTimes(rows, { startTime } = {}) {
  const result = [...rows];
  let first = true;
  walk(rows, startTime, (row, i, expected, prevStart) => {
    const start = startFor(row, expected, prevStart, first);
    first = false;
    if (start !== row.time) result[i] = { ...row, time: start };
    return start;
  });
  return result;
}

/**
 * For each pinned row (other than the first), how it meets the rows before it:
 *   { kind: "overrun", minutes }  — earlier rows run this many minutes into it
 *   { kind: "free", minutes }     — this many free minutes before it
 * Rows that line up exactly get no entry. Expects rows already flowed.
 * Returns Map(row.id → notice).
 */
function pinnedNotices(rows) {
  const notices = new Map();
  let first = true;
  walk(rows, undefined, (row, i, expected) => {
    const isFirst = first;
    first = false;
    if (row.isTimeLocked && !isFirst && row.time !== expected) {
      const diff = expected - row.time;
      notices.set(row.id, diff > 0 ? { kind: "overrun", minutes: diff } : { kind: "free", minutes: -diff });
    }
    return row.time;
  });
  return notices;
}

/** Start of the day: the first flowable row's time (or undefined). */
function dayStart(rows) {
  const first = rows.find(isFlowRow);
  return first ? first.time : undefined;
}

export { flowTimes, pinnedNotices, dayStart };
