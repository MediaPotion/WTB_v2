import React, { useState, useEffect, useMemo, useRef } from "react";

/* --------------------------------------
   Shared data (used by sidebar & popup)
---------------------------------------*/
const EVENT_BLOCKS = [
  "Details: Drone & Venue Shots::30",
  "Details: Rings,Invitations, & Accessories::20",
  "Details: Dress Shots::10",
  "Bride (Pre-Dress): Bridemaids Group Shots::10",
  "Bride (Pre-Dress): Bridemaids Individual Shots::10",
  "Bride (Pre-Dress): Hair & Makeup Details::10",
  "Bride (Pre-Dress): Putting Dress On::10",
  "Bride (Dress On): Accessory Shots::10",
  "Bride (Dress On): Bride Portraits::15",
  "Bride (Dress On): Bridemaids Group Shots::10",
  "Bride (Dress On): Bridemaids Individual Shots::10",
  "First Look: with Parent::10",
  "First Look: with Bridemaids::10",
  "First Look: with Groom::10",
  "Narration: Bride Record Narration::15",
  "Narration: Groom Record Narration::15",
  "Groom: Assisted with Tie & Jacket::10",
  "Groom: Portraits::15",
  "Groom: Groomsmen Group Shots::10",
  "Groom: Groomsmen Individual Shots::10",
  "Ceremony: Audio/Video Setup::20",
  "Ceremony: Average::30",
  "Ceremony: Catholic::60",
  "Group Photos: Family (5 Groups)::20",
  "Group Photos: Family (10 Groups)::45",
  "Wedding Party: Group Shots::15",
  "Bride & Groom: Portraits::20",
  "Bride & Groom: Golden Hour Portraits::20",
  "Reception: Audio/Video Setup::20",
  "Reception: Grand Entrances::10",
  "Reception: Cake Cutting::5",
  "Reception: Bride & Groom Dance::5",
  "Reception: Bride & Parent Dance::5",
  "Reception: Groom & Parent Dance::5",
  "Reception: Special Dance::5",
  "Reception: Dinner::30",
  "Reception: Speeches (Per Speaker)::10",
  "Reception: Open Dance Floor::20",
  "Reception: Garder Belt Toss::15",
  "Reception: Bouquet Toss::15",
];

const COLOR_BUCKETS = {
  Details: "#FFE5B4",
  "Bride (Pre-Dress)": "#FFB6C1",
  "Bride (Dress On)": "#FF69B4",
  "First Look": "#20B2AA",
  "Bride & Groom:": "#DA70D6",
  "Narration:": "#FFA07A",
  "Groom:": "#98FB98",
  "Ceremony:": "#FFD700",
  "Reception:": "#87CEEB",
  "Group Photos:": "#DDA0DD",
  "Wedding Party:": "#B57EDC",
  Other: "#ffffff", // default to white
};

function getEventColor(label, fallback = "#ffffff") {
  if (!label) return fallback;
  const key = Object.keys(COLOR_BUCKETS).find((k) => label.startsWith(k));
  return COLOR_BUCKETS[key] || COLOR_BUCKETS.Other;
}

/* --------------------------------------
   CSS injected at runtime
---------------------------------------*/
const MOBILE_TWEAKS = `
  /* Prevent iOS zoom on focus (keep inputs >=16px) */
  input, select, textarea { font-size: 16px; }

  /* Hide desktop number spinners just in case */
  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
  input[type="number"] { -moz-appearance: textfield; }

  /* Small helpers */
  .wtb-mins input { width: 44px; padding: 2px 4px; text-align: center; }
  .wtb-notes { padding-right: 10px; }

  /* App shell with optional desktop sidebar */
  .wtb-shell {
    display: grid;
    grid-template-columns: 1fr; /* mobile/tablet: single column */
    gap: 10px;
  }

  /* DESKTOP: main (50%) | sidebar (50%) */
  @media (min-width: 901px) {
    .wtb-shell {
      grid-template-columns: 1fr 1fr; /* equal halves */
      gap: 16px;
      align-items: start;
    }
    .wtb-sidebar {
      display: block;
      position: sticky;
      top: 10px;
      max-height: calc(100vh - 20px);
      overflow: auto; /* should not scroll if columns fit; safety fallback */
      border: 1px solid #ddd;
      background: #fff;
      border-radius: 8px;
      padding: 12px;
    }
  }

  /* Hide sidebar on small screens */
  @media (max-width: 900px) {
    .wtb-sidebar { display: none; }
  }

  /* Sidebar styling */
  .wtb-side-title {
    margin: 0 0 8px 0;
    text-align: center;
    font-size: 16px;
    font-weight: bold;
    color: #333;
  }
  .wtb-side-note {
    font-size: 12px;
    color: #666;
    text-align: center;
    margin-bottom: 8px;
  }

  /* --- Palette: top-down order, then next column --- */
  @media (min-width: 901px) {
    .wtb-palette {
      /* Multi-column layout flows items vertically first, then next column */
      column-count: 3;           /* at least 3 columns */
      column-gap: 10px;
    }
    /* Add more columns as width grows to help fit everything without scrolling */
    @media (min-width: 1200px) { .wtb-palette { column-count: 4; } }
    @media (min-width: 1500px) { .wtb-palette { column-count: 5; } }

    .wtb-palette button {
      display: inline-block;     /* required for multi-column flow */
      width: 100%;
      padding: 8px;              /* compact to fit more per column */
      margin: 0 0 8px;           /* vertical spacing */
      border: 2px solid #999;
      border-radius: 8px;
      text-align: left;
      font-size: 13px;
      cursor: grab;
      user-select: none;
      break-inside: avoid;       /* keep a button from splitting between columns */
      -webkit-column-break-inside: avoid;
      page-break-inside: avoid;
    }
    .wtb-palette button:active { cursor: grabbing; }
  }

  /* Mobile/tablet fallback keeps a single column list */
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
      border: 2px solid #999;
      border-radius: 8px;
      text-align: left;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      cursor: grab;
      user-select: none;
    }
  }

  /* Bottom grid: Duration | Location | Setting (content-tight right col) */
  @media (max-width: 480px) {
    .wtb-bottom {
      grid-template-columns: auto minmax(0,1fr) max-content !important;
      gap: 4px !important;
      padding-right: 12px !important;
      align-items: start !important;
    }
    .wtb-bottom > div:nth-child(3) {
      width: auto !important;
      justify-self: end !important;
      align-items: stretch !important;
    }
    .wtb-bottom > div:nth-child(3) button {
      width: 100% !important;
      display: flex !important;
    }
    .wtb-location textarea {
      width: 100% !important;
      min-width: 0 !important;
      box-sizing: border-box !important;
    }
    .wtb-notes {
      grid-column: 1 / -1 !important;
      margin-top: 2px !important;
    }
  }

  /* Compact time row + centered on small screens */
  .time-range { display: flex; align-items: center; gap: 4px; }
  .time-range .time-dash { display: inline-block; margin: 0 6px; line-height: 1; }
  @media (max-width: 480px) { .time-range { justify-content: center; } }

  /* Setting column extra breathing room on desktop (left/right only) */
  @media (min-width: 901px) {
    .wtb-setting-col { padding: 0 8px; }
  }

  /* Row drop highlight */
  .wtb-dropping { outline: 2px dashed #4CAF50; outline-offset: -2px; }
`;

/* ---------------- helpers ---------------- */
function formatTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours < 12 ? "AM" : "PM";
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return {
    hour: displayHour.toString(),
    minute: minutes.toString().padStart(2, "0"),
    period,
  };
}
function parseTimeInput(hourStr, minuteStr, period) {
  const hours = parseInt(hourStr, 10) % 12;
  const minutes = parseInt(minuteStr, 10);
  let total = hours * 60 + minutes;
  if (period === "PM") total += 720;
  return total;
}

/* ---------------- Time Popover ---------------- */
function TimePopover({ open, value, onSet, onClose }) {
  const [hh, setHh] = useState("12");
  const [mm, setMm] = useState("00");
  const [ap, setAp] = useState("PM");

  useEffect(() => {
    if (open && value) {
      setHh(value.hour?.toString() || "12");
      setMm(value.minute?.toString().padStart(2, "0") || "00");
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
  const minutes = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, "0")
  );

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
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
          background: "#fff",
          border: "1px solid #ccc",
          borderRadius: 10,
          padding: 12,
          zIndex: 1001,
          boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
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
              border: "1px solid #ccc",
              borderRadius: 6,
            }}
          >
            {hours.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
          <span style={{ fontSize: 16, lineHeight: "32px" }}>:</span>
          <select
            value={mm}
            onChange={(e) => setMm(e.target.value)}
            style={{
              width: 64,
              height: 32,
              fontSize: 14,
              border: "1px solid #ccc",
              borderRadius: 6,
            }}
          >
            {minutes.map((m) => (
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
              border: "1px solid #ccc",
              borderRadius: 6,
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
              border: "1px solid #ccc",
              background: "#f5f5f5",
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
              border: "1px solid #4CAF50",
              background: "#4CAF50",
              color: "white",
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

/* ---------------- Event Selector (existing popup) ---------------- */
function EventBlockSelector({ isVisible, onSelect, onClose, currentEvent }) {
  const [customEvent, setCustomEvent] = useState(currentEvent || "");
  const [customDuration, setCustomDuration] = useState("30");

  useEffect(() => {
    if (isVisible) setCustomEvent(currentEvent || "");
  }, [isVisible, currentEvent]);

  const isValidDuration =
    /\d+/.test(customDuration) && parseInt(customDuration, 10) > 0;

  const handleCustomEventSubmit = () => {
    if (!customEvent.trim() || !isValidDuration) return;
    onSelect({
      event: customEvent.trim(),
      duration: parseInt(customDuration, 10),
    });
  };

  const normalizeCustomDuration = () => {
    if (customDuration === "") return;
    const n = parseInt(customDuration, 10);
    if (isNaN(n) || n <= 0) setCustomDuration("");
    else setCustomDuration(String(n));
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 1100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: 8,
          padding: 20,
          maxHeight: "80vh",
          overflowY: "auto",
          width: "100%",
          maxWidth: 500,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h3 style={{ margin: 0 }}>Select or Create Event</h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 24,
              cursor: "pointer",
              color: "#666",
            }}
          >
            ×
          </button>
        </div>

        {/* Custom Event */}
        <div
          style={{
            marginBottom: 20,
            padding: 15,
            backgroundColor: "#f8f9fa",
            borderRadius: 8,
            border: "2px solid #e9ecef",
          }}
        >
          <h4 style={{ margin: "0 0 10px 0", color: "#333" }}>
            Create Custom Event
          </h4>
          <div style={{ marginBottom: 10 }}>
            <label
              style={{
                display: "block",
                marginBottom: 5,
                fontSize: 12,
                color: "#666",
                fontWeight: "bold",
              }}
            >
              Event Name:
            </label>
            <input
              type="text"
              value={customEvent}
              onChange={(e) => setCustomEvent(e.target.value)}
              placeholder="Enter custom event name..."
              style={{
                width: "100%",
                padding: 8,
                border: "1px solid #ccc",
                borderRadius: 4,
                fontSize: 14,
              }}
            />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label
              style={{
                display: "block",
                marginBottom: 5,
                fontSize: 12,
                color: "#666",
                fontWeight: "bold",
              }}
            >
              Duration (minutes):
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={customDuration}
              onChange={(e) =>
                setCustomDuration(e.target.value.replace(/\D/g, ""))
              }
              onBlur={normalizeCustomDuration}
              placeholder="e.g. 30"
              style={{
                width: 100,
                padding: 8,
                border: "1px solid #ccc",
                borderRadius: 4,
                fontSize: 14,
              }}
            />
          </div>
          <button
            onClick={handleCustomEventSubmit}
            disabled={!customEvent.trim() || !isValidDuration}
            style={{
              padding: "10px 20px",
              backgroundColor:
                customEvent.trim() && isValidDuration ? "#4CAF50" : "#ccc",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor:
                customEvent.trim() && isValidDuration
                  ? "pointer"
                  : "not-allowed",
              fontSize: 14,
              fontWeight: "bold",
            }}
          >
            Use Custom Event
          </button>
        </div>

        <div style={{ marginBottom: 10, fontWeight: "bold", color: "#666" }}>
          Or Select Preset Event:
        </div>

        {EVENT_BLOCKS.map((block) => {
          const [label, duration] = block.split("::");
          return (
            <button
              key={block}
              onClick={() =>
                onSelect({ event: label, duration: parseInt(duration, 10) })
              }
              style={{
                width: "100%",
                padding: 12,
                margin: "4px 0",
                backgroundColor: getEventColor(label),
                border: "2px solid #999",
                borderRadius: 8,
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              <span>{label}</span>
              <span style={{ fontSize: 12, color: "#555", fontWeight: "bold" }}>
                {duration} min
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Timeline Row ---------------- */
function TimelineRow({
  row,
  index,
  onChange,
  onBlur,
  onDelete,
  onEventClick,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  onEventBlur,
  onTimeSet,
  photoEnabledGlobal,
  videoEnabledGlobal,
  onDropEventBlock,
}) {
  const t = formatTime(row.time);
  const timeBtnRef = useRef(null);
  const [timeOpen, setTimeOpen] = useState(false);
  const [dropping, setDropping] = useState(false);

  // Drop handlers on the whole row
  const allowDrop = (e) => {
    if (e.dataTransfer?.types?.includes("application/json")) {
      e.preventDefault();
      setDropping(true);
    }
  };
  const leaveDrop = () => setDropping(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDropping(false);
    try {
      const raw = e.dataTransfer.getData("application/json");
      if (!raw) return;
      const data = JSON.parse(raw); // { event, duration }
      if (data?.event && data?.duration) {
        onDropEventBlock(index, data);
      }
    } catch (_) {}
  };

  const rowBg = getEventColor(row.event || "", "#ffffff");

  return (
    <div
      onDragOver={allowDrop}
      onDragEnter={allowDrop}
      onDragLeave={leaveDrop}
      onDrop={handleDrop}
      className={dropping ? "wtb-dropping" : ""}
      style={{
        border: "1px solid #ccc",
        borderRadius: 8,
        marginBottom: 12,
        backgroundColor: rowBg,
        overflow: "hidden",
        width: "100%",
        position: "relative",
      }}
    >
      {/* TOP row: Buttons (left) | Time (middle) | Event (+photo/video) (right) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto auto 1fr",
          padding: 6,
          backgroundColor: rowBg,
          borderBottom: "1px solid #ccc",
          gap: 9,
          alignItems: "center",
        }}
      >
        {/* Button group (left) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          {!isFirst ? (
            <button
              onClick={() => onMoveUp(index)}
              style={{
                width: 26,
                height: 18,
                fontSize: 12,
                border: "1px solid #333",
                background: "white",
                color: "black",
                cursor: "pointer",
                borderRadius: 4,
                fontWeight: "bold",
                lineHeight: 1,
              }}
              title="Move Up"
            >
              ▲
            </button>
          ) : (
            <div style={{ width: 26, height: 18 }} />
          )}

          <button
            onClick={() => onDelete(index)}
            style={{
              width: 26,
              height: 18,
              fontSize: 14,
              border: "1px solid #ff4444",
              background: "#ff4444",
              color: "white",
              cursor: "pointer",
              borderRadius: 4,
              fontWeight: "bold",
              lineHeight: 1,
            }}
            title="Delete"
          >
            ×
          </button>

          {!isLast ? (
            <button
              onClick={() => onMoveDown(index)}
              style={{
                width: 26,
                height: 18,
                fontSize: 12,
                border: "1px solid #333",
                background: "white",
                color: "black",
                cursor: "pointer",
                borderRadius: 4,
                fontWeight: "bold",
                lineHeight: 1,
              }}
              title="Move Down"
            >
              ▼
            </button>
          ) : (
            <div style={{ width: 26, height: 18 }} />
          )}
        </div>

        {/* Time (middle) */}
        <div>
          <label
            style={{
              fontSize: 12,
              color: "#666",
              display: "block",
              marginBottom: 4,
            }}
          >
            Time
          </label>
          <button
            ref={timeBtnRef}
            onClick={() => setTimeOpen(true)}
            style={{
              width: 50,
              padding: "2px 1px",
              fontSize: 14,
              textAlign: "center",
              border: "1px solid #ccc",
              background: "white",
              borderRadius: 4,
              cursor: "pointer",
            }}
            title="Click to set time"
          >
            {t.hour}:{t.minute} {t.period}
          </button>
        </div>

        {/* Event column (right) */}
        <div>
          {/* Header row: Event label (left) and Photo/Video (right) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <label style={{ fontSize: 12, color: "#666" }}>Event</label>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <label
                style={{
                  fontSize: 12,
                  display: "flex",
                  gap: 6,
                  alignItems: "center",
                  opacity: photoEnabledGlobal ? 1 : 0.5,
                }}
              >
                <input
                  type="checkbox"
                  checked={!!row.photo}
                  onChange={(e) => onChange(index, "photo", e.target.checked)}
                  onBlur={() => onBlur(index)}
                  disabled={!photoEnabledGlobal}
                />
                Photo
              </label>
              <label
                style={{
                  fontSize: 12,
                  display: "flex",
                  gap: 6,
                  alignItems: "center",
                  opacity: videoEnabledGlobal ? 1 : 0.5,
                }}
              >
                <input
                  type="checkbox"
                  checked={!!row.video}
                  onChange={(e) => onChange(index, "video", e.target.checked)}
                  onBlur={() => onBlur(index)}
                  disabled={!videoEnabledGlobal}
                />
                Video
              </label>
            </div>
          </div>

          {/* Event input (also accepts drops) */}
          <input
            type="text"
            placeholder="Click to select or drop an event..."
            value={row.event}
            onChange={(e) => onChange(index, "event", e.target.value)}
            onBlur={() => {
              onBlur(index);
              onEventBlur && onEventBlur(index);
            }}
            onClick={() => onEventClick(index)}
            onDragOver={allowDrop}
            onDragEnter={allowDrop}
            onDragLeave={leaveDrop}
            onDrop={handleDrop}
            style={{
              width: "100%",
              fontSize: 14,
              padding: 8,
              backgroundColor: "white",
              border: "1px solid #ccc",
              borderRadius: 4,
              cursor: "pointer",
            }}
          />
        </div>
      </div>

      {/* BOTTOM: Duration | Location | Setting (3 columns) */}
      <div
        className="wtb-bottom"
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          padding: 8,
          paddingRight: 4,
          gap: 4,
          alignItems: "start",
        }}
      >
        {/* Duration */}
        <div style={{ width: "auto" }}>
          <label
            style={{
              fontSize: 12,
              color: "#666",
              display: "block",
              marginBottom: 4,
            }}
          >
            Duration
          </label>
          <div style={{ position: "relative", width: 65 }}>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={row.duration}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, "");
                onChange(index, "duration", val);
              }}
              onBlur={() => onBlur(index)}
              style={{
                width: "100%",
                fontSize: 14,
                padding: "6px 34px 6px 12px",
                textAlign: "left",
                border: "1px solid #ccc",
                borderRadius: 6,
                boxSizing: "border-box",
              }}
            />
            <span
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 12,
                color: "#666",
                pointerEvents: "none",
              }}
            >
              mins
            </span>
          </div>
        </div>

        {/* Location */}
        <div className="wtb-location">
          <label
            style={{
              fontSize: 12,
              color: "#666",
              display: "block",
              marginBottom: 4,
            }}
          >
            Location
          </label>
          <textarea
            placeholder="Leave blank if no change in location..."
            value={row.location}
            onChange={(e) => onChange(index, "location", e.target.value)}
            onBlur={(e) => {
              onBlur(index);
              e.target.scrollTop = 0;
              if (typeof e.target.setSelectionRange === "function") {
                e.target.setSelectionRange(0, 0);
              }
            }}
            rows={2}
            style={{
              width: "100%",
              minWidth: 0,
              fontSize: 14,
              padding: 8,
              resize: "none",
              backgroundColor: "white",
              border: "1px solid #ccc",
              borderRadius: 4,
            }}
          />
        </div>

        {/* Setting (right): two stacked buttons */}
        <div className="wtb-setting-col" style={{ width: "auto" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              transform:
                "translateY(-20px)" /* keep previous vertical alignment */,
            }}
          >
            {/* Outside */}
            <button
              onClick={() => {
                if (!row.isOutdoor) {
                  onChange(index, "isOutdoor", true);
                  onBlur(index);
                }
              }}
              aria-pressed={row.isOutdoor}
              title="Outside"
              style={{
                marginTop: "22px",
                width: "100%",
                padding: "4px 4px",
                border: "1px solid #333",
                background: row.isOutdoor ? "#87CEEB" : "#ffffff",
                color: "#111",
                cursor: "pointer",
                borderRadius: 8,
                fontWeight: "bold",
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                whiteSpace: "nowrap",
                fontSize: 10,
              }}
            >
              <span aria-hidden style={{ fontSize: 16, lineHeight: 1 }}>
                ☀️
              </span>
              <span style={{ lineHeight: 1 }}>Outside</span>
            </button>

            {/* Indoors */}
            <button
              onClick={() => {
                if (row.isOutdoor) {
                  onChange(index, "isOutdoor", false);
                  onBlur(index);
                }
              }}
              aria-pressed={!row.isOutdoor}
              title="Indoors"
              style={{
                width: "100%",
                padding: "4px 4px",
                border: "1px solid #333",
                background: !row.isOutdoor ? "#FFA500" : "#ffffff",
                color: "#111",
                cursor: "pointer",
                borderRadius: 8,
                fontWeight: "bold",
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                whiteSpace: "nowrap",
                fontSize: 10,
              }}
            >
              <span aria-hidden style={{ fontSize: 16, lineHeight: 1 }}>
                💡
              </span>
              <span style={{ lineHeight: 1 }}>Indoors</span>
            </button>
          </div>
        </div>

        {/* Notes (full width) */}
        <div
          className="wtb-notes"
          style={{ gridColumn: "1 / -1", marginTop: 5 }}
        >
          <label
            style={{
              fontSize: 12,
              color: "#666",
              display: "block",
              marginBottom: -25,
              position: "relative",
              top: "-30px",
            }}
          >
            Notes
          </label>
          <textarea
            placeholder="Add any notes for this event..."
            value={row.notes || ""}
            onChange={(e) => onChange(index, "notes", e.target.value)}
            onBlur={() => onBlur(index)}
            rows={2}
            style={{
              width: "100%",
              boxSizing: "border-box",
              fontSize: 13,
              padding: 8,
              resize: "vertical",
              backgroundColor: "white",
              border: "1px solid #ccc",
              borderRadius: 4,
            }}
          />
        </div>
      </div>

      {/* Time popover */}
      <TimePopover
        open={timeOpen}
        onClose={() => setTimeOpen(false)}
        value={{ hour: t.hour, minute: t.minute, period: t.period }}
        onSet={(hh, mm, ap) => {
          onTimeSet(index, hh, mm, ap);
          setTimeOpen(false);
        }}
      />
    </div>
  );
}

/* ---------------- Sidebar (desktop only) ---------------- */
function EventSidebar() {
  return (
    <aside className="wtb-sidebar">
      <h3 className="wtb-side-title">Event Blocks</h3>
      <div className="wtb-side-note">Drag a block onto a row</div>
      <div className="wtb-palette">
        {EVENT_BLOCKS.map((block) => {
          const [label, duration] = block.split("::");
          const dur = parseInt(duration, 10);
          return (
            <button
              key={block}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData(
                  "application/json",
                  JSON.stringify({ event: label, duration: dur })
                );
              }}
              style={{
                backgroundColor: getEventColor(label),
              }}
              title="Drag to timeline"
            >
              <span>{label}</span>
              <span style={{ fontSize: 12, color: "#555", fontWeight: "bold" }}>
                {dur} min
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

/* ---------------- App ---------------- */
export default function MobileApp() {
  const [date, setDate] = useState("");
  const [bride, setBride] = useState("");
  const [groom, setGroom] = useState("");

  // Defaults: 12:00 PM starts
  const [photoStartHour, setPhotoStartHour] = useState("12");
  const [photoStartMinute, setPhotoStartMinute] = useState("00");
  const [photoStartPeriod, setPhotoStartPeriod] = useState("PM");
  const [photoEndHour, setPhotoEndHour] = useState("5");
  const [photoEndMinute, setPhotoEndMinute] = useState("00");
  const [photoEndPeriod, setPhotoEndPeriod] = useState("PM");

  const [videoStartHour, setVideoStartHour] = useState("12");
  const [videoStartMinute, setVideoStartMinute] = useState("00");
  const [videoStartPeriod, setVideoStartPeriod] = useState("PM");
  const [videoEndHour, setVideoEndHour] = useState("5");
  const [videoEndMinute, setVideoEndMinute] = useState("00");
  const [videoEndPeriod, setVideoEndPeriod] = useState("PM");

  // Coverage toggles
  const [photoEnabled, setPhotoEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  // Rows
  const [userRows, setUserRows] = useState([
    {
      id: 1,
      location: "",
      time: 12 * 60,
      event: "",
      duration: 30,
      isOutdoor: false,
      photo: true,
      video: true,
      notes: "",
    },
  ]);
  const [nextId, setNextId] = useState(2);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const [showEventSelector, setShowEventSelector] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);

  const rows = useMemo(() => {
    return [...userRows].sort((a, b) => a.time - b.time);
  }, [userRows]);

  const recalculateTimes = (rowsIn, startIndex = 0) => {
    const newRows = [...rowsIn];
    for (let i = startIndex + 1; i < newRows.length; i++) {
      const prevRow = newRows[i - 1];
      newRows[i].time = prevRow.time + prevRow.duration;
    }
    return newRows;
  };

  const saveToHistory = (newUserRows) => {
    if (JSON.stringify(newUserRows) === JSON.stringify(userRows)) return;
    setHistory((prev) => [...prev.slice(-11), userRows]);
    setRedoStack([]);
    setUserRows(newUserRows);
  };

  const handleChange = (displayIndex, field, value) => {
    const row = rows[displayIndex];
    const userRowIndex = userRows.findIndex((userRow) => userRow.id === row.id);
    if (userRowIndex === -1) return;

    const newUserRows = [...userRows];

    if (field === "duration") {
      const newDuration = parseInt(value, 10) || 0;
      newUserRows[userRowIndex][field] = newDuration;

      const sortedRows = [...newUserRows].sort((a, b) => a.time - b.time);
      const sortedIndex = sortedRows.findIndex(
        (r) => r.id === newUserRows[userRowIndex].id
      );
      const recalculated = recalculateTimes(sortedRows, sortedIndex);

      recalculated.forEach((recalcRow, i) => {
        const originalIndex = newUserRows.findIndex(
          (r) => r.id === sortedRows[i].id
        );
        if (originalIndex !== -1) newUserRows[originalIndex] = recalcRow;
      });
      setUserRows(newUserRows);
      return;
    }

    newUserRows[userRowIndex][field] = value;
    setUserRows(newUserRows);
  };

  const handleBlur = () => {
    saveToHistory(userRows);
  };

  const handleDelete = (displayIndex) => {
    const row = rows[displayIndex];
    const userRowIndex = userRows.findIndex((u) => u.id === row.id);
    if (userRowIndex === -1) return;

    let newUserRows = userRows.filter((_, idx) => idx !== userRowIndex);

    if (newUserRows.length > 0) {
      const sortedRows = [...newUserRows].sort((a, b) => a.time - b.time);
      const deletedSortedIndex = Math.min(userRowIndex, sortedRows.length - 1);
      newUserRows = recalculateTimes(
        sortedRows,
        Math.max(0, deletedSortedIndex - 1)
      );
    }

    saveToHistory(newUserRows);
  };

  const handleMoveUp = (displayIndex) => {
    if (displayIndex === 0) return;
    const currentRow = rows[displayIndex];
    const previousRow = rows[displayIndex - 1];

    const newUserRows = userRows.map((row) => {
      if (row.id === currentRow.id) return { ...row, time: previousRow.time };
      if (row.id === previousRow.id) return { ...row, time: currentRow.time };
      return row;
    });

    const sortedRows = [...newUserRows].sort((a, b) => a.time - b.time);
    const recalculatedRows = recalculateTimes(sortedRows, displayIndex - 1);

    const finalUserRows = userRows.map(
      (row) => recalculatedRows.find((r) => r.id === row.id) || row
    );
    saveToHistory(finalUserRows);
  };

  const handleMoveDown = (displayIndex) => {
    if (displayIndex === rows.length - 1) return;
    const currentRow = rows[displayIndex];
    const nextRow = rows[displayIndex + 1];

    const newUserRows = userRows.map((row) => {
      if (row.id === currentRow.id) return { ...row, time: nextRow.time };
      if (row.id === nextRow.id) return { ...row, time: currentRow.time };
      return row;
    });

    const sortedRows = [...newUserRows].sort((a, b) => a.time - b.time);
    const recalculatedRows = recalculateTimes(sortedRows, displayIndex);

    const finalUserRows = userRows.map(
      (row) => recalculatedRows.find((r) => r.id === row.id) || row
    );
    saveToHistory(finalUserRows);
  };

  const handleEventClick = (index) => {
    setSelectedRowIndex(index);
    setShowEventSelector(true);
  };

  const addRow = () => {
    const lastRow = rows[rows.length - 1];
    const newTime = lastRow ? lastRow.time + lastRow.duration : 12 * 60;
    const newRow = {
      id: nextId,
      location: "",
      time: newTime,
      event: "",
      duration: 30,
      isOutdoor: false,
      photo: photoEnabled,
      video: videoEnabled,
      notes: "",
    };
    setUserRows((prev) => [...prev, newRow]);
    setNextId((n) => n + 1);
  };

  const handleEventSelect = (eventData) => {
    if (selectedRowIndex !== null) {
      const wasBottom = selectedRowIndex === rows.length - 1;
      const row = rows[selectedRowIndex];
      const userRowIndex = userRows.findIndex((u) => u.id === row.id);
      if (userRowIndex !== -1) {
        const newUserRows = [...userRows];
        newUserRows[userRowIndex].event = eventData.event;
        newUserRows[userRowIndex].duration = eventData.duration;

        const sortedRows = [...newUserRows].sort((a, b) => a.time - b.time);
        const sortedIndex = sortedRows.findIndex(
          (r) => r.id === newUserRows[userRowIndex].id
        );
        const recalculated = recalculateTimes(sortedRows, sortedIndex);

        recalculated.forEach((recalcRow, i) => {
          const originalIndex = newUserRows.findIndex(
            (r) => r.id === sortedRows[i].id
          );
          if (originalIndex !== -1) newUserRows[originalIndex] = recalcRow;
        });

        saveToHistory(newUserRows);

        if (wasBottom && eventData.event.trim()) {
          setTimeout(() => addRow(), 0);
        }
      }
    }

    setShowEventSelector(false);
    setSelectedRowIndex(null);
  };

  const handleEventBlur = (displayIndex) => {
    const isBottom = displayIndex === rows.length - 1;
    const hasEvent = rows[displayIndex]?.event?.trim() !== "";
    if (isBottom && hasEvent) addRow();
  };

  // Apply-to-all toggles
  const handlePhotoToggle = (checked) => {
    setPhotoEnabled(checked);
    setUserRows((prev) => prev.map((r) => ({ ...r, photo: checked })));
  };
  const handleVideoToggle = (checked) => {
    setVideoEnabled(checked);
    setUserRows((prev) => prev.map((r) => ({ ...r, video: checked })));
  };

  // Filenames
  const buildDefaultFilename = (ext) => {
    const first = (name, fallback) => (name || fallback).trim().split(/\s+/)[0];
    const brideFirst = first(bride, "Bride");
    const groomFirst = first(groom, "Groom");

    const formatDatePart = (s) => {
      if (!s) return "";
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        const [y, m, d] = s.split("-");
        return `${m}_${d}_${y}`;
      }
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
        const [m, d, y] = s.split("/");
        return `${m}_${d}_${y}`;
      }
      const dt = new Date(s);
      if (!isNaN(dt.getTime())) {
        const mm = String(dt.getMonth() + 1).padStart(2, "0");
        const dd = String(dt.getDate()).padStart(2, "0");
        const yyyy = String(dt.getFullYear());
        return `${mm}_${dd}_${yyyy}`;
      }
      return "";
    };

    const sanitize = (str) =>
      String(str)
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9._()&-]/g, "");

    const datePart = formatDatePart(date) || "MM_DD_YYYY";
    const base =
      datePart +
      "_" +
      sanitize(brideFirst) +
      "_&_" +
      sanitize(groomFirst) +
      "_Timeline";
    return base + "." + ext;
  };

  const saveProject = () => {
    const projectData = {
      date,
      bride,
      groom,
      photoStartHour,
      photoStartMinute,
      photoStartPeriod,
      photoEndHour,
      photoEndMinute,
      photoEndPeriod,
      videoStartHour,
      videoStartMinute,
      videoStartPeriod,
      videoEndHour,
      videoEndMinute,
      videoEndPeriod,
      photoEnabled,
      videoEnabled,
      userRows,
    };

    const dataStr = JSON.stringify(projectData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = buildDefaultFilename("json");
    link.click();
    URL.revokeObjectURL(url);
  };

  const loadProject = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const projectData = JSON.parse(e.target.result);
        setDate(projectData.date || "");
        setBride(projectData.bride || "");
        setGroom(projectData.groom || "");

        setPhotoStartHour(projectData.photoStartHour || "12");
        setPhotoStartMinute(projectData.photoStartMinute || "00");
        setPhotoStartPeriod(projectData.photoStartPeriod || "PM");
        setPhotoEndHour(projectData.photoEndHour || "5");
        setPhotoEndMinute(projectData.photoEndMinute || "00");
        setPhotoEndPeriod(projectData.photoEndPeriod || "PM");

        setVideoStartHour(projectData.videoStartHour || "12");
        setVideoStartMinute(projectData.videoStartMinute || "00");
        setVideoStartPeriod(projectData.videoStartPeriod || "PM");
        setVideoEndHour(projectData.videoEndHour || "5");
        setVideoEndMinute(projectData.videoEndMinute || "00");
        setVideoEndPeriod(projectData.videoEndPeriod || "PM");

        setPhotoEnabled(
          typeof projectData.photoEnabled === "boolean"
            ? projectData.photoEnabled
            : true
        );
        setVideoEnabled(
          typeof projectData.videoEnabled === "boolean"
            ? projectData.videoEnabled
            : true
        );

        setUserRows(
          (projectData.userRows && projectData.userRows.length > 0
            ? projectData.userRows.map((r) => ({
                photo: true,
                video: true,
                notes: "",
                ...r,
              }))
            : [
                {
                  id: 1,
                  location: "",
                  time: 12 * 60,
                  event: "",
                  duration: 30,
                  isOutdoor: false,
                  photo: true,
                  video: true,
                  notes: "",
                },
              ]) || []
        );

        setHistory([]);
        setRedoStack([]);
      } catch (err) {
        alert("Error loading project file");
      }
    };
    reader.readAsText(file);
  };

  const exportTimeline = () => {
    const sortedRows = [...userRows].sort((a, b) => a.time - b.time);

    const lines = [];
    lines.push(`Wedding Timeline for ${bride} & ${groom}`);
    lines.push(`Date: ${date}`, "");
    lines.push(
      `Photo Coverage: ${photoStartHour}:${photoStartMinute} ${photoStartPeriod} - ${photoEndHour}:${photoEndMinute} ${photoEndPeriod}`
    );
    lines.push(
      `Video Coverage: ${videoStartHour}:${videoStartMinute} ${videoStartPeriod} - ${videoEndHour}:${videoEndMinute} ${videoEndPeriod}`,
      "",
      "TIMELINE:",
      ""
    );

    sortedRows.forEach((row) => {
      const time = formatTime(row.time);
      const coverage = [];
      if (row.photo) coverage.push("Photo");
      if (row.video) coverage.push("Video");

      lines.push(`Time: ${time.hour}:${time.minute} ${time.period}`);
      lines.push(`Event: ${row.event || "(no event)"}`);
      lines.push(`Duration: ${row.duration} minutes`);
      lines.push(
        `Coverage: ${coverage.length ? coverage.join(" & ") : "None"}`
      );
      lines.push(`Location: ${row.location}`);
      lines.push(`Setting: ${row.isOutdoor ? "Outside" : "Indoors"}`);
      lines.push(`Notes: ${row.notes ? row.notes : ""}`, "");
    });

    const timeline = lines.join("\n"); // <- real newlines
    const dataBlob = new Blob([timeline], { type: "text/plain" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = buildDefaultFilename("txt");
    link.click();
    URL.revokeObjectURL(url);
  };

  const undo = () => {
    if (history.length > 0) {
      const newHistory = [...history];
      const previousState = newHistory.pop();
      setRedoStack([userRows, ...redoStack]);
      setUserRows(previousState);
      setHistory(newHistory);
    }
  };
  const redo = () => {
    if (redoStack.length > 0) {
      const newRedoStack = [...redoStack];
      const nextState = newRedoStack.shift();
      setHistory([...history, userRows]);
      setUserRows(nextState);
      setRedoStack(newRedoStack);
    }
  };

  // Handle drops from the sidebar onto a row
  const handleDropEventBlockToRow = (displayIndex, data) => {
    const row = rows[displayIndex];
    const userRowIndex = userRows.findIndex((u) => u.id === row.id);
    if (userRowIndex === -1) return;
    const newUserRows = [...userRows];
    newUserRows[userRowIndex].event = data.event;
    newUserRows[userRowIndex].duration = parseInt(data.duration, 10) || 30;

    const sortedRows = [...newUserRows].sort((a, b) => a.time - b.time);
    const sortedIndex = sortedRows.findIndex(
      (r) => r.id === newUserRows[userRowIndex].id
    );
    const recalculated = recalculateTimes(sortedRows, sortedIndex);
    saveToHistory(recalculated);
  };

  return (
    <div
      style={{
        padding: 10,
        maxWidth: "100%",
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <style>{MOBILE_TWEAKS}</style>

      <h1
        style={{
          textAlign: "center",
          margin: "10px 0 5px 0",
          fontSize: "clamp(18px, 5vw, 24px)",
          lineHeight: 1.2,
          color: "#333",
          fontWeight: "bold",
        }}
      >
        Wedding Timeline Builder
      </h1>

      <div style={{ textAlign: "center", margin: "0 0 20px 0" }}>
        <a
          href="mailto:info@mediapotion.net"
          style={{ fontSize: 14, color: "#666", textDecoration: "none" }}
        >
          by MediaPotion
        </a>
      </div>

      {/* App shell: main content + (desktop) sidebar */}
      <div className="wtb-shell">
        {/* MAIN */}
        <div>
          {/* Wedding Details */}
          <div
            style={{
              backgroundColor: "white",
              padding: 15,
              borderRadius: 8,
              marginBottom: 20,
              border: "1px solid #ddd",
              maxWidth: "100%",
            }}
          >
            <h2
              style={{
                textAlign: "center",
                margin: "0 0 15px 0",
                fontSize: 18,
                color: "#333",
              }}
            >
              Wedding Details
            </h2>

            <div
              style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                <label
                  style={{
                    fontSize: 14,
                    fontWeight: "bold",
                    color: "#555",
                    minWidth: 40,
                  }}
                >
                  Date:
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{
                    width: 140,
                    padding: 8,
                    border: "1px solid #ccc",
                    borderRadius: 4,
                    fontSize: 14,
                  }}
                />
              </div>

              {/* Photographers */}
              <div
                style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 6,
                      fontSize: 14,
                      fontWeight: "bold",
                      color: "#555",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={photoEnabled}
                      onChange={(e) => {
                        const enabled = e.target.checked;
                        setPhotoEnabled(enabled);
                        setUserRows((rows) =>
                          rows.map((r) => ({ ...r, photo: enabled }))
                        );
                      }}
                    />
                    Photography
                  </label>

                  {/* Centered, compact time range */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexWrap: "wrap",
                      gap: 3,
                      opacity: photoEnabled ? 1 : 0.5,
                    }}
                  >
                    <input
                      type="text"
                      value={photoStartHour}
                      onChange={(e) => setPhotoStartHour(e.target.value)}
                      disabled={!photoEnabled}
                      style={{
                        width: 40,
                        padding: 6,
                        textAlign: "center",
                        border: "1px solid #ccc",
                        borderRadius: 4,
                        fontSize: 12,
                        background: !photoEnabled ? "#eee" : "white",
                      }}
                    />
                    <span>:</span>
                    <input
                      type="text"
                      value={photoStartMinute}
                      onChange={(e) => setPhotoStartMinute(e.target.value)}
                      disabled={!photoEnabled}
                      style={{
                        width: 40,
                        padding: 6,
                        textAlign: "center",
                        border: "1px solid #ccc",
                        borderRadius: 4,
                        fontSize: 12,
                        background: !photoEnabled ? "#eee" : "white",
                      }}
                    />
                    <select
                      value={photoStartPeriod}
                      onChange={(e) => setPhotoStartPeriod(e.target.value)}
                      disabled={!photoEnabled}
                      style={{
                        padding: 6,
                        border: "1px solid #ccc",
                        borderRadius: 4,
                        fontSize: 12,
                        background: !photoEnabled ? "#eee" : "white",
                      }}
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>

                    <span
                      aria-hidden
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 16,
                        lineHeight: "32px",
                        userSelect: "none",
                      }}
                    >
                      —
                    </span>

                    <input
                      type="text"
                      value={photoEndHour}
                      onChange={(e) => setPhotoEndHour(e.target.value)}
                      disabled={!photoEnabled}
                      style={{
                        width: 40,
                        padding: 6,
                        textAlign: "center",
                        border: "1px solid #ccc",
                        borderRadius: 4,
                        fontSize: 12,
                        background: !photoEnabled ? "#eee" : "white",
                      }}
                    />
                    <span>:</span>
                    <input
                      type="text"
                      value={photoEndMinute}
                      onChange={(e) => setPhotoEndMinute(e.target.value)}
                      disabled={!photoEnabled}
                      style={{
                        width: 40,
                        padding: 6,
                        textAlign: "center",
                        border: "1px solid #ccc",
                        borderRadius: 4,
                        fontSize: 12,
                        background: !photoEnabled ? "#eee" : "white",
                      }}
                    />
                    <select
                      value={photoEndPeriod}
                      onChange={(e) => setPhotoEndPeriod(e.target.value)}
                      disabled={!photoEnabled}
                      style={{
                        padding: 6,
                        border: "1px solid #ccc",
                        borderRadius: 4,
                        fontSize: 12,
                        background: !photoEnabled ? "#eee" : "white",
                      }}
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Videographers */}
              <div
                style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 6,
                      fontSize: 14,
                      fontWeight: "bold",
                      color: "#555",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={videoEnabled}
                      onChange={(e) => {
                        const enabled = e.target.checked;
                        setVideoEnabled(enabled);
                        setUserRows((rows) =>
                          rows.map((r) => ({ ...r, video: enabled }))
                        );
                      }}
                    />
                    Videography
                  </label>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexWrap: "wrap",
                      gap: 3,
                      opacity: videoEnabled ? 1 : 0.5,
                    }}
                  >
                    <input
                      type="text"
                      value={videoStartHour}
                      onChange={(e) => setVideoStartHour(e.target.value)}
                      disabled={!videoEnabled}
                      style={{
                        width: 40,
                        padding: 6,
                        textAlign: "center",
                        border: "1px solid #ccc",
                        borderRadius: 4,
                        fontSize: 12,
                        background: !videoEnabled ? "#eee" : "white",
                      }}
                    />
                    <span>:</span>
                    <input
                      type="text"
                      value={videoStartMinute}
                      onChange={(e) => setVideoStartMinute(e.target.value)}
                      disabled={!videoEnabled}
                      style={{
                        width: 40,
                        padding: 6,
                        textAlign: "center",
                        border: "1px solid #ccc",
                        borderRadius: 4,
                        fontSize: 12,
                        background: !videoEnabled ? "#eee" : "white",
                      }}
                    />
                    <select
                      value={videoStartPeriod}
                      onChange={(e) => setVideoStartPeriod(e.target.value)}
                      disabled={!videoEnabled}
                      style={{
                        padding: 6,
                        border: "1px solid #ccc",
                        borderRadius: 4,
                        fontSize: 12,
                        background: !videoEnabled ? "#eee" : "white",
                      }}
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>

                    <span
                      aria-hidden
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 16,
                        lineHeight: "32px",
                        userSelect: "none",
                      }}
                    >
                      —
                    </span>

                    <input
                      type="text"
                      value={videoEndHour}
                      onChange={(e) => setVideoEndHour(e.target.value)}
                      disabled={!videoEnabled}
                      style={{
                        width: 40,
                        padding: 6,
                        textAlign: "center",
                        border: "1px solid #ccc",
                        borderRadius: 4,
                        fontSize: 12,
                        background: !videoEnabled ? "#eee" : "white",
                      }}
                    />
                    <span>:</span>
                    <input
                      type="text"
                      value={videoEndMinute}
                      onChange={(e) => setVideoEndMinute(e.target.value)}
                      disabled={!videoEnabled}
                      style={{
                        width: 40,
                        padding: 6,
                        textAlign: "center",
                        border: "1px solid #ccc",
                        borderRadius: 4,
                        fontSize: 12,
                        background: !videoEnabled ? "#eee" : "white",
                      }}
                    />
                    <select
                      value={videoEndPeriod}
                      onChange={(e) => setVideoEndPeriod(e.target.value)}
                      disabled={!videoEnabled}
                      style={{
                        padding: 6,
                        border: "1px solid #ccc",
                        borderRadius: 4,
                        fontSize: 12,
                        background: !videoEnabled ? "#eee" : "white",
                      }}
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bride / Groom names */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "20px",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 4,
                      fontSize: 14,
                      fontWeight: "bold",
                      color: "#555",
                    }}
                  >
                    Bride:
                  </label>
                  <input
                    type="text"
                    value={bride}
                    onChange={(e) => setBride(e.target.value)}
                    placeholder="Bride's name"
                    style={{
                      width: 140,
                      padding: 6,
                      border: "1px solid #ccc",
                      borderRadius: 4,
                      fontSize: 12,
                      textAlign: "center",
                    }}
                  />
                </div>

                <div style={{ textAlign: "center" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 4,
                      fontSize: 14,
                      fontWeight: "bold",
                      color: "#555",
                    }}
                  >
                    Groom:
                  </label>
                  <input
                    type="text"
                    value={groom}
                    onChange={(e) => setGroom(e.target.value)}
                    placeholder="Groom's name"
                    style={{
                      width: 140,
                      padding: 6,
                      border: "1px solid #ccc",
                      borderRadius: 4,
                      fontSize: 12,
                      textAlign: "center",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div
            style={{
              backgroundColor: "white",
              padding: 15,
              borderRadius: 8,
              border: "1px solid #ddd",
            }}
          >
            <h2
              style={{
                textAlign: "center",
                margin: "0 0 15px 0",
                fontSize: 18,
                color: "#333",
              }}
            >
              Timeline Events
            </h2>

            {/* Controls */}
            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 15,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <button
                onClick={saveProject}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#2196F3",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: "bold",
                }}
              >
                Save Project
              </button>
              <label
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#FF9800",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: "bold",
                  display: "inline-block",
                }}
              >
                Load Project
                <input
                  type="file"
                  accept=".json"
                  onChange={loadProject}
                  style={{ display: "none" }}
                />
              </label>
              <button
                onClick={exportTimeline}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#FFD700",
                  color: "black",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: "bold",
                }}
              >
                Export Timeline
              </button>
            </div>

            <div style={{ width: "100%" }}>
              {rows.map((row, index) => (
                <TimelineRow
                  key={row.id}
                  row={row}
                  index={index}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onDelete={handleDelete}
                  onEventClick={handleEventClick}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  isFirst={index === 0}
                  isLast={index === rows.length - 1}
                  onEventBlur={handleEventBlur}
                  photoEnabledGlobal={photoEnabled}
                  videoEnabledGlobal={videoEnabled}
                  onTimeSet={(i, hh, mm, ap) => {
                    const r = rows[i];
                    const userRowIndex = userRows.findIndex(
                      (u) => u.id === r.id
                    );
                    if (userRowIndex === -1) return;
                    const newTime = parseTimeInput(String(hh), String(mm), ap);
                    const newUserRows = [...userRows];
                    newUserRows[userRowIndex].time = newTime;
                    const sortedRows = [...newUserRows].sort(
                      (a, b) => a.time - b.time
                    );
                    const sortedIndex = sortedRows.findIndex(
                      (rr) => rr.id === newUserRows[userRowIndex].id
                    );
                    const recalculated = recalculateTimes(
                      sortedRows,
                      sortedIndex
                    );
                    saveToHistory(recalculated);
                  }}
                  onDropEventBlock={handleDropEventBlockToRow}
                />
              ))}
            </div>

            {/* Add / Undo / Redo */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: 15,
                gap: 12,
              }}
            >
              <button
                onClick={undo}
                disabled={history.length === 0}
                style={{
                  padding: "8px 16px",
                  backgroundColor: history.length > 0 ? "#9C27B0" : "#ccc",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: history.length > 0 ? "pointer" : "not-allowed",
                  fontSize: 14,
                }}
              >
                Undo
              </button>
              <button
                onClick={addRow}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 16,
                  fontWeight: "bold",
                }}
              >
                + Add Event
              </button>
              <button
                onClick={redo}
                disabled={redoStack.length === 0}
                style={{
                  padding: "8px 16px",
                  backgroundColor: redoStack.length > 0 ? "#607D8B" : "#ccc",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: redoStack.length > 0 ? "pointer" : "not-allowed",
                  fontSize: 14,
                }}
              >
                Redo
              </button>
            </div>
          </div>

          {/* Event Selector Modal */}
          <EventBlockSelector
            isVisible={showEventSelector}
            onSelect={handleEventSelect}
            onClose={() => {
              setShowEventSelector(false);
              setSelectedRowIndex(null);
            }}
            currentEvent={
              selectedRowIndex !== null ? rows[selectedRowIndex]?.event : ""
            }
          />
        </div>

        {/* SIDEBAR (desktop only) */}
        <EventSidebar />
      </div>
    </div>
  );
}
