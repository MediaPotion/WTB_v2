import { parseTimeInput, formatClockLabel } from "./time";
import { resolveCeremonyDuration } from "./buildWizardAnswers";
import { findFirstLookWithGroom, isSchedulableEvent } from "./logisticsRowUtils";

const WEDDING_PARTY_EVENT = "Wedding Party: Group Shots";
const BRIDE_GROOM_PORTRAITS_EVENT = "Bride & Groom: Portraits";

/** Build schedule context for plain-English conflict copy. */
export function buildLogisticsContext(state, rows = []) {
  const ceremonyRows = rows.filter(
    (r) => r.event === "Ceremony" || (r.event && r.event.startsWith("Ceremony:"))
  );
  let ceremonyStart;
  let ceremonyEnd;
  if (ceremonyRows.length > 0) {
    ceremonyStart = Math.min(...ceremonyRows.map((r) => r.time));
    ceremonyEnd = Math.max(...ceremonyRows.map((r) => r.time + (parseInt(r.duration, 10) || 0)));
  } else {
    ceremonyStart = parseTimeInput(
      state.wiz_ceremonyHour || "12",
      state.wiz_ceremonyMinute || "00",
      state.wiz_ceremonyPeriod || "PM"
    );
    const ceremonyDuration = resolveCeremonyDuration(state);
    ceremonyEnd = ceremonyStart + ceremonyDuration;
  }

  const avRow = rows.find((r) => r.event === "Reception: Audio/Video Setup");
  const receptionStart = avRow
    ? avRow.time
    : parseTimeInput(
        state.wiz_receptionHour || "6",
        state.wiz_receptionMinute || "00",
        state.wiz_receptionPeriod || "PM"
      );

  const dinnerRow = rows.find((r) => r.event === "Reception: Dinner");
  const dinnerStart =
    dinnerRow != null
      ? dinnerRow.time
      : state.wiz_dinner && state.wiz_dinnerStartHour != null
        ? parseTimeInput(
            state.wiz_dinnerStartHour,
            state.wiz_dinnerStartMinute || "00",
            state.wiz_dinnerStartPeriod || "PM"
          )
        : null;

  const coverageStart =
    state.photoStartHour != null
      ? parseTimeInput(
          state.photoStartHour,
          state.photoStartMinute || "00",
          state.photoStartPeriod || "PM"
        )
      : rows.filter(isSchedulableEvent).length
        ? Math.min(...rows.filter(isSchedulableEvent).map((r) => r.time))
        : null;

  const groomLabel = state.groomLabel || "Groom";
  const brideLabel = state.brideLabel || "Bride";

  return {
    ceremonyStart,
    ceremonyEnd,
    ceremonyDuration: ceremonyEnd - ceremonyStart,
    receptionStart,
    dinnerStart,
    coverageStart,
    groomLabel,
    brideLabel,
    firstLookWithGroom: findFirstLookWithGroom(rows, groomLabel),
    rows,
  };
}

function formatEventList(events, max = 3) {
  const list = events.slice(0, max).map((e) => {
    const loc = e.location ? ` at ${e.location}` : "";
    return `${e.event} (${formatClockLabel(e.time)}, ${e.duration} min)${loc}`;
  });
  if (events.length > max) list.push(`and ${events.length - max} more`);
  return list.join("; ");
}

/** Plain-English bottleneck text using actual scheduled rows. */
export function describeBottleneckDetailed(window, ctx) {
  const available = window.availableMinutes;
  const used = window.usedMinutes;
  const over = window.overflowMinutes;
  const ceremonyEndLabel = formatClockLabel(ctx.ceremonyEnd);
  const receptionStartLabel = formatClockLabel(ctx.receptionStart);
  const causing = (window.events || []).filter(isSchedulableEvent).sort(
    (a, b) => (parseInt(b.duration, 10) || 0) - (parseInt(a.duration, 10) || 0)
  );

  if (window.id === "B") {
    const eventSummary =
      causing.length > 0
        ? ` Scheduled in this window: ${formatEventList(
            causing.map((r) => ({
              event: r.event,
              time: r.time,
              duration: parseInt(r.duration, 10) || 0,
              location: r.location,
            }))
          )}.`
        : "";
    const firstLookNote = ctx.firstLookWithGroom
      ? ` A first look with ${ctx.groomLabel} is already on the timeline at ${formatClockLabel(
          ctx.firstLookWithGroom.time
        )}${ctx.firstLookWithGroom.location ? ` (${ctx.firstLookWithGroom.location})` : ""}.`
      : "";
    const partyPre = (ctx.rows || []).some(
      (r) => r.event === WEDDING_PARTY_EVENT && r.time < ctx.ceremonyStart
    );
    const portraitsPre = (ctx.rows || []).some(
      (r) => r.event === BRIDE_GROOM_PORTRAITS_EVENT && r.time < ctx.ceremonyStart
    );
    const alreadyNote = [
      partyPre ? "Wedding Party Group Shots are already before the ceremony." : "",
      portraitsPre ? "Bride & Groom Portraits are already before the ceremony." : "",
    ]
      .filter(Boolean)
      .join(" ");

    if (window.status === "overflow") {
      return `Not enough time after the ceremony — you need ${used} minutes but only have ${available} between ${ceremonyEndLabel} and ${receptionStartLabel} (${over} minutes short).${eventSummary}${firstLookNote}${
        alreadyNote ? ` ${alreadyNote}` : ""
      } Consider pushing the reception later or reducing family groupings.`;
    }
    return `Post-ceremony window is tight: ${available} minutes available with ${used} minutes scheduled between ${ceremonyEndLabel} and ${receptionStartLabel}.${eventSummary}${firstLookNote}`;
  }

  if (window.id === "A") {
    const coverageLabel =
      ctx.coverageStart != null ? formatClockLabel(ctx.coverageStart) : "your coverage start";
    const neededStart =
      ctx.coverageStart != null ? formatClockLabel(ctx.coverageStart - over) : "earlier";
    const eventSummary =
      causing.length > 0 ? ` Events in this window include ${formatEventList(
        causing.map((r) => ({
          event: r.event,
          time: r.time,
          duration: parseInt(r.duration, 10) || 0,
          location: r.location,
        }))
      )}.` : "";
    return `Your pre-ceremony window needs ${used} minutes but only has ${available} before the ceremony (${over} minutes over). Coverage starts at ${coverageLabel}; starting at ${neededStart} would fit the current schedule.${eventSummary}`;
  }

  return `Not enough time in ${window.label} (${formatClockLabel(
    window.startTime
  )} – ${formatClockLabel(window.endTime)}): ${used} minutes scheduled, ${available} minutes available (${over} minutes short).${
    causing.length ? ` Includes ${causing.map((r) => r.event).join(", ")}.` : ""
  }`;
}

/** Map suggestion → control keys and inline helper copy. */
export function buildInlineHints(suggestions, ctx) {
  const hints = {};
  const add = (key, text) => {
    if (!text) return;
    hints[key] = hints[key] ? `${hints[key]} ${text}` : text;
  };

  const firstLookScheduled = !!ctx.firstLookWithGroom;

  for (const s of suggestions) {
    if (s.skipControl) continue;
    switch (s.type) {
      case "move_pre_ceremony":
        if (s.targetEvents?.includes(WEDDING_PARTY_EVENT)) {
          add(
            "portrait_weddingParty",
            `Moving Wedding Party Group Shots before the ceremony would free about ${s.minutesSaved} minutes after the ceremony.`
          );
          if (!firstLookScheduled) {
            add(
              "firstLookGroom",
              `A first look with ${ctx.groomLabel} can unlock moving portraits before the ceremony.`
            );
          }
        }
        if (s.targetEvents?.includes(BRIDE_GROOM_PORTRAITS_EVENT)) {
          add(
            "portrait_couple",
            `Scheduling couple portraits before the ceremony could free about ${s.minutesSaved} minutes after the ceremony.`
          );
          if (!firstLookScheduled) {
            add(
              "firstLookGroom",
              `A first look with ${ctx.groomLabel} can unlock moving portraits before the ceremony.`
            );
          }
        }
        break;
      case "flex_dinner":
        add("dinnerStart", s.description || `Pushing dinner later would add portrait time.`);
        add("dinnerFlex", "Mark dinner as flexible so the schedule can shift if needed.");
        break;
      case "flex_reception":
        add("receptionStart", s.description || `A later reception start would widen the post-ceremony window.`);
        add("receptionFlex", "Mark the reception start as flexible so the schedule can shift if needed.");
        break;
      case "earlier_start":
        add("photoStart", s.description || `Starting coverage earlier would add pre-ceremony time.`);
        break;
      case "move_details":
        add("preCeremonyDetails", s.description || "Moving detail shots to the reception frees pre-ceremony time.");
        break;
      case "move_drone":
        add("preCeremonyDetails", s.description || "Moving drone shots to the reception frees pre-ceremony time.");
        break;
      case "reduce_groups":
        add("familyGroups", s.description || "Fewer family groupings reduce time after the ceremony.");
        break;
      default:
        break;
    }
  }

  if (firstLookScheduled) {
    add(
      "firstLookGroom",
      `First look with ${ctx.groomLabel} is already scheduled at ${formatClockLabel(
        ctx.firstLookWithGroom.time
      )}.`
    );
  }

  return hints;
}

export function countOverflowConflicts(windows) {
  return windows.filter((w) => w.status === "overflow").length;
}
