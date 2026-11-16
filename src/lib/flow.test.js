import { flowTimes, pinnedNotices, dayStart } from "./flow";

const r = (id, time, duration, extra = {}) => ({ id, time, duration, event: `E${id}`, type: "event", ...extra });
const times = (rows) => rows.map((x) => x.time);
const NOON = 720;

describe("flowTimes", () => {
  test("each row starts when the one before it ends", () => {
    const rows = [r(1, NOON, 10), r(2, 0, 20), r(3, 0, 15)];
    expect(times(flowTimes(rows))).toEqual([720, 730, 750]);
  });

  test("lengthening a duration pushes every later unpinned row by the difference", () => {
    const before = flowTimes([r(1, NOON, 10), r(2, 0, 20), r(3, 0, 15), r(4, 0, 5)]);
    const longer = flowTimes(before.map((x) => (x.id === 1 ? { ...x, duration: 30 } : x)));
    expect(times(longer).slice(1)).toEqual(times(before).slice(1).map((t) => t + 20));
  });

  test("pinned rows never move", () => {
    const rows = [r(1, NOON, 10), r(2, 0, 20), r(3, 900, 30, { isTimeLocked: true }), r(4, 0, 15)];
    const out = flowTimes(rows);
    expect(out[2].time).toBe(900);
    expect(out[3].time).toBe(930); // after the pinned row
    const longer = flowTimes(out.map((x) => (x.id === 2 ? { ...x, duration: 300 } : x)));
    expect(longer[2].time).toBe(900);
  });

  test("a pinned first row keeps its time even with a different day start", () => {
    const rows = [r(1, 600, 10, { isTimeLocked: true }), r(2, 0, 20)];
    expect(times(flowTimes(rows, { startTime: NOON }))).toEqual([600, 610]);
  });

  test("reordering then flowing keeps the first row's start time", () => {
    const rows = flowTimes([r(1, NOON, 10), r(2, 0, 20), r(3, 0, 15)]);
    const start = dayStart(rows);
    const reordered = [rows[2], rows[0], rows[1]]; // move last to top
    const out = flowTimes(reordered, { startTime: start });
    expect(out[0].id).toBe(3);
    expect(times(out)).toEqual([720, 735, 745]);
  });

  test("moving a row down and back up gives the original times", () => {
    const rows = flowTimes([r(1, NOON, 10), r(2, 0, 20), r(3, 0, 15)]);
    const start = dayStart(rows);
    const down = flowTimes([rows[0], rows[2], rows[1]], { startTime: start });
    const back = flowTimes([down[0], down[2], down[1]], { startTime: start });
    expect(times(back)).toEqual(times(rows));
  });

  test("unpinning snaps a row back into the flow", () => {
    const rows = flowTimes([r(1, NOON, 10), r(2, 800, 20, { isTimeLocked: true })]);
    expect(rows[1].time).toBe(800);
    const unpinned = flowTimes(rows.map((x) => (x.id === 2 ? { ...x, isTimeLocked: false } : x)));
    expect(unpinned[1].time).toBe(730);
  });

  test("a row 'with the previous one' starts with it; the next waits for both", () => {
    const rows = [r(1, NOON, 10), r(2, 0, 20), r(3, 0, 30, { withPrevious: true }), r(4, 0, 15)];
    expect(times(flowTimes(rows))).toEqual([720, 730, 730, 760]);
  });

  test("a shorter row 'with the previous one' doesn't shorten the wait", () => {
    const rows = [r(1, NOON, 40), r(2, 0, 10, { withPrevious: true }), r(3, 0, 15)];
    expect(times(flowTimes(rows))).toEqual([720, 720, 760]);
  });

  test("'with previous' on the first row is ignored", () => {
    expect(times(flowTimes([r(1, NOON, 10, { withPrevious: true }), r(2, 0, 5)]))).toEqual([720, 730]);
  });

  test("constraint rows are left alone and don't affect the flow", () => {
    const rows = [r(1, NOON, 10), { ...r(2, 999, 60), type: "constraint" }, r(3, 0, 15)];
    expect(times(flowTimes(rows))).toEqual([720, 999, 730]);
  });

  test("bad durations count as zero", () => {
    expect(times(flowTimes([r(1, NOON, ""), r(2, 0, "abc"), r(3, 0, 5)]))).toEqual([720, 720, 720]);
  });

  test("rows whose time doesn't change keep their identity", () => {
    const rows = flowTimes([r(1, NOON, 10), r(2, 0, 20)]);
    const again = flowTimes(rows);
    expect(again[0]).toBe(rows[0]);
    expect(again[1]).toBe(rows[1]);
  });
});

describe("pinnedNotices", () => {
  test("earlier rows running into a pinned row: overrun minutes", () => {
    const rows = flowTimes([r(1, NOON, 60), r(2, 0, 20), r(3, 780, 30, { isTimeLocked: true })]);
    // rows 1–2 end at 1:20 PM; the pinned row is at 1:00 PM
    expect(pinnedNotices(rows).get(3)).toEqual({ kind: "overrun", minutes: 20 });
  });

  test("a gap before a pinned row: free minutes", () => {
    const rows = flowTimes([r(1, NOON, 10), r(2, 0, 20), r(3, 780, 30, { isTimeLocked: true })]);
    expect(pinnedNotices(rows).get(3)).toEqual({ kind: "free", minutes: 30 });
  });

  test("no notice when a pinned row lines up exactly, or for unpinned rows", () => {
    const rows = flowTimes([r(1, NOON, 10), r(2, 730, 20, { isTimeLocked: true }), r(3, 0, 5)]);
    expect(pinnedNotices(rows).size).toBe(0);
  });

  test("rows running together end when the longer one ends", () => {
    const rows = flowTimes([
      r(1, NOON, 10),
      r(2, 0, 50, { withPrevious: true }),
      r(3, 780, 30, { isTimeLocked: true }),
    ]);
    expect(pinnedNotices(rows).get(3)).toEqual({ kind: "free", minutes: 10 });
  });

  test("a pinned first row gets no notice", () => {
    expect(pinnedNotices([r(1, NOON, 10, { isTimeLocked: true })]).size).toBe(0);
  });
});
