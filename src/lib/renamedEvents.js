/**
 * Event names are lookup keys and saved files store them. When a template
 * block is renamed, add the old name here so timelines saved before the
 * rename load with the new name.
 */
const RENAMED_EVENTS = {
  "Details: Rings,Invitations, & Accessories": "Details: Rings, Invitations, & Accessories",
  "Reception: Garder Belt Toss": "Reception: Garter Belt Toss",
};

function migrateEventName(name) {
  return RENAMED_EVENTS[name] || name;
}

export { RENAMED_EVENTS, migrateEventName };
