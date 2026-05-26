import React from "react";

function ThemeToggle({ theme, onToggle, inline = false }) {
  const isLight = theme === "light";
  return (
    <button
      type="button"
      className={`wtb-theme-toggle${inline ? " wtb-theme-toggle--inline" : ""}`}
      onClick={onToggle}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      title={isLight ? "Dark mode" : "Light mode"}
    >
      {isLight ? "☀" : "☾"}
    </button>
  );
}

export { ThemeToggle };
