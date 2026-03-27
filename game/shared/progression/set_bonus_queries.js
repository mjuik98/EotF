import { SETS } from './set_bonus_catalog.js';
import {
  countOwnedSetItems,
  getOwnedItemIds,
} from './set_bonus_helpers.js';

function toSetProgressEntry(setId, setDef, owned) {
  const total = Array.isArray(setDef?.items) ? setDef.items.length : 0;
  if (!setId || !setDef || total <= 0) return null;

  const ownedCount = countOwnedSetItems(owned, setDef.items);
  const missingItemIds = setDef.items.filter((itemId) => !owned.has(itemId));

  return {
    setId,
    setName: setDef.name || setId,
    ownedCount,
    total,
    missingItemIds,
    isComplete: ownedCount >= total,
  };
}

export function getOwnedSetProgressEntries(gs) {
  const owned = getOwnedItemIds(gs);
  return Object.entries(SETS)
    .map(([setId, setDef]) => toSetProgressEntry(setId, setDef, owned))
    .filter(Boolean);
}

export function getSetProgressForItem(gs, item) {
  const setId = item?.setId;
  if (!setId || !SETS[setId]) return null;

  const owned = getOwnedItemIds(gs);
  const progress = toSetProgressEntry(setId, SETS[setId], owned);
  if (!progress) return null;

  const alreadyOwned = owned.has(item.id);
  const nextOwnedCount = alreadyOwned
    ? progress.ownedCount
    : Math.min(progress.total, progress.ownedCount + 1);

  return {
    ...progress,
    alreadyOwned,
    nextOwnedCount,
    completesSet: nextOwnedCount >= progress.total,
  };
}

export function pickMissingItemFromBestOwnedSet(gs, itemsById = {}) {
  const candidates = getOwnedSetProgressEntries(gs)
    .filter((entry) => entry.ownedCount > 0 && !entry.isComplete && entry.missingItemIds.length > 0)
    .sort((left, right) => {
      if (right.ownedCount !== left.ownedCount) return right.ownedCount - left.ownedCount;
      if (left.total !== right.total) return left.total - right.total;
      return left.setName.localeCompare(right.setName, 'ko');
    });

  for (const candidate of candidates) {
    const pool = candidate.missingItemIds
      .map((itemId) => itemsById?.[itemId] || null)
      .filter(Boolean);
    if (!pool.length) continue;

    const picked = pool[Math.floor(Math.random() * pool.length)] || null;
    if (!picked) continue;

    return {
      ...candidate,
      item: picked,
      nextOwnedCount: Math.min(candidate.total, candidate.ownedCount + 1),
      completesSet: candidate.ownedCount + 1 >= candidate.total,
    };
  }

  return null;
}
