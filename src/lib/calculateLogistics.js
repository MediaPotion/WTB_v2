import { parseTimeInput } from "./time";
import { TIER } from "../constants/tiers";

const GOLDEN_HOUR_DURATION = 20;
const SUNSET_OFFSET_MINUTES = 45;
const GOLDEN_HOUR_START_BY_MONTH = [
  990, 1035, 1125, 1170, 1200, 1230, 1215, 1170, 1125, 1080, 990, 960,
];

const GOLDEN_HOUR_EVENT = "Bride & Groom: Golden Hour Portraits";
const DETAIL_EVENTS = [
  "Details: Drone & Venue Shots",
  "Details: Rings, Invitations, & Accessories",
  "Details: Dress Shots",
];
const WEDDING_PARTY_EVENT = "Wedding Party: Group Shots";
const BRIDE_GROOM_PORTRAITS_EVENT = "Bride & Groom: Portraits";

function pick(answers, ...keys) {
  for (const key of keys) {
    if (answers[key] !== undefined && answers[key] !== null) return answers[key];
  }
  return undefined;
}

function parseTravelMin(str) {
  const n = parseInt(str, 10);
  return Number.isNaN(n) ? 0 : n;
}

function rowDuration(row) {
  if (row.type === "constraint") return 0;
  return parseInt(row.duration, 10) || 0;
}

function isActiveRow(row) {
  return row.type !== "constraint" && String(row.event || "").trim().length > 0;
}

/** Rows that overlap [start, end) by time. */
function rowsInRange(rows, start, end) {
  return rows.filter((row) => {
    if (!isActiveRow(row)) return false;
    const rowStart = row.time;
    const rowEnd = row.time + rowDuration(row);
    return rowStart < end && rowEnd > start;
  });
}

function sumDurations(rows) {
  return rows.reduce((sum, row) => sum + rowDuration(row), 0);
}

function windowStatus(remainingMinutes) {
  if (remainingMinutes < 0) return "overflow";
  if (remainingMinutes <= 15) return "tight";
  return "ok";
}

// Golden hour start (sunset − 45 min) and sunset from wedding date — Northern Michigan estimates.
function getGoldenHourSchedule(date) {
  if (!date) return { selected: false, start: null, sunset: null, end: null };
  const parts = String(date).split("-");
  if (parts.length < 2) return { selected: false, start: null, sunset: null, end: null };
  const monthIndex = parseInt(parts[1], 10) - 1;
  if (monthIndex < 0 || monthIndex > 11) {
    return { selected: false, start: null, sunset: null, end: null };
  }
  const start = GOLDEN_HOUR_START_BY_MONTH[monthIndex];
  const sunset = start + SUNSET_OFFSET_MINUTES;
  return {
    selected: true,
    start,
    sunset,
    end: start + GOLDEN_HOUR_DURATION,
  };
}

function hasGoldenHourSelected(answers, rows) {
  if (pick(answers, "goldenHour", "wiz_goldenHour", "includeGoldenHour")) return true;
  const sessions = pick(answers, "portraitSessions", "wiz_portraitSessions") || [];
  if (sessions.some((s) => s.type === "Golden Hour")) return true;
  return rows.some((r) => r.event === GOLDEN_HOUR_EVENT);
}

function resolveCoverageBounds(answers, rows) {
  const activeRows = rows.filter(isActiveRow);
  const rowStart = activeRows.length ? Math.min(...activeRows.map((r) => r.time)) : null;
  const rowEnd = activeRows.length
    ? Math.max(...activeRows.map((r) => r.time + rowDuration(r)))
    : null;

  let coverageStart = null;
  const photoStartHour = pick(answers, "photoStartHour", "wiz_photoStartHour");
  if (photoStartHour != null) {
    coverageStart = parseTimeInput(
      photoStartHour,
      pick(answers, "photoStartMinute", "wiz_photoStartMinute") || "00",
      pick(answers, "photoStartPeriod", "wiz_photoStartPeriod") || "PM"
    );
  } else if (rowStart != null) {
    coverageStart = rowStart;
  }

  let coverageEnd = rowEnd;
  const photoHours = parseFloat(pick(answers, "photoCoverageHours", "wiz_photoCoverageHours"));
  const videoHours = parseFloat(pick(answers, "videoCoverageHours", "wiz_videoCoverageHours"));
  const photoEnabled = pick(answers, "photoEnabled", "wiz_photoEnabled") !== false;
  const videoEnabled = pick(answers, "videoEnabled", "wiz_videoEnabled") !== false;

  if (coverageStart != null) {
    const ends = [];
    if (photoEnabled && !Number.isNaN(photoHours) && photoHours > 0) {
      ends.push(coverageStart + photoHours * 60);
    }
    if (videoEnabled && !Number.isNaN(videoHours) && videoHours > 0) {
      ends.push(coverageStart + videoHours * 60);
    }
    if (ends.length > 0) {
      coverageEnd = Math.max(...ends, rowEnd ?? 0);
    }
  }

  return { coverageStart, coverageEnd };
}

function buildWindowReport({ id, label, startTime, endTime, events, travelSubtract = 0 }) {
  const availableMinutes = Math.max(0, endTime - startTime - travelSubtract);
  const usedMinutes = sumDurations(events);
  const remainingMinutes = availableMinutes - usedMinutes;
  const status = windowStatus(remainingMinutes);
  return {
    id,
    label,
    startTime,
    endTime,
    availableMinutes,
    usedMinutes,
    remainingMinutes,
    status,
    events,
    overflowMinutes: status === "overflow" ? Math.abs(remainingMinutes) : 0,
  };
}

function isCeremonyEvent(event) {
  return event === "Ceremony" || (event && event.startsWith("Ceremony:"));
}

function isReceptionPhaseRow(row, receptionStart) {
  if (row.time < receptionStart) return false;
  const ev = row.event || "";
  if (ev.startsWith("Reception:")) return true;
  if (row.type === "location" && row.time >= receptionStart) return true;
  return false;
}

// --- Bottleneck analysis: which events overflow and whether adjacent moves or flex help ---
function analyzeBottleneck(window, allWindows, answers) {
  if (window.status !== "overflow") return null;

  const causingEvents = [...window.events]
    .filter(isActiveRow)
    .sort((a, b) => rowDuration(b) - rowDuration(a))
    .map((row) => ({
      event: row.event,
      duration: rowDuration(row),
      time: row.time,
      tier: row.tier,
      flexibilityMinutes: row.flexibilityMinutes ?? 0,
    }));

  const adjacentWindow = allWindows.find((w) => {
    if (w.id === window.id) return false;
    if (window.id === "B" && w.id === "A") return true;
    if (window.id === "A" && w.id === "B") return true;
    return false;
  });

  const canMoveToAdjacentWindow =
    !!adjacentWindow &&
    adjacentWindow.status !== "overflow" &&
    adjacentWindow.remainingMinutes >= window.overflowMinutes;

  const flexOptions = causingEvents
    .filter((e) => e.tier === TIER.SOFT && e.flexibilityMinutes > 0)
    .map((e) => ({
      event: e.event,
      tier: e.tier,
      flexibilityMinutes: e.flexibilityMinutes,
      minutesResolvable: Math.min(e.flexibilityMinutes, window.overflowMinutes),
    }));

  return {
    windowId: window.id,
    label: window.label,
    overflowMinutes: window.overflowMinutes,
    causingEvents,
    canMoveToAdjacentWindow,
    adjacentWindowId: canMoveToAdjacentWindow ? adjacentWindow.id : null,
    flexOptions,
  };
}

function suggestionBase(windowId, index, fields) {
  return {
    id: `${windowId}-s${index}`,
    windowId,
    partialResolution: false,
    resolvesBottleneck: false,
    targetEvents: [],
    newTime: null,
    ...fields,
  };
}

// --- Suggestions for Window B (post-ceremony portrait crunch) ---
function suggestionsForWindowB(window, answers, overflow, rows, ceremonyStart) {
  const suggestions = [];
  let idx = 0;
  const firstLookGroom = !!pick(answers, "firstLookGroom", "wiz_firstLookGroom");
  const brideOkayBefore = pick(answers, "brideOkayBefore", "wiz_brideOkayBefore") === true;
  const canMovePre = firstLookGroom || brideOkayBefore;

  const hasPartyInWindow = window.events.some((r) => r.event === WEDDING_PARTY_EVENT);
  const hasPortraitsInWindow = window.events.some((r) => r.event === BRIDE_GROOM_PORTRAITS_EVENT);
  const partyAlreadyPre = rows.some(
    (r) => r.event === WEDDING_PARTY_EVENT && r.time < ceremonyStart
  );

  if (canMovePre && hasPartyInWindow && !partyAlreadyPre) {
    const s = suggestionBase(window.id, idx++, {
      description: "Move Wedding Party Group Shots before the ceremony",
      minutesSaved: 15,
      type: "move_pre_ceremony",
      targetEvents: [WEDDING_PARTY_EVENT],
    });
    s.resolvesBottleneck = overflow <= 15;
    s.partialResolution = overflow > 15;
    suggestions.push(s);
  }

  if (canMovePre && hasPortraitsInWindow) {
    const saved = 20;
    const s = suggestionBase(window.id, idx++, {
      description: "Move Bride & Groom Portraits before the ceremony",
      minutesSaved: saved,
      type: "move_pre_ceremony",
      targetEvents: [BRIDE_GROOM_PORTRAITS_EVENT],
    });
    s.resolvesBottleneck = saved >= overflow;
    s.partialResolution = saved > 0 && saved < overflow;
    suggestions.push(s);
  }

  const dinnerFlex = pick(answers, "dinnerFlexibility", "wiz_dinnerFlexibility") || 0;
  if (dinnerFlex > 0) {
    const saved = Math.min(dinnerFlex, overflow);
    const dinnerHour = pick(answers, "dinnerStartHour", "wiz_dinnerStartHour");
    const currentDinner =
      dinnerHour != null
        ? parseTimeInput(
            dinnerHour,
            pick(answers, "dinnerStartMinute", "wiz_dinnerStartMinute") || "00",
            pick(answers, "dinnerStartPeriod", "wiz_dinnerStartPeriod") || "PM"
          )
        : null;
    const s = suggestionBase(window.id, idx++, {
      description: `Push dinner back by ${saved} minutes`,
      minutesSaved: saved,
      type: "flex_dinner",
      targetEvents: ["Reception: Dinner"],
      newTime: currentDinner != null ? currentDinner + saved : null,
    });
    s.resolvesBottleneck = saved >= overflow;
    s.partialResolution = saved > 0 && saved < overflow;
    suggestions.push(s);
  }

  const receptionFlex =
    pick(answers, "receptionStartFlexibility", "wiz_receptionStartFlexibility") || 0;
  if (receptionFlex > 0) {
    const saved = Math.min(receptionFlex, overflow);
    const receptionHour = pick(answers, "receptionHour", "wiz_receptionHour");
    const currentReception =
      receptionHour != null
        ? parseTimeInput(
            receptionHour,
            pick(answers, "receptionMinute", "wiz_receptionMinute") || "00",
            pick(answers, "receptionPeriod", "wiz_receptionPeriod") || "PM"
          )
        : null;
    const s = suggestionBase(window.id, idx++, {
      description: `Push reception start back by ${saved} minutes`,
      minutesSaved: saved,
      type: "flex_reception",
      targetEvents: ["Reception: Audio/Video Setup"],
      newTime: currentReception != null ? currentReception + saved : null,
    });
    s.resolvesBottleneck = saved >= overflow;
    s.partialResolution = saved > 0 && saved < overflow;
    suggestions.push(s);
  }

  const hasResolvable = suggestions.some((s) => s.resolvesBottleneck);
  if (!hasResolvable) {
    suggestions.push(
      suggestionBase(window.id, idx++, {
        description: "Consider reducing the number of family photo groupings",
        minutesSaved: 0,
        type: "reduce_groups",
        targetEvents: [
          "Group Photos: Family (5 Groups)",
          "Group Photos: Family (10 Groups)",
        ],
      })
    );
  }

  return suggestions;
}

// --- Suggestions for Window A (pre-ceremony crunch) ---
function suggestionsForWindowA(window, answers, overflow, coverageStart) {
  const suggestions = [];
  let idx = 0;

  if (coverageStart != null) {
    const s = suggestionBase(window.id, idx++, {
      description: `Start coverage ${overflow} minutes earlier`,
      minutesSaved: overflow,
      minutesNeeded: overflow,
      type: "earlier_start",
      targetEvents: [],
      newTime: coverageStart - overflow,
    });
    s.resolvesBottleneck = true;
    suggestions.push(s);
  }

  const drone = !!pick(answers, "drone", "wiz_drone");
  const hasDroneInWindow = window.events.some(
    (r) => r.event === "Details: Drone & Venue Shots"
  );
  if (drone && hasDroneInWindow) {
    const s = suggestionBase(window.id, idx++, {
      description: "Move drone shots to the reception venue instead",
      minutesSaved: 30,
      type: "move_drone",
      targetEvents: ["Details: Drone & Venue Shots"],
    });
    s.resolvesBottleneck = 30 >= overflow;
    s.partialResolution = 30 > 0 && 30 < overflow;
    suggestions.push(s);
  }

  const includeDetails = pick(answers, "preCeremonyDetails", "wiz_preCeremonyDetails") !== false;
  const detailRows = window.events.filter((r) => DETAIL_EVENTS.includes(r.event));
  if (includeDetails && detailRows.length > 0) {
    const saved = sumDurations(detailRows);
    const s = suggestionBase(window.id, idx++, {
      description: "Move detail shots to the reception",
      minutesSaved: saved,
      type: "move_details",
      targetEvents: detailRows.map((r) => r.event),
    });
    s.resolvesBottleneck = saved >= overflow;
    s.partialResolution = saved > 0 && saved < overflow;
    suggestions.push(s);
  }

  return suggestions;
}

/**
 * Analyze wedding-day time windows, bottlenecks, and resolution suggestions.
 * Pure function — does not modify rows or wizard state.
 *
 * @param {object} wizardAnswers
 * @param {object[]} generatedRows
 * @returns {object} LogisticsReport
 */
export function calculateLogistics(wizardAnswers, generatedRows) {
  const answers = wizardAnswers || {};
  const rows = Array.isArray(generatedRows) ? generatedRows : [];

  const ceremonyHour = pick(answers, "ceremonyHour", "wiz_ceremonyHour");
  const ceremonyStart = parseTimeInput(
    ceremonyHour || "12",
    pick(answers, "ceremonyMinute", "wiz_ceremonyMinute") || "00",
    pick(answers, "ceremonyPeriod", "wiz_ceremonyPeriod") || "PM"
  );
  const ceremonyDuration = pick(answers, "ceremonyDuration", "wiz_ceremonyDuration") || 30;
  const ceremonyEnd = ceremonyStart + ceremonyDuration;

  const receptionHour = pick(answers, "receptionHour", "wiz_receptionHour");
  const receptionStart = parseTimeInput(
    receptionHour || "6",
    pick(answers, "receptionMinute", "wiz_receptionMinute") || "00",
    pick(answers, "receptionPeriod", "wiz_receptionPeriod") || "PM"
  );

  const { coverageStart, coverageEnd } = resolveCoverageBounds(answers, rows);
  const goldenHourSelected = hasGoldenHourSelected(answers, rows);
  const ghSchedule = goldenHourSelected ? getGoldenHourSchedule(pick(answers, "date", "wiz_date")) : null;
  const goldenHourStart = ghSchedule?.start ?? null;
  const goldenHourEnd = goldenHourStart != null ? goldenHourStart + GOLDEN_HOUR_DURATION : null;
  const sunsetTime = goldenHourStart != null ? goldenHourStart + SUNSET_OFFSET_MINUTES : null;

  const sameVenue = !!pick(answers, "receptionSameAsCeremony", "wiz_receptionSameAsCeremony");
  const travelCeremonyToReception = sameVenue
    ? 0
    : parseTravelMin(
        pick(answers, "distanceReceptionToCeremony", "wiz_distanceReceptionToCeremony")
      );

  const windows = [];

  // Window A — Getting ready & pre-ceremony
  if (coverageStart != null) {
    const eventsA = rowsInRange(rows, coverageStart, ceremonyStart).filter(
      (r) => !isCeremonyEvent(r.event)
    );
    windows.push(
      buildWindowReport({
        id: "A",
        label: "Getting Ready & Pre-Ceremony",
        startTime: coverageStart,
        endTime: ceremonyStart,
        events: eventsA,
      })
    );
  }

  // Window B — Post-ceremony portraits (minus travel to reception)
  const eventsB = rowsInRange(rows, ceremonyEnd, receptionStart);
  windows.push(
    buildWindowReport({
      id: "B",
      label: "Post-Ceremony Portraits",
      startTime: ceremonyEnd,
      endTime: receptionStart,
      events: eventsB,
      travelSubtract: travelCeremonyToReception,
    })
  );

  // Windows C–E — only when golden hour is part of the plan
  if (goldenHourSelected && goldenHourStart != null && coverageEnd != null) {
    const eventsC = rows.filter(
      (r) =>
        isActiveRow(r) &&
        isReceptionPhaseRow(r, receptionStart) &&
        r.event !== GOLDEN_HOUR_EVENT &&
        r.time < goldenHourStart
    );

    windows.push(
      buildWindowReport({
        id: "C",
        label: "Reception",
        startTime: receptionStart,
        endTime: goldenHourStart,
        events: eventsC,
      })
    );

    const ghEvents = rows.filter(
      (r) => isActiveRow(r) && (r.event === GOLDEN_HOUR_EVENT || r.time === goldenHourStart)
    );
    windows.push(
      buildWindowReport({
        id: "D",
        label: "Golden Hour",
        startTime: goldenHourStart,
        endTime: sunsetTime ?? goldenHourEnd,
        events: ghEvents.length ? ghEvents : [{ event: GOLDEN_HOUR_EVENT, duration: GOLDEN_HOUR_DURATION, time: goldenHourStart }],
      })
    );

    const eventsE = rows.filter(
      (r) =>
        isActiveRow(r) &&
        isReceptionPhaseRow(r, receptionStart) &&
        r.event !== GOLDEN_HOUR_EVENT &&
        goldenHourEnd != null &&
        r.time >= goldenHourEnd
    );

    if (eventsE.length > 0) {
      windows.push(
        buildWindowReport({
          id: "E",
          label: "Late Reception",
          startTime: goldenHourEnd,
          endTime: coverageEnd,
          events: eventsE,
        })
      );
    }
  }

  const bottlenecks = windows
    .map((w) => analyzeBottleneck(w, windows, answers))
    .filter(Boolean);

  const suggestions = [];
  for (const bottleneck of bottlenecks) {
    const window = windows.find((w) => w.id === bottleneck.windowId);
    if (!window) continue;
    const overflow = window.overflowMinutes;
    if (window.id === "B") {
      suggestions.push(
        ...suggestionsForWindowB(window, answers, overflow, rows, ceremonyStart)
      );
    } else if (window.id === "A") {
      suggestions.push(
        ...suggestionsForWindowA(window, answers, overflow, coverageStart)
      );
    } else {
      const flexSuggestion = bottleneck.flexOptions[0];
      if (flexSuggestion) {
        suggestions.push(
          suggestionBase(window.id, 0, {
            description: `Flex ${flexSuggestion.event} by up to ${flexSuggestion.minutesResolvable} minutes`,
            minutesSaved: flexSuggestion.minutesResolvable,
            type: "flex_time",
            targetEvents: [flexSuggestion.event],
            resolvesBottleneck: flexSuggestion.minutesResolvable >= overflow,
            partialResolution:
              flexSuggestion.minutesResolvable > 0 &&
              flexSuggestion.minutesResolvable < overflow,
          })
        );
      }
    }
  }

  const totalDayMinutes =
    coverageStart != null && coverageEnd != null ? Math.max(0, coverageEnd - coverageStart) : 0;
  const usedMinutes = sumDurations(rows.filter(isActiveRow));

  const isValid =
    bottlenecks.length === 0 ||
    bottlenecks.every((b) => {
      const forWindow = suggestions.filter((s) => s.windowId === b.windowId);
      return (
        forWindow.some((s) => s.resolvesBottleneck) || b.canMoveToAdjacentWindow
      );
    });

  return {
    windows,
    bottlenecks,
    suggestions,
    isValid,
    totalDayMinutes,
    usedMinutes,
  };
}
