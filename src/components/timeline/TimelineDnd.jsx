import React, { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { getEventColor } from "../../constants/colors";

function timelineCollisionDetection(args) {
  const activeType = args.active?.data?.current?.type;
  const filtered = args.droppableContainers.filter((container) => {
    const id = String(container.id);
    if (activeType === "sidebar-block") return id.startsWith("row-");
    if (activeType === "timeline-row") {
      return id.startsWith("between-") || id.startsWith("row-");
    }
    return true;
  });
  return closestCenter({ ...args, droppableContainers: filtered });
}

function TimelineDndProvider({
  rowIds,
  onDragComplete,
  children,
}) {
  const [activeDrag, setActiveDrag] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = useCallback((event) => {
    setActiveDrag({
      id: event.active.id,
      data: event.active.data.current,
    });
  }, []);

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;
      setActiveDrag(null);
      if (!over) return;
      onDragComplete({
        activeId: active.id,
        overId: String(over.id),
        activeData: active.data.current,
      });
    },
    [onDragComplete]
  );

  const handleDragCancel = useCallback(() => {
    setActiveDrag(null);
  }, []);

  const renderOverlay = () => {
    if (!activeDrag) return null;
    const { data } = activeDrag;

    if (data?.type === "sidebar-block") {
      const payload = data.payload;
      const isLocation = payload?.type === "location";
      const label = isLocation
        ? "Location / Travel"
        : (payload?.event || "").split(": ").pop() || payload?.event || "Event";
      const borderColor = isLocation ? "#ffffff" : getEventColor(payload?.event || "", "#ffffff");
      return (
        <div
          style={{
            padding: "8px 12px",
            background: "#161310",
            border: `2px solid ${borderColor}`,
            color: "#ddd0bc",
            borderRadius: 6,
            fontSize: 13,
            fontFamily: "'Jost', sans-serif",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            pointerEvents: "none",
          }}
        >
          {label}
          {typeof payload?.duration === "number" && (
            <span style={{ marginLeft: 12, color: "#6e6358", fontWeight: "bold" }}>
              {payload.duration} min
            </span>
          )}
        </div>
      );
    }

    if (data?.type === "timeline-row") {
      return (
        <div
          style={{
            padding: "12px 16px",
            background: "#0f0d0b",
            border: "2px dashed #b8906a",
            borderRadius: 8,
            color: "#ddd0bc",
            fontSize: 13,
            fontFamily: "'Jost', sans-serif",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            pointerEvents: "none",
            minWidth: 200,
          }}
        >
          ⠿ Reorder row
        </div>
      );
    }

    return null;
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={timelineCollisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
      <DragOverlay dropAnimation={null}>{renderOverlay()}</DragOverlay>
    </DndContext>
  );
}

export { TimelineDndProvider };
