import React, { useEffect, useState } from "react";

function LogisticsConfirmBanner({ message, tone, onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!message) return undefined;
    setVisible(true);
    const fadeTimer = setTimeout(() => setVisible(false), 2700);
    const doneTimer = setTimeout(() => onDone?.(), 3000);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [message, onDone]);

  if (!message) return null;

  const color =
    tone === "success" ? "#6b8f71" : tone === "warning" ? "var(--wtb-accent)" : "var(--wtb-text)";

  return (
    <div
      className={`wtb-logistics-confirm-banner${visible ? "" : " wtb-logistics-confirm-banner--fade"}`}
      style={{
        marginBottom: 20,
        padding: "12px 16px",
        borderRadius: 8,
        border: `1px solid ${tone === "success" ? "rgba(107, 143, 113, 0.45)" : "rgba(184, 144, 106, 0.45)"}`,
        background:
          tone === "success"
            ? "rgba(107, 143, 113, 0.12)"
            : "rgba(184, 144, 106, 0.1)",
        color,
        fontSize: 14,
        fontFamily: "'Jost', sans-serif",
        lineHeight: 1.5,
      }}
      role="status"
    >
      {message}
    </div>
  );
}

export { LogisticsConfirmBanner };
