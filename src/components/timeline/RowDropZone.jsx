import React from "react";
import { useDroppable, useDndContext } from "@dnd-kit/core";
import { AddRowButton } from "./AddRowButton";

// The gap between two rows: "+" inserts an event here, and it is the drop
// target for reordering a row or adding a sidebar block between rows.
function RowDropZone({ index, onAddRow, isLast }) {
  const { active } = useDndContext();
  const dragType = active?.data?.current?.type;
  const isDragging = dragType === "timeline-row" || dragType === "sidebar-block";

  const { setNodeRef, isOver } = useDroppable({
    id: `between-${index}`,
    data: { type: "between", index },
  });

  const over = isOver && isDragging;

  return (
    <div
      ref={setNodeRef}
      className={`wtb-drop-zone${over ? " wtb-drop-zone--over" : ""}${isDragging ? " wtb-drop-zone--dragging" : ""}`}
      aria-label={dragType === "sidebar-block" ? "Drop here to add the event here" : "Drop here to move the row here"}
      title={over ? (dragType === "sidebar-block" ? "Release to add here" : "Release to move here") : ""}
    >
      {!over && !isDragging && <AddRowButton onClick={onAddRow} isLast={isLast} />}
    </div>
  );
}

export { RowDropZone };
