import React, { useState, useEffect, useRef } from "react";
import { useDroppable, useDndContext } from "@dnd-kit/core";
import { getEventColor } from "../../constants/colors";
import { formatTime } from "../../lib/time";
import { TimePopover } from "./TimePopover";

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
  dragHandleRef,
  dragHandleListeners,
  dragHandleAttributes,
  isDragging = false,
  overlapWith,
  isMobile = false,
}) {
  const t = formatTime(row.time);
  const timeBtnRef = useRef(null);
  const cardRef = useRef(null);
  const [timeOpen, setTimeOpen] = useState(false);
  const { active } = useDndContext();
  const isSidebarDrag = active?.data?.current?.type === "sidebar-block";
  const { setNodeRef: setDropRef, isOver: isDropOver } = useDroppable({
    id: `row-${row.id}`,
    data: { type: "row", rowId: row.id },
  });
  const dropping = isSidebarDrag && isDropOver;
  const [showOverlapTip, setShowOverlapTip] = useState(false);
  const [deleteHovered, setDeleteHovered] = useState(false);
  const [deletePending, setDeletePending] = useState(false);
  const deleteTimerRef = useRef(null);
  useEffect(() => () => clearTimeout(deleteTimerRef.current), []);

  const isLocation = row.type === "location";
  const isConstraint = row.type === "constraint";
  // Location blocks are always gray; constraint blocks are transparent with stripe; event blocks use custom or category color
  const rowBg = isConstraint ? "transparent" : isLocation ? "#b8906a" : getEventColor(row.event || "", "#ffffff");

  return (
    <div
      ref={(node) => {
        cardRef.current = node;
        setDropRef(node);
      }}
      className={`wtb-row-card${dropping ? " wtb-dropping" : ""}${deletePending ? " wtb-deleting" : ""}${isDragging ? " wtb-row-dragging" : ""}`}
      style={{
        border: deletePending ? "2px solid #cc4444" : dropping ? "2px dashed #b8906a" : isConstraint ? "2px solid #cc4444" : isLocation ? "2px solid #b8906a" : `2px solid ${rowBg}`,
        borderRadius: 8,
        marginBottom: 12,
        backgroundColor: isLocation ? "#f5f0e8" : isConstraint ? "transparent" : (dropping ? "rgba(184,144,106,0.08)" : "#0f0d0b"),
        backgroundImage: isConstraint ? "repeating-linear-gradient(45deg, #1a0505 0px, #1a0505 10px, #230808 10px, #230808 20px)" : "none",
        overflow: "hidden",
        width: "100%",
        position: "relative",
        minHeight: "60px",
        display: "flex",
      }}
      title={dropping ? "Drop here to add event" : ""}
    >
      {/* Drag handle (desktop) / reorder buttons (mobile) */}
      <div
        ref={dragHandleRef}
        className="wtb-drag-handle"
        {...(dragHandleListeners || {})}
        {...(dragHandleAttributes || {})}
        style={{
          width: 36,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: dragHandleListeners ? "grab" : "default",
          touchAction: dragHandleListeners ? "none" : undefined,
          borderRight: isLocation ? "1px solid #c8bfb0" : "1px solid #2a2520",
          background: isLocation ? "#c4b8a0" : "#1e1a16",
          color: isLocation ? "#6e5c3e" : "#7a6a58",
          fontSize: 22,
          userSelect: "none",
          lineHeight: 1,
        }}
        title="Drag to reorder"
      >
        ⠿
      </div>
      <div className="wtb-row-reorder" aria-label="Reorder row">
        <button
          type="button"
          disabled={isFirst}
          onClick={() => onMoveUp?.(index)}
          title="Move up"
          aria-label="Move up"
        >
          ↑
        </button>
        <button
          type="button"
          disabled={isLast}
          onClick={() => onMoveDown?.(index)}
          title="Move down"
          aria-label="Move down"
        >
          ↓
        </button>
      </div>

      {/* Card content wrapper */}
      <div style={{ flex: 1, minWidth: 0, overflow: "hidden", position: "relative" }}>

      {/* Overlap warning badge — centered at top of card */}
      {overlapWith && (
        <div
          style={{ position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)", zIndex: 20 }}
          onMouseEnter={() => setShowOverlapTip(true)}
          onMouseLeave={() => setShowOverlapTip(false)}
        >
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "#cc2222", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: "bold", cursor: "default",
            boxShadow: "0 2px 6px rgba(0,0,0,0.45)",
            userSelect: "none", lineHeight: 1,
          }}>!</div>
          {showOverlapTip && (
            <div style={{
              position: "absolute", top: 40, left: "50%", transform: "translateX(-50%)",
              background: "#1c1816", color: "#f0ece6",
              fontSize: 11, padding: "5px 9px", borderRadius: 4,
              width: 210, lineHeight: 1.5,
              boxShadow: "0 2px 8px rgba(0,0,0,0.55)",
              border: "1px solid #cc4444",
              pointerEvents: "none", whiteSpace: "normal",
            }}>
              Overlaps with &ldquo;{overlapWith}&rdquo;. Overlapping events are allowed but may indicate a scheduling conflict.
            </div>
          )}
        </div>
      )}
      {/* TOP row: Time | Event (+photo/video) */}
      <div
        className="wtb-row-top"
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          padding: 6,
          backgroundColor: isConstraint ? "rgba(180,0,0,0.12)" : isLocation ? "#ede7da" : "#0f0d0b",
          borderBottom: isLocation ? "1px solid #c8bfb0" : "1px solid #1e1c19",
          gap: 9,
          alignItems: "center",
        }}
      >
        <div className="wtb-row-time-col">
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
            <label
              style={{
                fontSize: 10,
                color: isLocation ? "#7a6548" : "#6e6358",
                fontFamily: "'Jost', sans-serif",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Time
            </label>
          </div>
          <button
            ref={timeBtnRef}
            onClick={() => setTimeOpen(true)}
            style={{
              width: 88,
              padding: "4px 6px",
              textAlign: "center",
              border: isLocation ? "1px solid #c8bfb0" : "1px solid #2a2520",
              background: "transparent",
              color: isLocation ? "#1e140a" : "#ddd0bc",
              borderRadius: 4,
              cursor: "pointer",
              fontFamily: "'Cormorant Garamond', serif",
              lineHeight: 1,
            }}
            title="Click to set time"
          >
            <span style={{ fontSize: 26, fontWeight: 300, display: "block" }}>{t.hour}:{t.minute}</span>
            <span style={{ fontSize: 11, letterSpacing: "0.1em", opacity: 0.75 }}>{t.period}</span>
          </button>
        </div>

        <div>
          {isConstraint ? (
            <div style={{ fontSize: 14, fontWeight: "bold", color: "#ff6b6b", padding: "8px 0" }}>
              ⚠️ TIME CONSTRAINT
            </div>
          ) : isLocation ? (
            <>
              <label style={{ fontSize: 10, color: "#7a6548", display: "block", marginBottom: 4, fontFamily: "'Jost', sans-serif", letterSpacing: "0.12em", textTransform: "uppercase" }}>📍 Location Name</label>
              <input
                type="text"
                placeholder="Location name..."
                value={row.event || ""}
                onChange={(e) => onChange(index, "event", e.target.value)}
                onBlur={() => onBlur(index)}
                style={{
                  width: "100%",
                  fontSize: 14,
                  padding: 8,
                  background: "transparent",
                  border: "1px solid #c8bfb0",
                  color: "#1e140a",
                  borderRadius: 4,
                  fontFamily: "'Jost', sans-serif",
                }}
              />
            </>
          ) : (
            <>
              <div
                className="wtb-event-meta"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 4,
                }}
              >
                <label style={{ fontSize: 10, color: "#6e6358", fontFamily: "'Jost', sans-serif", letterSpacing: "0.12em", textTransform: "uppercase" }}>Event</label>
                <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                  <label
                    style={{
                      fontSize: 12,
                      display: "flex",
                      gap: 5,
                      alignItems: "center",
                      color: photoEnabledGlobal ? "#ddd0bc" : "#6e6358",
                      opacity: photoEnabledGlobal ? 1 : 0.5,
                      cursor: photoEnabledGlobal ? "pointer" : "default",
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
                      gap: 5,
                      alignItems: "center",
                      color: videoEnabledGlobal ? "#ddd0bc" : "#6e6358",
                      opacity: videoEnabledGlobal ? 1 : 0.5,
                      cursor: videoEnabledGlobal ? "pointer" : "default",
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
                  <button
                    type="button"
                    className="wtb-setting-btn--meta"
                    onClick={() => { onChange(index, "isOutdoor", !row.isOutdoor); onBlur(index); }}
                    aria-pressed={row.isOutdoor}
                    title={row.isOutdoor ? "Outside — click for Indoors" : "Indoors — click for Outside"}
                    style={{
                      background: row.isOutdoor ? "#2a6fd4" : "#c96a20",
                      color: "#f0ece6",
                    }}
                  >
                    <span aria-hidden style={{ fontSize: 13, lineHeight: 1 }}>{row.isOutdoor ? "☀️" : "💡"}</span>
                    <span>{row.isOutdoor ? "Outside" : "Indoors"}</span>
                  </button>
                </div>
              </div>
              <div className="wtb-event-input-row" style={{ display: "flex", gap: 6, alignItems: "stretch" }}>
                <input
                  type="text"
                  placeholder={isMobile ? "Tap to select an event…" : "Click to select or drop an event..."}
                  value={row.event}
                  onChange={(e) => onChange(index, "event", e.target.value)}
                  onBlur={() => {
                    onBlur(index);
                    onEventBlur && onEventBlur(index);
                  }}
                  onClick={() => onEventClick(index)}
                  style={{
                    flex: 1,
                    fontSize: 14,
                    padding: 8,
                    background: "transparent",
                    border: "1px solid #2a2520",
                    color: rowBg && rowBg !== "#ffffff" ? rowBg : "#ddd0bc",
                    borderRadius: 4,
                    cursor: "pointer",
                    fontFamily: "'Jost', sans-serif",
                  }}
                />
                <button
                  type="button"
                  className="wtb-setting-btn--inline"
                  onClick={() => { onChange(index, "isOutdoor", !row.isOutdoor); onBlur(index); }}
                  aria-pressed={row.isOutdoor}
                  title={row.isOutdoor ? "Outside — click for Indoors" : "Indoors — click for Outside"}
                  style={{
                    width: 80,
                    border: "1px solid #2a2520",
                    background: row.isOutdoor ? "#2a6fd4" : "#c96a20",
                    color: "#f0ece6",
                    alignSelf: "stretch",
                  }}
                >
                  <span aria-hidden style={{ fontSize: 13, lineHeight: 1 }}>{row.isOutdoor ? "☀️" : "💡"}</span>
                  <span>{row.isOutdoor ? "Outside" : "Indoors"}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

        <button
          onClick={() => {
            if (!deletePending) {
              setDeletePending(true);
              if (cardRef.current) {
                cardRef.current.style.animation = "none";
                void cardRef.current.offsetHeight;
                cardRef.current.style.animation = "wtb-delete 2s ease-in forwards";
              }
              deleteTimerRef.current = setTimeout(() => onDelete(index), 2000);
            }
          }}
          onMouseEnter={() => setDeleteHovered(true)}
          onMouseLeave={() => setDeleteHovered(false)}
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            width: 22,
            height: 22,
            padding: 0,
            fontSize: 18,
            border: deleteHovered ? "1px solid #e05252" : "1px solid transparent",
            background: "none",
            color: "#e05252",
            cursor: deletePending ? "default" : "pointer",
            borderRadius: 4,
            lineHeight: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "color 0.15s",
            zIndex: 1,
          }}
          title="Delete"
        >
          ×
        </button>

      {isConstraint ? (
        /* BOTTOM: Constraint block — notes only */
        <div style={{ padding: 8, backgroundColor: "rgba(180,0,0,0.08)" }}>
          <label style={{ fontSize: 10, color: "#ff6b6b", display: "block", marginBottom: 4, fontFamily: "'Jost', sans-serif", letterSpacing: "0.12em", textTransform: "uppercase" }}>Conflict Notes</label>
          <textarea
            value={row.notes || ""}
            onChange={(e) => onChange(index, "notes", e.target.value)}
            onBlur={() => onBlur(index)}
            rows={3}
            style={{ width: "100%", boxSizing: "border-box", fontSize: 13, padding: 8, resize: "vertical", background: "transparent", border: "1px solid #cc4444", borderRadius: 4, color: "#ff6b6b" }}
          />
        </div>
      ) : isLocation ? (
        /* BOTTOM: Location block — Travel time | Address | Notes */
        <div
          className="wtb-location-grid"
          style={{
            padding: "8px 8px 8px 6px",
            background: "#f5f0e8",
          }}
        >
          <div className="wtb-location-travel">
            <label style={{ fontSize: 10, color: "#7a6548", display: "block", marginBottom: 4, fontFamily: "'Jost', sans-serif", letterSpacing: "0.12em", textTransform: "uppercase", width: "100%", textAlign: "center" }}>Travel time</label>
            <div style={{ position: "relative", width: 65 }}>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={row.duration}
                onChange={(e) => { const val = e.target.value.replace(/[^0-9]/g, ""); onChange(index, "duration", val); }}
                onBlur={() => onBlur(index)}
                style={{ width: "100%", fontSize: 14, padding: "6px 34px 6px 12px", textAlign: "left", border: "1px solid #c8bfb0", borderRadius: 6, boxSizing: "border-box", background: "rgba(255,255,255,0.5)", color: "#1e140a" }}
              />
              <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#7a6548", pointerEvents: "none" }}>min</span>
            </div>
          </div>

          <div className="wtb-location-field">
            <label style={{ fontSize: 10, color: "#7a6548", display: "block", marginBottom: 4, fontFamily: "'Jost', sans-serif", letterSpacing: "0.12em", textTransform: "uppercase" }}>Address</label>
            <textarea
              placeholder="Address..."
              value={row.address || ""}
              onChange={(e) => onChange(index, "address", e.target.value)}
              onBlur={(e) => { onBlur(index); e.target.scrollTop = 0; }}
              rows={3}
              style={{ fontSize: 14, padding: 8, resize: "vertical", background: "rgba(255,255,255,0.5)", border: "1px solid #c8bfb0", borderRadius: 4, color: "#1e140a" }}
            />
          </div>

          <div className="wtb-location-field">
            <label style={{ fontSize: 10, color: "#7a6548", display: "block", marginBottom: 4, fontFamily: "'Jost', sans-serif", letterSpacing: "0.12em", textTransform: "uppercase" }}>Notes</label>
            <textarea
              placeholder="Add any notes for this location..."
              value={row.notes || ""}
              onChange={(e) => onChange(index, "notes", e.target.value)}
              onBlur={() => onBlur(index)}
              rows={3}
              style={{ fontSize: 13, padding: 8, resize: "vertical", background: "rgba(255,255,255,0.5)", border: "1px solid #c8bfb0", borderRadius: 4, color: "#1e140a" }}
            />
          </div>
        </div>
      ) : (
        /* BOTTOM: Event block — Duration | Notes */
        <div
          className="wtb-bottom"
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            padding: "8px 8px 8px 6px",
            gap: 9,
            alignItems: "start",
          }}
        >
          <div style={{ width: 88, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <label
              style={{
                fontSize: 10,
                color: "#6e6358",
                display: "block",
                marginBottom: 4,
                fontFamily: "'Jost', sans-serif",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
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
                  border: "1px solid #2a2520",
                  borderRadius: 4,
                  boxSizing: "border-box",
                  background: "transparent",
                  color: "#ddd0bc",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 12,
                  color: "#6e6358",
                  pointerEvents: "none",
                }}
              >
                mins
              </span>
            </div>
          </div>

          <div className="wtb-location">
            <label
              style={{
                fontSize: 10,
                color: "#6e6358",
                display: "block",
                marginBottom: 4,
                fontFamily: "'Jost', sans-serif",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Notes
            </label>
            <div style={{ display: "flex", gap: 6 }}>
              <textarea
                placeholder="Add any notes for this event... (drag corner to expand)"
                value={row.notes || ""}
                onChange={(e) => onChange(index, "notes", e.target.value)}
                onBlur={() => onBlur(index)}
                rows={2}
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontSize: 14,
                  padding: 8,
                  resize: "vertical",
                  background: "transparent",
                  border: "1px solid #2a2520",
                  borderRadius: 4,
                  color: "#ddd0bc",
                  fontFamily: "'Jost', sans-serif",
                }}
              />
              <div className="wtb-notes-spacer" style={{ width: 80, flexShrink: 0 }} />
            </div>
          </div>
        </div>
      )}

      {/* Time popover */}
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
      </div>{/* end content wrapper */}
    </div>
  );
}

export { TimelineRow };
