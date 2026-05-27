import { useEffect } from "react";
import { PROJECT_VERSION, AUTOSAVE_KEY } from "../constants/wizard";
import { normalizeTimelineRow } from "../lib/rowTier";

export function useProjectStorage(state) {
  const {
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
    userRows,
    fixedEvents,
    screen,
    nextId,
    enteredViaWizard,
    setDate,
    setBride,
    setGroom,
    setBrideLabel,
    setGroomLabel,
    setPhotoStartHour,
    setPhotoStartMinute,
    setPhotoStartPeriod,
    setPhotoEndHour,
    setPhotoEndMinute,
    setPhotoEndPeriod,
    setVideoStartHour,
    setVideoStartMinute,
    setVideoStartPeriod,
    setVideoEndHour,
    setVideoEndMinute,
    setVideoEndPeriod,
    setPhotoEnabled,
    setVideoEnabled,
    setUserRows,
    setNextId,
    setFixedEvents,
    setHistory,
    setRedoStack,
    setScreen,
    setEnteredViaWizard,
    setVersionNotice,
    setShowAutosaveBanner,
    clearDirty,
    isTimelineEmpty,
    mainScrollRef,
    isApplyingProjectRef,
    suppressDirtyRef,
    dirtyTrackingEnabledRef,
    autosaveTimerRef,
  } = state;

  const buildDefaultFilename = (ext) => {
    const formatDatePart = (s) => {
      if (!s) return "";

      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        const [y, m, d] = s.split("-");
        return `${m}_${d}_${y}`;
      }
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
        const [m, d, y] = s.split("/");
        return `${m}_${d}_${y}`;
      }
      const dt = new Date(s);
      if (!isNaN(dt.getTime())) {
        const mm = String(dt.getMonth() + 1).padStart(2, "0");
        const dd = String(dt.getDate()).padStart(2, "0");
        const yyyy = String(dt.getFullYear());
        return `${mm}_${dd}_${yyyy}`;
      }
      return "";
    };

    const sanitize = (str) =>
      String(str)
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9._()&-]/g, "");

    const datePart = formatDatePart(date) || "MM_DD_YYYY";
    const brideFirst = (bride || "Bride").toString().trim().split(/\s+/)[0] || "Bride";
    const groomFirst = (groom || "Groom").toString().trim().split(/\s+/)[0] || "Groom";

    const base =
      datePart +
      "_" +
      sanitize(brideFirst) +
      "_&_" +
      sanitize(groomFirst) +
      "_Timeline";
    return base + "." + ext;
  };

  const buildProjectData = () => ({
    version: PROJECT_VERSION,
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
    userRows,
    fixedEvents,
    enteredViaWizard,
  });

  const writeAutosave = () => {
    try {
      localStorage.setItem(
        AUTOSAVE_KEY,
        JSON.stringify({ ...buildProjectData(), screen, nextId, enteredViaWizard })
      );
    } catch (_) {
      /* ignore storage errors */
    }
  };

  const flushAutosave = () => {
    if (!dirtyTrackingEnabledRef.current || isApplyingProjectRef.current || isTimelineEmpty()) {
      return;
    }
    writeAutosave();
  };

  const applyProjectData = (projectData) => {
    suppressDirtyRef.current = true;
    setDate(projectData.date || "");
    setBride(projectData.bride || "");
    setGroom(projectData.groom || "");
    setBrideLabel(projectData.brideLabel || "Bride");
    setGroomLabel(projectData.groomLabel || "Groom");

    setPhotoStartHour(projectData.photoStartHour || "12");
    setPhotoStartMinute(projectData.photoStartMinute || "00");
    setPhotoStartPeriod(projectData.photoStartPeriod || "PM");
    setPhotoEndHour(projectData.photoEndHour || "5");
    setPhotoEndMinute(projectData.photoEndMinute || "00");
    setPhotoEndPeriod(projectData.photoEndPeriod || "PM");

    setVideoStartHour(projectData.videoStartHour || "12");
    setVideoStartMinute(projectData.videoStartMinute || "00");
    setVideoStartPeriod(projectData.videoStartPeriod || "PM");
    setVideoEndHour(projectData.videoEndHour || "5");
    setVideoEndMinute(projectData.videoEndMinute || "00");
    setVideoEndPeriod(projectData.videoEndPeriod || "PM");

    setPhotoEnabled(
      typeof projectData.photoEnabled === "boolean" ? projectData.photoEnabled : true
    );
    setVideoEnabled(
      typeof projectData.videoEnabled === "boolean" ? projectData.videoEnabled : true
    );

    const loadedRows = projectData.userRows;
    setUserRows(
      loadedRows && loadedRows.length > 0
        ? loadedRows.map((r) =>
            normalizeTimelineRow({
              photo: true,
              video: true,
              notes: "",
              ...r,
            })
          )
        : [
            normalizeTimelineRow({
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
            }),
          ]
    );

    if (loadedRows && loadedRows.length > 0) {
      const maxId = Math.max(...loadedRows.map((r) => r.id || 0));
      setNextId(maxId + 1);
    } else if (projectData.nextId) {
      setNextId(projectData.nextId);
    }

    setFixedEvents(projectData.fixedEvents || []);
    setEnteredViaWizard(
      typeof projectData.enteredViaWizard === "boolean" ? projectData.enteredViaWizard : true
    );
    setHistory([]);
    setRedoStack([]);
    suppressDirtyRef.current = false;
  };

  const clearAutosave = () => {
    try {
      localStorage.removeItem(AUTOSAVE_KEY);
    } catch (_) {
      /* ignore storage errors */
    }
    setShowAutosaveBanner(false);
  };

  const saveProject = () => {
    const dataStr = JSON.stringify(buildProjectData(), null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = buildDefaultFilename("json");
    link.click();
    URL.revokeObjectURL(url);
    clearAutosave();
    clearDirty();
  };

  const loadProject = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const projectData = JSON.parse(e.target.result);
        isApplyingProjectRef.current = true;
        applyProjectData(projectData);
        const version = projectData.version;
        if (!version || version < PROJECT_VERSION) {
          setVersionNotice(
            "This project was saved with an older version of the app. Some features may not be available."
          );
        } else {
          setVersionNotice(null);
        }
        clearDirty();
        clearAutosave();
        setScreen("timeline");
        isApplyingProjectRef.current = false;
      } catch (err) {
        alert("Error loading project file");
        isApplyingProjectRef.current = false;
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const restoreAutosave = () => {
    try {
      const raw = localStorage.getItem(AUTOSAVE_KEY);
      if (!raw) return;
      const projectData = JSON.parse(raw);
      isApplyingProjectRef.current = true;
      applyProjectData(projectData);
      setScreen("timeline");
      clearDirty();
      setShowAutosaveBanner(false);
      isApplyingProjectRef.current = false;
      if (mainScrollRef.current) mainScrollRef.current.scrollTop = 0;
    } catch (_) {
      clearAutosave();
    }
  };

  useEffect(() => {
    if (!dirtyTrackingEnabledRef.current || isApplyingProjectRef.current || isTimelineEmpty()) {
      return;
    }
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(writeAutosave, 500);
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
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

  return {
    buildDefaultFilename,
    buildProjectData,
    applyProjectData,
    clearAutosave,
    saveProject,
    loadProject,
    restoreAutosave,
    flushAutosave,
  };
}
