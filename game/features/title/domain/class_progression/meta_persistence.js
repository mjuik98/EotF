import {
  DEFAULT_LOADOUT_PRESET_SLOT,
  LOADOUT_PRESET_SLOTS,
  MAX_CLASS_MASTERY_LEVEL,
} from '../../../meta_progression/ports/public_class_progression_capabilities.js';
import { toClassIds, toNonNegativeInt, xpForLevel } from './xp_policy.js';

function createEmptyLoadoutPreset() {
  return {
    activeSlot: DEFAULT_LOADOUT_PRESET_SLOT,
    slotEntries: Object.fromEntries(LOADOUT_PRESET_SLOTS.map((slotId) => [slotId, {
      level11: null,
      level12: null,
    }])),
    level11: null,
    level12: null,
  };
}

function normalizeLoadoutPresetEntry(entry) {
  const source = entry && typeof entry === 'object' ? entry : {};
  const activeSlot = LOADOUT_PRESET_SLOTS.includes(String(source.activeSlot || ''))
    ? String(source.activeSlot)
    : DEFAULT_LOADOUT_PRESET_SLOT;
  const slotEntries = Object.fromEntries(LOADOUT_PRESET_SLOTS.map((slotId) => {
    const current = source.slotEntries?.[slotId];
    const fallback = slotId === DEFAULT_LOADOUT_PRESET_SLOT ? source : null;
    return [slotId, {
      level11: current?.level11 ?? fallback?.level11 ?? null,
      level12: current?.level12 ?? fallback?.level12 ?? null,
    }];
  }));
  return {
    activeSlot,
    slotEntries,
    level11: slotEntries[activeSlot].level11,
    level12: slotEntries[activeSlot].level12,
  };
}

const MAX_RECENT_SUMMARIES = 12;

export function ensureClassProgress(meta, classIds = []) {
  if (!meta || typeof meta !== 'object') return null;
  if (!meta.classProgress || typeof meta.classProgress !== 'object' || Array.isArray(meta.classProgress)) {
    meta.classProgress = {};
  }
  const cp = meta.classProgress;

  if (!cp.levels || typeof cp.levels !== 'object' || Array.isArray(cp.levels)) cp.levels = {};
  if (!cp.xp || typeof cp.xp !== 'object' || Array.isArray(cp.xp)) cp.xp = {};
  if (!Array.isArray(cp.pendingSummaries)) cp.pendingSummaries = [];
  if (!Array.isArray(cp.recentSummaries)) cp.recentSummaries = [];
  if (cp.recentSummaries.length > MAX_RECENT_SUMMARIES) {
    cp.recentSummaries = cp.recentSummaries.slice(-MAX_RECENT_SUMMARIES);
  }
  if (!cp.loadoutPresets || typeof cp.loadoutPresets !== 'object' || Array.isArray(cp.loadoutPresets)) {
    cp.loadoutPresets = {};
  }

  const ids = toClassIds(classIds);
  ids.forEach((classId) => {
    const level = toNonNegativeInt(cp.levels[classId], 1);
    const normalizedLevel = Math.max(1, Math.min(MAX_CLASS_MASTERY_LEVEL, level || 1));
    cp.levels[classId] = normalizedLevel;

    const xp = toNonNegativeInt(cp.xp[classId], 0);
    cp.xp[classId] = Math.max(xp, xpForLevel(normalizedLevel));

    if (!cp.loadoutPresets[classId] || typeof cp.loadoutPresets[classId] !== 'object') {
      cp.loadoutPresets[classId] = createEmptyLoadoutPreset();
    } else {
      cp.loadoutPresets[classId] = normalizeLoadoutPresetEntry(cp.loadoutPresets[classId]);
    }
  });

  return cp;
}

export { MAX_RECENT_SUMMARIES };
