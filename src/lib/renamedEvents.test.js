import { RENAMED_EVENTS, migrateEventName } from "./renamedEvents";
import { EVENT_BLOCKS } from "../constants/events";
import { getEventColor } from "../constants/colors";

const blockNames = EVENT_BLOCKS.map((b) => b.split("::")[0]);

describe("migrateEventName", () => {
  test("maps every old name to a current template block", () => {
    Object.entries(RENAMED_EVENTS).forEach(([oldName, newName]) => {
      expect(blockNames).not.toContain(oldName);
      expect(blockNames).toContain(newName);
      expect(migrateEventName(oldName)).toBe(newName);
    });
  });

  test("renamed events keep their colour", () => {
    Object.entries(RENAMED_EVENTS).forEach(([oldName, newName]) => {
      expect(getEventColor(newName)).toBe(getEventColor(oldName));
    });
  });

  test("leaves other names alone", () => {
    expect(migrateEventName("Ceremony: Average")).toBe("Ceremony: Average");
    expect(migrateEventName("My own event")).toBe("My own event");
    expect(migrateEventName("")).toBe("");
    expect(migrateEventName(undefined)).toBe(undefined);
  });
});
