import { TIER, FIXED_EVENT_TIERS, DEFAULT_ROW_TIER_FIELDS } from "../constants/tiers";

function getDefaultTierForEvent(eventName) {
  const name = (eventName || "").trim();
  if (!name) return TIER.FLEXIBLE;
  if (FIXED_EVENT_TIERS[name]) return FIXED_EVENT_TIERS[name];
  if (name.startsWith("Ceremony:")) return TIER.HARD;
  return TIER.FLEXIBLE;
}

/**
 * Assign tier + flexibilityMinutes for a timeline row block.
 * Does not affect scheduling — metadata only.
 */
function resolveRowTierFields(block, flexibility = {}, context = {}) {
  const event = block.event || "";
  let tier = getDefaultTierForEvent(event);
  let flexibilityMinutes = 0;

  if (event === "Reception: Dinner") {
    flexibilityMinutes = flexibility.dinnerFlexibility ?? 0;
  } else if (context.isReceptionStart) {
    flexibilityMinutes = flexibility.receptionStartFlexibility ?? 0;
  }

  if (flexibilityMinutes > 0 && tier === TIER.FLEXIBLE) {
    tier = TIER.SOFT;
  }

  return { tier, flexibilityMinutes };
}

function normalizeTimelineRow(row) {
  return {
    ...DEFAULT_ROW_TIER_FIELDS,
    ...row,
    tier: row?.tier ?? TIER.FLEXIBLE,
    flexibilityMinutes: row?.flexibilityMinutes ?? 0,
  };
}

export { getDefaultTierForEvent, resolveRowTierFields, normalizeTimelineRow };
