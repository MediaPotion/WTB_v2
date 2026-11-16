import { insertTimeAt, insertRowAt, resolveBlockDrop } from "./rowInsert";

const row = (id, time, duration, event = `Event ${id}`) => ({ id, time, duration, event, type: "event" });
const byTime = (rows) => [...rows].sort((a, b) => a.time - b.time);

describe("insertTimeAt", () => {
  const rows = [row(1, 600, 30), row(2, 660, 20), row(3, 680, 10)];

  test("empty timeline starts at noon", () => {
    expect(insertTimeAt([], 0, 30)).toBe(720);
  });
  test("before the first row ends when it starts", () => {
    expect(insertTimeAt(rows, 0, 15)).toBe(585);
  });
  test("after the last row starts when it ends", () => {
    expect(insertTimeAt(rows, 3, 15)).toBe(690);
  });
  test("into a gap starts when the previous row ends", () => {
    expect(insertTimeAt(rows, 1, 15)).toBe(630);
  });
  test("between back-to-back rows starts at the next row's time", () => {
    expect(insertTimeAt(rows, 2, 15)).toBe(680);
  });
  test("between overlapping rows starts halfway between their starts", () => {
    const overlapping = [row(1, 600, 60), row(2, 620, 10)];
    expect(insertTimeAt(overlapping, 1, 15)).toBe(610);
  });
});

describe("insertRowAt", () => {
  test("new row shows at the requested position, even on a tied start time", () => {
    const userRows = [row(3, 680, 10), row(1, 600, 30), row(2, 660, 20)];
    const display = byTime(userRows);
    const newRow = row(9, insertTimeAt(display, 2, 15), 15);
    const result = insertRowAt(userRows, display, 2, newRow);
    expect(byTime(result).map((r) => r.id)).toEqual([1, 2, 9, 3]);
  });
  test("does not change any existing row", () => {
    const userRows = [row(1, 600, 30), row(2, 660, 20)];
    const result = insertRowAt(userRows, userRows, 1, row(9, 630, 15));
    expect(result.filter((r) => r.id !== 9)).toEqual(userRows);
  });
  test("appends at the end", () => {
    const userRows = [row(1, 600, 30)];
    expect(insertRowAt(userRows, userRows, 1, row(9, 630, 15)).map((r) => r.id)).toEqual([1, 9]);
  });
});

describe("resolveBlockDrop", () => {
  const rows = [row(1, 720, 0, "Coverage Start"), row(2, 720, 30, ""), row(3, 750, 20)];

  test("between rows inserts there", () => {
    expect(resolveBlockDrop(rows, "between-1")).toEqual({ mode: "insert", index: 1 });
  });
  test("on a filled row inserts below it (Coverage Start stays intact)", () => {
    expect(resolveBlockDrop(rows, "row-1")).toEqual({ mode: "insert", index: 1 });
  });
  test("on an empty row fills it", () => {
    expect(resolveBlockDrop(rows, "row-2")).toEqual({ mode: "fill", index: 1 });
  });
  test("a location row with no name is not treated as empty", () => {
    const withLocation = [{ ...row(5, 700, 15, ""), type: "location" }];
    expect(resolveBlockDrop(withLocation, "row-5")).toEqual({ mode: "insert", index: 1 });
  });
  test("unknown targets do nothing", () => {
    expect(resolveBlockDrop(rows, "row-99")).toBeNull();
    expect(resolveBlockDrop(rows, "sidebar-x")).toBeNull();
  });
});
