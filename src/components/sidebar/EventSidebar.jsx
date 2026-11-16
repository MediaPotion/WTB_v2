import React from "react";
import { EVENT_BLOCKS } from "../../constants/events";
import { getEventColor } from "../../constants/colors";
import { DraggableSidebarBlock } from "./DraggableSidebarBlock";

// Desktop block palette. (The preview opens in its own panel from the toolbar.)
function EventSidebar() {
  return (
    <div className="wtb-sidebar-wrap">
      <aside className="wtb-sidebar" style={{ overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <h2 className="wtb-side-title">Event Blocks</h2>
        <div className="wtb-side-note">Drag a block between two events to add it there</div>
        <>
            <div className="wtb-palette">
              {/* Location / Travel block */}
              <div style={{ fontSize: 10, color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4, fontFamily: "'Jost', sans-serif", fontWeight: 400 }}>Travel</div>
              <DraggableSidebarBlock
                id="sidebar-location"
                data={{ type: "location", event: "", duration: 15 }}
                style={{ background: "var(--wtb-surface-raised)", border: "2px solid #ffffff", color: "var(--wtb-text)", marginBottom: 8, width: "100%", textAlign: "left" }}
                title="Drag to add a location / travel block"
              >
                <span>Location / Travel</span>
                <span style={{ fontSize: 12, color: "var(--wtb-text-muted)", fontWeight: "bold", marginLeft: "16px", whiteSpace: "nowrap" }}>15 min</span>
              </DraggableSidebarBlock>
              {(() => {
                const groups = [];
                const groupMap = {};
                EVENT_BLOCKS.forEach(block => {
                  const [label, duration] = block.split("::");
                  const sep = label.indexOf(": ");
                  const category  = sep !== -1 ? label.substring(0, sep) : label;
                  const shortLabel = sep !== -1 ? label.substring(sep + 2) : label;
                  if (!groupMap[category]) { groupMap[category] = []; groups.push(category); }
                  groupMap[category].push({ label, shortLabel, dur: parseInt(duration, 10), block });
                });
                return groups.map(category => {
                  const categoryColor = getEventColor(groupMap[category][0].label);
                  return (
                    <div key={category} style={{ marginBottom: 8, breakInside: "avoid", WebkitColumnBreakInside: "avoid" }}>
                      <div style={{ fontSize: 10, color: categoryColor, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4, paddingTop: 6, borderTop: "1px solid var(--wtb-border-subtle)", fontFamily: "'Jost', sans-serif", fontWeight: 400, textAlign: "center" }}>{category}</div>
                      {groupMap[category].map(({ label, shortLabel, dur, block }) => (
                        <DraggableSidebarBlock
                          key={block}
                          id={`sidebar-${block}`}
                          data={{ event: label, duration: dur }}
                          style={{ background: "var(--wtb-surface-raised)", border: `2px solid ${getEventColor(label)}`, color: "var(--wtb-text)", width: "100%", textAlign: "left" }}
                          title="Drag to timeline"
                        >
                          <span>{shortLabel}</span>
                          <span style={{ fontSize: 12, color: "var(--wtb-text-muted)", fontWeight: "bold", marginLeft: "16px", whiteSpace: "nowrap" }}>{dur} min</span>
                        </DraggableSidebarBlock>
                      ))}
                    </div>
                  );
                });
              })()}
            </div>
        </>
      </aside>
    </div>
  );
}

export { EventSidebar };
