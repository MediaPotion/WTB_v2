import React from "react";
import { LOGISTICS_STATUS_UI } from "../../lib/logisticsStatus";

function LogisticsCheckButton({ status = "ok", onClick }) {
  const ui = LOGISTICS_STATUS_UI[status] || LOGISTICS_STATUS_UI.ok;

  return (
    <button
      type="button"
      onClick={onClick}
      title={`Logistics check — ${ui.label}`}
      aria-label={`Logistics check: ${ui.label}`}
      style={{
        padding: "6px 12px",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: "var(--wtb-surface)",
        color: "var(--wtb-text)",
        border: `1px solid ${ui.border}`,
        borderRadius: 4,
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 300,
        fontFamily: "'Jost', sans-serif",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: `${ui.color}22`,
          color: ui.color,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        {ui.icon}
      </span>
      Logistics Check
    </button>
  );
}

export { LogisticsCheckButton };
