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

function TimelineCoverageCounter({ coverage }) {
  if (!coverage) return null;
  return (
    <div
      style={{
        fontSize: 13,
        color: "var(--wtb-accent)",
        marginTop: 6,
        fontFamily: "'Jost', sans-serif",
        fontWeight: 300,
        letterSpacing: "0.04em",
      }}
    >
      Coverage Time: {formatDurationSpan(coverage.totalMinutes)}
      <span style={{ color: "var(--wtb-text-muted)", fontWeight: 200 }}>
        {" "}
        ({formatClockLabel(coverage.startMin)} – {formatClockLabel(coverage.endMin)})
      </span>
    </div>
  );
}

export {
  formatTime,
  parseTimeInput,
  formatClockLabel,
  formatDurationSpan,
  computeTimelineCoverage,
  TimelineCoverageCounter,
  MINUTE_OPTIONS_5,
  snapMinuteToFive,
  useMediaQuery,
};
