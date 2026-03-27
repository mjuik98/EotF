import { ClassProgressionSystem } from '../domain/class_progression_system.js';
import { buildUnlockRoadmap } from '../../meta_progression/public.js';

function buildFallbackProgress(classId) {
  return {
    classId,
    level: 1,
    totalXp: 0,
    currentLevelXp: 0,
    nextLevelXp: 100,
    progress: 0,
  };
}

export function ensureCharacterSelectMeta(meta, classIds, progressionSystem = ClassProgressionSystem) {
  if (!meta) return meta;
  progressionSystem.ensureMeta(meta, classIds);
  return meta;
}

export function getCharacterSelectPresentation(meta, classId, classIds, progressionSystem = ClassProgressionSystem) {
  if (!meta || !classId) {
    return {
      classProgress: buildFallbackProgress(classId),
      maxLevel: progressionSystem.MAX_LEVEL,
      roadmap: classId ? progressionSystem.getRoadmap(classId) : [],
      unlockRoadmap: { account: [], class: [] },
      recentSummaries: [],
    };
  }
  return {
    classProgress: progressionSystem.getClassState(meta, classId, classIds) || buildFallbackProgress(classId),
    maxLevel: progressionSystem.MAX_LEVEL,
    roadmap: progressionSystem.getRoadmap(classId),
    unlockRoadmap: buildUnlockRoadmap(meta, { classId }),
    recentSummaries: progressionSystem.getRecentSummaries?.(meta, classId, classIds) || [],
  };
}

export function createCharacterSelectProgressionFacade(meta, classIds, progressionSystem = ClassProgressionSystem) {
  return {
    MAX_LEVEL: progressionSystem.MAX_LEVEL,
    consumePendingSummary: (metaRef = meta, ids = classIds) => progressionSystem.consumePendingSummary?.(metaRef, ids),
    ensureMeta: (metaRef = meta, ids = classIds) => ensureCharacterSelectMeta(metaRef, ids, progressionSystem),
    getClassState: (metaRef = meta, classId, ids = classIds) => {
      return getCharacterSelectPresentation(metaRef, classId, ids, progressionSystem).classProgress;
    },
    getRoadmap: (classId) => progressionSystem.getRoadmap(classId),
    getRecentSummaries: (metaRef = meta, classId, ids = classIds, limit = 3) => (
      progressionSystem.getRecentSummaries?.(metaRef, classId, ids, limit) || []
    ),
  };
}
