import React from "react";

function LogisticsApplyBar({
  summary,
  hasPending,
  onApply,
  onDiscard,
  applying,
}) {
  if (!hasPending) return null;

  return (
    <div
      className="wtb-logistics-apply-bar"
      style={{
        marginTop: 20,
        paddingTop: 18,
        borderTop: "1px solid var(--wtb-border-subtle)",
      }}
    >
      {summary ? (
        <p
          style={{
            margin: "0 0 14px",
            fontSize: 13,
            color: "var(--wtb-text)",
            lineHeight: 1.55,
            fontFamily: "'Jost', sans-serif",
          }}
        >
          {summary}
        </p>
      ) : null}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 12,
        }}
      >
        <button
          type="button"
          onClick={onApply}
          disabled={applying}
          style={{
            padding: "12px 28px",
            background: "var(--wtb-accent)",
            color: "var(--wtb-on-accent)",
            border: "none",
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 500,
            cursor: applying ? "wait" : "pointer",
            fontFamily: "'Jost', sans-serif",
            opacity: applying ? 0.85 : 1,
          }}
        >
          {applying ? "Applying…" : "Apply Changes"}
        </button>
        <button
          type="button"
          onClick={onDiscard}
          disabled={applying}
          style={{
            padding: 0,
            background: "none",
            border: "none",
            color: "var(--wtb-text-muted)",
            fontSize: 13,
            textDecoration: "underline",
            cursor: applying ? "wait" : "pointer",
            fontFamily: "'Jost', sans-serif",
          }}
        >
          Discard Changes
        </button>
      </div>
    </div>
  );
}

export { LogisticsApplyBar };
