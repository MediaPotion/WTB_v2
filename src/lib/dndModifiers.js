import { getEventCoordinates } from "@dnd-kit/utilities";

/** Keep the pointer on the same spot within the dragged element where the user grabbed. */
export function snapGrabPointToCursor({ activatorEvent, draggingNodeRect, transform }) {
  if (!draggingNodeRect || !activatorEvent) return transform;

  const coords = getEventCoordinates(activatorEvent);
  if (!coords) return transform;

  const offsetX = coords.x - draggingNodeRect.left;
  const offsetY = coords.y - draggingNodeRect.top;

  return {
    ...transform,
    x: transform.x + offsetX,
    y: transform.y + offsetY,
  };
}

/** Row overlay is smaller than the row; anchor the drag handle (left side) under the pointer. */
export function snapRowHandleToCursor({ activatorEvent, draggingNodeRect, transform }) {
  if (!draggingNodeRect || !activatorEvent) return transform;

  const coords = getEventCoordinates(activatorEvent);
  if (!coords) return transform;

  const offsetX = coords.x - draggingNodeRect.left;
  const offsetY = coords.y - draggingNodeRect.top;
  const HANDLE_WIDTH = 36;
  const OVERLAY_HANDLE_CENTER_Y = 24;

  return {
    ...transform,
    x: transform.x + offsetX - HANDLE_WIDTH / 2,
    y: transform.y + offsetY - OVERLAY_HANDLE_CENTER_Y,
  };
}
