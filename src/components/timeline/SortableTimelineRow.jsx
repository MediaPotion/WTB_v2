import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TimelineRow } from "./TimelineRow";

function SortableTimelineRow({
  row,
  sortDisabled,
  ...timelineRowProps
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: String(row.id),
    data: { type: "timeline-row", rowId: row.id },
    disabled: sortDisabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`timeline-row${isDragging ? " dragging" : ""}`}
    >
      <TimelineRow
        row={row}
        dragHandleRef={setActivatorNodeRef}
        dragHandleListeners={sortDisabled ? undefined : listeners}
        dragHandleAttributes={sortDisabled ? undefined : attributes}
        isDragging={isDragging}
        {...timelineRowProps}
      />
    </div>
  );
}

export { SortableTimelineRow };
