import { formatTime, parseTimeInput } from "./time";

/**
 * Build timeline rows from wizard answers. Pure function — no React state or side effects.
 *
 * @param {object} wizardAnswers
 * @param {string} wizardAnswers.date — Wedding date (YYYY-MM-DD) for golden-hour estimate
 * @param {boolean} wizardAnswers.photoEnabled — Default photo flag on generated rows
 * @param {boolean} wizardAnswers.videoEnabled — Default video flag on generated rows
 * @param {number} wizardAnswers.ceremonyDuration — Ceremony length in minutes
 * @param {string} wizardAnswers.ceremonyHour — Ceremony start hour (1–12)
 * @param {string} wizardAnswers.ceremonyMinute — Ceremony start minute
 * @param {string} wizardAnswers.ceremonyPeriod — Ceremony start AM/PM
 * @param {string} wizardAnswers.receptionHour — Reception start hour
 * @param {string} wizardAnswers.receptionMinute — Reception start minute
 * @param {string} wizardAnswers.receptionPeriod — Reception start AM/PM
 * @param {boolean} wizardAnswers.firstLookGroom — Couple first look before ceremony
 * @param {boolean|null} wizardAnswers.brideOkayBefore — Bride visible to groom pre-ceremony
 * @param {boolean} wizardAnswers.grandEntrance — Reception grand entrance
 * @param {boolean} wizardAnswers.dinner — Reception dinner
 * @param {string} wizardAnswers.dinnerStartHour — Dinner start hour
 * @param {string} wizardAnswers.dinnerStartMinute — Dinner start minute
 * @param {string} wizardAnswers.dinnerStartPeriod — Dinner start AM/PM
 * @param {string|null} wizardAnswers.dinnerStyle — Dinner style label for notes
 * @param {string} wizardAnswers.familyGroups — "5", "10", or "none"
 * @param {string[]} wizardAnswers.familyGroupNames — Optional family group labels
 * @param {boolean} wizardAnswers.groomReadyAtCeremony — Groom ready at ceremony venue
 * @param {boolean} wizardAnswers.groomReadyAtReception — Groom ready at reception venue
 * @param {boolean} wizardAnswers.groomReadyAtBride — Groom ready at bride location
 * @param {string} wizardAnswers.groomReadyAddress — Groom getting-ready address/name
 * @param {string} wizardAnswers.ceremonyVenue — Ceremony venue name
 * @param {boolean} wizardAnswers.receptionSameAsCeremony — Reception at ceremony venue
 * @param {string} wizardAnswers.receptionVenue — Reception venue name
 * @param {string} wizardAnswers.receptionAddress — Reception address
 * @param {string} wizardAnswers.ceremonyAddress — Ceremony address
 * @param {string} wizardAnswers.brideReadyAddress — Bride getting-ready address/name
 * @param {boolean} wizardAnswers.firstLookParent — Parent first look
 * @param {boolean} wizardAnswers.firstLookBridesmaids — Bridesmaids first look
 * @param {boolean} wizardAnswers.firstLookOther — Other first look
 * @param {string} wizardAnswers.firstLookGroomLocation — Groom first-look location name
 * @param {string} wizardAnswers.firstLookParentLocation — Parent first-look location
 * @param {string} wizardAnswers.firstLookBridesmaidsLocation — Bridesmaids first-look location
 * @param {string} wizardAnswers.firstLookOtherLocation — Other first-look location
 * @param {boolean} wizardAnswers.drone — Drone coverage in package
 * @param {boolean} wizardAnswers.narration — Narration blocks included
 * @param {object[]} wizardAnswers.portraitLocations — Extra portrait location stops
 * @param {string} wizardAnswers.distanceBetweenReady — Travel min between ready locations
 * @param {string} wizardAnswers.distanceGroomToCeremony — Groom ready to ceremony travel
 * @param {string} wizardAnswers.distanceBrideToCeremony — Bride ready to ceremony travel
 * @param {string} wizardAnswers.distanceReceptionToCeremony — Reception to ceremony travel
 * @param {boolean} wizardAnswers.ceremonyOutdoor — Ceremony outdoors
 * @param {boolean} wizardAnswers.cakeCutting — Cake cutting at reception
 * @param {boolean} wizardAnswers.firstDance — First dance at reception
 * @param {boolean} wizardAnswers.brideParentDance — Bride parent dance
 * @param {boolean} wizardAnswers.groomParentDance — Groom parent dance
 * @param {boolean} wizardAnswers.specialDance — Special dance
 * @param {boolean} wizardAnswers.speeches — Speeches at reception
 * @param {number} wizardAnswers.speechCount — Number of speakers
 * @param {boolean} wizardAnswers.openDanceFloor — Open dancing
 * @param {boolean} wizardAnswers.garterToss — Garter toss
 * @param {boolean} wizardAnswers.bouquetToss — Bouquet toss
 * @returns {object[]} Timeline row objects
 */
export function generateTimeline(wizardAnswers) {
  const {
    date,
    photoEnabled,
    videoEnabled,
    ceremonyDuration: wiz_ceremonyDuration,
    ceremonyHour: wiz_ceremonyHour,
    ceremonyMinute: wiz_ceremonyMinute,
    ceremonyPeriod: wiz_ceremonyPeriod,
    receptionHour: wiz_receptionHour,
    receptionMinute: wiz_receptionMinute,
    receptionPeriod: wiz_receptionPeriod,
    firstLookGroom: wiz_firstLookGroom,
    brideOkayBefore: wiz_brideOkayBefore,
    grandEntrance: wiz_grandEntrance,
    dinner: wiz_dinner,
    dinnerStartHour: wiz_dinnerStartHour,
    dinnerStartMinute: wiz_dinnerStartMinute,
    dinnerStartPeriod: wiz_dinnerStartPeriod,
    dinnerStyle: wiz_dinnerStyle,
    familyGroups: wiz_familyGroups,
    familyGroupNames: wiz_familyGroupNames,
    groomReadyAtCeremony: wiz_groomReadyAtCeremony,
    groomReadyAtReception: wiz_groomReadyAtReception,
    groomReadyAtBride: wiz_groomReadyAtBride,
    groomReadyAddress: wiz_groomReadyAddress,
    ceremonyVenue: wiz_ceremonyVenue,
    receptionSameAsCeremony: wiz_receptionSameAsCeremony,
    receptionVenue: wiz_receptionVenue,
    receptionAddress: wiz_receptionAddress,
    ceremonyAddress: wiz_ceremonyAddress,
    brideReadyAddress: wiz_brideReadyAddress,
    firstLookParent: wiz_firstLookParent,
    firstLookBridesmaids: wiz_firstLookBridesmaids,
    firstLookOther: wiz_firstLookOther,
    firstLookGroomLocation: wiz_firstLookGroomLocation,
    firstLookParentLocation: wiz_firstLookParentLocation,
    firstLookBridesmaidsLocation: wiz_firstLookBridesmaidsLocation,
    firstLookOtherLocation: wiz_firstLookOtherLocation,
    drone: wiz_drone,
    narration: wiz_narration,
    portraitLocations: wiz_portraitLocations,
    distanceBetweenReady: wiz_distanceBetweenReady,
    distanceGroomToCeremony: wiz_distanceGroomToCeremony,
    distanceBrideToCeremony: wiz_distanceBrideToCeremony,
    distanceReceptionToCeremony: wiz_distanceReceptionToCeremony,
    ceremonyOutdoor: wiz_ceremonyOutdoor,
    cakeCutting: wiz_cakeCutting,
    firstDance: wiz_firstDance,
    brideParentDance: wiz_brideParentDance,
    groomParentDance: wiz_groomParentDance,
    specialDance: wiz_specialDance,
    speeches: wiz_speeches,
    speechCount: wiz_speechCount,
    openDanceFloor: wiz_openDanceFloor,
    garterToss: wiz_garterToss,
    bouquetToss: wiz_bouquetToss,
  } = wizardAnswers;

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
      ...receptionBlocks,
    ];

  return allBlocks.map((block, idx) => ({
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
}
