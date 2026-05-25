import React, { useState, useEffect, useMemo, useRef } from "react";
import mediaPotionLogo from "./assets/mediapotion_logo.png";

/* --------------------------------------
   Shared data (used by sidebar & popup)
---------------------------------------*/
const EVENT_BLOCKS = [
  "Details: Drone & Venue Shots::30",
  "Details: Rings,Invitations, & Accessories::20",
  "Details: Dress Shots::10",
  "Bride (Pre-Dress): Bridesmaids Group Shots::10",
  "Bride (Pre-Dress): Bridesmaids Individual Shots::10",
  "Bride (Pre-Dress): Hair & Makeup Details::10",
  "Bride (Pre-Dress): Putting Dress On::10",
  "Bride (Dress On): Accessory Shots::10",
  "Bride (Dress On): Bride Portraits::15",
  "Bride (Dress On): Bridesmaids Group Shots::10",
  "Bride (Dress On): Bridesmaids Individual Shots::10",
  "First Look: with Parent::10",
  "First Look: with Bridesmaids::10",
  "First Look: with Groom::10",
  "Narration: Bride Record Narration::15",
  "Narration: Groom Record Narration::15",
  "Groom: Assisted with Tie & Jacket::10",
  "Groom: Portraits::15",
  "Groom: Groomsmen Group Shots::10",
  "Groom: Groomsmen Individual Shots::10",
  "Ceremony: Audio/Video Setup::20",
  "Ceremony: Average::30",
  "Ceremony: Catholic::60",
  "Group Photos: Family (5 Groups)::20",
  "Group Photos: Family (10 Groups)::45",
  "Wedding Party: Group Shots::15",
  "Bride & Groom: Portraits::20",
  "Bride & Groom: Golden Hour Portraits::20",
  "Reception: Audio/Video Setup::20",
  "Reception: Grand Entrances::10",
  "Reception: Cake Cutting::5",
  "Reception: Bride & Groom Dance::5",
  "Reception: Bride & Parent Dance::5",
  "Reception: Groom & Parent Dance::5",
  "Reception: Special Dance::5",
  "Reception: Dinner::60",
  "Reception: Speeches (Per Speaker)::10",
  "Reception: Open Dance Floor::20",
  "Reception: Garder Belt Toss::15",
  "Reception: Bouquet Toss::15",
];

const COLOR_BUCKETS = {
  Details: "#FFE5B4",
  "Bride (Pre-Dress)": "#FFB6C1",
  "Bride (Dress On)": "#FF69B4",
  "First Look": "#20B2AA",
  "Bride & Groom:": "#DA70D6",
  "Narration:": "#FFA07A",
  "Groom:": "#98FB98",
  "Ceremony:": "#FFD700",
  "Reception:": "#87CEEB",
  "Group Photos:": "#DDA0DD",
  "Wedding Party:": "#B57EDC",
  Other: "#ffffff", // default to white
};

// Available colors for custom row coloring
const COLOR_PALETTE = [
  { name: "Peach (Details)", value: "#FFE5B4" },
  { name: "Light Pink (Bride Pre-Dress)", value: "#FFB6C1" },
  { name: "Hot Pink (Bride Dress On)", value: "#FF69B4" },
  { name: "Sea Green (First Look)", value: "#20B2AA" },
  { name: "Orchid (Bride & Groom)", value: "#DA70D6" },
  { name: "Salmon (Narration)", value: "#FFA07A" },
  { name: "Pale Green (Groom)", value: "#98FB98" },
  { name: "Gold (Ceremony)", value: "#FFD700" },
  { name: "Sky Blue (Reception)", value: "#87CEEB" },
  { name: "Plum (Group Photos)", value: "#DDA0DD" },
  { name: "Purple (Wedding Party)", value: "#B57EDC" },
  { name: "Lavender", value: "#E6E6FA" },
  { name: "Mint", value: "#3CB371" },
  { name: "Coral", value: "#FF7F50" },
  { name: "Turquoise", value: "#40E0D0" },
  { name: "Rose", value: "#FFE4E1" },
  { name: "Sage", value: "#9DC183" },
  { name: "White", value: "#ffffff" },
];

function getEventColor(label, fallback = "#ffffff") {
  if (!label) return fallback;
  const key = Object.keys(COLOR_BUCKETS).find((k) => label.startsWith(k));
  return COLOR_BUCKETS[key] || COLOR_BUCKETS.Other;
}

const DESKTOP_MIN_WIDTH = "(min-width: 901px)";

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

// Drop zone that also contains the AddRowButton
function RowDropZone({ index, onDropBetween, onAddRow, isLast }) {
  const [over, setOver] = React.useState(false);
  return (
    <div
      onDragOver={(e) => {
        if (e.dataTransfer?.types?.includes('text/plain')) {
          e.preventDefault();
          setOver(true);
        }
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        if (e.dataTransfer?.types?.includes('text/plain')) {
          e.preventDefault();
          setOver(false);
          onDropBetween?.(e, index);
        }
      }}
      className="wtb-drop-zone"
      style={{
        position: 'relative',
        height: over ? 60 : 40, // Grow to row height on hover
        margin: '2px 0',
        backgroundColor: over ? 'rgba(184,144,106,0.08)' : 'transparent',
        border: over ? '2px dashed #b8906a' : '2px dashed transparent',
        borderRadius: 8,
        transition: 'all 0.15s ease-in-out',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      aria-label="Drop here to reorder"
      title={over ? 'Release to drop row here' : ''}
    >
      {!over && <AddRowButton onClick={onAddRow} isLast={isLast} />}
    </div>
  );
}

/* --------------------------------------
   CSS injected at runtime
---------------------------------------*/
const MOBILE_TWEAKS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Jost:wght@200;300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  input, select, textarea {
    font-size: 16px;
    font-family: 'Jost', sans-serif;
    background: #0f0d0b;
    color: #ddd0bc;
    border: 1px solid #2a2520;
  }
  input::placeholder, textarea::placeholder { color: #6e6358; }
  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: #b8906a;
    box-shadow: 0 0 0 2px rgba(184,144,106,0.15);
  }

  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
  input[type="number"] { -moz-appearance: textfield; }

  input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.6) sepia(0.3) saturate(0.8) hue-rotate(10deg); }

  input[type="checkbox"] { accent-color: #b8906a; }

  select option { background: #0f0d0b; color: #ddd0bc; }

  .wtb-mins input { width: 44px; padding: 2px 4px; text-align: center; }
  .wtb-notes { padding-right: 10px; }

  .wtb-shell {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
    background: #060504;
  }

  @media (min-width: 901px) {
    .wtb-shell {
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      align-items: stretch;
    }
    .wtb-sidebar-wrap {
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-height: 0;
      overflow: hidden;
    }
    .wtb-sidebar {
      display: flex;
      flex-direction: column;
      border: 1px solid #1e1c19;
      background: #0f0d0b;
      border-radius: 8px;
      padding: 12px;
      flex: 1;
      min-height: 0;
    }
  }

  @media (max-width: 900px) {
    .wtb-sidebar-wrap,
    .wtb-sidebar { display: none !important; }
    .wtb-shell {
      grid-template-columns: 1fr !important;
      gap: 0 !important;
    }
    .wtb-timeline-screen {
      padding: 0 8px 10px !important;
      overflow-x: hidden;
    }
    .wtb-timeline-scroll {
      padding: 0 4px 20px !important;
    }
    .wtb-controls-desktop { display: none !important; }
    .wtb-timeline-scroll.wtb-has-mobile-dock {
      padding-bottom: calc(68px + env(safe-area-inset-bottom, 0px)) !important;
    }
    .wtb-drop-zone {
      height: auto !important;
      min-height: 0 !important;
      margin: 4px 0 !important;
      border: none !important;
      background: transparent !important;
    }
    .wtb-drag-handle { display: none !important; }
    .wtb-row-reorder {
      display: flex !important;
      flex-direction: column;
      justify-content: center;
      gap: 2px;
      width: 40px;
      flex-shrink: 0;
      border-right: 1px solid #2a2520;
      background: #1e1a16;
    }
    .wtb-row-reorder button {
      flex: 1;
      min-height: 28px;
      border: none;
      background: transparent;
      color: #b8906a;
      font-size: 16px;
      cursor: pointer;
      font-family: 'Jost', sans-serif;
      padding: 0;
    }
    .wtb-row-reorder button:disabled {
      color: #3a3530;
      cursor: not-allowed;
    }
    .wtb-setting-btn--meta { display: inline-flex !important; }
    .wtb-setting-btn--inline { display: none !important; }
    .wtb-event-meta { flex-wrap: wrap !important; }
    .wtb-location-grid {
      grid-template-columns: auto minmax(0, 1fr) minmax(0, 1fr) !important;
      gap: 8px !important;
    }
    .wtb-location-grid .wtb-location-travel {
      width: 72px !important;
    }
    .wtb-location-grid .wtb-location-travel > div {
      width: 58px !important;
    }
    .wtb-bottom {
      grid-template-columns: auto 1fr !important;
    }
    .wtb-bottom .wtb-notes-spacer { display: none !important; }
    .timeline-row[draggable="true"] { cursor: default; }
    .wtb-row-card:hover {
      transform: none !important;
      box-shadow: none !important;
    }
    .wiz-step-col { padding: 0 4px; box-sizing: border-box; }
  }

  .wtb-controls-desktop { display: block; }
  .wtb-row-reorder { display: none; }

  /* Desktop: setting toggle beside event input; mobile: beside Video (see max-width rule) */
  .wtb-setting-btn--meta { display: none; }
  .wtb-setting-btn--inline { display: inline-flex; }

  .wtb-setting-btn--meta,
  .wtb-setting-btn--inline {
    align-items: center;
    justify-content: center;
    gap: 5px;
    font-size: 11px;
    font-family: 'Jost', sans-serif;
    white-space: nowrap;
    cursor: pointer;
    border-radius: 6;
    border: 1px solid #2a2520;
    flex-shrink: 0;
  }
  .wtb-setting-btn--meta {
    padding: 4px 8px;
    height: 28px;
  }

  .wtb-location-grid {
    display: grid;
    grid-template-columns: auto minmax(0, 0.85fr) minmax(0, 1fr);
    align-items: stretch;
    gap: 9px;
  }
  .wtb-location-grid .wtb-location-travel {
    width: 88px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    align-self: start;
  }
  .wtb-location-grid .wtb-location-field {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .wtb-location-grid textarea {
    flex: 1;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }

  .wtb-side-title {
    margin: 0 0 8px 0;
    text-align: center;
    font-size: 13px;
    font-weight: 300;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #b8906a;
    font-family: 'Jost', sans-serif;
  }
  .wtb-side-note {
    font-size: 11px;
    color: #6e6358;
    text-align: center;
    margin-bottom: 8px;
    font-family: 'Jost', sans-serif;
  }

  @media (min-width: 901px) {
    .wtb-palette {
      column-count: 3;
      column-gap: 10px;
    }
    @media (min-width: 1200px) { .wtb-palette { column-count: 4; } }
    @media (min-width: 1500px) { .wtb-palette { column-count: 5; } }
    .wtb-palette button {
      display: inline-block;
      width: 100%;
      padding: 8px;
      margin: 0 0 8px;
      border: 1px solid #2a2520;
      border-radius: 6px;
      text-align: left;
      font-size: 12px;
      font-family: 'Jost', sans-serif;
      cursor: grab;
      user-select: none;
      break-inside: avoid;
      -webkit-column-break-inside: avoid;
      page-break-inside: avoid;
      background: #0f0d0b;
      color: #ddd0bc;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .wtb-palette button:hover {
      border-color: #b8906a;
      box-shadow: 0 0 8px rgba(184,144,106,0.2);
    }
    .wtb-palette button:active { cursor: grabbing; }
  }

  @media (max-width: 900px) {
    .wtb-palette {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
    }
    .wtb-palette button {
      width: 100%;
      padding: 10px;
      margin: 0;
      border: 1px solid #2a2520;
      border-radius: 6px;
      text-align: left;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      font-family: 'Jost', sans-serif;
      cursor: grab;
      user-select: none;
      background: #0f0d0b;
      color: #ddd0bc;
    }
  }

  @media (max-width: 480px) {
    .wtb-toolbar-btn {
      padding: 8px 10px !important;
      font-size: 12px !important;
    }
    .wtb-row-time-col button span:first-child {
      font-size: 22px !important;
    }
  }

  .wtb-mobile-header-top {
    position: relative;
    padding: 2px 48px 6px 8px;
    margin: 0 -8px;
  }
  .wtb-mobile-gear-anchor {
    position: absolute;
    top: 2px;
    right: 0;
    z-index: 210;
  }
  .wtb-mobile-undo-dock {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 180;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    padding-bottom: max(10px, env(safe-area-inset-bottom, 0px));
    background: #0f0d0b;
    border-top: 1px solid #161310;
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.35);
  }
  .wtb-mobile-undo-dock .wtb-mobile-undo,
  .wtb-mobile-undo-dock .wtb-mobile-redo {
    flex: 1;
    justify-content: center;
    min-height: 44px;
    max-width: 200px;
  }
  .wtb-mobile-gear-btn {
    width: 40px;
    height: 36px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid #2a2520;
    border-radius: 4px;
    color: #ddd0bc;
    font-size: 20px;
    cursor: pointer;
    line-height: 1;
  }
  .wtb-mobile-gear-btn[aria-expanded="true"] {
    border-color: #b8906a;
    color: #b8906a;
  }
  .wtb-mobile-gear-menu {
    position: absolute;
    right: 0;
    top: calc(100% + 4px);
    min-width: 196px;
    background: #1a1714;
    border: 1px solid #2a2520;
    border-radius: 4px;
    z-index: 200;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
  }
  .wtb-mobile-gear-menu-item {
    display: block;
    width: 100%;
    padding: 10px 14px;
    background: none;
    border: none;
    border-bottom: 1px solid #2a2520;
    color: #ddd0bc;
    text-align: left;
    font-size: 13px;
    font-family: 'Jost', sans-serif;
    font-weight: 300;
    cursor: pointer;
    box-sizing: border-box;
  }
  .wtb-mobile-gear-menu-item:last-child {
    border-bottom: none;
  }
  .wtb-mobile-gear-menu-item:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
  .wtb-mobile-gear-menu-item--primary {
    color: #b8906a;
  }
  .wtb-mobile-undo,
  .wtb-mobile-redo {
    padding: 6px 14px;
    border: none;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 300;
    font-family: 'Jost', sans-serif;
    display: flex;
    align-items: center;
    gap: 5;
    cursor: pointer;
  }
  .wtb-mobile-undo:disabled,
  .wtb-mobile-redo:disabled {
    cursor: not-allowed;
  }
  .wtb-mobile-view-tabs {
    display: flex;
    border-bottom: 1px solid #161310;
    background: #0f0d0b;
    margin: 0 -8px;
    flex-shrink: 0;
  }
  .wtb-mobile-view-tab {
    flex: 1;
    padding: 10px 8px;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: #6e6358;
    font-size: 11px;
    font-family: 'Jost', sans-serif;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
    margin-bottom: -1px;
  }
  .wtb-mobile-view-tab.active {
    color: #b8906a;
    border-bottom-color: #b8906a;
  }
  .wtb-mobile-preview-panel {
    flex: 1;
    min-height: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    padding: 0 0 12px;
  }
  .wtb-mobile-preview-panel > div {
    flex: 1;
    min-height: 0;
  }
  .wtb-toolbar-btn {
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 300;
    font-family: 'Jost', sans-serif;
    cursor: pointer;
    white-space: nowrap;
    border: 1px solid #2a2520;
    background: transparent;
    color: #ddd0bc;
  }
  .wtb-toolbar-btn-primary {
    background: #b8906a;
    color: #060504;
    border: none;
  }
  .wtb-toolbar-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .time-range { display: flex; align-items: center; gap: 4px; }
  .time-range .time-dash { display: inline-block; margin: 0 6px; line-height: 1; }
  @media (max-width: 480px) { .time-range { justify-content: center; } }

  @media (min-width: 901px) {
    .wtb-setting-col { padding: 0 8px; }
  }

  .wtb-dropping { outline: 2px dashed #b8906a; outline-offset: -2px; }

  /* Event block hover lift */
  .wtb-row-card {
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  .wtb-row-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(184,144,106,0.12) !important;
  }
  .wtb-row-card.wtb-deleting {
    pointer-events: none;
  }

  @keyframes wtb-delete {
    /* Vigorous shake: 0–25% (0–0.5 s), 8 full oscillations */
    0%    { transform: translateX(0)     scale(1); opacity: 1; }
    1.5%  { transform: translateX(-22px) scale(1); }
    3%    { transform: translateX( 22px) scale(1); }
    4.5%  { transform: translateX(-22px) scale(1); }
    6%    { transform: translateX( 22px) scale(1); }
    7.5%  { transform: translateX(-22px) scale(1); }
    9%    { transform: translateX( 22px) scale(1); }
    10.5% { transform: translateX(-22px) scale(1); }
    12%   { transform: translateX( 22px) scale(1); }
    13.5% { transform: translateX(-18px) scale(1); }
    15%   { transform: translateX( 18px) scale(1); }
    16.5% { transform: translateX(-18px) scale(1); }
    18%   { transform: translateX( 18px) scale(1); }
    19.5% { transform: translateX(-12px) scale(1); }
    21%   { transform: translateX( 12px) scale(1); }
    22.5% { transform: translateX( -6px) scale(1); }
    24%   { transform: translateX(  6px) scale(1); }
    25%   { transform: translateX(0)     scale(1); opacity: 1; }
    /* Shrink to nothing: 25–100% (0.5–2 s) */
    100%  { transform: translateX(0)     scale(0); opacity: 0; }
  }

  /* Wizard layout */
  .wiz-layout {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 8px;
  }
  .wiz-mascot-col { width: 160px; margin-bottom: 8px; }
  .wiz-step-col { width: 100%; }

  @media (min-width: 901px) {
    .wiz-layout {
      flex-direction: row;
      align-items: flex-start;
      justify-content: center;
      gap: 28px;
      padding: 0 16px;
    }
    .wiz-mascot-col {
      width: 200px;
      flex-shrink: 0;
      position: sticky;
      top: 20px;
      margin-bottom: 0;
    }
    .wiz-step-col { flex: 1; max-width: 600px; }
  }

  @keyframes wiz-bob {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-8px); }
  }
  @keyframes wiz-shake {
    0%, 100% { transform: translateX(0); }
    20%      { transform: translateX(-10px); }
    40%      { transform: translateX(10px); }
    60%      { transform: translateX(-7px); }
    80%      { transform: translateX(7px); }
  }
  @keyframes wiz-hop {
    0%   { transform: translateY(0) scale(1); }
    35%  { transform: translateY(-20px) scale(1.08); }
    65%  { transform: translateY(-20px) scale(1.08); }
    100% { transform: translateY(0) scale(1); }
  }
  @keyframes wiz-pulse {
    0%, 100% { transform: scale(1); }
    50%      { transform: scale(1.18); }
  }
  @keyframes wiz-spin {
    0%   { transform: rotate(0deg) scale(1); }
    50%  { transform: rotate(180deg) scale(1.1); }
    100% { transform: rotate(360deg) scale(1); }
  }
  @keyframes gold-shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes fade-up {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes wiz-fade {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  .wiz-bob   { animation: wiz-bob   2.4s ease-in-out infinite; }
  .wiz-shake { animation: wiz-shake 0.5s ease-in-out; }
  .wiz-hop   { animation: wiz-hop   0.55s ease-out; }
  .wiz-pulse { animation: wiz-pulse 0.4s ease-in-out 2; }
  .wiz-spin  { animation: wiz-spin  0.8s ease-in-out; }
  .wiz-step-fade { animation: wiz-fade 0.3s ease; }

  .generate-btn {
    background: linear-gradient(90deg, #b8906a, #cfa882, #b8906a);
    background-size: 200% auto;
    transition: background-position 0.4s ease, box-shadow 0.2s ease;
  }
  .generate-btn:hover {
    background-position: right center;
    box-shadow: 0 0 24px rgba(184,144,106,0.45);
  }

  .welcome-fade-up { animation: fade-up 0.6s ease both; }
  .welcome-fade-up:nth-child(2) { animation-delay: 0.15s; }
  .welcome-fade-up:nth-child(3) { animation-delay: 0.3s; }

  @media (prefers-reduced-motion: reduce) {
    .wiz-bob, .wiz-shake, .wiz-hop, .wiz-pulse, .wiz-spin,
    .generate-btn, .welcome-fade-up { animation: none !important; transform: none !important; }
  }

  .wtb-tabs {
    display: flex;
    border-bottom: 1px solid #1e1c19;
    margin: -12px -12px 8px;
  }
  .wtb-tab-btn {
    flex: 1;
    padding: 9px 4px;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: #6e6358;
    font-size: 10px;
    font-family: 'Jost', sans-serif;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
    margin-bottom: -1px;
    transition: color 0.15s, border-color 0.15s;
  }
  .wtb-tab-btn.active { color: #b8906a; border-bottom-color: #b8906a; }
  .wtb-tab-btn:hover:not(.active) { color: #ddd0bc; }
`;

/* ---------------- helpers ---------------- */
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

function computeOverlaps(rows) {
  // Returns Map<id, string> — each overlapping row ID mapped to the name it conflicts with.
  // TIME CONSTRAINT blocks (duration 0) are excluded.
  const sorted = [...rows]
    .filter(r => r.type !== "constraint")
    .sort((a, b) => a.time - b.time);
  const result = new Map();
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    if (curr.time < prev.time + prev.duration) {
      if (!result.has(curr.id)) result.set(curr.id, prev.event || "previous event");
      if (!result.has(prev.id)) result.set(prev.id, curr.event || "next event");
    }
  }
  return result;
}

const SETTINGS_WIZARD_TABS = [
  { label: "Wedding Details", step: 1 },
  { label: "Locations",       step: 2 },
  { label: "Package",         step: 3 },
  { label: "Pre-Ceremony",    step: 4 },
  { label: "First Looks",     step: 5 },
  { label: "Ceremony",        step: 6 },
  { label: "Portraits",       step: 8 },
  { label: "Reception",       step: 9 },
  { label: "Draft",           step: 99 },
];

/* ---------------- Time Popover ---------------- */
function TimePopover({ open, value, onSet, onClose }) {
  const [hh, setHh] = useState("12");
  const [mm, setMm] = useState("00");
  const [ap, setAp] = useState("PM");

  useEffect(() => {
    if (open && value) {
      setHh(value.hour?.toString() || "12");
      const rawMin = parseInt(value.minute, 10) || 0;
      const snapped = Math.round(rawMin / 5) * 5 % 60;
      setMm(String(snapped).padStart(2, "0"));
      setAp(value.period || "PM");
    }
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const minutes = Array.from({ length: 12 }, (_, i) =>
    String(i * 5).padStart(2, "0")
  );

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.75)",
          zIndex: 1000,
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 260,
          maxWidth: "90vw",
          background: "#0f0d0b",
          border: "1px solid #2a2520",
          borderRadius: 10,
          padding: 12,
          zIndex: 1001,
          boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            marginBottom: 10,
          }}
        >
          <select
            value={hh}
            onChange={(e) => setHh(e.target.value)}
            style={{
              width: 64,
              height: 32,
              fontSize: 14,
              border: '1px solid #2a2520',
              borderRadius: 6,
              background: '#0f0d0b',
              color: '#ddd0bc',
              cursor: 'pointer',
            }}
          >
            {hours.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
          <span style={{ fontSize: 16, lineHeight: "32px", color: "#ddd0bc" }}>:</span>
          <select
            value={mm}
            onChange={(e) => setMm(e.target.value)}
            style={{
              width: 64,
              height: 32,
              fontSize: 14,
              border: '1px solid #2a2520',
              borderRadius: 6,
              background: '#0f0d0b',
              color: '#ddd0bc',
              cursor: 'pointer',
            }}
          >
            {minutes.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={ap}
            onChange={(e) => setAp(e.target.value)}
            style={{
              width: 70,
              height: 32,
              fontSize: 14,
              border: '1px solid #2a2520',
              borderRadius: 6,
              background: '#0f0d0b',
              color: '#ddd0bc',
              cursor: 'pointer',
            }}
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              padding: "6px 10px",
              border: "1px solid #2a2520",
              background: "#161310",
              color: "#ddd0bc",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSet?.(hh, mm, ap)}
            style={{
              padding: "6px 12px",
              border: "1px solid #b8906a",
              background: "#b8906a",
              color: "#060504",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: "bold",
            }}
          >
            Set
          </button>
        </div>
      </div>
    </>
  );
}

/* ---------------- Event Selector (existing popup) ---------------- */
function EventBlockSelector({ isVisible, onSelect, onClose, currentEvent, currentTime }) {
  const [customEvent, setCustomEvent] = useState(currentEvent || "");
  const [customDuration, setCustomDuration] = useState("30");
  const [timeHour, setTimeHour] = useState("12");
  const [timeMinute, setTimeMinute] = useState("00");
  const [timePeriod, setTimePeriod] = useState("PM");

  useEffect(() => {
    if (isVisible) {
      setCustomEvent(currentEvent || "");
      if (currentTime) {
        const timeFormatted = formatTime(currentTime);
        setTimeHour(timeFormatted.hour);
        setTimeMinute(timeFormatted.minute);
        setTimePeriod(timeFormatted.period);
      }
    }
  }, [isVisible, currentEvent, currentTime]);

  const isValidDuration =
    /\d+/.test(customDuration) && parseInt(customDuration, 10) > 0;

  const handleCustomEventSubmit = () => {
    if (!customEvent.trim() || !isValidDuration) return;
    const newTime = parseTimeInput(timeHour, timeMinute, timePeriod);
    onSelect({
      event: customEvent.trim(),
      duration: parseInt(customDuration, 10),
      time: newTime,
      type: "custom",
    });
  };

  const normalizeCustomDuration = () => {
    if (customDuration === "") return;
    const n = parseInt(customDuration, 10);
    if (isNaN(n) || n <= 0) setCustomDuration("");
    else setCustomDuration(String(n));
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.85)",
        zIndex: 1100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          backgroundColor: "#0f0d0b",
          border: "1px solid #2a2520",
          borderRadius: 8,
          padding: 20,
          maxHeight: "80vh",
          overflowY: "auto",
          width: "100%",
          maxWidth: 500,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            background: "#060504",
            borderBottom: "1px solid #2a2520",
            margin: "-20px -20px 20px -20px",
            padding: "16px 20px",
          }}
        >
          <h3 style={{ margin: 0, color: "#ddd0bc", fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400 }}>Select or Create Event</h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 24,
              cursor: "pointer",
              color: "#6e6358",
            }}
          >
            ×
          </button>
        </div>

        {/* Custom Event */}
        <div
          style={{
            marginBottom: 20,
            padding: 15,
            backgroundColor: "#161310",
            borderRadius: 8,
            border: "1px solid #2a2520",
          }}
        >
          <h4 style={{ margin: "0 0 10px 0", color: "#ddd0bc", fontFamily: "'Jost', sans-serif", fontWeight: 400, letterSpacing: "0.1em", textTransform: "uppercase", fontSize: 11 }}>
            Create Custom Event
          </h4>
          <div style={{ marginBottom: 10 }}>
            <label
              style={{
                display: "block",
                marginBottom: 5,
                fontSize: 12,
                color: "#6e6358",
                fontFamily: "'Jost', sans-serif",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Event Name:
            </label>
            <input
              type="text"
              value={customEvent}
              onChange={(e) => setCustomEvent(e.target.value)}
              placeholder="Enter custom event name..."
              style={{
                width: "100%",
                padding: 8,
                border: "1px solid #2a2520",
                borderRadius: 4,
                fontSize: 14,
                background: "#0f0d0b",
                color: "#ddd0bc",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 20, marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 5,
                  fontSize: 12,
                  color: "#6e6358",
                  fontFamily: "'Jost', sans-serif",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Start Time:
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <select
                  value={timeHour}
                  onChange={(e) => setTimeHour(e.target.value)}
                  style={{
                    width: 64,
                    height: 32,
                    fontSize: 14,
                    border: '1px solid #2a2520',
                    borderRadius: 4,
                    background: '#0f0d0b',
                    color: '#ddd0bc',
                    cursor: 'pointer',
                  }}
                >
                  {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: 16, color: "#ddd0bc" }}>:</span>
                <select
                  value={timeMinute}
                  onChange={(e) => setTimeMinute(e.target.value)}
                  style={{
                    width: 64,
                    height: 32,
                    fontSize: 14,
                    border: '1px solid #2a2520',
                    borderRadius: 4,
                    background: '#0f0d0b',
                    color: '#ddd0bc',
                    cursor: 'pointer',
                  }}
                >
                  {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value)}
                  style={{
                    width: 70,
                    height: 32,
                    fontSize: 14,
                    border: '1px solid #2a2520',
                    borderRadius: 4,
                    background: '#0f0d0b',
                    color: '#ddd0bc',
                    cursor: 'pointer',
                  }}
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
            <div style={{ minWidth: 120 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 5,
                  fontSize: 12,
                  color: "#6e6358",
                  fontFamily: "'Jost', sans-serif",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Duration (minutes):
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={customDuration}
                onChange={(e) =>
                  setCustomDuration(e.target.value.replace(/\D/g, ""))
                }
                onBlur={normalizeCustomDuration}
                placeholder="e.g. 30"
                style={{
                  width: 100,
                  height: 32,
                  padding: 8,
                  border: "1px solid #2a2520",
                  borderRadius: 4,
                  fontSize: 14,
                  background: "#0f0d0b",
                  color: "#ddd0bc",
                }}
              />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              onClick={handleCustomEventSubmit}
              disabled={!customEvent.trim() || !isValidDuration}
              style={{
                padding: "10px 20px",
                backgroundColor:
                  customEvent.trim() && isValidDuration ? "#b8906a" : "#2a2520",
                color: customEvent.trim() && isValidDuration ? "#060504" : "#6e6358",
                border: "none",
                borderRadius: 4,
                cursor:
                  customEvent.trim() && isValidDuration
                    ? "pointer"
                    : "not-allowed",
                fontSize: 14,
                fontWeight: "bold",
                fontFamily: "'Jost', sans-serif",
              }}
            >
              Use Custom Event
            </button>
          </div>
        </div>

        <div style={{ marginBottom: 10, color: "#b8906a", fontFamily: "'Jost', sans-serif", letterSpacing: "0.15em", textTransform: "uppercase", fontSize: 11 }}>
          Or Select Preset Event:
        </div>

        {(() => {
          const groups = [];
          const groupMap = {};
          EVENT_BLOCKS.forEach(block => {
            const [label, duration] = block.split("::");
            const sep = label.indexOf(": ");
            const category   = sep !== -1 ? label.substring(0, sep) : label;
            const shortLabel = sep !== -1 ? label.substring(sep + 2) : label;
            if (!groupMap[category]) { groupMap[category] = []; groups.push(category); }
            groupMap[category].push({ label, shortLabel, duration: parseInt(duration, 10), block });
          });
          return groups.map(category => (
            <div key={category} style={{ breakInside: "avoid", WebkitColumnBreakInside: "avoid" }}>
              <div style={{ fontSize: 10, color: getEventColor(groupMap[category][0].label), textTransform: "uppercase", letterSpacing: "0.12em", margin: "10px 0 4px", fontFamily: "'Jost', sans-serif", fontWeight: 400, borderTop: "1px solid #1e1c19", paddingTop: 8, textAlign: "center" }}>{category}</div>
              {groupMap[category].map(({ label, shortLabel, duration, block }) => (
                <button
                  key={block}
                  onClick={() => {
                    const newTime = parseTimeInput(timeHour, timeMinute, timePeriod);
                    onSelect({ event: label, duration, time: newTime });
                  }}
                  style={{ width: "100%", padding: 12, margin: "4px 0", backgroundColor: "#0f0d0b", border: `2px solid ${getEventColor(label)}`, borderRadius: 8, cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14, fontWeight: 500, color: "#ddd0bc" }}
                >
                  <span>{shortLabel}</span>
                  <span style={{ fontSize: 12, color: "#6e6358", fontWeight: "bold", marginLeft: "16px", whiteSpace: "nowrap" }}>{duration} min</span>
                </button>
              ))}
            </div>
          ));
        })()}
      </div>
    </div>
  );
}

/* ---------------- Add Row Button ---------------- */
function AddRowButton({ onClick, isLast }) {
  if (isLast) return null;
  
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center',
      margin: '8px 0',
      position: 'relative',
      zIndex: 1
    }}>
      <button
        onClick={onClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: '20px',
          border: '1px dashed #b8906a',
          background: 'transparent',
          color: '#b8906a',
          fontSize: '13px',
          fontWeight: 300,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          fontFamily: "'Jost', sans-serif",
        }}
        title="Add new event here"
      >
        <span style={{ fontSize: '16px', lineHeight: '16px' }}>+</span>
        <span>Add Event</span>
      </button>
    </div>
  );
}

/* ---------------- Color Picker ---------------- */
function ColorPicker({ currentColor, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef(null);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const displayColor = currentColor || "#ffffff";
  const autoMode = !currentColor;

  return (
    <div ref={pickerRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Row Color"
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          border: "2px solid #666",
          backgroundColor: displayColor,
          cursor: "pointer",
          padding: 0,
          position: "relative",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        }}
      >
        {autoMode && (
          <span
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: 10,
              fontWeight: "bold",
            }}
          >
            A
          </span>
        )}
        {/* Palette indicator icon */}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          style={{
            position: "absolute",
            bottom: -1,
            right: -1,
            filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))",
            pointerEvents: "none",
          }}
        >
          <circle cx="12" cy="12" r="11" fill="white" />
          <path
            d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c.55 0 1-.45 1-1 0-.25-.09-.48-.24-.65-.16-.18-.26-.42-.26-.7 0-.55.45-1 1-1h1.5c3.04 0 5.5-2.46 5.5-5.5C20.5 6.35 16.76 2 12 2zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 8 6.5 8s1.5.67 1.5 1.5S7.33 11 6.5 11zm3-4C8.67 7 8 6.33 8 5.5S8.67 4 9.5 4s1.5.67 1.5 1.5S10.33 7 9.5 7zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 4 14.5 4s1.5.67 1.5 1.5S15.33 7 14.5 7zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 8 17.5 8s1.5.67 1.5 1.5S18.33 11 17.5 11z"
            fill="#333"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: 4,
            backgroundColor: "#0f0d0b",
            border: "1px solid #2a2520",
            borderRadius: 8,
            padding: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,0.6)",
            zIndex: 1000,
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: 6,
            width: 200,
          }}
        >
          {/* Auto option */}
          <button
            type="button"
            onClick={() => {
              onChange("");
              setIsOpen(false);
            }}
            title="Auto color"
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              border: autoMode ? "3px solid #b8906a" : "2px solid #2a2520",
              backgroundColor: "#161310",
              color: "#ddd0bc",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: "bold",
            }}
          >
            A
          </button>

          {/* Color palette */}
          {COLOR_PALETTE.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => {
                onChange(color.value);
                setIsOpen(false);
              }}
              title={color.name}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                border:
                  currentColor === color.value
                    ? "3px solid #b8906a"
                    : "2px solid #0f0d0b",
                backgroundColor: color.value,
                cursor: "pointer",
                padding: 0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Timeline Row ---------------- */
function TimelineRow({
  row,
  index,
  onChange,
  onBlur,
  onDelete,
  onEventClick,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  onEventBlur,
  onTimeSet,
  photoEnabledGlobal,
  videoEnabledGlobal,
  onDropEventBlock,
  onDrop,
  overlapWith,
  isMobile = false,
}) {
  const t = formatTime(row.time);
  const timeBtnRef = useRef(null);
  const cardRef = useRef(null);
  const [timeOpen, setTimeOpen] = useState(false);
  const [dropping, setDropping] = useState(false);
  const [showOverlapTip, setShowOverlapTip] = useState(false);
  const [deleteHovered, setDeleteHovered] = useState(false);
  const [deletePending, setDeletePending] = useState(false);
  const deleteTimerRef = useRef(null);
  useEffect(() => () => clearTimeout(deleteTimerRef.current), []);

  // Drop handlers on the whole row
  const allowDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) {
      // Prefer copy for event blocks, move for row reordering
      if (e.dataTransfer.types?.includes("application/json")) {
        e.dataTransfer.dropEffect = "copy";
      } else {
        e.dataTransfer.dropEffect = "move";
      }
    }
    // Only show the dropping indicator for event blocks from the sidebar
    if (e.dataTransfer?.types?.includes("application/json")) {
      setDropping(true);
    }
  };
  
  const leaveDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDropping(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDropping(false);
    
    try {
      // First try to get application/json data (for event blocks)
      const jsonData = e.dataTransfer.getData("application/json");
      if (jsonData) {
        try {
          const data = JSON.parse(jsonData);
          if (data && typeof data.duration === "number") {
            onDropEventBlock?.(data);
            return;
          }
        } catch (parseError) {
          console.error("Error parsing JSON data:", parseError);
        }
      }
      
      // Then try text/plain (for row reordering)
      const rowId = e.dataTransfer.getData("text/plain");
      if (rowId && onDrop) {
        // Pass the TARGET row id (this row) to the parent so it can reorder correctly
        onDrop(e, row.id);
      }
    } catch (error) {
      console.error("Error handling drop:", error);
    }
  };

  const isLocation = row.type === "location";
  const isConstraint = row.type === "constraint";
  // Location blocks are always gray; constraint blocks are transparent with stripe; event blocks use custom or category color
  const rowBg = isConstraint ? "transparent" : isLocation ? "#b8906a" : (row.color || getEventColor(row.event || "", "#ffffff"));

  return (
    <div
      onDragOver={allowDrop}
      onDragEnter={allowDrop}
      onDragLeave={leaveDrop}
      onDrop={handleDrop}
      ref={cardRef}
      className={`wtb-row-card${dropping ? " wtb-dropping" : ""}${deletePending ? " wtb-deleting" : ""}`}
      style={{
        border: deletePending ? "2px solid #cc4444" : dropping ? "2px dashed #b8906a" : isConstraint ? "2px solid #cc4444" : isLocation ? "2px solid #b8906a" : `2px solid ${rowBg}`,
        borderRadius: 8,
        marginBottom: 12,
        backgroundColor: isLocation ? "#f5f0e8" : isConstraint ? "transparent" : (dropping ? "rgba(184,144,106,0.08)" : "#0f0d0b"),
        backgroundImage: isConstraint ? "repeating-linear-gradient(45deg, #1a0505 0px, #1a0505 10px, #230808 10px, #230808 20px)" : "none",
        overflow: "hidden",
        width: "100%",
        position: "relative",
        minHeight: "60px",
        display: "flex",
      }}
      title={dropping ? "Drop here to add event" : ""}
    >
      {/* Drag handle (desktop) / reorder buttons (mobile) */}
      <div
        className="wtb-drag-handle"
        style={{
          width: 36,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "grab",
          borderRight: isLocation ? "1px solid #c8bfb0" : "1px solid #2a2520",
          background: isLocation ? "#c4b8a0" : "#1e1a16",
          color: isLocation ? "#6e5c3e" : "#7a6a58",
          fontSize: 22,
          userSelect: "none",
          lineHeight: 1,
        }}
        title="Drag to reorder"
      >
        ⠿
      </div>
      <div className="wtb-row-reorder" aria-label="Reorder row">
        <button
          type="button"
          disabled={isFirst}
          onClick={() => onMoveUp?.(index)}
          title="Move up"
          aria-label="Move up"
        >
          ↑
        </button>
        <button
          type="button"
          disabled={isLast}
          onClick={() => onMoveDown?.(index)}
          title="Move down"
          aria-label="Move down"
        >
          ↓
        </button>
      </div>

      {/* Card content wrapper */}
      <div style={{ flex: 1, minWidth: 0, overflow: "hidden", position: "relative" }}>

      {/* Overlap warning badge — centered at top of card */}
      {overlapWith && (
        <div
          style={{ position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)", zIndex: 20 }}
          onMouseEnter={() => setShowOverlapTip(true)}
          onMouseLeave={() => setShowOverlapTip(false)}
        >
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "#cc2222", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: "bold", cursor: "default",
            boxShadow: "0 2px 6px rgba(0,0,0,0.45)",
            userSelect: "none", lineHeight: 1,
          }}>!</div>
          {showOverlapTip && (
            <div style={{
              position: "absolute", top: 40, left: "50%", transform: "translateX(-50%)",
              background: "#1c1816", color: "#f0ece6",
              fontSize: 11, padding: "5px 9px", borderRadius: 4,
              width: 210, lineHeight: 1.5,
              boxShadow: "0 2px 8px rgba(0,0,0,0.55)",
              border: "1px solid #cc4444",
              pointerEvents: "none", whiteSpace: "normal",
            }}>
              Overlaps with &ldquo;{overlapWith}&rdquo;. Overlapping events are allowed but may indicate a scheduling conflict.
            </div>
          )}
        </div>
      )}
      {/* TOP row: Time | Event (+photo/video) */}
      <div
        className="wtb-row-top"
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          padding: 6,
          backgroundColor: isConstraint ? "rgba(180,0,0,0.12)" : isLocation ? "#ede7da" : "#0f0d0b",
          borderBottom: isLocation ? "1px solid #c8bfb0" : "1px solid #1e1c19",
          gap: 9,
          alignItems: "center",
        }}
      >
        <div className="wtb-row-time-col">
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
            <label
              style={{
                fontSize: 10,
                color: isLocation ? "#7a6548" : "#6e6358",
                fontFamily: "'Jost', sans-serif",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Time
            </label>
          </div>
          <button
            ref={timeBtnRef}
            onClick={() => setTimeOpen(true)}
            style={{
              width: 88,
              padding: "4px 6px",
              textAlign: "center",
              border: isLocation ? "1px solid #c8bfb0" : "1px solid #2a2520",
              background: "transparent",
              color: isLocation ? "#1e140a" : "#ddd0bc",
              borderRadius: 4,
              cursor: "pointer",
              fontFamily: "'Cormorant Garamond', serif",
              lineHeight: 1,
            }}
            title="Click to set time"
          >
            <span style={{ fontSize: 26, fontWeight: 300, display: "block" }}>{t.hour}:{t.minute}</span>
            <span style={{ fontSize: 11, letterSpacing: "0.1em", opacity: 0.75 }}>{t.period}</span>
          </button>
        </div>

        <div>
          {isConstraint ? (
            <div style={{ fontSize: 14, fontWeight: "bold", color: "#ff6b6b", padding: "8px 0" }}>
              ⚠️ TIME CONSTRAINT
            </div>
          ) : isLocation ? (
            <>
              <label style={{ fontSize: 10, color: "#7a6548", display: "block", marginBottom: 4, fontFamily: "'Jost', sans-serif", letterSpacing: "0.12em", textTransform: "uppercase" }}>📍 Location Name</label>
              <input
                type="text"
                placeholder="Location name..."
                value={row.event || ""}
                onChange={(e) => onChange(index, "event", e.target.value)}
                onBlur={() => onBlur(index)}
                onDragOver={allowDrop}
                onDragEnter={allowDrop}
                onDragLeave={leaveDrop}
                onDrop={handleDrop}
                style={{
                  width: "100%",
                  fontSize: 14,
                  padding: 8,
                  background: "transparent",
                  border: "1px solid #c8bfb0",
                  color: "#1e140a",
                  borderRadius: 4,
                  fontFamily: "'Jost', sans-serif",
                }}
              />
            </>
          ) : (
            <>
              <div
                className="wtb-event-meta"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 4,
                }}
              >
                <label style={{ fontSize: 10, color: "#6e6358", fontFamily: "'Jost', sans-serif", letterSpacing: "0.12em", textTransform: "uppercase" }}>Event</label>
                <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                  <label
                    style={{
                      fontSize: 12,
                      display: "flex",
                      gap: 5,
                      alignItems: "center",
                      color: photoEnabledGlobal ? "#ddd0bc" : "#6e6358",
                      opacity: photoEnabledGlobal ? 1 : 0.5,
                      cursor: photoEnabledGlobal ? "pointer" : "default",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!row.photo}
                      onChange={(e) => onChange(index, "photo", e.target.checked)}
                      onBlur={() => onBlur(index)}
                      disabled={!photoEnabledGlobal}
                    />
                    Photo
                  </label>
                  <label
                    style={{
                      fontSize: 12,
                      display: "flex",
                      gap: 5,
                      alignItems: "center",
                      color: videoEnabledGlobal ? "#ddd0bc" : "#6e6358",
                      opacity: videoEnabledGlobal ? 1 : 0.5,
                      cursor: videoEnabledGlobal ? "pointer" : "default",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!row.video}
                      onChange={(e) => onChange(index, "video", e.target.checked)}
                      onBlur={() => onBlur(index)}
                      disabled={!videoEnabledGlobal}
                    />
                    Video
                  </label>
                  <button
                    type="button"
                    className="wtb-setting-btn--meta"
                    onClick={() => { onChange(index, "isOutdoor", !row.isOutdoor); onBlur(index); }}
                    aria-pressed={row.isOutdoor}
                    title={row.isOutdoor ? "Outside — click for Indoors" : "Indoors — click for Outside"}
                    style={{
                      background: row.isOutdoor ? "#2a6fd4" : "#c96a20",
                      color: "#f0ece6",
                    }}
                  >
                    <span aria-hidden style={{ fontSize: 13, lineHeight: 1 }}>{row.isOutdoor ? "☀️" : "💡"}</span>
                    <span>{row.isOutdoor ? "Outside" : "Indoors"}</span>
                  </button>
                  {row.type === "custom" && (
                    <ColorPicker
                      currentColor={row.color}
                      onChange={(color) => {
                        onChange(index, "color", color);
                        onBlur(index);
                      }}
                    />
                  )}
                </div>
              </div>
              <div className="wtb-event-input-row" style={{ display: "flex", gap: 6, alignItems: "stretch" }}>
                <input
                  type="text"
                  placeholder={isMobile ? "Tap to select an event…" : "Click to select or drop an event..."}
                  value={row.event}
                  onChange={(e) => onChange(index, "event", e.target.value)}
                  onBlur={() => {
                    onBlur(index);
                    onEventBlur && onEventBlur(index);
                  }}
                  onClick={() => onEventClick(index)}
                  onDragOver={allowDrop}
                  onDragEnter={allowDrop}
                  onDragLeave={leaveDrop}
                  onDrop={handleDrop}
                  style={{
                    flex: 1,
                    fontSize: 14,
                    padding: 8,
                    background: "transparent",
                    border: "1px solid #2a2520",
                    color: rowBg && rowBg !== "#ffffff" ? rowBg : "#ddd0bc",
                    borderRadius: 4,
                    cursor: "pointer",
                    fontFamily: "'Jost', sans-serif",
                  }}
                />
                <button
                  type="button"
                  className="wtb-setting-btn--inline"
                  onClick={() => { onChange(index, "isOutdoor", !row.isOutdoor); onBlur(index); }}
                  aria-pressed={row.isOutdoor}
                  title={row.isOutdoor ? "Outside — click for Indoors" : "Indoors — click for Outside"}
                  style={{
                    width: 80,
                    border: "1px solid #2a2520",
                    background: row.isOutdoor ? "#2a6fd4" : "#c96a20",
                    color: "#f0ece6",
                    alignSelf: "stretch",
                  }}
                >
                  <span aria-hidden style={{ fontSize: 13, lineHeight: 1 }}>{row.isOutdoor ? "☀️" : "💡"}</span>
                  <span>{row.isOutdoor ? "Outside" : "Indoors"}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

        <button
          onClick={() => {
            if (!deletePending) {
              setDeletePending(true);
              if (cardRef.current) {
                cardRef.current.style.animation = "none";
                void cardRef.current.offsetHeight;
                cardRef.current.style.animation = "wtb-delete 2s ease-in forwards";
              }
              deleteTimerRef.current = setTimeout(() => onDelete(index), 2000);
            }
          }}
          onMouseEnter={() => setDeleteHovered(true)}
          onMouseLeave={() => setDeleteHovered(false)}
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            width: 22,
            height: 22,
            padding: 0,
            fontSize: 18,
            border: deleteHovered ? "1px solid #e05252" : "1px solid transparent",
            background: "none",
            color: "#e05252",
            cursor: deletePending ? "default" : "pointer",
            borderRadius: 4,
            lineHeight: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "color 0.15s",
            zIndex: 1,
          }}
          title="Delete"
        >
          ×
        </button>

      {isConstraint ? (
        /* BOTTOM: Constraint block — notes only */
        <div style={{ padding: 8, backgroundColor: "rgba(180,0,0,0.08)" }}>
          <label style={{ fontSize: 10, color: "#ff6b6b", display: "block", marginBottom: 4, fontFamily: "'Jost', sans-serif", letterSpacing: "0.12em", textTransform: "uppercase" }}>Conflict Notes</label>
          <textarea
            value={row.notes || ""}
            onChange={(e) => onChange(index, "notes", e.target.value)}
            onBlur={() => onBlur(index)}
            rows={3}
            style={{ width: "100%", boxSizing: "border-box", fontSize: 13, padding: 8, resize: "vertical", background: "transparent", border: "1px solid #cc4444", borderRadius: 4, color: "#ff6b6b" }}
          />
        </div>
      ) : isLocation ? (
        /* BOTTOM: Location block — Travel time | Address | Notes */
        <div
          className="wtb-location-grid"
          style={{
            padding: "8px 8px 8px 6px",
            background: "#f5f0e8",
          }}
        >
          <div className="wtb-location-travel">
            <label style={{ fontSize: 10, color: "#7a6548", display: "block", marginBottom: 4, fontFamily: "'Jost', sans-serif", letterSpacing: "0.12em", textTransform: "uppercase", width: "100%", textAlign: "center" }}>Travel time</label>
            <div style={{ position: "relative", width: 65 }}>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={row.duration}
                onChange={(e) => { const val = e.target.value.replace(/[^0-9]/g, ""); onChange(index, "duration", val); }}
                onBlur={() => onBlur(index)}
                style={{ width: "100%", fontSize: 14, padding: "6px 34px 6px 12px", textAlign: "left", border: "1px solid #c8bfb0", borderRadius: 6, boxSizing: "border-box", background: "rgba(255,255,255,0.5)", color: "#1e140a" }}
              />
              <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#7a6548", pointerEvents: "none" }}>min</span>
            </div>
          </div>

          <div className="wtb-location-field">
            <label style={{ fontSize: 10, color: "#7a6548", display: "block", marginBottom: 4, fontFamily: "'Jost', sans-serif", letterSpacing: "0.12em", textTransform: "uppercase" }}>Address</label>
            <textarea
              placeholder="Address..."
              value={row.address || ""}
              onChange={(e) => onChange(index, "address", e.target.value)}
              onBlur={(e) => { onBlur(index); e.target.scrollTop = 0; }}
              rows={3}
              style={{ fontSize: 14, padding: 8, resize: "vertical", background: "rgba(255,255,255,0.5)", border: "1px solid #c8bfb0", borderRadius: 4, color: "#1e140a" }}
            />
          </div>

          <div className="wtb-location-field">
            <label style={{ fontSize: 10, color: "#7a6548", display: "block", marginBottom: 4, fontFamily: "'Jost', sans-serif", letterSpacing: "0.12em", textTransform: "uppercase" }}>Notes</label>
            <textarea
              placeholder="Add any notes for this location..."
              value={row.notes || ""}
              onChange={(e) => onChange(index, "notes", e.target.value)}
              onBlur={() => onBlur(index)}
              rows={3}
              style={{ fontSize: 13, padding: 8, resize: "vertical", background: "rgba(255,255,255,0.5)", border: "1px solid #c8bfb0", borderRadius: 4, color: "#1e140a" }}
            />
          </div>
        </div>
      ) : (
        /* BOTTOM: Event block — Duration | Notes */
        <div
          className="wtb-bottom"
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            padding: "8px 8px 8px 6px",
            gap: 9,
            alignItems: "start",
          }}
        >
          <div style={{ width: 88, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <label
              style={{
                fontSize: 10,
                color: "#6e6358",
                display: "block",
                marginBottom: 4,
                fontFamily: "'Jost', sans-serif",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Duration
            </label>
            <div style={{ position: "relative", width: 65 }}>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={row.duration}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  onChange(index, "duration", val);
                }}
                onBlur={() => onBlur(index)}
                style={{
                  width: "100%",
                  fontSize: 14,
                  padding: "6px 34px 6px 12px",
                  textAlign: "left",
                  border: "1px solid #2a2520",
                  borderRadius: 4,
                  boxSizing: "border-box",
                  background: "transparent",
                  color: "#ddd0bc",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 12,
                  color: "#6e6358",
                  pointerEvents: "none",
                }}
              >
                mins
              </span>
            </div>
          </div>

          <div className="wtb-location">
            <label
              style={{
                fontSize: 10,
                color: "#6e6358",
                display: "block",
                marginBottom: 4,
                fontFamily: "'Jost', sans-serif",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Notes
            </label>
            <div style={{ display: "flex", gap: 6 }}>
              <textarea
                placeholder="Add any notes for this event... (drag corner to expand)"
                value={row.notes || ""}
                onChange={(e) => onChange(index, "notes", e.target.value)}
                onBlur={() => onBlur(index)}
                rows={2}
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontSize: 14,
                  padding: 8,
                  resize: "vertical",
                  background: "transparent",
                  border: "1px solid #2a2520",
                  borderRadius: 4,
                  color: "#ddd0bc",
                  fontFamily: "'Jost', sans-serif",
                }}
              />
              <div className="wtb-notes-spacer" style={{ width: 80, flexShrink: 0 }} />
            </div>
          </div>
        </div>
      )}

      {/* Time popover */}
      {timeOpen && (
        <TimePopover
          open={timeOpen}
          value={t}
          onSet={(h, m, p) => {
            onTimeSet(h, m, p);
            setTimeOpen(false);
          }}
          onClose={() => setTimeOpen(false)}
        />
      )}
      </div>{/* end content wrapper */}
    </div>
  );
}

/* ─── Timeline Preview ────────────────────────────────────────────── */
// All measurements in PDF points (72 pt = 1 inch) so the HTML preview
// and jsPDF output share the same coordinate system.
const PW = 612, PH = 792;          // US Letter
const MX = 38, MY_TOP = 48, MY_BOT = 36;
const CW = PW - 2 * MX;           // 536
const RH_COL  = 18;  // column-header row
const RH_EVT  = 22;  // event row (no notes)
const RH_NOTE = 13;  // per wrapped note line
const RH_LOC  = 46;  // location block
const RH_CON  = 32;  // constraint block
const RH_GAP  = 3;   // gap after each row
const HDR_H   = 122; // first-page header height
const FTR_H   = 22;  // footer height
const COL_TIME = 66, COL_DUR = 34, COL_SET = 28;

function previewRowH(row) {
  if (!row) return RH_EVT + RH_GAP;
  if (row.type === 'location') return RH_LOC + RH_GAP;
  if (row.type === 'constraint') return RH_CON + RH_GAP;
  const noteLines = row.notes && row.notes.trim()
    ? Math.ceil(row.notes.trim().length / 58) : 0;
  return RH_EVT + noteLines * RH_NOTE + RH_GAP;
}

function layoutPreviewPages(rows) {
  const firstAvail = PH - MY_TOP - HDR_H - RH_COL - MY_BOT - FTR_H - 8;
  const otherAvail = PH - MY_TOP - RH_COL  - MY_BOT - FTR_H - 8;
  const pages = [];
  let curr = [], used = 0;
  for (const row of rows) {
    const h = previewRowH(row);
    const avail = pages.length === 0 ? firstAvail : otherAvail;
    if (curr.length > 0 && used + h > avail) { pages.push(curr); curr = []; used = 0; }
    curr.push(row); used += h;
  }
  pages.push(curr);
  return pages;
}

function fmtDateLong(dateStr) {
  if (!dateStr) return '';
  const dt = new Date(dateStr.includes('-') && !dateStr.includes('T') ? dateStr + 'T00:00:00' : dateStr);
  if (isNaN(dt.getTime())) return dateStr;
  return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function hexToRgb(hex) {
  const h = (hex || '#ffffff').replace('#', '').padEnd(6, '0');
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}

// ── Preview sub-components (all measurements in raw pt/px — PreviewPage scales via CSS transform) ──
function PvHeader({ bride, groom, date, photoStartHour, photoStartMinute, photoStartPeriod, photoEndHour, photoEndMinute, photoEndPeriod, videoStartHour, videoStartMinute, videoStartPeriod, videoEndHour, videoEndMinute, videoEndPeriod, photoEnabled, videoEnabled }) {
  const covParts = [];
  if (photoEnabled) covParts.push(`Photo: ${photoStartHour}:${photoStartMinute} ${photoStartPeriod} – ${photoEndHour}:${photoEndMinute} ${photoEndPeriod}`);
  if (videoEnabled) covParts.push(`Video: ${videoStartHour}:${videoStartMinute} ${videoStartPeriod} – ${videoEndHour}:${videoEndMinute} ${videoEndPeriod}`);
  return (
    <div style={{ height: HDR_H, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
      <div style={{ fontSize: 7.5, letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: "'Jost', sans-serif", color: '#b8906a', fontWeight: 300 }}>Wedding Potion</div>
      <div style={{ fontSize: 24, fontFamily: "'Cormorant Garamond', serif", color: '#1a1a1a', fontWeight: 300, lineHeight: 1 }}>{bride || 'Bride'} &amp; {groom || 'Groom'}</div>
      <div style={{ fontSize: 9, fontFamily: "'Jost', sans-serif", color: '#555', fontWeight: 300, letterSpacing: '0.08em' }}>{fmtDateLong(date)}</div>
      {covParts.length > 0 && <div style={{ fontSize: 7.5, fontFamily: "'Jost', sans-serif", color: '#888', fontWeight: 300 }}>{covParts.join('  ·  ')}</div>}
      <div style={{ width: '100%', height: 0.75, background: '#b8906a', marginTop: 4 }} />
    </div>
  );
}

function PvColHeaders() {
  const lbl = { fontSize: 6.5, fontFamily: "'Jost', sans-serif", fontWeight: 400, color: '#b8906a', textTransform: 'uppercase', letterSpacing: '0.1em' };
  return (
    <div style={{ display: 'flex', height: RH_COL, flexShrink: 0, alignItems: 'center', borderBottom: '0.5px solid #b8906a', marginBottom: 3 }}>
      <div style={{ ...lbl, width: COL_TIME }}>Time</div>
      <div style={{ ...lbl, flex: 1 }}>Event</div>
      <div style={{ ...lbl, width: COL_DUR, textAlign: 'right' }}>Min</div>
      <div style={{ ...lbl, width: COL_SET, textAlign: 'center' }}>Setting</div>
    </div>
  );
}

function PvRow({ row }) {
  const t = formatTime(row.time);
  const timeStr = `${t.hour}:${t.minute} ${t.period}`;
  if (row.type === 'location') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: RH_LOC, flexShrink: 0, marginBottom: RH_GAP, paddingLeft: 7, paddingRight: 4, background: '#f8f6f3', borderLeft: '3px solid #b8906a' }}>
        <div style={{ fontSize: 7.5, color: '#aaa', fontFamily: "'Jost', sans-serif", marginBottom: 2 }}>{timeStr}</div>
        <div style={{ fontSize: 10, color: '#1a1a1a', fontFamily: "'Jost', sans-serif", fontWeight: 500 }}>📍 {row.event || '(Travel)'}</div>
        {row.address && row.address.trim() && <div style={{ fontSize: 8, color: '#666', fontFamily: "'Jost', sans-serif", marginTop: 2 }}>{row.address}</div>}
        <div style={{ fontSize: 7.5, color: '#aaa', fontFamily: "'Jost', sans-serif", marginTop: 2 }}>Travel time: {row.duration} min</div>
      </div>
    );
  }
  if (row.type === 'constraint') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', height: RH_CON, flexShrink: 0, marginBottom: RH_GAP, paddingLeft: 7, paddingRight: 4, background: 'repeating-linear-gradient(45deg,#fff8f8,#fff8f8 6px,#fff2f2 6px,#fff2f2 12px)', borderLeft: '3px solid #cc4444', gap: 10 }}>
        <div style={{ fontSize: 8, color: '#999', fontFamily: "'Jost', sans-serif", flexShrink: 0 }}>{timeStr}</div>
        <div style={{ fontSize: 8.5, color: '#cc4444', fontFamily: "'Jost', sans-serif", fontWeight: 500 }}>⚠ Time Constraint</div>
        {row.notes && row.notes.trim() && <div style={{ fontSize: 7.5, color: '#888', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', marginLeft: 'auto' }}>{row.notes}</div>}
      </div>
    );
  }
  const accent = getEventColor(row.event);
  const noteLines = row.notes && row.notes.trim() ? Math.ceil(row.notes.trim().length / 58) : 0;
  const rowH = RH_EVT + noteLines * RH_NOTE;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', height: rowH, flexShrink: 0, marginBottom: RH_GAP, paddingTop: 4, paddingLeft: 5, paddingRight: 4, borderLeft: `2.5px solid ${accent}`, borderBottom: '0.4px solid #f0ede8' }}>
      <div style={{ width: COL_TIME - 5, fontSize: 8.5, fontFamily: "'Jost', sans-serif", color: '#333', fontWeight: 500, flexShrink: 0 }}>{timeStr}</div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ fontSize: 9, fontFamily: "'Jost', sans-serif", color: '#1a1a1a', lineHeight: 1.25 }}>{row.event || '(empty)'}</div>
        {row.notes && row.notes.trim() && <div style={{ fontSize: 8, fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: '#777', marginTop: 2, lineHeight: 1.2 }}>{row.notes}</div>}
      </div>
      <div style={{ width: COL_DUR, fontSize: 8.5, fontFamily: "'Jost', sans-serif", color: '#666', textAlign: 'right', flexShrink: 0 }}>{row.duration}</div>
      <div style={{ width: COL_SET, fontSize: 9, textAlign: 'center', flexShrink: 0 }}>{row.isOutdoor ? '☀' : '⌂'}</div>
    </div>
  );
}

function PvFooter({ pageNum, totalPages, bride, groom, date }) {
  return (
    <div style={{ position: 'absolute', bottom: 10, left: MX, right: MX, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '0.4px solid #ddd', paddingTop: 5 }}>
      <div style={{ fontSize: 7, fontFamily: "'Jost', sans-serif", color: '#bbb' }}>{bride || 'Bride'} &amp; {groom || 'Groom'} · {fmtDateLong(date)}</div>
      <div style={{ fontSize: 7, fontFamily: "'Jost', sans-serif", color: '#bbb' }}>{pageNum} of {totalPages}</div>
    </div>
  );
}

// The page is always rendered at PW×PH in layout space.
// The outer wrapper has dimensions PW*sc × PH*sc (the visual footprint),
// and CSS transform: scale(sc) shrinks/enlarges the inner page visually
// without affecting the layout of the surrounding container.
function PreviewPage({ items, isFirst, pageNum, totalPages, sc, bride, groom, date, photoStartHour, photoStartMinute, photoStartPeriod, photoEndHour, photoEndMinute, photoEndPeriod, videoStartHour, videoStartMinute, videoStartPeriod, videoEndHour, videoEndMinute, videoEndPeriod, photoEnabled, videoEnabled }) {
  return (
    <div style={{ width: PW * sc, height: PH * sc, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
      <div style={{ width: PW, height: PH, background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.18)', position: 'absolute', top: 0, left: 0, transform: `scale(${sc})`, transformOrigin: 'top left' }}>
        <div style={{ position: 'absolute', left: MX, right: MX, top: MY_TOP, bottom: MY_BOT + FTR_H + 4, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {isFirst && <PvHeader bride={bride} groom={groom} date={date} photoStartHour={photoStartHour} photoStartMinute={photoStartMinute} photoStartPeriod={photoStartPeriod} photoEndHour={photoEndHour} photoEndMinute={photoEndMinute} photoEndPeriod={photoEndPeriod} videoStartHour={videoStartHour} videoStartMinute={videoStartMinute} videoStartPeriod={videoStartPeriod} videoEndHour={videoEndHour} videoEndMinute={videoEndMinute} videoEndPeriod={videoEndPeriod} photoEnabled={photoEnabled} videoEnabled={videoEnabled} />}
          <PvColHeaders />
          {items.map((row, i) => <PvRow key={row.id ?? i} row={row} />)}
        </div>
        <PvFooter pageNum={pageNum} totalPages={totalPages} bride={bride} groom={groom} date={date} />
      </div>
    </div>
  );
}

function TimelinePreview({ rows, bride, groom, date, photoStartHour, photoStartMinute, photoStartPeriod, photoEndHour, photoEndMinute, photoEndPeriod, videoStartHour, videoStartMinute, videoStartPeriod, videoEndHour, videoEndMinute, videoEndPeriod, photoEnabled, videoEnabled }) {
  const containerRef = useRef(null);
  const [panelW, setPanelW] = useState(500);
  const [userZoom, setUserZoom] = useState(1);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(entries => setPanelW(entries[0].contentRect.width));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const baseScale = Math.max(0.2, (panelW - 32) / PW);
  const sc = baseScale * userZoom;
  const pages = layoutPreviewPages(rows);

  const brideFirst = (bride || 'Bride').trim().split(/\s+/)[0];
  const groomFirst = (groom || 'Groom').trim().split(/\s+/)[0];

  const handleExport = async () => {
    setExporting(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'pt', format: 'letter' });
      const allPages = layoutPreviewPages(rows);

      allPages.forEach((pageRows, pi) => {
        if (pi > 0) doc.addPage();

        if (pi === 0) {
          let hy = MY_TOP + 14;
          doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(184, 144, 106);
          doc.text('WEDDING POTION', PW / 2, hy, { align: 'center', charSpace: 1.5 });
          hy += 24;
          doc.setFont('times', 'normal'); doc.setFontSize(24); doc.setTextColor(26, 26, 26);
          doc.text(`${bride || 'Bride'} & ${groom || 'Groom'}`, PW / 2, hy, { align: 'center' });
          hy += 18;
          doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(90, 90, 90);
          doc.text(fmtDateLong(date), PW / 2, hy, { align: 'center', charSpace: 0.5 });
          hy += 13;
          const covParts = [];
          if (photoEnabled) covParts.push(`Photo: ${photoStartHour}:${photoStartMinute} ${photoStartPeriod} - ${photoEndHour}:${photoEndMinute} ${photoEndPeriod}`);
          if (videoEnabled) covParts.push(`Video: ${videoStartHour}:${videoStartMinute} ${videoStartPeriod} - ${videoEndHour}:${videoEndMinute} ${videoEndPeriod}`);
          if (covParts.length > 0) { doc.setFontSize(7.5); doc.setTextColor(140, 140, 140); doc.text(covParts.join('   -   '), PW / 2, hy, { align: 'center' }); }
          doc.setDrawColor(184, 144, 106); doc.setLineWidth(0.75);
          doc.line(MX, MY_TOP + HDR_H - 6, PW - MX, MY_TOP + HDR_H - 6);
        }

        const csY = pi === 0 ? MY_TOP + HDR_H : MY_TOP;
        doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(184, 144, 106);
        doc.text('TIME', MX, csY + 13);
        doc.text('EVENT', MX + COL_TIME, csY + 13);
        doc.text('MIN', PW - MX - COL_SET - 2, csY + 13, { align: 'right' });
        doc.text('SETTING', PW - MX - COL_SET / 2, csY + 13, { align: 'center' });
        doc.setDrawColor(184, 144, 106); doc.setLineWidth(0.5);
        doc.line(MX, csY + RH_COL, PW - MX, csY + RH_COL);

        let y = csY + RH_COL + 4;
        for (const row of pageRows) {
          const t = formatTime(row.time);
          const ts = `${t.hour}:${t.minute} ${t.period}`;
          if (row.type === 'location') {
            doc.setFillColor(248, 246, 243); doc.rect(MX, y, CW, RH_LOC, 'F');
            doc.setFillColor(184, 144, 106); doc.rect(MX, y, 3, RH_LOC, 'F');
            doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(160, 160, 160);
            doc.text(ts, MX + 8, y + 11);
            doc.setFontSize(10); doc.setTextColor(26, 26, 26);
            doc.text(row.event || '(Travel)', MX + 8, y + 23, { maxWidth: CW - 16 });
            if (row.address && row.address.trim()) { doc.setFontSize(8); doc.setTextColor(100, 100, 100); doc.text(row.address.trim(), MX + 8, y + 34, { maxWidth: CW - 16 }); }
            doc.setFontSize(7.5); doc.setTextColor(150, 150, 150);
            doc.text(`Travel: ${row.duration} min`, MX + 8, y + RH_LOC - 5);
            y += RH_LOC + RH_GAP;
          } else if (row.type === 'constraint') {
            doc.setFillColor(255, 245, 245); doc.rect(MX, y, CW, RH_CON, 'F');
            doc.setFillColor(204, 68, 68); doc.rect(MX, y, 3, RH_CON, 'F');
            doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(150, 150, 150);
            doc.text(ts, MX + 8, y + RH_CON / 2 + 3);
            doc.setTextColor(204, 68, 68); doc.setFontSize(9);
            doc.text('[!] TIME CONSTRAINT', MX + COL_TIME, y + RH_CON / 2 + 3);
            y += RH_CON + RH_GAP;
          } else {
            const [ar, ag, ab] = hexToRgb(getEventColor(row.event));
            doc.setFillColor(ar, ag, ab); doc.rect(MX, y, 2.5, RH_EVT, 'F');
            doc.setDrawColor(240, 237, 232); doc.setLineWidth(0.4);
            doc.line(MX, y + RH_EVT, PW - MX, y + RH_EVT);
            doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(50, 50, 50);
            doc.text(ts, MX + 5, y + 14);
            doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(26, 26, 26);
            doc.text(row.event || '(empty)', MX + COL_TIME, y + 14, { maxWidth: CW - COL_TIME - COL_DUR - COL_SET - 4 });
            doc.setFontSize(8.5); doc.setTextColor(110, 110, 110);
            doc.text(String(row.duration), PW - MX - COL_SET - 4, y + 14, { align: 'right' });
            doc.setFontSize(8); doc.setTextColor(80, 80, 80);
            doc.text(row.isOutdoor ? 'OUT' : 'IN', PW - MX - COL_SET / 2, y + 14, { align: 'center' });
            y += RH_EVT;
            if (row.notes && row.notes.trim()) {
              doc.setFont('times', 'italic'); doc.setFontSize(8); doc.setTextColor(130, 130, 130);
              const wrapped = doc.splitTextToSize(row.notes.trim(), CW - COL_TIME - COL_DUR - COL_SET - 8);
              doc.text(wrapped, MX + COL_TIME, y + 10);
              y += wrapped.length * RH_NOTE;
            }
            y += RH_GAP;
          }
        }

        const ftrY = PH - MY_BOT + 4;
        doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.4);
        doc.line(MX, ftrY - 6, PW - MX, ftrY - 6);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(180, 180, 180);
        doc.text(`${bride || 'Bride'} & ${groom || 'Groom'} - ${fmtDateLong(date)}`, MX, ftrY);
        doc.text(`${pi + 1} of ${allPages.length}`, PW - MX, ftrY, { align: 'right' });
      });

      doc.save(`${brideFirst}-${groomFirst}-Wedding-Timeline.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const toolBtn = (extra = {}) => ({ padding: '4px 10px', background: 'transparent', border: '1px solid #2a2520', borderRadius: 4, color: '#b8906a', fontSize: 11, fontFamily: "'Jost', sans-serif", cursor: 'pointer', ...extra });
  const isEmpty = pages.length === 0 || (pages.length === 1 && pages[0].length === 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingBottom: 8, flexShrink: 0 }}>
        <button style={toolBtn()} onClick={() => setUserZoom(z => Math.max(0.4, +(z - 0.15).toFixed(2)))}>−</button>
        <span style={{ fontSize: 11, color: '#6e6358', fontFamily: "'Jost', sans-serif", minWidth: 38, textAlign: 'center' }}>{Math.round(userZoom * 100)}%</span>
        <button style={toolBtn()} onClick={() => setUserZoom(z => Math.min(2.5, +(z + 0.15).toFixed(2)))}>+</button>
      </div>
      <div ref={containerRef} style={{ flex: 1, minHeight: 0, overflow: 'auto', background: '#f0ece6', borderRadius: 6, padding: '16px 16px 32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          {isEmpty ? (
            <div style={{ padding: 40, color: '#8a7a6a', fontSize: 12, fontFamily: "'Jost', sans-serif", textAlign: 'center', letterSpacing: '0.05em' }}>
              Generate a timeline to preview it here.
            </div>
          ) : pages.map((items, i) => (
            <PreviewPage key={i} items={items} isFirst={i === 0} pageNum={i + 1} totalPages={pages.length} sc={sc}
              bride={bride} groom={groom} date={date}
              photoStartHour={photoStartHour} photoStartMinute={photoStartMinute} photoStartPeriod={photoStartPeriod}
              photoEndHour={photoEndHour} photoEndMinute={photoEndMinute} photoEndPeriod={photoEndPeriod}
              videoStartHour={videoStartHour} videoStartMinute={videoStartMinute} videoStartPeriod={videoStartPeriod}
              videoEndHour={videoEndHour} videoEndMinute={videoEndMinute} videoEndPeriod={videoEndPeriod}
              photoEnabled={photoEnabled} videoEnabled={videoEnabled}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Sidebar (desktop only) ---------------- */
function EventSidebar({ rows, bride, groom, date, photoStartHour, photoStartMinute, photoStartPeriod, photoEndHour, photoEndMinute, photoEndPeriod, videoStartHour, videoStartMinute, videoStartPeriod, videoEndHour, videoEndMinute, videoEndPeriod, photoEnabled, videoEnabled }) {
  const [activeTab, setActiveTab] = useState('blocks');
  const previewProps = { rows, bride, groom, date, photoStartHour, photoStartMinute, photoStartPeriod, photoEndHour, photoEndMinute, photoEndPeriod, videoStartHour, videoStartMinute, videoStartPeriod, videoEndHour, videoEndMinute, videoEndPeriod, photoEnabled, videoEnabled };
  return (
    <div className="wtb-sidebar-wrap">
      <aside className="wtb-sidebar" style={{ overflow: activeTab === 'preview' ? 'hidden' : 'auto', display: 'flex', flexDirection: 'column' }}>
        <div className="wtb-tabs">
          <button className={`wtb-tab-btn${activeTab === 'blocks' ? ' active' : ''}`} onClick={() => setActiveTab('blocks')}>Event Blocks</button>
          <button className={`wtb-tab-btn${activeTab === 'preview' ? ' active' : ''}`} onClick={() => setActiveTab('preview')}>Preview</button>
        </div>

        {activeTab === 'blocks' ? (
          <>
            <div className="wtb-side-note">Drag a block onto a row</div>
            <div className="wtb-palette">
              {/* Location / Travel block */}
              <div style={{ fontSize: 10, color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4, fontFamily: "'Jost', sans-serif", fontWeight: 400 }}>Travel</div>
              <button
                draggable
                onDragStart={(e) => {
                  if (e.dataTransfer) e.dataTransfer.effectAllowed = "copy";
                  e.dataTransfer.setData("application/json", JSON.stringify({ type: "location", event: "", duration: 15 }));
                }}
                style={{ background: "#161310", border: "2px solid #ffffff", color: "#ddd0bc", marginBottom: 8 }}
                title="Drag to add a location / travel block"
              >
                <span>Location / Travel</span>
                <span style={{ fontSize: 12, color: "#6e6358", fontWeight: "bold", marginLeft: "16px", whiteSpace: "nowrap" }}>15 min</span>
              </button>
              {(() => {
                const groups = [];
                const groupMap = {};
                EVENT_BLOCKS.forEach(block => {
                  const [label, duration] = block.split("::");
                  const sep = label.indexOf(": ");
                  const category  = sep !== -1 ? label.substring(0, sep) : label;
                  const shortLabel = sep !== -1 ? label.substring(sep + 2) : label;
                  if (!groupMap[category]) { groupMap[category] = []; groups.push(category); }
                  groupMap[category].push({ label, shortLabel, dur: parseInt(duration, 10), block });
                });
                return groups.map(category => {
                  const categoryColor = getEventColor(groupMap[category][0].label);
                  return (
                    <div key={category} style={{ marginBottom: 8, breakInside: "avoid", WebkitColumnBreakInside: "avoid" }}>
                      <div style={{ fontSize: 10, color: categoryColor, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4, paddingTop: 6, borderTop: "1px solid #1e1c19", fontFamily: "'Jost', sans-serif", fontWeight: 400, textAlign: "center" }}>{category}</div>
                      {groupMap[category].map(({ label, shortLabel, dur, block }) => (
                        <button
                          key={block}
                          draggable
                          onDragStart={(e) => {
                            if (e.dataTransfer) e.dataTransfer.effectAllowed = "copy";
                            e.dataTransfer.setData("application/json", JSON.stringify({ event: label, duration: dur }));
                          }}
                          style={{ background: "#161310", border: `2px solid ${getEventColor(label)}`, color: "#ddd0bc" }}
                          title="Drag to timeline"
                        >
                          <span>{shortLabel}</span>
                          <span style={{ fontSize: 12, color: "#6e6358", fontWeight: "bold", marginLeft: "16px", whiteSpace: "nowrap" }}>{dur} min</span>
                        </button>
                      ))}
                    </div>
                  );
                });
              })()}
            </div>
          </>
        ) : (
          <TimelinePreview {...previewProps} />
        )}
      </aside>
    </div>
  );
}


/* ---------------- App ---------------- */
export default function MobileApp() {
  const isDesktop = useMediaQuery(DESKTOP_MIN_WIDTH);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileMainTab, setMobileMainTab] = useState("timeline"); // "timeline" | "preview" (mobile only)
  const [date, setDate] = useState("");
  const [bride, setBride] = useState("");
  const [groom, setGroom] = useState("");
  const [brideLabel, setBrideLabel] = useState("Bride");
  const [groomLabel, setGroomLabel] = useState("Groom");
  const withThe = (label) => (label === "Bride" || label === "Groom") ? `the ${label}` : label;

  // Defaults: 12:00 PM starts
  const [photoStartHour, setPhotoStartHour] = useState("12");
  const [photoStartMinute, setPhotoStartMinute] = useState("00");
  const [photoStartPeriod, setPhotoStartPeriod] = useState("PM");
  const [photoEndHour, setPhotoEndHour] = useState("5");
  const [photoEndMinute, setPhotoEndMinute] = useState("00");
  const [photoEndPeriod, setPhotoEndPeriod] = useState("PM");

  const [videoStartHour, setVideoStartHour] = useState("12");
  const [videoStartMinute, setVideoStartMinute] = useState("00");
  const [videoStartPeriod, setVideoStartPeriod] = useState("PM");
  const [videoEndHour, setVideoEndHour] = useState("5");
  const [videoEndMinute, setVideoEndMinute] = useState("00");
  const [videoEndPeriod, setVideoEndPeriod] = useState("PM");

  // Coverage toggles
  const [photoEnabled, setPhotoEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  // Screen & modal state
  const [screen, setScreen] = useState("welcome"); // "welcome" | "wizard" | "settings" | "timeline"
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState(0);

  // Fixed-time events (Project Settings)
  const [fixedEvents, setFixedEvents] = useState([
    { id: 1, event: "Ceremony", timeHour: "3", timeMinute: "00", timePeriod: "PM", duration: 30 },
  ]);
  const [fixedEventNextId, setFixedEventNextId] = useState(2);

  // Rows
  const [userRows, setUserRows] = useState([
    {
      id: 1,
      location: "",
      time: 12 * 60,
      event: "",
      duration: 30,
      isOutdoor: false,
      photo: true,
      video: true,
      notes: "",
      isTimeLocked: false,
      color: "",
    },
  ]);
  const latestUserRowsRef = useRef(null);
  const beforeEditSnapshotRef = useRef(null);
  const [nextId, setNextId] = useState(2);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [copyConfirm, setCopyConfirm] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);
  const mobileGearMenuRef = useRef(null);
  const mainScrollRef = useRef(null);
  const [draggedRowId, setDraggedRowId] = useState(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [showEventSelector, setShowEventSelector] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
  const isDirtyRef = useRef(false);
  const isApplyingProjectRef = useRef(false);
  const dirtyTrackingEnabledRef = useRef(false);
  const suppressDirtyRef = useRef(false);

  // ---- Wizard State ----
  const [wizardStep, setWizardStep] = useState(1);

  // Step 1 — Locations
  const [wiz_locations, setWiz_locations] = useState([]);
  const [wiz_locationNextId, setWiz_locationNextId] = useState(1);

  // Step 2 — Locations (mandatory venue fields)
  const [wiz_receptionVenue, setWiz_receptionVenue] = useState("");
  const [wiz_receptionAddress, setWiz_receptionAddress] = useState("");
  const [wiz_receptionSameAsCeremony, setWiz_receptionSameAsCeremony] = useState(false);

  // Step 1 — Wedding Details (reuses: date, bride, groom, brideLabel, groomLabel)

  // Step 3 (formerly Step 2) — Ceremony
  const [wiz_ceremonyHour, setWiz_ceremonyHour] = useState("3");
  const [wiz_ceremonyMinute, setWiz_ceremonyMinute] = useState("00");
  const [wiz_ceremonyPeriod, setWiz_ceremonyPeriod] = useState("PM");
  const [wiz_ceremonyDuration, setWiz_ceremonyDuration] = useState(30);
  const [wiz_ceremonyVenue, setWiz_ceremonyVenue] = useState("");
  const [wiz_ceremonyAddress, setWiz_ceremonyAddress] = useState("");
  const [wiz_guestCount, setWiz_guestCount] = useState("");
  const [wiz_portraitLocations, setWiz_portraitLocations] = useState([]);
  const [wiz_brideReadyAddress, setWiz_brideReadyAddress] = useState("");
  const [wiz_brideReadyStreet, setWiz_brideReadyStreet] = useState("");
  const [wiz_groomReadyAddress, setWiz_groomReadyAddress] = useState("");
  const [wiz_groomReadyStreet, setWiz_groomReadyStreet] = useState("");
  const [wiz_distanceBetweenReady, setWiz_distanceBetweenReady] = useState("");
  const [wiz_distanceBrideToCeremony, setWiz_distanceBrideToCeremony] = useState("");
  const [wiz_distanceGroomToCeremony, setWiz_distanceGroomToCeremony] = useState("");
  const [wiz_distanceReceptionToCeremony, setWiz_distanceReceptionToCeremony] = useState("");
  const [wiz_sameLocation, setWiz_sameLocation] = useState(null); // null | true | false
  const [wiz_portraitsAtReadyLocations, setWiz_portraitsAtReadyLocations] = useState(false);
  const [wiz_bridePortraitsAtReadyLocation, setWiz_bridePortraitsAtReadyLocation] = useState(false);
  const [wiz_groomPortraitsAtReadyLocation, setWiz_groomPortraitsAtReadyLocation] = useState(false);
  const [wiz_hairMakeupDoneHour, setWiz_hairMakeupDoneHour] = useState("12");
  const [wiz_hairMakeupDoneMinute, setWiz_hairMakeupDoneMinute] = useState("00");
  const [wiz_hairMakeupDonePeriod, setWiz_hairMakeupDonePeriod] = useState("PM");
  const [wiz_photoCoverageHours, setWiz_photoCoverageHours] = useState("");
  const [wiz_videoCoverageHours, setWiz_videoCoverageHours] = useState("");
  const [wiz_ceremonyOutdoor, setWiz_ceremonyOutdoor] = useState(false);

  // Step 3 — Package Inclusions
  const [wiz_photographerCount, setWiz_photographerCount] = useState(1);
  const [wiz_videographerCount, setWiz_videographerCount] = useState(1);
  const [wiz_drone, setWiz_drone] = useState(false);
  const [wiz_narration, setWiz_narration] = useState(false);

  // Step 6 — First Looks
  const [wiz_hasFirstLooks, setWiz_hasFirstLooks] = useState(null); // null|true|false
  const [wiz_firstLookGroom, setWiz_firstLookGroom] = useState(false);
  const [wiz_firstLookParent, setWiz_firstLookParent] = useState(false);
  const [wiz_firstLookBridesmaids, setWiz_firstLookBridesmaids] = useState(false);
  const [wiz_firstLookOther, setWiz_firstLookOther] = useState(false);
  const [wiz_firstLookGroomLocation, setWiz_firstLookGroomLocation] = useState("");
  const [wiz_firstLookParentLocation, setWiz_firstLookParentLocation] = useState("");
  const [wiz_firstLookBridesmaidsLocation, setWiz_firstLookBridesmaidsLocation] = useState("");
  const [wiz_firstLookOtherLocation, setWiz_firstLookOtherLocation] = useState("");

  // Step 7 — Pre-Ceremony Visibility (skipped if wiz_firstLookGroom is true)
  const [wiz_brideOkayBefore, setWiz_brideOkayBefore] = useState(null); // null|true|false

  // Step 9 — Reception
  const [wiz_receptionHour, setWiz_receptionHour] = useState("6");
  const [wiz_receptionMinute, setWiz_receptionMinute] = useState("00");
  const [wiz_receptionPeriod, setWiz_receptionPeriod] = useState("PM");
  const [wiz_grandEntrance, setWiz_grandEntrance] = useState(true);
  const [wiz_cakeCutting, setWiz_cakeCutting] = useState(true);
  const [wiz_firstDance, setWiz_firstDance] = useState(true);
  const [wiz_brideParentDance, setWiz_brideParentDance] = useState(true);
  const [wiz_groomParentDance, setWiz_groomParentDance] = useState(true);
  const [wiz_specialDance, setWiz_specialDance] = useState(false);
  const [wiz_speeches, setWiz_speeches] = useState(true);
  const [wiz_speechCount, setWiz_speechCount] = useState(3);
  const [wiz_dinner, setWiz_dinner] = useState(true);
  const [wiz_dinnerStartHour, setWiz_dinnerStartHour] = useState("7");
  const [wiz_dinnerStartMinute, setWiz_dinnerStartMinute] = useState("00");
  const [wiz_dinnerStartPeriod, setWiz_dinnerStartPeriod] = useState("PM");
  const [wiz_dinnerStyle, setWiz_dinnerStyle] = useState(null);
  const [wiz_openDanceFloor, setWiz_openDanceFloor] = useState(true);
  const [wiz_garterToss, setWiz_garterToss] = useState(false);
  const [wiz_bouquetToss, setWiz_bouquetToss] = useState(false);
  const [wiz_familyGroups, setWiz_familyGroups] = useState("5"); // "5"|"10"|"none"
  const [wiz_familyGroupNames, setWiz_familyGroupNames] = useState([]);
  const [wiz_goldenHour, setWiz_goldenHour] = useState(false);

  // Step 2 — Getting ready location checkboxes
  const [wiz_brideReadyAtCeremony, setWiz_brideReadyAtCeremony] = useState(false);
  const [wiz_brideReadyAtReception, setWiz_brideReadyAtReception] = useState(false);
  const [wiz_groomReadyAtCeremony, setWiz_groomReadyAtCeremony] = useState(false);
  const [wiz_groomReadyAtReception, setWiz_groomReadyAtReception] = useState(false);
  const [wiz_groomReadyAtBride, setWiz_groomReadyAtBride] = useState(false);

  // Step 4 — Pre-ceremony shot types
  const [wiz_preCeremonyBrideReady, setWiz_preCeremonyBrideReady] = useState(true);
  const [wiz_preCeremonyGroomReady, setWiz_preCeremonyGroomReady] = useState(true);
  const [wiz_preCeremonyDetails, setWiz_preCeremonyDetails] = useState(true);
  const [wiz_preCeremonyBrideParty, setWiz_preCeremonyBrideParty] = useState(true);
  const [wiz_preCeremonyGroomParty, setWiz_preCeremonyGroomParty] = useState(true);
  const [wiz_preCeremonyPreDress, setWiz_preCeremonyPreDress] = useState(false);

  // Step 5 — Ceremony special events notes
  const [wiz_ceremonyNotes, setWiz_ceremonyNotes] = useState("");

  // Step 6 — Custom first looks (array of {id, label, location})
  const [wiz_customFirstLooks, setWiz_customFirstLooks] = useState([]);
  const [wiz_customFirstLookNextId, setWiz_customFirstLookNextId] = useState(1);

  // Step 8 — Portrait Sessions (array of {id, type, location})
  const [wiz_portraitSessions, setWiz_portraitSessions] = useState([]);
  const [wiz_portraitSessionNextId, setWiz_portraitSessionNextId] = useState(1);

  // Step 9 — Reception additions
  const [wiz_grandEntranceSub, setWiz_grandEntranceSub] = useState("couple"); // "full" | "couple"
  const [wiz_customReceptionEvents, setWiz_customReceptionEvents] = useState([]);
  const [wiz_customReceptionEventNextId, setWiz_customReceptionEventNextId] = useState(1);

  const rows = useMemo(() => {
    return [...userRows].sort((a, b) => a.time - b.time);
  }, [userRows]);

  const overlapMap = useMemo(() => computeOverlaps(userRows), [userRows]);

  useEffect(() => {
    if (isDesktop) {
      setShowMobileMenu(false);
      setMobileMainTab("timeline");
    } else {
      setShowExportMenu(false);
    }
  }, [isDesktop]);

  const isTimelineEmpty = () => {
    const hasRowContent = userRows.some(
      (r) =>
        (r.event && r.event.trim()) ||
        (r.location && r.location.trim()) ||
        (r.notes && r.notes.trim())
    );
    const hasMeta = !!(
      String(date || "").trim() ||
      String(bride || "").trim() ||
      String(groom || "").trim()
    );
    return !hasRowContent && !hasMeta;
  };

  const markDirty = () => {
    if (!isTimelineEmpty()) {
      setIsDirty(true);
      isDirtyRef.current = true;
    }
  };

  const clearDirty = () => {
    setIsDirty(false);
    isDirtyRef.current = false;
  };

  useEffect(() => {
    if (screen !== "welcome") {
      dirtyTrackingEnabledRef.current = true;
    }
  }, [screen]);

  useEffect(() => {
    if (!dirtyTrackingEnabledRef.current || isApplyingProjectRef.current) return;
    if (suppressDirtyRef.current) {
      suppressDirtyRef.current = false;
      return;
    }
    markDirty();
  }, [
    userRows,
    fixedEvents,
    date,
    bride,
    groom,
    brideLabel,
    groomLabel,
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
    photoEnabled,
    videoEnabled,
  ]);

  useEffect(() => {
    const handler = (e) => {
      if (isDirtyRef.current && !isTimelineEmpty()) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty, userRows, date, bride, groom]);

  // Preserve existing times by default; only the chain action should advance times
  const recalculateTimes = (rowsIn, startIndex = 0) => {
    return [...rowsIn];
  };

  const saveToHistory = (newUserRows) => {
    if (JSON.stringify(newUserRows) === JSON.stringify(userRows)) return;
    setHistory((prev) => [...prev.slice(-11), userRows]);
    setRedoStack([]);
    setUserRows(newUserRows);
  };


  const handleChange = (displayIndex, field, value) => {
    if (beforeEditSnapshotRef.current === null) {
      beforeEditSnapshotRef.current = userRows.map(r => ({ ...r })); // deep-enough clone before any mutation
    }
    const row = rows[displayIndex];
    const userRowIndex = userRows.findIndex((userRow) => userRow.id === row.id);
    if (userRowIndex === -1) return;

    const newUserRows = [...userRows];

    if (field === "duration") {
      const newDuration = parseInt(value, 10) || 0;
      newUserRows[userRowIndex] = { ...newUserRows[userRowIndex], duration: newDuration };

      const sortedRows = [...newUserRows].sort((a, b) => a.time - b.time);
      const sortedIndex = sortedRows.findIndex(
        (r) => r.id === newUserRows[userRowIndex].id
      );
      const recalculated = recalculateTimes(sortedRows, sortedIndex);

      recalculated.forEach((recalcRow, i) => {
        const originalIndex = newUserRows.findIndex(
          (r) => r.id === sortedRows[i].id
        );
        if (originalIndex !== -1) {
          newUserRows[originalIndex] = { ...recalcRow, isTimeLocked: newUserRows[originalIndex].isTimeLocked };
        }
      });
      setUserRows(newUserRows);
      latestUserRowsRef.current = newUserRows;
      return;
    }

    newUserRows[userRowIndex] = { ...newUserRows[userRowIndex], [field]: value };
    setUserRows(newUserRows);
    latestUserRowsRef.current = newUserRows;
  };

  const handleBlur = () => {
    const snapshot = beforeEditSnapshotRef.current;
    const latest = latestUserRowsRef.current;
    beforeEditSnapshotRef.current = null;
    if (snapshot !== null && latest !== null && JSON.stringify(latest) !== JSON.stringify(snapshot)) {
      setHistory(prev => [...prev.slice(-11), snapshot]);
      setRedoStack([]);
    }
  };

  const handleDelete = (displayIndex) => {
    const row = rows[displayIndex];
    const userRowIndex = userRows.findIndex((u) => u.id === row.id);
    if (userRowIndex === -1) return;

    const newUserRows = userRows.filter((_, idx) => idx !== userRowIndex);

    if (newUserRows.length === 0) {
      saveToHistory(newUserRows);
      return;
    }

    // Identify ceremony block
    const isCeremony = (r) => r.event === "Ceremony: Average" || r.event === "Ceremony: Catholic";
    const ceremonyRow = newUserRows.find(isCeremony);

    // No ceremony in timeline, or the ceremony itself was deleted — no anchor logic
    if (!ceremonyRow || isCeremony(row)) {
      saveToHistory(newUserRows);
      return;
    }

    const ceremonyTime = ceremonyRow.time;
    const ceremonyEnd = ceremonyTime + ceremonyRow.duration;
    const sorted = [...newUserRows].sort((a, b) => a.time - b.time);

    if (row.time < ceremonyTime) {
      // Pre-ceremony deletion: cascade backwards from ceremony start so blocks shift later
      const pre  = sorted.filter(r => r.time < ceremonyTime);
      const rest = sorted.filter(r => r.time >= ceremonyTime); // ceremony + post, untouched

      let t = ceremonyTime;
      const newPre = [...pre].reverse().map(r => {
        t -= r.duration;
        return { ...r, time: t };
      }).reverse();

      const result = [...newPre, ...rest];
      saveToHistory(newUserRows.map(ur => result.find(r => r.id === ur.id) || ur));
    } else {
      // Post-ceremony deletion: cascade forwards from ceremony end so blocks shift earlier
      const preAndCeremony = sorted.filter(r => r.time <= ceremonyTime); // untouched
      const post = sorted.filter(r => r.time > ceremonyTime);

      let t = ceremonyEnd;
      const newPost = post.map(r => {
        const updated = { ...r, time: t };
        t += r.duration;
        return updated;
      });

      const result = [...preAndCeremony, ...newPost];
      saveToHistory(newUserRows.map(ur => result.find(r => r.id === ur.id) || ur));
    }
  };

  // Cascade all pre- or post-ceremony blocks around the ceremony anchor.
  // insertedRowTime determines which side to cascade; only that side is recalculated.
  const applyCeremonyAnchorCascade = (rows, insertedRowTime) => {
    const isCeremony = (r) => r.event === "Ceremony: Average" || r.event === "Ceremony: Catholic";
    const ceremonyRow = rows.find(isCeremony);
    if (!ceremonyRow) return rows; // no anchor — return unchanged

    const ceremonyTime = ceremonyRow.time;
    const ceremonyEnd  = ceremonyTime + ceremonyRow.duration;
    const sorted = [...rows].sort((a, b) => a.time - b.time);

    if (insertedRowTime < ceremonyTime) {
      // Pre-ceremony: cascade backwards from ceremony start (day starts earlier)
      const pre  = sorted.filter(r => r.id !== ceremonyRow.id && r.time < ceremonyTime);
      const rest = sorted.filter(r => r.id === ceremonyRow.id || r.time >= ceremonyTime);
      let t = ceremonyTime;
      const newPre = [...pre].reverse().map(r => { t -= r.duration; return { ...r, time: t }; }).reverse();
      const result = [...newPre, ...rest];
      return rows.map(r => result.find(u => u.id === r.id) || r);
    } else {
      // Post-ceremony: cascade forwards from ceremony end (blocks shift later)
      const preAndCeremony = sorted.filter(r => r.id === ceremonyRow.id || r.time <= ceremonyTime);
      const post = sorted.filter(r => r.id !== ceremonyRow.id && r.time > ceremonyTime);
      let t = ceremonyEnd;
      const newPost = post.map(r => { const u = { ...r, time: t }; t += r.duration; return u; });
      const result = [...preAndCeremony, ...newPost];
      return rows.map(r => result.find(u => u.id === r.id) || r);
    }
  };

  // Cascade times based on the visual (array index) order of rows, using the
  // ceremony row as a fixed anchor. Pre-ceremony rows cascade backwards from
  // ceremony start; post-ceremony rows cascade forwards from ceremony end.
  const cascadeTimesByOrder = (orderedRows) => {
    const isCeremony = (r) => r.event === "Ceremony: Average" || r.event === "Ceremony: Catholic";
    const ceremonyIdx = orderedRows.findIndex(isCeremony);
    const result = orderedRows.map(r => ({ ...r }));

    if (ceremonyIdx === -1) {
      // No ceremony anchor — cascade forward from the first row's existing time
      let t = result[0]?.time ?? 0;
      for (let i = 0; i < result.length; i++) {
        if (result[i].isTimeLocked) {
          t = result[i].time + result[i].duration;
        } else {
          result[i].time = t;
          t += result[i].duration;
        }
      }
      return result;
    }

    // Cascade pre-ceremony rows backwards from ceremony start
    let t = result[ceremonyIdx].time;
    for (let i = ceremonyIdx - 1; i >= 0; i--) {
      if (result[i].isTimeLocked) {
        t = result[i].time;
      } else {
        t -= result[i].duration;
        result[i].time = t;
      }
    }

    // Cascade post-ceremony rows forwards from ceremony end
    t = result[ceremonyIdx].time + result[ceremonyIdx].duration;
    for (let i = ceremonyIdx + 1; i < result.length; i++) {
      if (result[i].isTimeLocked) {
        t = result[i].time + result[i].duration;
      } else {
        result[i].time = t;
        t += result[i].duration;
      }
    }

    return result;
  };

  // Chain current row's time to previous row's end time
  const handleChainToPrevious = (index) => {
    if (index === 0) {
      console.warn('[Chain] First row has no previous row to chain to');
      return; // nothing to chain to
    }

    const currentRow = rows[index];
    const previousRow = rows[index - 1];

    const newTime = previousRow.time + previousRow.duration;
    const newUserRows = [...userRows];
    const userRowIndex = newUserRows.findIndex((r) => r.id === currentRow.id);
    
    if (userRowIndex !== -1) {
      // Update the current row's time
      newUserRows[userRowIndex].time = newTime;
      
      // Update all subsequent rows in display order
      let runningTime = newTime + currentRow.duration;
      for (let i = index + 1; i < rows.length; i++) {
        const subsequentRow = rows[i];
        const subsequentUserIndex = newUserRows.findIndex((r) => r.id === subsequentRow.id);
        
        if (subsequentUserIndex !== -1) {
          newUserRows[subsequentUserIndex].time = runningTime;
          runningTime += subsequentRow.duration;
        }
      }
      
      setUserRows(newUserRows); // Force immediate UI update
      saveToHistory(newUserRows);
    }
  };

  const handleMoveUp = (displayIndex) => {
    if (displayIndex === 0) return;
    const currentRow = rows[displayIndex];
    const previousRow = rows[displayIndex - 1];

    // Find the positions of these rows in userRows
    const currentUserIndex = userRows.findIndex(r => r.id === currentRow.id);
    const previousUserIndex = userRows.findIndex(r => r.id === previousRow.id);
    
    if (currentUserIndex === -1 || previousUserIndex === -1) return;

    // Create new userRows array with swapped positions AND times
    const newUserRows = [...userRows];
    
    // Swap the entire rows but also swap their times
    const currentRowCopy = { ...newUserRows[currentUserIndex], time: previousRow.time };
    const previousRowCopy = { ...newUserRows[previousUserIndex], time: currentRow.time };
    
    newUserRows[currentUserIndex] = previousRowCopy;
    newUserRows[previousUserIndex] = currentRowCopy;

    saveToHistory(newUserRows);
  };

  const handleMoveDown = (displayIndex) => {
    if (displayIndex === rows.length - 1) return;
    const currentRow = rows[displayIndex];
    const nextRow = rows[displayIndex + 1];

    // Find the positions of these rows in userRows
    const currentUserIndex = userRows.findIndex(r => r.id === currentRow.id);
    const nextUserIndex = userRows.findIndex(r => r.id === nextRow.id);
    
    if (currentUserIndex === -1 || nextUserIndex === -1) return;

    // Create new userRows array with swapped positions AND times
    const newUserRows = [...userRows];
    
    // Swap the entire rows but also swap their times
    const currentRowCopy = { ...newUserRows[currentUserIndex], time: nextRow.time };
    const nextRowCopy = { ...newUserRows[nextUserIndex], time: currentRow.time };
    
    newUserRows[currentUserIndex] = nextRowCopy;
    newUserRows[nextUserIndex] = currentRowCopy;

    saveToHistory(newUserRows);
  };

  const handleEventClick = (index) => {
    setSelectedRowIndex(index);
    setShowEventSelector(true);
  };

  // Handle selecting an event from the EventBlockSelector
  const handleEventSelect = (eventData) => {
    if (selectedRowIndex !== null && eventData) {
      const displayRow = rows[selectedRowIndex];
      const userRowIndex = userRows.findIndex((u) => u.id === displayRow.id);
      if (userRowIndex !== -1) {
        const newUserRows = [...userRows];
        newUserRows[userRowIndex] = {
          ...newUserRows[userRowIndex],
          event: eventData.event,
          duration: eventData.duration,
          type: eventData.type === "custom" ? "custom" : "event",
          ...(eventData.time !== undefined ? { time: eventData.time } : {}),
        };

        // Recalculate subsequent times starting from this row in display order
        const sortedRows = [...newUserRows].sort((a, b) => a.time - b.time);
        const sortedIndex = sortedRows.findIndex((r) => r.id === newUserRows[userRowIndex].id);
        const recalculated = recalculateTimes(sortedRows, sortedIndex);

        // Map recalculated times back to original order
        recalculated.forEach((recalcRow, i) => {
          const originalIndex = newUserRows.findIndex((r) => r.id === sortedRows[i].id);
          if (originalIndex !== -1) {
            newUserRows[originalIndex] = recalcRow;
          }
        });

        saveToHistory(newUserRows);
      }
    }

    // Close the selector and reset the selection
    setShowEventSelector(false);
    setSelectedRowIndex(null);
  };

  const handleEventBlur = (displayIndex) => {
    const isBottom = displayIndex === rows.length - 1;
    const hasEvent = rows[displayIndex]?.event?.trim() !== "";
    if (isBottom && hasEvent) addRow();
  };

  // Add a new row at a specific display index
  const addRowAtIndex = (insertIndex) => {
    
    // Determine the intended time for the new row based on display order
    let newTime;
    if (insertIndex === 0) {
      newTime = Math.max(0, (rows[0]?.time || 12 * 60) - 30);
    } else if (insertIndex >= rows.length) {
      const lastRow = rows[rows.length - 1];
      newTime = lastRow ? lastRow.time + lastRow.duration : 12 * 60;
    } else {
      const prevRow = rows[insertIndex - 1];
      const nextRow = rows[insertIndex];
      // Insert between prevRow and nextRow - calculate time between them
      const prevEndTime = prevRow.time + prevRow.duration;
      const nextStartTime = nextRow.time;
      
      // If there's a gap, place it at the previous row's end time
      // If there's no gap (overlapping), place it between the times
      if (prevEndTime <= nextStartTime) {
        newTime = prevEndTime;
      } else {
        // If overlapping, place it halfway between prev start and next start
        newTime = Math.floor((prevRow.time + nextStartTime) / 2);
      }
    }

    const aboveRow = insertIndex > 0 ? rows[insertIndex - 1] : null;

    const newRow = {
      id: nextId,
      location: "",
      time: newTime,
      event: "",
      duration: aboveRow ? aboveRow.duration : 30,
      isOutdoor: false,
      photo: photoEnabled,
      video: videoEnabled,
      notes: "",
      isTimeLocked: false,
      type: "event",
      address: "",
    };

    // Insert the new row at the correct position based on time order
    const newUserRows = [...userRows];
    
    // Find the correct insertion point in userRows based on time and display order
    let insertPosition = newUserRows.length; // Default to end
    
    // We need to insert based on the intended display position, not just time
    // Find the row that corresponds to rows[insertIndex] (the row we want to insert before)
    if (insertIndex < rows.length) {
      const targetRow = rows[insertIndex]; // The row we want to insert before
      // Find this row in userRows
      for (let i = 0; i < newUserRows.length; i++) {
        if (newUserRows[i].id === targetRow.id) {
          insertPosition = i;
          break;
        }
      }
    }
    
    
    // Insert the new row at the calculated position
    newUserRows.splice(insertPosition, 0, newRow);


    setNextId(nextId + 1);
    saveToHistory(applyCeremonyAnchorCascade(newUserRows, newRow.time));
  };

  // Append a new row at the end of the list
  const addRow = () => addRowAtIndex(rows.length);

  // Apply-to-all toggles
  const handlePhotoToggle = (checked) => {
    setPhotoEnabled(checked);
    setUserRows((prev) => prev.map((r) => ({ ...r, photo: checked })));
  };

  const handleVideoToggle = (checked) => {
    setVideoEnabled(checked);
    setUserRows((prev) => prev.map((r) => ({ ...r, video: checked })));
  };

  // Handle drops from the sidebar onto a specific row (by display index)
  const handleDropEventBlockToRow = (eventData, displayIndex) => {
    if (!eventData || typeof eventData.duration !== "number") return;

    // Translate display index (from rows) to actual userRows index using id mapping
    const displayRow = rows[displayIndex];
    if (!displayRow) return;
    const userRowIndex = userRows.findIndex((u) => u.id === displayRow.id);
    if (userRowIndex === -1) return;

    const updatedFields = eventData.type === "location"
      ? { type: "location", event: eventData.event || "", duration: eventData.duration, address: eventData.address || "", color: "" }
      : { type: "event", event: eventData.event, duration: eventData.duration };

    const newUserRows = userRows.map((r, i) => i === userRowIndex ? { ...r, ...updatedFields } : r);
    const targetRow = newUserRows[userRowIndex];

    // If dropped on the last visible row, append a fresh empty row
    const droppedOnLastVisible = displayIndex === rows.length - 1;
    if (droppedOnLastVisible) {
      newUserRows.push({
        id: nextId,
        location: "",
        time: targetRow.time + targetRow.duration,
        event: "",
        duration: 30,
        isOutdoor: false,
        photo: photoEnabled,
        video: videoEnabled,
        notes: "",
        isTimeLocked: false,
        type: "event",
        address: "",
      });
      setNextId(nextId + 1);
    }

    const cascaded = applyCeremonyAnchorCascade(newUserRows, targetRow.time);
    saveToHistory(cascaded);
  };

  // Drag and drop handlers for row reordering
  const handleDragStart = (e, rowId) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', rowId);
    // Normalize to string so UI comparisons are consistent
    setDraggedRowId(String(rowId));
    // Add a small delay to ensure the drag image is set
    setTimeout(() => {
      e.target.style.opacity = '0.4';
    }, 0);
  };

  const handleDragOver = (e, targetRowId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (targetRowId !== draggedRowId) {
      setIsDraggingOver(true);
    }
    
    // Add visual feedback for the drop target
    const targetElement = e.currentTarget;
    if (targetElement) {
      targetElement.style.borderTop = '2px solid #b8906a';
      targetElement.style.marginTop = '4px';
    }
  };

  const handleDragLeave = (e) => {
    setIsDraggingOver(false);
    // Remove visual feedback when leaving the drop target
    const targetElement = e.currentTarget;
    if (targetElement) {
      targetElement.style.borderTop = 'none';
      targetElement.style.marginTop = '0';
    }
  };

  const handleDragEnd = (e) => {
    // Reset styles
    e.target.style.opacity = '1';
    setDraggedRowId(null);
    setIsDraggingOver(false);
    // Remove any lingering drop indicators
    document.querySelectorAll('.timeline-row').forEach(el => {
      el.style.borderTop = 'none';
      el.style.marginTop = '0';
    });
  };


  // Handle dropping a dragged row between rows (at insertion index)
  const handleDropBetween = (e, insertIndex) => {
    if (!e?.dataTransfer?.types?.includes('text/plain')) return;
    e.preventDefault();
    const sourceRowId = e.dataTransfer.getData('text/plain');
    if (!sourceRowId) return;


    const working = [...userRows];
    const sourceIndex = working.findIndex((r) => r.id.toString() === sourceRowId);
    if (sourceIndex === -1) {
      console.error('[DnD] ERROR: source row not found');
      return;
    }

    // Remove the source row
    const [moved] = working.splice(sourceIndex, 1);
    // Adjust target insert index if needed (after removal, indices shift)
    let targetIndex = insertIndex;
    if (sourceIndex < insertIndex) targetIndex = Math.max(0, insertIndex - 1);


    // Insert at the drop zone's index
    working.splice(targetIndex, 0, moved);

    const recalculated = cascadeTimesByOrder(working);
    saveToHistory(recalculated);
    setDraggedRowId(null);
    setIsDraggingOver(false);
  };

  const buildDefaultFilename = (ext) => {
    const formatDatePart = (s) => {
      if (!s) return "";
      
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        const [y, m, d] = s.split("-");
        return `${m}_${d}_${y}`;
      }
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
        const [m, d, y] = s.split("/");
        return `${m}_${d}_${y}`;
      }
      const dt = new Date(s);
      if (!isNaN(dt.getTime())) {
        const mm = String(dt.getMonth() + 1).padStart(2, "0");
        const dd = String(dt.getDate()).padStart(2, "0");
        const yyyy = String(dt.getFullYear());
        return `${mm}_${dd}_${yyyy}`;
      }
      return "";
    };

    const sanitize = (str) =>
      String(str)
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9._()&-]/g, "");

    const datePart = formatDatePart(date) || "MM_DD_YYYY";
    // Derive first names safely from the existing bride/groom inputs
    const brideFirst = (bride || "Bride").toString().trim().split(/\s+/)[0] || "Bride";
    const groomFirst = (groom || "Groom").toString().trim().split(/\s+/)[0] || "Groom";

    const base =
      datePart +
      "_" +
      sanitize(brideFirst) +
      "_&_" +
      sanitize(groomFirst) +
      "_Timeline";
    return base + "." + ext;
  };

  const buildProjectData = () => ({
    date,
    bride,
    groom,
    brideLabel,
    groomLabel,
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
    photoEnabled,
    videoEnabled,
    userRows,
    fixedEvents,
  });

  const applyProjectData = (projectData) => {
    suppressDirtyRef.current = true;
    setDate(projectData.date || "");
    setBride(projectData.bride || "");
    setGroom(projectData.groom || "");
    setBrideLabel(projectData.brideLabel || "Bride");
    setGroomLabel(projectData.groomLabel || "Groom");

    setPhotoStartHour(projectData.photoStartHour || "12");
    setPhotoStartMinute(projectData.photoStartMinute || "00");
    setPhotoStartPeriod(projectData.photoStartPeriod || "PM");
    setPhotoEndHour(projectData.photoEndHour || "5");
    setPhotoEndMinute(projectData.photoEndMinute || "00");
    setPhotoEndPeriod(projectData.photoEndPeriod || "PM");

    setVideoStartHour(projectData.videoStartHour || "12");
    setVideoStartMinute(projectData.videoStartMinute || "00");
    setVideoStartPeriod(projectData.videoStartPeriod || "PM");
    setVideoEndHour(projectData.videoEndHour || "5");
    setVideoEndMinute(projectData.videoEndMinute || "00");
    setVideoEndPeriod(projectData.videoEndPeriod || "PM");

    setPhotoEnabled(
      typeof projectData.photoEnabled === "boolean" ? projectData.photoEnabled : true
    );
    setVideoEnabled(
      typeof projectData.videoEnabled === "boolean" ? projectData.videoEnabled : true
    );

    const loadedRows = projectData.userRows;
    setUserRows(
      loadedRows && loadedRows.length > 0
        ? loadedRows.map((r) => ({
            photo: true,
            video: true,
            notes: "",
            ...r,
          }))
        : [
            {
              id: 1,
              location: "",
              time: 12 * 60,
              event: "",
              duration: 30,
              isOutdoor: false,
              photo: true,
              video: true,
              notes: "",
              isTimeLocked: false,
            },
          ]
    );

    if (loadedRows && loadedRows.length > 0) {
      const maxId = Math.max(...loadedRows.map((r) => r.id || 0));
      setNextId(maxId + 1);
    } else if (projectData.nextId) {
      setNextId(projectData.nextId);
    }

    setFixedEvents(projectData.fixedEvents || []);
    setHistory([]);
    setRedoStack([]);
  };

  const saveProject = () => {
    const dataStr = JSON.stringify(buildProjectData(), null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = buildDefaultFilename("json");
    link.click();
    URL.revokeObjectURL(url);
    clearDirty();
  };

  const loadProject = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const projectData = JSON.parse(e.target.result);
        isApplyingProjectRef.current = true;
        applyProjectData(projectData);
        clearDirty();
        setScreen("timeline");
        isApplyingProjectRef.current = false;
      } catch (err) {
        alert("Error loading project file");
        isApplyingProjectRef.current = false;
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const startNewTimeline = () => {
    clearDirty();
    setShowUnsavedConfirm(false);
    setWizardStep(1);
    setScreen("welcome");
    setShowMobileMenu(false);
  };

  const requestNewTimeline = () => {
    if (isDirty && !isTimelineEmpty()) {
      setShowUnsavedConfirm(true);
      return;
    }
    startNewTimeline();
  };

  // Wizard location helpers
  const addWizLocation = () => {
    setWiz_locations(prev => [...prev, { id: wiz_locationNextId, name: "", address: "", distFromCeremony: "", distFromReception: "" }]);
    setWiz_locationNextId(n => n + 1);
  };
  const updateWizLocation = (id, field, value) => {
    setWiz_locations(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  };
  const removeWizLocation = (id) => {
    setWiz_locations(prev => prev.filter(l => l.id !== id));
  };

  const closeMobileGearMenu = () => setShowMobileMenu(false);

  // Close export / mobile gear menus when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
      if (mobileGearMenuRef.current && !mobileGearMenuRef.current.contains(e.target)) {
        setShowMobileMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const exportPDF = async () => {
    setExporting(true);
    setShowExportMenu(false);
    closeMobileGearMenu();
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'pt', format: 'letter' });
      const allPages = layoutPreviewPages(userRows);
      const brideFirst = (bride || 'Bride').trim().split(/\s+/)[0];
      const groomFirst = (groom || 'Groom').trim().split(/\s+/)[0];

      allPages.forEach((pageRows, pi) => {
        if (pi > 0) doc.addPage();
        if (pi === 0) {
          let hy = MY_TOP + 14;
          doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(184, 144, 106);
          doc.text('WEDDING POTION', PW / 2, hy, { align: 'center', charSpace: 1.5 });
          hy += 24;
          doc.setFont('times', 'normal'); doc.setFontSize(24); doc.setTextColor(26, 26, 26);
          doc.text(`${bride || 'Bride'} & ${groom || 'Groom'}`, PW / 2, hy, { align: 'center' });
          hy += 18;
          doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(90, 90, 90);
          doc.text(fmtDateLong(date), PW / 2, hy, { align: 'center', charSpace: 0.5 });
          hy += 13;
          const covParts = [];
          if (photoEnabled) covParts.push(`Photo: ${photoStartHour}:${photoStartMinute} ${photoStartPeriod} - ${photoEndHour}:${photoEndMinute} ${photoEndPeriod}`);
          if (videoEnabled) covParts.push(`Video: ${videoStartHour}:${videoStartMinute} ${videoStartPeriod} - ${videoEndHour}:${videoEndMinute} ${videoEndPeriod}`);
          if (covParts.length > 0) { doc.setFontSize(7.5); doc.setTextColor(140, 140, 140); doc.text(covParts.join('   -   '), PW / 2, hy, { align: 'center' }); }
          doc.setDrawColor(184, 144, 106); doc.setLineWidth(0.75);
          doc.line(MX, MY_TOP + HDR_H - 6, PW - MX, MY_TOP + HDR_H - 6);
        }
        const csY = pi === 0 ? MY_TOP + HDR_H : MY_TOP;
        doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(184, 144, 106);
        doc.text('TIME', MX, csY + 13);
        doc.text('EVENT', MX + COL_TIME, csY + 13);
        doc.text('MIN', PW - MX - COL_SET - 2, csY + 13, { align: 'right' });
        doc.text('SETTING', PW - MX - COL_SET / 2, csY + 13, { align: 'center' });
        doc.setDrawColor(184, 144, 106); doc.setLineWidth(0.5);
        doc.line(MX, csY + RH_COL, PW - MX, csY + RH_COL);
        let y = csY + RH_COL + 4;
        for (const row of pageRows) {
          const t = formatTime(row.time);
          const ts = `${t.hour}:${t.minute} ${t.period}`;
          if (row.type === 'location') {
            doc.setFillColor(248, 246, 243); doc.rect(MX, y, CW, RH_LOC, 'F');
            doc.setFillColor(184, 144, 106); doc.rect(MX, y, 3, RH_LOC, 'F');
            doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(160, 160, 160);
            doc.text(ts, MX + 8, y + 11);
            doc.setFontSize(10); doc.setTextColor(26, 26, 26);
            doc.text(row.event || '(Travel)', MX + 8, y + 23, { maxWidth: CW - 16 });
            if (row.address && row.address.trim()) { doc.setFontSize(8); doc.setTextColor(100, 100, 100); doc.text(row.address.trim(), MX + 8, y + 34, { maxWidth: CW - 16 }); }
            doc.setFontSize(7.5); doc.setTextColor(150, 150, 150);
            doc.text(`Travel: ${row.duration} min`, MX + 8, y + RH_LOC - 5);
            y += RH_LOC + RH_GAP;
          } else if (row.type === 'constraint') {
            doc.setFillColor(255, 245, 245); doc.rect(MX, y, CW, RH_CON, 'F');
            doc.setFillColor(204, 68, 68); doc.rect(MX, y, 3, RH_CON, 'F');
            doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(150, 150, 150);
            doc.text(ts, MX + 8, y + RH_CON / 2 + 3);
            doc.setTextColor(204, 68, 68); doc.setFontSize(9);
            doc.text('[!] TIME CONSTRAINT', MX + COL_TIME, y + RH_CON / 2 + 3);
            y += RH_CON + RH_GAP;
          } else {
            const [ar, ag, ab] = hexToRgb(getEventColor(row.event));
            doc.setFillColor(ar, ag, ab); doc.rect(MX, y, 2.5, RH_EVT, 'F');
            doc.setDrawColor(240, 237, 232); doc.setLineWidth(0.4);
            doc.line(MX, y + RH_EVT, PW - MX, y + RH_EVT);
            doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(50, 50, 50);
            doc.text(ts, MX + 5, y + 14);
            doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(26, 26, 26);
            doc.text(row.event || '(empty)', MX + COL_TIME, y + 14, { maxWidth: CW - COL_TIME - COL_DUR - COL_SET - 4 });
            doc.setFontSize(8.5); doc.setTextColor(110, 110, 110);
            doc.text(String(row.duration), PW - MX - COL_SET - 4, y + 14, { align: 'right' });
            doc.setFontSize(8); doc.setTextColor(80, 80, 80);
            doc.text(row.isOutdoor ? 'OUT' : 'IN', PW - MX - COL_SET / 2, y + 14, { align: 'center' });
            y += RH_EVT;
            if (row.notes && row.notes.trim()) {
              doc.setFont('times', 'italic'); doc.setFontSize(8); doc.setTextColor(130, 130, 130);
              const wrapped = doc.splitTextToSize(row.notes.trim(), CW - COL_TIME - COL_DUR - COL_SET - 8);
              doc.text(wrapped, MX + COL_TIME, y + 10);
              y += wrapped.length * RH_NOTE;
            }
            y += RH_GAP;
          }
        }
        const ftrY = PH - MY_BOT + 4;
        doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.4);
        doc.line(MX, ftrY - 6, PW - MX, ftrY - 6);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(180, 180, 180);
        doc.text(`${bride || 'Bride'} & ${groom || 'Groom'} - ${fmtDateLong(date)}`, MX, ftrY);
        doc.text(`${pi + 1} of ${allPages.length}`, PW - MX, ftrY, { align: 'right' });
      });
      doc.save(`${brideFirst}-${groomFirst}-Wedding-Timeline.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const exportTimeline = () => {
    const sortedRows = [...userRows].sort((a, b) => a.time - b.time);

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
        // Location block: compact single-line format
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

      // Always include Time
      lines.push(`Time: ${time.hour}:${time.minute} ${time.period}`);

      // Always include Event
      lines.push(`Event: ${row.event || "(no event)"}`);

      // Always include Duration
      lines.push(`Duration: ${row.duration} minutes`);

      // Include Coverage only if there is coverage
      if (coverage.length > 0) {
        lines.push(`Coverage: ${coverage.join(" & ")}`);
      }

      // Always include Setting
      lines.push(`Setting: ${row.isOutdoor ? "Outside" : "Indoors"}`);

      // Include Notes only if it has content
      if (row.notes && row.notes.trim()) {
        lines.push(`Notes: ${row.notes}`);
      }

      // Add empty line after each row
      lines.push("");
    });

    const timeline = lines.join("\n"); // <- real newlines
    const dataBlob = new Blob([timeline], { type: "text/plain" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = buildDefaultFilename("txt");
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyTimeline = async () => {
    const sortedRows = [...userRows].sort((a, b) => a.time - b.time);
    const lines = [];
    lines.push(`Wedding Timeline for ${bride} & ${groom}`);
    lines.push(`Date: ${date}`, "");
    lines.push(`Photo Coverage: ${photoStartHour}:${photoStartMinute} ${photoStartPeriod} - ${photoEndHour}:${photoEndMinute} ${photoEndPeriod}`);
    lines.push(`Video Coverage: ${videoStartHour}:${videoStartMinute} ${videoStartPeriod} - ${videoEndHour}:${videoEndMinute} ${videoEndPeriod}`, "", "TIMELINE:", "");
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
    const text = lines.join("\n");
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
  };

  const undo = () => {
    if (history.length > 0) {
      const newHistory = [...history];
      const previousState = newHistory.pop();
      setRedoStack([userRows, ...redoStack]);
      setUserRows(previousState);
      setHistory(newHistory);
    }
  };
  const redo = () => {
    if (redoStack.length > 0) {
      const newRedoStack = [...redoStack];
      const nextState = newRedoStack.shift();
      setHistory([...history, userRows]);
      setUserRows(nextState);
      setRedoStack(newRedoStack);
    }
  };

  const handleTimeSet = (displayIndex, time) => {
    const row = rows[displayIndex];
    const userRowIndex = userRows.findIndex((u) => u.id === row.id);
    if (userRowIndex === -1) return;

    const newUserRows = [...userRows];
    newUserRows[userRowIndex].time = time;
    saveToHistory(newUserRows);
  };

  // ---- Project Settings helpers ----
  const settingsSelectStyle = {
    padding: "8px 10px",
    borderRadius: 6,
    border: "1px solid #2a2520",
    background: "#0f0d0b",
    color: "#ddd0bc",
    fontFamily: "'Jost', sans-serif",
    fontSize: 14,
  };

  const addFixedEvent = (eventName = "", h = "12", m = "00", p = "PM", dur = 30) => {
    setFixedEvents((prev) => [
      ...prev,
      { id: fixedEventNextId, event: eventName, timeHour: h, timeMinute: m, timePeriod: p, duration: dur },
    ]);
    setFixedEventNextId((n) => n + 1);
  };

  const updateFixedEvent = (id, field, value) => {
    setFixedEvents((prev) =>
      prev.map((fe) => (fe.id === id ? { ...fe, [field]: value } : fe))
    );
  };

  const removeFixedEvent = (id) => {
    setFixedEvents((prev) => prev.filter((fe) => fe.id !== id));
  };

  const renderHourOptions = () =>
    ["1","2","3","4","5","6","7","8","9","10","11","12"].map((h) => (
      <option key={h} value={h}>{h}</option>
    ));

  const renderMinuteOptions = () =>
    ["00","05","10","15","20","25","30","35","40","45","50","55"].map((m) => (
      <option key={m} value={m}>{m}</option>
    ));

  const generateTimeline = () => {

    // ---- Setup ----
    const ceremonyDurationMin = wiz_ceremonyDuration || 30;
    const ceremonyStartTime = parseTimeInput(wiz_ceremonyHour, wiz_ceremonyMinute, wiz_ceremonyPeriod);
    const receptionStartTime = parseTimeInput(wiz_receptionHour, wiz_receptionMinute, wiz_receptionPeriod);
    const groupShotsBeforeCeremony = wiz_firstLookGroom || wiz_brideOkayBefore === true;
    const parseTravelMin = (str) => { const n = parseInt(str, 10); return isNaN(n) ? 0 : n; };

    // ---- Smart portrait scheduling: determine pre vs. post-ceremony placement ----
    const ceremonyEndTime = ceremonyStartTime + ceremonyDurationMin;
    // First fixed reception event the couple must attend determines available post-ceremony window
    let firstFixedReceptionTime = receptionStartTime;
    if (wiz_grandEntrance) {
      firstFixedReceptionTime = receptionStartTime + 20; // Grand Entrance follows A/V setup (20 min)
      if (wiz_dinner) {
        const dinnerT = parseTimeInput(wiz_dinnerStartHour, wiz_dinnerStartMinute, wiz_dinnerStartPeriod);
        if (dinnerT < firstFixedReceptionTime) firstFixedReceptionTime = dinnerT;
      }
    } else if (wiz_dinner) {
      firstFixedReceptionTime = parseTimeInput(wiz_dinnerStartHour, wiz_dinnerStartMinute, wiz_dinnerStartPeriod);
    }
    const familyDuration = wiz_familyGroups === "5" ? 20 : wiz_familyGroups === "10" ? 45 : 0;
    const availablePostCeremony = firstFixedReceptionTime - ceremonyEndTime;
    const remainingAfterFamily = availablePostCeremony - familyDuration;
    const neitherFitsPost = remainingAfterFamily < 15;
    const bothFitPost     = remainingAfterFamily >= 35;
    // Pre-ceremony flags: only when post-ceremony time is insufficient and couple can be seen before
    const weddingPartyPre = neitherFitsPost && groupShotsBeforeCeremony;
    const brideGroomPre   = !bothFitPost && groupShotsBeforeCeremony;

    // Golden hour by month (Northern Michigan, sunset − 45 min)
    const GOLDEN_HOUR_BY_MONTH = [990, 1035, 1125, 1170, 1200, 1230, 1215, 1170, 1125, 1080, 990, 960];
    let goldenHourTime = null;
    let weddingMonth = null;
    if (date) {
      const parts = date.split("-");
      if (parts.length >= 2) {
        const m = parseInt(parts[1], 10) - 1;
        if (m >= 0 && m <= 11) { weddingMonth = m; goldenHourTime = GOLDEN_HOUR_BY_MONTH[m]; }
      }
    }

    const familyGroupNotes = wiz_familyGroups !== "none" && wiz_familyGroupNames.some(n => n)
      ? wiz_familyGroupNames.filter(Boolean).map((n, i) => `${i + 1}. ${n}`).join(", ")
      : "";

    const differentLocations = !wiz_groomReadyAtCeremony && !wiz_groomReadyAtReception && !wiz_groomReadyAtBride && !!wiz_groomReadyAddress;
    const ceremonyVenueName = wiz_ceremonyVenue || "ceremony venue";
    const effectiveReceptionVenue = wiz_receptionSameAsCeremony ? ceremonyVenueName : (wiz_receptionVenue || "reception venue");
    const effectiveReceptionAddress = wiz_receptionSameAsCeremony ? (wiz_ceremonyAddress || "") : (wiz_receptionAddress || "");
    const brideLoc = wiz_brideReadyAddress || "Getting Ready Location";
    const groomLoc = differentLocations ? (wiz_groomReadyAddress || "Groom's Getting Ready Location") : brideLoc;

    // ---- Classify each first look into the phase where it will occur ----
    // Phase = "bride" | "groom" | "ceremony"
    // Never detour — if location unrecognised or unset, default to ceremony
    const classifyFL = (locVal) => {
      if (!locVal) return "ceremony";
      if (locVal === brideLoc) return "bride";
      if (differentLocations && locVal === groomLoc) return "groom";
      if (locVal === ceremonyVenueName) return "ceremony";
      return "ceremony";
    };
    const flGroomPhase    = wiz_firstLookGroom       ? classifyFL(wiz_firstLookGroomLocation)       : null;
    const flParentPhase   = wiz_firstLookParent      ? classifyFL(wiz_firstLookParentLocation)      : null;
    const flBmaidsPhase   = wiz_firstLookBridesmaids ? classifyFL(wiz_firstLookBridesmaidsLocation)  : null;
    const flOtherPhase    = wiz_firstLookOther       ? classifyFL(wiz_firstLookOtherLocation)       : null;

    const pushFLForPhase = (phase, arr) => {
      if (flGroomPhase  === phase) arr.push({ event: "First Look: with Groom",      duration: 10, isOutdoor: true });
      if (flParentPhase === phase) arr.push({ event: "First Look: with Parent",     duration: 10, isOutdoor: true });
      if (flBmaidsPhase === phase) arr.push({ event: "First Look: with Bridesmaids", duration: 10, isOutdoor: true });
      if (flOtherPhase  === phase) arr.push({ event: "First Look: Other",           duration: 10, isOutdoor: true });
    };

    // ---- Build pre-ceremony blocks (scheduled backwards from ceremony start) ----
    const preBlocks = [];

    // === Phase 1: Bride's getting ready location ===
    // First block of the day — duration 0, establishes starting location
    preBlocks.push({ type: "location", event: brideLoc, address: "", duration: 0, notes: "Start of day" });
    // Detail shots (earliest in the day)
    if (wiz_drone) preBlocks.push({ event: "Details: Drone & Venue Shots", duration: 30, isOutdoor: true });
    preBlocks.push({ event: "Details: Rings, Invitations, & Accessories", duration: 20 });
    preBlocks.push({ event: "Details: Dress Shots", duration: 10 });
    // Bride narration before portrait blocks
    if (wiz_narration) preBlocks.push({ event: "Narration: Bride Record Narration", duration: 15 });
    // Bride pre-dress
    preBlocks.push({ event: "Bride (Pre-Dress): Bridesmaids Group Shots",    duration: 10, isOutdoor: true });
    preBlocks.push({ event: "Bride (Pre-Dress): Bridesmaids Individual Shots", duration: 10, isOutdoor: true });
    preBlocks.push({ event: "Bride (Pre-Dress): Hair & Makeup Details",     duration: 10 });
    preBlocks.push({ event: "Bride (Pre-Dress): Putting Dress On",          duration: 10 });
    // Bride dress on (first looks can only occur after Putting Dress On)
    preBlocks.push({ event: "Bride (Dress On): Accessory Shots",            duration: 10 });
    preBlocks.push({ event: "Bride (Dress On): Bride Portraits",            duration: 15, isOutdoor: true });
    preBlocks.push({ event: "Bride (Dress On): Bridesmaids Group Shots",     duration: 10, isOutdoor: true });
    preBlocks.push({ event: "Bride (Dress On): Bridesmaids Individual Shots",duration: 10, isOutdoor: true });
    // First looks assigned to bride's getting ready location
    pushFLForPhase("bride", preBlocks);

    // === Phase 2 / 2b: Groom events ===
    if (differentLocations) {
      // Phase 2: different location — travel block to groom's location
      const travelBrideToGroom = parseTravelMin(wiz_distanceBetweenReady) || 15;
      preBlocks.push({ type: "location", event: groomLoc, address: "", duration: travelBrideToGroom, notes: `Travel from ${brideLoc} to ${groomLoc}` });
    }
    // Groom narration before groom portrait blocks
    if (wiz_narration) preBlocks.push({ event: "Narration: Groom Record Narration", duration: 15 });
    preBlocks.push({ event: "Groom: Assisted with Tie & Jacket",  duration: 10 });
    preBlocks.push({ event: "Groom: Portraits",                   duration: 15, isOutdoor: true });
    preBlocks.push({ event: "Groom: Groomsmen Group Shots",       duration: 10, isOutdoor: true });
    preBlocks.push({ event: "Groom: Groomsmen Individual Shots",  duration: 10, isOutdoor: true });
    // First looks assigned to groom's location (only applies when differentLocations; otherwise
    // groomLoc === brideLoc so classifyFL returns "bride" and they were already pushed above)
    if (differentLocations) pushFLForPhase("groom", preBlocks);

    // === Phase 3: Ceremony venue ===
    const lastPreLocName = differentLocations ? groomLoc : brideLoc;
    const toCeremonyMin = differentLocations
      ? parseTravelMin(wiz_distanceGroomToCeremony)
      : parseTravelMin(wiz_distanceBrideToCeremony);
    preBlocks.push({
      type: "location",
      event: ceremonyVenueName,
      address: wiz_ceremonyAddress || "",
      duration: toCeremonyMin,
      notes: toCeremonyMin > 0 ? `Travel from ${lastPreLocName} to ${ceremonyVenueName}` : ""
    });
    // First looks assigned to ceremony venue (happens before couple/party portraits)
    pushFLForPhase("ceremony", preBlocks);
    // Pre-ceremony portraits only when post-ceremony time is insufficient
    if (weddingPartyPre) preBlocks.push({ event: "Wedding Party: Group Shots", duration: 15, isOutdoor: true });
    if (brideGroomPre)   preBlocks.push({ event: "Bride & Groom: Portraits",   duration: 20, isOutdoor: true });
    // A/V setup always immediately before ceremony — nothing between them
    preBlocks.push({ event: "Ceremony: Audio/Video Setup", duration: 20 });

    // === Schedule preBlocks backwards from ceremony start ===
    const totalPreDuration = preBlocks.reduce((sum, b) => sum + b.duration, 0);
    const preStart = ceremonyStartTime - totalPreDuration;
    let pt = preStart;
    for (const block of preBlocks) { block.time = pt; pt += block.duration; }

    // ---- Ceremony ----
    const ceremonyEventName = wiz_ceremonyDuration <= 45 ? "Ceremony: Average" : "Ceremony: Catholic";
    const ceremonyBlocks = [{ event: ceremonyEventName, duration: ceremonyDurationMin, time: ceremonyStartTime, isOutdoor: wiz_ceremonyOutdoor }];

    // ---- Post-ceremony (Phase 3 continues at ceremony venue) ----
    const postBlocks = [];
    let postT = ceremonyStartTime + ceremonyDurationMin;
    const pushPost = (block) => { block.time = postT; postT += block.duration; postBlocks.push(block); };

    // Family photos — always immediately after ceremony, before anything else
    if (wiz_familyGroups === "5")  pushPost({ event: "Group Photos: Family (5 Groups)",  duration: 20, notes: familyGroupNotes, isOutdoor: true });
    if (wiz_familyGroups === "10") pushPost({ event: "Group Photos: Family (10 Groups)", duration: 45, notes: familyGroupNotes, isOutdoor: true });
    // Wedding Party: post if time allows; TIME CONSTRAINT if neither fits and can't go pre-ceremony
    if (!neitherFitsPost) {
      pushPost({ event: "Wedding Party: Group Shots", duration: 15, isOutdoor: true });
    } else if (!groupShotsBeforeCeremony) {
      pushPost({ type: "constraint", event: "TIME CONSTRAINT", duration: 0, notes: "Not enough post-ceremony time for Wedding Party Group Shots. Consider a later reception start or fewer family groups." });
    }
    // B&G Portraits: post if both fit; TIME CONSTRAINT if can't fit and can't go pre-ceremony
    if (bothFitPost) {
      pushPost({ event: "Bride & Groom: Portraits", duration: 20, isOutdoor: true });
    } else if (!groupShotsBeforeCeremony) {
      pushPost({ type: "constraint", event: "TIME CONSTRAINT", duration: 0, notes: "Not enough post-ceremony time for Bride & Groom Portraits. Consider a later reception start, fewer family groups, a first look, or the couple being visible to each other before the ceremony." });
    }

    // === Phase 4: Portrait locations (visit each once in order) ===
    if (wiz_portraitLocations.length > 0) {
      wiz_portraitLocations.forEach((loc, i) => {
        const fromName = i === 0
          ? ceremonyVenueName
          : (wiz_portraitLocations[i - 1].name || `Portrait Location ${i}`);
        const travelMin = i === 0 ? parseTravelMin(loc.distFromCeremony) : 0;
        pushPost({
          type: "location",
          event: loc.name || `Portrait Location ${i + 1}`,
          address: loc.address || "",
          duration: travelMin,
          notes: travelMin > 0 ? `Travel from ${fromName} to ${loc.name || `Portrait Location ${i + 1}`}` : ""
        });
        pushPost({ event: "Bride & Groom: Portraits", duration: 20, location: loc.name || "", isOutdoor: true });
      });
      // Travel from last portrait location to reception
      const lastPortraitLoc = wiz_portraitLocations[wiz_portraitLocations.length - 1];
      const travelToReception = parseTravelMin(lastPortraitLoc.distFromReception);
      if (travelToReception > 0) {
        pushPost({ type: "location", event: effectiveReceptionVenue, address: effectiveReceptionAddress, duration: travelToReception, notes: `Travel from ${lastPortraitLoc.name || "portrait location"} to ${effectiveReceptionVenue}` });
      }
    }

    // Travel from ceremony to reception (only when no portrait locations handle the transit)
    if (wiz_portraitLocations.length === 0 && !wiz_receptionSameAsCeremony) {
      const travelCeremonyToReception = parseTravelMin(wiz_distanceReceptionToCeremony);
      if (travelCeremonyToReception > 0) {
        pushPost({ type: "location", event: effectiveReceptionVenue, address: effectiveReceptionAddress, duration: travelCeremonyToReception, notes: `Travel from ${ceremonyVenueName} to ${effectiveReceptionVenue}` });
      }
    }

    // Time constraint if post-ceremony events run past reception start
    if (postT > receptionStartTime && postBlocks.length > 0) {
      const recFmt = formatTime(receptionStartTime);
      const postFmt = formatTime(postT);
      pushPost({
        type: "constraint",
        event: "TIME CONSTRAINT",
        duration: 0,
        time: receptionStartTime,
        notes: `Not enough time to complete post-ceremony events before reception start (${recFmt.hour}:${recFmt.minute} ${recFmt.period}). Post-ceremony events would end at ${postFmt.hour}:${postFmt.minute} ${postFmt.period}. Consider starting the reception later, reducing family groupings, or removing some portrait locations.`,
      });
    }

    // Golden hour — time-anchored to calculated golden hour, with notes if it conflicts
    let goldenHourBlock = null;
    if (wiz_goldenHour) {
      const ceremonyEnd = ceremonyStartTime + ceremonyDurationMin;
      goldenHourBlock = { event: "Bride & Groom: Golden Hour Portraits", duration: 20, notes: "", isOutdoor: true };
      if (goldenHourTime !== null && weddingMonth !== null) {
        const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        const ghStartFmt = formatTime(goldenHourTime);
        const ghEndFmt = formatTime(goldenHourTime + 20);
        const ghTimeNote = `Estimated golden hour: ${ghStartFmt.hour}:${ghStartFmt.minute} ${ghStartFmt.period} – ${ghEndFmt.hour}:${ghEndFmt.minute} ${ghEndFmt.period} based on a ${MONTH_NAMES[weddingMonth]} wedding in Northern Michigan.`;
        goldenHourBlock.time = goldenHourTime;
        if (goldenHourTime < ceremonyEnd) {
          goldenHourBlock.notes = `Golden hour falls before or during ceremony. Consider scheduling portraits immediately after. ${ghTimeNote}`;
        } else if (goldenHourTime >= receptionStartTime) {
          goldenHourBlock.notes = `Golden hour falls during reception. Couple may want to step away briefly for portraits. ${ghTimeNote}`;
        } else {
          goldenHourBlock.notes = ghTimeNote;
        }
      } else {
        goldenHourBlock.time = postT;
      }
    }

    // === Phase 5: Reception venue ===
    const receptionBlocks = [];
    let recT = receptionStartTime;
    const addRec = (block) => { block.time = recT; recT += block.duration; receptionBlocks.push(block); };

    // Location marker at reception start — skip if same venue as ceremony (no travel needed)
    if (!wiz_receptionSameAsCeremony) {
      addRec({ type: "location", event: effectiveReceptionVenue, address: effectiveReceptionAddress, duration: 0, notes: "" });
    }
    // A/V setup always first at reception, Grand Entrance always immediately after
    addRec({ event: "Reception: Audio/Video Setup", duration: 20 });
    if (wiz_grandEntrance) addRec({ event: "Reception: Grand Entrances", duration: 10 });
    if (wiz_cakeCutting)   addRec({ event: "Reception: Cake Cutting", duration: 5 });
    if (wiz_firstDance)    addRec({ event: "Reception: Bride & Groom Dance", duration: 5 });
    if (wiz_brideParentDance) addRec({ event: "Reception: Bride & Parent Dance", duration: 5 });
    if (wiz_groomParentDance) addRec({ event: "Reception: Groom & Parent Dance", duration: 5 });
    if (wiz_specialDance)  addRec({ event: "Reception: Special Dance", duration: 5 });
    if (wiz_dinner) {
      const dinnerTime = parseTimeInput(wiz_dinnerStartHour, wiz_dinnerStartMinute, wiz_dinnerStartPeriod);
      recT = Math.max(recT, dinnerTime);
      addRec({ event: "Reception: Dinner", duration: 60, notes: wiz_dinnerStyle ? `Style: ${wiz_dinnerStyle}` : "" });
    }
    if (wiz_speeches)       addRec({ event: "Reception: Speeches (Per Speaker)", duration: 10 * wiz_speechCount, notes: `${wiz_speechCount} speaker${wiz_speechCount !== 1 ? "s" : ""} total` });
    if (wiz_openDanceFloor) addRec({ event: "Reception: Open Dance Floor", duration: 20 });
    if (wiz_garterToss)     addRec({ event: "Reception: Garder Belt Toss", duration: 15 });
    if (wiz_bouquetToss)    addRec({ event: "Reception: Bouquet Toss", duration: 15 });

    // ---- Assemble rows ----
    const allBlocks = [
      ...preBlocks, ...ceremonyBlocks, ...postBlocks,
      ...(goldenHourBlock ? [goldenHourBlock] : []),
      ...receptionBlocks,
    ];

    const newRows = allBlocks.map((block, idx) => ({
      id: idx + 1,
      event: block.event,
      time: block.time,
      duration: block.duration,
      location: block.location || "",
      isOutdoor: block.isOutdoor || false,
      photo: photoEnabled,
      video: videoEnabled,
      notes: block.notes || "",
      isTimeLocked: false,
      color: block.color || "",
      type: block.type || "event",
      address: block.address || "",
    }));
    setUserRows(newRows);
    setNextId(newRows.length + 1);
    setHistory([]);
    setRedoStack([]);

    // Set photo/video coverage windows from Step 1 hours
    if (allBlocks.length > 0) {
      const coverageStart = allBlocks[0].time;
      if (wiz_photoCoverageHours) {
        const photoEnd = coverageStart + parseFloat(wiz_photoCoverageHours) * 60;
        const ps = formatTime(coverageStart); const pe = formatTime(photoEnd);
        setPhotoStartHour(ps.hour); setPhotoStartMinute(ps.minute); setPhotoStartPeriod(ps.period);
        setPhotoEndHour(pe.hour); setPhotoEndMinute(pe.minute); setPhotoEndPeriod(pe.period);
      }
      if (wiz_videoCoverageHours) {
        const videoEnd = coverageStart + parseFloat(wiz_videoCoverageHours) * 60;
        const vs = formatTime(coverageStart); const ve = formatTime(videoEnd);
        setVideoStartHour(vs.hour); setVideoStartMinute(vs.minute); setVideoStartPeriod(vs.period);
        setVideoEndHour(ve.hour); setVideoEndMinute(ve.minute); setVideoEndPeriod(ve.period);
      }
    }

    setScreen("timeline");
    setShowSettingsModal(false);
    if (mainScrollRef.current) mainScrollRef.current.scrollTop = 0;
  };  // ---- Wizard Rendering ----
  const renderWizard = (inModal = false, overrideStep = null) => {
    const effectiveStep = overrideStep !== null ? overrideStep : wizardStep;
    const totalWizardSteps = 8;
    const displayStep = effectiveStep > 7 ? effectiveStep - 1 : effectiveStep;

    // All named locations from Step 2 in display order
    const allWizLocations = [
      ...(wiz_ceremonyVenue ? [wiz_ceremonyVenue] : []),
      ...(!wiz_receptionSameAsCeremony && wiz_receptionVenue ? [wiz_receptionVenue] : []),
      ...(!wiz_brideReadyAtCeremony && !wiz_brideReadyAtReception && wiz_brideReadyAddress ? [wiz_brideReadyAddress] : []),
      ...(!wiz_groomReadyAtCeremony && !wiz_groomReadyAtReception && !wiz_groomReadyAtBride && wiz_groomReadyAddress ? [wiz_groomReadyAddress] : []),
      ...wiz_locations.filter(l => l.name).map(l => l.name),
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
            {/* Progress bar */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6e6358", marginBottom: 6, fontFamily: "'Jost', sans-serif", letterSpacing: "0.1em" }}>
                <span>Step {displayStep} of {totalWizardSteps}</span>
              </div>
              <div style={{ height: 3, background: "#161310", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(displayStep / totalWizardSteps) * 100}%`, background: "linear-gradient(90deg, #b8906a, #cfa882)", borderRadius: 2, transition: "width 0.3s ease" }} />
              </div>
            </div>

            <div style={{ background: "#0f0d0b", border: "1px solid #1e1c19", borderRadius: 12, padding: "24px 20px", marginBottom: 20 }}>
              <h2 style={{ margin: "0 0 8px 0", fontSize: "clamp(22px,4vw,32px)", color: "#ddd0bc", fontWeight: 400, fontFamily: "'Cormorant Garamond', serif" }}>{title}</h2>
              <p style={{ margin: "0 0 24px 0", fontSize: 14, color: "#6e6358", lineHeight: 1.5, fontFamily: "'Jost', sans-serif", fontWeight: 300 }}>{subtitle}</p>
              {content}
            </div>

            {/* Navigation row */}
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <button
                onClick={backFn}
                style={{ padding: "12px 28px", border: "1px solid #b8906a", borderRadius: 8, background: "transparent", color: "#ddd0bc", fontSize: 15, cursor: "pointer", fontFamily: "'Jost', sans-serif", fontWeight: 300, transition: "all 0.2s" }}
              >
                Back
              </button>
              <button
                onClick={nextFn}
                style={{ padding: "12px 32px", background: "#b8906a", color: "#060504", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 400, cursor: "pointer", fontFamily: "'Jost', sans-serif" }}
              >
                {nextLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
    };

    // Step 2 — Locations
    if (effectiveStep === 2) {
      const mandatoryLocStyle = { border: "1px solid #1e1c19", borderRadius: 8, padding: "14px 14px 12px", marginBottom: 16, background: "#161310" };
      const mandatoryLabelStyle = { display: "block", fontSize: 13, fontWeight: 300, color: "#6e6358", marginBottom: 4, fontFamily: "'Jost', sans-serif", letterSpacing: "0.05em" };
      const mandatoryInputStyle = { width: "100%", padding: 9, border: "1px solid #2a2520", borderRadius: 6, fontSize: 14, boxSizing: "border-box", background: "#0f0d0b", color: "#ddd0bc", fontFamily: "'Jost', sans-serif" };
      const travelStepper = (value, onChange, label = "How far is this location to the ceremony location?") => {
        const mins = parseInt(value) || 0;
        return (
          <div style={{ marginTop: 12 }}>
            <label style={{ ...mandatoryLabelStyle, marginBottom: 6 }}>{label}</label>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => onChange(String(Math.max(0, mins - 5)))} style={{ width: 32, height: 32, background: "#0f0d0b", border: "1px solid #2a2520", borderRadius: 6, color: "#ddd0bc", fontSize: 18, lineHeight: 1, cursor: "pointer", flexShrink: 0 }}>−</button>
              <span style={{ minWidth: 28, textAlign: "center", fontSize: 16, color: "#ddd0bc", fontFamily: "'Jost', sans-serif" }}>{mins}</span>
              <button onClick={() => onChange(String(mins + 5))} style={{ width: 32, height: 32, background: "#0f0d0b", border: "1px solid #2a2520", borderRadius: 6, color: "#ddd0bc", fontSize: 18, lineHeight: 1, cursor: "pointer", flexShrink: 0 }}>+</button>
              <span style={{ fontSize: 13, color: "#6e6358", fontFamily: "'Jost', sans-serif" }}>minutes</span>
            </div>
          </div>
        );
      };
      return stepCard(
        "Wedding Day Locations",
        "Enter the key venues for the wedding day. These are used to build travel blocks and keep your timeline organized.",
        <div>
          {wizSectionHeading("Ceremony Location")}
          <div style={mandatoryLocStyle}>
            <div style={{ marginBottom: 10 }}>
              <label style={mandatoryLabelStyle}>Venue Name</label>
              <input
                type="text"
                value={wiz_ceremonyVenue}
                onChange={(e) => setWiz_ceremonyVenue(e.target.value)}
                placeholder="e.g. St. Mary's Church"
                style={mandatoryInputStyle}
              />
            </div>
            <div>
              <label style={mandatoryLabelStyle}>Address</label>
              <input
                type="text"
                value={wiz_ceremonyAddress}
                onChange={(e) => setWiz_ceremonyAddress(e.target.value)}
                placeholder="e.g. 123 Main St, Springfield, MI"
                style={mandatoryInputStyle}
              />
            </div>
          </div>

          {wizSectionHeading("Reception Location")}
          <div style={mandatoryLocStyle}>
            <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: wiz_receptionSameAsCeremony ? 0 : 12, cursor: "pointer" }}
              onClick={() => setWiz_receptionSameAsCeremony(!wiz_receptionSameAsCeremony)}>
              <input type="checkbox" checked={wiz_receptionSameAsCeremony} onChange={() => {}} style={{ width: 18, height: 18, cursor: "pointer", flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: "#555" }}>Same as ceremony location</span>
            </label>
            {!wiz_receptionSameAsCeremony && (
              <>
                <div style={{ marginBottom: 10 }}>
                  <label style={mandatoryLabelStyle}>Venue Name</label>
                  <input
                    type="text"
                    value={wiz_receptionVenue}
                    onChange={(e) => setWiz_receptionVenue(e.target.value)}
                    placeholder="e.g. The Grand Ballroom"
                    style={mandatoryInputStyle}
                  />
                </div>
                <div>
                  <label style={mandatoryLabelStyle}>Address</label>
                  <input
                    type="text"
                    value={wiz_receptionAddress}
                    onChange={(e) => setWiz_receptionAddress(e.target.value)}
                    placeholder="e.g. 456 Oak Ave, Springfield, MI"
                    style={mandatoryInputStyle}
                  />
                </div>
                {travelStepper(wiz_distanceReceptionToCeremony, setWiz_distanceReceptionToCeremony)}
              </>
            )}
          </div>

          {wizSectionHeading(`${brideLabel} Getting Ready`)}
          <div style={mandatoryLocStyle}>
            <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: wiz_brideReadyAtCeremony || wiz_brideReadyAtReception ? 6 : 12, cursor: "pointer" }}
              onClick={() => { setWiz_brideReadyAtCeremony(!wiz_brideReadyAtCeremony); if (!wiz_brideReadyAtCeremony) setWiz_brideReadyAtReception(false); }}>
              <input type="checkbox" checked={wiz_brideReadyAtCeremony} onChange={() => {}} style={{ width: 18, height: 18, cursor: "pointer", flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: "#555" }}>Same as ceremony location</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: wiz_brideReadyAtCeremony || wiz_brideReadyAtReception ? 0 : 12, cursor: "pointer" }}
              onClick={() => { setWiz_brideReadyAtReception(!wiz_brideReadyAtReception); if (!wiz_brideReadyAtReception) setWiz_brideReadyAtCeremony(false); }}>
              <input type="checkbox" checked={wiz_brideReadyAtReception} onChange={() => {}} style={{ width: 18, height: 18, cursor: "pointer", flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: "#555" }}>Same as reception location</span>
            </label>
            {!wiz_brideReadyAtCeremony && !wiz_brideReadyAtReception && (
              <>
                <div style={{ marginBottom: 10 }}>
                  <label style={mandatoryLabelStyle}>Venue Name</label>
                  <input
                    type="text"
                    value={wiz_brideReadyAddress}
                    onChange={(e) => setWiz_brideReadyAddress(e.target.value)}
                    placeholder="e.g. The Bridal Suite, Hotel Grand"
                    style={mandatoryInputStyle}
                  />
                </div>
                <div>
                  <label style={mandatoryLabelStyle}>Address</label>
                  <input
                    type="text"
                    value={wiz_brideReadyStreet}
                    onChange={(e) => setWiz_brideReadyStreet(e.target.value)}
                    placeholder="e.g. 123 Main St, Springfield, MI"
                    style={mandatoryInputStyle}
                  />
                </div>
                {travelStepper(wiz_distanceBrideToCeremony, setWiz_distanceBrideToCeremony)}
              </>
            )}
          </div>

          {wizSectionHeading(`${groomLabel} Getting Ready`)}
          <div style={mandatoryLocStyle}>
            <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, cursor: "pointer" }}
              onClick={() => { setWiz_groomReadyAtCeremony(!wiz_groomReadyAtCeremony); if (!wiz_groomReadyAtCeremony) { setWiz_groomReadyAtReception(false); setWiz_groomReadyAtBride(false); } }}>
              <input type="checkbox" checked={wiz_groomReadyAtCeremony} onChange={() => {}} style={{ width: 18, height: 18, cursor: "pointer", flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: "#555" }}>Same as ceremony location</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, cursor: "pointer" }}
              onClick={() => { setWiz_groomReadyAtReception(!wiz_groomReadyAtReception); if (!wiz_groomReadyAtReception) { setWiz_groomReadyAtCeremony(false); setWiz_groomReadyAtBride(false); } }}>
              <input type="checkbox" checked={wiz_groomReadyAtReception} onChange={() => {}} style={{ width: 18, height: 18, cursor: "pointer", flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: "#555" }}>Same as reception location</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: wiz_groomReadyAtCeremony || wiz_groomReadyAtReception || wiz_groomReadyAtBride ? 0 : 12, cursor: "pointer" }}
              onClick={() => { setWiz_groomReadyAtBride(!wiz_groomReadyAtBride); if (!wiz_groomReadyAtBride) { setWiz_groomReadyAtCeremony(false); setWiz_groomReadyAtReception(false); } }}>
              <input type="checkbox" checked={wiz_groomReadyAtBride} onChange={() => {}} style={{ width: 18, height: 18, cursor: "pointer", flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: "#555" }}>Same as {brideLabel} Getting Ready location</span>
            </label>
            {!wiz_groomReadyAtCeremony && !wiz_groomReadyAtReception && !wiz_groomReadyAtBride && (
              <>
                <div style={{ marginBottom: 10 }}>
                  <label style={mandatoryLabelStyle}>Venue Name</label>
                  <input
                    type="text"
                    value={wiz_groomReadyAddress}
                    onChange={(e) => setWiz_groomReadyAddress(e.target.value)}
                    placeholder="e.g. The Groomsmen Suite, Hotel Grand"
                    style={mandatoryInputStyle}
                  />
                </div>
                <div>
                  <label style={mandatoryLabelStyle}>Address</label>
                  <input
                    type="text"
                    value={wiz_groomReadyStreet}
                    onChange={(e) => setWiz_groomReadyStreet(e.target.value)}
                    placeholder="e.g. 123 Main St, Springfield, MI"
                    style={mandatoryInputStyle}
                  />
                </div>
                {travelStepper(wiz_distanceGroomToCeremony, setWiz_distanceGroomToCeremony)}
                <div style={{ marginTop: 12 }}>
                  <label style={{ ...mandatoryLabelStyle, marginBottom: 6 }}>How far is this location from {withThe(brideLabel)}'s Getting Ready location?</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button onClick={() => setWiz_distanceBetweenReady(String(Math.max(0, (parseInt(wiz_distanceBetweenReady) || 0) - 5)))} style={{ width: 32, height: 32, background: "#0f0d0b", border: "1px solid #2a2520", borderRadius: 6, color: "#ddd0bc", fontSize: 18, lineHeight: 1, cursor: "pointer", flexShrink: 0 }}>−</button>
                    <span style={{ minWidth: 28, textAlign: "center", fontSize: 16, color: "#ddd0bc", fontFamily: "'Jost', sans-serif" }}>{parseInt(wiz_distanceBetweenReady) || 0}</span>
                    <button onClick={() => setWiz_distanceBetweenReady(String((parseInt(wiz_distanceBetweenReady) || 0) + 5))} style={{ width: 32, height: 32, background: "#0f0d0b", border: "1px solid #2a2520", borderRadius: 6, color: "#ddd0bc", fontSize: 18, lineHeight: 1, cursor: "pointer", flexShrink: 0 }}>+</button>
                    <span style={{ fontSize: 13, color: "#6e6358", fontFamily: "'Jost', sans-serif" }}>minutes</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {wizSectionHeading("Additional Locations")}
          <p style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>Any other locations you&apos;ll be visiting — such as portrait spots or destinations?</p>
          {wiz_locations.map((loc, i) => (
            <div key={loc.id} style={{ border: "1px solid #1e1c19", borderRadius: 8, padding: "14px 14px 10px", marginBottom: 12, background: "#0f0d0b" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 400, color: "#ddd0bc", fontFamily: "'Jost', sans-serif" }}>Location {i + 1}</span>
                <button
                  onClick={() => removeWizLocation(loc.id)}
                  style={{ background: "none", border: "1px solid #2a2520", borderRadius: 4, padding: "3px 10px", fontSize: 12, color: "#6e6358", cursor: "pointer" }}
                >
                  Remove
                </button>
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "#6e6358", marginBottom: 4, fontFamily: "'Jost', sans-serif" }}>Location Name</label>
                <input
                  type="text"
                  value={loc.name}
                  onChange={(e) => updateWizLocation(loc.id, "name", e.target.value)}
                  placeholder="e.g. Riverside Park, Hotel Lobby"
                  style={{ width: "100%", padding: 9, border: "1px solid #2a2520", borderRadius: 6, fontSize: 14, boxSizing: "border-box", background: "#0f0d0b", color: "#ddd0bc" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "#6e6358", marginBottom: 4, fontFamily: "'Jost', sans-serif" }}>Address <span style={{ color: "#3a3530" }}>(optional)</span></label>
                <input
                  type="text"
                  value={loc.address}
                  onChange={(e) => updateWizLocation(loc.id, "address", e.target.value)}
                  placeholder="e.g. 123 Main St, Springfield, MI"
                  style={{ width: "100%", padding: 9, border: "1px solid #2a2520", borderRadius: 6, fontSize: 14, boxSizing: "border-box", background: "#0f0d0b", color: "#ddd0bc" }}
                />
              </div>
              {travelStepper(loc.distFromCeremony, (val) => updateWizLocation(loc.id, "distFromCeremony", val))}
              {travelStepper(loc.distFromReception, (val) => updateWizLocation(loc.id, "distFromReception", val), "How far is this location to the reception location?")}
            </div>
          ))}
          <button
            onClick={addWizLocation}
            style={{ padding: "10px 20px", background: "#161310", color: "#b8906a", border: "1px solid #b8906a", borderRadius: 8, fontSize: 14, fontWeight: 300, cursor: "pointer", fontFamily: "'Jost', sans-serif" }}
          >
            + Add Location
          </button>
        </div>,
        () => setWizardStep(1),
        () => setWizardStep(3)
      );
    }

    // Step 1 — Wedding Details
    if (effectiveStep === 1) {
      return stepCard(
        "Wedding Details",
        "These details will appear in your timeline header and exported documents.",
        <div>
          <div style={{ marginBottom: 20, textAlign: "center" }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "#6e6358", marginBottom: 5, fontFamily: "'Jost', sans-serif" }}>Wedding Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ padding: 10, border: "1px solid #2a2520", borderRadius: 6, fontSize: 15, background: "#0f0d0b", color: "#ddd0bc", fontFamily: "'Jost', sans-serif" }}
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "#6e6358", marginBottom: 5, fontFamily: "'Jost', sans-serif" }}>Couple&apos;s Titles</label>
            <select
              value={brideLabel === "Bride" && groomLabel === "Groom" ? "bride-groom" : brideLabel === "Partner 1" && groomLabel === "Partner 2" ? "partner" : "bride-groom"}
              onChange={(e) => {
                if (e.target.value === "bride-groom") { setBrideLabel("Bride"); setGroomLabel("Groom"); }
                else { setBrideLabel("Partner 1"); setGroomLabel("Partner 2"); }
              }}
              style={{ width: "100%", padding: 10, border: "1px solid #2a2520", borderRadius: 6, fontSize: 15, boxSizing: "border-box", background: "#0f0d0b", color: "#ddd0bc", fontFamily: "'Jost', sans-serif" }}
            >
              <option value="bride-groom">Bride &amp; Groom</option>
              <option value="partner">Partner 1 &amp; Partner 2</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "#6e6358", marginBottom: 5, fontFamily: "'Jost', sans-serif" }}>{brideLabel}&apos;s Name</label>
              <input
                type="text"
                value={bride}
                onChange={(e) => setBride(e.target.value)}
                placeholder={`${brideLabel}'s full name`}
                style={{ width: "100%", padding: 10, border: "1px solid #2a2520", borderRadius: 6, fontSize: 15, boxSizing: "border-box", background: "#0f0d0b", color: "#ddd0bc", fontFamily: "'Jost', sans-serif" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "#6e6358", marginBottom: 5, fontFamily: "'Jost', sans-serif" }}>{groomLabel}&apos;s Name</label>
              <input
                type="text"
                value={groom}
                onChange={(e) => setGroom(e.target.value)}
                placeholder={`${groomLabel}'s full name`}
                style={{ width: "100%", padding: 10, border: "1px solid #2a2520", borderRadius: 6, fontSize: 15, boxSizing: "border-box", background: "#0f0d0b", color: "#ddd0bc", fontFamily: "'Jost', sans-serif" }}
              />
            </div>
          </div>
        </div>,
        () => setScreen("welcome"),
        () => setWizardStep(2)
      );
    }

    // Step 3 — Package Inclusions
    if (effectiveStep === 3) {
      return stepCard(
        "What's Included in Your Package?",
        "Only check services that are part of your booked package.",
        <div>
          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "#6e6358", marginBottom: 5, fontFamily: "'Jost', sans-serif" }}>Photo Coverage <span style={{ color: "#6e6358" }}>(hours)</span></label>
              <input
                type="number"
                value={wiz_photoCoverageHours}
                onChange={(e) => setWiz_photoCoverageHours(e.target.value)}
                placeholder="e.g. 8"
                min={1}
                max={24}
                style={{ width: "100%", padding: 10, border: "1px solid #2a2520", borderRadius: 6, fontSize: 15, boxSizing: "border-box", background: "#0f0d0b", color: "#ddd0bc", fontFamily: "'Jost', sans-serif" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "#6e6358", marginBottom: 5, fontFamily: "'Jost', sans-serif" }}>Video Coverage <span style={{ color: "#6e6358" }}>(hours)</span></label>
              <input
                type="number"
                value={wiz_videoCoverageHours}
                onChange={(e) => setWiz_videoCoverageHours(e.target.value)}
                placeholder="e.g. 8"
                min={1}
                max={24}
                style={{ width: "100%", padding: 10, border: "1px solid #2a2520", borderRadius: 6, fontSize: 15, boxSizing: "border-box", background: "#0f0d0b", color: "#ddd0bc", fontFamily: "'Jost', sans-serif" }}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "#6e6358", marginBottom: 8, fontFamily: "'Jost', sans-serif" }}>Photographers</label>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button onClick={() => setWiz_photographerCount(Math.max(0, wiz_photographerCount - 1))} style={{ width: 32, height: 32, background: "#0f0d0b", border: "1px solid #2a2520", borderRadius: 6, color: "#ddd0bc", fontSize: 18, lineHeight: 1, cursor: "pointer", flexShrink: 0 }}>−</button>
                <span style={{ minWidth: 28, textAlign: "center", fontSize: 16, color: "#ddd0bc", fontFamily: "'Jost', sans-serif" }}>{wiz_photographerCount}</span>
                <button onClick={() => setWiz_photographerCount(wiz_photographerCount + 1)} style={{ width: 32, height: 32, background: "#0f0d0b", border: "1px solid #2a2520", borderRadius: 6, color: "#ddd0bc", fontSize: 18, lineHeight: 1, cursor: "pointer", flexShrink: 0 }}>+</button>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "#6e6358", marginBottom: 8, fontFamily: "'Jost', sans-serif" }}>Videographers</label>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button onClick={() => setWiz_videographerCount(Math.max(0, wiz_videographerCount - 1))} style={{ width: 32, height: 32, background: "#0f0d0b", border: "1px solid #2a2520", borderRadius: 6, color: "#ddd0bc", fontSize: 18, lineHeight: 1, cursor: "pointer", flexShrink: 0 }}>−</button>
                <span style={{ minWidth: 28, textAlign: "center", fontSize: 16, color: "#ddd0bc", fontFamily: "'Jost', sans-serif" }}>{wiz_videographerCount}</span>
                <button onClick={() => setWiz_videographerCount(wiz_videographerCount + 1)} style={{ width: 32, height: 32, background: "#0f0d0b", border: "1px solid #2a2520", borderRadius: 6, color: "#ddd0bc", fontSize: 18, lineHeight: 1, cursor: "pointer", flexShrink: 0 }}>+</button>
              </div>
            </div>
          </div>
          <label style={{ ...wizCheckRowStyle }} onClick={() => setWiz_drone(!wiz_drone)}>
            <input type="checkbox" checked={wiz_drone} onChange={() => {}} style={{ width: 22, height: 22, marginTop: 2, cursor: "pointer", flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 400, color: "#ddd0bc", fontFamily: "'Jost', sans-serif" }}>Drone Coverage</div>
              <div style={{ fontSize: 13, color: "#6e6358", marginTop: 2 }}>Aerial footage and venue exterior shots</div>
            </div>
          </label>
          <label style={{ ...wizCheckRowStyle }} onClick={() => setWiz_narration(!wiz_narration)}>
            <input type="checkbox" checked={wiz_narration} onChange={() => {}} style={{ width: 22, height: 22, marginTop: 2, cursor: "pointer", flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 400, color: "#ddd0bc", fontFamily: "'Jost', sans-serif" }}>Narration Recording</div>
              <div style={{ fontSize: 13, color: "#6e6358", marginTop: 2 }}>Separate narration sessions for bride and groom</div>
            </div>
          </label>
        </div>,
        () => setWizardStep(2),
        () => setWizardStep(4)
      );
    }

    // Step 4 — Pre-Ceremony
    if (effectiveStep === 4) {
      const wizInputStyle = { width: "100%", padding: "10px 12px", border: "1px solid #2a2520", borderRadius: 8, fontSize: 15, boxSizing: "border-box", background: "#0f0d0b", color: "#ddd0bc", fontFamily: "'Jost', sans-serif" };
      const wizMinuteNote = <p style={{ fontSize: 12, color: "#aaa", margin: "4px 0 0 0" }}>Enter drive time in minutes, not miles</p>;
      return stepCard(
        "Pre-Ceremony",
        "",
        <div>
          {wizSectionHeading("Hair & Makeup")}
          <div style={{ marginBottom: 4 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "#ddd0bc", marginBottom: 8, fontFamily: "'Jost', sans-serif" }}>
              When will hair &amp; make-up be completed for {withThe(brideLabel)} and bridesmaids?
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <select value={wiz_hairMakeupDoneHour} onChange={(e) => setWiz_hairMakeupDoneHour(e.target.value)} style={{ ...settingsSelectStyle, fontSize: 15, padding: "8px 10px" }}>
                {["1","2","3","4","5","6","7","8","9","10","11","12"].map(h => <option key={h} value={h}>{h}</option>)}
              </select>
              <span style={{ fontSize: 18, fontWeight: "bold", color: "#ddd0bc" }}>:</span>
              <select value={wiz_hairMakeupDoneMinute} onChange={(e) => setWiz_hairMakeupDoneMinute(e.target.value)} style={{ ...settingsSelectStyle, fontSize: 15, padding: "8px 10px" }}>
                {["00","05","10","15","20","25","30","35","40","45","50","55"].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select value={wiz_hairMakeupDonePeriod} onChange={(e) => setWiz_hairMakeupDonePeriod(e.target.value)} style={{ ...settingsSelectStyle, fontSize: 15, padding: "8px 10px" }}>
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
            <p style={{ fontSize: 12, color: "#6e6358", margin: 0, fontFamily: "'Jost', sans-serif", fontStyle: "italic" }}>Hair &amp; Makeup delays are the #1 reason for being behind schedule. Please have your hair/makeup artists arrive extra early so you have adequate time.</p>
          </div>

          {wizSectionHeading("Shot Types")}
          <p style={{ fontSize: 13, color: "#6e6358", margin: "0 0 12px 0", fontFamily: "'Jost', sans-serif" }}>What types of shots do you want before the ceremony starts?</p>
          {[
            { key: "brideReady", label: `${brideLabel} Getting Ready`, sub: "Candid getting-ready moments", val: wiz_preCeremonyBrideReady, set: setWiz_preCeremonyBrideReady },
            { key: "groomReady", label: `${groomLabel} Getting Ready`, sub: "Candid getting-ready moments", val: wiz_preCeremonyGroomReady, set: setWiz_preCeremonyGroomReady },
            { key: "details", label: "Detail Shots", sub: "Rings, dress, bouquet, shoes, etc.", val: wiz_preCeremonyDetails, set: setWiz_preCeremonyDetails },
            { key: "preDress", label: "Bridal Party Pre-Dress Portraits", sub: "Portraits of the Bridal Party before dresses are worn. Typically in robes or matching attire.", val: wiz_preCeremonyPreDress, set: setWiz_preCeremonyPreDress },
            { key: "brideParty", label: `${brideLabel} & Party Portraits`, sub: "Bridal party group portraits", val: wiz_preCeremonyBrideParty, set: setWiz_preCeremonyBrideParty },
            { key: "groomParty", label: `${groomLabel} & Party Portraits`, sub: "Groomsmen group portraits", val: wiz_preCeremonyGroomParty, set: setWiz_preCeremonyGroomParty },
          ].map(({ key, label, sub, val, set }) => (
            <label key={key} style={{ ...wizCheckRowStyle }} onClick={() => set(!val)}>
              <input type="checkbox" checked={val} onChange={() => {}} style={{ width: 22, height: 22, marginTop: 2, cursor: "pointer", flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 400, color: "#ddd0bc", fontFamily: "'Jost', sans-serif" }}>{label}</div>
                <div style={{ fontSize: 13, color: "#6e6358", marginTop: 2 }}>{sub}</div>
              </div>
            </label>
          ))}
        </div>,
        () => setWizardStep(3),
        () => setWizardStep(5)
      );
    }

    // Step 5 — First Looks + Pre-Ceremony Visibility
    if (effectiveStep === 5) {
      return stepCard(
        "First Looks",
        "First looks affect the order of portraits and group photos in your timeline.",
        <div>
          {wizSectionHeading("Pre-Ceremony Visibility")}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 300, color: "#ddd0bc", marginBottom: 10, fontFamily: "'Jost', sans-serif" }}>Can {withThe(brideLabel)} be seen by {withThe(groomLabel)} before the Ceremony?</label>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={wizToggleStyle(wiz_brideOkayBefore === true)} onClick={() => setWiz_brideOkayBefore(true)}>Yes</button>
              <button style={wizToggleStyle(wiz_brideOkayBefore === false)} onClick={() => setWiz_brideOkayBefore(false)}>No</button>
            </div>
          </div>

          {wizSectionHeading("First Looks")}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 300, color: "#ddd0bc", marginBottom: 10, fontFamily: "'Jost', sans-serif" }}>Will there be any first looks before the ceremony?</label>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={wizToggleStyle(wiz_hasFirstLooks === true)} onClick={() => setWiz_hasFirstLooks(true)}>Yes</button>
              <button style={wizToggleStyle(wiz_hasFirstLooks === false)} onClick={() => { setWiz_hasFirstLooks(false); setWiz_firstLookGroom(false); setWiz_firstLookParent(false); setWiz_firstLookBridesmaids(false); setWiz_firstLookOther(false); }}>No</button>
            </div>
          </div>
          {wiz_hasFirstLooks === true && (
            <div>
              <label style={{ display: "block", fontSize: 14, fontWeight: 300, color: "#ddd0bc", marginBottom: 10, fontFamily: "'Jost', sans-serif" }}>Who are the first looks with?</label>
              {[
                { key: "groom", label: "Groom", sub: "Couple's first look before the ceremony", val: wiz_firstLookGroom, set: setWiz_firstLookGroom, locVal: wiz_firstLookGroomLocation, setLoc: setWiz_firstLookGroomLocation },
                { key: "parent", label: "Parent(s)", sub: `${brideLabel} sees parent(s) for the first time`, val: wiz_firstLookParent, set: setWiz_firstLookParent, locVal: wiz_firstLookParentLocation, setLoc: setWiz_firstLookParentLocation },
                { key: "bridesmaids", label: "Bridesmaids", sub: `${brideLabel} reveals look to the bridal party`, val: wiz_firstLookBridesmaids, set: setWiz_firstLookBridesmaids, locVal: wiz_firstLookBridesmaidsLocation, setLoc: setWiz_firstLookBridesmaidsLocation },
              ].map(({ key, label, sub, val, set, locVal, setLoc }) => (
                <label key={key} style={{ ...wizCheckRowStyle }} onClick={() => set(!val)}>
                  <input type="checkbox" checked={val} onChange={() => {}} style={{ width: 22, height: 22, marginTop: 2, cursor: "pointer", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 400, color: "#ddd0bc", fontFamily: "'Jost', sans-serif" }}>{label}</div>
                    <div style={{ fontSize: 13, color: "#6e6358", marginTop: 2 }}>{sub}</div>
                    {val && (
                      <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #1e1c19" }} onClick={e => e.stopPropagation()}>
                        <label style={{ display: "block", fontSize: 12, color: "#6e6358", marginBottom: 4, fontFamily: "'Jost', sans-serif" }}>Where will this first look take place?</label>
                        <select
                          value={locVal}
                          onChange={e => setLoc(e.target.value)}
                          style={{ width: "100%", padding: "6px 8px", border: "1px solid #2a2520", borderRadius: 6, fontSize: 14, background: "#0f0d0b", color: "#ddd0bc" }}
                        >
                          <option value="">Select a location…</option>
                          {allWizLocations.map((name, i) => (
                            <option key={i} value={name}>{name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </label>
              ))}

              {wizSectionHeading("Additional First Looks")}
              {wiz_customFirstLooks.map((fl, i) => (
                <div key={fl.id} style={{ border: "1px solid #1e1c19", borderRadius: 8, padding: "14px 14px 10px", marginBottom: 10, background: "#0f0d0b" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: "#6e6358", fontFamily: "'Jost', sans-serif" }}>Custom First Look {i + 1}</span>
                    <button
                      onClick={() => setWiz_customFirstLooks(prev => prev.filter((_, idx) => idx !== i))}
                      style={{ background: "none", border: "1px solid #2a2520", borderRadius: 4, padding: "3px 10px", fontSize: 12, color: "#6e6358", cursor: "pointer" }}
                    >
                      Remove
                    </button>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <label style={{ display: "block", fontSize: 12, color: "#6e6358", marginBottom: 4, fontFamily: "'Jost', sans-serif" }}>Label</label>
                    <input
                      type="text"
                      value={fl.label}
                      onChange={(e) => setWiz_customFirstLooks(prev => { const next = [...prev]; next[i] = { ...next[i], label: e.target.value }; return next; })}
                      placeholder="e.g. Bride & Flower Girl"
                      style={{ width: "100%", padding: "8px 10px", border: "1px solid #2a2520", borderRadius: 6, fontSize: 14, boxSizing: "border-box", background: "#0f0d0b", color: "#ddd0bc", fontFamily: "'Jost', sans-serif" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: "#6e6358", marginBottom: 4, fontFamily: "'Jost', sans-serif" }}>Location</label>
                    <select
                      value={fl.location}
                      onChange={(e) => setWiz_customFirstLooks(prev => { const next = [...prev]; next[i] = { ...next[i], location: e.target.value }; return next; })}
                      style={{ width: "100%", padding: "8px 10px", border: "1px solid #2a2520", borderRadius: 6, fontSize: 14, background: "#0f0d0b", color: "#ddd0bc" }}
                    >
                      <option value="">Select a location…</option>
                      {allWizLocations.map((name, j) => <option key={j} value={name}>{name}</option>)}
                    </select>
                  </div>
                </div>
              ))}
              <button
                onClick={() => { setWiz_customFirstLooks(prev => [...prev, { id: wiz_customFirstLookNextId, label: "", location: "" }]); setWiz_customFirstLookNextId(n => n + 1); }}
                style={{ padding: "9px 18px", background: "#161310", color: "#b8906a", border: "1px solid #b8906a", borderRadius: 8, fontSize: 13, fontWeight: 300, cursor: "pointer", fontFamily: "'Jost', sans-serif" }}
              >
                + Add First Look
              </button>
            </div>
          )}
        </div>,
        () => setWizardStep(4),
        () => setWizardStep(6)
      );
    }

    // Step 6 — Ceremony
    if (effectiveStep === 6) {
      const hourOptions = ["1","2","3","4","5","6","7","8","9","10","11","12"];
      const minuteOptions = ["00","05","10","15","20","25","30","35","40","45","50","55"];
      return stepCard(
        "Ceremony",
        "",
        <div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "#6e6358", marginBottom: 8, fontFamily: "'Jost', sans-serif" }}>Ceremony Start Time</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <select value={wiz_ceremonyHour} onChange={(e) => setWiz_ceremonyHour(e.target.value)} style={{ ...settingsSelectStyle, fontSize: 15, padding: "8px 10px" }}>
                {hourOptions.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
              <span style={{ fontSize: 18, fontWeight: "bold" }}>:</span>
              <select value={wiz_ceremonyMinute} onChange={(e) => setWiz_ceremonyMinute(e.target.value)} style={{ ...settingsSelectStyle, fontSize: 15, padding: "8px 10px" }}>
                {minuteOptions.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <select value={wiz_ceremonyPeriod} onChange={(e) => setWiz_ceremonyPeriod(e.target.value)} style={{ ...settingsSelectStyle, fontSize: 15, padding: "8px 10px" }}>
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "#6e6358", marginBottom: 6, fontFamily: "'Jost', sans-serif" }}>Ceremony Duration (minutes)</label>
            <input
              type="number"
              value={wiz_ceremonyDuration}
              min={5}
              step={5}
              onChange={(e) => setWiz_ceremonyDuration(parseInt(e.target.value, 10) || 30)}
              style={{ padding: 10, border: "1px solid #2a2520", borderRadius: 6, fontSize: 15, width: 100, background: "#0f0d0b", color: "#ddd0bc", fontFamily: "'Jost', sans-serif" }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "#6e6358", marginBottom: 6, fontFamily: "'Jost', sans-serif" }}>Anticipated Guest Count</label>
            <input
              type="number"
              value={wiz_guestCount}
              min={1}
              onChange={(e) => setWiz_guestCount(e.target.value)}
              placeholder="e.g. 150"
              style={{ padding: 10, border: "1px solid #2a2520", borderRadius: 6, fontSize: 15, width: 120, background: "#0f0d0b", color: "#ddd0bc", fontFamily: "'Jost', sans-serif" }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "#6e6358", marginBottom: 8, fontFamily: "'Jost', sans-serif" }}>Ceremony Setting</label>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={wizToggleStyle(!wiz_ceremonyOutdoor)} onClick={() => setWiz_ceremonyOutdoor(false)}>Indoors</button>
              <button style={wizToggleStyle(wiz_ceremonyOutdoor)} onClick={() => setWiz_ceremonyOutdoor(true)}>Outdoor</button>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "#6e6358", marginBottom: 6, fontFamily: "'Jost', sans-serif" }}>Any special events during the ceremony that the photographer/videographer should know about?</label>
            <textarea
              value={wiz_ceremonyNotes}
              onChange={(e) => setWiz_ceremonyNotes(e.target.value)}
              placeholder="e.g. Unity candle, ring warming, surprise song performance…"
              rows={3}
              style={{ width: "100%", padding: 10, border: "1px solid #2a2520", borderRadius: 6, fontSize: 14, boxSizing: "border-box", background: "#0f0d0b", color: "#ddd0bc", fontFamily: "'Jost', sans-serif", resize: "vertical" }}
            />
          </div>
        </div>,
        () => setWizardStep(5),
        () => setWizardStep(8)
      );
    }

    // Step 8 — Post-Ceremony
    if (effectiveStep === 8) {
      const groupCount = wiz_familyGroups === "none" ? 0 : parseInt(wiz_familyGroups, 10);
      return stepCard(
        "Portraits",
        "Tell us about group photos, portrait sessions, and golden hour after the ceremony.",
        <div>
          {wizSectionHeading("Family Group Photos")}
          <p style={{ fontSize: 13, color: "#6e6358", margin: "0 0 6px 0", fontFamily: "'Jost', sans-serif" }}>Family and Group Photos typically follow directly after the ceremony while your guests are still present.</p>
          <p style={{ fontSize: 13, color: "#6e6358", margin: "0 0 10px 0", fontFamily: "'Jost', sans-serif" }}>How many family groupings will be photographed after the ceremony?</p>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <button style={wizToggleStyle(wiz_familyGroups === "5")} onClick={() => setWiz_familyGroups("5")}>5 Groups (~20 min)</button>
            <button style={wizToggleStyle(wiz_familyGroups === "10")} onClick={() => setWiz_familyGroups("10")}>10 Groups (~45 min)</button>
            <button style={wizToggleStyle(wiz_familyGroups === "none")} onClick={() => setWiz_familyGroups("none")}>None</button>
          </div>
          {groupCount > 0 && (
            <div style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 13, color: "#6e6358", margin: "0 0 10px 0", fontFamily: "'Jost', sans-serif" }}>List who is in each group <span style={{ color: "#3a3530" }}>(optional)</span></p>
              {Array.from({ length: groupCount }).map((_, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "#6e6358", marginBottom: 4, fontFamily: "'Jost', sans-serif" }}>Group {i + 1}</label>
                  <input
                    type="text"
                    value={wiz_familyGroupNames[i] || ""}
                    onChange={(e) => {
                      const next = [...wiz_familyGroupNames];
                      next[i] = e.target.value;
                      setWiz_familyGroupNames(next);
                    }}
                    placeholder="e.g. Smith family — bride's parents + 2 siblings"
                    style={{ width: "100%", padding: 9, border: "1px solid #2a2520", borderRadius: 6, fontSize: 14, boxSizing: "border-box", background: "#0f0d0b", color: "#ddd0bc", fontFamily: "'Jost', sans-serif" }}
                  />
                </div>
              ))}
            </div>
          )}

          {wizSectionHeading("Portrait Sessions")}
          <p style={{ fontSize: 13, color: "#6e6358", margin: "0 0 12px 0", fontFamily: "'Jost', sans-serif" }}>Add each portrait session that will happen after the ceremony.</p>
          {wiz_portraitSessions.map((session, i) => (
            <div key={session.id} style={{ border: "1px solid #1e1c19", borderRadius: 8, padding: "14px 14px 10px", marginBottom: 10, background: "#0f0d0b" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 400, color: "#ddd0bc", fontFamily: "'Jost', sans-serif" }}>Portrait Session {i + 1}</span>
                <button
                  onClick={() => setWiz_portraitSessions(prev => prev.filter((_, idx) => idx !== i))}
                  style={{ background: "none", border: "1px solid #2a2520", borderRadius: 4, padding: "3px 10px", fontSize: 12, color: "#6e6358", cursor: "pointer" }}
                >
                  Remove
                </button>
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={{ display: "block", fontSize: 12, color: "#6e6358", marginBottom: 4, fontFamily: "'Jost', sans-serif" }}>Session Type</label>
                <select
                  value={session.type}
                  onChange={(e) => setWiz_portraitSessions(prev => { const next = [...prev]; next[i] = { ...next[i], type: e.target.value }; return next; })}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #2a2520", borderRadius: 6, fontSize: 14, background: "#0f0d0b", color: "#ddd0bc" }}
                >
                  <option value="">Select type…</option>
                  <option value="Bride & Groom">Bride &amp; Groom</option>
                  <option value="Bride & Bridesmaids">Bride &amp; Bridesmaids</option>
                  <option value="Groom & Groomsmen">Groom &amp; Groomsmen</option>
                  <option value="Full Wedding Party">Full Wedding Party</option>
                  <option value="Extended Family">Extended Family</option>
                  <option value="Golden Hour">Golden Hour</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#6e6358", marginBottom: 4, fontFamily: "'Jost', sans-serif" }}>Location</label>
                <select
                  value={session.location}
                  onChange={(e) => setWiz_portraitSessions(prev => { const next = [...prev]; next[i] = { ...next[i], location: e.target.value }; return next; })}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #2a2520", borderRadius: 6, fontSize: 14, background: "#0f0d0b", color: "#ddd0bc" }}
                >
                  <option value="">Select a location…</option>
                  {allWizLocations.map((name, j) => <option key={j} value={name}>{name}</option>)}
                </select>
              </div>
            </div>
          ))}
          <button
            onClick={() => { setWiz_portraitSessions(prev => [...prev, { id: wiz_portraitSessionNextId, type: "", location: "" }]); setWiz_portraitSessionNextId(n => n + 1); }}
            style={{ padding: "9px 18px", background: "#161310", color: "#b8906a", border: "1px solid #b8906a", borderRadius: 8, fontSize: 13, fontWeight: 300, cursor: "pointer", marginBottom: 20, fontFamily: "'Jost', sans-serif" }}
          >
            + Add Portrait Session
          </button>

          {wizSectionHeading("Golden Hour")}
          <p style={{ fontSize: 13, color: "#6e6358", margin: "0 0 10px 0", fontFamily: "'Jost', sans-serif" }}>Golden hour portraits take advantage of the soft light just before sunset.</p>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={wizToggleStyle(wiz_goldenHour === true)} onClick={() => setWiz_goldenHour(true)}>Yes</button>
            <button style={wizToggleStyle(wiz_goldenHour === false)} onClick={() => setWiz_goldenHour(false)}>No</button>
          </div>
        </div>,
        () => setWizardStep(6),
        () => setWizardStep(9)
      );
    }

    // Step 9 — Reception
    if (effectiveStep === 9) {
      const hourOptions = ["1","2","3","4","5","6","7","8","9","10","11","12"];
      const minuteOptions = ["00","05","10","15","20","25","30","35","40","45","50","55"];
      return stepCard(
        "Reception",
        "Select what's happening at the reception so we can build out that part of your timeline.",
        <div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "#6e6358", marginBottom: 8, fontFamily: "'Jost', sans-serif" }}>Reception Start Time</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <select value={wiz_receptionHour} onChange={(e) => setWiz_receptionHour(e.target.value)} style={{ ...settingsSelectStyle, fontSize: 15, padding: "8px 10px" }}>
                {hourOptions.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
              <span style={{ fontSize: 18, fontWeight: "bold" }}>:</span>
              <select value={wiz_receptionMinute} onChange={(e) => setWiz_receptionMinute(e.target.value)} style={{ ...settingsSelectStyle, fontSize: 15, padding: "8px 10px" }}>
                {minuteOptions.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <select value={wiz_receptionPeriod} onChange={(e) => setWiz_receptionPeriod(e.target.value)} style={{ ...settingsSelectStyle, fontSize: 15, padding: "8px 10px" }}>
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>

          {wizSectionHeading("Reception Events")}

          {/* Grand Entrance */}
          <label style={{ ...wizCheckRowStyle }} onClick={() => setWiz_grandEntrance(!wiz_grandEntrance)}>
            <input type="checkbox" checked={wiz_grandEntrance} onChange={() => {}} style={{ width: 22, height: 22, marginTop: 2, cursor: "pointer", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 400, color: "#ddd0bc", fontFamily: "'Jost', sans-serif" }}>Grand Entrance</div>
              <div style={{ fontSize: 13, color: "#6e6358", marginTop: 2 }}>Couple introduced to the reception</div>
              {wiz_grandEntrance && (
                <div style={{ marginTop: 10 }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => setWiz_grandEntranceSub("couple")}
                      style={wizToggleStyle(wiz_grandEntranceSub === "couple")}
                    >
                      Just {brideLabel} &amp; {groomLabel}
                    </button>
                    <button
                      onClick={() => setWiz_grandEntranceSub("full")}
                      style={wizToggleStyle(wiz_grandEntranceSub === "full")}
                    >
                      Full wedding party
                    </button>
                  </div>
                </div>
              )}
            </div>
          </label>

          {/* Dinner */}
          <label style={{ ...wizCheckRowStyle }} onClick={() => setWiz_dinner(!wiz_dinner)}>
            <input type="checkbox" checked={wiz_dinner} onChange={() => {}} style={{ width: 22, height: 22, marginTop: 2, cursor: "pointer", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 400, color: "#ddd0bc", fontFamily: "'Jost', sans-serif" }}>Dinner</div>
              <div style={{ fontSize: 13, color: "#6e6358", marginTop: 2 }}>Sit-down meal service</div>
              {wiz_dinner && (
                <div style={{ marginTop: 12 }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "#6e6358", marginBottom: 6, fontFamily: "'Jost', sans-serif" }}>Dinner Start Time</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <select value={wiz_dinnerStartHour} onChange={(e) => setWiz_dinnerStartHour(e.target.value)} style={{ ...settingsSelectStyle, fontSize: 15, padding: "8px 10px" }}>
                        {hourOptions.map((h) => <option key={h} value={h}>{h}</option>)}
                      </select>
                      <span style={{ fontSize: 18, fontWeight: "bold" }}>:</span>
                      <select value={wiz_dinnerStartMinute} onChange={(e) => setWiz_dinnerStartMinute(e.target.value)} style={{ ...settingsSelectStyle, fontSize: 15, padding: "8px 10px" }}>
                        {minuteOptions.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <select value={wiz_dinnerStartPeriod} onChange={(e) => setWiz_dinnerStartPeriod(e.target.value)} style={{ ...settingsSelectStyle, fontSize: 15, padding: "8px 10px" }}>
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 300, color: "#6e6358", marginBottom: 6, fontFamily: "'Jost', sans-serif" }}>Dinner Style</label>
                    <div style={{ display: "flex", gap: 10 }}>
                      {["Plated", "Buffet"].map((s) => (
                        <button
                          key={s}
                          onClick={() => setWiz_dinnerStyle(s)}
                          style={wizToggleStyle(wiz_dinnerStyle === s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </label>

          {/* Remaining reception events (no Special Dance) */}
          {[
            { label: "Cake Cutting", sub: "", val: wiz_cakeCutting, set: setWiz_cakeCutting },
            { label: "First Dance", sub: `${brideLabel} & ${groomLabel} first dance`, val: wiz_firstDance, set: setWiz_firstDance },
            { label: `${brideLabel} & Parent Dance`, sub: "", val: wiz_brideParentDance, set: setWiz_brideParentDance },
            { label: `${groomLabel} & Parent Dance`, sub: "", val: wiz_groomParentDance, set: setWiz_groomParentDance },
            { label: "Open Dance Floor", sub: "", val: wiz_openDanceFloor, set: setWiz_openDanceFloor },
            { label: "Garter Toss", sub: "", val: wiz_garterToss, set: setWiz_garterToss },
            { label: "Bouquet Toss", sub: "", val: wiz_bouquetToss, set: setWiz_bouquetToss },
          ].map(({ label, sub, val, set }) => (
            <label key={label} style={{ ...wizCheckRowStyle }} onClick={() => set(!val)}>
              <input type="checkbox" checked={val} onChange={() => {}} style={{ width: 22, height: 22, marginTop: 2, cursor: "pointer", flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 400, color: "#ddd0bc", fontFamily: "'Jost', sans-serif" }}>{label}</div>
                {sub && <div style={{ fontSize: 13, color: "#6e6358", marginTop: 2 }}>{sub}</div>}
              </div>
            </label>
          ))}

          {/* Speeches */}
          <label style={{ ...wizCheckRowStyle }} onClick={() => setWiz_speeches(!wiz_speeches)}>
            <input type="checkbox" checked={wiz_speeches} onChange={() => {}} style={{ width: 22, height: 22, marginTop: 2, cursor: "pointer", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 400, color: "#ddd0bc", fontFamily: "'Jost', sans-serif" }}>Speeches</div>
              {wiz_speeches && (
                <div onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                    <label style={{ fontSize: 13, color: "#6e6358", fontWeight: 300, fontFamily: "'Jost', sans-serif" }}>How many speakers?</label>
                    <input
                      type="number"
                      value={wiz_speechCount}
                      min={1}
                      step={1}
                      onChange={(e) => setWiz_speechCount(parseInt(e.target.value, 10) || 1)}
                      style={{ padding: 6, border: "1px solid #2a2520", borderRadius: 6, fontSize: 14, width: 60, textAlign: "center", background: "#0f0d0b", color: "#ddd0bc" }}
                    />
                  </div>
                  <p style={{ fontSize: 12, color: "#6e6358", margin: "6px 0 0 0", fontFamily: "'Jost', sans-serif" }}>Include anyone doing a blessing or prayer in this count.</p>
                  <p style={{ fontSize: 12, color: "#6e6358", margin: "4px 0 0 0", fontFamily: "'Jost', sans-serif" }}>Typically 10 minutes per speaker is enough. You can change this to be longer or shorter in your first draft.</p>
                </div>
              )}
            </div>
          </label>

          {/* Custom Events */}
          {wizSectionHeading("Custom Events")}
          {wiz_customReceptionEvents.map((ev, i) => (
            <div key={ev.id} style={{ border: "1px solid #1e1c19", borderRadius: 8, padding: "14px 14px 10px", marginBottom: 10, background: "#0f0d0b" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "#6e6358", fontFamily: "'Jost', sans-serif" }}>Custom Event {i + 1}</span>
                <button
                  onClick={() => setWiz_customReceptionEvents(prev => prev.filter((_, idx) => idx !== i))}
                  style={{ background: "none", border: "1px solid #2a2520", borderRadius: 4, padding: "3px 10px", fontSize: 12, color: "#6e6358", cursor: "pointer" }}
                >
                  Remove
                </button>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 12, color: "#6e6358", marginBottom: 4, fontFamily: "'Jost', sans-serif" }}>Label</label>
                  <input
                    type="text"
                    value={ev.label}
                    onChange={(e) => setWiz_customReceptionEvents(prev => { const next = [...prev]; next[i] = { ...next[i], label: e.target.value }; return next; })}
                    placeholder="Event name"
                    style={{ width: "100%", padding: "8px 10px", border: "1px solid #2a2520", borderRadius: 6, fontSize: 14, boxSizing: "border-box", background: "#0f0d0b", color: "#ddd0bc", fontFamily: "'Jost', sans-serif" }}
                  />
                </div>
                <div style={{ width: 80 }}>
                  <label style={{ display: "block", fontSize: 12, color: "#6e6358", marginBottom: 4, fontFamily: "'Jost', sans-serif" }}>Minutes</label>
                  <input
                    type="number"
                    value={ev.duration}
                    min={5}
                    step={5}
                    onChange={(e) => setWiz_customReceptionEvents(prev => { const next = [...prev]; next[i] = { ...next[i], duration: parseInt(e.target.value, 10) || 15 }; return next; })}
                    style={{ width: "100%", padding: "8px 10px", border: "1px solid #2a2520", borderRadius: 6, fontSize: 14, boxSizing: "border-box", background: "#0f0d0b", color: "#ddd0bc", textAlign: "center" }}
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={() => { setWiz_customReceptionEvents(prev => [...prev, { id: wiz_customReceptionEventNextId, label: "", duration: 15 }]); setWiz_customReceptionEventNextId(n => n + 1); }}
            style={{ padding: "9px 18px", background: "#161310", color: "#b8906a", border: "1px solid #b8906a", borderRadius: 8, fontSize: 13, fontWeight: 300, cursor: "pointer", fontFamily: "'Jost', sans-serif" }}
          >
            + Add Custom Event
          </button>
        </div>,
        () => setWizardStep(8),
        () => setWizardStep(99),
        "Review & Generate"
      );
    }

    // Step 99 — Confirmation
    if (effectiveStep === 99) {
      const cardStyle = { background: "#0f0d0b", border: "1px solid #1e1c19", borderRadius: 8, padding: "20px", marginBottom: 12 };
      const sectionHeading = (label) => (
        <h3 style={{ margin: "0 0 14px 0", fontSize: 12, color: "#b8906a", fontWeight: 300, fontFamily: "'Jost', sans-serif", letterSpacing: "0.15em", textTransform: "uppercase" }}>{label}</h3>
      );
      const reviewRow = (label, value, incomplete = false) => (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "8px 0", borderBottom: "1px solid #161310", ...(incomplete ? { borderLeft: "2px solid #b8906a", paddingLeft: 8 } : {}) }}>
          <span style={{ color: "#6e6358", fontFamily: "'Jost', sans-serif", fontSize: 13, fontWeight: 300, flexShrink: 0, marginRight: 12 }}>{label}</span>
          <span style={{ color: incomplete ? "#b8906a" : "#ddd0bc", textAlign: "right", fontFamily: "'Jost', sans-serif", fontSize: 13 }}>{value}</span>
        </div>
      );
      const noneSelected = <p style={{ fontSize: 13, color: "#6e6358", fontFamily: "'Jost', sans-serif", margin: 0 }}>None selected</p>;

      // Pre-Ceremony shot types
      const preCeremonyShots = [
        wiz_preCeremonyBrideReady && `${brideLabel} Getting Ready`,
        wiz_preCeremonyGroomReady && `${groomLabel} Getting Ready`,
        wiz_preCeremonyDetails && "Detail Shots",
        wiz_preCeremonyPreDress && "Bridal Party Pre-Dress Portraits",
        wiz_preCeremonyBrideParty && `${brideLabel} & Party Portraits`,
        wiz_preCeremonyGroomParty && `${groomLabel} & Party Portraits`,
      ].filter(Boolean);

      // Reception events
      const receptionEvents = [
        wiz_cakeCutting && "Cake Cutting",
        wiz_firstDance && "First Dance",
        wiz_brideParentDance && `${brideLabel} & Parent Dance`,
        wiz_groomParentDance && `${groomLabel} & Parent Dance`,
        wiz_specialDance && "Special Dance",
        wiz_openDanceFloor && "Open Dance Floor",
        wiz_garterToss && "Garter Toss",
        wiz_bouquetToss && "Bouquet Toss",
      ].filter(Boolean);

      // Person 1 getting ready value
      const brideReadyValue = wiz_brideReadyAtCeremony
        ? "At ceremony venue"
        : wiz_brideReadyAtReception
        ? "At reception venue"
        : wiz_brideReadyAddress
        ? (wiz_brideReadyStreet ? `${wiz_brideReadyAddress}\n${wiz_brideReadyStreet}` : wiz_brideReadyAddress)
        : "(not entered)";
      const brideReadyIncomplete = !wiz_brideReadyAtCeremony && !wiz_brideReadyAtReception && !wiz_brideReadyAddress;

      // Person 2 getting ready value
      const groomReadyValue = wiz_groomReadyAtCeremony
        ? "At ceremony venue"
        : wiz_groomReadyAtReception
        ? "At reception venue"
        : wiz_groomReadyAddress
        ? wiz_groomReadyAddress
        : "(not entered)";
      const groomReadyIncomplete = !wiz_groomReadyAtCeremony && !wiz_groomReadyAtReception && !wiz_groomReadyAddress;

      // First looks — has any?
      const hasAnyFirstLook = wiz_firstLookGroom || wiz_firstLookParent || wiz_firstLookBridesmaids || wiz_firstLookOther || wiz_customFirstLooks.length > 0;
      const noFirstLooks = wiz_hasFirstLooks === false || (!wiz_hasFirstLooks && !hasAnyFirstLook);

      return (
        <div className="wiz-layout" style={{ padding: "16px 0" }}>
          <div className="wiz-step-col">
            <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 16px 40px" }}>
              <h2 style={{ margin: "0 0 6px 0", fontSize: "clamp(22px,4vw,32px)", color: "#ddd0bc", fontWeight: 400, fontFamily: "'Cormorant Garamond', serif" }}>Ready to Generate Draft</h2>
              <p style={{ margin: "0 0 20px 0", fontSize: 14, color: "#6e6358", fontFamily: "'Jost', sans-serif", fontWeight: 300 }}>Review your selections below, then click Generate Timeline.</p>

              {/* 1. The Couple */}
              <div style={cardStyle}>
                {sectionHeading("The Couple")}
                {reviewRow("Titles", `${brideLabel} & ${groomLabel}`)}
                {reviewRow(`${brideLabel}`, bride || "(not entered)", !bride)}
                {reviewRow(`${groomLabel}`, groom || "(not entered)", !groom)}
                {reviewRow("Wedding Date", date || "(not entered)", !date)}
              </div>

              {/* 2. Package */}
              <div style={cardStyle}>
                {sectionHeading("Package")}
                {reviewRow("Photo Coverage", wiz_photoCoverageHours ? wiz_photoCoverageHours + " hrs" : "(not entered)", !wiz_photoCoverageHours)}
                {reviewRow("Photographers", String(wiz_photographerCount))}
                {reviewRow("Video Coverage", wiz_videoCoverageHours ? wiz_videoCoverageHours + " hrs" : "(not entered)", !wiz_videoCoverageHours)}
                {reviewRow("Videographers", String(wiz_videographerCount))}
                {reviewRow("Drone Coverage", wiz_drone ? "Yes" : "No")}
                {reviewRow("Narration Recording", wiz_narration ? "Yes" : "No")}
              </div>

              {/* 3. Locations */}
              <div style={cardStyle}>
                {sectionHeading("Locations")}
                {reviewRow(`${brideLabel} Getting Ready`, brideReadyValue, brideReadyIncomplete)}
                {reviewRow(`${groomLabel} Getting Ready`, groomReadyValue, groomReadyIncomplete)}
                {reviewRow("Ceremony Venue", wiz_ceremonyVenue || "(not entered)", !wiz_ceremonyVenue)}
                {reviewRow("Ceremony Address", wiz_ceremonyAddress || "(not entered)", !wiz_ceremonyAddress)}
                {reviewRow(
                  "Reception Venue",
                  wiz_receptionSameAsCeremony ? "Same as ceremony" : (wiz_receptionVenue || "(not entered)"),
                  !wiz_receptionSameAsCeremony && !wiz_receptionVenue
                )}
                {!wiz_receptionSameAsCeremony && reviewRow(
                  "Reception Address",
                  wiz_receptionAddress || "(not entered)",
                  !wiz_receptionAddress
                )}
                {wiz_locations.length > 0
                  ? wiz_locations.map((loc, i) => (
                      <div key={i}>{reviewRow(`Additional Location ${i + 1}`, [loc.name, loc.address].filter(Boolean).join(" — ") || "(unnamed)")}</div>
                    ))
                  : reviewRow("Additional Locations", "None added")}
              </div>

              {/* 4. Pre-Ceremony */}
              <div style={cardStyle}>
                {sectionHeading("Pre-Ceremony")}
                {reviewRow("Hair & Makeup Done By", `${wiz_hairMakeupDoneHour}:${wiz_hairMakeupDoneMinute} ${wiz_hairMakeupDonePeriod}`)}
                {reviewRow("Shot Types", preCeremonyShots.length > 0 ? preCeremonyShots.join(", ") : "None")}
                {reviewRow(
                  `Can ${groomLabel} see ${brideLabel} before Ceremony?`,
                  wiz_brideOkayBefore === null ? "(not answered)" : wiz_brideOkayBefore ? "Yes" : "No",
                  wiz_brideOkayBefore === null && !wiz_firstLookGroom
                )}
              </div>

              {/* 5. First Looks */}
              <div style={cardStyle}>
                {sectionHeading("First Looks")}
                {noFirstLooks ? noneSelected : (
                  <>
                    {wiz_firstLookGroom && reviewRow(`with ${groomLabel}`, wiz_firstLookGroomLocation || "(location not set)")}
                    {wiz_firstLookParent && reviewRow("with Parent(s)", wiz_firstLookParentLocation || "(location not set)")}
                    {wiz_firstLookBridesmaids && reviewRow("with Bridesmaids", wiz_firstLookBridesmaidsLocation || "(location not set)")}
                    {wiz_firstLookOther && reviewRow("Other First Look", wiz_firstLookOtherLocation || "(location not set)")}
                    {wiz_customFirstLooks.map((fl, i) => (
                      <div key={i}>{reviewRow(fl.label || "Custom", fl.location || "(location not set)")}</div>
                    ))}
                  </>
                )}
              </div>

              {/* 6. Ceremony */}
              <div style={cardStyle}>
                {sectionHeading("Ceremony")}
                {reviewRow("Start Time", `${wiz_ceremonyHour}:${wiz_ceremonyMinute} ${wiz_ceremonyPeriod}`)}
                {reviewRow("Duration", `${wiz_ceremonyDuration} min`)}
                {reviewRow("Guest Count", wiz_guestCount || "(not entered)", !wiz_guestCount)}
                {reviewRow("Setting", wiz_ceremonyOutdoor ? "Outdoor" : "Indoor")}
                {wiz_ceremonyNotes && reviewRow("Notes", wiz_ceremonyNotes)}
              </div>

              {/* 7. Portraits */}
              <div style={cardStyle}>
                {sectionHeading("Portraits")}
                {wiz_portraitLocations.length > 0
                  ? wiz_portraitLocations.map((loc, i) => (
                      <div key={i}>{reviewRow(`Portrait Location ${i + 1}`, [loc.name || "(unnamed)", loc.address].filter(Boolean).join(" — "))}</div>
                    ))
                  : reviewRow("Portrait Sessions", "None added")}
                {reviewRow("Family Groups", wiz_familyGroups === "none" ? "None" : wiz_familyGroups === "5" ? "5 Groups (~20 min)" : "10 Groups (~45 min)")}
                {wiz_familyGroups !== "none" && wiz_familyGroupNames.some(n => n) && reviewRow("Group Names", wiz_familyGroupNames.filter(Boolean).join(", "))}
                {reviewRow("Golden Hour", wiz_goldenHour ? "Yes" : "No")}
              </div>

              {/* 8. Reception */}
              <div style={cardStyle}>
                {sectionHeading("Reception")}
                {reviewRow("Start Time", `${wiz_receptionHour}:${wiz_receptionMinute} ${wiz_receptionPeriod}`)}
                {reviewRow("Grand Entrance", wiz_grandEntrance ? "Yes" : "No")}
                {reviewRow("Dinner", wiz_dinner ? `${wiz_dinnerStartHour}:${wiz_dinnerStartMinute} ${wiz_dinnerStartPeriod}${wiz_dinnerStyle ? " — " + wiz_dinnerStyle : ""}` : "No")}
                {reviewRow("Reception Events", receptionEvents.length > 0 ? receptionEvents.join(", ") : "None")}
                {reviewRow("Speeches", wiz_speeches ? `${wiz_speechCount} speaker${wiz_speechCount !== 1 ? "s" : ""}` : "No")}
                {wiz_customReceptionEvents.length > 0 && wiz_customReceptionEvents.map((ev, i) => (
                  <div key={i}>{reviewRow(ev.label || "Custom", ev.duration ? ev.duration + " min" : "")}</div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 8 }}>
                <button onClick={() => setWizardStep(9)} style={{ padding: "12px 28px", border: "1px solid #b8906a", borderRadius: 8, background: "transparent", color: "#ddd0bc", fontSize: 15, cursor: "pointer", fontFamily: "'Jost', sans-serif", fontWeight: 300 }}>
                  Go Back
                </button>
                <button onClick={generateTimeline} className="generate-btn" style={{ padding: "18px 48px", color: "#060504", border: "none", borderRadius: 10, fontSize: 22, fontWeight: 400, cursor: "pointer", fontFamily: "'Cormorant Garamond', serif" }}>
                  Generate Timeline
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderSettingsForm = (isModal) => (
    <div>
      {/* Section 1: Wedding Details */}
      <div style={{ background: "#0f0d0b", border: "1px solid #161310", borderRadius: 8, padding: 20, marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: 12, color: "#b8906a", fontWeight: 300, fontFamily: "'Jost', sans-serif", letterSpacing: "0.15em", textTransform: "uppercase" }}>Wedding Details</h3>

        {/* Date */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 300, color: "#6e6358", minWidth: 60, fontFamily: "'Jost', sans-serif" }}>Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ padding: 7, border: "1px solid #2a2520", borderRadius: 4, fontSize: 14, background: "#0f0d0b", color: "#ddd0bc", fontFamily: "'Jost', sans-serif" }}
          />
        </div>

        {/* Person 1 */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <label style={{ fontSize: 13, fontWeight: 300, color: "#6e6358", minWidth: 60, fontFamily: "'Jost', sans-serif" }}>Person 1:</label>
          <select
            value={brideLabel}
            onChange={(e) => setBrideLabel(e.target.value)}
            style={{ ...settingsSelectStyle, minWidth: 100 }}
          >
            <option value="Bride">Bride</option>
            <option value="Groom">Groom</option>
            <option value="Partner 1">Partner 1</option>
            <option value="Partner 2">Partner 2</option>
          </select>
          <input
            type="text"
            value={bride}
            onChange={(e) => setBride(e.target.value)}
            placeholder={`${brideLabel}'s name`}
            style={{ padding: 7, border: "1px solid #2a2520", borderRadius: 4, fontSize: 13, flex: 1, minWidth: 0, background: "#0f0d0b", color: "#ddd0bc", fontFamily: "'Jost', sans-serif" }}
          />
        </div>

        {/* Person 2 */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <label style={{ fontSize: 13, fontWeight: 300, color: "#6e6358", minWidth: 60, fontFamily: "'Jost', sans-serif" }}>Person 2:</label>
          <select
            value={groomLabel}
            onChange={(e) => setGroomLabel(e.target.value)}
            style={{ ...settingsSelectStyle, minWidth: 100 }}
          >
            <option value="Bride">Bride</option>
            <option value="Groom">Groom</option>
            <option value="Partner 1">Partner 1</option>
            <option value="Partner 2">Partner 2</option>
          </select>
          <input
            type="text"
            value={groom}
            onChange={(e) => setGroom(e.target.value)}
            placeholder={`${groomLabel}'s name`}
            style={{ padding: 7, border: "1px solid #2a2520", borderRadius: 4, fontSize: 13, flex: 1, minWidth: 0, background: "#0f0d0b", color: "#ddd0bc", fontFamily: "'Jost', sans-serif" }}
          />
        </div>
      </div>

      {/* Section 2: Coverage */}
      <div style={{ background: "#0f0d0b", border: "1px solid #161310", borderRadius: 8, padding: 20, marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: 12, color: "#b8906a", fontWeight: 300, fontFamily: "'Jost', sans-serif", letterSpacing: "0.15em", textTransform: "uppercase" }}>Coverage</h3>

        {/* Photography */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 300, color: "#ddd0bc", marginBottom: 8, fontFamily: "'Jost', sans-serif" }}>
            <input
              type="checkbox"
              checked={photoEnabled}
              onChange={(e) => {
                const enabled = e.target.checked;
                setPhotoEnabled(enabled);
                setUserRows((r) => r.map((row) => ({ ...row, photo: enabled })));
              }}
            />
            Photography
          </label>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4, paddingLeft: 24, opacity: photoEnabled ? 1 : 0.5 }}>
            <select value={photoStartHour} onChange={(e) => setPhotoStartHour(e.target.value)} disabled={!photoEnabled} style={{ ...settingsSelectStyle, background: !photoEnabled ? "#1e1c19" : "#0f0d0b", color: !photoEnabled ? "#3a3530" : "#ddd0bc" }}>{renderHourOptions()}</select>
            <span style={{ color: "#6e6358" }}>:</span>
            <select value={photoStartMinute} onChange={(e) => setPhotoStartMinute(e.target.value)} disabled={!photoEnabled} style={{ ...settingsSelectStyle, background: !photoEnabled ? "#1e1c19" : "#0f0d0b", color: !photoEnabled ? "#3a3530" : "#ddd0bc" }}>{renderMinuteOptions()}</select>
            <select value={photoStartPeriod} onChange={(e) => setPhotoStartPeriod(e.target.value)} disabled={!photoEnabled} style={{ ...settingsSelectStyle, background: !photoEnabled ? "#1e1c19" : "#0f0d0b", color: !photoEnabled ? "#3a3530" : "#ddd0bc" }}><option value="AM">AM</option><option value="PM">PM</option></select>
            <span style={{ margin: "0 4px", color: "#6e6358" }}>—</span>
            <select value={photoEndHour} onChange={(e) => setPhotoEndHour(e.target.value)} disabled={!photoEnabled} style={{ ...settingsSelectStyle, background: !photoEnabled ? "#1e1c19" : "#0f0d0b", color: !photoEnabled ? "#3a3530" : "#ddd0bc" }}>{renderHourOptions()}</select>
            <span style={{ color: "#6e6358" }}>:</span>
            <select value={photoEndMinute} onChange={(e) => setPhotoEndMinute(e.target.value)} disabled={!photoEnabled} style={{ ...settingsSelectStyle, background: !photoEnabled ? "#1e1c19" : "#0f0d0b", color: !photoEnabled ? "#3a3530" : "#ddd0bc" }}>{renderMinuteOptions()}</select>
            <select value={photoEndPeriod} onChange={(e) => setPhotoEndPeriod(e.target.value)} disabled={!photoEnabled} style={{ ...settingsSelectStyle, background: !photoEnabled ? "#1e1c19" : "#0f0d0b", color: !photoEnabled ? "#3a3530" : "#ddd0bc" }}><option value="AM">AM</option><option value="PM">PM</option></select>
          </div>
        </div>

        {/* Videography */}
        <div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 300, color: "#ddd0bc", marginBottom: 8, fontFamily: "'Jost', sans-serif" }}>
            <input
              type="checkbox"
              checked={videoEnabled}
              onChange={(e) => {
                const enabled = e.target.checked;
                setVideoEnabled(enabled);
                setUserRows((r) => r.map((row) => ({ ...row, video: enabled })));
              }}
            />
            Videography
          </label>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4, paddingLeft: 24, opacity: videoEnabled ? 1 : 0.5 }}>
            <select value={videoStartHour} onChange={(e) => setVideoStartHour(e.target.value)} disabled={!videoEnabled} style={{ ...settingsSelectStyle, background: !videoEnabled ? "#1e1c19" : "#0f0d0b", color: !videoEnabled ? "#3a3530" : "#ddd0bc" }}>{renderHourOptions()}</select>
            <span style={{ color: "#6e6358" }}>:</span>
            <select value={videoStartMinute} onChange={(e) => setVideoStartMinute(e.target.value)} disabled={!videoEnabled} style={{ ...settingsSelectStyle, background: !videoEnabled ? "#1e1c19" : "#0f0d0b", color: !videoEnabled ? "#3a3530" : "#ddd0bc" }}>{renderMinuteOptions()}</select>
            <select value={videoStartPeriod} onChange={(e) => setVideoStartPeriod(e.target.value)} disabled={!videoEnabled} style={{ ...settingsSelectStyle, background: !videoEnabled ? "#1e1c19" : "#0f0d0b", color: !videoEnabled ? "#3a3530" : "#ddd0bc" }}><option value="AM">AM</option><option value="PM">PM</option></select>
            <span style={{ margin: "0 4px", color: "#6e6358" }}>—</span>
            <select value={videoEndHour} onChange={(e) => setVideoEndHour(e.target.value)} disabled={!videoEnabled} style={{ ...settingsSelectStyle, background: !videoEnabled ? "#1e1c19" : "#0f0d0b", color: !videoEnabled ? "#3a3530" : "#ddd0bc" }}>{renderHourOptions()}</select>
            <span style={{ color: "#6e6358" }}>:</span>
            <select value={videoEndMinute} onChange={(e) => setVideoEndMinute(e.target.value)} disabled={!videoEnabled} style={{ ...settingsSelectStyle, background: !videoEnabled ? "#1e1c19" : "#0f0d0b", color: !videoEnabled ? "#3a3530" : "#ddd0bc" }}>{renderMinuteOptions()}</select>
            <select value={videoEndPeriod} onChange={(e) => setVideoEndPeriod(e.target.value)} disabled={!videoEnabled} style={{ ...settingsSelectStyle, background: !videoEnabled ? "#1e1c19" : "#0f0d0b", color: !videoEnabled ? "#3a3530" : "#ddd0bc" }}><option value="AM">AM</option><option value="PM">PM</option></select>
          </div>
        </div>
      </div>

      {/* Section 3: Fixed-Time Events */}
      <div style={{ background: "#0f0d0b", border: "1px solid #161310", borderRadius: 8, padding: 20, marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 4px 0", fontSize: 12, color: "#b8906a", fontWeight: 300, fontFamily: "'Jost', sans-serif", letterSpacing: "0.15em", textTransform: "uppercase" }}>Fixed-Time Events</h3>
        <p style={{ margin: "0 0 14px 0", fontSize: 13, color: "#6e6358", fontFamily: "'Jost', sans-serif" }}>Events that must start at a specific time — added to your timeline as time-locked anchors.</p>

        {/* Column headers */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 160px 70px 28px", gap: 6, marginBottom: 6, paddingRight: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 300, color: "#6e6358", paddingLeft: 6, fontFamily: "'Jost', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>Event</span>
          <span style={{ fontSize: 11, fontWeight: 300, color: "#6e6358", textAlign: "center", fontFamily: "'Jost', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>Start Time</span>
          <span style={{ fontSize: 11, fontWeight: 300, color: "#6e6358", textAlign: "center", fontFamily: "'Jost', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>Duration</span>
          <span />
        </div>

        {/* Fixed event rows */}
        {fixedEvents.map((fe) => (
          <div key={fe.id} style={{ display: "grid", gridTemplateColumns: "1fr 160px 70px 28px", gap: 6, alignItems: "center", marginBottom: 8 }}>
            <input
              type="text"
              value={fe.event}
              onChange={(e) => updateFixedEvent(fe.id, "event", e.target.value)}
              placeholder="Event name"
              style={{ padding: 6, border: "1px solid #2a2520", borderRadius: 4, fontSize: 13, width: "100%", boxSizing: "border-box", background: "#0f0d0b", color: "#ddd0bc", fontFamily: "'Jost', sans-serif" }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <select value={fe.timeHour} onChange={(e) => updateFixedEvent(fe.id, "timeHour", e.target.value)} style={{ ...settingsSelectStyle, flex: 1, minWidth: 0 }}>{renderHourOptions()}</select>
              <span style={{ fontSize: 13 }}>:</span>
              <select value={fe.timeMinute} onChange={(e) => updateFixedEvent(fe.id, "timeMinute", e.target.value)} style={{ ...settingsSelectStyle, flex: 1, minWidth: 0 }}>{renderMinuteOptions()}</select>
              <select value={fe.timePeriod} onChange={(e) => updateFixedEvent(fe.id, "timePeriod", e.target.value)} style={{ ...settingsSelectStyle, flex: 1, minWidth: 0 }}><option value="AM">AM</option><option value="PM">PM</option></select>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <input
                type="number"
                value={fe.duration}
                min={5}
                step={5}
                onChange={(e) => updateFixedEvent(fe.id, "duration", parseInt(e.target.value, 10) || 5)}
                style={{ ...settingsSelectStyle, width: "100%", boxSizing: "border-box", textAlign: "center" }}
              />
            </div>
            <button
              onClick={() => removeFixedEvent(fe.id)}
              style={{ padding: 0, width: 24, height: 24, background: "#161310", color: "#6e6358", border: "1px solid #2a2520", borderRadius: 4, fontSize: 13, cursor: "pointer", lineHeight: 1 }}
            >
              ✕
            </button>
          </div>
        ))}

        {/* Add Custom */}
        <button
          onClick={() => addFixedEvent("", "12", "00", "PM")}
          style={{ padding: "6px 14px", background: "#161310", color: "#b8906a", border: "1px solid #b8906a", borderRadius: 4, fontSize: 13, cursor: "pointer", marginTop: 4, fontFamily: "'Jost', sans-serif", fontWeight: 300 }}
        >
          + Add Custom
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "4px 10px 10px", maxWidth: "100%", margin: "0 auto", fontFamily: "'Jost', sans-serif", backgroundColor: "#060504", minHeight: "100vh", color: "#ddd0bc" }}>
      <style>{MOBILE_TWEAKS}</style>

      {screen === "welcome" ? (
        /* ============ WELCOME SCREEN ============ */
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", background: "#060504" }}>
          <div style={{ textAlign: "center", maxWidth: 500, width: "100%" }}>
            <h1 className="welcome-fade-up" style={{ fontSize: "clamp(36px,6vw,72px)", fontWeight: 300, color: "#ddd0bc", margin: "0 0 8px 0", fontFamily: "'Cormorant Garamond', serif", letterSpacing: "0.05em" }}>
              Wedding Timeline Builder
            </h1>
            <div className="welcome-fade-up" style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 48 }}>
              <button
                onClick={() => { setWizardStep(1); setScreen("wizard"); }}
                style={{ padding: "18px 32px", backgroundColor: "#b8906a", color: "#060504", border: "none", borderRadius: 8, fontSize: 18, fontWeight: 300, cursor: "pointer", width: "100%", fontFamily: "'Jost', sans-serif", letterSpacing: "0.05em" }}
              >
                Create New Timeline
              </button>

              <label
                style={{ padding: "16px 32px", background: "transparent", color: "#b8906a", border: "1px solid #b8906a", borderRadius: 8, fontSize: 16, fontWeight: 300, cursor: "pointer", width: "100%", boxSizing: "border-box", textAlign: "center", fontFamily: "'Jost', sans-serif" }}
              >
                Load Existing Timeline
                <input type="file" accept=".json" onChange={loadProject} style={{ display: "none" }} />
              </label>
            </div>

            <div style={{ marginTop: 48, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#6e6358", fontFamily: "'Jost', sans-serif", fontWeight: 200, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>by</div>
              <img src={mediaPotionLogo} alt="Media Potion" style={{ width: 180, display: "block", margin: "0 auto 6px" }} />
              <div style={{ fontSize: 11, color: "#6e6358", fontFamily: "'Jost', sans-serif", fontWeight: 200 }}>
                © {new Date().getFullYear()} Media Potion. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      ) : screen === "wizard" ? (
        /* ============ WIZARD SCREEN ============ */
        renderWizard()
      ) : screen === "settings" ? (
        /* ============ PROJECT SETTINGS SCREEN ============ */
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "10px 0 40px" }}>
          <h1 style={{ textAlign: "center", margin: "20px 0 4px 0", fontSize: "clamp(18px, 5vw, 24px)", color: "#ddd0bc", fontWeight: 300, fontFamily: "'Cormorant Garamond', serif" }}>
            Wedding Timeline Builder
          </h1>

          <div style={{ background: "#0f0d0b", border: "1px solid #161310", borderRadius: 10, padding: "24px 24px 8px", marginBottom: 16 }}>
            <h2 style={{ margin: "0 0 6px 0", fontSize: 20, color: "#ddd0bc", fontWeight: 400, fontFamily: "'Cormorant Garamond', serif" }}>Project Settings</h2>
            <p style={{ margin: "0 0 20px 0", fontSize: 14, color: "#6e6358", fontFamily: "'Jost', sans-serif" }}>Set up your wedding details before building the timeline.</p>
            {renderSettingsForm(false)}
          </div>

          {/* Bottom actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center", marginTop: 8 }}>
            <button
              onClick={() => {
                if (fixedEvents.length > 0) {
                  const newRows = fixedEvents.map((fe, idx) => ({
                    id: idx + 1,
                    event: fe.event,
                    time: parseTimeInput(fe.timeHour, fe.timeMinute, fe.timePeriod),
                    duration: fe.duration || 30,
                    location: "",
                    isOutdoor: false,
                    photo: photoEnabled,
                    video: videoEnabled,
                    notes: "",
                    isTimeLocked: true,
                    color: "",
                  }));
                  setUserRows(newRows);
                  setNextId(fixedEvents.length + 1);
                }
                setScreen("timeline");
                if (mainScrollRef.current) mainScrollRef.current.scrollTop = 0;
              }}
              style={{ padding: "12px 32px", backgroundColor: "#b8906a", color: "#060504", border: "none", borderRadius: 6, fontSize: 16, fontWeight: 300, cursor: "pointer", width: "100%", maxWidth: 360, fontFamily: "'Jost', sans-serif" }}
            >
              Start Building Timeline
            </button>

            <label
              style={{ padding: "10px 24px", background: "transparent", color: "#b8906a", border: "1px solid #b8906a", borderRadius: 6, fontSize: 14, fontWeight: 300, cursor: "pointer", textAlign: "center", width: "100%", maxWidth: 360, boxSizing: "border-box", fontFamily: "'Jost', sans-serif" }}
            >
              Load Existing Project
              <input type="file" accept=".json" onChange={loadProject} style={{ display: "none" }} />
            </label>
          </div>
        </div>
      ) : (
        /* ============ TIMELINE SCREEN ============ */
        <div className="wtb-timeline-screen" style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", background: "#060504", zIndex: 1, color: "#ddd0bc", fontFamily: "'Jost', sans-serif" }}>
          {/* Header: names/date + controls */}
          <div style={{ flexShrink: 0, background: "#060504", padding: isDesktop ? "4px 10px 0" : "4px 8px 0" }}>
            {/* Names & date (+ mobile gear top-right) */}
            {!isDesktop ? (
              <div className="wtb-mobile-header-top">
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 300, color: "#ddd0bc", lineHeight: 1.2, fontFamily: "'Cormorant Garamond', serif" }}>
                    {bride || groom ? [bride, groom].filter(Boolean).join(" & ") : "Wedding Timeline Builder"}
                  </div>
                  {date && (
                    <div style={{ fontSize: 14, color: "#6e6358", marginTop: 2, fontFamily: "'Jost', sans-serif", fontWeight: 200 }}>
                      {new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                    </div>
                  )}
                </div>
                <div className="wtb-mobile-gear-anchor" ref={mobileGearMenuRef}>
                  <button
                    type="button"
                    className="wtb-mobile-gear-btn"
                    onClick={() => setShowMobileMenu((v) => !v)}
                    aria-expanded={showMobileMenu}
                    aria-haspopup="menu"
                    aria-label="Timeline menu"
                    title="Menu"
                  >
                    ⚙
                  </button>
                  {showMobileMenu && (
                    <div className="wtb-mobile-gear-menu" role="menu">
                      <button
                        type="button"
                        role="menuitem"
                        className="wtb-mobile-gear-menu-item"
                        onClick={() => { requestNewTimeline(); closeMobileGearMenu(); }}
                      >
                        New Timeline
                      </button>
                      <label role="menuitem" className="wtb-mobile-gear-menu-item" style={{ cursor: "pointer", margin: 0 }}>
                        Load Project
                        <input
                          type="file"
                          accept=".json"
                          onChange={(e) => { loadProject(e); closeMobileGearMenu(); }}
                          style={{ display: "none" }}
                        />
                      </label>
                      <button
                        type="button"
                        role="menuitem"
                        className="wtb-mobile-gear-menu-item wtb-mobile-gear-menu-item--primary"
                        onClick={() => { saveProject(); closeMobileGearMenu(); }}
                      >
                        Save Project
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className="wtb-mobile-gear-menu-item"
                        onClick={exportPDF}
                        disabled={exporting}
                      >
                        {exporting ? "Exporting PDF…" : "Export as PDF"}
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className="wtb-mobile-gear-menu-item"
                        onClick={() => { exportTimeline(); closeMobileGearMenu(); }}
                      >
                        Export as TXT
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className="wtb-mobile-gear-menu-item"
                        onClick={() => { copyTimeline(); closeMobileGearMenu(); }}
                      >
                        {copyConfirm ? "Copied!" : "Copy Timeline"}
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className="wtb-mobile-gear-menu-item"
                        onClick={() => { setShowSettingsModal(true); closeMobileGearMenu(); }}
                      >
                        Project Settings
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", marginBottom: 6 }}>
                <div style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 300, color: "#ddd0bc", lineHeight: 1.2, fontFamily: "'Cormorant Garamond', serif" }}>
                  {bride || groom ? [bride, groom].filter(Boolean).join(" & ") : "Wedding Timeline Builder"}
                </div>
                {date && (
                  <div style={{ fontSize: 14, color: "#6e6358", marginTop: 2, fontFamily: "'Jost', sans-serif", fontWeight: 200 }}>
                    {new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  </div>
                )}
              </div>
            )}

            {/* Controls — desktop */}
            <div className="wtb-controls-desktop" style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", background: "#0f0d0b", borderBottom: "1px solid #161310", borderTop: "1px solid #161310", padding: "8px 10px", margin: "0 -10px 0" }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  onClick={requestNewTimeline}
                  style={{ padding: "6px 14px", background: "transparent", color: "#ddd0bc", border: "1px solid #2a2520", borderRadius: 4, fontSize: 13, fontWeight: 300, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'Jost', sans-serif" }}
                >
                  New Timeline
                </button>
                <label
                  style={{ padding: "6px 14px", background: "transparent", color: "#ddd0bc", border: "1px solid #2a2520", borderRadius: 4, cursor: "pointer", fontSize: 13, fontWeight: 300, display: "inline-block", fontFamily: "'Jost', sans-serif" }}
                >
                  Load Project
                  <input type="file" accept=".json" onChange={loadProject} style={{ display: "none" }} />
                </label>
                <button
                  onClick={saveProject}
                  style={{ padding: "6px 14px", backgroundColor: "#b8906a", color: "#060504", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13, fontWeight: 300, fontFamily: "'Jost', sans-serif", letterSpacing: "0.05em" }}
                >
                  Save Project
                </button>
                <button
                  onClick={() => setShowSettingsModal(true)}
                  style={{ padding: "6px 14px", background: "transparent", color: "#ddd0bc", border: "1px solid #2a2520", borderRadius: 4, fontSize: 13, fontWeight: 300, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'Jost', sans-serif" }}
                >
                  Project Settings
                </button>
              </div>
              <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8 }}>
                <button
                  onClick={undo}
                  disabled={history.length === 0}
                  style={{ padding: "6px 14px", background: history.length > 0 ? "#4a6070" : "#1a2228", color: history.length > 0 ? "#ddd0bc" : "#3a4a52", border: "none", borderRadius: 4, cursor: history.length > 0 ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 300, fontFamily: "'Jost', sans-serif", display: "flex", alignItems: "center", gap: 5 }}
                >
                  <span style={{ fontSize: 15, lineHeight: 1 }}>↺</span> Undo
                </button>
                <button
                  onClick={redo}
                  disabled={redoStack.length === 0}
                  style={{ padding: "6px 14px", background: redoStack.length > 0 ? "#4a6070" : "#1a2228", color: redoStack.length > 0 ? "#ddd0bc" : "#3a4a52", border: "none", borderRadius: 4, cursor: redoStack.length > 0 ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 300, fontFamily: "'Jost', sans-serif", display: "flex", alignItems: "center", gap: 5 }}
                >
                  <span style={{ fontSize: 15, lineHeight: 1 }}>↻</span> Redo
                </button>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  onClick={copyTimeline}
                  style={{ padding: "6px 14px", backgroundColor: copyConfirm ? "#b8906a" : "transparent", color: copyConfirm ? "#060504" : "#ddd0bc", border: copyConfirm ? "1px solid #b8906a" : "1px solid #2a2520", borderRadius: 4, cursor: "pointer", fontSize: 13, fontWeight: 300, fontFamily: "'Jost', sans-serif" }}
                >
                  {copyConfirm ? "Copied!" : "Copy Timeline"}
                </button>
                <div ref={isDesktop ? exportMenuRef : null} style={{ position: "relative" }}>
                  <button
                    onClick={() => setShowExportMenu(v => !v)}
                    style={{ padding: "6px 14px", backgroundColor: "#b8906a", color: "#060504", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13, fontWeight: 300, fontFamily: "'Jost', sans-serif", letterSpacing: "0.05em" }}
                  >
                    Export Timeline ▾
                  </button>
                  {showExportMenu && (
                    <div style={{ position: "absolute", right: 0, top: "calc(100% + 4px)", background: "#1a1714", border: "1px solid #2a2520", borderRadius: 4, zIndex: 200, minWidth: 150, overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }}>
                      <button
                        onClick={exportPDF}
                        disabled={exporting}
                        style={{ display: "block", width: "100%", padding: "9px 14px", background: "none", border: "none", color: exporting ? "#6e6358" : "#ddd0bc", textAlign: "left", fontSize: 13, fontFamily: "'Jost', sans-serif", cursor: exporting ? "not-allowed" : "pointer", borderBottom: "1px solid #2a2520" }}
                      >
                        {exporting ? "Exporting…" : "Save as PDF"}
                      </button>
                      <button
                        onClick={() => { exportTimeline(); setShowExportMenu(false); }}
                        style={{ display: "block", width: "100%", padding: "9px 14px", background: "none", border: "none", color: "#ddd0bc", textAlign: "left", fontSize: 13, fontFamily: "'Jost', sans-serif", cursor: "pointer" }}
                      >
                        Save as TXT
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile: toggle timeline editor vs PDF preview */}
            {!isDesktop && (
              <div className="wtb-mobile-view-tabs" role="tablist" aria-label="Timeline views">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mobileMainTab === "timeline"}
                  className={`wtb-mobile-view-tab${mobileMainTab === "timeline" ? " active" : ""}`}
                  onClick={() => setMobileMainTab("timeline")}
                >
                  Timeline Events
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mobileMainTab === "preview"}
                  className={`wtb-mobile-view-tab${mobileMainTab === "preview" ? " active" : ""}`}
                  onClick={() => { setMobileMainTab("preview"); closeMobileGearMenu(); }}
                >
                  Preview
                </button>
              </div>
            )}

            <div
              style={{
                height: !isDesktop && mobileMainTab === "preview" ? 4 : 8,
                background: "#060504",
                flexShrink: 0,
              }}
            />
          </div>

          {/* App shell: main content + (desktop) sidebar */}
          <div className="wtb-shell" style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
            {/* MAIN — scrolls independently */}
            <div
              ref={mainScrollRef}
              className={`wtb-timeline-scroll${!isDesktop && mobileMainTab === "timeline" ? " wtb-has-mobile-dock" : ""}`}
              style={{
                overflowY: "auto",
                height: "100%",
                padding: isDesktop || mobileMainTab === "timeline" ? "0 10px 20px" : "0 4px 8px",
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
              }}
            >
          {(isDesktop || mobileMainTab === "timeline") && (
          <div
            style={{
              background: "#060504",
              padding: 15,
              borderRadius: 8,
              border: "1px solid #161310",
            }}
          >
            <h2
              style={{
                textAlign: "center",
                margin: "0 0 15px 0",
                fontSize: 14,
                color: "#b8906a",
                fontFamily: "'Jost', sans-serif",
                fontWeight: 300,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              Timeline Events
            </h2>

            <div style={{ width: "100%" }}>
              {/* Top drop zone (before first row) */}
              <RowDropZone index={0} onDropBetween={handleDropBetween} onAddRow={() => addRowAtIndex(0)} />
              {rows.map((row, index) => (
                <React.Fragment key={row.id}>
                  <div 
                    draggable={isDesktop}
                    onDragStart={isDesktop ? (e) => handleDragStart(e, row.id) : undefined}
                    onDragEnd={isDesktop ? handleDragEnd : undefined}
                    className={`timeline-row ${draggedRowId === String(row.id) ? 'dragging' : ''}`}
                    style={{
                      opacity: draggedRowId === String(row.id) ? 0.4 : 1,
                      transition: 'opacity 0.2s ease',
                      cursor: 'default',
                    }}
                  >
                    <TimelineRow
                      row={row}
                      index={index}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      onDelete={handleDelete}
                      onEventClick={handleEventClick}
                      onMoveUp={handleMoveUp}
                      onMoveDown={handleMoveDown}
                      isFirst={index === 0}
                      isLast={index === rows.length - 1}
                      onEventBlur={handleEventBlur}
                      photoEnabledGlobal={photoEnabled}
                      videoEnabledGlobal={videoEnabled}
                      onTimeSet={(h, m, p) => {
                        const newTime = parseTimeInput(h, m, p);
                        const newUserRows = [...userRows];
                        const rowIndex = newUserRows.findIndex((r) => r.id === row.id);
                        
                        if (rowIndex !== -1) {
                          newUserRows[rowIndex].time = newTime;
                          setUserRows(newUserRows);
                          
                          const recalculated = recalculateTimes(newUserRows, rowIndex);
                          saveToHistory(recalculated);
                        }
                      }}
                      onDropEventBlock={isDesktop ? (eventData) => handleDropEventBlockToRow(eventData, index) : undefined}
                      overlapWith={overlapMap.get(row.id) || null}
                      isMobile={!isDesktop}
                    />
                  </div>

                  <RowDropZone 
                    index={index + 1} 
                    onDropBetween={handleDropBetween} 
                    onAddRow={() => addRowAtIndex(index + 1)} 
                    isLast={index === rows.length - 1} 
                  />
                </React.Fragment>
              ))}
            </div>

            {/* Add Event */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: 15,
              }}
            >
              <button
                onClick={addRow}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: '1px dashed #b8906a',
                  background: 'transparent',
                  color: '#b8906a',
                  fontSize: '13px',
                  fontWeight: 300,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: "'Jost', sans-serif",
                }}
              >
                + Add Event
              </button>
            </div>
          </div>
          )}

          {!isDesktop && mobileMainTab === "preview" && (
            <div className="wtb-mobile-preview-panel">
              <TimelinePreview
                rows={rows}
                bride={bride}
                groom={groom}
                date={date}
                photoStartHour={photoStartHour}
                photoStartMinute={photoStartMinute}
                photoStartPeriod={photoStartPeriod}
                photoEndHour={photoEndHour}
                photoEndMinute={photoEndMinute}
                photoEndPeriod={photoEndPeriod}
                videoStartHour={videoStartHour}
                videoStartMinute={videoStartMinute}
                videoStartPeriod={videoStartPeriod}
                videoEndHour={videoEndHour}
                videoEndMinute={videoEndMinute}
                videoEndPeriod={videoEndPeriod}
                photoEnabled={photoEnabled}
                videoEnabled={videoEnabled}
              />
            </div>
          )}

          {/* Event Selector Modal */}
          {(isDesktop || mobileMainTab === "timeline") && (
          <EventBlockSelector
            isVisible={showEventSelector}
            onSelect={handleEventSelect}
            onClose={() => {
              setShowEventSelector(false);
              setSelectedRowIndex(null);
            }}
            currentEvent={
              selectedRowIndex !== null ? rows[selectedRowIndex]?.event : ""
            }
            currentTime={
              selectedRowIndex !== null ? rows[selectedRowIndex]?.time : undefined
            }
          />
          )}
        </div>

        {/* Sidebar: event blocks + preview (desktop only; mobile uses tap-to-select modal) */}
        {isDesktop && (
          <EventSidebar
            rows={rows}
            bride={bride}
            groom={groom}
            date={date}
            photoStartHour={photoStartHour}
            photoStartMinute={photoStartMinute}
            photoStartPeriod={photoStartPeriod}
            photoEndHour={photoEndHour}
            photoEndMinute={photoEndMinute}
            photoEndPeriod={photoEndPeriod}
            videoStartHour={videoStartHour}
            videoStartMinute={videoStartMinute}
            videoStartPeriod={videoStartPeriod}
            videoEndHour={videoEndHour}
            videoEndMinute={videoEndMinute}
            videoEndPeriod={videoEndPeriod}
            photoEnabled={photoEnabled}
            videoEnabled={videoEnabled}
          />
        )}
      </div>

          {/* Project Settings Modal */}
          {showSettingsModal && (
            <div
              style={{
                position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.75)",
                display: "flex", alignItems: "flex-start", justifyContent: "center",
                zIndex: 1000, overflowY: "auto", padding: "20px 10px 40px",
              }}
              onClick={(e) => { if (e.target === e.currentTarget) setShowSettingsModal(false); }}
            >
              <div style={{ background: "#0f0d0b", border: "1px solid #2a2520", borderRadius: 10, maxWidth: 960, width: "100%", padding: 24, position: "relative" }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <h2 style={{ margin: 0, fontSize: 20, color: "#ddd0bc", fontWeight: 400, fontFamily: "'Cormorant Garamond', serif" }}>Project Settings</h2>
                  <button
                    onClick={() => setShowSettingsModal(false)}
                    style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#6e6358", lineHeight: 1 }}
                  >
                    ✕
                  </button>
                </div>

                {/* Tab bar */}
                <div style={{ display: "flex", flexWrap: "nowrap", gap: 4, marginBottom: 20, borderBottom: "1px solid #2a2520", paddingBottom: 12, overflowX: "auto" }}>
                  {SETTINGS_WIZARD_TABS.map((tab, i) => (
                    <button
                      key={i}
                      onClick={() => setSettingsTab(i)}
                      style={{
                        padding: "5px 12px",
                        background: settingsTab === i ? "#b8906a" : "transparent",
                        color: settingsTab === i ? "#060504" : "#6e6358",
                        border: settingsTab === i ? "1px solid #b8906a" : "1px solid #2a2520",
                        borderRadius: 4, fontSize: 12, cursor: "pointer",
                        fontFamily: "'Jost', sans-serif", fontWeight: 300, letterSpacing: "0.05em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div style={{ maxHeight: "62vh", overflowY: "auto", paddingRight: 4 }}>
                  {renderWizard(true, SETTINGS_WIZARD_TABS[settingsTab].step)}
                </div>

                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 16 }}>
                  <button
                    onClick={() => { generateTimeline(); }}
                    style={{ padding: "8px 20px", backgroundColor: "#b8906a", color: "#060504", border: "none", borderRadius: 6, fontSize: 14, fontWeight: 400, cursor: "pointer", fontFamily: "'Jost', sans-serif" }}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mobile: fixed undo/redo at bottom (Timeline Events tab only) */}
          {!isDesktop && mobileMainTab === "timeline" && (
            <div className="wtb-mobile-undo-dock" role="toolbar" aria-label="Undo and redo">
              <button
                type="button"
                className="wtb-mobile-undo"
                onClick={undo}
                disabled={history.length === 0}
                title="Undo"
                style={{
                  background: history.length > 0 ? "#4a6070" : "#1a2228",
                  color: history.length > 0 ? "#ddd0bc" : "#3a4a52",
                }}
              >
                <span style={{ fontSize: 15, lineHeight: 1 }}>↺</span> Undo
              </button>
              <button
                type="button"
                className="wtb-mobile-redo"
                onClick={redo}
                disabled={redoStack.length === 0}
                title="Redo"
                style={{
                  background: redoStack.length > 0 ? "#4a6070" : "#1a2228",
                  color: redoStack.length > 0 ? "#ddd0bc" : "#3a4a52",
                }}
              >
                <span style={{ fontSize: 15, lineHeight: 1 }}>↻</span> Redo
              </button>
            </div>
          )}
        </div>
      )}

      {showUnsavedConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: 20,
          }}
          onClick={() => setShowUnsavedConfirm(false)}
        >
          <div
            style={{
              background: "#161310",
              border: "1px solid #2a2520",
              borderRadius: 10,
              padding: "24px 28px",
              maxWidth: 420,
              width: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p style={{ margin: "0 0 20px 0", fontSize: 15, color: "#ddd0bc", lineHeight: 1.5, fontFamily: "'Jost', sans-serif", fontWeight: 300 }}>
              You have unsaved changes. Are you sure you want to start a new timeline? Your current timeline will be lost.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowUnsavedConfirm(false)}
                style={{ padding: "10px 20px", background: "transparent", color: "#ddd0bc", border: "1px solid #2a2520", borderRadius: 6, fontSize: 14, cursor: "pointer", fontFamily: "'Jost', sans-serif", fontWeight: 300 }}
              >
                Cancel
              </button>
              <button
                onClick={startNewTimeline}
                style={{ padding: "10px 20px", background: "#b8906a", color: "#060504", border: "none", borderRadius: 6, fontSize: 14, cursor: "pointer", fontFamily: "'Jost', sans-serif", fontWeight: 300 }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
