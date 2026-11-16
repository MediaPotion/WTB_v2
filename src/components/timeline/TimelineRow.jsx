import React, { useState } from "react";
import { useDroppable, useDndContext } from "@dnd-kit/core";
import { getEventColor } from "../../constants/colors";
import { formatTime, formatDurationSpan } from "../../lib/time";
import { formatWhen } from "../../lib/sharing";
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
  notice = null,
  onTogglePin,
  onToggleWithPrevious,
  isMobile = false,
  readOnly = false,
  commentsEnabled = false,
  comments = [],
  onAddComment,
  myName = "",
  onSetName,
}) {
  const t = formatTime(row.time);
  const [timeOpen, setTimeOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
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
  const pinned = !!row.isTimeLocked;
  const withPrevious = !!row.withPrevious && !isFirst && !pinned;
  const displayName = String(row.event || "").trim() || "this event";
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
      className={`wtb-row-card${dropping ? " wtb-dropping" : ""}${isDragging ? " wtb-row-dragging" : ""}${expanded ? " wtb-row-card--open" : ""}${isLocation ? " wtb-row-card--location" : ""}${isConstraint ? " wtb-row-card--constraint" : ""}${withPrevious ? " wtb-row-card--parallel" : ""}`}
      style={{ "--wtb-row-color": rowColor }}
      title={dropping ? (isEmpty ? "Drop to fill this event" : "Drop to add below this event") : ""}
    >
      {/* How this pinned row meets the rows above it */}
      {notice && (
        <div className={`wtb-row-notice wtb-row-notice--${notice.kind}`} role={notice.kind === "overrun" ? "alert" : undefined}>
          {notice.kind === "overrun"
            ? `⚠ Runs ${formatDurationSpan(notice.minutes)} into ${displayName}`
            : `${formatDurationSpan(notice.minutes)} free before ${displayName}`}
        </div>
      )}

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
          disabled={readOnly}
          title={readOnly ? undefined : "Set the start time"}
        >
          {t.hour}:{t.minute}
          <span className="wtb-row-time-period">{t.period}</span>
        </button>

        {!isConstraint && (
          <button
            type="button"
            className={`wtb-row-pin${pinned ? " wtb-row-pin--on" : ""}`}
            onClick={() => onTogglePin?.(index)}
            disabled={readOnly}
            aria-pressed={pinned}
            aria-label={pinned ? "Pinned to this time" : "Follows the event above"}
            title={
              pinned
                ? "Pinned to this time — click to let it follow the event above"
                : "Follows the event above — click to pin it to this time"
            }
          >
            {pinned ? "🔒" : "🔓"}
          </button>
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
              readOnly={readOnly}
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
            {withPrevious && mark(true, "At the same time as the event above", "⇉")}
            {hasNotes && mark(true, "Has notes", "📝")}
            {comments.length > 0 && (
              <span className="wtb-mark wtb-mark--comments" title={`${comments.length} comment${comments.length === 1 ? "" : "s"}`}>
                💬{comments.length}
              </span>
            )}
          </span>
        )}

        <label className="wtb-row-duration" title={isLocation ? "Travel time in minutes" : "Duration in minutes"}>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            aria-label={isLocation ? "Travel time in minutes" : "Duration in minutes"}
            value={row.duration}
            readOnly={readOnly}
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

        {!readOnly && (
        <button
          type="button"
          className="wtb-row-delete"
          onClick={() => onDelete(index)}
          title="Delete this event"
          aria-label="Delete this event"
        >
          ×
        </button>
        )}
      </div>

      {/* Expanded: notes and options */}
      {expanded && (
        <div className="wtb-row-panel" id={panelId}>
          {!readOnly && !isConstraint && !isFirst && (
            <label className="wtb-row-check" title="For two things covered at once, e.g. bride and groom portraits by two shooters">
              <input
                type="checkbox"
                checked={withPrevious}
                onChange={() => onToggleWithPrevious?.(index)}
              />
              Same time as the event above
            </label>
          )}

          {!readOnly && !isConstraint && (
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
                    onClick={() => onTogglePin?.(index)}
                    aria-pressed={pinned}
                  >
                    {pinned ? "🔓 Unpin time" : "🔒 Pin time"}
                  </button>
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
                readOnly={readOnly}
                value={row.address || ""}
                onChange={(e) => onChange(index, "address", e.target.value)}
                onBlur={() => onBlur(index)}
                rows={2}
              />
            </label>
          )}

          {(!readOnly || hasNotes) && (
          <label className="wtb-row-field">
            <span>{isConstraint ? "Conflict notes" : "Notes"}</span>
            <textarea
              readOnly={readOnly}
              placeholder={isLocation ? "Add any notes for this location..." : "Add any notes for this event..."}
              value={row.notes || ""}
              onChange={(e) => onChange(index, "notes", e.target.value)}
              onBlur={() => onBlur(index)}
              rows={2}
            />
          </label>
          )}

          {commentsEnabled && (
            <RowComments comments={comments} onAdd={onAddComment} myName={myName} onSetName={onSetName} />
          )}

          {!readOnly && isConstraint && (
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

/** Comments on one event (Phase 4): anyone with either link can add one. */
function RowComments({ comments, onAdd, myName, onSetName }) {
  const [text, setText] = useState("");
  const [name, setName] = useState(myName);
  const [state, setState] = useState(null); // null | "sending" | error message

  const submit = async (e) => {
    e.preventDefault();
    const body = text.trim();
    const who = (myName || name).trim();
    if (!body || !who) return;
    if (!myName) onSetName?.(who);
    setState("sending");
    try {
      await onAdd(body);
      setText("");
      setState(null);
    } catch (err) {
      setState(err.message || "Couldn't add the comment");
    }
  };

  return (
    <div className="wtb-row-comments">
      <span className="wtb-row-comments-title">Comments</span>
      {comments.map((c) => (
        <div key={c.id} className="wtb-row-comment">
          <span className="wtb-row-comment-meta">
            {c.author} · {formatWhen(c.createdAt)}
          </span>
          <span className="wtb-row-comment-body">{c.body}</span>
        </div>
      ))}
      <form className="wtb-row-comment-form" onSubmit={submit}>
        {!myName && (
          <input
            aria-label="Your name"
            placeholder="Your name"
            value={name}
            maxLength={80}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        <textarea
          aria-label="Add a comment"
          placeholder="Add a comment for everyone on this timeline…"
          value={text}
          maxLength={2000}
          rows={2}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" disabled={!text.trim() || !(myName || name).trim() || state === "sending"}>
          {state === "sending" ? "Adding…" : "Add comment"}
        </button>
        {state && state !== "sending" && <span className="wtb-row-comment-error">{state}</span>}
      </form>
    </div>
  );
}

export { TimelineRow };
