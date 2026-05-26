import { calculateLogistics } from "./calculateLogistics";

export const LOGISTICS_STATUS_UI = {
  overflow: {
    icon: "✕",
    color: "#8b4545",
    border: "rgba(139, 69, 69, 0.45)",
    label: "Scheduling conflicts",
  },
  tight: {
    icon: "!",
    color: "var(--wtb-accent)",
    border: "rgba(184, 144, 106, 0.5)",
    label: "Schedule is tight",
  },
  ok: {
    icon: "✓",
    color: "#6b8f71",
    border: "rgba(107, 143, 113, 0.45)",
    label: "Schedule looks good",
  },
};

function hasTimeConstraintRows(rows) {
  return rows.some(
    (r) =>
      r?.type === "constraint" ||
      String(r?.event || "").toUpperCase().includes("TIME CONSTRAINT")
  );
}

/**
 * @returns {"overflow"|"tight"|"ok"}
 */
export function getLogisticsStatus(wizardAnswers, timelineRows) {
  const rows = Array.isArray(timelineRows) ? timelineRows : [];
  const report = calculateLogistics(wizardAnswers || {}, rows);

  if (hasTimeConstraintRows(rows) || report.windows.some((w) => w.status === "overflow")) {
    return "overflow";
  }
  if (report.windows.some((w) => w.status === "tight")) {
    return "tight";
  }
  return "ok";
}
