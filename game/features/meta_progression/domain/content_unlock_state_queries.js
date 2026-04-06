import { UNLOCKABLES } from './unlockable_definitions.js';

function getDefinitionBucket(type) {
  return UNLOCKABLES?.[`${type}s`] || {};
}

function getUnlockBucket(meta, type) {
  return meta?.contentUnlocks?.[`${type}s`] || {};
}

function getCardUnlockBuckets(meta, classId) {
  const cards = meta?.contentUnlocks?.cards || {};
  const shared = cards.shared || {};
  if (!classId) return { shared, scoped: null };
  return {
    shared,
    scoped: cards[String(classId)] || {},
  };
}

function getRelicUnlockBuckets(meta, classId) {
  const shared = meta?.contentUnlocks?.relics || {};
  if (!classId) return { shared, scoped: null };
  return {
    shared,
    scoped: meta?.contentUnlocks?.relicsByClass?.[String(classId)] || {},
  };
}

export function isContentUnlocked(meta, { type, id, classId } = {}) {
  if (!type || !id) return false;
  if (type === 'card' && classId) {
    const { shared, scoped } = getCardUnlockBuckets(meta, classId);
    return !!shared?.[id]?.unlocked || !!scoped?.[id]?.unlocked;
  }
  if (type === 'card') {
    return !!getCardUnlockBuckets(meta).shared?.[id]?.unlocked;
  }
  if (type === 'relic' && classId) {
    const { shared, scoped } = getRelicUnlockBuckets(meta, classId);
    return !!shared?.[id]?.unlocked || !!scoped?.[id]?.unlocked;
  }
  return !!getUnlockBucket(meta, type)?.[id]?.unlocked;
}

export function isContentAvailable(meta, { type, id, classId } = {}) {
  if (!type || !id) return false;
  const definition = getDefinitionBucket(type)?.[id];
  if (!definition) return true;

  const scopedClassId = definition.scope === 'class'
    ? String(definition.classId || '')
    : String(classId || '');

  if (definition.scope === 'class') {
    if (!scopedClassId) return false;
    if (classId && String(classId) !== scopedClassId) return false;
  }

  return isContentUnlocked(meta, {
    type,
    id,
    ...(scopedClassId ? { classId: scopedClassId } : {}),
  });
}

export function getContentVisibility(meta, { type, id, classId } = {}) {
  const definition = getDefinitionBucket(type)?.[id];
  if (!definition) return 'hidden';
  if (isContentUnlocked(meta, { type, id, classId })) return 'visible';
  return definition.visibleBeforeUnlock ? 'locked-visible' : 'hidden';
}

export function getUnlockedContent(meta, { type, classId } = {}) {
  if (!type) return [];
  if (type === 'card' && classId) {
    const { shared, scoped } = getCardUnlockBuckets(meta, classId);
    return [...new Set([
      ...Object.entries(shared).filter(([, state]) => state?.unlocked).map(([id]) => id),
      ...Object.entries(scoped || {}).filter(([, state]) => state?.unlocked).map(([id]) => id),
    ])];
  }
  if (type === 'card') {
    return Object.entries(getCardUnlockBuckets(meta).shared)
      .filter(([, state]) => state?.unlocked)
      .map(([id]) => id);
  }
  if (type === 'relic' && classId) {
    const { shared, scoped } = getRelicUnlockBuckets(meta, classId);
    return [...new Set([
      ...Object.entries(shared).filter(([, state]) => state?.unlocked).map(([id]) => id),
      ...Object.entries(scoped || {}).filter(([, state]) => state?.unlocked).map(([id]) => id),
    ])];
  }
  return Object.entries(getUnlockBucket(meta, type))
    .filter(([, state]) => state?.unlocked)
    .map(([id]) => id);
}

export function getUnlockRequirementLabel({ type, id } = {}) {
  return getDefinitionBucket(type)?.[id]?.unlockHint || '해금 필요';
}
