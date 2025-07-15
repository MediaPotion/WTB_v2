// App.js
import React, { useState } from "react";
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
    "Evening:": "#ff8100",
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

function TimelineRow({ row, index, onChange, onBlur, onDelete }) {
  const t = formatTime(row.time);
  const { setNodeRef } = useDroppable({ id: `row-${index}` });
  return (
    <div
      ref={setNodeRef}
      style={{
        display: "grid",
        gridTemplateColumns: "3fr 2fr 4fr 2fr 1fr",
        alignItems: "center",
        borderBottom: "1px solid #ccc",
      }}
    >
      <textarea
        placeholder="Location"
        value={row.location}
        onChange={(e) => onChange(index, "location", e.target.value)}
        rows={2}
        style={{ width: "100%", fontSize: "14px", padding: "4px" }}
      />
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
        style={{ width: "100%", fontSize: "14px", padding: "4px" }}
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
  const [rows, setRows] = useState([
    { location: "", time: 9 * 60, event: "", duration: 30 },
  ]);
  const [date, setDate] = useState("");
  const [bride, setBride] = useState("");
  const [groom, setGroom] = useState("");
  const [startHour, setStartHour] = useState("9");
  const [startMinute, setStartMinute] = useState("00");
  const [startPeriod, setStartPeriod] = useState("AM");

  // Replace your exportTXT function with this:
const exportTXT = () => {
  const lines = [
    `Date: ${date}`,
    `Start Time: ${startHour}:${startMinute} ${startPeriod}`,
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
      `${ft.hour}:${ft.minute} ${ft.period} | ${r.event || "(no event)"} | ${r.duration} min`,
      ""
    );
  });
  // Dynamic filename based on names
  const filename = `${bride.trim().replace(/\s+/g, '_') || 'Bride'}_${groom.trim().replace(/\s+/g, '_') || 'Groom'}_Timeline.txt`;
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
    "Reception: Audio/Video Setup::20",
    "Reception: Grand Entrances::10",
    "Reception: Cake Cutting::5",
    "Reception: Bride & Groom Dance::5",
    "Reception: Bride & Parent Dance::5",
    "Reception: Groom & Parent Dance::5",
    "Reception: Special Dance::5",
    "Reception: Dinner::30",
    "Reception: Speeches (Per Speaker)::10",
    "Evening: Bride & Groom Golden Hour Portraits::20",
    "Evening: Open Dance Floor::20",
    "Evening: Garder Belt Toss::15",
    "Evening: Bouquet Toss::15",
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
    setRows(updateTimesFromIndex(i, a));
  };

  const handleBlur = (i) => {
    const a = [...rows];
    if (i === a.length - 1)
      a.push({
        location: "",
        time: a[i].time + a[i].duration,
        event: "",
        duration: 30,
      });
    setRows(updateTimesFromIndex(i, a));
  };

  const handleDelete = (i) =>
    setRows(
      updateTimesFromIndex(
        Math.max(0, i - 1),
        rows.filter((_, idx) => idx !== i)
      )
    );

  const handleDragEnd = ({ active, over }) => {
    if (!over || !over.id.startsWith("row-")) return;
    const idx = parseInt(over.id.replace("row-", ""), 10),
      [lab, d] = active.id.split("::");
    const a = [...rows];
    a[idx].event = lab;
    a[idx].duration = parseInt(d, 10);
    if (idx === a.length - 1)
      a.push({
        location: "",
        time: a[idx].time + a[idx].duration,
        event: "",
        duration: 30,
      });
    setRows(updateTimesFromIndex(idx, a));
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div style={{ display: "flex", height: "100vh" }}>
        <div style={{ flex: 3, padding: "1rem", overflowY: "auto" }}>
          <button
            onClick={exportTXT}
            style={{ display: "block", margin: "0 auto 1rem" }}
          >
            Export as TXT
          </button>
          <h1
            style={{
              textAlign: "center",
              fontFamily: "Georgia, serif",
              fontSize: "2rem",
              color: "#6b4c3b",
              marginBottom: "1rem",
            }}
          >
            Wedding Timeline Builder
          </h1>
          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <div style={{ marginBottom: "0.5rem" }}>
              <label>Date:</label>{" "}
              <input
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="MM/DD/YYYY"
              />{" "}
            </div>
            <div style={{ marginBottom: "0.5rem" }}>
              <label>Start Time for Media Potion:</label>{" "}
              <input
                style={{ width: "30px" }}
                value={startHour}
                onChange={(e) => setStartHour(e.target.value)}
              />{" "}
              :{" "}
              <input
                style={{ width: "30px" }}
                value={startMinute}
                onChange={(e) => setStartMinute(e.target.value)}
              />{" "}
              <select
                value={startPeriod}
                onChange={(e) => setStartPeriod(e.target.value)}
              >
                <option>AM</option>
                <option>PM</option>
              </select>{" "}
            </div>
            <div>
              <label>Bride's Full Name:</label>{" "}
              <input
                style={{ marginRight: "16px" }}
                value={bride}
                onChange={(e) => setBride(e.target.value)}
              />{" "}
              <label>Groom's Full Name:</label>{" "}
              <input value={groom} onChange={(e) => setGroom(e.target.value)} />
            </div>
          </div>
          <h2
            style={{
              textAlign: "center",
              fontSize: "18px",
              fontWeight: "bold",
              marginBottom: "1rem",
            }}
          >
            Timeline
          </h2>
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
              row={r}
              index={i}
              onChange={handleChange}
              onBlur={handleBlur}
              onDelete={handleDelete}
            />
          ))}
        </div>
        <div
          style={{
            width: "300px",
            padding: "1rem",
            background: "#f3f4f6",
            overflowY: "auto",
          }}
        >
          <h3 style={{ fontWeight: "bold" }}>Event Blocks</h3>
          {eventBlocks.map((b) => (
            <DraggableEvent key={b.id} id={b.id} label={b.label} />
          ))}
        </div>
      </div>
    </DndContext>
  );
}
