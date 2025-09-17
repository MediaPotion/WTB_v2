import React, { useState, useEffect, useMemo } from "react";

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

function EventBlockSelector({ isVisible, onSelect, onClose, currentEvent }) {
  const [customEvent, setCustomEvent] = useState(currentEvent || "");
  const [customDuration, setCustomDuration] = useState(30);

  useEffect(() => {
    if (isVisible) {
      setCustomEvent(currentEvent || "");
    }
  }, [isVisible, currentEvent]);

  const eventBlocks = [
    "Details: Drone & Venue Shots::20",
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
    "Bride (Dress On): First Look with Parent::10",
    "Bride (Dress On): First Look with Bridemaids::10",
    "Bride (Dress On): First Look with Groom::10",
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
    "Group Photos: Wedding Party Shots::15",
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

  const colors = {
    Details: "#FFE5B4",
    "Bride (Pre-Dress)": "#FFB6C1",
    "Bride (Dress On)": "#FF69B4",
    "Bride & Groom:": "#DA70D6",
    "Narration:": "#FFA07A",
    "Groom:": "#98FB98",
    "Ceremony:": "#F0E68C",
    "Reception:": "#87CEEB",
    "Group Photos:": "#DDA0DD",
    Other: "#FF8C00",
  };

  const getEventColor = (eventText) => {
    const key = Object.keys(colors).find((k) => eventText.startsWith(k));
    return colors[key] || colors.Other;
  };

  const handleCustomEventSubmit = () => {
    if (customEvent.trim()) {
      onSelect({ event: customEvent.trim(), duration: customDuration });
    }
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "20px",
          maxHeight: "80vh",
          overflowY: "auto",
          width: "100%",
          maxWidth: "500px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ margin: 0 }}>Select or Create Event</h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#666",
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            marginBottom: "20px",
            padding: "15px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            border: "2px solid #e9ecef",
          }}
        >
          <h4 style={{ margin: "0 0 10px 0", color: "#333" }}>
            Create Custom Event
          </h4>
          <div style={{ marginBottom: "10px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontSize: "12px",
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
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontSize: "12px",
                color: "#666",
                fontWeight: "bold",
              }}
            >
              Duration (minutes):
            </label>
            <input
              type="number"
              value={customDuration}
              onChange={(e) =>
                setCustomDuration(parseInt(e.target.value) || 30)
              }
              min="5"
              step="5"
              style={{
                width: "80px",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
          </div>
          <button
            onClick={handleCustomEventSubmit}
            disabled={!customEvent.trim()}
            style={{
              padding: "10px 20px",
              backgroundColor: customEvent.trim() ? "#4CAF50" : "#ccc",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: customEvent.trim() ? "pointer" : "not-allowed",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            Use Custom Event
          </button>
        </div>

        <div
          style={{ marginBottom: "10px", fontWeight: "bold", color: "#666" }}
        >
          Or Select Preset Event:
        </div>

        {eventBlocks.map((block) => {
          const [label, duration] = block.split("::");
          return (
            <button
              key={block}
              onClick={() =>
                onSelect({ event: label, duration: parseInt(duration, 10) })
              }
              style={{
                width: "100%",
                padding: "12px",
                margin: "4px 0",
                backgroundColor: getEventColor(label),
                border: "2px solid #999",
                borderRadius: "8px",
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              <span>{label}</span>
              <span
                style={{ fontSize: "12px", color: "#555", fontWeight: "bold" }}
              >
                {duration} min
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

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
  onChainToPrevious,
}) {
  const colors = {
    Details: "#FFE5B4",
    "Bride (Pre-Dress)": "#FFB6C1",
    "Bride (Dress On)": "#FF69B4",
    "Bride & Groom:": "#DA70D6",
    "Narration:": "#FFA07A",
    "Groom:": "#98FB98",
    "Ceremony:": "#F0E68C",
    "Reception:": "#87CEEB",
    "Group Photos:": "#DDA0DD",
    Other: "#FF8C00",
  };

  const getEventColor = (eventText) => {
    if (!eventText) return "#ffffff";
    const key = Object.keys(colors).find((k) => eventText.startsWith(k));
    return colors[key] || "#ffffff";
  };

  const t = formatTime(row.time);

  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "8px",
        marginBottom: "12px",
        backgroundColor: getEventColor(row.event),
        overflow: "hidden",
        width: "100%",
        position: "relative",
      }}
    >
      {/* Move Up/Down and Delete Buttons */}
      <div
        style={{
          position: "absolute",
          right: "8px",
          top: "8px",
          display: "flex",
          flexDirection: "row",
          gap: "4px",
          zIndex: 10,
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            alignItems: "center",
            minHeight: "52px", // ensures consistent height for arrow stack
            justifyContent: "center",
          }}
        >
          {!isFirst ? (
            <button
              onClick={() => onMoveUp(index)}
              style={{
                width: "28px",
                height: "24px",
                fontSize: "12px",
                border: "1px solid #333",
                background: "white",
                color: "#333",
                cursor: "pointer",
                borderRadius: "4px",
                fontWeight: "bold",
              }}
              title="Move Up"
            >
              ▲
            </button>
          ) : (
            <div style={{ height: "24px", visibility: "hidden" }} />
          )}

          {!isLast ? (
            <button
              onClick={() => onMoveDown(index)}
              style={{
                width: "28px",
                height: "24px",
                fontSize: "12px",
                border: "1px solid #333",
                background: "white",
                color: "#333",
                cursor: "pointer",
                borderRadius: "4px",
                fontWeight: "bold",
              }}
              title="Move Down"
            >
              ▼
            </button>
          ) : (
            <div style={{ height: "24px", visibility: "hidden" }} />
          )}
        </div>

        <button
          onClick={() => onDelete(index)}
          style={{
            width: "28px",
            height: "24px",
            fontSize: "14px",
            border: "1px solid #ff4444",
            background: "#ff4444",
            color: "white",
            cursor: "pointer",
            borderRadius: "4px",
            fontWeight: "bold",
          }}
          title="Delete"
        >
          ×
        </button>
      </div>

      {/* Top Row - Time and Location */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          padding: "6px",
          paddingRight: "80px",
          backgroundColor: getEventColor(row.event),
          borderBottom: "1px solid #ccc",
          gap: "12px",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {/* Chain-to-previous button */}
            <button
              onClick={() => onChainToPrevious && onChainToPrevious(index)}
              title="Chain to previous event"
              style={{
                width: "28px",
                height: "28px",
                border: "1px solid #ccc",
                background: "#fff",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#666"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
            </button>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <button
                onClick={() => {
                  const currentTime = formatTime(row.time);
                  let newHour = parseInt(currentTime.hour) + 1;
                  if (newHour > 12) newHour = 1;
                  onChange(index, "time", newHour.toString(), "hour");
                  onBlur(index);
                }}
                style={{
                  width: "24px",
                  height: "20px",
                  fontSize: "12px",
                  border: "1px solid #ccc",
                  background: "#f5f5f5",
                  cursor: "pointer",
                  borderRadius: "2px",
                }}
              >
                ▲
              </button>
              <input
                type="text"
                value={t.hour}
                onChange={(e) =>
                  onChange(index, "time", e.target.value, "hour")
                }
                onBlur={() => onBlur(index)}
                style={{
                  width: "30px",
                  fontSize: "14px",
                  textAlign: "center",
                  border: "1px solid #ccc",
                  margin: "2px 0",
                  borderRadius: "2px",
                }}
              />
              <button
                onClick={() => {
                  const currentTime = formatTime(row.time);
                  let newHour = parseInt(currentTime.hour) - 1;
                  if (newHour < 1) newHour = 12;
                  onChange(index, "time", newHour.toString(), "hour");
                  onBlur(index);
                }}
                style={{
                  width: "24px",
                  height: "20px",
                  fontSize: "12px",
                  border: "1px solid #ccc",
                  background: "#f5f5f5",
                  cursor: "pointer",
                  borderRadius: "2px",
                }}
              >
                ▼
              </button>
            </div>

            <span>:</span>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <button
                onClick={() => {
                  const currentTime = formatTime(row.time);
                  let newMinute = parseInt(currentTime.minute) + 5;
                  if (newMinute >= 60) newMinute = 0;
                  onChange(
                    index,
                    "time",
                    newMinute.toString().padStart(2, "0"),
                    "minute"
                  );
                  onBlur(index);
                }}
                style={{
                  width: "24px",
                  height: "20px",
                  fontSize: "12px",
                  border: "1px solid #ccc",
                  background: "#f5f5f5",
                  cursor: "pointer",
                  borderRadius: "2px",
                }}
              >
                ▲
              </button>
              <input
                type="text"
                value={t.minute}
                onChange={(e) =>
                  onChange(index, "time", e.target.value, "minute")
                }
                onBlur={() => onBlur(index)}
                style={{
                  width: "30px",
                  fontSize: "14px",
                  textAlign: "center",
                  border: "1px solid #ccc",
                  margin: "2px 0",
                  borderRadius: "2px",
                }}
              />
              <button
                onClick={() => {
                  const currentTime = formatTime(row.time);
                  let newMinute = parseInt(currentTime.minute) - 15;
                  if (newMinute < 0) newMinute = 45;
                  onChange(
                    index,
                    "time",
                    newMinute.toString().padStart(2, "0"),
                    "minute"
                  );
                  onBlur(index);
                }}
                style={{
                  width: "24px",
                  height: "20px",
                  fontSize: "12px",
                  border: "1px solid #ccc",
                  background: "#f5f5f5",
                  cursor: "pointer",
                  borderRadius: "2px",
                }}
              >
                ▼
              </button>
            </div>

            <button
              onClick={() => {
                const currentTime = formatTime(row.time);
                const newPeriod = currentTime.period === "AM" ? "PM" : "AM";
                onChange(index, "time", newPeriod, "period");
                onBlur(index);
              }}
              style={{
                padding: "8px",
                fontSize: "12px",
                border: "1px solid #ccc",
                background: "#f5f5f5",
                cursor: "pointer",
                borderRadius: "4px",
                minWidth: "35px",
              }}
            >
              {t.period}
            </button>
          </div>
        </div>

        <div>
          <textarea
            placeholder="Enter location..."
            value={row.location}
            onChange={(e) => onChange(index, "location", e.target.value)}
            onBlur={() => onBlur(index)}
            rows={2}
            style={{
              width: "60%",
              fontSize: "14px",
              padding: "8px",
              resize: "none",
              backgroundColor: "white",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>
      </div>

      {/* Bottom Row - Event and Duration */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          padding: "12px",
          gap: "12px",
          alignItems: "end",
        }}
      >
        <div>
          <label
            style={{
              fontSize: "12px",
              color: "#666",
              display: "block",
              marginBottom: "4px",
            }}
          >
            Event
          </label>
          <input
            type="text"
            placeholder="Click to select or enter custom event..."
            value={row.event}
            onChange={(e) => onChange(index, "event", e.target.value)}
            onBlur={() => onBlur(index)}
            onClick={() => onEventClick(index)}
            style={{
              width: "100%",
              fontSize: "14px",
              padding: "8px",
              backgroundColor: "white",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          />
        </div>

        <div>
          <label
            style={{
              fontSize: "12px",
              color: "#666",
              display: "block",
              marginBottom: "4px",
              textAlign: "center",
            }}
          >
            Minutes
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <input
              type="number"
              min="5"
              step="5"
              value={row.duration}
              onChange={(e) => onChange(index, "duration", e.target.value)}
              onBlur={() => onBlur(index)}
              style={{
                width: "50px",
                fontSize: "14px",
                padding: "4px",
                textAlign: "center",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [date, setDate] = useState("");
  const [bride, setBride] = useState("");
  const [groom, setGroom] = useState("");
  const [photoStartHour, setPhotoStartHour] = useState("9");
  const [photoStartMinute, setPhotoStartMinute] = useState("00");
  const [photoStartPeriod, setPhotoStartPeriod] = useState("AM");
  const [photoEndHour, setPhotoEndHour] = useState("5");
  const [photoEndMinute, setPhotoEndMinute] = useState("00");
  const [photoEndPeriod, setPhotoEndPeriod] = useState("PM");
  const [videoStartHour, setVideoStartHour] = useState("9");
  const [videoStartMinute, setVideoStartMinute] = useState("00");
  const [videoStartPeriod, setVideoStartPeriod] = useState("AM");
  const [videoEndHour, setVideoEndHour] = useState("5");
  const [videoEndMinute, setVideoEndMinute] = useState("00");
  const [videoEndPeriod, setVideoEndPeriod] = useState("PM");

  const [userRows, setUserRows] = useState([
    { id: 1, location: "", time: 9 * 60 + 30, event: "", duration: 30 },
  ]);
  const [nextId, setNextId] = useState(2);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const [showEventSelector, setShowEventSelector] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);

  const rows = useMemo(() => {
    return [...userRows].sort((a, b) => a.time - b.time);
  }, [userRows]);

  const recalculateTimes = (rows, startIndex = 0) => {
    const newRows = [...rows];
    for (let i = startIndex + 1; i < newRows.length; i++) {
      const prevRow = newRows[i - 1];
      newRows[i].time = prevRow.time + prevRow.duration;
    }
    return newRows;
  };

  const saveToHistory = (newUserRows) => {
    if (JSON.stringify(newUserRows) === JSON.stringify(userRows)) {
      return;
    }
    setHistory((prev) => [...prev.slice(-11), userRows]);
    setRedoStack([]);
    setUserRows(newUserRows);
  };

  const handleChange = (displayIndex, field, value, sub) => {
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
        if (originalIndex !== -1) {
          newUserRows[originalIndex] = recalcRow;
        }
      });
    } else if (field === "time") {
      const currentTime = formatTime(newUserRows[userRowIndex].time);

      let hourValue = sub === "hour" ? value : currentTime.hour;
      let minuteValue = sub === "minute" ? value : currentTime.minute;
      let periodValue = sub === "period" ? value : currentTime.period;

      if (!hourValue || isNaN(parseInt(hourValue))) hourValue = "12";
      if (!minuteValue || isNaN(parseInt(minuteValue))) minuteValue = "00";
      if (!periodValue || (periodValue !== "AM" && periodValue !== "PM"))
        periodValue = "AM";

      const hourNum = parseInt(hourValue);
      if (hourNum < 1 || hourNum > 12) hourValue = "12";

      const minuteNum = parseInt(minuteValue);
      if (minuteNum < 0 || minuteNum > 59) minuteValue = "00";

      const newTime = parseTimeInput(hourValue, minuteValue, periodValue);
      newUserRows[userRowIndex].time = newTime;

      const sortedRows = [...newUserRows].sort((a, b) => a.time - b.time);
      const sortedIndex = sortedRows.findIndex(
        (r) => r.id === newUserRows[userRowIndex].id
      );

      const recalculated = recalculateTimes(sortedRows, sortedIndex);

      recalculated.forEach((recalcRow, i) => {
        const originalIndex = newUserRows.findIndex(
          (r) => r.id === sortedRows[i].id
        );
        if (originalIndex !== -1) {
          newUserRows[originalIndex] = recalcRow;
        }
      });
    } else {
      newUserRows[userRowIndex][field] = value;
    }

    setUserRows(newUserRows);
  };

  const handleBlur = (displayIndex) => {
    saveToHistory(userRows);
  };

  const handleDelete = (displayIndex) => {
    const row = rows[displayIndex];
    const userRowIndex = userRows.findIndex((userRow) => userRow.id === row.id);
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

    // Create new array with swapped times, keeping other data intact
    const newUserRows = userRows.map((row) => {
      if (row.id === currentRow.id) {
        return { ...row, time: previousRow.time };
      } else if (row.id === previousRow.id) {
        return { ...row, time: currentRow.time };
      }
      return row;
    });

    // Recalculate subsequent times starting from the earlier time position
    const sortedRows = [...newUserRows].sort((a, b) => a.time - b.time);
    const recalculatedRows = recalculateTimes(sortedRows, displayIndex - 1);

    // Update userRows with recalculated times
    const finalUserRows = userRows.map((row) => {
      const recalculatedRow = recalculatedRows.find((r) => r.id === row.id);
      return recalculatedRow || row;
    });

    saveToHistory(finalUserRows);
  };

  const handleMoveDown = (displayIndex) => {
    if (displayIndex === rows.length - 1) return;

    const currentRow = rows[displayIndex];
    const nextRow = rows[displayIndex + 1];

    // Create new array with swapped times, keeping other data intact
    const newUserRows = userRows.map((row) => {
      if (row.id === currentRow.id) {
        return { ...row, time: nextRow.time };
      } else if (row.id === nextRow.id) {
        return { ...row, time: currentRow.time };
      }
      return row;
    });

    // Recalculate subsequent times starting from the current position
    const sortedRows = [...newUserRows].sort((a, b) => a.time - b.time);
    const recalculatedRows = recalculateTimes(sortedRows, displayIndex);

    // Update userRows with recalculated times
    const finalUserRows = userRows.map((row) => {
      const recalculatedRow = recalculatedRows.find((r) => r.id === row.id);
      return recalculatedRow || row;
    });

    saveToHistory(finalUserRows);
  };

  const handleEventClick = (index) => {
    setSelectedRowIndex(index);
    setShowEventSelector(true);
  };

  // Chain current row's time to the previous row's end time
  const handleChainToPrevious = (index) => {
    if (index === 0) return; // nothing to chain to

    const currentRow = rows[index];
    const previousRow = rows[index - 1];

    const newTime = previousRow.time + previousRow.duration;
    const newUserRows = [...userRows];
    const userRowIndex = newUserRows.findIndex((r) => r.id === currentRow.id);
    if (userRowIndex !== -1) {
      newUserRows[userRowIndex].time = newTime;

      // Recalculate subsequent rows based on display order
      const sortedRows = [...newUserRows].sort((a, b) => a.time - b.time);
      const sortedIndex = sortedRows.findIndex((r) => r.id === currentRow.id);
      const recalculated = recalculateTimes(sortedRows, sortedIndex);

      // Map recalculated times back to original userRows order
      recalculated.forEach((recalcRow, i) => {
        const originalIndex = newUserRows.findIndex((r) => r.id === sortedRows[i].id);
        if (originalIndex !== -1) {
          newUserRows[originalIndex] = recalcRow;
        }
      });

      saveToHistory(newUserRows);
    }
  };

  const handleEventSelect = (eventData) => {
    if (selectedRowIndex !== null) {
      const row = rows[selectedRowIndex];
      const userRowIndex = userRows.findIndex(
        (userRow) => userRow.id === row.id
      );
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
          if (originalIndex !== -1) {
            newUserRows[originalIndex] = recalcRow;
          }
        });

        saveToHistory(newUserRows);
      }
    }

    setShowEventSelector(false);
    setSelectedRowIndex(null);
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
      userRows,
    };

    const dataStr = JSON.stringify(projectData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `wedding-timeline-${bride || "bride"}-${
      groom || "groom"
    }.json`;
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
        setPhotoStartHour(projectData.photoStartHour || "9");
        setPhotoStartMinute(projectData.photoStartMinute || "00");
        setPhotoStartPeriod(projectData.photoStartPeriod || "AM");
        setPhotoEndHour(projectData.photoEndHour || "5");
        setPhotoEndMinute(projectData.photoEndMinute || "00");
        setPhotoEndPeriod(projectData.photoEndPeriod || "PM");
        setVideoStartHour(projectData.videoStartHour || "9");
        setVideoStartMinute(projectData.videoStartMinute || "00");
        setVideoStartPeriod(projectData.videoStartPeriod || "AM");
        setVideoEndHour(projectData.videoEndHour || "5");
        setVideoEndMinute(projectData.videoEndMinute || "00");
        setVideoEndPeriod(projectData.videoEndPeriod || "PM");
        setUserRows(projectData.userRows || []);
        setHistory([]);
        setRedoStack([]);
      } catch (error) {
        alert("Error loading project file");
      }
    };
    reader.readAsText(file);
  };

  const exportTimeline = () => {
    const sortedRows = [...userRows].sort((a, b) => a.time - b.time);
    let timeline = `Wedding Timeline for ${bride} & ${groom}\n`;
    timeline += `Date: ${date}\n\n`;
    timeline += `Photo Coverage: ${photoStartHour}:${photoStartMinute} ${photoStartPeriod} - ${photoEndHour}:${photoEndMinute} ${photoEndPeriod}\n`;
    timeline += `Video Coverage: ${videoStartHour}:${videoStartMinute} ${videoStartPeriod} - ${videoEndHour}:${videoEndMinute} ${videoEndPeriod}\n\n`;
    timeline += "TIMELINE:\n\n";

    sortedRows.forEach((row) => {
      const time = formatTime(row.time);
      timeline += `${time.hour}:${time.minute} ${time.period} - ${row.event}\n`;
      timeline += `Location: ${row.location}\n`;
      timeline += `Duration: ${row.duration} minutes\n\n`;
    });

    const dataBlob = new Blob([timeline], { type: "text/plain" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `wedding-timeline-${bride || "bride"}-${
      groom || "groom"
    }.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const addRow = () => {
    const lastRow = rows[rows.length - 1];
    const newTime = lastRow ? lastRow.time + lastRow.duration : 9 * 60 + 30;
    const newRow = {
      id: nextId,
      location: "",
      time: newTime,
      event: "",
      duration: 30,
    };

    setUserRows([...userRows, newRow]);
    setNextId(nextId + 1);
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

  return (
    <div
      style={{
        padding: "10px",
        maxWidth: "100%",
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      {/* Mobile-optimized heading */}
      <h1
        style={{
          textAlign: "center",
          margin: "10px 0 5px 0",
          fontSize: "clamp(18px, 5vw, 24px)",
          lineHeight: "1.2",
          color: "#333",
          fontWeight: "bold",
        }}
      >
        Wedding Timeline Builder
      </h1>

      {/* MediaPotion credit */}
      <div
        style={{
          textAlign: "center",
          margin: "0 0 20px 0",
        }}
      >
        <a
          href="mailto:info@mediapotion.net"
          style={{
            fontSize: "14px",
            color: "#666",
            textDecoration: "none",
          }}
        >
          by MediaPotion
        </a>
      </div>

      {/* Wedding Details Section - Mobile Centered */}
      <div
        style={{
          backgroundColor: "white",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px",
          border: "1px solid #ddd",
          maxWidth: "100%",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            margin: "0 0 15px 0",
            fontSize: "18px",
            color: "#333",
          }}
        >
          Wedding Details
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            <label
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                color: "#555",
                minWidth: "40px",
              }}
            >
              Date:
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                width: "140px",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontSize: "14px",
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
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontSize: "14px",
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
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#555",
                }}
              >
                Photo Start:
              </label>
              <div
                style={{ display: "flex", gap: "4px", alignItems: "center" }}
              >
                <input
                  type="text"
                  value={photoStartHour}
                  onChange={(e) => setPhotoStartHour(e.target.value)}
                  style={{
                    width: "40px",
                    padding: "6px",
                    textAlign: "center",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                />
                <span>:</span>
                <input
                  type="text"
                  value={photoStartMinute}
                  onChange={(e) => setPhotoStartMinute(e.target.value)}
                  style={{
                    width: "40px",
                    padding: "6px",
                    textAlign: "center",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                />
                <select
                  value={photoStartPeriod}
                  onChange={(e) => setPhotoStartPeriod(e.target.value)}
                  style={{
                    padding: "6px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#555",
                }}
              >
                Photo End:
              </label>
              <div
                style={{ display: "flex", gap: "4px", alignItems: "center" }}
              >
                <input
                  type="text"
                  value={photoEndHour}
                  onChange={(e) => setPhotoEndHour(e.target.value)}
                  style={{
                    width: "40px",
                    padding: "6px",
                    textAlign: "center",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                />
                <span>:</span>
                <input
                  type="text"
                  value={photoEndMinute}
                  onChange={(e) => setPhotoEndMinute(e.target.value)}
                  style={{
                    width: "40px",
                    padding: "6px",
                    textAlign: "center",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                />
                <select
                  value={photoEndPeriod}
                  onChange={(e) => setPhotoEndPeriod(e.target.value)}
                  style={{
                    padding: "6px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#555",
                }}
              >
                Video Start:
              </label>
              <div
                style={{ display: "flex", gap: "4px", alignItems: "center" }}
              >
                <input
                  type="text"
                  value={videoStartHour}
                  onChange={(e) => setVideoStartHour(e.target.value)}
                  style={{
                    width: "40px",
                    padding: "6px",
                    textAlign: "center",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                />
                <span>:</span>
                <input
                  type="text"
                  value={videoStartMinute}
                  onChange={(e) => setVideoStartMinute(e.target.value)}
                  style={{
                    width: "40px",
                    padding: "6px",
                    textAlign: "center",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                />
                <select
                  value={videoStartPeriod}
                  onChange={(e) => setVideoStartPeriod(e.target.value)}
                  style={{
                    padding: "6px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#555",
                }}
              >
                Video End:
              </label>
              <div
                style={{ display: "flex", gap: "4px", alignItems: "center" }}
              >
                <input
                  type="text"
                  value={videoEndHour}
                  onChange={(e) => setVideoEndHour(e.target.value)}
                  style={{
                    width: "40px",
                    padding: "6px",
                    textAlign: "center",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                />
                <span>:</span>
                <input
                  type="text"
                  value={videoEndMinute}
                  onChange={(e) => setVideoEndMinute(e.target.value)}
                  style={{
                    width: "40px",
                    padding: "6px",
                    textAlign: "center",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                />
                <select
                  value={videoEndPeriod}
                  onChange={(e) => setVideoEndPeriod(e.target.value)}
                  style={{
                    padding: "6px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Events Section */}
      <div
        style={{
          backgroundColor: "white",
          padding: "15px",
          borderRadius: "8px",
          border: "1px solid #ddd",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            margin: "0 0 15px 0",
            fontSize: "18px",
            color: "#333",
          }}
        >
          Timeline Events
        </h2>

        {/* Project Control Buttons */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "15px",
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
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
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
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
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
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            Export Timeline
          </button>
        </div>

        {/* Timeline Rows - Full Width for Mobile */}
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
              onChainToPrevious={handleChainToPrevious}
            />
          ))}
        </div>

        {/* Add Event Button with Undo/Redo */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "15px",
            gap: "12px",
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
              borderRadius: "4px",
              cursor: history.length > 0 ? "pointer" : "not-allowed",
              fontSize: "14px",
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
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "16px",
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
              borderRadius: "4px",
              cursor: redoStack.length > 0 ? "pointer" : "not-allowed",
              fontSize: "14px",
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
  );
}
