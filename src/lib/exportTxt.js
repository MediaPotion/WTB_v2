import { formatTime } from "./time";
import { prepareTimelineExportRows } from "./exportPdf";

export function buildTimelineText(params) {
  const {
    userRows,
    bride,
    groom,
    date,
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
  } = params;
  const sortedRows = prepareTimelineExportRows(userRows);
  const lines = [];
  lines.push(`Wedding Timeline for ${bride} & ${groom}`);
  lines.push(`Date: ${date}`, "");
  lines.push(
    `Photo Coverage: ${photoStartHour}:${photoStartMinute} ${photoStartPeriod} - ${photoEndHour}:${photoEndMinute} ${photoEndPeriod}`
  );
  lines.push(
    `Video Coverage: ${videoStartHour}:${videoStartMinute} ${videoStartPeriod} - ${videoEndHour}:${videoEndMinute} ${videoEndPeriod}`,
    "",
    "TIMELINE:",
    ""
  );

  sortedRows.forEach((row) => {
    const time = formatTime(row.time);
    if (row.type === "constraint") {
      lines.push(`Time: ${time.hour}:${time.minute} ${time.period}`);
      lines.push(`⚠️ TIME CONSTRAINT`);
      if (row.notes && row.notes.trim()) lines.push(`Note: ${row.notes}`);
      lines.push("");
      return;
    }
    if (row.type === "location") {
      const parts = [`📍 ${row.event || "(no name)"}`];
      if (row.address && row.address.trim()) parts.push(row.address.trim());
      parts.push(`Travel time: ${row.duration} min`);
      lines.push(`Time: ${time.hour}:${time.minute} ${time.period}`);
      lines.push(parts.join(" — "));
      if (row.notes && row.notes.trim()) lines.push(`Notes: ${row.notes}`);
      lines.push("");
      return;
    }
    const coverage = [];
    if (row.photo) coverage.push("Photo");
    if (row.video) coverage.push("Video");
    lines.push(`Time: ${time.hour}:${time.minute} ${time.period}`);
    lines.push(`Event: ${row.event || "(no event)"}`);
    lines.push(`Duration: ${row.duration} minutes`);
    if (coverage.length > 0) lines.push(`Coverage: ${coverage.join(" & ")}`);
    lines.push(`Setting: ${row.isOutdoor ? "Outside" : "Indoors"}`);
    if (row.notes && row.notes.trim()) lines.push(`Notes: ${row.notes}`);
    lines.push("");
  });
  return lines.join("\n");
}

export function exportTimeline(params) {
  const timeline = buildTimelineText(params);
  const dataBlob = new Blob([timeline], { type: "text/plain" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = params.buildDefaultFilename("txt");
  link.click();
  URL.revokeObjectURL(url);
}

export async function copyTimeline(params) {
  const text = buildTimelineText(params);
  const { setCopyConfirm } = params;
  try {
    await navigator.clipboard.writeText(text);
    setCopyConfirm(true);
    setTimeout(() => setCopyConfirm(false), 2000);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    setCopyConfirm(true);
    setTimeout(() => setCopyConfirm(false), 2000);
  }
}
