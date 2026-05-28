import React, { useState, useEffect } from "react";

const MINUTE_OPTIONS_5 = Array.from({ length: 12 }, (_, i) =>
  String(i * 5).padStart(2, "0")
);

function snapMinuteToFive(minuteStr) {
  const rawMin = parseInt(minuteStr, 10) || 0;
  return String(Math.round(rawMin / 5) * 5 % 60).padStart(2, "0");
}

const DESKTOP_MIN_WIDTH = "(min-width: 901px)";

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return false;
    }
    return window.matchMedia(query).matches;
  });
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return undefined;
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

function formatTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours < 12 ? "AM" : "PM";
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return {
    hour: displayHour.toString(),
    minute: minutes.toString().padStart(2, "0"),
    period,
  };
}
function parseTimeInput(hourStr, minuteStr, period) {
  const hours = parseInt(hourStr, 10) % 12;
  const minutes = parseInt(minuteStr, 10);
  let total = hours * 60 + minutes;
  if (period === "PM") total += 720;
  return total;
}

function formatClockLabel(totalMinutes) {
  const t = formatTime(totalMinutes);
  return `${t.hour}:${t.minute} ${t.period}`;
}

function formatDurationSpan(totalMinutes) {
  if (!totalMinutes || totalMinutes <= 0) return "0 min";
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return h === 1 ? "1 hr" : `${h} hrs`;
  return `${h} ${h === 1 ? "hr" : "hrs"} ${m} min`;
}

function computeTimelineCoverage(rows) {
  const active = rows.filter(
    (r) => r.type !== "constraint" && String(r.event || "").trim()
  );
  if (active.length === 0) return null;
  const startMin = Math.min(...active.map((r) => r.time));
  const endMin = Math.max(
    ...active.map((r) => r.time + (parseInt(r.duration, 10) || 0))
  );
  return {
    startMin,
    endMin,
    totalMinutes: Math.max(0, endMin - startMin),
  };
}

/** Coverage window from project settings start/end times. */
function computeMediaCoverageWindow(
  enabled,
  startHour,
  startMinute,
  startPeriod,
  endHour,
  endMinute,
  endPeriod
) {
  if (!enabled) return null;
  const startMin = parseTimeInput(startHour, startMinute, startPeriod);
  const endMin = parseTimeInput(endHour, endMinute, endPeriod);
  if (endMin <= startMin) return null;
  return {
    startMin,
    endMin,
    totalMinutes: endMin - startMin,
  };
}

function isWizardCoverageHoursSpecified(hoursValue) {
  const trimmed = String(hoursValue ?? "").trim();
  if (!trimmed) return false;
  const n = parseFloat(trimmed);
  return !Number.isNaN(n) && n > 0;
}

/**
 * Photography / videography coverage for display, based on project settings
 * and (when applicable) wizard hour entries. Omits types not configured.
 */
function computeProjectMediaCoverage({
  photoEnabled,
  videoEnabled,
  photoStartHour,
  photoStartMinute,
  photoStartPeriod,
  photoEndHour,
  photoEndMinute,
  photoEndPeriod,
  videoStartHour,
  videoStartMinute,
  videoStartPeriod,
  videoEndHour,
  videoEndMinute,
  videoEndPeriod,
  enteredViaWizard = false,
  wiz_photoCoverageHours = "",
  wiz_videoCoverageHours = "",
}) {
  const photoSpecified =
    photoEnabled &&
    (!enteredViaWizard || isWizardCoverageHoursSpecified(wiz_photoCoverageHours));
  const videoSpecified =
    videoEnabled &&
    (!enteredViaWizard || isWizardCoverageHoursSpecified(wiz_videoCoverageHours));

  return {
    photo: photoSpecified
      ? computeMediaCoverageWindow(
          true,
          photoStartHour,
          photoStartMinute,
          photoStartPeriod,
          photoEndHour,
          photoEndMinute,
          photoEndPeriod
        )
      : null,
    video: videoSpecified
      ? computeMediaCoverageWindow(
          true,
          videoStartHour,
          videoStartMinute,
          videoStartPeriod,
          videoEndHour,
          videoEndMinute,
          videoEndPeriod
        )
      : null,
  };
}

const coverageLineStyle = {
  fontSize: 13,
  color: "var(--wtb-accent)",
  fontFamily: "'Jost', sans-serif",
  fontWeight: 300,
  letterSpacing: "0.04em",
};

function CoverageTimeLine({ label, coverage }) {
  if (!coverage) return null;
  const prefix = label ? `${label} ` : "";
  return (
    <div style={coverageLineStyle}>
      {prefix}Coverage Time: {formatDurationSpan(coverage.totalMinutes)}
      <span style={{ color: "var(--wtb-text-muted)", fontWeight: 200 }}>
        {" "}
        ({formatClockLabel(coverage.startMin)} – {formatClockLabel(coverage.endMin)})
      </span>
    </div>
  );
}

function TimelineCoverageCounter({ photoCoverage, videoCoverage, coverage, style }) {
  if (coverage) {
    return (
      <div style={{ marginTop: 6, ...style }}>
        <CoverageTimeLine label="" coverage={coverage} />
      </div>
    );
  }

  const lines = [];
  if (photoCoverage) lines.push({ label: "Photography", coverage: photoCoverage });
  if (videoCoverage) lines.push({ label: "Videography", coverage: videoCoverage });
  if (lines.length === 0) return null;

  return (
    <div
      style={{
        marginTop: 6,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        alignItems: "center",
        ...style,
      }}
    >
      {lines.map(({ label, coverage: cov }) => (
        <CoverageTimeLine key={label} label={label} coverage={cov} />
      ))}
    </div>
  );
}

export {
  formatTime,
  parseTimeInput,
  formatClockLabel,
  formatDurationSpan,
  computeTimelineCoverage,
  computeMediaCoverageWindow,
  computeProjectMediaCoverage,
  TimelineCoverageCounter,
  MINUTE_OPTIONS_5,
  snapMinuteToFive,
  useMediaQuery,
};
