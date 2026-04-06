import {
  CLASS_MASTERY_LEVEL_XP,
  MAX_CLASS_MASTERY_LEVEL,
} from '../../integration/meta_progression_capabilities.js';

export function toNonNegativeInt(value, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.floor(n));
}

export function toClassIds(classIds) {
  if (!Array.isArray(classIds)) return [];
  return classIds
    .map((id) => String(id || '').trim())
    .filter(Boolean);
}

export function xpForLevel(level) {
  const lv = Math.max(1, Math.min(MAX_CLASS_MASTERY_LEVEL, Math.floor(Number(level) || 1)));
  const req = Number(CLASS_MASTERY_LEVEL_XP[lv]);
  if (Number.isFinite(req) && req >= 0) return Math.floor(req);
  return 0;
}

export function calcLevel(totalXp) {
  const xp = toNonNegativeInt(totalXp, 0);
  for (let lv = MAX_CLASS_MASTERY_LEVEL; lv >= 1; lv -= 1) {
    if (xp >= xpForLevel(lv)) return lv;
  }
  return 1;
}

export function calcProgress(level, totalXp) {
  const lv = Math.max(1, Math.min(MAX_CLASS_MASTERY_LEVEL, Math.floor(Number(level) || 1)));
  if (lv >= MAX_CLASS_MASTERY_LEVEL) return 1;
  const xp = toNonNegativeInt(totalXp, 0);
  const cur = xpForLevel(lv);
  const next = xpForLevel(lv + 1);
  const span = Math.max(1, next - cur);
  return Math.max(0, Math.min(1, (xp - cur) / span));
}
