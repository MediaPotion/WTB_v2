import { generateTimeline } from "./generateTimeline";
import { calculateLogistics } from "./calculateLogistics";
import { findFirstLookWithGroom } from "./logisticsRowUtils";

/** Cara & Alex — August 28, 2026 scenario (representative wizard inputs). */
function caraAlexAnswers() {
  return {
    date: "2026-08-28",
    brideLabel: "Cara",
    groomLabel: "Alex",
    photoEnabled: true,
    videoEnabled: true,
    photoStartHour: "11",
    photoStartMinute: "00",
    photoStartPeriod: "AM",
    photoCoverageHours: "8",
    ceremonyHour: "3",
    ceremonyMinute: "00",
    ceremonyPeriod: "PM",
    ceremonyDuration: 30,
    receptionHour: "5",
    receptionMinute: "00",
    receptionPeriod: "PM",
    receptionSameAsCeremony: false,
    receptionVenue: "Reception Hall",
    receptionAddress: "123 Main St",
    ceremonyVenue: "Ceremony",
    ceremonyAddress: "3 Chapel Rd",
    distanceReceptionToCeremony: "10",
    firstLookGroom: true,
    firstLookGroomLocation: "Ceremony",
    wiz_brideOkayBefore: false,
    familyGroups: "10",
    familyGroupNames: [],
    portraitLocations: [],
    weddingPartyGroupShots: true,
    couplePortraits: true,
    wiz_standardWeddingPartyShots: true,
    wiz_standardCouplePortraits: true,
    wiz_includeGoldenHour: false,
    wiz_drone: false,
    wiz_preCeremonyDetails: true,
    wiz_dinner: false,
    grandEntrance: false,
    wiz_locations: [
      { id: 1, name: "Bride Ready", address: "1 Bride Ln" },
      { id: 2, name: "Groom Ready", address: "2 Groom Ln" },
      { id: 3, name: "Ceremony", address: "3 Chapel Rd" },
    ],
    brideReadyAddress: "Bride Ready",
    brideReadyStreet: "1 Bride Ln",
    groomReadyAddress: "Groom Ready",
    groomReadyStreet: "2 Groom Ln",
    wiz_standardPerson1Solo: true,
    wiz_standardPerson2Solo: true,
    wiz_preCeremonyBrideReady: true,
    wiz_preCeremonyGroomReady: true,
    wiz_appliedLogisticsSuggestions: [],
  };
}

function countReceptionLocationsAt(rows, time, venue) {
  return rows.filter(
    (r) =>
      r.type === "location" &&
      r.event === venue &&
      Math.abs(r.time - time) < 2
  ).length;
}

describe("calculateLogistics reads generated rows", () => {
  test("Cara & Alex Aug 2026 — first look on timeline, post-ceremony tight not overflow", () => {
    const answers = caraAlexAnswers();
    const rows = generateTimeline(answers);
    const report = calculateLogistics(answers, rows);

    expect(findFirstLookWithGroom(rows, "Alex")).toBeTruthy();
    expect(rows.some((r) => /first look/i.test(r.event || ""))).toBe(true);

    const windowB = report.windows.find((w) => w.id === "B");
    expect(windowB).toBeDefined();
    expect(Number.isFinite(report.scheduleCtx.ceremonyEnd)).toBe(true);
    expect(windowB.overflowMinutes).toBe(0);
    expect(windowB.status).not.toBe("overflow");
    expect(windowB.usedMinutes).toBe(80);
    expect(windowB.availableMinutes).toBe(80);
    expect(windowB.status).toBe("tight");
    expect(windowB.remainingMinutes).toBe(0);

    const suggestsFirstLook = report.suggestions.some(
      (s) =>
        /first look/i.test(s.description || "") &&
        /add|try|unlock/i.test(s.description || "")
    );
    expect(suggestsFirstLook).toBe(false);

    const suggestsMovePartyPre = report.suggestions.some(
      (s) =>
        s.type === "move_pre_ceremony" &&
        s.targetEvents?.includes("Wedding Party: Group Shots")
    );
    const partyPre = rows.some(
      (r) => r.event === "Wedding Party: Group Shots" && r.time < report.scheduleCtx.ceremonyStart
    );
    if (partyPre) {
      expect(suggestsMovePartyPre).toBe(false);
    }

    const dupes = countReceptionLocationsAt(rows, windowB.endTime, "Reception Hall");
    expect(dupes).toBeLessThanOrEqual(1);
  });
});
