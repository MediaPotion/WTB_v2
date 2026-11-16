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
    .timeline-row[draggable="true"] { cursor: default; }
    .wtb-row-card:hover {
      transform: none !important;
      box-shadow: none !important;
    }
    .wiz-step-col { padding: 0 4px; box-sizing: border-box; }
  }

  .wtb-controls-desktop { display: block; }

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
  }

  .wtb-mobile-header-top {
    position: relative;
    padding: 2px 96px 6px 8px;
    margin: 0 -8px;
  }
  .wtb-mobile-header-actions {
    position: absolute;
    top: 2px;
    right: 0;
    z-index: 210;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }
  .wtb-mobile-gear-anchor {
    position: relative;
    flex-shrink: 0;
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
  .wtb-mobile-save {
    padding: 6px 14px;
    border: none;
    border-radius: 4px;
    background: var(--wtb-accent);
    color: var(--wtb-on-accent);
    font-size: 13px;
    font-weight: 400;
    font-family: 'Jost', sans-serif;
    letter-spacing: 0.05em;
    cursor: pointer;
  }
  .wtb-mobile-undo-dock .wtb-mobile-undo,
  .wtb-mobile-undo-dock .wtb-mobile-redo,
  .wtb-mobile-undo-dock .wtb-mobile-save {
    flex: 1;
    justify-content: center;
    min-height: 44px;
    max-width: 200px;
  }
  .wtb-mobile-gear-menu-item--logistics {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .wtb-mobile-gear-logistics-icon {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    line-height: 1;
    flex-shrink: 0;
  }
  .wtb-mobile-gear-logistics-icon[data-status="overflow"] {
    background: rgba(139, 69, 69, 0.15);
    color: #8b4545;
  }
  .wtb-mobile-gear-logistics-icon[data-status="overflow"]::before {
    content: "✕";
  }
  .wtb-mobile-gear-logistics-icon[data-status="tight"] {
    background: rgba(184, 144, 106, 0.2);
    color: var(--wtb-accent);
  }
  .wtb-mobile-gear-logistics-icon[data-status="tight"]::before {
    content: "!";
  }
  .wtb-mobile-gear-logistics-icon[data-status="ok"] {
    background: rgba(107, 143, 113, 0.15);
    color: #6b8f71;
  }
  .wtb-mobile-gear-logistics-icon[data-status="ok"]::before {
    content: "✓";
  }
  .wtb-mobile-gear-btn {
    width: 40px;
    height: 36px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--wtb-surface);
    border: 1px solid var(--wtb-border);
    border-radius: 6px;
    box-shadow: 0 2px 8px var(--wtb-shadow);
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

  /* ---- Timeline row: one compact line, expands for notes and options ---- */
  .wtb-row-card {
    position: relative;
    width: 100%;
    background: var(--wtb-surface);
    border: 1px solid var(--wtb-border-subtle);
    border-left: 5px solid var(--wtb-row-color, #ffffff);
    border-radius: 6px;
    transition: box-shadow 0.15s ease;
  }
  /* No transform here: the time picker is position:fixed inside the row. */
  .wtb-row-card:hover { box-shadow: 0 2px 12px rgba(184,144,106,0.14); }
  .wtb-row-card--open { border-color: var(--wtb-border); border-left-color: var(--wtb-row-color, #ffffff); }
  .wtb-row-card--location { background: var(--wtb-location-card); }
  .wtb-row-card--location .wtb-row-name,
  .wtb-row-card--location .wtb-row-time,
  .wtb-row-card--location .wtb-row-duration,
  .wtb-row-card--location .wtb-row-duration input { color: var(--wtb-location-text); }
  .wtb-row-card--location .wtb-row-time,
  .wtb-row-card--location .wtb-row-duration input,
  .wtb-row-card--location .wtb-row-field textarea,
  .wtb-row-card--location .wtb-row-option-btn { border-color: var(--wtb-location-border); }
  .wtb-row-card--location .wtb-row-field textarea,
  .wtb-row-card--location .wtb-row-option-btn,
  .wtb-row-card--location .wtb-drag-handle,
  .wtb-row-card--location .wtb-row-expand { color: var(--wtb-location-text); }
  .wtb-row-card--location .wtb-row-field > span,
  .wtb-row-card--location .wtb-row-name::placeholder { color: var(--wtb-location-muted); }
  .wtb-row-card--location .wtb-row-name:focus { background: rgba(255,255,255,0.6); }
  .wtb-row-card--constraint {
    background-image: repeating-linear-gradient(45deg, #1a0505 0px, #1a0505 10px, #230808 10px, #230808 20px);
  }
  .wtb-row-line {
    display: flex;
    align-items: center;
    gap: 6px;
    min-height: 42px;
    padding: 3px 4px 3px 0;
    cursor: pointer;
  }
  .wtb-drag-handle {
    align-self: stretch;
    width: 22px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--wtb-text-muted);
    font-size: 16px;
    user-select: none;
    line-height: 1;
  }
  .wtb-row-time {
    flex-shrink: 0;
    width: 74px;
    padding: 3px 4px;
    border: 1px solid var(--wtb-border);
    border-radius: 4px;
    background: transparent;
    color: var(--wtb-text);
    font-family: 'Cormorant Garamond', serif;
    font-size: 18px;
    line-height: 1.1;
    cursor: pointer;
    white-space: nowrap;
  }
  .wtb-row-time-period { font-size: 10px; letter-spacing: 0.08em; margin-left: 3px; opacity: 0.75; font-family: 'Jost', sans-serif; }
  .wtb-row-name-wrap {
    display: inline-grid;
    grid-template-columns: minmax(0, max-content);
    flex: 0 1 auto;
    min-width: 0;
  }
  .wtb-row-name-wrap::after,
  .wtb-row-name {
    grid-area: 1 / 1;
    font-size: 14px;
    font-family: 'Jost', sans-serif;
    padding: 5px 6px;
  }
  .wtb-row-name-wrap::after {
    content: attr(data-value);
    visibility: hidden;
    white-space: pre;
    overflow: hidden;
    border: 1px solid transparent;
  }
  .wtb-row-name {
    width: 100%;
    min-width: 0;
    border: 1px solid transparent;
    border-radius: 4px;
    background: transparent;
    color: var(--wtb-text);
    text-overflow: ellipsis;
    cursor: text;
  }
  .wtb-row-spacer { flex: 1 1 0; min-width: 4px; align-self: stretch; }
  .wtb-row-name:hover { border-color: var(--wtb-border-subtle); }
  .wtb-row-name:focus { border-color: var(--wtb-accent); background: var(--wtb-input-bg); }
  .wtb-row-name--static { color: #ff6b6b; font-weight: 600; cursor: pointer; }
  .wtb-row-marks { display: inline-flex; gap: 3px; flex-shrink: 0; font-size: 12px; line-height: 1; }
  .wtb-mark--off { opacity: 0.2; filter: grayscale(1); }
  .wtb-row-duration {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 11px;
    color: var(--wtb-text-muted);
    cursor: text;
  }
  .wtb-row-duration input {
    width: 40px;
    padding: 4px 4px;
    text-align: right;
    font-size: 14px;
    border: 1px solid var(--wtb-border);
    border-radius: 4px;
    background: transparent;
  }
  .wtb-row-expand,
  .wtb-row-delete {
    flex-shrink: 0;
    width: 26px;
    height: 26px;
    padding: 0;
    border: 1px solid transparent;
    border-radius: 4px;
    background: none;
    cursor: pointer;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .wtb-row-expand { color: var(--wtb-text-muted); font-size: 14px; }
  .wtb-row-expand:hover { color: var(--wtb-accent); border-color: var(--wtb-border-subtle); }
  .wtb-row-delete { color: #e05252; font-size: 18px; }
  .wtb-row-delete:hover { border-color: #e05252; }
  .wtb-row-panel {
    padding: 6px 8px 8px 28px;
    border-top: 1px solid var(--wtb-border-subtle);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .wtb-row-options { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; }
  .wtb-row-check { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; color: var(--wtb-text); cursor: pointer; }
  .wtb-row-check--off { opacity: 0.5; cursor: default; }
  .wtb-row-option-btn {
    padding: 4px 10px;
    min-height: 28px;
    font-size: 12px;
    font-family: 'Jost', sans-serif;
    border: 1px solid var(--wtb-border);
    border-radius: 4px;
    background: transparent;
    color: var(--wtb-text);
    cursor: pointer;
    white-space: nowrap;
  }
  .wtb-row-option-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .wtb-row-option-btn--danger { color: #e05252; border-color: rgba(224,82,82,0.5); margin-left: auto; }
  .wtb-row-field { display: flex; flex-direction: column; gap: 3px; }
  .wtb-row-field > span {
    font-size: 10px;
    color: var(--wtb-text-muted);
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .wtb-row-field textarea {
    width: 100%;
    font-size: 14px;
    padding: 6px 8px;
    resize: vertical;
    background: transparent;
    border: 1px solid var(--wtb-border);
    border-radius: 4px;
    color: var(--wtb-text);
  }
  .wtb-row-pin {
    flex-shrink: 0;
    width: 24px;
    height: 26px;
    margin-left: -4px;
    padding: 0;
    border: none;
    background: none;
    font-size: 12px;
    line-height: 1;
    cursor: pointer;
    opacity: 0.25;
    filter: grayscale(1);
  }
  .wtb-row-pin:hover { opacity: 0.8; }
  .wtb-row-pin--on { opacity: 1; filter: none; }
  .wtb-row-card--parallel { margin-left: 22px; width: calc(100% - 22px); }
  .wtb-row-notice {
    padding: 3px 10px;
    font-size: 12px;
    font-family: 'Jost', sans-serif;
    border-bottom: 1px solid var(--wtb-border-subtle);
  }
  .wtb-row-notice--overrun { color: #e05252; background: rgba(204,34,34,0.10); }
  .wtb-row-notice--free { color: var(--wtb-text-muted); }

  /* Quick start (Phase 3) */
  .wtb-qs { max-width: 620px; margin: 0 auto; padding: 24px 16px 48px; font-family: 'Jost', sans-serif; }
  .wtb-qs h1 { margin: 8px 0 6px; text-align: center; font-size: clamp(26px, 6vw, 34px); font-weight: 300; color: var(--wtb-text); font-family: 'Cormorant Garamond', serif; }
  .wtb-qs-lead { margin: 0 auto 18px; max-width: 520px; text-align: center; font-size: 14px; line-height: 1.5; color: var(--wtb-text-muted); }
  .wtb-qs-card { background: var(--wtb-surface); border: 1px solid var(--wtb-surface-raised); border-radius: 10px; padding: 8px 18px 18px; }
  .wtb-qs-row { display: flex; flex-direction: column; gap: 6px; padding: 12px 0; border-bottom: 1px solid var(--wtb-border-subtle); }
  .wtb-qs-label { font-size: 14px; color: var(--wtb-text); }
  .wtb-qs-label em { font-style: normal; color: var(--wtb-text-muted); font-size: 12px; }
  .wtb-qs input, .wtb-qs select { font-size: 16px; padding: 6px 8px; border-radius: 4px; }
  .wtb-qs input[type="date"] { max-width: 220px; }
  .wtb-qs-names { display: flex; align-items: center; gap: 8px; color: var(--wtb-text-muted); }
  .wtb-qs-names input { flex: 1; min-width: 0; }
  .wtb-qs-time { display: inline-flex; align-items: center; gap: 4px; color: var(--wtb-text); }
  .wtb-qs-coverage { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 8px; font-size: 14px; color: var(--wtb-text-muted); }
  .wtb-qs-choice { display: flex; flex-wrap: wrap; gap: 8px; }
  .wtb-qs-choice button {
    padding: 8px 14px; min-height: 40px; font-size: 14px; font-family: 'Jost', sans-serif;
    border: 1px solid var(--wtb-border); border-radius: 20px; background: transparent; color: var(--wtb-text); cursor: pointer;
  }
  .wtb-qs-choice button.is-on { background: var(--wtb-accent); border-color: var(--wtb-accent); color: var(--wtb-on-accent); }
  .wtb-qs-build {
    display: block; width: 100%; margin-top: 18px; padding: 14px 20px; border: none; border-radius: 8px;
    background: var(--wtb-accent); color: var(--wtb-on-accent); font-size: 17px; font-weight: 300;
    font-family: 'Jost', sans-serif; letter-spacing: 0.04em; cursor: pointer;
  }
  .wtb-qs-alt { display: flex; justify-content: center; flex-wrap: wrap; gap: 18px; margin-top: 16px; }
  .wtb-qs-alt button { background: none; border: none; color: var(--wtb-accent); font-size: 14px; font-family: 'Jost', sans-serif; text-decoration: underline; cursor: pointer; }

  /* Desktop preview panel */
  .wtb-preview-overlay {
    position: fixed;
    inset: 0;
    z-index: 1050;
    background: var(--wtb-overlay);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }
  .wtb-preview-dialog {
    width: min(980px, 100%);
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--wtb-surface);
    border: 1px solid var(--wtb-border);
    border-radius: 10px;
    padding: 12px 16px 16px;
  }
  .wtb-preview-dialog-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
  }
  .wtb-preview-dialog-head h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 400;
    color: var(--wtb-text);
    font-family: 'Cormorant Garamond', serif;
  }
  .wtb-preview-dialog-head button {
    background: none;
    border: none;
    font-size: 20px;
    color: var(--wtb-text-muted);
    cursor: pointer;
    line-height: 1;
  }
  .wtb-preview-dialog-body { flex: 1; min-height: 0; }

  /* "Deleted … Undo" message */
  .wtb-toast {
    position: fixed;
    left: 50%;
    bottom: 24px;
    transform: translateX(-50%);
    z-index: 1200;
    display: flex;
    align-items: center;
    gap: 16px;
    max-width: calc(100vw - 32px);
    padding: 10px 12px 10px 16px;
    background: var(--wtb-surface-alt);
    color: var(--wtb-text);
    border: 1px solid var(--wtb-border);
    border-radius: 8px;
    box-shadow: 0 4px 16px var(--wtb-shadow);
    font-size: 13px;
    font-family: 'Jost', sans-serif;
  }
  .wtb-toast > span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .wtb-toast button {
    flex-shrink: 0;
    padding: 6px 14px;
    background: var(--wtb-accent);
    color: var(--wtb-on-accent);
    border: none;
    border-radius: 4px;
    font-size: 13px;
    font-family: 'Jost', sans-serif;
    cursor: pointer;
  }
  .wtb-toast--above-dock { bottom: calc(76px + env(safe-area-inset-bottom, 0px)); }

  /* Gap between rows: "+" to insert; grows into a drop target while dragging */
  .wtb-drop-zone {
    position: relative;
    height: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px dashed transparent;
    border-radius: 6px;
    transition: height 0.12s ease, background-color 0.12s ease;
  }
  .wtb-drop-zone--dragging { height: 16px; }
  .wtb-drop-zone--over {
    height: 40px;
    background-color: rgba(184,144,106,0.08);
    border-color: var(--wtb-accent);
  }
  .wtb-add-between {
    position: relative;
    z-index: 2;
    width: 20px;
    height: 20px;
    padding: 0;
    border-radius: 50%;
    border: 1px dashed var(--wtb-accent);
    background: var(--wtb-bg);
    color: var(--wtb-accent);
    font-size: 15px;
    line-height: 1;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.12s ease;
  }
  .wtb-drop-zone:hover .wtb-add-between,
  .wtb-add-between:focus-visible { opacity: 1; }

  @media (max-width: 900px) {
    .wtb-drag-handle { display: none !important; }
    .wtb-row-line { padding-left: 6px; gap: 4px; min-height: 44px; }
    .wtb-row-time { width: 66px; font-size: 16px; padding: 3px 2px; }
    /* Phones: the lock shows only on pinned rows; pin/unpin is in the expanded options. */
    .wtb-row-pin { width: 18px; margin-left: -3px; }
    .wtb-row-pin:not(.wtb-row-pin--on) { display: none; }
    .wtb-row-card--parallel { margin-left: 14px; width: calc(100% - 14px); }
    .wtb-row-time-period { margin-left: 2px; }
    .wtb-row-name-wrap::after, .wtb-row-name { padding: 5px 4px; }
    .wtb-row-marks { font-size: 10px; gap: 1px; }
    .wtb-row-duration > span { display: none; }
    .wtb-row-duration input { width: 34px; }
    .wtb-row-delete { display: none; }
    .wtb-row-panel { padding-left: 8px; }
    .wtb-add-between { opacity: 0.7; }
  }
  @media (max-width: 360px) {
    .wtb-row-marks { display: none; }
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


  .wtb-logistics-timeline-wrap {
    width: 100%;
    margin-bottom: 28px;
  }
  .wtb-logistics-timeline-stack {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  .wtb-logistics-boundary-layer {
    position: relative;
    width: 100%;
    flex-shrink: 0;
  }
  .wtb-logistics-boundary-marker {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 0;
    transform: translateX(-50%);
    pointer-events: none;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .wtb-logistics-boundary-marker--below {
    flex-direction: column;
  }
  .wtb-logistics-boundary-label {
    font-size: 10px;
    color: var(--wtb-text-muted);
    font-family: 'Jost', sans-serif;
    opacity: 0.85;
    white-space: nowrap;
    line-height: 16px;
    flex-shrink: 0;
  }
  .wtb-logistics-boundary-marker .wtb-logistics-boundary-label {
    margin-bottom: auto;
  }
  .wtb-logistics-boundary-marker--below .wtb-logistics-boundary-label {
    margin-bottom: 0;
    margin-top: auto;
  }
  .wtb-logistics-boundary-line {
    width: 1px;
    flex: 1;
    min-height: 20px;
    background: rgba(184, 144, 106, 0.45);
    opacity: 0.7;
  }
  .wtb-logistics-track {
    background: rgba(184, 144, 106, 0.12);
    border: 1px solid rgba(184, 144, 106, 0.28);
    border-radius: 8px;
  }
  .wtb-logistics-segment {
    border: 1px solid transparent;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 0 4px;
    box-sizing: border-box;
    overflow: hidden;
    transition: background 0.55s ease, border-color 0.55s ease, opacity 0.55s ease, width 0.55s ease, left 0.55s ease;
  }
  .wtb-logistics-confirm-banner {
    opacity: 1;
    transition: opacity 0.4s ease;
  }
  .wtb-logistics-confirm-banner--fade {
    opacity: 0;
  }
  .wtb-logistics-segment--overflow {
    background-image: repeating-linear-gradient(
      45deg,
      rgba(26, 5, 5, 0.55) 0px,
      rgba(26, 5, 5, 0.55) 8px,
      rgba(35, 8, 8, 0.55) 8px,
      rgba(35, 8, 8, 0.55) 16px
    ) !important;
    animation: wtb-logistics-pulse 2s ease-in-out infinite;
  }
  .wtb-logistics-segment--resolved {
    animation: none;
  }
  @keyframes wtb-logistics-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(139, 69, 69, 0.35); }
    50% { box-shadow: 0 0 0 3px rgba(139, 69, 69, 0.25); }
  }
  .wtb-logistics-segment-inner-label {
    font-size: 10px;
    font-weight: 600;
    color: var(--wtb-text);
    font-family: 'Jost', sans-serif;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    min-width: 0;
    text-align: center;
  }
  .wtb-logistics-segment-icon {
    font-size: 12px;
    font-weight: 600;
    flex-shrink: 0;
    line-height: 1;
  }
  .wtb-logistics-ceremony {
    border: 2px solid var(--wtb-accent) !important;
    background: rgba(184, 144, 106, 0.18) !important;
    box-sizing: border-box;
  }
  .wtb-logistics-ceremony-text {
    color: var(--wtb-accent);
  }
  .wtb-logistics-ceremony--vertical-label {
    overflow: visible;
  }
  .wtb-logistics-ceremony-text--vertical {
    writing-mode: vertical-rl;
    text-orientation: mixed;
    white-space: nowrap;
    font-size: 9px;
    line-height: 1;
    letter-spacing: 0.04em;
    overflow: visible;
    text-overflow: clip;
    flex: 0 0 auto;
    max-height: none;
  }
  .wtb-logistics-ruler-line {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: 1px;
    background: var(--wtb-border-subtle);
  }
  .wtb-logistics-ruler-tick {
    font-size: 10px;
    color: var(--wtb-text-muted);
    font-family: 'Jost', sans-serif;
    top: 6px;
    white-space: nowrap;
  }
  .wtb-logistics-window-card--expanded {
    background: var(--wtb-surface-raised) !important;
  }
  .wtb-logistics-control--highlight {
    box-shadow: 0 0 12px rgba(184, 144, 106, 0.12);
  }
  .wtb-logistics-wizard .wtb-logistics-timeline-wrap {
    width: 100%;
  }
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
