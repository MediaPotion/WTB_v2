import { RENAMED_EVENTS, RENAMED_PREFIXES, migrateEventName } from "./renamedEvents";
import { EVENT_BLOCKS } from "../constants/events";
import { getEventColor, COLOR_BUCKETS } from "../constants/colors";

const blockNames = EVENT_BLOCKS.map((b) => b.split("::")[0]);

// Every block name as it was saved before the Phase 2.7 renames.
const oldBlockNames = blockNames.map((name) => {
  const exact = Object.keys(RENAMED_EVENTS).find((k) => RENAMED_EVENTS[k] === name);
  if (exact) return exact;
  const prefix = RENAMED_PREFIXES.find(([, newPrefix]) => name.startsWith(newPrefix));
  return prefix ? prefix[0] + name.slice(prefix[1].length) : name;
});

describe("migrateEventName", () => {
  test("maps every renamed name to a current template block", () => {
    Object.entries(RENAMED_EVENTS).forEach(([oldName, newName]) => {
      expect(blockNames).not.toContain(oldName);
      expect(blockNames).toContain(newName);
      expect(migrateEventName(oldName)).toBe(newName);
    });
  });

  test("every block saved under its old name loads as the current block", () => {
    oldBlockNames.forEach((oldName, i) => expect(migrateEventName(oldName)).toBe(blockNames[i]));
  });

  test("renamed categories keep a colour", () => {
    ["Bride (Pre-Dress): Putting Dress On", "Bride (Dress On): Bride Portraits", "Narration: Bride Record Narration"].forEach((old) => {
      expect(getEventColor(migrateEventName(old))).not.toBe(COLOR_BUCKETS.Other);
    });
  });

  test("leaves other names alone", () => {
    expect(migrateEventName("Ceremony: About 30 min")).toBe("Ceremony: About 30 min");
    expect(migrateEventName("My own event")).toBe("My own event");
    expect(migrateEventName("Bride getting ready: Hair")).toBe("Bride getting ready: Hair");
    expect(migrateEventName("")).toBe("");
    expect(migrateEventName(undefined)).toBe(undefined);
  });
});
