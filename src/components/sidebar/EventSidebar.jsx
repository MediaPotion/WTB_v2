import React, { useState } from "react";
import { EVENT_BLOCKS } from "../../constants/events";
import { getEventColor } from "../../constants/colors";
import { TimelinePreview } from "../../lib/exportPdf";
import { DraggableSidebarBlock } from "./DraggableSidebarBlock";

function EventSidebar({ rows, bride, groom, date, photoStartHour, photoStartMinute, photoStartPeriod, photoEndHour, photoEndMinute, photoEndPeriod, videoStartHour, videoStartMinute, videoStartPeriod, videoEndHour, videoEndMinute, videoEndPeriod, photoEnabled, videoEnabled }) {
  const [activeTab, setActiveTab] = useState('blocks');
  const previewProps = { rows, bride, groom, date, photoStartHour, photoStartMinute, photoStartPeriod, photoEndHour, photoEndMinute, photoEndPeriod, videoStartHour, videoStartMinute, videoStartPeriod, videoEndHour, videoEndMinute, videoEndPeriod, photoEnabled, videoEnabled };
  return (
    <div className="wtb-sidebar-wrap">
      <aside className="wtb-sidebar" style={{ overflow: activeTab === 'preview' ? 'hidden' : 'auto', display: 'flex', flexDirection: 'column' }}>
        <div className="wtb-tabs">
          <button className={`wtb-tab-btn${activeTab === 'blocks' ? ' active' : ''}`} onClick={() => setActiveTab('blocks')}>Event Blocks</button>
          <button className={`wtb-tab-btn${activeTab === 'preview' ? ' active' : ''}`} onClick={() => setActiveTab('preview')}>Preview</button>
        </div>

        {activeTab === 'blocks' ? (
          <>
            <div className="wtb-side-note">Drag a block onto a row</div>
            <div className="wtb-palette">
              {/* Location / Travel block */}
              <div style={{ fontSize: 10, color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4, fontFamily: "'Jost', sans-serif", fontWeight: 400 }}>Travel</div>
              <DraggableSidebarBlock
                id="sidebar-location"
                data={{ type: "location", event: "", duration: 15 }}
                style={{ background: "#161310", border: "2px solid #ffffff", color: "#ddd0bc", marginBottom: 8, width: "100%", textAlign: "left" }}
                title="Drag to add a location / travel block"
              >
                <span>Location / Travel</span>
                <span style={{ fontSize: 12, color: "#6e6358", fontWeight: "bold", marginLeft: "16px", whiteSpace: "nowrap" }}>15 min</span>
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
                      <div style={{ fontSize: 10, color: categoryColor, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4, paddingTop: 6, borderTop: "1px solid #1e1c19", fontFamily: "'Jost', sans-serif", fontWeight: 400, textAlign: "center" }}>{category}</div>
                      {groupMap[category].map(({ label, shortLabel, dur, block }) => (
                        <DraggableSidebarBlock
                          key={block}
                          id={`sidebar-${block}`}
                          data={{ event: label, duration: dur }}
                          style={{ background: "#161310", border: `2px solid ${getEventColor(label)}`, color: "#ddd0bc", width: "100%", textAlign: "left" }}
                          title="Drag to timeline"
                        >
                          <span>{shortLabel}</span>
                          <span style={{ fontSize: 12, color: "#6e6358", fontWeight: "bold", marginLeft: "16px", whiteSpace: "nowrap" }}>{dur} min</span>
                        </DraggableSidebarBlock>
                      ))}
                    </div>
                  );
                });
              })()}
            </div>
          </>
        ) : (
          <TimelinePreview {...previewProps} />
        )}
      </aside>
    </div>
  );
}

export { EventSidebar };
