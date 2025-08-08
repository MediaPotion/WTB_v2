import React, { useState, useEffect } from "react";
import MobileApp from "./MobileApp";
import DesktopApp from "./DesktopApp";
import { mediadatabase } from './mediadatabase.js';

// Simple on/off variable for mobile version
const MOBILE_ENABLED = false; // Set to true to enable mobile version, false to disable

function useScreenWidth(breakpoint = 768) {
  const [isMobileScreen, setIsMobileScreen] = useState(
    window.innerWidth < breakpoint
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < breakpoint);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobileScreen;
}

export default function App() {
  const isMobileScreen = useScreenWidth();
  const [manualOverride, setManualOverride] = useState(null); // null | 'mobile' | 'desktop'

  // If mobile is disabled, always use desktop regardless of screen size or manual override
  const isMobile = MOBILE_ENABLED && (
    manualOverride === "mobile"
      ? true
      : manualOverride === "desktop"
      ? false
      : isMobileScreen
  );

  const toggleOverride = () => {
    if (!MOBILE_ENABLED) return; // Don't allow toggle if mobile is disabled
    
    setManualOverride((prev) => {
      if (prev === "mobile") return "desktop";
      if (prev === "desktop") return "mobile";
      return isMobileScreen ? "desktop" : "mobile"; // first manual toggle
    });
  };

  const buttonLabel = isMobile
    ? "Switch to Desktop Version"
    : "Switch to Mobile Version";

  return (
    <div>
      {/* Only show the toggle button if mobile is enabled */}
      {MOBILE_ENABLED && (
        <div style={{ width: "100%", textAlign: "center", margin: "10px 0" }}>
          <button
            onClick={toggleOverride}
            style={{
              padding: "8px 16px",
              backgroundColor: "#333",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            {buttonLabel}
          </button>
        </div>
      )}

      {isMobile ? <MobileApp /> : <DesktopApp />}
    </div>
  );
}