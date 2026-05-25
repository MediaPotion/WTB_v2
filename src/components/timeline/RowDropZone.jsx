import React from "react";
import { useDroppable, useDndContext } from "@dnd-kit/core";
import { AddRowButton } from "./AddRowButton";

function RowDropZone({ index, onAddRow, isLast }) {
  const { active } = useDndContext();
  const isRowDrag = active?.data?.current?.type === "timeline-row";

  const { setNodeRef, isOver } = useDroppable({
    id: `between-${index}`,
    data: { type: "between", index },
  });

  const over = isOver && isRowDrag;

  return (
    <div
      ref={setNodeRef}
      className="wtb-drop-zone"
      style={{
        position: "relative",
        height: over ? 60 : 40,
        margin: "2px 0",
        backgroundColor: over ? "rgba(184,144,106,0.08)" : "transparent",
        border: over ? "2px dashed var(--wtb-accent)" : "2px dashed transparent",
        borderRadius: 8,
        transition: "all 0.15s ease-in-out",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      aria-label="Drop here to reorder"
      title={over ? "Release to drop row here" : ""}
    >
      {!over && <AddRowButton onClick={onAddRow} isLast={isLast} />}
    </div>
  );
}

export { RowDropZone };
