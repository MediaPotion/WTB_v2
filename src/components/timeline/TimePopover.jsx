import React, { useState, useEffect } from "react";
import { MINUTE_OPTIONS_5, snapMinuteToFive } from "../../lib/time";

function TimePopover({ open, value, onSet, onClose }) {
  const [hh, setHh] = useState("12");
  const [mm, setMm] = useState("00");
  const [ap, setAp] = useState("PM");

  useEffect(() => {
    if (open && value) {
      setHh(value.hour?.toString() || "12");
      setMm(snapMinuteToFive(value.minute));
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
            {MINUTE_OPTIONS_5.map((m) => (
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

export { TimePopover };
