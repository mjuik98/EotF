import { GAME } from '../global_bridge.js';

export function createLegacyRuntimePorts(root = GAME) {
  return {
    getRuntimeDeps: () => root.getRunDeps?.() || {},
    getRunRuntimeDeps: () => root.getRunDeps?.() || {},
    getCombatRuntimeDeps: () => root.getCombatDeps?.() || {},
    getUiRuntimeDeps: () => root.getUiDeps?.() || {},
    getModule: (name) => root.Modules?.[name],
    getCurrentCard: (cardId) => root.Data?.cards?.[cardId],
    getAudioEngine: () => root.Audio,
    getDefaultState: () => root.State,
  };
}
