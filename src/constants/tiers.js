export const TIER = {
  HARD: "hard",
  SOFT: "soft",
  FLEXIBLE: "flexible",
};

export const FLEXIBILITY_OPTIONS = [
  { value: 0, label: "Fixed — guests have been told this exact time" },
  { value: 30, label: "Flexible up to 30 minutes" },
  { value: 60, label: "Flexible up to 60 minutes" },
];

/** Default tier by event name (generated timeline + project fixed events). */
export const FIXED_EVENT_TIERS = {
  Ceremony: TIER.HARD,
  "Ceremony: Average": TIER.HARD,
  "Ceremony: Catholic": TIER.HARD,
  "Reception: Grand Entrances": TIER.HARD,
  "Bride & Groom: Golden Hour Portraits": TIER.HARD,

  "Reception: Dinner": TIER.SOFT,
  "Reception: Speeches": TIER.SOFT,
  "Reception: Speeches (Per Speaker)": TIER.SOFT,
  "Reception: First Dance": TIER.SOFT,
  "Reception: Bride & Groom Dance": TIER.SOFT,
  "Reception: Bride & Parent Dance": TIER.SOFT,
  "Reception: Groom & Parent Dance": TIER.SOFT,
  "Reception: Cake Cutting": TIER.SOFT,
};

export const DEFAULT_ROW_TIER_FIELDS = {
  tier: TIER.FLEXIBLE,
  flexibilityMinutes: 0,
};
