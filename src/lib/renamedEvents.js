/**
 * Event names are lookup keys and saved files store them. When a template
 * block is renamed, add the old name here so timelines saved before the
 * rename load with the new name.
 */
const RENAMED_EVENTS = {
  // Phase 0: typos
  "Details: Rings,Invitations, & Accessories": "Details: Rings, Invitations, & Accessories",
  "Reception: Garder Belt Toss": "Reception: Garter Belt Toss",
  // Phase 2.7: plain-language names
  "Ceremony: Average": "Ceremony: About 30 min",
  "Ceremony: Catholic": "Ceremony: Catholic Mass, about 1 hr",
  "Ceremony: Audio/Video Setup": "Ceremony: Sound and camera setup",
  "Reception: Audio/Video Setup": "Reception: Sound and camera setup",
};

// Phase 2.7: renamed categories (the part before ": ").
const RENAMED_PREFIXES = [
  ["Bride (Pre-Dress): ", "Bride getting ready: "],
  ["Bride (Dress On): ", "Bride dressed: "],
  ["Narration: ", "Video messages: "],
];

function migrateEventName(name) {
  if (typeof name !== "string") return name;
  if (RENAMED_EVENTS[name]) return RENAMED_EVENTS[name];
  const prefix = RENAMED_PREFIXES.find(([oldPrefix]) => name.startsWith(oldPrefix));
  return prefix ? prefix[1] + name.slice(prefix[0].length) : name;
}

export { RENAMED_EVENTS, RENAMED_PREFIXES, migrateEventName };
