const THEME_STORAGE_KEY = "wtb-theme";

const THEME_CSS = `
  :root,
  [data-theme="dark"] {
    --wtb-bg: #060504;
    --wtb-surface: #0f0d0b;
    --wtb-surface-raised: #161310;
    --wtb-surface-alt: #1a1714;
    --wtb-border: #2a2520;
    --wtb-border-subtle: #1e1c19;
    --wtb-text: #ddd0bc;
    --wtb-text-muted: #6e6358;
    --wtb-text-faint: #3a3530;
    --wtb-accent: #b8906a;
    --wtb-on-accent: #060504;
    --wtb-input-bg: #0f0d0b;
    --wtb-disabled-bg: #1e1c19;
    --wtb-row-reorder-bg: #1e1a16;
    --wtb-undo-bg: #1a2228;
    --wtb-undo-bg-active: #4a6070;
    --wtb-undo-text-disabled: #3a4a52;
    --wtb-overlay: rgba(0, 0, 0, 0.75);
    --wtb-overlay-heavy: rgba(0, 0, 0, 0.85);
    --wtb-shadow: rgba(0, 0, 0, 0.4);
    --wtb-location-card: #f5f0e8;
    --wtb-location-panel: #ede7da;
    --wtb-location-handle: #c4b8a0;
    --wtb-location-border: #c8bfb0;
    --wtb-location-text: #1e140a;
    --wtb-location-muted: #7a6548;
    --wtb-grain-opacity: 0.065;
    --wtb-grain-blend: screen;
    --wtb-date-filter: invert(0.6) sepia(0.3) saturate(0.8) hue-rotate(10deg);
  }

  [data-theme="light"] {
    --wtb-bg: #f5f0e8;
    --wtb-surface: #fffdf9;
    --wtb-surface-raised: #efe8dc;
    --wtb-surface-alt: #e8e0d4;
    --wtb-border: #d4c8b8;
    --wtb-border-subtle: #e0d6c8;
    --wtb-text: #1e140a;
    --wtb-text-muted: #6e5c48;
    --wtb-text-faint: #9a8a78;
    --wtb-accent: #a67c52;
    --wtb-on-accent: #fffdf9;
    --wtb-input-bg: #ffffff;
    --wtb-disabled-bg: #e8e0d4;
    --wtb-row-reorder-bg: #e8e0d4;
    --wtb-undo-bg: #d4c8b8;
    --wtb-undo-bg-active: #7a94a8;
    --wtb-undo-text-disabled: #9a8a78;
    --wtb-overlay: rgba(30, 20, 10, 0.45);
    --wtb-overlay-heavy: rgba(30, 20, 10, 0.55);
    --wtb-shadow: rgba(30, 20, 10, 0.12);
    --wtb-location-card: #fff8f0;
    --wtb-location-panel: #f5efe4;
    --wtb-location-handle: #d4c8b8;
    --wtb-location-border: #d4c8b8;
    --wtb-location-text: #1e140a;
    --wtb-location-muted: #6e5c48;
    --wtb-grain-opacity: 0.035;
    --wtb-grain-blend: multiply;
    --wtb-date-filter: none;
  }

  [data-theme="light"] #grain {
    opacity: var(--wtb-grain-opacity);
    mix-blend-mode: var(--wtb-grain-blend);
  }

  .wtb-app-root {
    padding: 4px 10px 10px;
    max-width: 100%;
    margin: 0 auto;
    font-family: 'Jost', sans-serif;
    background-color: var(--wtb-bg);
    min-height: 100vh;
    color: var(--wtb-text);
  }

  .wtb-welcome-screen {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    background: var(--wtb-bg);
    color: var(--wtb-text);
  }

  .wtb-timeline-screen-theme {
    background: var(--wtb-bg) !important;
    color: var(--wtb-text) !important;
  }

  .wtb-header-bar {
    background: var(--wtb-bg) !important;
  }

  .wtb-theme-toggle {
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 10001;
    width: 40px;
    height: 36px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--wtb-surface);
    border: 1px solid var(--wtb-border);
    border-radius: 6px;
    color: var(--wtb-text);
    font-size: 18px;
    line-height: 1;
    cursor: pointer;
    box-shadow: 0 2px 8px var(--wtb-shadow);
    transition: border-color 0.15s, color 0.15s;
  }
  .wtb-theme-toggle:hover {
    border-color: var(--wtb-accent);
    color: var(--wtb-accent);
  }
  .wtb-theme-toggle:focus-visible {
    outline: 2px solid var(--wtb-accent);
    outline-offset: 2px;
  }

  @media (max-width: 900px) {
    .wtb-mobile-header-top {
      padding-right: 88px !important;
    }
    .wtb-mobile-gear-anchor {
      right: 48px !important;
    }
  }
`;

function getStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch (_) {
    /* ignore */
  }
  return "dark";
}

function applyTheme(theme) {
  const resolved = theme === "light" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", resolved);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", resolved === "light" ? "#f5f0e8" : "#060504");
  }
  return resolved;
}

export { THEME_STORAGE_KEY, THEME_CSS, getStoredTheme, applyTheme };
