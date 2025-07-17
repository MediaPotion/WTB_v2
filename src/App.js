// App.js
import React, { useState, useEffect } from "react";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";

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

function DraggableEvent({ id, label }) {
  const duration = parseInt(id.split("::")[1], 10);
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  const colors = {
    Details: "#fff1e6",
    "Bride (Pre-Dress)": "#ffe4e1",
    "Bride (Dress On)": "#ffccd5",
    "Bride & Groom:": "#f5e1ff",
    "Bride:": "#fcd5ce",
    "Groom:": "#d0f4de",
    "Ceremony:": "#f0efeb",
    "Reception:": "#e0f7fa",
    "Group Photos:": "#fde2e4",
    Other: "#ff8100",
  };
  const key = Object.keys(colors).find((k) => label.startsWith(k));
  const background = colors[key] || "#ffffff";

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        transform: transform
          ? `translate(${transform.x}px,${transform.y}px)`
          : undefined,
        padding: "8px",
        margin: "4px 0",
        background,
        border: "1px solid #ccc",
        borderRadius: "8px",
        cursor: "grab",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span>{label}</span>
      <span style={{ fontSize: "12px", color: "#555" }}>{duration} min</span>
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
  activeId,
}) {
  const {
    attributes,
    listeners,
    setNodeRef: setDragHandleRef,
  } = useDraggable({ id });
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id });

  // Color mapping for event blocks
  const colors = {
    Details: "#fff1e6",
    "Bride (Pre-Dress)": "#ffe4e1",
    "Bride (Dress On)": "#ffccd5",
    "Bride & Groom:": "#f5e1ff",
    "Bride:": "#fcd5ce",
    "Groom:": "#d0f4de",
    "Ceremony:": "#f0efeb",
    "Reception:": "#e0f7fa",
    "Group Photos:": "#fde2e4",
    Other: "#ff8100",
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
      ref={setDropRef}
      style={{
        display: "grid",
        gridTemplateColumns: "3fr 2fr 4fr 2fr 1fr",
        alignItems: "center",
        borderBottom: "1px solid #ccc",
        background: isDragging ? "#e6f7ff" : isOver ? "#fff7d6" : "transparent",
        boxShadow: isDragging ? "0 0 6px #1890ff" : "none",
        transition: "background 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          ref={setDragHandleRef}
          {...listeners}
          {...attributes}
          style={{
            cursor: "grab",
            padding: "4px",
            fontSize: "18px",
            userSelect: "none",
          }}
        >
          ⋮
        </div>
        <textarea
          placeholder="Location"
          value={row.location}
          onChange={(e) => onChange(index, "location", e.target.value)}
          rows={2}
          style={{
            width: "100%",
            fontSize: "14px",
            padding: "4px",
            resize: "none",
          }}
        />
      </div>
      <div style={{ textAlign: "center", padding: "4px" }}>
        <input
          type="text"
          value={t.hour}
          onChange={(e) => onChange(index, "time", e.target.value, "hour")}
          onBlur={() => onBlur(index)}
          style={{ width: "30px", fontSize: "14px", textAlign: "center" }}
        />
        :
        <input
          type="text"
          value={t.minute}
          onChange={(e) => onChange(index, "time", e.target.value, "minute")}
          onBlur={() => onBlur(index)}
          style={{ width: "30px", fontSize: "14px", textAlign: "center" }}
        />
        <select
          value={t.period}
          onChange={(e) => onChange(index, "time", e.target.value, "period")}
          onBlur={() => onBlur(index)}
          style={{ fontSize: "14px", marginLeft: "4px" }}
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
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
          style={{ width: "35px", fontSize: "14px" }}
        />
        <span style={{ marginLeft: "4px" }}>Minutes</span>
      </div>
      {index > 0 ? (
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
      ) : (
        <div style={{ height: "32px" }} />
      )}
    </div>
  );
}

export default function App() {
  const defaultRow = { location: "", time: 9 * 60, event: "", duration: 30 };

  const [rows, setRows] = useState(() => {
    const saved = localStorage.getItem("timelineRows");
    return saved ? JSON.parse(saved) : [defaultRow];
  });
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [date, setDate] = useState(() => {
    return localStorage.getItem("timelineDate") || "";
  });
  const [bride, setBride] = useState(() => {
    return localStorage.getItem("timelineBride") || "";
  });
  const [groom, setGroom] = useState(() => {
    return localStorage.getItem("timelineGroom") || "";
  });
  const [startHour, setStartHour] = useState(() => {
    return localStorage.getItem("timelineStartHour") || "9";
  });
  const [startMinute, setStartMinute] = useState(() => {
    return localStorage.getItem("timelineStartMinute") || "00";
  });
  const [startPeriod, setStartPeriod] = useState(() => {
    return localStorage.getItem("timelineStartPeriod") || "AM";
  });
  const [videoStartHour, setVideoStartHour] = useState(() => {
    return localStorage.getItem("timelineVideoStartHour") || "9";
  });
  const [videoStartMinute, setVideoStartMinute] = useState(() => {
    return localStorage.getItem("timelineVideoStartMinute") || "00";
  });
  const [videoStartPeriod, setVideoStartPeriod] = useState(() => {
    return localStorage.getItem("timelineVideoStartPeriod") || "AM";
  });
  const [activeRowId, setActiveRowId] = useState(null);

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
    "Bride: Bride Record Narration::15",
    "Groom: Groom Record Narration::15",
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

  const updateTimesFromIndex = (startIdx, arr) => {
    arr.forEach((r, i) => {
      if (i > startIdx) r.time = arr[i - 1].time + arr[i - 1].duration;
    });
    return arr;
  };

  const saveToHistory = (newRows) => {
    setHistory((prev) => [...prev.slice(-11), rows]);
    setRedoStack([]);
    setRows(newRows);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setRedoStack((r) => [...r, rows]);
    setRows(last);
    setHistory((h) => h.slice(0, -1));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setHistory((h) => [...h, rows]);
    setRows(next);
    setRedoStack((r) => r.slice(0, -1));
  };

  const handleChange = (i, f, v, sub) => {
    const a = [...rows];
    if (f === "duration") a[i][f] = parseInt(v, 10);
    else if (f === "time")
      a[i].time = parseTimeInput(
        sub === "hour" ? v : formatTime(a[i].time).hour,
        sub === "minute" ? v : formatTime(a[i].time).minute,
        sub === "period" ? v : formatTime(a[i].time).period
      );
    else a[i][f] = v;
    saveToHistory(updateTimesFromIndex(i, a));
  };

  const handleBlur = (i) => {
    const a = [...rows];
    saveToHistory(updateTimesFromIndex(i, a));
  };

  const handleDelete = (i) =>
    saveToHistory(
      updateTimesFromIndex(
        Math.max(0, i - 1),
        rows.filter((_, idx) => idx !== i)
      )
    );

  const handleDragEnd = ({ active, over }) => {
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId.includes("::") && overId.startsWith("timeline-")) {
      const idx = parseInt(overId.replace("timeline-", ""), 10);
      const [lab, d] = activeId.split("::");
      const a = [...rows];
      a[idx].event = lab;
      a[idx].duration = parseInt(d, 10);

      saveToHistory(updateTimesFromIndex(idx, a));
      setActiveRowId(null);
      return;
    }

    if (activeId.startsWith("timeline-") && overId.startsWith("timeline-")) {
      const fromIdx = parseInt(activeId.replace("timeline-", ""), 10);
      const toIdx = parseInt(overId.replace("timeline-", ""), 10);
      if (fromIdx === toIdx) {
        setActiveRowId(null);
        return;
      }

      const newRows = [...rows];
      const [moved] = newRows.splice(fromIdx, 1);
      const insertIdx = toIdx >= newRows.length ? newRows.length : toIdx;

      const referenceTime =
        newRows[insertIdx]?.time ??
        (newRows[insertIdx - 1]?.time ?? 0) +
          (newRows[insertIdx - 1]?.duration ?? 0);

      newRows.splice(insertIdx, 0, { ...moved, time: referenceTime });
      saveToHistory(
        updateTimesFromIndex(Math.min(fromIdx, insertIdx), newRows)
      );
    }

    setActiveRowId(null);
  };

  // Save/Load functionality
  const saveProject = () => {
    const projectData = {
      rows,
      date,
      bride,
      groom,
      startHour,
      startMinute,
      startPeriod,
      videoStartHour,
      videoStartMinute,
      videoStartPeriod,
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

          // Validate the structure
          if (!projectData.rows || !Array.isArray(projectData.rows)) {
            alert("Invalid project file format");
            return;
          }

          // Load all the data
          setRows(projectData.rows);
          setDate(projectData.date || "");
          setBride(projectData.bride || "");
          setGroom(projectData.groom || "");
          setStartHour(projectData.startHour || "9");
          setStartMinute(projectData.startMinute || "00");
          setStartPeriod(projectData.startPeriod || "AM");
          setVideoStartHour(projectData.videoStartHour || "9");
          setVideoStartMinute(projectData.videoStartMinute || "00");
          setVideoStartPeriod(projectData.videoStartPeriod || "AM");

          // Clear history when loading
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
      `Start Time for Photographers: ${startHour}:${startMinute} ${startPeriod}`,
      `Start Time for Videographers: ${videoStartHour}:${videoStartMinute} ${videoStartPeriod}`,
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

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem("timelineRows", JSON.stringify(rows));
  }, [rows]);

  useEffect(() => {
    localStorage.setItem("timelineDate", date);
  }, [date]);

  useEffect(() => {
    localStorage.setItem("timelineBride", bride);
  }, [bride]);

  useEffect(() => {
    localStorage.setItem("timelineGroom", groom);
  }, [groom]);

  useEffect(() => {
    localStorage.setItem("timelineStartHour", startHour);
  }, [startHour]);

  useEffect(() => {
    localStorage.setItem("timelineStartMinute", startMinute);
  }, [startMinute]);

  useEffect(() => {
    localStorage.setItem("timelineStartPeriod", startPeriod);
  }, [startPeriod]);

  useEffect(() => {
    localStorage.setItem("timelineVideoStartHour", videoStartHour);
  }, [videoStartHour]);

  useEffect(() => {
    localStorage.setItem("timelineVideoStartMinute", videoStartMinute);
  }, [videoStartMinute]);

  useEffect(() => {
    localStorage.setItem("timelineVideoStartPeriod", videoStartPeriod);
  }, [videoStartPeriod]);

  return (
    <DndContext
      onDragStart={({ active }) => setActiveRowId(active.id)}
      onDragEnd={handleDragEnd}
    >
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

          <h1 style={{ textAlign: "center", fontSize: "2.5rem", marginBottom: "0.5rem" }}>Wedding Timeline Builder</h1>
          <h2 style={{ textAlign: "center", fontSize: "1.2rem", marginBottom: "1rem" }}>
            by <a href="mailto:info@mediapotion.net" style={{ color: "#2196F3", textDecoration: "none" }}>Media Potion</a>
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
              <label>Start Time for Photographers:</label>{" "}
              <input
                style={{ width: "30px" }}
                value={startHour}
                onChange={(e) => setStartHour(e.target.value)}
              />{" "}
              :
              <input
                style={{ width: "30px" }}
                value={startMinute}
                onChange={(e) => setStartMinute(e.target.value)}
              />
              <select
                value={startPeriod}
                onChange={(e) => setStartPeriod(e.target.value)}
              >
                <option>AM</option>
                <option>PM</option>
              </select>
            </div>
            <div style={{ marginBottom: "0.5rem" }}>
              <label>Start Time for Videographers:</label>{" "}
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
              </select>
            </div>
            <div>
              <label>Bride:</label>{" "}
              <input value={bride} onChange={(e) => setBride(e.target.value)} />{" "}
              <label>Groom:</label>{" "}
              <input value={groom} onChange={(e) => setGroom(e.target.value)} />
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "3fr 2fr 4fr 2fr 1fr",
              fontWeight: "bold",
              borderBottom: "1px solid #ccc",
              paddingBottom: "8px",
              marginBottom: "8px",
            }}
          >
            <div>Location</div>
            <div style={{ textAlign: "center" }}>Time</div>
            <div>Event</div>
            <div>Duration</div>
            <div></div>
          </div>

          {rows.map((r, i) => (
            <TimelineRow
              key={i}
              id={`timeline-${i}`}
              row={r}
              index={i}
              onChange={handleChange}
              onBlur={handleBlur}
              onDelete={handleDelete}
              isDragging={activeRowId === `timeline-${i}`}
              activeId={activeRowId}
            />
          ))}

          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <button
              onClick={() => {
                const last = rows[rows.length - 1];
                saveToHistory([
                  ...rows,
                  {
                    location: "",
                    time: last.time + last.duration,
                    event: "",
                    duration: 30,
                  },
                ]);
              }}
              style={{
                background: "#4CAF50",
                color: "white",
                padding: "10px 20px",
                fontSize: "14px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              ➕ Add New Row
            </button>
          </div>
        </div>

        <div
          style={{
            width: "600px",
            padding: "1rem",
            background: "#f3f4f6",
            overflowY: "auto",
          }}
        >
          <h3
            style={{
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: "0.5rem",
            }}
          >
            Event Blocks
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {eventBlocks.map((b) => (
              <DraggableEvent key={b.id} id={b.id} label={b.label} />
            ))}
          </div>
        </div>
      </div>
    </DndContext>
  );
}