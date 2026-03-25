import { LEGACY_SET_TIER_FLAGS, MAX_SET_BONUS_TIER } from './set_bonus_catalog.js';

export function normalizeTrigger(trigger) {
  return String(trigger || '').toLowerCase();
}

export function getAmountValue(data) {
  if (typeof data === 'number' && Number.isFinite(data)) return data;
  if (data && typeof data === 'object' && Number.isFinite(data.amount)) return data.amount;
  return null;
}

export function withAmountValue(data, amount) {
  if (!Number.isFinite(amount)) return data;
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return { ...data, amount };
  }
  return amount;
}

export function getOwnedItemIds(gs) {
  return new Set(gs?.player?.items || []);
}

export function countOwnedSetItems(owned, itemIds) {
  return itemIds.reduce((count, id) => count + (owned.has(id) ? 1 : 0), 0);
}

export function resolveTargetIdx(gs, fallbackTargetIdx = null) {
  if (Number.isInteger(fallbackTargetIdx) && fallbackTargetIdx >= 0) return fallbackTargetIdx;

  const selected = Number(gs?._selectedTarget);
  if (Number.isInteger(selected) && selected >= 0 && (gs?.combat?.enemies?.[selected]?.hp || 0) > 0) {
    return selected;
  }

  return gs?.combat?.enemies?.findIndex?.((enemy) => enemy.hp > 0) ?? -1;
}

export function getHighestUnlockedTier(bonuses, count) {
  return Math.min(
    count,
    Math.max(0, ...Object.keys(bonuses || {}).map((tier) => Number(tier) || 0), 0),
    MAX_SET_BONUS_TIER,
  );
}

export function hasLegacySetTier(gs, setKey, tier) {
  const flag = LEGACY_SET_TIER_FLAGS[setKey]?.[tier];
  return !!(flag && gs?.[flag]);
}

export function hasSetTier(gs, counts, setKey, tier) {
  return (counts[setKey] || 0) >= tier || hasLegacySetTier(gs, setKey, tier);
}
