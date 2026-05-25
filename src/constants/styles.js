const MOBILE_TWEAKS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Jost:wght@200;300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  input, select, textarea {
    font-size: 16px;
    font-family: 'Jost', sans-serif;
    background: var(--wtb-input-bg);
    color: var(--wtb-text);
    border: 1px solid var(--wtb-border);
  }
  input::placeholder, textarea::placeholder { color: var(--wtb-text-muted); }
  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: var(--wtb-accent);
    box-shadow: 0 0 0 2px rgba(184,144,106,0.15);
  }

  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
  input[type="number"] { -moz-appearance: textfield; }

  input[type="date"]::-webkit-calendar-picker-indicator { filter: var(--wtb-date-filter); }

  input[type="checkbox"] { accent-color: var(--wtb-accent); }

  select option { background: var(--wtb-input-bg); color: var(--wtb-text); }

  .wtb-mins input { width: 44px; padding: 2px 4px; text-align: center; }
  .wtb-notes { padding-right: 10px; }

  .wtb-shell {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
    background: var(--wtb-bg);
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
      border: 1px solid var(--wtb-border-subtle);
      background: var(--wtb-surface);
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
      border-right: 1px solid var(--wtb-border);
      background: var(--wtb-row-reorder-bg);
    }
    .wtb-row-reorder button {
      flex: 1;
      min-height: 28px;
      border: none;
      background: transparent;
      color: var(--wtb-accent);
      font-size: 16px;
      cursor: pointer;
      font-family: 'Jost', sans-serif;
      padding: 0;
    }
    .wtb-row-reorder button:disabled {
      color: var(--wtb-text-faint);
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
    border: 1px solid var(--wtb-border);
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
    color: var(--wtb-accent);
    font-family: 'Jost', sans-serif;
  }
  .wtb-side-note {
    font-size: 11px;
    color: var(--wtb-text-muted);
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
      border: 1px solid var(--wtb-border);
      border-radius: 6px;
      text-align: left;
      font-size: 12px;
      font-family: 'Jost', sans-serif;
      cursor: grab;
      user-select: none;
      break-inside: avoid;
      -webkit-column-break-inside: avoid;
      page-break-inside: avoid;
      background: var(--wtb-surface);
      color: var(--wtb-text);
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .wtb-palette button:hover {
      border-color: var(--wtb-accent);
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
      border: 1px solid var(--wtb-border);
      border-radius: 6px;
      text-align: left;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      font-family: 'Jost', sans-serif;
      cursor: grab;
      user-select: none;
      background: var(--wtb-surface);
      color: var(--wtb-text);
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
    background: var(--wtb-surface);
    border-top: 1px solid var(--wtb-surface-raised);
    box-shadow: 0 -4px 16px var(--wtb-shadow);
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
    border: 1px solid var(--wtb-border);
    border-radius: 4px;
    color: var(--wtb-text);
    font-size: 20px;
    cursor: pointer;
    line-height: 1;
  }
  .wtb-mobile-gear-btn[aria-expanded="true"] {
    border-color: var(--wtb-accent);
    color: var(--wtb-accent);
  }
  .wtb-mobile-gear-menu {
    position: absolute;
    right: 0;
    top: calc(100% + 4px);
    min-width: 196px;
    background: var(--wtb-surface-alt);
    border: 1px solid var(--wtb-border);
    border-radius: 4px;
    z-index: 200;
    overflow: hidden;
    box-shadow: 0 4px 12px var(--wtb-shadow);
  }
  .wtb-mobile-gear-menu-item {
    display: block;
    width: 100%;
    padding: 10px 14px;
    background: none;
    border: none;
    border-bottom: 1px solid var(--wtb-border);
    color: var(--wtb-text);
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
    color: var(--wtb-accent);
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
    border-bottom: 1px solid var(--wtb-surface-raised);
    background: var(--wtb-surface);
    margin: 0 -8px;
    flex-shrink: 0;
  }
  .wtb-mobile-view-tab {
    flex: 1;
    padding: 10px 8px;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--wtb-text-muted);
    font-size: 11px;
    font-family: 'Jost', sans-serif;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
    margin-bottom: -1px;
  }
  .wtb-mobile-view-tab.active {
    color: var(--wtb-accent);
    border-bottom-color: var(--wtb-accent);
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
    border: 1px solid var(--wtb-border);
    background: transparent;
    color: var(--wtb-text);
  }
  .wtb-toolbar-btn-primary {
    background: var(--wtb-accent);
    color: var(--wtb-on-accent);
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

  .wtb-dropping { outline: 2px dashed var(--wtb-accent); outline-offset: -2px; }

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
    background: linear-gradient(90deg, var(--wtb-accent), #cfa882, var(--wtb-accent));
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
    border-bottom: 1px solid var(--wtb-border-subtle);
    margin: -12px -12px 8px;
  }
  .wtb-tab-btn {
    flex: 1;
    padding: 9px 4px;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--wtb-text-muted);
    font-size: 10px;
    font-family: 'Jost', sans-serif;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
    margin-bottom: -1px;
    transition: color 0.15s, border-color 0.15s;
  }
  .wtb-tab-btn.active { color: var(--wtb-accent); border-bottom-color: var(--wtb-accent); }
  .wtb-tab-btn:hover:not(.active) { color: var(--wtb-text); }
`;

const SETTINGS_SELECT_STYLE = {
  padding: "8px 10px",
  borderRadius: 6,
  border: "1px solid var(--wtb-border)",
  background: "var(--wtb-input-bg)",
  color: "var(--wtb-text)",
  fontFamily: "'Jost', sans-serif",
  fontSize: 14,
};

const WIZ_INPUT_STYLE = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid var(--wtb-border)",
  borderRadius: 8,
  fontSize: 15,
  boxSizing: "border-box",
  background: "var(--wtb-input-bg)",
  color: "var(--wtb-text)",
  fontFamily: "'Jost', sans-serif",
};

export { MOBILE_TWEAKS, SETTINGS_SELECT_STYLE, WIZ_INPUT_STYLE };
