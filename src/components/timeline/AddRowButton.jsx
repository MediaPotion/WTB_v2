import React from "react";

function AddRowButton({ onClick, isLast }) {
  if (isLast) return null;
  
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center',
      margin: '8px 0',
      position: 'relative',
      zIndex: 1
    }}>
      <button
        onClick={onClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: '20px',
          border: '1px dashed var(--wtb-accent)',
          background: 'transparent',
          color: 'var(--wtb-accent)',
          fontSize: '13px',
          fontWeight: 300,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          fontFamily: "'Jost', sans-serif",
        }}
        title="Add new event here"
      >
        <span style={{ fontSize: '16px', lineHeight: '16px' }}>+</span>
        <span>Add Event</span>
      </button>
    </div>
  );
}

export { AddRowButton };
