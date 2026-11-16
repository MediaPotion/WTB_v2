import { migrateRowsV2toV3, migrateSavedRows } from "./projectMigration";
import { flowTimes } from "./flow";

const r = (id, time, duration, event = `E${id}`, extra = {}) => ({ id, time, duration, event, type: "event", ...extra });

// A version-2 timeline as saved: array order is not display order, with a gap
// (before the ceremony), an overlap (rows 4 and 5) and a tie (rows 1 and 2).
const v2Rows = [
  r(5, 790, 15),
  { ...r(1, 720, 0, "Coverage Start"), type: "location" },
  r(2, 720, 20, "Details: Rings, Invitations, & Accessories"),
  r(3, 740, 30),
  r(4, 770, 30),
  r(6, 900, 30, "Ceremony: Average"),
  r(7, 930, 20),
];

describe("migrateRowsV2toV3", () => {
  const migrated = migrateRowsV2toV3(v2Rows);

  test("orders rows by time, ties in saved order", () => {
    expect(migrated.map((x) => x.id)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  test("times are identical after migrating and flowing", () => {
    const byId = new Map(v2Rows.map((x) => [x.id, x.time]));
    flowTimes(migrated).forEach((row) => expect(row.time).toBe(byId.get(row.id)));
  });

  test("pins rows after a gap or overlap, ceremonies and coverage starts", () => {
    const pinned = migrated.filter((x) => x.isTimeLocked).map((x) => x.id);
    expect(pinned).toEqual([1, 5, 6]); // 1 coverage start, 5 overlap, 6 gap + ceremony
  });

  test("leaves rows that already follow on unpinned", () => {
    expect(migrated.find((x) => x.id === 3).isTimeLocked).toBeFalsy();
    expect(migrated.find((x) => x.id === 7).isTimeLocked).toBeFalsy();
  });

  test("keeps existing pins and other fields", () => {
    const out = migrateRowsV2toV3([r(1, 720, 10, "A", { notes: "n", isTimeLocked: true })]);
    expect(out[0]).toMatchObject({ notes: "n", isTimeLocked: true, time: 720 });
  });
});

test("a 0-minute marker sharing a start time goes first, so nothing runs into it", () => {
  const out = migrateRowsV2toV3([r(2, 720, 20, "Details"), { ...r(1, 720, 0, "Coverage Start"), type: "location" }, r(3, 740, 10)]);
  expect(out.map((x) => x.id)).toEqual([1, 2, 3]);
  expect(out.filter((x) => x.isTimeLocked).map((x) => x.id)).toEqual([1]);
});

describe("migrateSavedRows", () => {
  test("version 3 rows are left as they are", () => {
    const rows = [r(2, 800, 10), r(1, 720, 10)];
    expect(migrateSavedRows(rows, 3)).toBe(rows);
  });
  test("files without a version are treated as version 2", () => {
    expect(migrateSavedRows([r(2, 800, 10), r(1, 720, 10)], undefined).map((x) => x.id)).toEqual([1, 2]);
  });
  test("empty input", () => {
    expect(migrateSavedRows(undefined, 2)).toEqual([]);
  });
});
