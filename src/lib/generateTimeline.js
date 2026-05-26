import { formatTime, parseTimeInput } from "./time";
import { resolveWeddingLocations } from "./weddingLocations";
import { resolveRowTierFields } from "./rowTier";

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
 * @param {string} wizardAnswers.brideReadyAddress — Bride getting-ready venue name
 * @param {string} wizardAnswers.brideReadyStreet — Bride getting-ready street address
 * @param {boolean} wizardAnswers.brideReadyAtCeremony — Bride ready at ceremony venue
 * @param {boolean} wizardAnswers.brideReadyAtReception — Bride ready at reception venue
 * @param {string} wizardAnswers.groomReadyStreet — Groom getting-ready street address
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
 * @param {boolean} [wizardAnswers.preCeremonyBrideReady=true] — Bride getting-ready coverage (hair/makeup, dress on)
 * @param {boolean} [wizardAnswers.preCeremonyPreDress=false] — Bridal party pre-dress portraits
 * @param {boolean} [wizardAnswers.preCeremonyDetails=true] — Detail shots before ceremony
 * @param {boolean} [wizardAnswers.preCeremonyBrideParty=true] — Bride (dress on) bridal party portraits
 * @param {boolean} [wizardAnswers.preCeremonyGroomReady=true] — Groom getting-ready coverage
 * @param {boolean} [wizardAnswers.preCeremonyGroomParty=true] — Groom & party portraits
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
    brideReadyStreet: wiz_brideReadyStreet,
    brideReadyAtCeremony: wiz_brideReadyAtCeremony,
    brideReadyAtReception: wiz_brideReadyAtReception,
    groomReadyStreet: wiz_groomReadyStreet,
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
    speechMinutesPerSpeaker: wiz_speechMinutesPerSpeaker = 10,
    guestCount: wiz_guestCount,
    ceremonyNotes: wiz_ceremonyNotes,
    narrationBride: wiz_narrationBride,
    narrationGroom: wiz_narrationGroom,
    preCeremonyDetailRings: wiz_preCeremonyDetailRings,
    preCeremonyDetailDress: wiz_preCeremonyDetailDress,
    preCeremonyDetailDrone: wiz_preCeremonyDetailDrone,
    preCeremonyBrideSolo: wiz_preCeremonyBrideSolo,
    preCeremonyGroomSolo: wiz_preCeremonyGroomSolo,
    weddingPartyGroupShots: wiz_weddingPartyGroupShots,
    couplePortraits: wiz_couplePortraits,
    openDanceFloor: wiz_openDanceFloor,
    garterToss: wiz_garterToss,
    bouquetToss: wiz_bouquetToss,
    preCeremonyBrideReady: wiz_preCeremonyBrideReady,
    preCeremonyPreDress: wiz_preCeremonyPreDress,
    preCeremonyDetails: wiz_preCeremonyDetails,
    preCeremonyBrideParty: wiz_preCeremonyBrideParty,
    preCeremonyGroomReady: wiz_preCeremonyGroomReady,
    preCeremonyGroomParty: wiz_preCeremonyGroomParty,
    locations: wiz_locations,
    dinnerFlexibility: wiz_dinnerFlexibility = 0,
    receptionStartFlexibility: wiz_receptionStartFlexibility = 0,
    appliedLogisticsSuggestions: wiz_appliedLogisticsSuggestions = [],
  } = wizardAnswers;

  const skipPreCeremonyDrone = wiz_appliedLogisticsSuggestions.some(
    (s) => s.type === "move_drone"
  );
  const skipPreCeremonyDetails = wiz_appliedLogisticsSuggestions.some(
    (s) => s.type === "move_details"
  );
  const includePreCeremonyDetails =
    wiz_preCeremonyDetails !== false && !skipPreCeremonyDetails;
  const includePreCeremonyBrideReady = wiz_preCeremonyBrideReady === true;
  const includePreCeremonyPreDress = wiz_preCeremonyPreDress === true;
  const includePreCeremonyBrideParty = wiz_preCeremonyBrideParty !== false;
  const includePreCeremonyGroomReady = wiz_preCeremonyGroomReady !== false;
  const includePreCeremonyGroomParty = wiz_preCeremonyGroomParty !== false;
  const includePreCeremonyBrideSolo = wiz_preCeremonyBrideSolo !== false;
  const includePreCeremonyGroomSolo = wiz_preCeremonyGroomSolo !== false;
  const includeWeddingPartyGroup = wiz_weddingPartyGroupShots !== false;
  const includeCouplePortraits = wiz_couplePortraits !== false;

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
    let weddingPartyPre = neitherFitsPost && groupShotsBeforeCeremony && includeWeddingPartyGroup;
    let brideGroomPre = !bothFitPost && groupShotsBeforeCeremony && includeCouplePortraits;
    for (const s of wiz_appliedLogisticsSuggestions) {
      if (s.type === "move_pre_ceremony" && groupShotsBeforeCeremony) {
        if (s.targetEvents?.includes("Wedding Party: Group Shots")) weddingPartyPre = true;
        if (s.targetEvents?.includes("Bride & Groom: Portraits")) brideGroomPre = true;
      }
    }

    const familyGroupNotes = wiz_familyGroups !== "none" && wiz_familyGroupNames.some(n => n)
      ? wiz_familyGroupNames.filter(Boolean).map((n, i) => `${i + 1}. ${n}`).join(", ")
      : "";

    const {
      ceremony,
      reception,
      brideReady,
      groomReady,
      differentReadyLocations: differentLocations,
      addressByName,
    } = resolveWeddingLocations(wizardAnswers);
    const ceremonyVenueName = ceremony.name;
    const effectiveReceptionVenue = reception.name;
    const effectiveReceptionAddress = reception.address;
    const brideLoc = brideReady.name;
    const brideLocAddress = brideReady.address;
    const groomLoc = groomReady.name;
    const groomLocAddress = groomReady.address;

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
    const flOtherPhase    = wiz_firstLookOther       ? classifyFL(wiz_firstLookOtherLocation)       : null;

    const pushFLForPhaseExceptBridesmaids = (phase, arr) => {
      if (flGroomPhase  === phase) arr.push({ event: "First Look: with Groom",   duration: 10, isOutdoor: true });
      if (flParentPhase === phase) arr.push({ event: "First Look: with Parent",  duration: 10, isOutdoor: true });
      if (flOtherPhase  === phase) arr.push({ event: "First Look: Other",        duration: 10, isOutdoor: true });
    };
    // Bridesmaids first look always follows Putting Dress On and precedes bridesmaids portrait blocks
    const pushBridesmaidsFirstLook = (arr) => {
      if (wiz_firstLookBridesmaids) {
        arr.push({ event: "First Look: with Bridesmaids", duration: 10, isOutdoor: true });
      }
    };

    // ---- Build pre-ceremony blocks (scheduled backwards from ceremony start) ----
    const preBlocks = [];

    // === Phase 1: Bride's getting ready location ===
    // First block of the day — duration 0, establishes starting location
    preBlocks.push({ type: "location", event: brideLoc, address: brideLocAddress, duration: 0, notes: "Start of day" });
    // Detail shots (earliest in the day)
    const includeDetailRings = wiz_preCeremonyDetailRings !== false;
    const includeDetailDress = wiz_preCeremonyDetailDress !== false;
    const includeDetailDrone = wiz_preCeremonyDetailDrone !== false;
    if (includePreCeremonyDetails) {
      if (wiz_drone && !skipPreCeremonyDrone && includeDetailDrone) {
        preBlocks.push({ event: "Details: Drone & Venue Shots", duration: 30, isOutdoor: true });
      }
      if (includeDetailRings) preBlocks.push({ event: "Details: Rings, Invitations, & Accessories", duration: 20 });
      if (includeDetailDress) preBlocks.push({ event: "Details: Dress Shots", duration: 10 });
    }
    if (wiz_narration && wiz_narrationBride !== false) {
      preBlocks.push({ event: "Narration: Bride Record Narration", duration: 15 });
    }
    if (includePreCeremonyPreDress) {
      preBlocks.push({ event: "Bride (Pre-Dress): Bridesmaids Group Shots", duration: 10, isOutdoor: false });
      preBlocks.push({ event: "Bride (Pre-Dress): Bridesmaids Individual Shots", duration: 10, isOutdoor: false });
    }
    if (includePreCeremonyBrideReady) {
      preBlocks.push({ event: "Bride (Pre-Dress): Hair & Makeup Details", duration: 10, isOutdoor: false });
      preBlocks.push({ event: "Bride (Pre-Dress): Putting Dress On", duration: 10, isOutdoor: false });
    }
    // First looks after Putting Dress On when scheduled; otherwise assume bride is already dressed
    pushFLForPhaseExceptBridesmaids("bride", preBlocks);
    pushBridesmaidsFirstLook(preBlocks);
    preBlocks.push({ event: "Bride (Dress On): Accessory Shots", duration: 10 });
    if (includePreCeremonyBrideSolo) {
      preBlocks.push({ event: "Bride (Dress On): Solo Portraits", duration: 15, isOutdoor: true });
    }
    if (includePreCeremonyBrideParty) {
      preBlocks.push({ event: "Bride (Dress On): Bridesmaids Group Shots", duration: 10, isOutdoor: true });
      preBlocks.push({ event: "Bride (Dress On): Bridesmaids Individual Shots", duration: 10, isOutdoor: true });
    }

    // === Phase 2 / 2b: Groom events ===
    if (differentLocations) {
      // Phase 2: different location — travel block to groom's location
      const travelBrideToGroom = parseTravelMin(wiz_distanceBetweenReady) || 15;
      preBlocks.push({
        type: "location",
        event: groomLoc,
        address: groomLocAddress,
        duration: travelBrideToGroom,
        notes: `Travel from ${brideLoc} to ${groomLoc}`,
      });
    }
    if (includePreCeremonyGroomReady || includePreCeremonyGroomParty) {
      if (wiz_narration && wiz_narrationGroom !== false) {
        preBlocks.push({ event: "Narration: Groom Record Narration", duration: 15 });
      }
      if (includePreCeremonyGroomReady) {
        preBlocks.push({ event: "Groom: Assisted with Tie & Jacket", duration: 10 });
      }
      if (includePreCeremonyGroomSolo) {
        preBlocks.push({ event: "Groom: Solo Portraits", duration: 15, isOutdoor: true });
      }
      if (includePreCeremonyGroomParty) {
        preBlocks.push({ event: "Groom: Groomsmen Group Shots", duration: 10, isOutdoor: true });
        preBlocks.push({ event: "Groom: Groomsmen Individual Shots", duration: 10, isOutdoor: true });
      }
    }
    // First looks assigned to groom's location (only applies when differentLocations; otherwise
    // groomLoc === brideLoc so classifyFL returns "bride" and they were already pushed above)
    if (differentLocations) pushFLForPhaseExceptBridesmaids("groom", preBlocks);

    // === Phase 3: Ceremony venue ===
    const lastPreLocName = differentLocations ? groomLoc : brideLoc;
    const toCeremonyMin = differentLocations
      ? parseTravelMin(wiz_distanceGroomToCeremony)
      : parseTravelMin(wiz_distanceBrideToCeremony);
    preBlocks.push({
      type: "location",
      event: ceremonyVenueName,
      address: ceremony.address,
      duration: toCeremonyMin,
      notes: toCeremonyMin > 0 ? `Travel from ${lastPreLocName} to ${ceremonyVenueName}` : "",
    });
    // First looks assigned to ceremony venue (happens before couple/party portraits)
    pushFLForPhaseExceptBridesmaids("ceremony", preBlocks);
    // Pre-ceremony portraits only when post-ceremony time is insufficient
    if (weddingPartyPre) preBlocks.push({ event: "Wedding Party: Group Shots", duration: 15, isOutdoor: true });
    if (brideGroomPre) preBlocks.push({ event: "Bride & Groom: Portraits", duration: 20, isOutdoor: true });
    // A/V setup always immediately before ceremony — nothing between them
    preBlocks.push({ event: "Ceremony: Audio/Video Setup", duration: 20 });

    // === Schedule preBlocks backwards from ceremony start ===
    const totalPreDuration = preBlocks.reduce((sum, b) => sum + b.duration, 0);
    const preStart = ceremonyStartTime - totalPreDuration;
    let pt = preStart;
    for (const block of preBlocks) { block.time = pt; pt += block.duration; }

    // ---- Ceremony ----
    const ceremonyEventName = wiz_ceremonyDuration <= 45 ? "Ceremony: Average" : "Ceremony: Catholic";
    const ceremonyNoteParts = [];
    if (wiz_guestCount) ceremonyNoteParts.push(`Guest count: ${wiz_guestCount}`);
    if (wiz_ceremonyNotes) ceremonyNoteParts.push(String(wiz_ceremonyNotes).trim());
    const ceremonyBlockNotes = ceremonyNoteParts.filter(Boolean).join("\n");
    const ceremonyBlocks = [{
      event: ceremonyEventName,
      duration: ceremonyDurationMin,
      time: ceremonyStartTime,
      isOutdoor: wiz_ceremonyOutdoor,
      notes: ceremonyBlockNotes,
    }];

    // ---- Post-ceremony (Phase 3 continues at ceremony venue) ----
    const postBlocks = [];
    let postT = ceremonyStartTime + ceremonyDurationMin;
    const pushPost = (block) => { block.time = postT; postT += block.duration; postBlocks.push(block); };

    // Family photos — always immediately after ceremony, before anything else
    if (wiz_familyGroups === "5") {
      pushPost({ event: "Group Photos: Family (5 Groups)", duration: 20, notes: familyGroupNotes, isOutdoor: true });
    }
    if (wiz_familyGroups === "10") {
      pushPost({ event: "Group Photos: Family (10 Groups)", duration: 45, notes: familyGroupNotes, isOutdoor: true });
    }
    // Wedding Party: post if time allows; TIME CONSTRAINT if neither fits and can't go pre-ceremony
    if (!neitherFitsPost && includeWeddingPartyGroup) {
      pushPost({ event: "Wedding Party: Group Shots", duration: 15, isOutdoor: true });
    } else if (!groupShotsBeforeCeremony && includeWeddingPartyGroup) {
      pushPost({ type: "constraint", event: "TIME CONSTRAINT", duration: 0, notes: "Not enough post-ceremony time for Wedding Party Group Shots. Consider a later reception start or fewer family groups." });
    }
    // B&G Portraits: post if both fit; TIME CONSTRAINT if can't fit and can't go pre-ceremony
    if (bothFitPost && includeCouplePortraits) {
      pushPost({ event: "Bride & Groom: Portraits", duration: 20, isOutdoor: true });
    } else if (!groupShotsBeforeCeremony && includeCouplePortraits) {
      pushPost({ type: "constraint", event: "TIME CONSTRAINT", duration: 0, notes: "Not enough post-ceremony time for Bride & Groom Portraits. Consider a later reception start, fewer family groups, a first look, or the couple being visible to each other before the ceremony." });
    }

    // === Phase 4: Portrait locations (visit each once in order) ===
    if (wiz_portraitLocations.length > 0) {
      wiz_portraitLocations.forEach((loc, i) => {
        const fromName = i === 0
          ? ceremonyVenueName
          : (wiz_portraitLocations[i - 1].name || `Portrait Location ${i}`);
        const travelMin = i === 0 ? parseTravelMin(loc.distFromCeremony) : 0;
        const portraitName = loc.name || `Portrait Location ${i + 1}`;
        pushPost({
          type: "location",
          event: portraitName,
          address: loc.address || addressByName.get(portraitName) || "",
          duration: travelMin,
          notes: travelMin > 0 ? `Travel from ${fromName} to ${portraitName}` : "",
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
    if (wiz_speeches) {
      const perSpeaker = Math.max(1, parseInt(wiz_speechMinutesPerSpeaker, 10) || 10);
      addRec({
        event: "Reception: Speeches (Per Speaker)",
        duration: perSpeaker * wiz_speechCount,
        notes: `${wiz_speechCount} speaker${wiz_speechCount !== 1 ? "s" : ""} × ${perSpeaker} min`,
      });
    }
    if (wiz_openDanceFloor) addRec({ event: "Reception: Open Dance Floor", duration: 20 });
    if (wiz_garterToss)     addRec({ event: "Reception: Garder Belt Toss", duration: 15 });
    if (wiz_bouquetToss)    addRec({ event: "Reception: Bouquet Toss", duration: 15 });

    // ---- Assemble rows ----
    const allBlocks = [
      ...preBlocks, ...ceremonyBlocks, ...postBlocks,
      ...receptionBlocks,
    ];

    const earlierStart = wiz_appliedLogisticsSuggestions.find(
      (s) => s.type === "earlier_start" && s.newTime != null
    );
    if (earlierStart && allBlocks.length > 0) {
      const minTime = Math.min(...allBlocks.map((b) => b.time));
      if (minTime > earlierStart.newTime) {
        const shift = minTime - earlierStart.newTime;
        allBlocks.forEach((b) => {
          b.time -= shift;
        });
      }
    }

  const flexibility = {
    dinnerFlexibility: wiz_dinnerFlexibility,
    receptionStartFlexibility: wiz_receptionStartFlexibility,
  };
  let receptionStartFlexTagged = false;

  return allBlocks.map((block, idx) => {
    const isReceptionStart =
      !receptionStartFlexTagged &&
      block.time === receptionStartTime &&
      (block.event === "Reception: Audio/Video Setup" ||
        (block.type === "location" && block.event === effectiveReceptionVenue));
    if (isReceptionStart) receptionStartFlexTagged = true;

    const { tier, flexibilityMinutes } = resolveRowTierFields(block, flexibility, {
      isReceptionStart,
    });

    return {
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
      tier,
      flexibilityMinutes,
    };
  });
}
