import { parseTimeInput, formatClockLabel } from "./time";
import { TIER } from "../constants/tiers";
import {
  GOLDEN_HOUR_PORTRAIT_DURATION,
  resolveGoldenHourForAnswers,
} from "./goldenHour";
import {
  rowDuration,
  isActiveRow,
  isSchedulableEvent,
  isCeremonyEvent,
  findFirstLookWithGroom,
  hasFirstLookScheduled,
  eventScheduledBefore,
} from "./logisticsRowUtils";

const GOLDEN_HOUR_EVENT = "Bride & Groom: Golden Hour Portraits";
const DETAIL_EVENTS = [
  "Details: Drone & Venue Shots",
  "Details: Rings, Invitations, & Accessories",
  "Details: Dress Shots",
];
const WEDDING_PARTY_EVENT = "Wedding Party: Group Shots";
const BRIDE_GROOM_PORTRAITS_EVENT = "Bride & Groom: Portraits";
const RECEPTION_AV_SETUP = "Reception: Audio/Video Setup";

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

function sumSchedulableDurations(rows) {
  return rows.reduce((sum, row) => sum + rowDuration(row), 0);
}

/** Travel time from location blocks between start and end (inclusive of blocks in range). */
function travelMinutesFromLocationBlocks(rows, rangeStart, rangeEnd) {
  return rows
    .filter((r) => r.type === "location" && rowDuration(r) > 0)
    .filter((r) => {
      const rowEnd = r.time + rowDuration(r);
      return r.time < rangeEnd && rowEnd > rangeStart;
    })
    .reduce((sum, r) => sum + rowDuration(r), 0);
}

function resolveCeremonyBounds(rows, answers) {
  const ceremonyRows = rows.filter((r) => isCeremonyEvent(r.event));
  if (ceremonyRows.length > 0) {
    const ceremonyStart = Math.min(...ceremonyRows.map((r) => r.time));
    const ceremonyEnd = Math.max(
      ...ceremonyRows.map((r) => r.time + rowDuration(r))
    );
    return { ceremonyStart, ceremonyEnd, ceremonyDuration: ceremonyEnd - ceremonyStart };
  }

  const ceremonyHour = pick(answers, "ceremonyHour", "wiz_ceremonyHour");
  const ceremonyStart = parseTimeInput(
    ceremonyHour || "12",
    pick(answers, "ceremonyMinute", "wiz_ceremonyMinute") || "00",
    pick(answers, "ceremonyPeriod", "wiz_ceremonyPeriod") || "PM"
  );
  const ceremonyDuration =
    pick(answers, "ceremonyDuration", "wiz_ceremonyDuration") || 30;
  return {
    ceremonyStart,
    ceremonyEnd: ceremonyStart + ceremonyDuration,
    ceremonyDuration,
  };
}

function resolveReceptionStart(rows, answers) {
  const avRow = rows.find((r) => r.event === RECEPTION_AV_SETUP);
  if (avRow) return avRow.time;

  const receptionHour = pick(answers, "receptionHour", "wiz_receptionHour");
  return parseTimeInput(
    receptionHour || "6",
    pick(answers, "receptionMinute", "wiz_receptionMinute") || "00",
    pick(answers, "receptionPeriod", "wiz_receptionPeriod") || "PM"
  );
}

function resolveCoverageBounds(answers, rows) {
  const schedulable = rows.filter(isSchedulableEvent);
  const dayStartFromRows = schedulable.length
    ? Math.min(...schedulable.map((r) => r.time))
    : null;
  const dayEndFromRows = schedulable.length
    ? Math.max(...schedulable.map((r) => r.time + rowDuration(r)))
    : null;

  let coverageStart = null;
  const photoStartHour = pick(answers, "photoStartHour", "wiz_photoStartHour");
  if (photoStartHour != null) {
    coverageStart = parseTimeInput(
      photoStartHour,
      pick(answers, "photoStartMinute", "wiz_photoStartMinute") || "00",
      pick(answers, "photoStartPeriod", "wiz_photoStartPeriod") || "PM"
    );
  } else if (dayStartFromRows != null) {
    coverageStart = dayStartFromRows;
  }

  let coverageEnd = dayEndFromRows;
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
      coverageEnd = Math.max(...ends, dayEndFromRows ?? 0);
    }
  }

  return {
    coverageStart,
    coverageEnd,
    dayStart: dayStartFromRows ?? coverageStart,
    dayEnd: dayEndFromRows ?? coverageEnd,
  };
}

function schedulableEventsInRange(rows, start, end, options = {}) {
  const { minTime = null, excludeCeremony = false } = options;
  return rows.filter((row) => {
    if (!isSchedulableEvent(row)) return false;
    if (excludeCeremony && isCeremonyEvent(row.event)) return false;
    if (minTime != null && row.time < minTime) return false;
    const rowEnd = row.time + rowDuration(row);
    return row.time < end && rowEnd > start;
  });
}

function windowStatus(remainingMinutes) {
  if (remainingMinutes < 0) return "overflow";
  if (remainingMinutes <= 15) return "tight";
  return "ok";
}

function hasGoldenHourScheduled(rows) {
  return rows.some((r) => isSchedulableEvent(r) && r.event === GOLDEN_HOUR_EVENT);
}

/**
 * Assign each reception-phase schedulable row to exactly one logistics window (C, D, or E).
 */
function partitionReceptionEvents(rows, receptionStart, goldenHourStart, goldenHourEnd) {
  const reception = { C: [], D: [], E: [] };
  for (const row of rows) {
    if (!isSchedulableEvent(row) || !isReceptionPhaseRow(row, receptionStart)) continue;
    if (row.event === GOLDEN_HOUR_EVENT) {
      reception.D.push(row);
      continue;
    }
    const t = row.time;
    if (t < goldenHourStart) {
      reception.C.push(row);
    } else {
      reception.E.push(row);
    }
  }
  return reception;
}

function buildWindowReport({ id, label, startTime, endTime, events, travelSubtract = 0 }) {
  const availableMinutes = Math.max(0, endTime - startTime - travelSubtract);
  const usedMinutes = sumSchedulableDurations(events);
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
    travelSubtract,
    overflowMinutes: status === "overflow" ? Math.abs(remainingMinutes) : 0,
  };
}

function isReceptionPhaseRow(row, receptionStart) {
  if (row.time < receptionStart) return false;
  const ev = row.event || "";
  if (ev.startsWith("Reception:")) return true;
  if (row.type === "location" && row.time >= receptionStart) return true;
  return false;
}

function analyzeBottleneck(window) {
  if (window.status !== "overflow") return null;

  const causingEvents = [...window.events]
    .filter(isSchedulableEvent)
    .sort((a, b) => rowDuration(b) - rowDuration(a))
    .map((row) => ({
      event: row.event,
      duration: rowDuration(row),
      time: row.time,
      location: row.location || "",
      tier: row.tier,
      flexibilityMinutes: row.flexibilityMinutes ?? 0,
    }));

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

function formatRowAtTime(row) {
  if (!row) return "";
  const loc = row.location ? ` at ${row.location}` : "";
  return `${row.event} at ${formatClockLabel(row.time)}${loc}`;
}

function suggestionsForWindowB(window, answers, overflow, rows, ceremonyStart, scheduleCtx) {
  const suggestions = [];
  let idx = 0;
  const { firstLookWithGroom, groomLabel } = scheduleCtx;

  const hasPartyInWindow = window.events.some((r) => r.event === WEDDING_PARTY_EVENT);
  const hasPortraitsInWindow = window.events.some(
    (r) => r.event === BRIDE_GROOM_PORTRAITS_EVENT
  );
  const partyAlreadyPre = eventScheduledBefore(rows, WEDDING_PARTY_EVENT, ceremonyStart);
  const portraitsAlreadyPre = eventScheduledBefore(
    rows,
    BRIDE_GROOM_PORTRAITS_EVENT,
    ceremonyStart
  );

  const brideOkayBefore =
    pick(answers, "brideOkayBefore", "wiz_brideOkayBefore") === true;
  const allowsPreCeremonyMoves =
    hasFirstLookScheduled(rows) || brideOkayBefore || !!firstLookWithGroom;

  if (allowsPreCeremonyMoves && hasPartyInWindow && !partyAlreadyPre) {
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

  if (allowsPreCeremonyMoves && hasPortraitsInWindow && !portraitsAlreadyPre) {
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

  const dinnerFlex = parseInt(pick(answers, "dinnerFlexibility", "wiz_dinnerFlexibility"), 10) || 0;
  const dinnerRow = rows.find((r) => r.event === "Reception: Dinner");
  if (overflow > 0 && dinnerFlex > 0 && dinnerRow) {
    const saved = Math.min(dinnerFlex, overflow);
    const s = suggestionBase(window.id, idx++, {
      description: `Push dinner (${formatClockLabel(dinnerRow.time)}, ${rowDuration(
        dinnerRow
      )} min) later by up to ${saved} minutes`,
      minutesSaved: saved,
      type: "flex_dinner",
      targetEvents: ["Reception: Dinner"],
      newTime: dinnerRow.time + saved,
    });
    s.resolvesBottleneck = saved >= overflow;
    s.partialResolution = saved > 0 && saved < overflow;
    suggestions.push(s);
  }

  const receptionFlex =
    parseInt(pick(answers, "receptionStartFlexibility", "wiz_receptionStartFlexibility"), 10) ||
    0;
  const avRow = rows.find((r) => r.event === RECEPTION_AV_SETUP);
  if (overflow > 0 && receptionFlex > 0 && avRow) {
    const saved = Math.min(receptionFlex, overflow);
    const s = suggestionBase(window.id, idx++, {
      description: `Push reception start (${formatClockLabel(
        avRow.time
      )}) back by up to ${saved} minutes`,
      minutesSaved: saved,
      type: "flex_reception",
      targetEvents: [RECEPTION_AV_SETUP],
      newTime: avRow.time + saved,
    });
    s.resolvesBottleneck = saved >= overflow;
    s.partialResolution = saved > 0 && saved < overflow;
    suggestions.push(s);
  }

  const hasResolvable = suggestions.some((s) => s.resolvesBottleneck);
  if (!hasResolvable && overflow > 0) {
    const familyRow = window.events.find((r) =>
      String(r.event || "").startsWith("Group Photos: Family")
    );
    if (familyRow) {
      suggestions.push(
        suggestionBase(window.id, idx++, {
          description: `Reduce or reschedule ${familyRow.event} (${rowDuration(
            familyRow
          )} min at ${formatClockLabel(familyRow.time)})`,
          minutesSaved: 0,
          type: "reduce_groups",
          targetEvents: [familyRow.event],
        })
      );
    }
  }

  return suggestions;
}

function suggestionsForWindowA(window, answers, overflow, rows, coverageStart, scheduleCtx) {
  const suggestions = [];
  let idx = 0;

  const earliestPre = window.events.length
    ? Math.min(...window.events.map((r) => r.time))
    : null;

  if (coverageStart != null && earliestPre != null && earliestPre < coverageStart) {
    const gap = coverageStart - earliestPre;
    suggestions.push(
      suggestionBase(window.id, idx++, {
        description: `Coverage is set to start at ${formatClockLabel(
          coverageStart
        )}, but ${window.events[0]?.event || "events"} begin at ${formatClockLabel(
          earliestPre
        )} (${gap} minutes earlier). Start coverage earlier or remove early blocks.`,
        minutesSaved: gap,
        type: "coverage_mismatch",
        targetEvents: [],
      })
    );
  }

  if (coverageStart != null && overflow > 0) {
    const s = suggestionBase(window.id, idx++, {
      description: `Start coverage ${overflow} minutes earlier (before ${formatClockLabel(
        coverageStart
      )})`,
      minutesSaved: overflow,
      minutesNeeded: overflow,
      type: "earlier_start",
      targetEvents: [],
      newTime: coverageStart - overflow,
    });
    s.resolvesBottleneck = true;
    suggestions.push(s);
  }

  const droneRow = window.events.find((r) => r.event === "Details: Drone & Venue Shots");
  if (droneRow) {
    const s = suggestionBase(window.id, idx++, {
      description: `Move ${droneRow.event} (${rowDuration(droneRow)} min at ${formatClockLabel(
        droneRow.time
      )}) to the reception venue`,
      minutesSaved: rowDuration(droneRow),
      type: "move_drone",
      targetEvents: ["Details: Drone & Venue Shots"],
    });
    s.resolvesBottleneck = rowDuration(droneRow) >= overflow;
    s.partialResolution = rowDuration(droneRow) > 0 && rowDuration(droneRow) < overflow;
    suggestions.push(s);
  }

  const detailRows = window.events.filter((r) => DETAIL_EVENTS.includes(r.event));
  if (detailRows.length > 0) {
    const saved = sumSchedulableDurations(detailRows);
    const names = detailRows
      .map((r) => `${r.event} (${formatClockLabel(r.time)})`)
      .join(", ");
    const s = suggestionBase(window.id, idx++, {
      description: `Move detail shots to the reception: ${names}`,
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
 * Uses generatedRows as source of truth for scheduled events and travel.
 */
export function calculateLogistics(wizardAnswers, generatedRows) {
  const answers = wizardAnswers || {};
  const rows = Array.isArray(generatedRows) ? generatedRows : [];

  const { ceremonyStart, ceremonyEnd } = resolveCeremonyBounds(rows, answers);
  const receptionStart = resolveReceptionStart(rows, answers);
  const { coverageStart, coverageEnd, dayStart, dayEnd } = resolveCoverageBounds(
    answers,
    rows
  );

  const groomLabel = pick(answers, "groomLabel", "wiz_groomLabel") || "Groom";
  const scheduleCtx = {
    groomLabel,
    firstLookWithGroom: findFirstLookWithGroom(rows, groomLabel),
    ceremonyStart,
    ceremonyEnd,
    receptionStart,
    coverageStart,
  };

  const goldenHourSelected =
    hasGoldenHourScheduled(rows) ||
    !!pick(answers, "goldenHour", "wiz_goldenHour", "includeGoldenHour");
  const ghSchedule = goldenHourSelected ? resolveGoldenHourForAnswers(answers) : null;
  const ghRowScheduled = rows.find(
    (r) => isSchedulableEvent(r) && r.event === GOLDEN_HOUR_EVENT
  );
  const goldenHourStart = ghRowScheduled?.time ?? ghSchedule?.start ?? null;
  const goldenHourEnd =
    goldenHourStart != null ? goldenHourStart + GOLDEN_HOUR_PORTRAIT_DURATION : null;

  const windows = [];

  if (coverageStart != null) {
    const eventsA = schedulableEventsInRange(rows, coverageStart, ceremonyStart, {
      minTime: coverageStart,
      excludeCeremony: true,
    });
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

  const travelPostCeremony = travelMinutesFromLocationBlocks(
    rows,
    ceremonyEnd,
    receptionStart
  );
  const eventsB = schedulableEventsInRange(rows, ceremonyEnd, receptionStart, {
    excludeCeremony: true,
  });
  windows.push(
    buildWindowReport({
      id: "B",
      label: "Post-Ceremony Portraits",
      startTime: ceremonyEnd,
      endTime: receptionStart,
      events: eventsB,
      travelSubtract: travelPostCeremony,
    })
  );

  if (goldenHourSelected && goldenHourStart != null && goldenHourEnd != null && coverageEnd != null) {
    const { C: eventsC, D: ghEvents, E: eventsE } = partitionReceptionEvents(
      rows,
      receptionStart,
      goldenHourStart,
      goldenHourEnd
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

    windows.push(
      buildWindowReport({
        id: "D",
        label: "Golden Hour",
        startTime: goldenHourStart,
        endTime: goldenHourEnd,
        events: ghEvents.length
          ? ghEvents
          : [
              {
                event: GOLDEN_HOUR_EVENT,
                duration: GOLDEN_HOUR_PORTRAIT_DURATION,
                time: goldenHourStart,
              },
            ],
      })
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

  const bottlenecks = windows.map((w) => analyzeBottleneck(w)).filter(Boolean);

  const suggestions = [];
  for (const bottleneck of bottlenecks) {
    const window = windows.find((w) => w.id === bottleneck.windowId);
    if (!window) continue;
    const overflow = window.overflowMinutes;
    if (window.id === "B") {
      suggestions.push(
        ...suggestionsForWindowB(
          window,
          answers,
          overflow,
          rows,
          ceremonyStart,
          scheduleCtx
        )
      );
    } else if (window.id === "A") {
      suggestions.push(
        ...suggestionsForWindowA(
          window,
          answers,
          overflow,
          rows,
          coverageStart,
          scheduleCtx
        )
      );
    } else {
      const flexSuggestion = bottleneck.flexOptions[0];
      const flexRow = flexSuggestion
        ? rows.find((r) => r.event === flexSuggestion.event)
        : null;
      if (flexSuggestion) {
        suggestions.push(
          suggestionBase(window.id, 0, {
            description: flexRow
              ? `Flex ${flexSuggestion.event} (${formatClockLabel(
                  flexRow.time
                )}, up to ${flexSuggestion.minutesResolvable} min)`
              : `Flex ${flexSuggestion.event} by up to ${flexSuggestion.minutesResolvable} minutes`,
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
    dayStart != null && dayEnd != null ? Math.max(0, dayEnd - dayStart) : 0;
  const usedMinutes = sumSchedulableDurations(rows.filter(isSchedulableEvent));

  const isValid =
    bottlenecks.length === 0 ||
    bottlenecks.every((b) => {
      const forWindow = suggestions.filter((s) => s.windowId === b.windowId);
      return forWindow.some((s) => s.resolvesBottleneck);
    });

  return {
    windows,
    bottlenecks,
    suggestions,
    isValid,
    totalDayMinutes,
    usedMinutes,
    scheduleCtx,
    dayStart,
    dayEnd,
  };
}

export { findFirstLookWithGroom, hasFirstLookScheduled, isSchedulableEvent };
export { resolveCoverageBounds };
