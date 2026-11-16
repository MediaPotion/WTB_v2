import React, { useState } from "react";
import { useDroppable, useDndContext } from "@dnd-kit/core";
import { getEventColor } from "../../constants/colors";
import { formatTime } from "../../lib/time";
import { TimePopover } from "./TimePopover";

// Clicks on these never toggle the row open/closed.
const INTERACTIVE = "input, textarea, button, select, label, a, [role='button']";

/**
 * One timeline event. Collapsed it is a single line — time, name, duration and
 * small photo / video / indoors marks. Tap the row (or the arrow) to expand it
 * for notes and options.
 */
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
  onTimeSet,
  photoEnabledGlobal,
  videoEnabledGlobal,
  dragHandleRef,
  dragHandleListeners,
  dragHandleAttributes,
  isDragging = false,
  overlapWith,
  onDismissOverlap,
  isMobile = false,
}) {
  const t = formatTime(row.time);
  const [timeOpen, setTimeOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showOverlapTip, setShowOverlapTip] = useState(false);
  const { active } = useDndContext();
  const isSidebarDrag = active?.data?.current?.type === "sidebar-block";
  const { setNodeRef: setDropRef, isOver: isDropOver } = useDroppable({
    id: `row-${row.id}`,
    data: { type: "row", rowId: row.id },
  });
  const dropping = isSidebarDrag && isDropOver;

  const isLocation = row.type === "location";
  const isConstraint = row.type === "constraint";
  const isEmpty = !isLocation && !isConstraint && !String(row.event || "").trim();
  const rowColor = isConstraint
    ? "#cc4444"
    : isLocation
      ? "var(--wtb-accent)"
      : getEventColor(row.event || "", "#ffffff");
  const hasNotes = !!String(row.notes || "").trim();
  const panelId = `wtb-row-panel-${row.id}`;

  const toggleFromRowClick = (e) => {
    if (e.target.closest(INTERACTIVE)) return;
    setExpanded((v) => !v);
  };

  const setDuration = (raw) => onChange(index, "duration", raw.replace(/[^0-9]/g, ""));

  const mark = (on, label, glyph) => (
    <span
      className={`wtb-mark${on ? "" : " wtb-mark--off"}`}
      title={`${label}: ${on ? "yes" : "no"}`}
      aria-label={`${label}: ${on ? "yes" : "no"}`}
      role="img"
    >
      {glyph}
    </span>
  );

  return (
    <div
      ref={setDropRef}
      className={`wtb-row-card${dropping ? " wtb-dropping" : ""}${isDragging ? " wtb-row-dragging" : ""}${expanded ? " wtb-row-card--open" : ""}${isLocation ? " wtb-row-card--location" : ""}${isConstraint ? " wtb-row-card--constraint" : ""}`}
      style={{ "--wtb-row-color": rowColor }}
      title={dropping ? (isEmpty ? "Drop to fill this event" : "Drop to add below this event") : ""}
    >
      {/* Collapsed line */}
      <div className="wtb-row-line" onClick={toggleFromRowClick}>
        <div
          ref={dragHandleRef}
          className="wtb-drag-handle"
          {...(dragHandleListeners || {})}
          {...(dragHandleAttributes || {})}
          style={{ cursor: dragHandleListeners ? "grab" : "default", touchAction: dragHandleListeners ? "none" : undefined }}
          title="Drag to reorder"
        >
          ⠿
        </div>

        <button
          type="button"
          className="wtb-row-time"
          onClick={() => setTimeOpen(true)}
          title="Set the start time"
        >
          {t.hour}:{t.minute}
          <span className="wtb-row-time-period">{t.period}</span>
        </button>

        {overlapWith && (
          <span className="wtb-overlap-wrap">
            <span
              role="button"
              tabIndex={0}
              className="wtb-overlap-badge"
              onClick={() => setShowOverlapTip((v) => !v)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setShowOverlapTip((v) => !v);
                }
              }}
              title="Overlap warning — click for details"
            >
              !
            </span>
            {showOverlapTip && (
              <span className="wtb-overlap-tip">
                Overlaps with &ldquo;{overlapWith}&rdquo;. Overlapping events are allowed but may indicate a scheduling conflict.
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowOverlapTip(false);
                    onDismissOverlap?.();
                  }}
                >
                  Dismiss
                </button>
              </span>
            )}
          </span>
        )}

        {isConstraint ? (
          <span className="wtb-row-name wtb-row-name--static">⚠️ Time constraint</span>
        ) : (
          // The wrapper sizes the field to its text, so the rest of the line
          // stays free to tap (which expands the row).
          <span
            className="wtb-row-name-wrap"
            data-value={`${row.event || (isLocation ? "📍 Location name" : "Event name")} `}
          >
            <input
              type="text"
              className="wtb-row-name"
              aria-label={isLocation ? "Location name" : "Event name"}
              placeholder={isLocation ? "📍 Location name" : "Event name"}
              value={row.event || ""}
              onChange={(e) => onChange(index, "event", e.target.value)}
              onBlur={() => onBlur(index)}
            />
          </span>
        )}

        <span className="wtb-row-spacer" aria-hidden />

        {!isConstraint && (
          <span className="wtb-row-marks" aria-label="Coverage">
            {isLocation ? (
              mark(true, "Travel", "🚗")
            ) : (
              <>
                {photoEnabledGlobal && mark(!!row.photo, "Photo", "📷")}
                {videoEnabledGlobal && mark(!!row.video, "Video", "🎥")}
                {mark(true, row.isOutdoor ? "Outside" : "Indoors", row.isOutdoor ? "☀️" : "💡")}
              </>
            )}
            {hasNotes && mark(true, "Has notes", "📝")}
          </span>
        )}

        <label className="wtb-row-duration" title={isLocation ? "Travel time in minutes" : "Duration in minutes"}>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            aria-label={isLocation ? "Travel time in minutes" : "Duration in minutes"}
            value={row.duration}
            onChange={(e) => setDuration(e.target.value)}
            onBlur={() => onBlur(index)}
          />
          <span>min</span>
        </label>

        <button
          type="button"
          className="wtb-row-expand"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls={panelId}
          title={expanded ? "Hide notes and options" : "Show notes and options"}
        >
          {expanded ? "▴" : "▾"}
        </button>

        <button
          type="button"
          className="wtb-row-delete"
          onClick={() => onDelete(index)}
          title="Delete this event"
          aria-label="Delete this event"
        >
          ×
        </button>
      </div>

      {/* Expanded: notes and options */}
      {expanded && (
        <div className="wtb-row-panel" id={panelId}>
          {!isConstraint && (
            <div className="wtb-row-options">
              {!isLocation && (
                <>
                  <label className={`wtb-row-check${photoEnabledGlobal ? "" : " wtb-row-check--off"}`}>
                    <input
                      type="checkbox"
                      checked={!!row.photo}
                      onChange={(e) => { onChange(index, "photo", e.target.checked); onBlur(index); }}
                      disabled={!photoEnabledGlobal}
                    />
                    Photo
                  </label>
                  <label className={`wtb-row-check${videoEnabledGlobal ? "" : " wtb-row-check--off"}`}>
                    <input
                      type="checkbox"
                      checked={!!row.video}
                      onChange={(e) => { onChange(index, "video", e.target.checked); onBlur(index); }}
                      disabled={!videoEnabledGlobal}
                    />
                    Video
                  </label>
                  <button
                    type="button"
                    className="wtb-row-option-btn"
                    onClick={() => { onChange(index, "isOutdoor", !row.isOutdoor); onBlur(index); }}
                    aria-pressed={!!row.isOutdoor}
                    title={row.isOutdoor ? "Outside — click for Indoors" : "Indoors — click for Outside"}
                    style={{ background: row.isOutdoor ? "#2a6fd4" : "#c96a20", color: "#f0ece6", borderColor: "transparent" }}
                  >
                    {row.isOutdoor ? "☀️ Outside" : "💡 Indoors"}
                  </button>
                  <button
                    type="button"
                    className="wtb-row-option-btn"
                    onClick={() => onEventClick(index)}
                    title="Pick a different event from the list"
                  >
                    Change event…
                  </button>
                </>
              )}
              {isMobile && (
                <>
                  <button
                    type="button"
                    className="wtb-row-option-btn"
                    disabled={isFirst}
                    onClick={() => onMoveUp?.(index)}
                    aria-label="Move up"
                  >
                    ↑ Up
                  </button>
                  <button
                    type="button"
                    className="wtb-row-option-btn"
                    disabled={isLast}
                    onClick={() => onMoveDown?.(index)}
                    aria-label="Move down"
                  >
                    ↓ Down
                  </button>
                </>
              )}
              <button
                type="button"
                className="wtb-row-option-btn wtb-row-option-btn--danger"
                onClick={() => onDelete(index)}
              >
                Delete
              </button>
            </div>
          )}

          {isLocation && (
            <label className="wtb-row-field">
              <span>Address</span>
              <textarea
                placeholder="Address..."
                value={row.address || ""}
                onChange={(e) => onChange(index, "address", e.target.value)}
                onBlur={() => onBlur(index)}
                rows={2}
              />
            </label>
          )}

          <label className="wtb-row-field">
            <span>{isConstraint ? "Conflict notes" : "Notes"}</span>
            <textarea
              placeholder={isLocation ? "Add any notes for this location..." : "Add any notes for this event..."}
              value={row.notes || ""}
              onChange={(e) => onChange(index, "notes", e.target.value)}
              onBlur={() => onBlur(index)}
              rows={2}
            />
          </label>

          {isConstraint && (
            <div className="wtb-row-options">
              <button
                type="button"
                className="wtb-row-option-btn wtb-row-option-btn--danger"
                onClick={() => onDelete(index)}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      )}

      {timeOpen && (
        <TimePopover
          open={timeOpen}
          value={t}
          onSet={(h, m, p) => {
            onTimeSet(h, m, p);
            setTimeOpen(false);
          }}
          onClose={() => setTimeOpen(false)}
        />
      )}
    </div>
  );
}

export { TimelineRow };
