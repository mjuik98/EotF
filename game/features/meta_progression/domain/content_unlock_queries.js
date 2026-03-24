import { UNLOCKABLES } from './unlockable_definitions.js';

function getDefinitionBucket(type) {
  return UNLOCKABLES?.[`${type}s`] || {};
}

function getUnlockBucket(meta, type) {
  return meta?.contentUnlocks?.[`${type}s`] || {};
}

export function isContentUnlocked(meta, { type, id, classId } = {}) {
  if (!type || !id) return false;
  if (type === 'card' && classId) {
    return !!meta?.contentUnlocks?.cards?.[classId]?.[id]?.unlocked;
  }
  return !!getUnlockBucket(meta, type)?.[id]?.unlocked;
}

export function getContentVisibility(meta, { type, id, classId } = {}) {
  const definition = type === 'card' && classId
    ? getDefinitionBucket(type)?.[id]
    : getDefinitionBucket(type)?.[id];
  if (!definition) return 'hidden';
  if (isContentUnlocked(meta, { type, id, classId })) return 'visible';
  return definition.visibleBeforeUnlock ? 'locked-visible' : 'hidden';
}

export function getUnlockedContent(meta, { type, classId } = {}) {
  if (!type) return [];
  if (type === 'card' && classId) {
    return Object.entries(meta?.contentUnlocks?.cards?.[classId] || {})
      .filter(([, state]) => state?.unlocked)
      .map(([id]) => id);
  }
  return Object.entries(getUnlockBucket(meta, type))
    .filter(([, state]) => state?.unlocked)
    .map(([id]) => id);
}

export function getUnlockRequirementLabel({ type, id } = {}) {
  return getDefinitionBucket(type)?.[id]?.unlockHint || '해금 필요';
}
