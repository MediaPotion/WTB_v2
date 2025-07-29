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

function DraggableEvent({ id, label, onDragStart }) {
  const duration = parseInt(id.split("::")[1], 10);

  // More differentiated colors for event blocks
  const colors = {
    Details: "#FFE5B4", // Peach
    "Bride (Pre-Dress)": "#FFB6C1", // Light Pink
    "Bride (Dress On)": "#FF69B4", // Hot Pink
    "Bride & Groom:": "#DA70D6", // Orchid
    "Narration:": "#FFA07A", // Light Salmon
    "Groom:": "#98FB98", // Pale Green
    "Ceremony:": "#F0E68C", // Khaki
    "Reception:": "#87CEEB", // Sky Blue
    "Group Photos:": "#DDA0DD", // Plum
    Other: "#FF8C00", // Dark Orange
  };

  const key = Object.keys(colors).find((k) => label.startsWith(k));
  const background = colors[key] || "#E6E6FA"; // Lavender default

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", id);
        onDragStart(id);
      }}
      style={{
        padding: "8px",
        margin: "4px 0",
        background,
        border: "2px solid #999",
        borderRadius: "8px",
        cursor: "grab",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontWeight: "500",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <span>{label}</span>
      <span style={{ fontSize: "12px", color: "#555", fontWeight: "bold" }}>
        {duration} min
      </span>
    </div>
  );
}

function TimelineRow({
  row,
  index,
  onChange,
  onBlur,
  onDelete,
  id,
  isDragging,
  onDragStart,
  onDragOver,
  onDrop,
  dragOverIndex,
}) {
  // More differentiated colors for event fields
  const colors = {
    Details: "#FFE5B4", // Peach
    "Bride (Pre-Dress)": "#FFB6C1", // Light Pink
    "Bride (Dress On)": "#FF69B4", // Hot Pink
    "Bride & Groom:": "#DA70D6", // Orchid
    "Narration:": "#FFA07A", // Light Salmon
    "Groom:": "#98FB98", // Pale Green
    "Ceremony:": "#F0E68C", // Khaki
    "Reception:": "#87CEEB", // Sky Blue
    "Group Photos:": "#DDA0DD", // Plum
    Other: "#FF8C00", // Dark Orange
  };

  // Get the background color for the event field
  const getEventColor = (eventText) => {
    if (!eventText) return "#ffffff";
    const key = Object.keys(colors).find((k) => eventText.startsWith(k));
    return colors[key] || "#ffffff";
  };

  const t = formatTime(row.time);

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", `timeline-${index}`);
        onDragStart(`timeline-${index}`);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(index);
      }}
      onDrop={(e) => {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData("text/plain");
        onDrop(draggedId, index);
      }}
      style={{
        display: "grid",
        gridTemplateColumns: "4fr 2fr 4fr 2fr 1fr",
        alignItems: "center",
        borderBottom: "1px solid #ccc",
        background: isDragging
          ? "#e6f7ff"
          : dragOverIndex === index
          ? "#fff7d6"
          : "transparent",
        boxShadow: isDragging ? "0 0 6px #1890ff" : "none",
        transition: "background 0.2s ease, box-shadow 0.2s ease",
        opacity: 1,
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            cursor: "grab",
            padding: "8px",
            fontSize: "16px",
            userSelect: "none",
            color: "#666",
            marginRight: "8px",
          }}
        >
          ↕️
        </div>
        <textarea
          placeholder="Location"
          value={row.location}
          onChange={(e) => onChange(index, "location", e.target.value)}
          onBlur={() => onBlur(index)}
          rows={2}
          style={{
            width: "100%",
            fontSize: "14px",
            padding: "4px",
            resize: "none",
            backgroundColor: "white",
            color: "black",
            cursor: "text",
          }}
        />
      </div>
      <div style={{ textAlign: "center", padding: "4px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "2px",
          }}
        >
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
                width: "20px",
                height: "15px",
                fontSize: "10px",
                border: "1px solid #ccc",
                background: "#f5f5f5",
                cursor: "pointer",
                padding: "0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ▲
            </button>
            <input
              type="text"
              value={t.hour}
              onChange={(e) => onChange(index, "time", e.target.value, "hour")}
              onBlur={() => onBlur(index)}
              style={{
                width: "30px",
                fontSize: "14px",
                textAlign: "center",
                backgroundColor: "white",
                color: "black",
                cursor: "text",
                border: "1px solid #ccc",
                margin: "1px 0",
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
                width: "20px",
                height: "15px",
                fontSize: "10px",
                border: "1px solid #ccc",
                background: "#f5f5f5",
                cursor: "pointer",
                padding: "0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ▼
            </button>
          </div>
          <span style={{ margin: "0 2px" }}>:</span>
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
                width: "20px",
                height: "15px",
                fontSize: "10px",
                border: "1px solid #ccc",
                background: "#f5f5f5",
                cursor: "pointer",
                padding: "0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
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
                backgroundColor: "white",
                color: "black",
                cursor: "text",
                border: "1px solid #ccc",
                margin: "1px 0",
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
                width: "20px",
                height: "15px",
                fontSize: "10px",
                border: "1px solid #ccc",
                background: "#f5f5f5",
                cursor: "pointer",
                padding: "0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ▼
            </button>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginLeft: "4px",
            }}
          >
            <button
              onClick={() => {
                const currentTime = formatTime(row.time);
                const newPeriod = currentTime.period === "AM" ? "PM" : "AM";
                onChange(index, "time", newPeriod, "period");
                onBlur(index);
              }}
              style={{
                width: "30px",
                height: "32px",
                fontSize: "10px",
                border: "1px solid #ccc",
                background: "#f5f5f5",
                cursor: "pointer",
                padding: "0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {t.period}
            </button>
          </div>
        </div>
      </div>
      <input
        type="text"
        placeholder="Event"
        value={row.event}
        onChange={(e) => onChange(index, "event", e.target.value)}
        onBlur={() => onBlur(index)}
        style={{
          width: "100%",
          fontSize: "14px",
          padding: "4px",
          backgroundColor: getEventColor(row.event),
          border: "1px solid #ccc",
          borderRadius: "4px",
          color: "black",
          cursor: "text",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", padding: "4px" }}>
        <input
          type="number"
          min="5"
          step="5"
          value={row.duration}
          onChange={(e) => onChange(index, "duration", e.target.value)}
          onBlur={() => onBlur(index)}
          style={{
            width: "35px",
            fontSize: "14px",
            backgroundColor: "white",
            color: "black",
            cursor: "text",
          }}
        />
        <span style={{ marginLeft: "4px" }}>Minutes</span>
      </div>
      <button
        onClick={() => onDelete(index)}
        style={{
          background: "none",
          border: "none",
          color: "red",
          cursor: "pointer",
        }}
        title="Delete"
      >
        ✕
      </button>
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
  const [activeRowId, setActiveRowId] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Memoize the sorted rows to prevent unnecessary re-renders
  const rows = useMemo(() => {
    return [...userRows].sort((a, b) => a.time - b.time);
  }, [userRows]);

  // Function to recalculate times based on duration changes
  const recalculateTimes = (rows, startIndex = 0) => {
    const newRows = [...rows];
    for (let i = startIndex + 1; i < newRows.length; i++) {
      const prevRow = newRows[i - 1];
      newRows[i].time = prevRow.time + prevRow.duration;
    }
    return newRows;
  };

  const eventBlocks = [
    "Details: Drone & Venue Shots::20",
    "Details: Rings/Invitations/Accessories::20",
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
  ].map((e) => {
    const [lab, d] = e.split("::");
    return { id: `${lab}::${d}`, label: lab, duration: parseInt(d, 10) };
  });

  const saveToHistory = (newUserRows) => {
    if (JSON.stringify(newUserRows) === JSON.stringify(userRows)) {
      return; // Don't save if nothing changed
    }
    setHistory((prev) => [...prev.slice(-11), userRows]);
    setRedoStack([]);
    setUserRows(newUserRows);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setRedoStack((r) => [...r, userRows]);
    setUserRows(last);
    setHistory((h) => h.slice(0, -1));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setHistory((h) => [...h, userRows]);
    setUserRows(next);
    setRedoStack((r) => r.slice(0, -1));
  };

  const handleChange = (displayIndex, field, value, sub) => {
    const row = rows[displayIndex];
    const userRowIndex = userRows.findIndex((userRow) => userRow === row);
    if (userRowIndex === -1) return;

    const newUserRows = [...userRows];

    if (field === "duration") {
      const newDuration = parseInt(value, 10) || 0;
      newUserRows[userRowIndex][field] = newDuration;

      // Sort rows by time and find the index of the changed row
      const sortedRows = [...newUserRows].sort((a, b) => a.time - b.time);
      const sortedIndex = sortedRows.findIndex(
        (r) => r === newUserRows[userRowIndex]
      );

      // Recalculate times for all subsequent rows
      const recalculated = recalculateTimes(sortedRows, sortedIndex);

      // Update userRows with recalculated times
      recalculated.forEach((recalcRow, i) => {
        const originalIndex = newUserRows.findIndex((r) => r === sortedRows[i]);
        if (originalIndex !== -1) {
          newUserRows[originalIndex] = recalcRow;
        }
      });
    } else if (field === "time") {
      const currentTime = formatTime(newUserRows[userRowIndex].time);

      // Validate input values and provide defaults
      let hourValue = sub === "hour" ? value : currentTime.hour;
      let minuteValue = sub === "minute" ? value : currentTime.minute;
      let periodValue = sub === "period" ? value : currentTime.period;

      // Handle empty or invalid values
      if (!hourValue || isNaN(parseInt(hourValue))) hourValue = "12";
      if (!minuteValue || isNaN(parseInt(minuteValue))) minuteValue = "00";
      if (!periodValue || (periodValue !== "AM" && periodValue !== "PM"))
        periodValue = "AM";

      // Ensure hour is between 1-12
      const hourNum = parseInt(hourValue);
      if (hourNum < 1 || hourNum > 12) hourValue = "12";

      // Ensure minute is between 0-59
      const minuteNum = parseInt(minuteValue);
      if (minuteNum < 0 || minuteNum > 59) minuteValue = "00";

      const newTime = parseTimeInput(hourValue, minuteValue, periodValue);
      newUserRows[userRowIndex].time = newTime;

      // Sort rows by time and find the index of the changed row
      const sortedRows = [...newUserRows].sort((a, b) => a.time - b.time);
      const sortedIndex = sortedRows.findIndex(
        (r) => r === newUserRows[userRowIndex]
      );

      // Recalculate times for all subsequent rows
      const recalculated = recalculateTimes(sortedRows, sortedIndex);

      // Update userRows with recalculated times
      recalculated.forEach((recalcRow, i) => {
        const originalIndex = newUserRows.findIndex((r) => r === sortedRows[i]);
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
    // Save to history when user finishes editing a field
    saveToHistory(userRows);
  };

  const handleDelete = (displayIndex) => {
    const row = rows[displayIndex];
    const userRowIndex = userRows.findIndex((userRow) => userRow === row);
    if (userRowIndex === -1) return;

    let newUserRows = userRows.filter((_, idx) => idx !== userRowIndex);

    // If we deleted a row that wasn't the last one, recalculate times
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

  const handleDragStart = (id) => {
    setActiveRowId(id);
  };

  const handleDragOver = (index) => {
    setDragOverIndex(index);
  };

  const handleDrop = (draggedId, dropIndex) => {
    setActiveRowId(null);
    setDragOverIndex(null);

    const dropRow = rows[dropIndex];

    if (draggedId.includes("::")) {
      // Dropping event block on timeline row - keep the time but replace event and duration
      const userRowIndex = userRows.findIndex((userRow) => userRow === dropRow);
      if (userRowIndex === -1) return;

      const [lab, d] = draggedId.split("::");
      const newUserRows = [...userRows];
      const newDuration = parseInt(d, 10);

      // Keep the existing time and location, only change event and duration
      newUserRows[userRowIndex] = {
        ...newUserRows[userRowIndex],
        event: lab,
        duration: newDuration,
      };

      // Sort rows by time and find the index of the changed row
      const sortedRows = [...newUserRows].sort((a, b) => a.time - b.time);
      const sortedIndex = sortedRows.findIndex(
        (r) => r === newUserRows[userRowIndex]
      );

      // Recalculate times for all subsequent rows
      const recalculated = recalculateTimes(sortedRows, sortedIndex);

      // Update userRows with recalculated times
      recalculated.forEach((recalcRow, i) => {
        const originalIndex = newUserRows.findIndex((r) => r === sortedRows[i]);
        if (originalIndex !== -1) {
          newUserRows[originalIndex] = recalcRow;
        }
      });

      saveToHistory(newUserRows);
      return;
    }

    if (draggedId.startsWith("timeline-")) {
      // Reordering timeline rows
      const fromDisplayIndex = parseInt(draggedId.replace("timeline-", ""), 10);
      const toDisplayIndex = dropIndex;

      if (fromDisplayIndex === toDisplayIndex) return;

      const fromRow = rows[fromDisplayIndex];
      const toRow = rows[toDisplayIndex];

      const fromUserIndex = userRows.findIndex(
        (userRow) => userRow === fromRow
      );
      const toUserIndex = userRows.findIndex((userRow) => userRow === toRow);

      if (fromUserIndex === -1 || toUserIndex === -1) return;

      const newUserRows = [...userRows];

      // The dragged row takes the target row's time, but keeps its own event, location, and duration
      const draggedRow = { ...newUserRows[fromUserIndex] };
      const targetTime = toRow.time;

      // Update the dragged row's time to the target time
      draggedRow.time = targetTime;

      // Remove the dragged row from its original position
      newUserRows.splice(fromUserIndex, 1);

      // Find the correct insertion index after removal
      // If we're moving down, we need to find the target row in the new array
      let insertionIndex;
      if (fromUserIndex < toUserIndex) {
        // Moving down - find the target row after removal
        const targetRowAfterRemoval = newUserRows.find((row) => row === toRow);
        insertionIndex = newUserRows.indexOf(targetRowAfterRemoval);
      } else {
        // Moving up - find the target row after removal
        const targetRowAfterRemoval = newUserRows.find((row) => row === toRow);
        insertionIndex = newUserRows.indexOf(targetRowAfterRemoval);
      }

      // Insert the dragged row at the target position
      newUserRows.splice(insertionIndex, 0, draggedRow);

      // Now recalculate all times starting from the inserted position
      const sortedRows = [...newUserRows].sort((a, b) => a.time - b.time);
      const insertedRowSortedIndex = sortedRows.findIndex(
        (r) => r === draggedRow
      );

      // Recalculate times for all rows after the inserted row
      const recalculated = recalculateTimes(sortedRows, insertedRowSortedIndex);

      saveToHistory(recalculated);
    }
  };

  const addNewRow = () => {
    const lastRow = rows[rows.length - 1];
    const newTime = lastRow ? lastRow.time + lastRow.duration : 9 * 60 + 30; // 9:30 AM default
    const newRow = {
      id: nextId,
      location: "",
      time: newTime,
      event: "",
      duration: 30,
    };
    setNextId(nextId + 1);
    saveToHistory([...userRows, newRow]);
  };

  // Save/Load functionality
  const saveProject = () => {
    const projectData = {
      userRows,
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
      savedAt: new Date().toISOString(),
    };

    const filename = `${bride.trim().replace(/\s+/g, "_") || "Bride"}_${
      groom.trim().replace(/\s+/g, "_") || "Groom"
    }_Timeline_Project.json`;

    const blob = new Blob([JSON.stringify(projectData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadProject = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const projectData = JSON.parse(e.target.result);

          if (!projectData.userRows || !Array.isArray(projectData.userRows)) {
            alert("Invalid project file format");
            return;
          }

          setUserRows(
            projectData.userRows.map((row, index) => ({
              ...row,
              id: row.id || index + 1,
            }))
          );
          setNextId(
            Math.max(
              ...projectData.userRows.map((row, index) => row.id || index + 1)
            ) + 1
          );
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

          setHistory([]);
          setRedoStack([]);

          alert("Project loaded successfully!");
        } catch (error) {
          alert("Error loading project file: " + error.message);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const exportTXT = () => {
    const lines = [
      `Date: ${date}`,
      `Photographers: ${photoStartHour}:${photoStartMinute} ${photoStartPeriod} - ${photoEndHour}:${photoEndMinute} ${photoEndPeriod}`,
      `Videographers: ${videoStartHour}:${videoStartMinute} ${videoStartPeriod} - ${videoEndHour}:${videoEndMinute} ${videoEndPeriod}`,
      `Bride: ${bride}`,
      `Groom: ${groom}`,
      "",
      "Timeline:",
      "",
    ];
    rows.forEach((r) => {
      if (r.location) lines.push(r.location, "");
      const ft = formatTime(r.time);
      lines.push(
        `${ft.hour}:${ft.minute} ${ft.period} | ${r.event || "(no event)"} | ${
          r.duration
        } min`,
        ""
      );
    });
    const filename = `${bride.trim().replace(/\s+/g, "_") || "Bride"}_${
      groom.trim().replace(/\s+/g, "_") || "Groom"
    }_Timeline.txt`;
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ flex: 3, padding: "1rem", overflowY: "auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
            marginBottom: "0.5rem",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={saveProject}
            style={{
              background: "#2196F3",
              color: "white",
              padding: "8px 16px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            💾 Save Project
          </button>
          <button
            onClick={loadProject}
            style={{
              background: "#FF9800",
              color: "white",
              padding: "8px 16px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            📂 Load Project
          </button>
          <button
            onClick={exportTXT}
            style={{
              background: "#FFEB3B",
              color: "black",
              padding: "8px 16px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            📄 Export as TXT
          </button>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
            marginBottom: "1rem",
            flexWrap: "wrap",
          }}
        >
          <button onClick={handleUndo} disabled={history.length === 0}>
            ⬅️ Undo
          </button>
          <button onClick={handleRedo} disabled={redoStack.length === 0}>
            ➡️ Redo
          </button>
        </div>

        <h1
          style={{
            textAlign: "center",
            fontSize: "2.5rem",
            marginBottom: "0.5rem",
          }}
        >
          Wedding Timeline Builder
        </h1>
        <h2
          style={{
            textAlign: "center",
            fontSize: "1.2rem",
            marginBottom: "1rem",
          }}
        >
          by{" "}
          <a
            href="mailto:info@mediapotion.net"
            style={{ color: "#2196F3", textDecoration: "none" }}
          >
            Media Potion
          </a>
        </h2>

        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <div style={{ marginBottom: "0.5rem" }}>
            <label>Date:</label>{" "}
            <input
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="MM/DD/YYYY"
            />
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <label>Photographers - Start Time:</label>{" "}
            <input
              style={{ width: "30px" }}
              value={photoStartHour}
              onChange={(e) => setPhotoStartHour(e.target.value)}
            />{" "}
            :
            <input
              style={{ width: "30px" }}
              value={photoStartMinute}
              onChange={(e) => setPhotoStartMinute(e.target.value)}
            />
            <select
              value={photoStartPeriod}
              onChange={(e) => setPhotoStartPeriod(e.target.value)}
            >
              <option>AM</option>
              <option>PM</option>
            </select>{" "}
            <label>End Time:</label>{" "}
            <input
              style={{ width: "30px" }}
              value={photoEndHour}
              onChange={(e) => setPhotoEndHour(e.target.value)}
            />{" "}
            :
            <input
              style={{ width: "30px" }}
              value={photoEndMinute}
              onChange={(e) => setPhotoEndMinute(e.target.value)}
            />
            <select
              value={photoEndPeriod}
              onChange={(e) => setPhotoEndPeriod(e.target.value)}
            >
              <option>AM</option>
              <option>PM</option>
            </select>
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <label>Videographers - Start Time:</label>{" "}
            <input
              style={{ width: "30px" }}
              value={videoStartHour}
              onChange={(e) => setVideoStartHour(e.target.value)}
            />{" "}
            :
            <input
              style={{ width: "30px" }}
              value={videoStartMinute}
              onChange={(e) => setVideoStartMinute(e.target.value)}
            />
            <select
              value={videoStartPeriod}
              onChange={(e) => setVideoStartPeriod(e.target.value)}
            >
              <option>AM</option>
              <option>PM</option>
            </select>{" "}
            <label>End Time:</label>{" "}
            <input
              style={{ width: "30px" }}
              value={videoEndHour}
              onChange={(e) => setVideoEndHour(e.target.value)}
            />{" "}
            :
            <input
              style={{ width: "30px" }}
              value={videoEndMinute}
              onChange={(e) => setVideoEndMinute(e.target.value)}
            />
            <select
              value={videoEndPeriod}
              onChange={(e) => setVideoEndPeriod(e.target.value)}
            >
              <option>AM</option>
              <option>PM</option>
            </select>
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <label>Bride:</label>{" "}
            <input
              value={bride}
              onChange={(e) => setBride(e.target.value)}
              placeholder="Bride's Name"
            />
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <label>Groom:</label>{" "}
            <input
              value={groom}
              onChange={(e) => setGroom(e.target.value)}
              placeholder="Groom's Name"
            />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "4fr 2fr 4fr 2fr 1fr",
            fontWeight: "bold",
            borderBottom: "2px solid #333",
            marginBottom: "0.5rem",
            padding: "8px 0",
          }}
        >
          <div>Location</div>
          <div style={{ textAlign: "center" }}>Time</div>
          <div>Event</div>
          <div>Duration</div>
          <div></div>
        </div>

        <div>
          {rows.map((row, index) => (
            <TimelineRow
              key={row.id}
              row={row}
              index={index}
              onChange={handleChange}
              onBlur={handleBlur}
              onDelete={handleDelete}
              id={`timeline-${index}`}
              isDragging={activeRowId === `timeline-${index}`}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              dragOverIndex={dragOverIndex}
            />
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "1rem",
          }}
        >
          <button
            onClick={addNewRow}
            style={{
              background: "#4CAF50",
              color: "white",
              padding: "8px 16px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            ➕ Add Row
          </button>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          padding: "1rem",
          borderLeft: "1px solid #ccc",
          overflowY: "auto",
        }}
      >
        <h3
          style={{
            marginBottom: "1rem",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          Event Blocks
        </h3>

        <div>
          {eventBlocks.map((block) => (
            <DraggableEvent
              key={block.id}
              id={block.id}
              label={block.label}
              onDragStart={handleDragStart}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
