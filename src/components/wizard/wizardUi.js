/** Shared wizard step UI helpers (timeline logistics modal, settings tabs, etc.). */

export function wizToggleStyle(selected) {
  return {
    padding: "12px 24px",
    borderRadius: 8,
    border: selected ? "1px solid var(--wtb-accent)" : "1px solid var(--wtb-border)",
    background: selected ? "rgba(184,144,106,0.15)" : "var(--wtb-surface)",
    color: selected ? "var(--wtb-accent)" : "var(--wtb-text-muted)",
    fontFamily: "'Jost', sans-serif",
    fontWeight: selected ? 400 : 300,
    fontSize: 15,
    cursor: "pointer",
    transition: "all 0.2s",
    minWidth: 80,
    minHeight: 44,
  };
}

export const wizCheckRowStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: 12,
  padding: "14px 16px",
  borderRadius: 8,
  border: "1px solid var(--wtb-border-subtle)",
  background: "var(--wtb-surface)",
  cursor: "pointer",
  marginBottom: 10,
  transition: "border-color 0.2s",
  minHeight: 44,
};

export function wizSectionHeading(text) {
  return (
    <div
      style={{
        fontFamily: "'Jost', sans-serif",
        fontSize: 11,
        fontWeight: 300,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: "var(--wtb-accent)",
        margin: "20px 0 10px",
      }}
    >
      {text}
    </div>
  );
}
