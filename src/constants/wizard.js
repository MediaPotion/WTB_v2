const DESKTOP_MIN_WIDTH = "(min-width: 901px)";

const SETTINGS_WIZARD_TABS = [
  { label: "Wedding Details", step: 1 },
  { label: "Locations",       step: 2 },
  { label: "Package",         step: 3 },
  { label: "Pre-Ceremony",    step: 4 },
  { label: "First Looks",     step: 5 },
  { label: "Ceremony",        step: 6 },
  { label: "Portraits",       step: 8 },
  { label: "Reception",       step: 9 },
  { label: "Draft",           step: 99 },
];

const PROJECT_VERSION = 2;
const AUTOSAVE_KEY = "wtb_autosave";

export { SETTINGS_WIZARD_TABS, PROJECT_VERSION, AUTOSAVE_KEY, DESKTOP_MIN_WIDTH };
