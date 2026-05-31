/** Set true to re-enable the rough-draft wizard flow for development. */
const WIZARD_ENABLED = false;

const DESKTOP_MIN_WIDTH = "(min-width: 901px)";

const SETTINGS_WIZARD_TABS = [
  { label: "The Couple",           step: 1 },
  { label: "Your Locations",       step: 2 },
  { label: "Coverage & Package",   step: 3 },
  { label: "Before the Ceremony",  step: 4 },
  { label: "The Ceremony",         step: 5 },
  { label: "Portrait Sessions",    step: 6 },
  { label: "The Reception",        step: 7 },
];

const PROJECT_VERSION = 2;
const AUTOSAVE_KEY = "wtb_autosave";

export {
  WIZARD_ENABLED,
  SETTINGS_WIZARD_TABS,
  PROJECT_VERSION,
  AUTOSAVE_KEY,
  DESKTOP_MIN_WIDTH,
};
