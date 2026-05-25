import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

function DraggableSidebarBlock({ id, data, style, title, children }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: { type: "sidebar-block", payload: data },
  });

  const dragStyle = {
    ...style,
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
    touchAction: "none",
  };

  return (
    <button
      ref={setNodeRef}
      type="button"
      {...listeners}
      {...attributes}
      style={dragStyle}
      title={title}
    >
      {children}
    </button>
  );
}

export { DraggableSidebarBlock };
