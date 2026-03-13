import { SETS } from './set_bonus_catalog.js';
import {
  countOwnedSetItems,
  getHighestUnlockedTier,
  getOwnedItemIds,
} from './set_bonus_helpers.js';
import { applyPassiveSetBonuses } from './set_bonus_passive_effects.js';
import { triggerSetBonusEffects } from './set_bonus_trigger_effects.js';

export const SetBonusSystem = {
  sets: SETS,

  getOwnedSetCounts(gs) {
    const owned = getOwnedItemIds(gs);
    return Object.fromEntries(
      Object.entries(this.sets).map(([key, set]) => [key, countOwnedSetItems(owned, set.items)]),
    );
  },

  hasBonus(gs, setKey, tier) {
    const count = this.getOwnedSetCounts(gs)[setKey] || 0;
    return count >= tier;
  },

  getActiveSets(gs) {
    const counts = this.getOwnedSetCounts(gs);
    const active = [];

    for (const [key, set] of Object.entries(this.sets)) {
      const count = counts[key] || 0;
      if (count < 2) continue;

      const unlockedTier = getHighestUnlockedTier(set.bonuses, count);
      const unlockedBonuses = Object.entries(set.bonuses)
        .filter(([tier]) => count >= Number(tier))
        .map(([tier, bonus]) => ({ tier: Number(tier), ...bonus }));

      active.push({
        key,
        name: set.name,
        count,
        bonus: set.bonuses[unlockedTier] || null,
        bonuses: unlockedBonuses,
      });
    }

    return active;
  },

  applyPassiveBonuses(gs) {
    const counts = this.getOwnedSetCounts(gs);
    applyPassiveSetBonuses(gs, counts);
  },

  triggerSetBonuses(gs, trigger, data) {
    const counts = this.getOwnedSetCounts(gs);
    return triggerSetBonusEffects(gs, counts, trigger, data);
  },
};
