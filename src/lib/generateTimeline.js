import { formatTime, parseTimeInput } from "./time";

export function generateTimeline(ctx) {
  const {
    date, photoEnabled, videoEnabled,
    wiz_ceremonyDuration, wiz_ceremonyHour, wiz_ceremonyMinute, wiz_ceremonyPeriod,
    wiz_receptionHour, wiz_receptionMinute, wiz_receptionPeriod,
    wiz_firstLookGroom, wiz_brideOkayBefore,
    wiz_grandEntrance, wiz_dinner, wiz_dinnerStartHour, wiz_dinnerStartMinute, wiz_dinnerStartPeriod,
    wiz_familyGroups, wiz_familyGroupNames,
    wiz_groomReadyAtCeremony, wiz_groomReadyAtReception, wiz_groomReadyAtBride, wiz_groomReadyAddress,
    wiz_ceremonyVenue, wiz_receptionSameAsCeremony, wiz_receptionVenue, wiz_receptionAddress, wiz_ceremonyAddress,
    wiz_brideReadyAddress,
    wiz_firstLookParent, wiz_firstLookBridesmaids, wiz_firstLookOther,
    wiz_firstLookGroomLocation, wiz_firstLookParentLocation, wiz_firstLookBridesmaidsLocation, wiz_firstLookOtherLocation,
    wiz_drone, wiz_narration, wiz_portraitLocations,
    wiz_distanceBetweenReady, wiz_distanceGroomToCeremony, wiz_distanceBrideToCeremony, wiz_distanceReceptionToCeremony,
    wiz_ceremonyOutdoor, wiz_goldenHour,
    wiz_cakeCutting, wiz_firstDance, wiz_brideParentDance, wiz_groomParentDance, wiz_specialDance,
    wiz_speeches, wiz_speechCount, wiz_openDanceFloor, wiz_garterToss, wiz_bouquetToss,
    wiz_photoCoverageHours, wiz_videoCoverageHours,
    setUserRows, setNextId, setHistory, setRedoStack,
    setPhotoStartHour, setPhotoStartMinute, setPhotoStartPeriod, setPhotoEndHour, setPhotoEndMinute, setPhotoEndPeriod,
    setVideoStartHour, setVideoStartMinute, setVideoStartPeriod, setVideoEndHour, setVideoEndMinute, setVideoEndPeriod,
    setScreen, setShowSettingsModal, mainScrollRef,
  } = ctx;

    // ---- Setup ----
    const ceremonyDurationMin = wiz_ceremonyDuration || 30;
    const ceremonyStartTime = parseTimeInput(wiz_ceremonyHour, wiz_ceremonyMinute, wiz_ceremonyPeriod);
    const receptionStartTime = parseTimeInput(wiz_receptionHour, wiz_receptionMinute, wiz_receptionPeriod);
    const groupShotsBeforeCeremony = wiz_firstLookGroom || wiz_brideOkayBefore === true;
    const parseTravelMin = (str) => { const n = parseInt(str, 10); return isNaN(n) ? 0 : n; };

    // ---- Smart portrait scheduling: determine pre vs. post-ceremony placement ----
    const ceremonyEndTime = ceremonyStartTime + ceremonyDurationMin;
    // First fixed reception event the couple must attend determines available post-ceremony window
    let firstFixedReceptionTime = receptionStartTime;
    if (wiz_grandEntrance) {
      firstFixedReceptionTime = receptionStartTime + 20; // Grand Entrance follows A/V setup (20 min)
      if (wiz_dinner) {
        const dinnerT = parseTimeInput(wiz_dinnerStartHour, wiz_dinnerStartMinute, wiz_dinnerStartPeriod);
        if (dinnerT < firstFixedReceptionTime) firstFixedReceptionTime = dinnerT;
      }
    } else if (wiz_dinner) {
      firstFixedReceptionTime = parseTimeInput(wiz_dinnerStartHour, wiz_dinnerStartMinute, wiz_dinnerStartPeriod);
    }
    const familyDuration = wiz_familyGroups === "5" ? 20 : wiz_familyGroups === "10" ? 45 : 0;
    const availablePostCeremony = firstFixedReceptionTime - ceremonyEndTime;
    const remainingAfterFamily = availablePostCeremony - familyDuration;
    const neitherFitsPost = remainingAfterFamily < 15;
    const bothFitPost     = remainingAfterFamily >= 35;
    // Pre-ceremony flags: only when post-ceremony time is insufficient and couple can be seen before
    const weddingPartyPre = neitherFitsPost && groupShotsBeforeCeremony;
    const brideGroomPre   = !bothFitPost && groupShotsBeforeCeremony;

    // Golden hour by month (Northern Michigan, sunset − 45 min)
    const GOLDEN_HOUR_BY_MONTH = [990, 1035, 1125, 1170, 1200, 1230, 1215, 1170, 1125, 1080, 990, 960];
    let goldenHourTime = null;
    let weddingMonth = null;
    if (date) {
      const parts = date.split("-");
      if (parts.length >= 2) {
        const m = parseInt(parts[1], 10) - 1;
        if (m >= 0 && m <= 11) { weddingMonth = m; goldenHourTime = GOLDEN_HOUR_BY_MONTH[m]; }
      }
    }

    const familyGroupNotes = wiz_familyGroups !== "none" && wiz_familyGroupNames.some(n => n)
      ? wiz_familyGroupNames.filter(Boolean).map((n, i) => `${i + 1}. ${n}`).join(", ")
      : "";

    const differentLocations = !wiz_groomReadyAtCeremony && !wiz_groomReadyAtReception && !wiz_groomReadyAtBride && !!wiz_groomReadyAddress;
    const ceremonyVenueName = wiz_ceremonyVenue || "ceremony venue";
    const effectiveReceptionVenue = wiz_receptionSameAsCeremony ? ceremonyVenueName : (wiz_receptionVenue || "reception venue");
    const effectiveReceptionAddress = wiz_receptionSameAsCeremony ? (wiz_ceremonyAddress || "") : (wiz_receptionAddress || "");
    const brideLoc = wiz_brideReadyAddress || "Getting Ready Location";
    const groomLoc = differentLocations ? (wiz_groomReadyAddress || "Groom's Getting Ready Location") : brideLoc;

    // ---- Classify each first look into the phase where it will occur ----
    // Phase = "bride" | "groom" | "ceremony"
    // Never detour — if location unrecognised or unset, default to ceremony
    const classifyFL = (locVal) => {
      if (!locVal) return "ceremony";
      if (locVal === brideLoc) return "bride";
      if (differentLocations && locVal === groomLoc) return "groom";
      if (locVal === ceremonyVenueName) return "ceremony";
      return "ceremony";
    };
    const flGroomPhase    = wiz_firstLookGroom       ? classifyFL(wiz_firstLookGroomLocation)       : null;
    const flParentPhase   = wiz_firstLookParent      ? classifyFL(wiz_firstLookParentLocation)      : null;
    const flBmaidsPhase   = wiz_firstLookBridesmaids ? classifyFL(wiz_firstLookBridesmaidsLocation)  : null;
    const flOtherPhase    = wiz_firstLookOther       ? classifyFL(wiz_firstLookOtherLocation)       : null;

    const pushFLForPhase = (phase, arr) => {
      if (flGroomPhase  === phase) arr.push({ event: "First Look: with Groom",      duration: 10, isOutdoor: true });
      if (flParentPhase === phase) arr.push({ event: "First Look: with Parent",     duration: 10, isOutdoor: true });
      if (flBmaidsPhase === phase) arr.push({ event: "First Look: with Bridesmaids", duration: 10, isOutdoor: true });
      if (flOtherPhase  === phase) arr.push({ event: "First Look: Other",           duration: 10, isOutdoor: true });
    };

    // ---- Build pre-ceremony blocks (scheduled backwards from ceremony start) ----
    const preBlocks = [];

    // === Phase 1: Bride's getting ready location ===
    // First block of the day — duration 0, establishes starting location
    preBlocks.push({ type: "location", event: brideLoc, address: "", duration: 0, notes: "Start of day" });
    // Detail shots (earliest in the day)
    if (wiz_drone) preBlocks.push({ event: "Details: Drone & Venue Shots", duration: 30, isOutdoor: true });
    preBlocks.push({ event: "Details: Rings, Invitations, & Accessories", duration: 20 });
    preBlocks.push({ event: "Details: Dress Shots", duration: 10 });
    // Bride narration before portrait blocks
    if (wiz_narration) preBlocks.push({ event: "Narration: Bride Record Narration", duration: 15 });
    // Bride pre-dress
    preBlocks.push({ event: "Bride (Pre-Dress): Bridesmaids Group Shots",    duration: 10, isOutdoor: false });
    preBlocks.push({ event: "Bride (Pre-Dress): Bridesmaids Individual Shots", duration: 10, isOutdoor: false });
    preBlocks.push({ event: "Bride (Pre-Dress): Hair & Makeup Details",     duration: 10, isOutdoor: false });
    preBlocks.push({ event: "Bride (Pre-Dress): Putting Dress On",          duration: 10, isOutdoor: false });
    // Bride dress on (first looks can only occur after Putting Dress On)
    preBlocks.push({ event: "Bride (Dress On): Accessory Shots",            duration: 10 });
    preBlocks.push({ event: "Bride (Dress On): Bride Portraits",            duration: 15, isOutdoor: true });
    preBlocks.push({ event: "Bride (Dress On): Bridesmaids Group Shots",     duration: 10, isOutdoor: true });
    preBlocks.push({ event: "Bride (Dress On): Bridesmaids Individual Shots",duration: 10, isOutdoor: true });
    // First looks assigned to bride's getting ready location
    pushFLForPhase("bride", preBlocks);

    // === Phase 2 / 2b: Groom events ===
    if (differentLocations) {
      // Phase 2: different location — travel block to groom's location
      const travelBrideToGroom = parseTravelMin(wiz_distanceBetweenReady) || 15;
      preBlocks.push({ type: "location", event: groomLoc, address: "", duration: travelBrideToGroom, notes: `Travel from ${brideLoc} to ${groomLoc}` });
    }
    // Groom narration before groom portrait blocks
    if (wiz_narration) preBlocks.push({ event: "Narration: Groom Record Narration", duration: 15 });
    preBlocks.push({ event: "Groom: Assisted with Tie & Jacket",  duration: 10 });
    preBlocks.push({ event: "Groom: Portraits",                   duration: 15, isOutdoor: true });
    preBlocks.push({ event: "Groom: Groomsmen Group Shots",       duration: 10, isOutdoor: true });
    preBlocks.push({ event: "Groom: Groomsmen Individual Shots",  duration: 10, isOutdoor: true });
    // First looks assigned to groom's location (only applies when differentLocations; otherwise
    // groomLoc === brideLoc so classifyFL returns "bride" and they were already pushed above)
    if (differentLocations) pushFLForPhase("groom", preBlocks);

    // === Phase 3: Ceremony venue ===
    const lastPreLocName = differentLocations ? groomLoc : brideLoc;
    const toCeremonyMin = differentLocations
      ? parseTravelMin(wiz_distanceGroomToCeremony)
      : parseTravelMin(wiz_distanceBrideToCeremony);
    preBlocks.push({
      type: "location",
      event: ceremonyVenueName,
      address: wiz_ceremonyAddress || "",
      duration: toCeremonyMin,
      notes: toCeremonyMin > 0 ? `Travel from ${lastPreLocName} to ${ceremonyVenueName}` : ""
    });
    // First looks assigned to ceremony venue (happens before couple/party portraits)
    pushFLForPhase("ceremony", preBlocks);
    // Pre-ceremony portraits only when post-ceremony time is insufficient
    if (weddingPartyPre) preBlocks.push({ event: "Wedding Party: Group Shots", duration: 15, isOutdoor: true });
    if (brideGroomPre)   preBlocks.push({ event: "Bride & Groom: Portraits",   duration: 20, isOutdoor: true });
    // A/V setup always immediately before ceremony — nothing between them
    preBlocks.push({ event: "Ceremony: Audio/Video Setup", duration: 20 });

    // === Schedule preBlocks backwards from ceremony start ===
    const totalPreDuration = preBlocks.reduce((sum, b) => sum + b.duration, 0);
    const preStart = ceremonyStartTime - totalPreDuration;
    let pt = preStart;
    for (const block of preBlocks) { block.time = pt; pt += block.duration; }

    // ---- Ceremony ----
    const ceremonyEventName = wiz_ceremonyDuration <= 45 ? "Ceremony: Average" : "Ceremony: Catholic";
    const ceremonyBlocks = [{ event: ceremonyEventName, duration: ceremonyDurationMin, time: ceremonyStartTime, isOutdoor: wiz_ceremonyOutdoor }];

    // ---- Post-ceremony (Phase 3 continues at ceremony venue) ----
    const postBlocks = [];
    let postT = ceremonyStartTime + ceremonyDurationMin;
    const pushPost = (block) => { block.time = postT; postT += block.duration; postBlocks.push(block); };

    // Family photos — always immediately after ceremony, before anything else
    if (wiz_familyGroups === "5")  pushPost({ event: "Group Photos: Family (5 Groups)",  duration: 20, notes: familyGroupNotes, isOutdoor: true });
    if (wiz_familyGroups === "10") pushPost({ event: "Group Photos: Family (10 Groups)", duration: 45, notes: familyGroupNotes, isOutdoor: true });
    // Wedding Party: post if time allows; TIME CONSTRAINT if neither fits and can't go pre-ceremony
    if (!neitherFitsPost) {
      pushPost({ event: "Wedding Party: Group Shots", duration: 15, isOutdoor: true });
    } else if (!groupShotsBeforeCeremony) {
      pushPost({ type: "constraint", event: "TIME CONSTRAINT", duration: 0, notes: "Not enough post-ceremony time for Wedding Party Group Shots. Consider a later reception start or fewer family groups." });
    }
    // B&G Portraits: post if both fit; TIME CONSTRAINT if can't fit and can't go pre-ceremony
    if (bothFitPost) {
      pushPost({ event: "Bride & Groom: Portraits", duration: 20, isOutdoor: true });
    } else if (!groupShotsBeforeCeremony) {
      pushPost({ type: "constraint", event: "TIME CONSTRAINT", duration: 0, notes: "Not enough post-ceremony time for Bride & Groom Portraits. Consider a later reception start, fewer family groups, a first look, or the couple being visible to each other before the ceremony." });
    }

    // === Phase 4: Portrait locations (visit each once in order) ===
    if (wiz_portraitLocations.length > 0) {
      wiz_portraitLocations.forEach((loc, i) => {
        const fromName = i === 0
          ? ceremonyVenueName
          : (wiz_portraitLocations[i - 1].name || `Portrait Location ${i}`);
        const travelMin = i === 0 ? parseTravelMin(loc.distFromCeremony) : 0;
        pushPost({
          type: "location",
          event: loc.name || `Portrait Location ${i + 1}`,
          address: loc.address || "",
          duration: travelMin,
          notes: travelMin > 0 ? `Travel from ${fromName} to ${loc.name || `Portrait Location ${i + 1}`}` : ""
        });
        pushPost({ event: "Bride & Groom: Portraits", duration: 20, location: loc.name || "", isOutdoor: true });
      });
      // Travel from last portrait location to reception
      const lastPortraitLoc = wiz_portraitLocations[wiz_portraitLocations.length - 1];
      const travelToReception = parseTravelMin(lastPortraitLoc.distFromReception);
      if (travelToReception > 0) {
        pushPost({ type: "location", event: effectiveReceptionVenue, address: effectiveReceptionAddress, duration: travelToReception, notes: `Travel from ${lastPortraitLoc.name || "portrait location"} to ${effectiveReceptionVenue}` });
      }
    }

    // Travel from ceremony to reception (only when no portrait locations handle the transit)
    if (wiz_portraitLocations.length === 0 && !wiz_receptionSameAsCeremony) {
      const travelCeremonyToReception = parseTravelMin(wiz_distanceReceptionToCeremony);
      if (travelCeremonyToReception > 0) {
        pushPost({ type: "location", event: effectiveReceptionVenue, address: effectiveReceptionAddress, duration: travelCeremonyToReception, notes: `Travel from ${ceremonyVenueName} to ${effectiveReceptionVenue}` });
      }
    }

    // Time constraint if post-ceremony events run past reception start
    if (postT > receptionStartTime && postBlocks.length > 0) {
      const recFmt = formatTime(receptionStartTime);
      const postFmt = formatTime(postT);
      pushPost({
        type: "constraint",
        event: "TIME CONSTRAINT",
        duration: 0,
        time: receptionStartTime,
        notes: `Not enough time to complete post-ceremony events before reception start (${recFmt.hour}:${recFmt.minute} ${recFmt.period}). Post-ceremony events would end at ${postFmt.hour}:${postFmt.minute} ${postFmt.period}. Consider starting the reception later, reducing family groupings, or removing some portrait locations.`,
      });
    }

    // Golden hour — time-anchored to calculated golden hour, with notes if it conflicts
    let goldenHourBlock = null;
    if (wiz_goldenHour) {
      const ceremonyEnd = ceremonyStartTime + ceremonyDurationMin;
      goldenHourBlock = { event: "Bride & Groom: Golden Hour Portraits", duration: 20, notes: "", isOutdoor: true };
      if (goldenHourTime !== null && weddingMonth !== null) {
        const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        const ghStartFmt = formatTime(goldenHourTime);
        const ghEndFmt = formatTime(goldenHourTime + 20);
        const ghTimeNote = `Estimated golden hour: ${ghStartFmt.hour}:${ghStartFmt.minute} ${ghStartFmt.period} – ${ghEndFmt.hour}:${ghEndFmt.minute} ${ghEndFmt.period} based on a ${MONTH_NAMES[weddingMonth]} wedding in Northern Michigan.`;
        goldenHourBlock.time = goldenHourTime;
        if (goldenHourTime < ceremonyEnd) {
          goldenHourBlock.notes = `Golden hour falls before or during ceremony. Consider scheduling portraits immediately after. ${ghTimeNote}`;
        } else if (goldenHourTime >= receptionStartTime) {
          goldenHourBlock.notes = `Golden hour falls during reception. Couple may want to step away briefly for portraits. ${ghTimeNote}`;
        } else {
          goldenHourBlock.notes = ghTimeNote;
        }
      } else {
        goldenHourBlock.time = postT;
      }
    }

    // === Phase 5: Reception venue ===
    const receptionBlocks = [];
    let recT = receptionStartTime;
    const addRec = (block) => { block.time = recT; recT += block.duration; receptionBlocks.push(block); };

    // Location marker at reception start — skip if same venue as ceremony (no travel needed)
    if (!wiz_receptionSameAsCeremony) {
      addRec({ type: "location", event: effectiveReceptionVenue, address: effectiveReceptionAddress, duration: 0, notes: "" });
    }
    // A/V setup always first at reception, Grand Entrance always immediately after
    addRec({ event: "Reception: Audio/Video Setup", duration: 20 });
    if (wiz_grandEntrance) addRec({ event: "Reception: Grand Entrances", duration: 10 });
    if (wiz_cakeCutting)   addRec({ event: "Reception: Cake Cutting", duration: 5 });
    if (wiz_firstDance)    addRec({ event: "Reception: Bride & Groom Dance", duration: 5 });
    if (wiz_brideParentDance) addRec({ event: "Reception: Bride & Parent Dance", duration: 5 });
    if (wiz_groomParentDance) addRec({ event: "Reception: Groom & Parent Dance", duration: 5 });
    if (wiz_specialDance)  addRec({ event: "Reception: Special Dance", duration: 5 });
    if (wiz_dinner) {
      const dinnerTime = parseTimeInput(wiz_dinnerStartHour, wiz_dinnerStartMinute, wiz_dinnerStartPeriod);
      recT = Math.max(recT, dinnerTime);
      addRec({ event: "Reception: Dinner", duration: 60, notes: wiz_dinnerStyle ? `Style: ${wiz_dinnerStyle}` : "" });
    }
    if (wiz_speeches)       addRec({ event: "Reception: Speeches (Per Speaker)", duration: 10 * wiz_speechCount, notes: `${wiz_speechCount} speaker${wiz_speechCount !== 1 ? "s" : ""} total` });
    if (wiz_openDanceFloor) addRec({ event: "Reception: Open Dance Floor", duration: 20 });
    if (wiz_garterToss)     addRec({ event: "Reception: Garder Belt Toss", duration: 15 });
    if (wiz_bouquetToss)    addRec({ event: "Reception: Bouquet Toss", duration: 15 });

    // ---- Assemble rows ----
    const allBlocks = [
      ...preBlocks, ...ceremonyBlocks, ...postBlocks,
      ...(goldenHourBlock ? [goldenHourBlock] : []),
      ...receptionBlocks,
    ];

    const newRows = allBlocks.map((block, idx) => ({
      id: idx + 1,
      event: block.event,
      time: block.time,
      duration: block.duration,
      location: block.location || "",
      isOutdoor: block.isOutdoor || false,
      photo: photoEnabled,
      video: videoEnabled,
      notes: block.notes || "",
      isTimeLocked: false,
      color: block.color || "",
      type: block.type || "event",
      address: block.address || "",
    }));
    setUserRows(newRows);
    setNextId(newRows.length + 1);
    setHistory([]);
    setRedoStack([]);

    // Set photo/video coverage windows from Step 1 hours
    if (allBlocks.length > 0) {
      const coverageStart = allBlocks[0].time;
      if (wiz_photoCoverageHours) {
        const photoEnd = coverageStart + parseFloat(wiz_photoCoverageHours) * 60;
        const ps = formatTime(coverageStart); const pe = formatTime(photoEnd);
        setPhotoStartHour(ps.hour); setPhotoStartMinute(ps.minute); setPhotoStartPeriod(ps.period);
        setPhotoEndHour(pe.hour); setPhotoEndMinute(pe.minute); setPhotoEndPeriod(pe.period);
      }
      if (wiz_videoCoverageHours) {
        const videoEnd = coverageStart + parseFloat(wiz_videoCoverageHours) * 60;
        const vs = formatTime(coverageStart); const ve = formatTime(videoEnd);
        setVideoStartHour(vs.hour); setVideoStartMinute(vs.minute); setVideoStartPeriod(vs.period);
        setVideoEndHour(ve.hour); setVideoEndMinute(ve.minute); setVideoEndPeriod(ve.period);
      }
    }

    setScreen("timeline");
    setShowSettingsModal(false);
    if (mainScrollRef.current) mainScrollRef.current.scrollTop = 0;
}
