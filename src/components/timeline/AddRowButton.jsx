import React from "react";

// Small "+" in the gap between rows. On desktop it shows on hover; on phones
// it is always visible (see .wtb-add-between in styles.js).
function AddRowButton({ onClick, isLast }) {
  if (isLast) return null;

  return (
    <button
      type="button"
      className="wtb-add-between"
      onClick={onClick}
      title="Add an event here"
      aria-label="Add an event here"
    >
      +
    </button>
  );
}

export { AddRowButton };
