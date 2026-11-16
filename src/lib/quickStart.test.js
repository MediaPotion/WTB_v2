import { generateQuickStartRows, quickStartProjectSettings, QUICK_START_DEFAULTS } from "./quickStart";
import { flowTimes } from "./flow";

const ceremonyOf = (rows) => rows.find((r) => r.event.startsWith("Ceremony: ") && r.event !== "Ceremony: Audio/Video Setup");

describe("generateQuickStartRows", () => {
  test("minimal answers (only a ceremony time): a full day, in order, ceremony pinned at that time", () => {
    const rows = generateQuickStartRows({ ceremonyTime: 15 * 60 + 30 });
    expect(rows.length).toBeGreaterThan(20);
    rows.slice(1).forEach((row, i) => expect(row.time).toBeGreaterThanOrEqual(rows[i].time));
    const ceremony = ceremonyOf(rows);
    expect(ceremony).toMatchObject({ event: "Ceremony: Average", time: 15 * 60 + 30, duration: 30, isTimeLocked: true });
  });

  test("no answers at all still gives a draft with the defaults", () => {
    const rows = generateQuickStartRows();
    expect(ceremonyOf(rows).time).toBe(QUICK_START_DEFAULTS.ceremonyTime);
    expect(rows.some((r) => r.event === "Reception: Dinner")).toBe(true);
  });

  test("starts with a pinned Coverage Start at the coverage time", () => {
    const rows = generateQuickStartRows({ coverageStart: 11 * 60 });
    expect(rows[0]).toMatchObject({ event: "Coverage Start", time: 11 * 60, isTimeLocked: true, type: "location" });
  });

  test("times are already flowed (opening the draft moves nothing)", () => {
    const rows = generateQuickStartRows({ firstLook: true, twoVenues: true });
    expect(flowTimes(rows).map((r) => r.time)).toEqual(rows.map((r) => r.time));
  });

  test("ids are unique", () => {
    const rows = generateQuickStartRows({ firstLook: true, twoVenues: true });
    expect(new Set(rows.map((r) => r.id)).size).toBe(rows.length);
  });

  test("answers change the draft: first look, Mass length, second venue", () => {
    const plain = generateQuickStartRows();
    const full = generateQuickStartRows({ firstLook: true, ceremonyLength: 60, twoVenues: true });
    expect(plain.some((r) => r.event === "First Look: with Groom")).toBe(false);
    expect(full.some((r) => r.event === "First Look: with Groom")).toBe(true);
    expect(ceremonyOf(full)).toMatchObject({ event: "Ceremony: Catholic", duration: 60 });
    expect(full.some((r) => r.type === "location" && r.event === "Reception")).toBe(true);
    expect(plain.some((r) => r.type === "location" && r.event === "Reception")).toBe(false);
  });
});

describe("quickStartProjectSettings", () => {
  test("coverage window from start and hours", () => {
    expect(quickStartProjectSettings({ coverageStart: 11 * 60 + 30, coverageHours: 8, bride: "Ava", groom: "Liam" })).toMatchObject({
      bride: "Ava",
      groom: "Liam",
      photoStartHour: "11",
      photoStartMinute: "30",
      photoStartPeriod: "AM",
      photoEndHour: "7",
      photoEndMinute: "30",
      photoEndPeriod: "PM",
      videoEndHour: "7",
    });
  });
});
