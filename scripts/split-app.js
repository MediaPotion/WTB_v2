#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..", "src");
const APP = path.join(SRC, "App.js");
const lines = fs.readFileSync(APP, "utf8").split("\n");

function slice(start, end) {
  return lines.slice(start - 1, end).join("\n");
}

function write(rel, content) {
  const full = path.join(SRC, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
  console.log("wrote", rel);
}

function extractIfBlock(stepNum, start, end) {
  const block = lines.slice(start - 1, end);
  // drop first line "    if (effectiveStep === N) {" and last "    }"
  const inner = block.slice(1, -1).join("\n");
  return inner;
}

// ── constants ──
write("constants/events.js", `${slice(7, 48)}\n\nexport { EVENT_BLOCKS };\n`);
write("constants/colors.js", `${slice(50, 87)}\n\nexport { COLOR_BUCKETS, getEventColor, isBridePreDressEvent, defaultIsOutdoorForEvent };\n`);
write("constants/wizard.js", `const DESKTOP_MIN_WIDTH = "(min-width: 901px)";\n\n${slice(845, 858)}\n\nexport { SETTINGS_WIZARD_TABS, PROJECT_VERSION, AUTOSAVE_KEY, DESKTOP_MIN_WIDTH };\n`);
write("constants/styles.js", `${slice(148, 753)}\n\nexport { MOBILE_TWEAKS };\n`);

write("lib/time.js", `import React, { useState, useEffect } from "react";\n\n${slice(65, 103)}\n\n${slice(756, 825)}\n\nexport {\n  formatTime,\n  parseTimeInput,\n  formatClockLabel,\n  formatDurationSpan,\n  computeTimelineCoverage,\n  TimelineCoverageCounter,\n  MINUTE_OPTIONS_5,\n  snapMinuteToFive,\n  useMediaQuery,\n};\n`);

write("lib/overlaps.js", `${slice(827, 843)}\n\nexport { computeOverlaps };\n`);

const genBody = slice(3791, 4099);
write("lib/generateTimeline.js", `import { formatTime, parseTimeInput } from "./time";\n\nexport function generateTimeline(ctx) {\n${genBody}\n}\n`);

write("lib/exportTxt.js", `import { formatTime } from "./time";\n\nexport function buildTimelineText(params) {\n  const {\n    userRows,\n    bride,\n    groom,\n    date,\n    photoStartHour,\n    photoStartMinute,\n    photoStartPeriod,\n    photoEndHour,\n    photoEndMinute,\n    photoEndPeriod,\n    videoStartHour,\n    videoStartMinute,\n    videoStartPeriod,\n    videoEndHour,\n    videoEndMinute,\n    videoEndPeriod,\n  } = params;\n  const sortedRows = [...userRows].sort((a, b) => a.time - b.time);\n  const lines = [];\n  lines.push(\`Wedding Timeline for \${bride} & \${groom}\`);\n  lines.push(\`Date: \${date}\`, "");\n  lines.push(\n    \`Photo Coverage: \${photoStartHour}:\${photoStartMinute} \${photoStartPeriod} - \${photoEndHour}:\${photoEndMinute} \${photoEndPeriod}\`\n  );\n  lines.push(\n    \`Video Coverage: \${videoStartHour}:\${videoStartMinute} \${videoStartPeriod} - \${videoEndHour}:\${videoEndMinute} \${videoEndPeriod}\`,\n    "",\n    "TIMELINE:",\n    ""\n  );\n\n  sortedRows.forEach((row) => {\n    const time = formatTime(row.time);\n    if (row.type === "constraint") {\n      lines.push(\`Time: \${time.hour}:\${time.minute} \${time.period}\`);\n      lines.push(\`⚠️ TIME CONSTRAINT\`);\n      if (row.notes && row.notes.trim()) lines.push(\`Note: \${row.notes}\`);\n      lines.push("");\n      return;\n    }\n    if (row.type === "location") {\n      const parts = [\`📍 \${row.event || "(no name)"}\`];\n      if (row.address && row.address.trim()) parts.push(row.address.trim());\n      parts.push(\`Travel time: \${row.duration} min\`);\n      lines.push(\`Time: \${time.hour}:\${time.minute} \${time.period}\`);\n      lines.push(parts.join(" — "));\n      if (row.notes && row.notes.trim()) lines.push(\`Notes: \${row.notes}\`);\n      lines.push("");\n      return;\n    }\n    const coverage = [];\n    if (row.photo) coverage.push("Photo");\n    if (row.video) coverage.push("Video");\n    lines.push(\`Time: \${time.hour}:\${time.minute} \${time.period}\`);\n    lines.push(\`Event: \${row.event || "(no event)"}\`);\n    lines.push(\`Duration: \${row.duration} minutes\`);\n    if (coverage.length > 0) lines.push(\`Coverage: \${coverage.join(" & ")}\`);\n    lines.push(\`Setting: \${row.isOutdoor ? "Outside" : "Indoors"}\`);\n    if (row.notes && row.notes.trim()) lines.push(\`Notes: \${row.notes}\`);\n    lines.push("");\n  });\n  return lines.join("\\n");\n}\n\nexport function exportTimeline(params) {\n  const timeline = buildTimelineText(params);\n  const dataBlob = new Blob([timeline], { type: "text/plain" });\n  const url = URL.createObjectURL(dataBlob);\n  const link = document.createElement("a");\n  link.href = url;\n  link.download = params.buildDefaultFilename("txt");\n  link.click();\n  URL.revokeObjectURL(url);\n}\n\nexport async function copyTimeline(params) {\n  const text = buildTimelineText(params);\n  const { setCopyConfirm } = params;\n  try {\n    await navigator.clipboard.writeText(text);\n    setCopyConfirm(true);\n    setTimeout(() => setCopyConfirm(false), 2000);\n  } catch {\n    const ta = document.createElement("textarea");\n    ta.value = text;\n    document.body.appendChild(ta);\n    ta.select();\n    document.execCommand("copy");\n    document.body.removeChild(ta);\n    setCopyConfirm(true);\n    setTimeout(() => setCopyConfirm(false), 2000);\n  }\n}\n`);

// exportPdf - include preview through TimelinePreview end (2278), export exportPDF separately
write("lib/exportPdf.js", `import React, { useState, useEffect, useRef } from "react";\nimport { formatTime } from "./time";\nimport { getEventColor } from "../constants/colors";\n\n${slice(1983, 2278)}\n\nexport async function exportPDF(params) {\n${slice(3489, 3585).replace(/^  /gm, "")}\n}\n\nexport { TimelinePreview, layoutPreviewPages, fmtDateLong, hexToRgb };\n`);

write("components/timeline/AddRowButton.jsx", `import React from "react";\n\n${slice(1334, 1369)}\n\nexport { AddRowButton };\n`);
write("components/timeline/RowDropZone.jsx", `import React from "react";\nimport { AddRowButton } from "./AddRowButton";\n\n${slice(106, 143)}\n\nexport { RowDropZone };\n`);
write("components/timeline/TimePopover.jsx", `import React, { useState, useEffect } from "react";\nimport { MINUTE_OPTIONS_5, snapMinuteToFive } from "../../lib/time";\n\n${slice(861, 1017)}\n\nexport { TimePopover };\n`);
write("components/timeline/EventBlockSelector.jsx", `import React, { useState, useEffect } from "react";\nimport { EVENT_BLOCKS } from "../../constants/events";\nimport { getEventColor } from "../../constants/colors";\nimport { formatTime, parseTimeInput, snapMinuteToFive } from "../../lib/time";\n\n${slice(1020, 1331)}\n\nexport { EventBlockSelector };\n`);
write("components/timeline/TimelineRow.jsx", `import React, { useState, useEffect, useRef } from "react";\nimport { getEventColor } from "../../constants/colors";\nimport { formatTime } from "../../lib/time";\nimport { TimePopover } from "./TimePopover";\n\n${slice(1372, 1978)}\n\nexport { TimelineRow };\n`);
write("components/sidebar/PreviewPanel.jsx", `export { TimelinePreview } from "../../lib/exportPdf";\n`);
write("components/sidebar/EventSidebar.jsx", `import React, { useState } from "react";\nimport { EVENT_BLOCKS } from "../../constants/events";\nimport { getEventColor } from "../../constants/colors";\nimport { TimelinePreview } from "../../lib/exportPdf";\n\n${slice(2281, 2353)}\n\nexport { EventSidebar };\n`);

const stepMap = [
  [2, "WizardStep2", 4201, 4420],
  [1, "WizardStep1", 4423, 4477],
  [3, "WizardStep3", 4480, 4548],
  [4, "WizardStep4", 4550, 4601],
  [5, "WizardStep5", 4603, 4705],
  [6, "WizardStep6", 4707, 4778],
  [8, "WizardStep7", 4780, 4876],
  [9, "WizardStep8", 4878, 5068],
  [99, "WizardConfirm", 5070, 5256],
];

for (const [, name, start, end] of stepMap) {
  const inner = extractIfBlock(null, start, end);
  write(
    `components/wizard/${name}.jsx`,
    `import React from "react";\n\nfunction ${name}(props) {\n  const {\n    stepCard, wizSectionHeading, wizToggleStyle, wizCheckRowStyle, inModal, effectiveStep, displayStep, totalWizardSteps, allWizLocations,\n    date, setDate, bride, setBride, groom, setGroom, brideLabel, setBrideLabel, groomLabel, setGroomLabel,\n    wiz_locations, setWiz_locations, wiz_locationNextId, setWiz_locationNextId, addWizLocation, updateWizLocation, removeWizLocation,\n    wiz_receptionVenue, setWiz_receptionVenue, wiz_receptionAddress, setWiz_receptionAddress, wiz_receptionSameAsCeremony, setWiz_receptionSameAsCeremony,\n    wiz_ceremonyHour, setWiz_ceremonyHour, wiz_ceremonyMinute, setWiz_ceremonyMinute, wiz_ceremonyPeriod, setWiz_ceremonyPeriod,\n    wiz_ceremonyDuration, setWiz_ceremonyDuration, wiz_ceremonyVenue, setWiz_ceremonyVenue, wiz_ceremonyAddress, setWiz_ceremonyAddress,\n    wiz_guestCount, setWiz_guestCount, wiz_portraitLocations, setWiz_portraitLocations,\n    wiz_brideReadyAddress, setWiz_brideReadyAddress, wiz_brideReadyStreet, setWiz_brideReadyStreet,\n    wiz_groomReadyAddress, setWiz_groomReadyAddress, wiz_groomReadyStreet, setWiz_groomReadyStreet,\n    wiz_distanceBetweenReady, setWiz_distanceBetweenReady, wiz_distanceBrideToCeremony, setWiz_distanceBrideToCeremony,\n    wiz_distanceGroomToCeremony, setWiz_distanceGroomToCeremony, wiz_distanceReceptionToCeremony, setWiz_distanceReceptionToCeremony,\n    wiz_sameLocation, setWiz_sameLocation, wiz_portraitsAtReadyLocations, setWiz_portraitsAtReadyLocations,\n    wiz_bridePortraitsAtReadyLocation, setWiz_bridePortraitsAtReadyLocation, wiz_groomPortraitsAtReadyLocation, setWiz_groomPortraitsAtReadyLocation,\n    wiz_hairMakeupDoneHour, setWiz_hairMakeupDoneHour, wiz_hairMakeupDoneMinute, setWiz_hairMakeupDoneMinute, wiz_hairMakeupDonePeriod, setWiz_hairMakeupDonePeriod,\n    wiz_photoCoverageHours, setWiz_photoCoverageHours, wiz_videoCoverageHours, setWiz_videoCoverageHours, wiz_ceremonyOutdoor, setWiz_ceremonyOutdoor,\n    wiz_photographerCount, setWiz_photographerCount, wiz_videographerCount, setWiz_videographerCount, wiz_drone, setWiz_drone, wiz_narration, setWiz_narration,\n    wiz_hasFirstLooks, setWiz_hasFirstLooks, wiz_firstLookGroom, setWiz_firstLookGroom, wiz_firstLookParent, setWiz_firstLookParent,\n    wiz_firstLookBridesmaids, setWiz_firstLookBridesmaids, wiz_firstLookOther, setWiz_firstLookOther,\n    wiz_firstLookGroomLocation, setWiz_firstLookGroomLocation, wiz_firstLookParentLocation, setWiz_firstLookParentLocation,\n    wiz_firstLookBridesmaidsLocation, setWiz_firstLookBridesmaidsLocation, wiz_firstLookOtherLocation, setWiz_firstLookOtherLocation,\n    wiz_brideOkayBefore, setWiz_brideOkayBefore,\n    wiz_receptionHour, setWiz_receptionHour, wiz_receptionMinute, setWiz_receptionMinute, wiz_receptionPeriod, setWiz_receptionPeriod,\n    wiz_grandEntrance, setWiz_grandEntrance, wiz_cakeCutting, setWiz_cakeCutting, wiz_firstDance, setWiz_firstDance,\n    wiz_brideParentDance, setWiz_brideParentDance, wiz_groomParentDance, setWiz_groomParentDance, wiz_specialDance, setWiz_specialDance,\n    wiz_speeches, setWiz_speeches, wiz_speechCount, setWiz_speechCount, wiz_dinner, setWiz_dinner,\n    wiz_dinnerStartHour, setWiz_dinnerStartHour, wiz_dinnerStartMinute, setWiz_dinnerStartMinute, wiz_dinnerStartPeriod, setWiz_dinnerStartPeriod,\n    wiz_dinnerStyle, setWiz_dinnerStyle, wiz_openDanceFloor, setWiz_openDanceFloor, wiz_garterToss, setWiz_garterToss, wiz_bouquetToss, setWiz_bouquetToss,\n    wiz_familyGroups, setWiz_familyGroups, wiz_familyGroupNames, setWiz_familyGroupNames, wiz_goldenHour, setWiz_goldenHour,\n    wiz_brideReadyAtCeremony, setWiz_brideReadyAtCeremony, wiz_brideReadyAtReception, setWiz_brideReadyAtReception,\n    wiz_groomReadyAtCeremony, setWiz_groomReadyAtCeremony, wiz_groomReadyAtReception, setWiz_groomReadyAtReception, wiz_groomReadyAtBride, setWiz_groomReadyAtBride,\n    wiz_preCeremonyBrideReady, setWiz_preCeremonyBrideReady, wiz_preCeremonyGroomReady, setWiz_preCeremonyGroomReady,\n    wiz_preCeremonyDetails, setWiz_preCeremonyDetails, wiz_preCeremonyBrideParty, setWiz_preCeremonyBrideParty,\n    wiz_preCeremonyGroomParty, setWiz_preCeremonyGroomParty, wiz_preCeremonyPreDress, setWiz_preCeremonyPreDress,\n    wiz_ceremonyNotes, setWiz_ceremonyNotes, wiz_customFirstLooks, setWiz_customFirstLooks, wiz_customFirstLookNextId, setWiz_customFirstLookNextId,\n    wiz_portraitSessions, setWiz_portraitSessions, wiz_portraitSessionNextId, setWiz_portraitSessionNextId,\n    wiz_grandEntranceSub, setWiz_grandEntranceSub, wiz_customReceptionEvents, setWiz_customReceptionEvents, wiz_customReceptionEventNextId, setWiz_customReceptionEventNextId,\n    setWizardStep, setScreen, generateTimeline, withThe,\n  } = props;\n${inner}\n}\n\nexport { ${name} };\n`
  );
}

// Wizard helpers + routing (lines 4102-4198 + routing)
write(
  "screens/WizardScreen.jsx",
  `import React from "react";
import { WizardStep1 } from "../components/wizard/WizardStep1";
import { WizardStep2 } from "../components/wizard/WizardStep2";
import { WizardStep3 } from "../components/wizard/WizardStep3";
import { WizardStep4 } from "../components/wizard/WizardStep4";
import { WizardStep5 } from "../components/wizard/WizardStep5";
import { WizardStep6 } from "../components/wizard/WizardStep6";
import { WizardStep7 } from "../components/wizard/WizardStep7";
import { WizardStep8 } from "../components/wizard/WizardStep8";
import { WizardConfirm } from "../components/wizard/WizardConfirm";

function renderWizard(props) {
  const { inModal = false, overrideStep = null, wizardStep } = props;
  const effectiveStep = overrideStep !== null ? overrideStep : wizardStep;
  const totalWizardSteps = 8;
  const displayStep = effectiveStep > 7 ? effectiveStep - 1 : effectiveStep;

  const allWizLocations = [
    ...(props.wiz_ceremonyVenue ? [props.wiz_ceremonyVenue] : []),
    ...(!props.wiz_receptionSameAsCeremony && props.wiz_receptionVenue ? [props.wiz_receptionVenue] : []),
    ...(!props.wiz_brideReadyAtCeremony && !props.wiz_brideReadyAtReception && props.wiz_brideReadyAddress ? [props.wiz_brideReadyAddress] : []),
    ...(!props.wiz_groomReadyAtCeremony && !props.wiz_groomReadyAtReception && !props.wiz_groomReadyAtBride && props.wiz_groomReadyAddress ? [props.wiz_groomReadyAddress] : []),
    ...props.wiz_locations.filter(l => l.name).map(l => l.name),
  ];

  const wizToggleStyle = (selected) => ({
    padding: "12px 24px",
    borderRadius: 8,
    border: selected ? "1px solid #b8906a" : "1px solid #2a2520",
    background: selected ? "rgba(184,144,106,0.15)" : "#0f0d0b",
    color: selected ? "#b8906a" : "#6e6358",
    fontFamily: "'Jost', sans-serif",
    fontWeight: selected ? 400 : 300,
    fontSize: 15,
    cursor: "pointer",
    transition: "all 0.2s",
    minWidth: 80,
    minHeight: 44,
  });

  const wizCheckRowStyle = {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    padding: "14px 16px",
    borderRadius: 8,
    border: "1px solid #1e1c19",
    background: "#0f0d0b",
    cursor: "pointer",
    marginBottom: 10,
    transition: "border-color 0.2s",
    minHeight: 44,
  };

  const wizSectionHeading = (text) => (
    <div style={{ fontFamily: "'Jost', sans-serif", fontSize: 11, fontWeight: 300, letterSpacing: "0.18em", textTransform: "uppercase", color: "#b8906a", margin: "20px 0 10px" }}>{text}</div>
  );

  const stepCard = (title, subtitle, content, backFn, nextFn, nextLabel = "Next") => {
    if (inModal) {
      return (
        <div style={{ paddingBottom: 8 }}>
          {subtitle && <p style={{ margin: "0 0 16px", fontSize: 13, color: "#6e6358", fontFamily: "'Jost', sans-serif", lineHeight: 1.5 }}>{subtitle}</p>}
          {content}
        </div>
      );
    }
    return (
      <div className="wiz-layout" style={{ padding: "16px 0", background: "#060504", minHeight: "100vh", fontFamily: "'Jost', sans-serif" }}>
        <div className="wiz-step-col">
          <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 16px 40px" }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6e6358", marginBottom: 6, fontFamily: "'Jost', sans-serif", letterSpacing: "0.1em" }}>
                <span>Step {displayStep} of {totalWizardSteps}</span>
              </div>
              <div style={{ height: 3, background: "#161310", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: \`\${(displayStep / totalWizardSteps) * 100}%\`, background: "linear-gradient(90deg, #b8906a, #cfa882)", borderRadius: 2, transition: "width 0.3s ease" }} />
              </div>
            </div>
            <div style={{ background: "#0f0d0b", border: "1px solid #1e1c19", borderRadius: 12, padding: "24px 20px", marginBottom: 20 }}>
              <h2 style={{ margin: "0 0 8px 0", fontSize: "clamp(22px,4vw,32px)", color: "#ddd0bc", fontWeight: 400, fontFamily: "'Cormorant Garamond', serif" }}>{title}</h2>
              <p style={{ margin: "0 0 24px 0", fontSize: 14, color: "#6e6358", lineHeight: 1.5, fontFamily: "'Jost', sans-serif", fontWeight: 300 }}>{subtitle}</p>
              {content}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <button onClick={backFn} style={{ padding: "12px 28px", border: "1px solid #b8906a", borderRadius: 8, background: "transparent", color: "#ddd0bc", fontSize: 15, cursor: "pointer", fontFamily: "'Jost', sans-serif", fontWeight: 300, transition: "all 0.2s" }}>Back</button>
              <button onClick={nextFn} style={{ padding: "12px 32px", background: "#b8906a", color: "#060504", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 400, cursor: "pointer", fontFamily: "'Jost', sans-serif" }}>{nextLabel}</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const stepProps = {
    ...props,
    inModal,
    effectiveStep,
    totalWizardSteps,
    displayStep,
    allWizLocations,
    wizToggleStyle,
    wizCheckRowStyle,
    wizSectionHeading,
    stepCard,
  };

  if (effectiveStep === 2) return <WizardStep2 {...stepProps} />;
  if (effectiveStep === 1) return <WizardStep1 {...stepProps} />;
  if (effectiveStep === 3) return <WizardStep3 {...stepProps} />;
  if (effectiveStep === 4) return <WizardStep4 {...stepProps} />;
  if (effectiveStep === 5) return <WizardStep5 {...stepProps} />;
  if (effectiveStep === 6) return <WizardStep6 {...stepProps} />;
  if (effectiveStep === 8) return <WizardStep7 {...stepProps} />;
  if (effectiveStep === 9) return <WizardStep8 {...stepProps} />;
  if (effectiveStep === 99) return <WizardConfirm {...stepProps} />;
  return null;
}

export { renderWizard };
`
);

write(
  "screens/WelcomeScreen.jsx",
  `import React from "react";
import mediaPotionLogo from "../assets/mediapotion_logo.png";

function WelcomeScreen({ showAutosaveBanner, restoreAutosave, clearAutosave, setWizardStep, setScreen, loadProject }) {
  return (
${slice(5447, 5497).split("\n").slice(1).join("\n")}
  );
}

export { WelcomeScreen };
`
);

// hooks
write(
  "hooks/useProjectStorage.js",
  `import { useEffect } from "react";
import { PROJECT_VERSION, AUTOSAVE_KEY } from "../constants/wizard";

export function useProjectStorage(state) {
  const ctx = state;

  const buildDefaultFilename = (ext) => {
${slice(3205, 3243).replace(/^    /gm, "    ")}
  };

  const buildProjectData = () => ({
${slice(3247, 3268).replace(/^    /gm, "    ")}
  });

  const applyProjectData = (projectData) => {
${slice(3272, 3334).replace(/^    /gm, "    ")}
  };

  const clearAutosave = () => {
${slice(2600, 2605).replace(/^    /gm, "    ")}
    ctx.setShowAutosaveBanner(false);
  };

  const saveProject = () => {
${slice(3338, 3347).replace(/^    /gm, "    ")}
  };

  const loadProject = (event) => {
${slice(3351, 3378).replace(/^    /gm, "    ")}
  };

  const restoreAutosave = () => {
${slice(3382, 3395).replace(/^    /gm, "    ")}
  };

  useEffect(() => {
${slice(3417, 3433).replace(/^    /gm, "    ")}
  }, [
${slice(3435, 3457).replace(/^    /gm, "    ")}
  ]);

  return { buildDefaultFilename, buildProjectData, applyProjectData, clearAutosave, saveProject, loadProject, restoreAutosave };
}
`.replace(/\b(date|bride|groom|brideLabel|groomLabel|photoStartHour|photoStartMinute|photoStartPeriod|photoEndHour|photoEndMinute|photoEndPeriod|videoStartHour|videoStartMinute|videoStartPeriod|videoEndHour|videoEndMinute|videoEndPeriod|photoEnabled|videoEnabled|userRows|fixedEvents|screen|nextId|setDate|setBride|setGroom|setBrideLabel|setGroomLabel|setPhotoStartHour|setPhotoStartMinute|setPhotoStartPeriod|setPhotoEndHour|setPhotoEndMinute|setPhotoEndPeriod|setVideoStartHour|setVideoStartMinute|setVideoStartPeriod|setVideoEndHour|setVideoEndMinute|setVideoEndPeriod|setPhotoEnabled|setVideoEnabled|setUserRows|setNextId|setFixedEvents|setHistory|setRedoStack|setScreen|setVersionNotice|setShowAutosaveBanner|clearDirty|isTimelineEmpty|mainScrollRef|isApplyingProjectRef|suppressDirtyRef|dirtyTrackingEnabledRef|autosaveTimerRef)\b/g, (m) => `ctx.${m}`)
);

// Build MobileApp from original, stripping extracted sections
const mobileStart = 2357;
const mobileEnd = 6108;
let mobileBody = slice(mobileStart, mobileEnd);

// Remove renderWizard function (from "  const renderWizard" to "  };  // ---- Wizard Rendering ----" end before renderSettingsForm)
mobileBody = mobileBody.replace(/  const renderWizard = [\s\S]*?  \};  \/\/ ---- Wizard Rendering ----\n/, "");

// Remove exportPDF, exportTimeline, copyTimeline, undo, redo blocks and replace with wrappers
mobileBody = mobileBody.replace(
  /  const exportPDF = async \(\) => \{[\s\S]*?  \};\n\n  const exportTimeline = \(\) => \{[\s\S]*?  \};\n\n  const copyTimeline = async \(\) => \{[\s\S]*?  \};\n/,
  `  const exportPDF = () => exportPDFLib(exportParams);
  const exportTimeline = () => exportTimelineLib(exportParams);
  const copyTimeline = () => copyTimelineLib(exportParams);
`
);

// Remove generateTimeline and replace
mobileBody = mobileBody.replace(
  /  const generateTimeline = \(\) => \{[\s\S]*?  \};  \/\/ ---- Wizard Rendering ----\n/,
  `  const generateTimeline = () => generateTimelineLib(generateTimelineCtx);
`
);

// Remove project storage functions
mobileBody = mobileBody.replace(
  /  const buildDefaultFilename = \(ext\) => \{[\s\S]*?  \};\n\n  const buildProjectData = \(\) => \(\{[\s\S]*?  \}\);\n\n  const applyProjectData = \(projectData\) => \{[\s\S]*?  \};\n\n  const saveProject = \(\) => \{[\s\S]*?  \};\n\n  const loadProject = \(event\) => \{[\s\S]*?  \};\n\n  const restoreAutosave = \(\) => \{[\s\S]*?  \};\n\n/,
  ""
);

// Remove clearAutosave duplicate (from hook)
mobileBody = mobileBody.replace(/  const clearAutosave = \(\) => \{[\s\S]*?  \};\n\n/, "");

// Remove autosave useEffect (handled by hook)
mobileBody = mobileBody.replace(
  /  useEffect\(\(\) => \{\n    if \(!dirtyTrackingEnabledRef\.current[\s\S]*?  \]\);\n\n/,
  ""
);

const mobileImports = `import React, { useState, useEffect, useMemo, useRef } from "react";
import mediaPotionLogo from "../assets/mediapotion_logo.png";
import { MOBILE_TWEAKS } from "../constants/styles";
import { SETTINGS_WIZARD_TABS, PROJECT_VERSION, AUTOSAVE_KEY, DESKTOP_MIN_WIDTH } from "../constants/wizard";
import { defaultIsOutdoorForEvent } from "../constants/colors";
import { formatTime, parseTimeInput, computeTimelineCoverage, TimelineCoverageCounter, useMediaQuery } from "../lib/time";
import { computeOverlaps } from "../lib/overlaps";
import { generateTimeline as generateTimelineLib } from "../lib/generateTimeline";
import { exportTimeline as exportTimelineLib, copyTimeline as copyTimelineLib } from "../lib/exportTxt";
import { exportPDF as exportPDFLib, TimelinePreview } from "../lib/exportPdf";
import { useProjectStorage } from "../hooks/useProjectStorage";
import { RowDropZone } from "../components/timeline/RowDropZone";
import { TimelineRow } from "../components/timeline/TimelineRow";
import { EventBlockSelector } from "../components/timeline/EventBlockSelector";
import { EventSidebar } from "../components/sidebar/EventSidebar";
import { WelcomeScreen } from "./WelcomeScreen";
import { renderWizard } from "./WizardScreen";

`;

// Insert hook calls and ctx objects after state declarations - find a good anchor after wizard state
const hookInsert = `
  const { buildDefaultFilename, clearAutosave, saveProject, loadProject, restoreAutosave } = useProjectStorage({
    date, bride, groom, brideLabel, groomLabel,
    photoStartHour, photoStartMinute, photoStartPeriod,
    photoEndHour, photoEndMinute, photoEndPeriod,
    videoStartHour, videoStartMinute, videoStartPeriod,
    videoEndHour, videoEndMinute, videoEndPeriod,
    photoEnabled, videoEnabled,
    userRows, fixedEvents, screen, nextId,
    setDate, setBride, setGroom, setBrideLabel, setGroomLabel,
    setPhotoStartHour, setPhotoStartMinute, setPhotoStartPeriod,
    setPhotoEndHour, setPhotoEndMinute, setPhotoEndPeriod,
    setVideoStartHour, setVideoStartMinute, setVideoStartPeriod,
    setVideoEndHour, setVideoEndMinute, setVideoEndPeriod,
    setPhotoEnabled, setVideoEnabled,
    setUserRows, setNextId, setFixedEvents, setHistory, setRedoStack,
    setScreen, setVersionNotice, setShowAutosaveBanner,
    clearDirty, isTimelineEmpty, mainScrollRef,
    isApplyingProjectRef, suppressDirtyRef, dirtyTrackingEnabledRef,
    autosaveTimerRef,
  });

  const exportParams = {
    userRows, bride, groom, date,
    photoStartHour, photoStartMinute, photoStartPeriod,
    photoEndHour, photoEndMinute, photoEndPeriod,
    videoStartHour, videoStartMinute, videoStartPeriod,
    videoEndHour, videoEndMinute, videoEndPeriod,
    buildDefaultFilename,
    setCopyConfirm,
    setExporting,
    setShowExportMenu,
    closeMobileGearMenu: () => setShowMobileMenu(false),
    photoEnabled,
    videoEnabled,
  };

  const generateTimelineCtx = {
    date, photoEnabled, videoEnabled,
    wiz_ceremonyDuration, wiz_ceremonyHour, wiz_ceremonyMinute, wiz_ceremonyPeriod,
    wiz_receptionHour, wiz_receptionMinute, wiz_receptionPeriod,
    wiz_firstLookGroom, wiz_brideOkayBefore,
    wiz_grandEntrance, wiz_dinner, wiz_dinnerStartHour, wiz_dinnerStartMinute, wiz_dinnerStartPeriod,
    wiz_familyGroups, wiz_familyGroupNames,
    wiz_groomReadyAtCeremony, wiz_groomReadyAtReception, wiz_groomReadyAtBride, wiz_groomReadyAddress,
    wiz_ceremonyVenue, wiz_receptionSameAsCeremony, wiz_receptionVenue, wiz_receptionAddress, wiz_ceremonyAddress,
    wiz_brideReadyAddress,
    wiz_firstLookParent, wiz_firstLookBridesmaids, wiz_firstLookOther,
    wiz_firstLookGroomLocation, wiz_firstLookParentLocation, wiz_firstLookBridesmaidsLocation, wiz_firstLookOtherLocation,
    wiz_drone, wiz_narration, wiz_portraitLocations,
    wiz_distanceBetweenReady, wiz_distanceGroomToCeremony, wiz_distanceBrideToCeremony, wiz_distanceReceptionToCeremony,
    wiz_ceremonyOutdoor, wiz_goldenHour,
    wiz_cakeCutting, wiz_firstDance, wiz_brideParentDance, wiz_groomParentDance, wiz_specialDance,
    wiz_speeches, wiz_speechCount, wiz_openDanceFloor, wiz_garterToss, wiz_bouquetToss,
    wiz_photoCoverageHours, wiz_videoCoverageHours,
    setUserRows, setNextId, setHistory, setRedoStack,
    setPhotoStartHour, setPhotoStartMinute, setPhotoStartPeriod, setPhotoEndHour, setPhotoEndMinute, setPhotoEndPeriod,
    setVideoStartHour, setVideoStartMinute, setVideoStartPeriod, setVideoEndHour, setVideoEndMinute, setVideoEndPeriod,
    setScreen, setShowSettingsModal, mainScrollRef,
  };

  const wizardProps = {
    wizardStep, setWizardStep, setScreen, generateTimeline, withThe, inModal: false,
    date, setDate, bride, setBride, groom, setGroom, brideLabel, setBrideLabel, groomLabel, setGroomLabel,
    wiz_locations, setWiz_locations, wiz_locationNextId, setWiz_locationNextId, addWizLocation, updateWizLocation, removeWizLocation,
    wiz_receptionVenue, setWiz_receptionVenue, wiz_receptionAddress, setWiz_receptionAddress, wiz_receptionSameAsCeremony, setWiz_receptionSameAsCeremony,
    wiz_ceremonyHour, setWiz_ceremonyHour, wiz_ceremonyMinute, setWiz_ceremonyMinute, wiz_ceremonyPeriod, setWiz_ceremonyPeriod,
    wiz_ceremonyDuration, setWiz_ceremonyDuration, wiz_ceremonyVenue, setWiz_ceremonyVenue, wiz_ceremonyAddress, setWiz_ceremonyAddress,
    wiz_guestCount, setWiz_guestCount, wiz_portraitLocations, setWiz_portraitLocations,
    wiz_brideReadyAddress, setWiz_brideReadyAddress, wiz_brideReadyStreet, setWiz_brideReadyStreet,
    wiz_groomReadyAddress, setWiz_groomReadyAddress, wiz_groomReadyStreet, setWiz_groomReadyStreet,
    wiz_distanceBetweenReady, setWiz_distanceBetweenReady, wiz_distanceBrideToCeremony, setWiz_distanceBrideToCeremony,
    wiz_distanceGroomToCeremony, setWiz_distanceGroomToCeremony, wiz_distanceReceptionToCeremony, setWiz_distanceReceptionToCeremony,
    wiz_sameLocation, setWiz_sameLocation, wiz_portraitsAtReadyLocations, setWiz_portraitsAtReadyLocations,
    wiz_bridePortraitsAtReadyLocation, setWiz_bridePortraitsAtReadyLocation, wiz_groomPortraitsAtReadyLocation, setWiz_groomPortraitsAtReadyLocation,
    wiz_hairMakeupDoneHour, setWiz_hairMakeupDoneHour, wiz_hairMakeupDoneMinute, setWiz_hairMakeupDoneMinute, wiz_hairMakeupDonePeriod, setWiz_hairMakeupDonePeriod,
    wiz_photoCoverageHours, setWiz_photoCoverageHours, wiz_videoCoverageHours, setWiz_videoCoverageHours, wiz_ceremonyOutdoor, setWiz_ceremonyOutdoor,
    wiz_photographerCount, setWiz_photographerCount, wiz_videographerCount, setWiz_videographerCount, wiz_drone, setWiz_drone, wiz_narration, setWiz_narration,
    wiz_hasFirstLooks, setWiz_hasFirstLooks, wiz_firstLookGroom, setWiz_firstLookGroom, wiz_firstLookParent, setWiz_firstLookParent,
    wiz_firstLookBridesmaids, setWiz_firstLookBridesmaids, wiz_firstLookOther, setWiz_firstLookOther,
    wiz_firstLookGroomLocation, setWiz_firstLookGroomLocation, wiz_firstLookParentLocation, setWiz_firstLookParentLocation,
    wiz_firstLookBridesmaidsLocation, setWiz_firstLookBridesmaidsLocation, wiz_firstLookOtherLocation, setWiz_firstLookOtherLocation,
    wiz_brideOkayBefore, setWiz_brideOkayBefore,
    wiz_receptionHour, setWiz_receptionHour, wiz_receptionMinute, setWiz_receptionMinute, wiz_receptionPeriod, setWiz_receptionPeriod,
    wiz_grandEntrance, setWiz_grandEntrance, wiz_cakeCutting, setWiz_cakeCutting, wiz_firstDance, setWiz_firstDance,
    wiz_brideParentDance, setWiz_brideParentDance, wiz_groomParentDance, setWiz_groomParentDance, wiz_specialDance, setWiz_specialDance,
    wiz_speeches, setWiz_speeches, wiz_speechCount, setWiz_speechCount, wiz_dinner, setWiz_dinner,
    wiz_dinnerStartHour, setWiz_dinnerStartHour, wiz_dinnerStartMinute, setWiz_dinnerStartMinute, wiz_dinnerStartPeriod, setWiz_dinnerStartPeriod,
    wiz_dinnerStyle, setWiz_dinnerStyle, wiz_openDanceFloor, setWiz_openDanceFloor, wiz_garterToss, setWiz_garterToss, wiz_bouquetToss, setWiz_bouquetToss,
    wiz_familyGroups, setWiz_familyGroups, wiz_familyGroupNames, setWiz_familyGroupNames, wiz_goldenHour, setWiz_goldenHour,
    wiz_brideReadyAtCeremony, setWiz_brideReadyAtCeremony, wiz_brideReadyAtReception, setWiz_brideReadyAtReception,
    wiz_groomReadyAtCeremony, setWiz_groomReadyAtCeremony, wiz_groomReadyAtReception, setWiz_groomReadyAtReception, wiz_groomReadyAtBride, setWiz_groomReadyAtBride,
    wiz_preCeremonyBrideReady, setWiz_preCeremonyBrideReady, wiz_preCeremonyGroomReady, setWiz_preCeremonyGroomReady,
    wiz_preCeremonyDetails, setWiz_preCeremonyDetails, wiz_preCeremonyBrideParty, setWiz_preCeremonyBrideParty,
    wiz_preCeremonyGroomParty, setWiz_preCeremonyGroomParty, wiz_preCeremonyPreDress, setWiz_preCeremonyPreDress,
    wiz_ceremonyNotes, setWiz_ceremonyNotes, wiz_customFirstLooks, setWiz_customFirstLooks, wiz_customFirstLookNextId, setWiz_customFirstLookNextId,
    wiz_portraitSessions, setWiz_portraitSessions, wiz_portraitSessionNextId, setWiz_portraitSessionNextId,
    wiz_grandEntranceSub, setWiz_grandEntranceSub, wiz_customReceptionEvents, setWiz_customReceptionEvents, wiz_customReceptionEventNextId, setWiz_customReceptionEventNextId,
  };
`;

mobileBody = mobileBody.replace(
  /  const rows = useMemo\(\(\) => \{/,
  hookInsert + "\n  const rows = useMemo(() => {"
);

// Replace welcome screen inline JSX with component
mobileBody = mobileBody.replace(
  /      \{screen === "welcome" \? \(\n        \/\* ============ WELCOME SCREEN ============ \*\/\n        <div style=\{\{ minHeight: "100vh"[\s\S]*?        <\/div>\n      \) : screen === "wizard"/,
  `      {screen === "welcome" ? (
        <WelcomeScreen
          showAutosaveBanner={showAutosaveBanner}
          restoreAutosave={restoreAutosave}
          clearAutosave={clearAutosave}
          setWizardStep={setWizardStep}
          setScreen={setScreen}
          loadProject={loadProject}
        />
      ) : screen === "wizard"`
);

// Replace renderWizard() calls
mobileBody = mobileBody.replace(/renderWizard\(\)/g, "renderWizard(wizardProps)");
mobileBody = mobileBody.replace(/renderWizard\(true, SETTINGS_WIZARD_TABS\[settingsTab\]\.step\)/g, "renderWizard({ ...wizardProps, inModal: true, overrideStep: SETTINGS_WIZARD_TABS[settingsTab].step })");

write("screens/MobileApp.jsx", mobileImports + mobileBody + "\n");

write("App.jsx", `import MobileApp from "./screens/MobileApp";

export default MobileApp;
`);

console.log("Done");
