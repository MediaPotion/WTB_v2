import React from "react";
import { AddRowButton } from "./AddRowButton";

function RowDropZone({ index, onDropBetween, onAddRow, isLast }) {
  const [over, setOver] = React.useState(false);
  return (
    <div
      onDragOver={(e) => {
        if (e.dataTransfer?.types?.includes('text/plain')) {
          e.preventDefault();
          setOver(true);
        }
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        if (e.dataTransfer?.types?.includes('text/plain')) {
          e.preventDefault();
          setOver(false);
          onDropBetween?.(e, index);
        }
      }}
      className="wtb-drop-zone"
      style={{
        position: 'relative',
        height: over ? 60 : 40, // Grow to row height on hover
        margin: '2px 0',
        backgroundColor: over ? 'rgba(184,144,106,0.08)' : 'transparent',
        border: over ? '2px dashed #b8906a' : '2px dashed transparent',
        borderRadius: 8,
        transition: 'all 0.15s ease-in-out',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      aria-label="Drop here to reorder"
      title={over ? 'Release to drop row here' : ''}
    >
      {!over && <AddRowButton onClick={onAddRow} isLast={isLast} />}
    </div>
  );
}

export { RowDropZone };
