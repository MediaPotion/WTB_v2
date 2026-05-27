import React, { useState, useEffect, useMemo, useRef } from "react";
import mediaPotionLogo from "../assets/mediapotion_logo.png";
import { MOBILE_TWEAKS, SETTINGS_SELECT_STYLE } from "../constants/styles";
import { THEME_CSS } from "../constants/theme";
import { useTheme } from "../hooks/useTheme";
import { ThemeToggle } from "../components/ThemeToggle";
import { SETTINGS_WIZARD_TABS, PROJECT_VERSION, AUTOSAVE_KEY, DESKTOP_MIN_WIDTH } from "../constants/wizard";
import { DEFAULT_ROW_TIER_FIELDS } from "../constants/tiers";
import { getDefaultTierForEvent } from "../lib/rowTier";
import { defaultIsOutdoorForEvent } from "../constants/colors";
import { formatTime, parseTimeInput, computeTimelineCoverage, TimelineCoverageCounter, useMediaQuery } from "../lib/time";
import { computeOverlaps } from "../lib/overlaps";
import { generateTimeline as generateTimelineLib } from "../lib/generateTimeline";
import { buildWizardAnswers } from "../lib/buildWizardAnswers";
import { geocodeCeremonyLocation } from "../lib/goldenHour";
import { exportTimeline as exportTimelineLib, copyTimeline as copyTimelineLib } from "../lib/exportTxt";
import { exportPDF as exportPDFLib, printTimeline as printTimelineLib, TimelinePreview } from "../lib/exportPdf";
import { useProjectStorage } from "../hooks/useProjectStorage";
import { RowDropZone } from "../components/timeline/RowDropZone";
import { SortableTimelineRow } from "../components/timeline/SortableTimelineRow";
import { TimelineDndProvider } from "../components/timeline/TimelineDnd";
import { EventBlockSelector } from "../components/timeline/EventBlockSelector";
import { EventSidebar } from "../components/sidebar/EventSidebar";
import { WelcomeScreen } from "./WelcomeScreen";
import { renderWizard } from "./WizardScreen";
import { WizardLogisticsCheck } from "../components/wizard/WizardLogisticsCheck";
import { LogisticsCheckButton } from "../components/timeline/LogisticsCheckButton";
import { getLogisticsStatus } from "../lib/logisticsStatus";
import { wizSectionHeading, wizToggleStyle, wizCheckRowStyle } from "../components/wizard/wizardUi";

export default function MobileApp() {
  const { theme, toggleTheme } = useTheme();
  const isDesktop = useMediaQuery(DESKTOP_MIN_WIDTH);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileMainTab, setMobileMainTab] = useState("timeline"); // "timeline" | "preview" (mobile only)
  const [date, setDate] = useState("");
  const [bride, setBride] = useState("");
  const [groom, setGroom] = useState("");
  const [brideLabel, setBrideLabel] = useState("Bride");
  const [groomLabel, setGroomLabel] = useState("Groom");
  const withThe = (label) => (label === "Bride" || label === "Groom") ? `the ${label}` : label;

  // Defaults: 12:00 PM starts
  const [photoStartHour, setPhotoStartHour] = useState("12");
  const [photoStartMinute, setPhotoStartMinute] = useState("00");
  const [photoStartPeriod, setPhotoStartPeriod] = useState("PM");
  const [photoEndHour, setPhotoEndHour] = useState("5");
  const [photoEndMinute, setPhotoEndMinute] = useState("00");
  const [photoEndPeriod, setPhotoEndPeriod] = useState("PM");

  const [videoStartHour, setVideoStartHour] = useState("12");
  const [videoStartMinute, setVideoStartMinute] = useState("00");
  const [videoStartPeriod, setVideoStartPeriod] = useState("PM");
  const [videoEndHour, setVideoEndHour] = useState("5");
  const [videoEndMinute, setVideoEndMinute] = useState("00");
  const [videoEndPeriod, setVideoEndPeriod] = useState("PM");

  // Coverage toggles
  const [photoEnabled, setPhotoEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  // Screen & modal state
  const [screen, setScreen] = useState("welcome"); // "welcome" | "wizard" | "settings" | "timeline"
  const [enteredViaWizard, setEnteredViaWizard] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState(0);

  // Fixed-time events (Project Settings)
  const [fixedEvents, setFixedEvents] = useState([
    { id: 1, event: "Ceremony", timeHour: "3", timeMinute: "00", timePeriod: "PM", duration: 30 },
  ]);
  const [fixedEventNextId, setFixedEventNextId] = useState(2);

  // Rows
  const [userRows, setUserRows] = useState([
    {
      id: 1,
      location: "",
      time: 12 * 60,
      event: "",
      duration: 30,
      isOutdoor: false,
      photo: true,
      video: true,
      notes: "",
      isTimeLocked: false,
      color: "",
      ...DEFAULT_ROW_TIER_FIELDS,
    },
  ]);
  const latestUserRowsRef = useRef(null);
  const beforeEditSnapshotRef = useRef(null);
  const [nextId, setNextId] = useState(2);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [copyConfirm, setCopyConfirm] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);
  const mobileGearMenuRef = useRef(null);
  const mainScrollRef = useRef(null);
  const [showEventSelector, setShowEventSelector] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
  const [showLogisticsModal, setShowLogisticsModal] = useState(false);
  const [showAutosaveBanner, setShowAutosaveBanner] = useState(false);
  const [versionNotice, setVersionNotice] = useState(null);
  const isDirtyRef = useRef(false);
  const isApplyingProjectRef = useRef(false);
  const dirtyTrackingEnabledRef = useRef(false);
  const suppressDirtyRef = useRef(false);
  const autosaveTimerRef = useRef(null);

  // ---- Wizard State ----
  const [wizardStep, setWizardStep] = useState(1);

  // Step 1 — Locations
  const [wiz_locations, setWiz_locations] = useState([]);
  const [wiz_locationNextId, setWiz_locationNextId] = useState(1);

  // Step 2 — Locations (mandatory venue fields)
  const [wiz_receptionVenue, setWiz_receptionVenue] = useState("");
  const [wiz_receptionAddress, setWiz_receptionAddress] = useState("");
  const [wiz_receptionSameAsCeremony, setWiz_receptionSameAsCeremony] = useState(false);

  // Step 1 — Wedding Details (reuses: date, bride, groom, brideLabel, groomLabel)

  // Step 3 (formerly Step 2) — Ceremony
  const [wiz_ceremonyHour, setWiz_ceremonyHour] = useState("3");
  const [wiz_ceremonyMinute, setWiz_ceremonyMinute] = useState("00");
  const [wiz_ceremonyPeriod, setWiz_ceremonyPeriod] = useState("PM");
  const [wiz_ceremonyDuration, setWiz_ceremonyDuration] = useState(30);
  const [wiz_ceremonyType, setWiz_ceremonyType] = useState("average");
  const [wiz_ceremonyOtherDuration, setWiz_ceremonyOtherDuration] = useState(30);
  const [wiz_ceremonyFlexHard, setWiz_ceremonyFlexHard] = useState(true);
  const [wiz_ceremonyFlexMinutes, setWiz_ceremonyFlexMinutes] = useState(30);
  const [wiz_receptionFlexHard, setWiz_receptionFlexHard] = useState(true);
  const [wiz_receptionFlexMinutes, setWiz_receptionFlexMinutes] = useState(30);
  const [wiz_dinnerFlexHard, setWiz_dinnerFlexHard] = useState(true);
  const [wiz_dinnerFlexMinutes, setWiz_dinnerFlexMinutes] = useState(30);
  const [wiz_ceremonyVenue, setWiz_ceremonyVenue] = useState("");
  const [wiz_ceremonyAddress, setWiz_ceremonyAddress] = useState("");
  const [wiz_venueLat, setWiz_venueLat] = useState(null);
  const [wiz_venueLng, setWiz_venueLng] = useState(null);
  const [wiz_venueUtcOffset, setWiz_venueUtcOffset] = useState(null);
  const [wiz_geocodeSuccess, setWiz_geocodeSuccess] = useState(null);
  const [wiz_fallbackLat, setWiz_fallbackLat] = useState("");
  const [wiz_fallbackLng, setWiz_fallbackLng] = useState("");
  const [wiz_guestCount, setWiz_guestCount] = useState("");
  const [wiz_portraitLocations, setWiz_portraitLocations] = useState([]);
  const [wiz_brideReadyAddress, setWiz_brideReadyAddress] = useState("");
  const [wiz_brideReadyStreet, setWiz_brideReadyStreet] = useState("");
  const [wiz_groomReadyAddress, setWiz_groomReadyAddress] = useState("");
  const [wiz_groomReadyStreet, setWiz_groomReadyStreet] = useState("");
  const [wiz_distanceBetweenReady, setWiz_distanceBetweenReady] = useState("");
  const [wiz_distanceBrideToCeremony, setWiz_distanceBrideToCeremony] = useState("");
  const [wiz_distanceGroomToCeremony, setWiz_distanceGroomToCeremony] = useState("");
  const [wiz_distanceReceptionToCeremony, setWiz_distanceReceptionToCeremony] = useState("");
  const [wiz_sameLocation, setWiz_sameLocation] = useState(null); // null | true | false
  const [wiz_portraitsAtReadyLocations, setWiz_portraitsAtReadyLocations] = useState(false);
  const [wiz_bridePortraitsAtReadyLocation, setWiz_bridePortraitsAtReadyLocation] = useState(false);
  const [wiz_groomPortraitsAtReadyLocation, setWiz_groomPortraitsAtReadyLocation] = useState(false);
  const [wiz_hairMakeupDoneHour, setWiz_hairMakeupDoneHour] = useState("12");
  const [wiz_hairMakeupDoneMinute, setWiz_hairMakeupDoneMinute] = useState("00");
  const [wiz_hairMakeupDonePeriod, setWiz_hairMakeupDonePeriod] = useState("PM");
  const [wiz_photoCoverageHours, setWiz_photoCoverageHours] = useState("");
  const [wiz_videoCoverageHours, setWiz_videoCoverageHours] = useState("");
  const [wiz_ceremonyOutdoor, setWiz_ceremonyOutdoor] = useState(false);

  // Step 3 — Package Inclusions
  const [wiz_photographerCount, setWiz_photographerCount] = useState(1);
  const [wiz_videographerCount, setWiz_videographerCount] = useState(1);
  const [wiz_drone, setWiz_drone] = useState(false);
  const [wiz_narration, setWiz_narration] = useState(false);

  // Step 6 — First Looks
  const [wiz_hasFirstLooks, setWiz_hasFirstLooks] = useState(null); // null|true|false
  const [wiz_firstLookGroom, setWiz_firstLookGroom] = useState(false);
  const [wiz_firstLookParent, setWiz_firstLookParent] = useState(false);
  const [wiz_firstLookBridesmaids, setWiz_firstLookBridesmaids] = useState(false);
  const [wiz_firstLookOther, setWiz_firstLookOther] = useState(false);
  const [wiz_firstLookGroomLocation, setWiz_firstLookGroomLocation] = useState("");
  const [wiz_firstLookParentLocation, setWiz_firstLookParentLocation] = useState("");
  const [wiz_firstLookBridesmaidsLocation, setWiz_firstLookBridesmaidsLocation] = useState("");
  const [wiz_firstLookOtherLocation, setWiz_firstLookOtherLocation] = useState("");

  // Step 7 — Pre-Ceremony Visibility (skipped if wiz_firstLookGroom is true)
  const [wiz_brideOkayBefore, setWiz_brideOkayBefore] = useState(null); // null|true|false

  // Step 9 — Reception
  const [wiz_receptionHour, setWiz_receptionHour] = useState("6");
  const [wiz_receptionMinute, setWiz_receptionMinute] = useState("00");
  const [wiz_receptionPeriod, setWiz_receptionPeriod] = useState("PM");
  const [wiz_grandEntrance, setWiz_grandEntrance] = useState(true);
  const [wiz_cakeCutting, setWiz_cakeCutting] = useState(true);
  const [wiz_firstDance, setWiz_firstDance] = useState(true);
  const [wiz_brideParentDance, setWiz_brideParentDance] = useState(true);
  const [wiz_groomParentDance, setWiz_groomParentDance] = useState(true);
  const [wiz_specialDance, setWiz_specialDance] = useState(false);
  const [wiz_speeches, setWiz_speeches] = useState(true);
  const [wiz_speechCount, setWiz_speechCount] = useState(3);
  const [wiz_dinner, setWiz_dinner] = useState(true);
  const [wiz_dinnerStartHour, setWiz_dinnerStartHour] = useState("7");
  const [wiz_dinnerStartMinute, setWiz_dinnerStartMinute] = useState("00");
  const [wiz_dinnerStartPeriod, setWiz_dinnerStartPeriod] = useState("PM");
  const [wiz_dinnerStyle, setWiz_dinnerStyle] = useState(null);
  const [wiz_dinnerFlexibility, setWiz_dinnerFlexibility] = useState(0);
  const [wiz_receptionStartFlexibility, setWiz_receptionStartFlexibility] = useState(0);
  const [wiz_appliedLogisticsSuggestions, setWiz_appliedLogisticsSuggestions] = useState([]);
  const [wiz_openDanceFloor, setWiz_openDanceFloor] = useState(true);
  const [wiz_garterToss, setWiz_garterToss] = useState(false);
  const [wiz_bouquetToss, setWiz_bouquetToss] = useState(false);
  const [wiz_familyGroups, setWiz_familyGroups] = useState("5"); // "5"|"10"|"none"
  const [wiz_familyGroupNames, setWiz_familyGroupNames] = useState([]);

  // Step 2 — Getting ready location checkboxes
  const [wiz_brideReadyAtCeremony, setWiz_brideReadyAtCeremony] = useState(false);
  const [wiz_brideReadyAtReception, setWiz_brideReadyAtReception] = useState(false);
  const [wiz_groomReadyAtCeremony, setWiz_groomReadyAtCeremony] = useState(false);
  const [wiz_groomReadyAtReception, setWiz_groomReadyAtReception] = useState(false);
  const [wiz_groomReadyAtBride, setWiz_groomReadyAtBride] = useState(false);

  // Step 4 — Pre-ceremony shot types
  const [wiz_preCeremonyBrideReady, setWiz_preCeremonyBrideReady] = useState(true);
  const [wiz_preCeremonyGroomReady, setWiz_preCeremonyGroomReady] = useState(true);
  const [wiz_preCeremonyDetails, setWiz_preCeremonyDetails] = useState(true);
  const [wiz_preCeremonyBrideParty, setWiz_preCeremonyBrideParty] = useState(true);
  const [wiz_preCeremonyGroomParty, setWiz_preCeremonyGroomParty] = useState(true);
  const [wiz_preCeremonyPreDress, setWiz_preCeremonyPreDress] = useState(false);
  const [wiz_preCeremonyDetailRings, setWiz_preCeremonyDetailRings] = useState(true);
  const [wiz_preCeremonyDetailDress, setWiz_preCeremonyDetailDress] = useState(true);
  const [wiz_preCeremonyDetailDrone, setWiz_preCeremonyDetailDrone] = useState(true);
  const [wiz_narrationBride, setWiz_narrationBride] = useState(true);
  const [wiz_narrationGroom, setWiz_narrationGroom] = useState(true);
  const [wiz_hasPreCeremonyHardStarts, setWiz_hasPreCeremonyHardStarts] = useState(false);
  const [wiz_preCeremonyHardStarts, setWiz_preCeremonyHardStarts] = useState([]);
  const [wiz_preCeremonyHardStartNextId, setWiz_preCeremonyHardStartNextId] = useState(1);
  const [wiz_standardPerson1Solo, setWiz_standardPerson1Solo] = useState(true);
  const [wiz_standardPerson2Solo, setWiz_standardPerson2Solo] = useState(true);
  const [wiz_standardBridePartyPortraits, setWiz_standardBridePartyPortraits] = useState(true);
  const [wiz_standardGroomPartyPortraits, setWiz_standardGroomPartyPortraits] = useState(true);
  const [wiz_standardWeddingPartyShots, setWiz_standardWeddingPartyShots] = useState(true);
  const [wiz_standardCouplePortraits, setWiz_standardCouplePortraits] = useState(true);
  const [wiz_includeGoldenHour, setWiz_includeGoldenHour] = useState(true);
  const [wiz_portraitLocationNextId, setWiz_portraitLocationNextId] = useState(1);
  const [wiz_speechMinutesPerSpeaker, setWiz_speechMinutesPerSpeaker] = useState(10);

  // Step 5 — Ceremony special events notes
  const [wiz_ceremonyNotes, setWiz_ceremonyNotes] = useState("");

  // Step 6 — Custom first looks (array of {id, label, location})
  const [wiz_customFirstLooks, setWiz_customFirstLooks] = useState([]);
  const [wiz_customFirstLookNextId, setWiz_customFirstLookNextId] = useState(1);

  // Step 8 — Portrait Sessions (array of {id, type, location})
  const [wiz_portraitSessions, setWiz_portraitSessions] = useState([]);
  const [wiz_portraitSessionNextId, setWiz_portraitSessionNextId] = useState(1);

  // Step 9 — Reception additions
  const [wiz_grandEntranceSub, setWiz_grandEntranceSub] = useState("couple"); // "full" | "couple"
  const [wiz_customReceptionEvents, setWiz_customReceptionEvents] = useState([]);
  const [wiz_customReceptionEventNextId, setWiz_customReceptionEventNextId] = useState(1);
  const [wiz_logisticsEventAdjustments, setWiz_logisticsEventAdjustments] = useState({});

  const isTimelineEmpty = () => {
    const hasRowContent = userRows.some(
      (r) =>
        (r.event && r.event.trim()) ||
        (r.location && r.location.trim()) ||
        (r.notes && r.notes.trim())
    );
    const hasMeta = !!(
      String(date || "").trim() ||
      String(bride || "").trim() ||
      String(groom || "").trim()
    );
    return !hasRowContent && !hasMeta;
  };

  const clearDirty = () => {
    setIsDirty(false);
    isDirtyRef.current = false;
  };

  const { buildDefaultFilename, clearAutosave, saveProject, loadProject, restoreAutosave, flushAutosave } = useProjectStorage({
    date, bride, groom, brideLabel, groomLabel,
    photoStartHour, photoStartMinute, photoStartPeriod,
    photoEndHour, photoEndMinute, photoEndPeriod,
    videoStartHour, videoStartMinute, videoStartPeriod,
    videoEndHour, videoEndMinute, videoEndPeriod,
    photoEnabled, videoEnabled,
    userRows, fixedEvents, screen, nextId, enteredViaWizard,
    setDate, setBride, setGroom, setBrideLabel, setGroomLabel,
    setPhotoStartHour, setPhotoStartMinute, setPhotoStartPeriod,
    setPhotoEndHour, setPhotoEndMinute, setPhotoEndPeriod,
    setVideoStartHour, setVideoStartMinute, setVideoStartPeriod,
    setVideoEndHour, setVideoEndMinute, setVideoEndPeriod,
    setPhotoEnabled, setVideoEnabled,
    setUserRows, setNextId, setFixedEvents, setHistory, setRedoStack,
    setScreen, setEnteredViaWizard, setVersionNotice, setShowAutosaveBanner,
    clearDirty, isTimelineEmpty, mainScrollRef,
    isApplyingProjectRef, suppressDirtyRef, dirtyTrackingEnabledRef,
    autosaveTimerRef,
  });

  const exportParams = {
    userRows, bride, groom, date,
    photoStartHour, photoStartMinute, photoStartPeriod,
    photoEndHour, photoEndMinute, photoEndPeriod,
    videoStartHour, videoStartMinute, videoStartPeriod,
    videoEndHour, videoEndMinute, videoEndPeriod,
    buildDefaultFilename,
    setCopyConfirm,
    setExporting,
    setShowExportMenu,
    closeMobileGearMenu: () => setShowMobileMenu(false),
    photoEnabled,
    videoEnabled,
  };


  const rows = useMemo(() => {
    return [...userRows].sort((a, b) => a.time - b.time);
  }, [userRows]);

  const sortableRowIds = useMemo(() => rows.map((r) => String(r.id)), [rows]);

  const overlapMap = useMemo(() => computeOverlaps(userRows), [userRows]);
  const timelineCoverage = useMemo(() => computeTimelineCoverage(rows), [rows]);

  useEffect(() => {
    if (isDesktop) {
      setShowMobileMenu(false);
      setMobileMainTab("timeline");
    } else {
      setShowExportMenu(false);
    }
  }, [isDesktop]);

  useEffect(() => {
    dirtyTrackingEnabledRef.current = screen !== "welcome";
  }, [screen]);

  useEffect(() => {
    if (screen !== "welcome") return;
    try {
      setShowAutosaveBanner(!!localStorage.getItem(AUTOSAVE_KEY));
    } catch (_) {
      setShowAutosaveBanner(false);
    }
  }, [screen]);

  useEffect(() => {
    if (!dirtyTrackingEnabledRef.current || isApplyingProjectRef.current || suppressDirtyRef.current) {
      return;
    }
    if (isTimelineEmpty()) {
      clearDirty();
      return;
    }
    setIsDirty(true);
    isDirtyRef.current = true;
  }, [
    userRows,
    fixedEvents,
    date,
    bride,
    groom,
    brideLabel,
    groomLabel,
    photoStartHour,
    photoStartMinute,
    photoStartPeriod,
    photoEndHour,
    photoEndMinute,
    photoEndPeriod,
    videoStartHour,
    videoStartMinute,
    videoStartPeriod,
    videoEndHour,
    videoEndMinute,
    videoEndPeriod,
    photoEnabled,
    videoEnabled,
    screen,
    nextId,
  ]);

  useEffect(() => {
    const handler = (e) => {
      if (isDirtyRef.current && !isTimelineEmpty()) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty, userRows, date, bride, groom]);

  // Preserve existing times by default; only the chain action should advance times
  const recalculateTimes = (rowsIn, startIndex = 0) => {
    return [...rowsIn];
  };

  const saveToHistory = (newUserRows) => {
    if (JSON.stringify(newUserRows) === JSON.stringify(userRows)) return;
    setHistory((prev) => [...prev.slice(-11), userRows]);
    setRedoStack([]);
    setUserRows(newUserRows);
  };


  const handleChange = (displayIndex, field, value) => {
    if (beforeEditSnapshotRef.current === null) {
      beforeEditSnapshotRef.current = userRows.map(r => ({ ...r })); // deep-enough clone before any mutation
    }
    const row = rows[displayIndex];
    const userRowIndex = userRows.findIndex((userRow) => userRow.id === row.id);
    if (userRowIndex === -1) return;

    const newUserRows = [...userRows];

    if (field === "duration") {
      const newDuration = parseInt(value, 10) || 0;
      newUserRows[userRowIndex] = { ...newUserRows[userRowIndex], duration: newDuration };

      const sortedRows = [...newUserRows].sort((a, b) => a.time - b.time);
      const sortedIndex = sortedRows.findIndex(
        (r) => r.id === newUserRows[userRowIndex].id
      );
      const recalculated = recalculateTimes(sortedRows, sortedIndex);

      recalculated.forEach((recalcRow, i) => {
        const originalIndex = newUserRows.findIndex(
          (r) => r.id === sortedRows[i].id
        );
        if (originalIndex !== -1) {
          newUserRows[originalIndex] = { ...recalcRow, isTimeLocked: newUserRows[originalIndex].isTimeLocked };
        }
      });
      setUserRows(newUserRows);
      latestUserRowsRef.current = newUserRows;
      return;
    }

    const updates = { [field]: value };
    if (field === "event" && defaultIsOutdoorForEvent(value) !== undefined) {
      updates.isOutdoor = defaultIsOutdoorForEvent(value);
    }
    newUserRows[userRowIndex] = { ...newUserRows[userRowIndex], ...updates };
    setUserRows(newUserRows);
    latestUserRowsRef.current = newUserRows;
  };

  const handleBlur = () => {
    const snapshot = beforeEditSnapshotRef.current;
    const latest = latestUserRowsRef.current;
    beforeEditSnapshotRef.current = null;
    if (snapshot !== null && latest !== null && JSON.stringify(latest) !== JSON.stringify(snapshot)) {
      setHistory(prev => [...prev.slice(-11), snapshot]);
      setRedoStack([]);
    }
  };

  const handleDelete = (displayIndex) => {
    const row = rows[displayIndex];
    const userRowIndex = userRows.findIndex((u) => u.id === row.id);
    if (userRowIndex === -1) return;

    const newUserRows = userRows.filter((_, idx) => idx !== userRowIndex);

    if (newUserRows.length === 0) {
      saveToHistory(newUserRows);
      return;
    }

    // Identify ceremony block
    const isCeremony = (r) => r.event === "Ceremony: Average" || r.event === "Ceremony: Catholic";
    const ceremonyRow = newUserRows.find(isCeremony);

    // No ceremony in timeline, or the ceremony itself was deleted — no anchor logic
    if (!ceremonyRow || isCeremony(row)) {
      saveToHistory(newUserRows);
      return;
    }

    const ceremonyTime = ceremonyRow.time;
    const ceremonyEnd = ceremonyTime + ceremonyRow.duration;
    const sorted = [...newUserRows].sort((a, b) => a.time - b.time);

    if (row.time < ceremonyTime) {
      // Pre-ceremony deletion: cascade backwards from ceremony start so blocks shift later
      const pre  = sorted.filter(r => r.time < ceremonyTime);
      const rest = sorted.filter(r => r.time >= ceremonyTime); // ceremony + post, untouched

      let t = ceremonyTime;
      const newPre = [...pre].reverse().map(r => {
        t -= r.duration;
        return { ...r, time: t };
      }).reverse();

      const result = [...newPre, ...rest];
      saveToHistory(newUserRows.map(ur => result.find(r => r.id === ur.id) || ur));
    } else {
      // Post-ceremony deletion: cascade forwards from ceremony end so blocks shift earlier
      const preAndCeremony = sorted.filter(r => r.time <= ceremonyTime); // untouched
      const post = sorted.filter(r => r.time > ceremonyTime);

      let t = ceremonyEnd;
      const newPost = post.map(r => {
        const updated = { ...r, time: t };
        t += r.duration;
        return updated;
      });

      const result = [...preAndCeremony, ...newPost];
      saveToHistory(newUserRows.map(ur => result.find(r => r.id === ur.id) || ur));
    }
  };

  // Cascade all pre- or post-ceremony blocks around the ceremony anchor.
  // insertedRowTime determines which side to cascade; only that side is recalculated.
  const applyCeremonyAnchorCascade = (rows, insertedRowTime) => {
    const isCeremony = (r) => r.event === "Ceremony: Average" || r.event === "Ceremony: Catholic";
    const ceremonyRow = rows.find(isCeremony);
    if (!ceremonyRow) return rows; // no anchor — return unchanged

    const ceremonyTime = ceremonyRow.time;
    const ceremonyEnd  = ceremonyTime + ceremonyRow.duration;
    const sorted = [...rows].sort((a, b) => a.time - b.time);

    if (insertedRowTime < ceremonyTime) {
      // Pre-ceremony: cascade backwards from ceremony start (day starts earlier)
      const pre  = sorted.filter(r => r.id !== ceremonyRow.id && r.time < ceremonyTime);
      const rest = sorted.filter(r => r.id === ceremonyRow.id || r.time >= ceremonyTime);
      let t = ceremonyTime;
      const newPre = [...pre].reverse().map(r => { t -= r.duration; return { ...r, time: t }; }).reverse();
      const result = [...newPre, ...rest];
      return rows.map(r => result.find(u => u.id === r.id) || r);
    } else {
      // Post-ceremony: cascade forwards from ceremony end (blocks shift later)
      const preAndCeremony = sorted.filter(r => r.id === ceremonyRow.id || r.time <= ceremonyTime);
      const post = sorted.filter(r => r.id !== ceremonyRow.id && r.time > ceremonyTime);
      let t = ceremonyEnd;
      const newPost = post.map(r => { const u = { ...r, time: t }; t += r.duration; return u; });
      const result = [...preAndCeremony, ...newPost];
      return rows.map(r => result.find(u => u.id === r.id) || r);
    }
  };

  // Cascade times based on the visual (array index) order of rows, using the
  // ceremony row as a fixed anchor. Pre-ceremony rows cascade backwards from
  // ceremony start; post-ceremony rows cascade forwards from ceremony end.
  const cascadeTimesByOrder = (orderedRows) => {
    const isCeremony = (r) => r.event === "Ceremony: Average" || r.event === "Ceremony: Catholic";
    const ceremonyIdx = orderedRows.findIndex(isCeremony);
    const result = orderedRows.map(r => ({ ...r }));

    if (ceremonyIdx === -1) {
      // No ceremony anchor — cascade forward from the first row's existing time
      let t = result[0]?.time ?? 0;
      for (let i = 0; i < result.length; i++) {
        if (result[i].isTimeLocked) {
          t = result[i].time + result[i].duration;
        } else {
          result[i].time = t;
          t += result[i].duration;
        }
      }
      return result;
    }

    // Cascade pre-ceremony rows backwards from ceremony start
    let t = result[ceremonyIdx].time;
    for (let i = ceremonyIdx - 1; i >= 0; i--) {
      if (result[i].isTimeLocked) {
        t = result[i].time;
      } else {
        t -= result[i].duration;
        result[i].time = t;
      }
    }

    // Cascade post-ceremony rows forwards from ceremony end
    t = result[ceremonyIdx].time + result[ceremonyIdx].duration;
    for (let i = ceremonyIdx + 1; i < result.length; i++) {
      if (result[i].isTimeLocked) {
        t = result[i].time + result[i].duration;
      } else {
        result[i].time = t;
        t += result[i].duration;
      }
    }

    return result;
  };

  // Chain current row's time to previous row's end time
  const handleChainToPrevious = (index) => {
    if (index === 0) {
      console.warn('[Chain] First row has no previous row to chain to');
      return; // nothing to chain to
    }

    const currentRow = rows[index];
    const previousRow = rows[index - 1];

    const newTime = previousRow.time + previousRow.duration;
    const userRowIndex = userRows.findIndex((r) => r.id === currentRow.id);

    if (userRowIndex !== -1) {
      const timeById = new Map([[currentRow.id, newTime]]);
      let runningTime = newTime + currentRow.duration;
      for (let i = index + 1; i < rows.length; i++) {
        timeById.set(rows[i].id, runningTime);
        runningTime += rows[i].duration;
      }

      const updatedUserRows = userRows.map((r) =>
        timeById.has(r.id) ? { ...r, time: timeById.get(r.id) } : r
      );
      saveToHistory(updatedUserRows);
    }
  };

  const handleMoveUp = (displayIndex) => {
    if (displayIndex === 0) return;
    const currentRow = rows[displayIndex];
    const previousRow = rows[displayIndex - 1];

    // Find the positions of these rows in userRows
    const currentUserIndex = userRows.findIndex(r => r.id === currentRow.id);
    const previousUserIndex = userRows.findIndex(r => r.id === previousRow.id);
    
    if (currentUserIndex === -1 || previousUserIndex === -1) return;

    // Create new userRows array with swapped positions AND times
    const newUserRows = [...userRows];
    
    // Swap the entire rows but also swap their times
    const currentRowCopy = { ...newUserRows[currentUserIndex], time: previousRow.time };
    const previousRowCopy = { ...newUserRows[previousUserIndex], time: currentRow.time };
    
    newUserRows[currentUserIndex] = previousRowCopy;
    newUserRows[previousUserIndex] = currentRowCopy;

    saveToHistory(newUserRows);
  };

  const handleMoveDown = (displayIndex) => {
    if (displayIndex === rows.length - 1) return;
    const currentRow = rows[displayIndex];
    const nextRow = rows[displayIndex + 1];

    // Find the positions of these rows in userRows
    const currentUserIndex = userRows.findIndex(r => r.id === currentRow.id);
    const nextUserIndex = userRows.findIndex(r => r.id === nextRow.id);
    
    if (currentUserIndex === -1 || nextUserIndex === -1) return;

    // Create new userRows array with swapped positions AND times
    const newUserRows = [...userRows];
    
    // Swap the entire rows but also swap their times
    const currentRowCopy = { ...newUserRows[currentUserIndex], time: nextRow.time };
    const nextRowCopy = { ...newUserRows[nextUserIndex], time: currentRow.time };
    
    newUserRows[currentUserIndex] = nextRowCopy;
    newUserRows[nextUserIndex] = currentRowCopy;

    saveToHistory(newUserRows);
  };

  const handleEventClick = (index) => {
    setSelectedRowIndex(index);
    setShowEventSelector(true);
  };

  // Handle selecting an event from the EventBlockSelector
  const handleEventSelect = (eventData) => {
    if (selectedRowIndex !== null && eventData) {
      const displayRow = rows[selectedRowIndex];
      const userRowIndex = userRows.findIndex((u) => u.id === displayRow.id);
      if (userRowIndex !== -1) {
        const newUserRows = [...userRows];
        const outdoorDefault = defaultIsOutdoorForEvent(eventData.event);
        newUserRows[userRowIndex] = {
          ...newUserRows[userRowIndex],
          event: eventData.event,
          duration: eventData.duration,
          ...(eventData.time !== undefined ? { time: eventData.time } : {}),
          ...(outdoorDefault !== undefined ? { isOutdoor: outdoorDefault } : {}),
        };

        // Recalculate subsequent times starting from this row in display order
        const sortedRows = [...newUserRows].sort((a, b) => a.time - b.time);
        const sortedIndex = sortedRows.findIndex((r) => r.id === newUserRows[userRowIndex].id);
        const recalculated = recalculateTimes(sortedRows, sortedIndex);

        // Map recalculated times back to original order
        recalculated.forEach((recalcRow, i) => {
          const originalIndex = newUserRows.findIndex((r) => r.id === sortedRows[i].id);
          if (originalIndex !== -1) {
            newUserRows[originalIndex] = recalcRow;
          }
        });

        saveToHistory(newUserRows);
      }
    }

    // Close the selector and reset the selection
    setShowEventSelector(false);
    setSelectedRowIndex(null);
  };

  const handleEventBlur = (displayIndex) => {
    const isBottom = displayIndex === rows.length - 1;
    const hasEvent = rows[displayIndex]?.event?.trim() !== "";
    if (isBottom && hasEvent) addRow();
  };

  // Add a new row at a specific display index
  const addRowAtIndex = (insertIndex) => {
    
    // Determine the intended time for the new row based on display order
    let newTime;
    if (insertIndex === 0) {
      newTime = Math.max(0, (rows[0]?.time || 12 * 60) - 30);
    } else if (insertIndex >= rows.length) {
      const lastRow = rows[rows.length - 1];
      newTime = lastRow ? lastRow.time + lastRow.duration : 12 * 60;
    } else {
      const prevRow = rows[insertIndex - 1];
      const nextRow = rows[insertIndex];
      // Insert between prevRow and nextRow - calculate time between them
      const prevEndTime = prevRow.time + prevRow.duration;
      const nextStartTime = nextRow.time;
      
      // If there's a gap, place it at the previous row's end time
      // If there's no gap (overlapping), place it between the times
      if (prevEndTime <= nextStartTime) {
        newTime = prevEndTime;
      } else {
        // If overlapping, place it halfway between prev start and next start
        newTime = Math.floor((prevRow.time + nextStartTime) / 2);
      }
    }

    const aboveRow = insertIndex > 0 ? rows[insertIndex - 1] : null;

    const newRow = {
      id: nextId,
      location: "",
      time: newTime,
      event: "",
      duration: aboveRow ? aboveRow.duration : 30,
      isOutdoor: false,
      photo: photoEnabled,
      video: videoEnabled,
      notes: "",
      isTimeLocked: false,
      type: "event",
      address: "",
      ...DEFAULT_ROW_TIER_FIELDS,
    };

    // Insert the new row at the correct position based on time order
    const newUserRows = [...userRows];
    
    // Find the correct insertion point in userRows based on time and display order
    let insertPosition = newUserRows.length; // Default to end
    
    // We need to insert based on the intended display position, not just time
    // Find the row that corresponds to rows[insertIndex] (the row we want to insert before)
    if (insertIndex < rows.length) {
      const targetRow = rows[insertIndex]; // The row we want to insert before
      // Find this row in userRows
      for (let i = 0; i < newUserRows.length; i++) {
        if (newUserRows[i].id === targetRow.id) {
          insertPosition = i;
          break;
        }
      }
    }
    
    
    // Insert the new row at the calculated position
    newUserRows.splice(insertPosition, 0, newRow);


    setNextId(nextId + 1);
    saveToHistory(applyCeremonyAnchorCascade(newUserRows, newRow.time));
  };

  // Append a new row at the end of the list
  const addRow = () => addRowAtIndex(rows.length);

  // Apply-to-all toggles
  const handlePhotoToggle = (checked) => {
    setPhotoEnabled(checked);
    setUserRows((prev) => prev.map((r) => ({ ...r, photo: checked })));
  };

  const handleVideoToggle = (checked) => {
    setVideoEnabled(checked);
    setUserRows((prev) => prev.map((r) => ({ ...r, video: checked })));
  };

  // Handle drops from the sidebar onto a specific row (by display index)
  const handleDropEventBlockToRow = (eventData, displayIndex) => {
    if (!eventData || typeof eventData.duration !== "number") return;

    // Translate display index (from rows) to actual userRows index using id mapping
    const displayRow = rows[displayIndex];
    if (!displayRow) return;
    const userRowIndex = userRows.findIndex((u) => u.id === displayRow.id);
    if (userRowIndex === -1) return;

    const outdoorDefault = defaultIsOutdoorForEvent(eventData.event);
    const updatedFields = eventData.type === "location"
      ? { type: "location", event: eventData.event || "", duration: eventData.duration, address: eventData.address || "", color: "" }
      : {
          type: "event",
          event: eventData.event,
          duration: eventData.duration,
          tier: getDefaultTierForEvent(eventData.event),
          flexibilityMinutes: 0,
          ...(outdoorDefault !== undefined ? { isOutdoor: outdoorDefault } : {}),
        };

    const newUserRows = userRows.map((r, i) => i === userRowIndex ? { ...r, ...updatedFields } : r);
    const targetRow = newUserRows[userRowIndex];

    // If dropped on the last visible row, append a fresh empty row
    const droppedOnLastVisible = displayIndex === rows.length - 1;
    if (droppedOnLastVisible) {
      newUserRows.push({
        id: nextId,
        location: "",
        time: targetRow.time + targetRow.duration,
        event: "",
        duration: 30,
        isOutdoor: false,
        photo: photoEnabled,
        video: videoEnabled,
        notes: "",
        isTimeLocked: false,
        type: "event",
        address: "",
        ...DEFAULT_ROW_TIER_FIELDS,
      });
      setNextId(nextId + 1);
    }

    const cascaded = applyCeremonyAnchorCascade(newUserRows, targetRow.time);
    saveToHistory(cascaded);
  };

  const reorderRowAtIndex = (sourceRowId, insertIndex) => {
    const working = [...userRows];
    const sourceIndex = working.findIndex((r) => r.id.toString() === String(sourceRowId));
    if (sourceIndex === -1) return;

    const [moved] = working.splice(sourceIndex, 1);
    let targetIndex = insertIndex;
    if (sourceIndex < insertIndex) targetIndex = Math.max(0, insertIndex - 1);
    working.splice(targetIndex, 0, moved);

    saveToHistory(cascadeTimesByOrder(working));
  };

  const handleTimelineDragComplete = ({ activeId, overId, activeData }) => {
    if (activeData?.type === "sidebar-block") {
      if (overId.startsWith("row-")) {
        const rowId = Number(overId.replace("row-", ""));
        const displayIndex = rows.findIndex((r) => r.id === rowId);
        if (displayIndex >= 0) handleDropEventBlockToRow(activeData.payload, displayIndex);
      }
      return;
    }

    if (activeData?.type === "timeline-row") {
      let insertIndex;
      if (overId.startsWith("between-")) {
        insertIndex = parseInt(overId.replace("between-", ""), 10);
      } else if (overId.startsWith("row-")) {
        const rowId = Number(overId.replace("row-", ""));
        insertIndex = rows.findIndex((r) => r.id === rowId);
      }
      if (insertIndex !== undefined && !Number.isNaN(insertIndex) && insertIndex >= 0) {
        reorderRowAtIndex(activeId, insertIndex);
      }
    }
  };

  const resetTimelineState = ({ emptyRows = false } = {}) => {
    setUserRows(
      emptyRows
        ? []
        : [
            {
              id: 1,
              location: "",
              time: 12 * 60,
              event: "",
              duration: 30,
              isOutdoor: false,
              photo: true,
              video: true,
              notes: "",
              isTimeLocked: false,
              color: "",
              ...DEFAULT_ROW_TIER_FIELDS,
            },
          ]
    );
    setNextId(emptyRows ? 1 : 2);
    setHistory([]);
    setRedoStack([]);
    setFixedEvents([]);
  };

  const resetProjectMetaForNewSession = () => {
    setDate("");
    setBride("");
    setGroom("");
    setBrideLabel("Bride");
    setGroomLabel("Groom");
    setPhotoStartHour("12");
    setPhotoStartMinute("00");
    setPhotoStartPeriod("PM");
    setPhotoEndHour("5");
    setPhotoEndMinute("00");
    setPhotoEndPeriod("PM");
    setVideoStartHour("12");
    setVideoStartMinute("00");
    setVideoStartPeriod("PM");
    setVideoEndHour("5");
    setVideoEndMinute("00");
    setVideoEndPeriod("PM");
    setPhotoEnabled(true);
    setVideoEnabled(true);
    setFixedEventNextId(2);
  };

  const startNewTimeline = () => {
    clearAutosave();
    clearDirty();
    resetTimelineState();
    setEnteredViaWizard(false);
    setShowUnsavedConfirm(false);
    setVersionNotice(null);
    setWizardStep(1);
    setScreen("welcome");
    setShowMobileMenu(false);
  };

  const confirmDiscardAutosaveIfNeeded = () => {
    if (!showAutosaveBanner) return true;
    const discard = window.confirm(
      "You have a saved session from your last visit. Start a new timeline anyway? Your saved session will be discarded."
    );
    if (!discard) return false;
    clearAutosave();
    return true;
  };

  const startManualTimeline = () => {
    if (!confirmDiscardAutosaveIfNeeded()) return;
    clearDirty();
    setEnteredViaWizard(false);
    resetProjectMetaForNewSession();
    resetTimelineState({ emptyRows: true });
    setShowUnsavedConfirm(false);
    setVersionNotice(null);
    setScreen("settings");
  };

  const continueFromProjectSettings = () => {
    if (enteredViaWizard) {
      if (fixedEvents.length > 0) {
        const newRows = fixedEvents.map((fe, idx) => ({
          id: idx + 1,
          event: fe.event,
          time: parseTimeInput(fe.timeHour, fe.timeMinute, fe.timePeriod),
          duration: fe.duration || 30,
          location: "",
          isOutdoor: false,
          photo: photoEnabled,
          video: videoEnabled,
          notes: "",
          isTimeLocked: true,
          color: "",
          tier: getDefaultTierForEvent(fe.event),
          flexibilityMinutes: 0,
        }));
        setUserRows(newRows);
        setNextId(fixedEvents.length + 1);
      }
    } else {
      setUserRows([]);
      setNextId(1);
      setHistory([]);
      setRedoStack([]);
    }
    setScreen("timeline");
    if (mainScrollRef.current) mainScrollRef.current.scrollTop = 0;
  };

  const requestNewTimeline = () => {
    flushAutosave();
    if (!isTimelineEmpty()) {
      setShowUnsavedConfirm(true);
      return;
    }
    startNewTimeline();
  };

  // Wizard location helpers
  const addWizLocation = () => {
    setWiz_locations(prev => [...prev, { id: wiz_locationNextId, name: "", address: "", distFromCeremony: "", distFromReception: "" }]);
    setWiz_locationNextId(n => n + 1);
  };
  const updateWizLocation = (id, field, value) => {
    setWiz_locations(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  };
  const removeWizLocation = (id) => {
    setWiz_locations(prev => prev.filter(l => l.id !== id));
  };

  const closeMobileGearMenu = () => setShowMobileMenu(false);

  // Close export / mobile gear menus when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
      if (mobileGearMenuRef.current && !mobileGearMenuRef.current.contains(e.target)) {
        setShowMobileMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const exportPDF = () => exportPDFLib(exportParams);
  const printTimeline = () => printTimelineLib(exportParams);
  const exportTimeline = () => exportTimelineLib(exportParams);
  const copyTimeline = () => copyTimelineLib(exportParams);

  const undo = () => {
    if (history.length > 0) {
      const newHistory = [...history];
      const previousState = newHistory.pop();
      setRedoStack([userRows, ...redoStack]);
      setUserRows(previousState);
      setHistory(newHistory);
    }
  };
  const redo = () => {
    if (redoStack.length > 0) {
      const newRedoStack = [...redoStack];
      const nextState = newRedoStack.shift();
      setHistory([...history, userRows]);
      setUserRows(nextState);
      setRedoStack(newRedoStack);
    }
  };

  const handleTimeSet = (displayIndex, time) => {
    const row = rows[displayIndex];
    const userRowIndex = userRows.findIndex((u) => u.id === row.id);
    if (userRowIndex === -1) return;

    const newUserRows = userRows.map((r, i) =>
      i === userRowIndex ? { ...r, time } : r
    );
    saveToHistory(newUserRows);
  };

  // ---- Project Settings helpers ----
  const settingsSelectStyle = SETTINGS_SELECT_STYLE;

  const addFixedEvent = (eventName = "", h = "12", m = "00", p = "PM", dur = 30) => {
    setFixedEvents((prev) => [
      ...prev,
      { id: fixedEventNextId, event: eventName, timeHour: h, timeMinute: m, timePeriod: p, duration: dur },
    ]);
    setFixedEventNextId((n) => n + 1);
  };

  const updateFixedEvent = (id, field, value) => {
    setFixedEvents((prev) =>
      prev.map((fe) => (fe.id === id ? { ...fe, [field]: value } : fe))
    );
  };

  const removeFixedEvent = (id) => {
    setFixedEvents((prev) => prev.filter((fe) => fe.id !== id));
  };

  const renderHourOptions = () =>
    ["1","2","3","4","5","6","7","8","9","10","11","12"].map((h) => (
      <option key={h} value={h}>{h}</option>
    ));

  const renderMinuteOptions = () =>
    ["00","05","10","15","20","25","30","35","40","45","50","55"].map((m) => (
      <option key={m} value={m}>{m}</option>
    ));

  const wizardStateForAnswers = () => ({
    date,
    photoEnabled,
    videoEnabled,
    photoStartHour,
    photoStartMinute,
    photoStartPeriod,
    wiz_ceremonyType,
    wiz_ceremonyDuration,
    wiz_ceremonyOtherDuration,
    wiz_ceremonyHour,
    wiz_ceremonyMinute,
    wiz_ceremonyPeriod,
    wiz_ceremonyFlexHard,
    wiz_ceremonyFlexMinutes,
    wiz_receptionHour,
    wiz_receptionMinute,
    wiz_receptionPeriod,
    wiz_receptionFlexHard,
    wiz_receptionFlexMinutes,
    wiz_firstLookGroom,
    wiz_brideOkayBefore,
    wiz_grandEntrance,
    wiz_dinner,
    wiz_dinnerStartHour,
    wiz_dinnerStartMinute,
    wiz_dinnerStartPeriod,
    wiz_dinnerStyle,
    wiz_dinnerFlexHard,
    wiz_dinnerFlexMinutes,
    wiz_familyGroups,
    wiz_familyGroupNames,
    wiz_groomReadyAtCeremony,
    wiz_groomReadyAtReception,
    wiz_groomReadyAtBride,
    wiz_groomReadyAddress,
    wiz_ceremonyVenue,
    wiz_receptionSameAsCeremony,
    wiz_receptionVenue,
    wiz_receptionAddress,
    wiz_ceremonyAddress,
    wiz_brideReadyAddress,
    wiz_brideReadyStreet,
    wiz_brideReadyAtCeremony,
    wiz_brideReadyAtReception,
    wiz_groomReadyStreet,
    wiz_locations,
    wiz_firstLookParent,
    wiz_firstLookBridesmaids,
    wiz_firstLookOther,
    wiz_firstLookGroomLocation,
    wiz_firstLookParentLocation,
    wiz_firstLookBridesmaidsLocation,
    wiz_firstLookOtherLocation,
    wiz_drone,
    wiz_narration,
    wiz_narrationBride,
    wiz_narrationGroom,
    wiz_portraitLocations,
    wiz_portraitSessions,
    wiz_includeGoldenHour,
    wiz_distanceBetweenReady,
    wiz_distanceGroomToCeremony,
    wiz_distanceBrideToCeremony,
    wiz_distanceReceptionToCeremony,
    wiz_ceremonyOutdoor,
    wiz_guestCount,
    wiz_ceremonyNotes,
    wiz_cakeCutting,
    wiz_firstDance,
    wiz_brideParentDance,
    wiz_groomParentDance,
    wiz_specialDance,
    wiz_speeches,
    wiz_speechCount,
    wiz_speechMinutesPerSpeaker,
    wiz_openDanceFloor,
    wiz_garterToss,
    wiz_bouquetToss,
    wiz_preCeremonyBrideReady,
    wiz_preCeremonyPreDress,
    wiz_preCeremonyDetails,
    wiz_preCeremonyDetailRings,
    wiz_preCeremonyDetailDress,
    wiz_preCeremonyDetailDrone,
    wiz_preCeremonyBrideParty,
    wiz_preCeremonyGroomReady,
    wiz_preCeremonyGroomParty,
    wiz_standardPerson1Solo,
    wiz_standardPerson2Solo,
    wiz_standardWeddingPartyShots,
    wiz_standardCouplePortraits,
    wiz_photoCoverageHours,
    wiz_videoCoverageHours,
    wiz_appliedLogisticsSuggestions,
    wiz_logisticsEventAdjustments,
    wiz_customReceptionEvents,
    photoEndHour,
    photoEndMinute,
    photoEndPeriod,
    videoEndHour,
    videoEndMinute,
    videoEndPeriod,
  });

  const logisticsStatus = useMemo(
    () => getLogisticsStatus(buildWizardAnswers(wizardStateForAnswers()), rows),
    [rows, userRows, date, bride, groom, wiz_ceremonyHour, wiz_ceremonyMinute, wiz_ceremonyPeriod, wiz_ceremonyDuration, wiz_ceremonyType, wiz_ceremonyOtherDuration, wiz_receptionHour, wiz_receptionMinute, wiz_receptionPeriod, wiz_dinner, wiz_dinnerStartHour, wiz_dinnerStartMinute, wiz_dinnerStartPeriod, wiz_firstLookGroom, wiz_brideOkayBefore, wiz_familyGroups, wiz_includeGoldenHour, wiz_standardWeddingPartyShots, wiz_standardCouplePortraits, wiz_preCeremonyDetails, photoStartHour, photoStartMinute, photoStartPeriod, wiz_photoCoverageHours, wiz_appliedLogisticsSuggestions]
  );

  const generateTimeline = () => {
    setEnteredViaWizard(true);
    const rows = generateTimelineLib(buildWizardAnswers(wizardStateForAnswers()));
    setUserRows(rows);
    setNextId(rows.length + 1);
    setHistory([]);
    setRedoStack([]);

    if (rows.length > 0) {
      const coverageStart = rows[0].time;
      if (wiz_photoCoverageHours) {
        const photoEnd = coverageStart + parseFloat(wiz_photoCoverageHours) * 60;
        const ps = formatTime(coverageStart);
        const pe = formatTime(photoEnd);
        setPhotoStartHour(ps.hour);
        setPhotoStartMinute(ps.minute);
        setPhotoStartPeriod(ps.period);
        setPhotoEndHour(pe.hour);
        setPhotoEndMinute(pe.minute);
        setPhotoEndPeriod(pe.period);
      }
      if (wiz_videoCoverageHours) {
        const videoEnd = coverageStart + parseFloat(wiz_videoCoverageHours) * 60;
        const vs = formatTime(coverageStart);
        const ve = formatTime(videoEnd);
        setVideoStartHour(vs.hour);
        setVideoStartMinute(vs.minute);
        setVideoStartPeriod(vs.period);
        setVideoEndHour(ve.hour);
        setVideoEndMinute(ve.minute);
        setVideoEndPeriod(ve.period);
      }
    }

    setScreen("timeline");
    setShowSettingsModal(false);
    if (mainScrollRef.current) mainScrollRef.current.scrollTop = 0;
  };

  const clearVenueGeocode = () => {
    setWiz_geocodeSuccess(null);
    setWiz_venueLat(null);
    setWiz_venueLng(null);
    setWiz_venueUtcOffset(null);
  };

  const geocodeCeremonyVenue = async () => {
    const venue = String(wiz_ceremonyVenue || "").trim();
    const address = String(wiz_ceremonyAddress || "").trim();
    if (!venue && !address) {
      clearVenueGeocode();
      return false;
    }
    const result = await geocodeCeremonyLocation(venue, address);
    if (result) {
      setWiz_venueLat(result.lat);
      setWiz_venueLng(result.lon);
      setWiz_venueUtcOffset(result.utcOffsetHours);
      setWiz_geocodeSuccess(true);
      return true;
    }
    setWiz_venueLat(null);
    setWiz_venueLng(null);
    setWiz_venueUtcOffset(null);
    setWiz_geocodeSuccess(false);
    return false;
  };

  const handleCeremonyVenueChange = (value) => {
    setWiz_ceremonyVenue(value);
    clearVenueGeocode();
  };

  const handleCeremonyAddressChange = (value) => {
    setWiz_ceremonyAddress(value);
    clearVenueGeocode();
  };

  const wizardProps = {
    wizardStep, setWizardStep, setScreen, generateTimeline, withThe, inModal: false,
    date, setDate, bride, setBride, groom, setGroom, brideLabel, setBrideLabel, groomLabel, setGroomLabel,
    wiz_locations, setWiz_locations, wiz_locationNextId, setWiz_locationNextId, addWizLocation, updateWizLocation, removeWizLocation,
    wiz_receptionVenue, setWiz_receptionVenue, wiz_receptionAddress, setWiz_receptionAddress, wiz_receptionSameAsCeremony, setWiz_receptionSameAsCeremony,
    wiz_ceremonyHour, setWiz_ceremonyHour, wiz_ceremonyMinute, setWiz_ceremonyMinute, wiz_ceremonyPeriod, setWiz_ceremonyPeriod,
    wiz_ceremonyDuration, setWiz_ceremonyDuration,
    wiz_ceremonyType, setWiz_ceremonyType, wiz_ceremonyOtherDuration, setWiz_ceremonyOtherDuration,
    wiz_ceremonyFlexHard, setWiz_ceremonyFlexHard, wiz_ceremonyFlexMinutes, setWiz_ceremonyFlexMinutes,
    wiz_receptionFlexHard, setWiz_receptionFlexHard, wiz_receptionFlexMinutes, setWiz_receptionFlexMinutes,
    wiz_dinnerFlexHard, setWiz_dinnerFlexHard, wiz_dinnerFlexMinutes, setWiz_dinnerFlexMinutes,
    wiz_ceremonyVenue, setWiz_ceremonyVenue: handleCeremonyVenueChange, wiz_ceremonyAddress, setWiz_ceremonyAddress: handleCeremonyAddressChange,
    wiz_venueLat, wiz_venueLng, wiz_venueUtcOffset, wiz_geocodeSuccess,
    wiz_fallbackLat, setWiz_fallbackLat, wiz_fallbackLng, setWiz_fallbackLng,
    geocodeCeremonyVenue,
    wiz_guestCount, setWiz_guestCount, wiz_portraitLocations, setWiz_portraitLocations,
    wiz_brideReadyAddress, setWiz_brideReadyAddress, wiz_brideReadyStreet, setWiz_brideReadyStreet,
    wiz_groomReadyAddress, setWiz_groomReadyAddress, wiz_groomReadyStreet, setWiz_groomReadyStreet,
    wiz_distanceBetweenReady, setWiz_distanceBetweenReady, wiz_distanceBrideToCeremony, setWiz_distanceBrideToCeremony,
    wiz_distanceGroomToCeremony, setWiz_distanceGroomToCeremony, wiz_distanceReceptionToCeremony, setWiz_distanceReceptionToCeremony,
    wiz_sameLocation, setWiz_sameLocation, wiz_portraitsAtReadyLocations, setWiz_portraitsAtReadyLocations,
    wiz_bridePortraitsAtReadyLocation, setWiz_bridePortraitsAtReadyLocation, wiz_groomPortraitsAtReadyLocation, setWiz_groomPortraitsAtReadyLocation,
    wiz_hairMakeupDoneHour, setWiz_hairMakeupDoneHour, wiz_hairMakeupDoneMinute, setWiz_hairMakeupDoneMinute, wiz_hairMakeupDonePeriod, setWiz_hairMakeupDonePeriod,
    wiz_photoCoverageHours, setWiz_photoCoverageHours, wiz_videoCoverageHours, setWiz_videoCoverageHours, wiz_ceremonyOutdoor, setWiz_ceremonyOutdoor,
    wiz_photographerCount, setWiz_photographerCount, wiz_videographerCount, setWiz_videographerCount, wiz_drone, setWiz_drone, wiz_narration, setWiz_narration,
    wiz_hasFirstLooks, setWiz_hasFirstLooks, wiz_firstLookGroom, setWiz_firstLookGroom, wiz_firstLookParent, setWiz_firstLookParent,
    wiz_firstLookBridesmaids, setWiz_firstLookBridesmaids, wiz_firstLookOther, setWiz_firstLookOther,
    wiz_firstLookGroomLocation, setWiz_firstLookGroomLocation, wiz_firstLookParentLocation, setWiz_firstLookParentLocation,
    wiz_firstLookBridesmaidsLocation, setWiz_firstLookBridesmaidsLocation, wiz_firstLookOtherLocation, setWiz_firstLookOtherLocation,
    wiz_brideOkayBefore, setWiz_brideOkayBefore,
    wiz_receptionHour, setWiz_receptionHour, wiz_receptionMinute, setWiz_receptionMinute, wiz_receptionPeriod, setWiz_receptionPeriod,
    wiz_grandEntrance, setWiz_grandEntrance, wiz_cakeCutting, setWiz_cakeCutting, wiz_firstDance, setWiz_firstDance,
    wiz_brideParentDance, setWiz_brideParentDance, wiz_groomParentDance, setWiz_groomParentDance, wiz_specialDance, setWiz_specialDance,
    wiz_speeches, setWiz_speeches, wiz_speechCount, setWiz_speechCount, wiz_dinner, setWiz_dinner,
    wiz_dinnerStartHour, setWiz_dinnerStartHour, wiz_dinnerStartMinute, setWiz_dinnerStartMinute, wiz_dinnerStartPeriod, setWiz_dinnerStartPeriod,
    wiz_dinnerStyle, setWiz_dinnerStyle,
    wiz_speechMinutesPerSpeaker, setWiz_speechMinutesPerSpeaker,
    wiz_openDanceFloor, setWiz_openDanceFloor, wiz_garterToss, setWiz_garterToss, wiz_bouquetToss, setWiz_bouquetToss,
    wiz_familyGroups, setWiz_familyGroups, wiz_familyGroupNames, setWiz_familyGroupNames,
    wiz_brideReadyAtCeremony, setWiz_brideReadyAtCeremony, wiz_brideReadyAtReception, setWiz_brideReadyAtReception,
    wiz_groomReadyAtCeremony, setWiz_groomReadyAtCeremony, wiz_groomReadyAtReception, setWiz_groomReadyAtReception, wiz_groomReadyAtBride, setWiz_groomReadyAtBride,
    wiz_preCeremonyBrideReady, setWiz_preCeremonyBrideReady, wiz_preCeremonyGroomReady, setWiz_preCeremonyGroomReady,
    wiz_preCeremonyDetails, setWiz_preCeremonyDetails, wiz_preCeremonyBrideParty, setWiz_preCeremonyBrideParty,
    wiz_preCeremonyGroomParty, setWiz_preCeremonyGroomParty, wiz_preCeremonyPreDress, setWiz_preCeremonyPreDress,
    wiz_preCeremonyDetailRings, setWiz_preCeremonyDetailRings, wiz_preCeremonyDetailDress, setWiz_preCeremonyDetailDress, wiz_preCeremonyDetailDrone, setWiz_preCeremonyDetailDrone,
    wiz_narrationBride, setWiz_narrationBride, wiz_narrationGroom, setWiz_narrationGroom,
    wiz_hasPreCeremonyHardStarts, setWiz_hasPreCeremonyHardStarts, wiz_preCeremonyHardStarts, setWiz_preCeremonyHardStarts, wiz_preCeremonyHardStartNextId, setWiz_preCeremonyHardStartNextId,
    wiz_standardPerson1Solo, setWiz_standardPerson1Solo, wiz_standardPerson2Solo, setWiz_standardPerson2Solo,
    wiz_standardBridePartyPortraits, setWiz_standardBridePartyPortraits, wiz_standardGroomPartyPortraits, setWiz_standardGroomPartyPortraits,
    wiz_standardWeddingPartyShots, setWiz_standardWeddingPartyShots, wiz_standardCouplePortraits, setWiz_standardCouplePortraits,
    wiz_includeGoldenHour, setWiz_includeGoldenHour, wiz_portraitLocationNextId, setWiz_portraitLocationNextId,
    wiz_ceremonyNotes, setWiz_ceremonyNotes, wiz_customFirstLooks, setWiz_customFirstLooks, wiz_customFirstLookNextId, setWiz_customFirstLookNextId,
    wiz_portraitSessions, setWiz_portraitSessions, wiz_portraitSessionNextId, setWiz_portraitSessionNextId,
    wiz_grandEntranceSub, setWiz_grandEntranceSub, wiz_customReceptionEvents, setWiz_customReceptionEvents, wiz_customReceptionEventNextId, setWiz_customReceptionEventNextId,
    wiz_appliedLogisticsSuggestions, setWiz_appliedLogisticsSuggestions,
    wiz_logisticsEventAdjustments, setWiz_logisticsEventAdjustments,
    photoStartHour, photoStartMinute, photoStartPeriod, setPhotoStartHour, setPhotoStartMinute, setPhotoStartPeriod,
    photoEndHour, photoEndMinute, photoEndPeriod, setPhotoEndHour, setPhotoEndMinute, setPhotoEndPeriod,
    videoEndHour, videoEndMinute, videoEndPeriod, setVideoEndHour, setVideoEndMinute, setVideoEndPeriod,
    photoEnabled, videoEnabled,
    wizSectionHeading,
    wizToggleStyle,
    wizCheckRowStyle,
  };

  const renderSettingsForm = (isModal) => (
    <div>
      {/* Section 1: Wedding Details */}
      <div style={{ background: "var(--wtb-surface)", border: "1px solid var(--wtb-surface-raised)", borderRadius: 8, padding: 20, marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: 12, color: "var(--wtb-accent)", fontWeight: 300, fontFamily: "'Jost', sans-serif", letterSpacing: "0.15em", textTransform: "uppercase" }}>Wedding Details</h3>

        {/* Date */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 300, color: "var(--wtb-text-muted)", minWidth: 60, fontFamily: "'Jost', sans-serif" }}>Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ padding: 7, border: "1px solid var(--wtb-border)", borderRadius: 4, fontSize: 14, background: "var(--wtb-surface)", color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" }}
          />
        </div>

        {/* Person 1 */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <label style={{ fontSize: 13, fontWeight: 300, color: "var(--wtb-text-muted)", minWidth: 60, fontFamily: "'Jost', sans-serif" }}>Person 1:</label>
          <select
            value={brideLabel}
            onChange={(e) => setBrideLabel(e.target.value)}
            style={{ ...settingsSelectStyle, minWidth: 100 }}
          >
            <option value="Bride">Bride</option>
            <option value="Groom">Groom</option>
            <option value="Partner 1">Partner 1</option>
            <option value="Partner 2">Partner 2</option>
          </select>
          <input
            type="text"
            value={bride}
            onChange={(e) => setBride(e.target.value)}
            placeholder={`${brideLabel}'s name`}
            style={{ padding: 7, border: "1px solid var(--wtb-border)", borderRadius: 4, fontSize: 13, flex: 1, minWidth: 0, background: "var(--wtb-surface)", color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" }}
          />
        </div>

        {/* Person 2 */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <label style={{ fontSize: 13, fontWeight: 300, color: "var(--wtb-text-muted)", minWidth: 60, fontFamily: "'Jost', sans-serif" }}>Person 2:</label>
          <select
            value={groomLabel}
            onChange={(e) => setGroomLabel(e.target.value)}
            style={{ ...settingsSelectStyle, minWidth: 100 }}
          >
            <option value="Bride">Bride</option>
            <option value="Groom">Groom</option>
            <option value="Partner 1">Partner 1</option>
            <option value="Partner 2">Partner 2</option>
          </select>
          <input
            type="text"
            value={groom}
            onChange={(e) => setGroom(e.target.value)}
            placeholder={`${groomLabel}'s name`}
            style={{ padding: 7, border: "1px solid var(--wtb-border)", borderRadius: 4, fontSize: 13, flex: 1, minWidth: 0, background: "var(--wtb-surface)", color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" }}
          />
        </div>
      </div>

      {/* Section 2: Coverage */}
      <div style={{ background: "var(--wtb-surface)", border: "1px solid var(--wtb-surface-raised)", borderRadius: 8, padding: 20, marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: 12, color: "var(--wtb-accent)", fontWeight: 300, fontFamily: "'Jost', sans-serif", letterSpacing: "0.15em", textTransform: "uppercase" }}>Coverage</h3>

        {/* Photography */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 300, color: "var(--wtb-text)", marginBottom: 8, fontFamily: "'Jost', sans-serif" }}>
            <input
              type="checkbox"
              checked={photoEnabled}
              onChange={(e) => {
                const enabled = e.target.checked;
                setPhotoEnabled(enabled);
                setUserRows((r) => r.map((row) => ({ ...row, photo: enabled })));
              }}
            />
            Photography
          </label>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4, paddingLeft: 24, opacity: photoEnabled ? 1 : 0.5 }}>
            <select value={photoStartHour} onChange={(e) => setPhotoStartHour(e.target.value)} disabled={!photoEnabled} style={{ ...settingsSelectStyle, background: !photoEnabled ? "var(--wtb-disabled-bg)" : "var(--wtb-input-bg)", color: !photoEnabled ? "var(--wtb-text-faint)" : "var(--wtb-text)" }}>{renderHourOptions()}</select>
            <span style={{ color: "var(--wtb-text-muted)" }}>:</span>
            <select value={photoStartMinute} onChange={(e) => setPhotoStartMinute(e.target.value)} disabled={!photoEnabled} style={{ ...settingsSelectStyle, background: !photoEnabled ? "var(--wtb-disabled-bg)" : "var(--wtb-input-bg)", color: !photoEnabled ? "var(--wtb-text-faint)" : "var(--wtb-text)" }}>{renderMinuteOptions()}</select>
            <select value={photoStartPeriod} onChange={(e) => setPhotoStartPeriod(e.target.value)} disabled={!photoEnabled} style={{ ...settingsSelectStyle, background: !photoEnabled ? "var(--wtb-disabled-bg)" : "var(--wtb-input-bg)", color: !photoEnabled ? "var(--wtb-text-faint)" : "var(--wtb-text)" }}><option value="AM">AM</option><option value="PM">PM</option></select>
            <span style={{ margin: "0 4px", color: "var(--wtb-text-muted)" }}>—</span>
            <select value={photoEndHour} onChange={(e) => setPhotoEndHour(e.target.value)} disabled={!photoEnabled} style={{ ...settingsSelectStyle, background: !photoEnabled ? "var(--wtb-disabled-bg)" : "var(--wtb-input-bg)", color: !photoEnabled ? "var(--wtb-text-faint)" : "var(--wtb-text)" }}>{renderHourOptions()}</select>
            <span style={{ color: "var(--wtb-text-muted)" }}>:</span>
            <select value={photoEndMinute} onChange={(e) => setPhotoEndMinute(e.target.value)} disabled={!photoEnabled} style={{ ...settingsSelectStyle, background: !photoEnabled ? "var(--wtb-disabled-bg)" : "var(--wtb-input-bg)", color: !photoEnabled ? "var(--wtb-text-faint)" : "var(--wtb-text)" }}>{renderMinuteOptions()}</select>
            <select value={photoEndPeriod} onChange={(e) => setPhotoEndPeriod(e.target.value)} disabled={!photoEnabled} style={{ ...settingsSelectStyle, background: !photoEnabled ? "var(--wtb-disabled-bg)" : "var(--wtb-input-bg)", color: !photoEnabled ? "var(--wtb-text-faint)" : "var(--wtb-text)" }}><option value="AM">AM</option><option value="PM">PM</option></select>
          </div>
        </div>

        {/* Videography */}
        <div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 300, color: "var(--wtb-text)", marginBottom: 8, fontFamily: "'Jost', sans-serif" }}>
            <input
              type="checkbox"
              checked={videoEnabled}
              onChange={(e) => {
                const enabled = e.target.checked;
                setVideoEnabled(enabled);
                setUserRows((r) => r.map((row) => ({ ...row, video: enabled })));
              }}
            />
            Videography
          </label>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4, paddingLeft: 24, opacity: videoEnabled ? 1 : 0.5 }}>
            <select value={videoStartHour} onChange={(e) => setVideoStartHour(e.target.value)} disabled={!videoEnabled} style={{ ...settingsSelectStyle, background: !videoEnabled ? "var(--wtb-disabled-bg)" : "var(--wtb-input-bg)", color: !videoEnabled ? "var(--wtb-text-faint)" : "var(--wtb-text)" }}>{renderHourOptions()}</select>
            <span style={{ color: "var(--wtb-text-muted)" }}>:</span>
            <select value={videoStartMinute} onChange={(e) => setVideoStartMinute(e.target.value)} disabled={!videoEnabled} style={{ ...settingsSelectStyle, background: !videoEnabled ? "var(--wtb-disabled-bg)" : "var(--wtb-input-bg)", color: !videoEnabled ? "var(--wtb-text-faint)" : "var(--wtb-text)" }}>{renderMinuteOptions()}</select>
            <select value={videoStartPeriod} onChange={(e) => setVideoStartPeriod(e.target.value)} disabled={!videoEnabled} style={{ ...settingsSelectStyle, background: !videoEnabled ? "var(--wtb-disabled-bg)" : "var(--wtb-input-bg)", color: !videoEnabled ? "var(--wtb-text-faint)" : "var(--wtb-text)" }}><option value="AM">AM</option><option value="PM">PM</option></select>
            <span style={{ margin: "0 4px", color: "var(--wtb-text-muted)" }}>—</span>
            <select value={videoEndHour} onChange={(e) => setVideoEndHour(e.target.value)} disabled={!videoEnabled} style={{ ...settingsSelectStyle, background: !videoEnabled ? "var(--wtb-disabled-bg)" : "var(--wtb-input-bg)", color: !videoEnabled ? "var(--wtb-text-faint)" : "var(--wtb-text)" }}>{renderHourOptions()}</select>
            <span style={{ color: "var(--wtb-text-muted)" }}>:</span>
            <select value={videoEndMinute} onChange={(e) => setVideoEndMinute(e.target.value)} disabled={!videoEnabled} style={{ ...settingsSelectStyle, background: !videoEnabled ? "var(--wtb-disabled-bg)" : "var(--wtb-input-bg)", color: !videoEnabled ? "var(--wtb-text-faint)" : "var(--wtb-text)" }}>{renderMinuteOptions()}</select>
            <select value={videoEndPeriod} onChange={(e) => setVideoEndPeriod(e.target.value)} disabled={!videoEnabled} style={{ ...settingsSelectStyle, background: !videoEnabled ? "var(--wtb-disabled-bg)" : "var(--wtb-input-bg)", color: !videoEnabled ? "var(--wtb-text-faint)" : "var(--wtb-text)" }}><option value="AM">AM</option><option value="PM">PM</option></select>
          </div>
        </div>
      </div>

      {/* Section 3: Fixed-Time Events (wizard / legacy settings path only) */}
      {enteredViaWizard && (
      <div style={{ background: "var(--wtb-surface)", border: "1px solid var(--wtb-surface-raised)", borderRadius: 8, padding: 20, marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 4px 0", fontSize: 12, color: "var(--wtb-accent)", fontWeight: 300, fontFamily: "'Jost', sans-serif", letterSpacing: "0.15em", textTransform: "uppercase" }}>Fixed-Time Events</h3>
        <p style={{ margin: "0 0 14px 0", fontSize: 13, color: "var(--wtb-text-muted)", fontFamily: "'Jost', sans-serif" }}>Events that must start at a specific time — added to your timeline as time-locked anchors.</p>

        {/* Column headers */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 160px 70px 28px", gap: 6, marginBottom: 6, paddingRight: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 300, color: "var(--wtb-text-muted)", paddingLeft: 6, fontFamily: "'Jost', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>Event</span>
          <span style={{ fontSize: 11, fontWeight: 300, color: "var(--wtb-text-muted)", textAlign: "center", fontFamily: "'Jost', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>Start Time</span>
          <span style={{ fontSize: 11, fontWeight: 300, color: "var(--wtb-text-muted)", textAlign: "center", fontFamily: "'Jost', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>Duration</span>
          <span />
        </div>

        {/* Fixed event rows */}
        {fixedEvents.map((fe) => (
          <div key={fe.id} style={{ display: "grid", gridTemplateColumns: "1fr 160px 70px 28px", gap: 6, alignItems: "center", marginBottom: 8 }}>
            <input
              type="text"
              value={fe.event}
              onChange={(e) => updateFixedEvent(fe.id, "event", e.target.value)}
              placeholder="Event name"
              style={{ padding: 6, border: "1px solid var(--wtb-border)", borderRadius: 4, fontSize: 13, width: "100%", boxSizing: "border-box", background: "var(--wtb-surface)", color: "var(--wtb-text)", fontFamily: "'Jost', sans-serif" }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <select value={fe.timeHour} onChange={(e) => updateFixedEvent(fe.id, "timeHour", e.target.value)} style={{ ...settingsSelectStyle, flex: 1, minWidth: 0 }}>{renderHourOptions()}</select>
              <span style={{ fontSize: 13 }}>:</span>
              <select value={fe.timeMinute} onChange={(e) => updateFixedEvent(fe.id, "timeMinute", e.target.value)} style={{ ...settingsSelectStyle, flex: 1, minWidth: 0 }}>{renderMinuteOptions()}</select>
              <select value={fe.timePeriod} onChange={(e) => updateFixedEvent(fe.id, "timePeriod", e.target.value)} style={{ ...settingsSelectStyle, flex: 1, minWidth: 0 }}><option value="AM">AM</option><option value="PM">PM</option></select>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <input
                type="number"
                value={fe.duration}
                min={5}
                step={5}
                onChange={(e) => updateFixedEvent(fe.id, "duration", parseInt(e.target.value, 10) || 5)}
                style={{ ...settingsSelectStyle, width: "100%", boxSizing: "border-box", textAlign: "center" }}
              />
            </div>
            <button
              onClick={() => removeFixedEvent(fe.id)}
              style={{ padding: 0, width: 24, height: 24, background: "var(--wtb-surface-raised)", color: "var(--wtb-text-muted)", border: "1px solid var(--wtb-border)", borderRadius: 4, fontSize: 13, cursor: "pointer", lineHeight: 1 }}
            >
              ✕
            </button>
          </div>
        ))}

        {/* Add Custom */}
        <button
          onClick={() => addFixedEvent("", "12", "00", "PM")}
          style={{ padding: "6px 14px", background: "var(--wtb-surface-raised)", color: "var(--wtb-accent)", border: "1px solid var(--wtb-accent)", borderRadius: 4, fontSize: 13, cursor: "pointer", marginTop: 4, fontFamily: "'Jost', sans-serif", fontWeight: 300 }}
        >
          + Add Custom
        </button>
      </div>
      )}
    </div>
  );

  return (
    <div className={screen !== "timeline" ? "wtb-app-root" : undefined}>
      <style>{THEME_CSS}{MOBILE_TWEAKS}</style>
      {(isDesktop || screen !== "timeline") && (
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      )}

      {screen === "welcome" ? (
        <WelcomeScreen
          showAutosaveBanner={showAutosaveBanner}
          restoreAutosave={restoreAutosave}
          clearAutosave={clearAutosave}
          onCreateNewTimeline={() => {
            if (!confirmDiscardAutosaveIfNeeded()) return;
            setEnteredViaWizard(true);
            setWizardStep(1);
            setScreen("wizard");
          }}
          onStartManually={startManualTimeline}
          loadProject={loadProject}
        />
      ) : screen === "wizard" ? (
        /* ============ WIZARD SCREEN ============ */
        renderWizard(wizardProps)
      ) : screen === "settings" ? (
        /* ============ PROJECT SETTINGS SCREEN ============ */
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "10px 0 40px" }}>
          <h1 style={{ textAlign: "center", margin: "20px 0 4px 0", fontSize: "clamp(18px, 5vw, 24px)", color: "var(--wtb-text)", fontWeight: 300, fontFamily: "'Cormorant Garamond', serif" }}>
            Wedding Timeline Builder
          </h1>

          <div style={{ background: "var(--wtb-surface)", border: "1px solid var(--wtb-surface-raised)", borderRadius: 10, padding: "24px 24px 8px", marginBottom: 16 }}>
            <h2 style={{ margin: "0 0 6px 0", fontSize: 20, color: "var(--wtb-text)", fontWeight: 400, fontFamily: "'Cormorant Garamond', serif" }}>Project Settings</h2>
            <p style={{ margin: "0 0 20px 0", fontSize: 14, color: "var(--wtb-text-muted)", fontFamily: "'Jost', sans-serif" }}>Set up your wedding details before building the timeline.</p>
            {renderSettingsForm(false)}
          </div>

          {/* Bottom actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center", marginTop: 8 }}>
            <button
              onClick={continueFromProjectSettings}
              style={{ padding: "12px 32px", backgroundColor: "var(--wtb-accent)", color: "var(--wtb-on-accent)", border: "none", borderRadius: 6, fontSize: 16, fontWeight: 300, cursor: "pointer", width: "100%", maxWidth: 360, fontFamily: "'Jost', sans-serif" }}
            >
              Start Building Timeline
            </button>

            <label
              style={{ padding: "10px 24px", background: "transparent", color: "var(--wtb-accent)", border: "1px solid var(--wtb-accent)", borderRadius: 6, fontSize: 14, fontWeight: 300, cursor: "pointer", textAlign: "center", width: "100%", maxWidth: 360, boxSizing: "border-box", fontFamily: "'Jost', sans-serif" }}
            >
              Load Existing Project
              <input type="file" accept=".json" onChange={loadProject} style={{ display: "none" }} />
            </label>
          </div>
        </div>
      ) : (
        /* ============ TIMELINE SCREEN ============ */
        <div className="wtb-timeline-screen wtb-timeline-screen-theme" style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", zIndex: 1, fontFamily: "'Jost', sans-serif" }}>
          {versionNotice && (
            <div style={{ flexShrink: 0, padding: "8px 12px", background: "var(--wtb-surface-raised)", borderBottom: "1px solid var(--wtb-border)", fontSize: 13, color: "var(--wtb-text-muted)", textAlign: "center", fontFamily: "'Jost', sans-serif", fontWeight: 300 }}>
              {versionNotice}
            </div>
          )}
          {/* Header: names/date + controls */}
          <div className="wtb-header-bar" style={{ flexShrink: 0, padding: isDesktop ? "4px 10px 0" : "4px 8px 0" }}>
            {/* Names & date (+ mobile gear top-right) */}
            {!isDesktop ? (
              <div className="wtb-mobile-header-top">
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 300, color: "var(--wtb-text)", lineHeight: 1.2, fontFamily: "'Cormorant Garamond', serif" }}>
                    {bride || groom ? [bride, groom].filter(Boolean).join(" & ") : "Wedding Timeline Builder"}
                  </div>
                  {date && (
                    <div style={{ fontSize: 14, color: "var(--wtb-text-muted)", marginTop: 2, fontFamily: "'Jost', sans-serif", fontWeight: 200 }}>
                      {new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                    </div>
                  )}
                  <TimelineCoverageCounter coverage={timelineCoverage} />
                </div>
                <div className="wtb-mobile-header-actions" ref={mobileGearMenuRef}>
                  <ThemeToggle theme={theme} onToggle={toggleTheme} inline />
                  <div className="wtb-mobile-gear-anchor">
                    <button
                      type="button"
                      className="wtb-mobile-gear-btn"
                      onClick={() => setShowMobileMenu((v) => !v)}
                      aria-expanded={showMobileMenu}
                      aria-haspopup="menu"
                      aria-label="Timeline menu"
                      title="Menu"
                    >
                      ⚙
                    </button>
                    {showMobileMenu && (
                      <div className="wtb-mobile-gear-menu" role="menu">
                      <button
                        type="button"
                        role="menuitem"
                        className="wtb-mobile-gear-menu-item"
                        onClick={() => { requestNewTimeline(); closeMobileGearMenu(); }}
                      >
                        New Timeline
                      </button>
                      <label role="menuitem" className="wtb-mobile-gear-menu-item" style={{ cursor: "pointer", margin: 0 }}>
                        Load Project
                        <input
                          type="file"
                          accept=".json"
                          onChange={(e) => { loadProject(e); closeMobileGearMenu(); }}
                          style={{ display: "none" }}
                        />
                      </label>
                      <button
                        type="button"
                        role="menuitem"
                        className="wtb-mobile-gear-menu-item wtb-mobile-gear-menu-item--primary"
                        onClick={() => { saveProject(); closeMobileGearMenu(); }}
                      >
                        Save Project
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className="wtb-mobile-gear-menu-item"
                        onClick={() => { copyTimeline(); closeMobileGearMenu(); }}
                      >
                        {copyConfirm ? "Copied!" : "Copy Timeline"}
                      </button>
                      {enteredViaWizard && (
                      <button
                        type="button"
                        role="menuitem"
                        className="wtb-mobile-gear-menu-item wtb-mobile-gear-menu-item--logistics"
                        onClick={() => { setShowLogisticsModal(true); closeMobileGearMenu(); }}
                      >
                        <span className="wtb-mobile-gear-logistics-icon" data-status={logisticsStatus} aria-hidden />
                        Logistics Check
                      </button>
                      )}
                      <button
                        type="button"
                        role="menuitem"
                        className="wtb-mobile-gear-menu-item"
                        onClick={() => { printTimeline(); closeMobileGearMenu(); }}
                      >
                        Print
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className="wtb-mobile-gear-menu-item"
                        onClick={exportPDF}
                        disabled={exporting}
                      >
                        {exporting ? "Exporting PDF…" : "Export as PDF"}
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className="wtb-mobile-gear-menu-item"
                        onClick={() => { exportTimeline(); closeMobileGearMenu(); }}
                      >
                        Export as TXT
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className="wtb-mobile-gear-menu-item"
                        onClick={() => { setShowSettingsModal(true); closeMobileGearMenu(); }}
                      >
                        Project Settings
                      </button>
                    </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", marginBottom: 6 }}>
                <div style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 300, color: "var(--wtb-text)", lineHeight: 1.2, fontFamily: "'Cormorant Garamond', serif" }}>
                  {bride || groom ? [bride, groom].filter(Boolean).join(" & ") : "Wedding Timeline Builder"}
                </div>
                {date && (
                  <div style={{ fontSize: 14, color: "var(--wtb-text-muted)", marginTop: 2, fontFamily: "'Jost', sans-serif", fontWeight: 200 }}>
                    {new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  </div>
                )}
                <TimelineCoverageCounter coverage={timelineCoverage} />
              </div>
            )}

            {/* Controls — desktop */}
            <div
              className="wtb-controls-desktop"
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                flexWrap: "wrap",
                background: "var(--wtb-surface)",
                borderBottom: "1px solid var(--wtb-surface-raised)",
                borderTop: "1px solid var(--wtb-surface-raised)",
                padding: "8px 10px",
                margin: "0 -10px 0",
              }}
            >
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  onClick={requestNewTimeline}
                  style={{ padding: "6px 14px", background: "transparent", color: "var(--wtb-text)", border: "1px solid var(--wtb-border)", borderRadius: 4, fontSize: 13, fontWeight: 300, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'Jost', sans-serif" }}
                >
                  New Timeline
                </button>
                <label
                  style={{ padding: "6px 14px", background: "transparent", color: "var(--wtb-text)", border: "1px solid var(--wtb-border)", borderRadius: 4, cursor: "pointer", fontSize: 13, fontWeight: 300, display: "inline-block", fontFamily: "'Jost', sans-serif" }}
                >
                  Load Project
                  <input type="file" accept=".json" onChange={loadProject} style={{ display: "none" }} />
                </label>
                <button
                  onClick={saveProject}
                  style={{ padding: "6px 14px", backgroundColor: "var(--wtb-accent)", color: "var(--wtb-on-accent)", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13, fontWeight: 300, fontFamily: "'Jost', sans-serif", letterSpacing: "0.05em" }}
                >
                  Save Project
                </button>
                <button
                  onClick={() => setShowSettingsModal(true)}
                  style={{ padding: "6px 14px", background: "transparent", color: "var(--wtb-text)", border: "1px solid var(--wtb-border)", borderRadius: 4, fontSize: 13, fontWeight: 300, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'Jost', sans-serif" }}
                >
                  Project Settings
                </button>
              </div>
              <div
                className="wtb-controls-desktop-mid"
                style={{
                  position: "absolute",
                  left: "50%",
                  right: "max(280px, 22vw)",
                  top: 0,
                  bottom: 0,
                  display: "flex",
                  alignItems: "center",
                  pointerEvents: "none",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    transform: "translateX(-50%)",
                    display: "flex",
                    gap: 8,
                    pointerEvents: "auto",
                    zIndex: 2,
                  }}
                >
                  <button
                    onClick={undo}
                    disabled={history.length === 0}
                    style={{ padding: "6px 14px", background: history.length > 0 ? "var(--wtb-undo-bg-active)" : "var(--wtb-undo-bg)", color: history.length > 0 ? "var(--wtb-text)" : "var(--wtb-undo-text-disabled)", border: "none", borderRadius: 4, cursor: history.length > 0 ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 300, fontFamily: "'Jost', sans-serif", display: "flex", alignItems: "center", gap: 5 }}
                  >
                    <span style={{ fontSize: 15, lineHeight: 1 }}>↺</span> Undo
                  </button>
                  <button
                    onClick={redo}
                    disabled={redoStack.length === 0}
                    style={{ padding: "6px 14px", background: redoStack.length > 0 ? "var(--wtb-undo-bg-active)" : "var(--wtb-undo-bg)", color: redoStack.length > 0 ? "var(--wtb-text)" : "var(--wtb-undo-text-disabled)", border: "none", borderRadius: 4, cursor: redoStack.length > 0 ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 300, fontFamily: "'Jost', sans-serif", display: "flex", alignItems: "center", gap: 5 }}
                  >
                    <span style={{ fontSize: 15, lineHeight: 1 }}>↻</span> Redo
                  </button>
                </div>
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minWidth: 0,
                    padding: "0 12px",
                    pointerEvents: "auto",
                  }}
                >
                  {enteredViaWizard && (
                  <LogisticsCheckButton
                    status={logisticsStatus}
                    onClick={() => setShowLogisticsModal(true)}
                  />
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", position: "relative", zIndex: 2, marginLeft: "auto" }}>
                <button
                  onClick={copyTimeline}
                  style={{ padding: "6px 14px", backgroundColor: copyConfirm ? "var(--wtb-accent)" : "transparent", color: copyConfirm ? "var(--wtb-on-accent)" : "var(--wtb-text)", border: copyConfirm ? "1px solid var(--wtb-accent)" : "1px solid var(--wtb-border)", borderRadius: 4, cursor: "pointer", fontSize: 13, fontWeight: 300, fontFamily: "'Jost', sans-serif" }}
                >
                  {copyConfirm ? "Copied!" : "Copy Timeline"}
                </button>
                <button
                  type="button"
                  onClick={printTimeline}
                  style={{ padding: "6px 14px", background: "transparent", color: "var(--wtb-text)", border: "1px solid var(--wtb-border)", borderRadius: 4, cursor: "pointer", fontSize: 13, fontWeight: 300, fontFamily: "'Jost', sans-serif" }}
                >
                  Print
                </button>
                <div ref={isDesktop ? exportMenuRef : null} style={{ position: "relative" }}>
                  <button
                    onClick={() => setShowExportMenu(v => !v)}
                    style={{ padding: "6px 14px", backgroundColor: "var(--wtb-accent)", color: "var(--wtb-on-accent)", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13, fontWeight: 300, fontFamily: "'Jost', sans-serif", letterSpacing: "0.05em" }}
                  >
                    Export Timeline ▾
                  </button>
                  {showExportMenu && (
                    <div style={{ position: "absolute", right: 0, top: "calc(100% + 4px)", background: "var(--wtb-surface-alt)", border: "1px solid var(--wtb-border)", borderRadius: 4, zIndex: 200, minWidth: 150, overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }}>
                      <button
                        onClick={exportPDF}
                        disabled={exporting}
                        style={{ display: "block", width: "100%", padding: "9px 14px", background: "none", border: "none", color: exporting ? "var(--wtb-text-muted)" : "var(--wtb-text)", textAlign: "left", fontSize: 13, fontFamily: "'Jost', sans-serif", cursor: exporting ? "not-allowed" : "pointer", borderBottom: "1px solid var(--wtb-border)" }}
                      >
                        {exporting ? "Exporting…" : "Save as PDF"}
                      </button>
                      <button
                        onClick={() => { exportTimeline(); setShowExportMenu(false); }}
                        style={{ display: "block", width: "100%", padding: "9px 14px", background: "none", border: "none", color: "var(--wtb-text)", textAlign: "left", fontSize: 13, fontFamily: "'Jost', sans-serif", cursor: "pointer" }}
                      >
                        Save as TXT
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile: toggle timeline editor vs PDF preview */}
            {!isDesktop && (
              <div className="wtb-mobile-view-tabs" role="tablist" aria-label="Timeline views">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mobileMainTab === "timeline"}
                  className={`wtb-mobile-view-tab${mobileMainTab === "timeline" ? " active" : ""}`}
                  onClick={() => setMobileMainTab("timeline")}
                >
                  Timeline Events
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mobileMainTab === "preview"}
                  className={`wtb-mobile-view-tab${mobileMainTab === "preview" ? " active" : ""}`}
                  onClick={() => { setMobileMainTab("preview"); closeMobileGearMenu(); }}
                >
                  Preview
                </button>
              </div>
            )}

            <div
              style={{
                height: !isDesktop && mobileMainTab === "preview" ? 4 : 8,
                background: "var(--wtb-bg)",
                flexShrink: 0,
              }}
            />
          </div>

          {/* App shell: main content + (desktop) sidebar */}
          <TimelineDndProvider
            rowIds={sortableRowIds}
            onDragComplete={handleTimelineDragComplete}
          >
          <div className="wtb-shell" style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
            {/* MAIN — scrolls independently */}
            <div
              ref={mainScrollRef}
              className={`wtb-timeline-scroll${!isDesktop && mobileMainTab === "timeline" ? " wtb-has-mobile-dock" : ""}`}
              style={{
                overflowY: "auto",
                height: "100%",
                padding: isDesktop || mobileMainTab === "timeline" ? "0 10px 20px" : "0 4px 8px",
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
              }}
            >
          {(isDesktop || mobileMainTab === "timeline") && (
          <div
            style={{
              background: "var(--wtb-bg)",
              padding: 15,
              borderRadius: 8,
              border: "1px solid var(--wtb-surface-raised)",
            }}
          >
            <h2
              style={{
                textAlign: "center",
                margin: "0 0 15px 0",
                fontSize: 14,
                color: "var(--wtb-accent)",
                fontFamily: "'Jost', sans-serif",
                fontWeight: 300,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              Timeline Events
            </h2>

            <div style={{ width: "100%" }}>
              {/* Top drop zone (before first row) */}
              <RowDropZone index={0} onAddRow={() => addRowAtIndex(0)} />
              {rows.map((row, index) => (
                <React.Fragment key={row.id}>
                  <SortableTimelineRow
                    row={row}
                    sortDisabled={!isDesktop}
                    index={index}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onDelete={handleDelete}
                    onEventClick={handleEventClick}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                    isFirst={index === 0}
                    isLast={index === rows.length - 1}
                    onEventBlur={handleEventBlur}
                    photoEnabledGlobal={photoEnabled}
                    videoEnabledGlobal={videoEnabled}
                    onTimeSet={(h, m, p) =>
                      handleTimeSet(index, parseTimeInput(h, m, p))
                    }
                    overlapWith={overlapMap.get(row.id) || null}
                    isMobile={!isDesktop}
                  />

                  <RowDropZone
                    index={index + 1}
                    onAddRow={() => addRowAtIndex(index + 1)}
                    isLast={index === rows.length - 1}
                  />
                </React.Fragment>
              ))}
            </div>

            {/* Add Event */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: 15,
              }}
            >
              <button
                onClick={addRow}
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
              >
                + Add Event
              </button>
            </div>
          </div>
          )}

          {!isDesktop && mobileMainTab === "preview" && (
            <div className="wtb-mobile-preview-panel">
              <TimelinePreview
                rows={rows}
                bride={bride}
                groom={groom}
                date={date}
                photoStartHour={photoStartHour}
                photoStartMinute={photoStartMinute}
                photoStartPeriod={photoStartPeriod}
                photoEndHour={photoEndHour}
                photoEndMinute={photoEndMinute}
                photoEndPeriod={photoEndPeriod}
                videoStartHour={videoStartHour}
                videoStartMinute={videoStartMinute}
                videoStartPeriod={videoStartPeriod}
                videoEndHour={videoEndHour}
                videoEndMinute={videoEndMinute}
                videoEndPeriod={videoEndPeriod}
                photoEnabled={photoEnabled}
                videoEnabled={videoEnabled}
              />
            </div>
          )}

          {/* Event Selector Modal */}
          {(isDesktop || mobileMainTab === "timeline") && (
          <EventBlockSelector
            isVisible={showEventSelector}
            onSelect={handleEventSelect}
            onClose={() => {
              setShowEventSelector(false);
              setSelectedRowIndex(null);
            }}
            currentEvent={
              selectedRowIndex !== null ? rows[selectedRowIndex]?.event : ""
            }
            currentTime={
              selectedRowIndex !== null ? rows[selectedRowIndex]?.time : undefined
            }
          />
          )}
        </div>

        {/* Sidebar: event blocks + preview (desktop only; mobile uses tap-to-select modal) */}
        {isDesktop && (
          <EventSidebar
            rows={rows}
            bride={bride}
            groom={groom}
            date={date}
            photoStartHour={photoStartHour}
            photoStartMinute={photoStartMinute}
            photoStartPeriod={photoStartPeriod}
            photoEndHour={photoEndHour}
            photoEndMinute={photoEndMinute}
            photoEndPeriod={photoEndPeriod}
            videoStartHour={videoStartHour}
            videoStartMinute={videoStartMinute}
            videoStartPeriod={videoStartPeriod}
            videoEndHour={videoEndHour}
            videoEndMinute={videoEndMinute}
            videoEndPeriod={videoEndPeriod}
            photoEnabled={photoEnabled}
            videoEnabled={videoEnabled}
          />
        )}
      </div>
          </TimelineDndProvider>

          {/* Project Settings Modal */}
          {showSettingsModal && (
            <div
              style={{
                position: "fixed", inset: 0, backgroundColor: "var(--wtb-overlay)",
                display: "flex", alignItems: "flex-start", justifyContent: "center",
                zIndex: 1000, overflowY: "auto", padding: "20px 10px 40px",
              }}
              onClick={(e) => { if (e.target === e.currentTarget) setShowSettingsModal(false); }}
            >
              <div style={{ background: "var(--wtb-surface)", border: "1px solid var(--wtb-border)", borderRadius: 10, maxWidth: 960, width: "100%", padding: 24, position: "relative" }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <h2 style={{ margin: 0, fontSize: 20, color: "var(--wtb-text)", fontWeight: 400, fontFamily: "'Cormorant Garamond', serif" }}>Project Settings</h2>
                  <button
                    onClick={() => setShowSettingsModal(false)}
                    style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--wtb-text-muted)", lineHeight: 1 }}
                  >
                    ✕
                  </button>
                </div>

                {enteredViaWizard ? (
                  <>
                    <div style={{ display: "flex", flexWrap: "nowrap", gap: 4, marginBottom: 20, borderBottom: "1px solid var(--wtb-border)", paddingBottom: 12, overflowX: "auto" }}>
                      {SETTINGS_WIZARD_TABS.map((tab, i) => (
                        <button
                          key={i}
                          onClick={() => setSettingsTab(i)}
                          style={{
                            padding: "5px 12px",
                            background: settingsTab === i ? "var(--wtb-accent)" : "transparent",
                            color: settingsTab === i ? "var(--wtb-on-accent)" : "var(--wtb-text-muted)",
                            border: settingsTab === i ? "1px solid var(--wtb-accent)" : "1px solid var(--wtb-border)",
                            borderRadius: 4, fontSize: 12, cursor: "pointer",
                            fontFamily: "'Jost', sans-serif", fontWeight: 300, letterSpacing: "0.05em",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <div style={{ maxHeight: "62vh", overflowY: "auto", paddingRight: 4 }}>
                      {renderWizard({ ...wizardProps, inModal: true, overrideStep: SETTINGS_WIZARD_TABS[settingsTab].step })}
                    </div>

                    <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 16 }}>
                      <button
                        onClick={() => { generateTimeline(); }}
                        style={{ padding: "8px 20px", backgroundColor: "var(--wtb-accent)", color: "var(--wtb-on-accent)", border: "none", borderRadius: 6, fontSize: 14, fontWeight: 400, cursor: "pointer", fontFamily: "'Jost', sans-serif" }}
                      >
                        Done
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ maxHeight: "62vh", overflowY: "auto", paddingRight: 4 }}>
                      {renderSettingsForm(true)}
                    </div>
                    <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 16 }}>
                      <button
                        onClick={() => setShowSettingsModal(false)}
                        style={{ padding: "8px 20px", backgroundColor: "var(--wtb-accent)", color: "var(--wtb-on-accent)", border: "none", borderRadius: 6, fontSize: 14, fontWeight: 400, cursor: "pointer", fontFamily: "'Jost', sans-serif" }}
                      >
                        Done
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Mobile: fixed undo/redo at bottom (Timeline Events tab only) */}
          {!isDesktop && mobileMainTab === "timeline" && (
            <div className="wtb-mobile-undo-dock" role="toolbar" aria-label="Undo and redo">
              <button
                type="button"
                className="wtb-mobile-undo"
                onClick={undo}
                disabled={history.length === 0}
                title="Undo"
                style={{
                  background: history.length > 0 ? "var(--wtb-undo-bg-active)" : "var(--wtb-undo-bg)",
                  color: history.length > 0 ? "var(--wtb-text)" : "var(--wtb-undo-text-disabled)",
                }}
              >
                <span style={{ fontSize: 15, lineHeight: 1 }}>↺</span> Undo
              </button>
              <button
                type="button"
                className="wtb-mobile-redo"
                onClick={redo}
                disabled={redoStack.length === 0}
                title="Redo"
                style={{
                  background: redoStack.length > 0 ? "var(--wtb-undo-bg-active)" : "var(--wtb-undo-bg)",
                  color: redoStack.length > 0 ? "var(--wtb-text)" : "var(--wtb-undo-text-disabled)",
                }}
              >
                <span style={{ fontSize: 15, lineHeight: 1 }}>↻</span> Redo
              </button>
            </div>
          )}
        </div>
      )}

      {enteredViaWizard && showLogisticsModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "var(--wtb-overlay)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            zIndex: 10000,
            overflowY: "auto",
            padding: "20px 10px 40px",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowLogisticsModal(false);
          }}
        >
          <div
            style={{
              background: "var(--wtb-surface)",
              border: "1px solid var(--wtb-border)",
              borderRadius: 10,
              maxWidth: "min(960px, 100%)",
              width: "100%",
              padding: "20px clamp(12px, 3vw, 20px) 24px",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowLogisticsModal(false)}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "none",
                border: "none",
                fontSize: 20,
                cursor: "pointer",
                color: "var(--wtb-text-muted)",
                lineHeight: 1,
                zIndex: 2,
              }}
              aria-label="Close logistics check"
            >
              ✕
            </button>
            <WizardLogisticsCheck
              {...wizardProps}
              inModal
              timelineRows={rows}
              onClose={() => setShowLogisticsModal(false)}
            />
          </div>
        </div>
      )}

      {showUnsavedConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "var(--wtb-overlay)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: 20,
          }}
          onClick={() => setShowUnsavedConfirm(false)}
        >
          <div
            style={{
              background: "var(--wtb-surface-raised)",
              border: "1px solid var(--wtb-border)",
              borderRadius: 10,
              padding: "24px 28px",
              maxWidth: 420,
              width: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p style={{ margin: "0 0 20px 0", fontSize: 15, color: "var(--wtb-text)", lineHeight: 1.5, fontFamily: "'Jost', sans-serif", fontWeight: 300 }}>
              You have unsaved changes. Are you sure you want to start a new timeline? Your current timeline will be lost.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowUnsavedConfirm(false)}
                style={{ padding: "10px 20px", background: "transparent", color: "var(--wtb-text)", border: "1px solid var(--wtb-border)", borderRadius: 6, fontSize: 14, cursor: "pointer", fontFamily: "'Jost', sans-serif", fontWeight: 300 }}
              >
                Cancel
              </button>
              <button
                onClick={startNewTimeline}
                style={{ padding: "10px 20px", background: "var(--wtb-accent)", color: "var(--wtb-on-accent)", border: "none", borderRadius: 6, fontSize: 14, cursor: "pointer", fontFamily: "'Jost', sans-serif", fontWeight: 300 }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
