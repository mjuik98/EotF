import { GAME } from '../global_bridge.js';
import {
  getLegacyFeatureDeps,
} from './legacy_runtime_resolvers.js';

export function createLegacyRuntimePorts(root = GAME) {
  return {
    getRuntimeDeps: () => getLegacyFeatureDeps(root, 'run'),
    getRunRuntimeDeps: () => getLegacyFeatureDeps(root, 'run'),
    getCombatRuntimeDeps: () => getLegacyFeatureDeps(root, 'combat'),
    getUiRuntimeDeps: () => getLegacyFeatureDeps(root, 'ui'),
    getModule: (name) => root.Modules?.[name],
    getCurrentCard: (cardId) => root.Data?.cards?.[cardId],
    getAudioEngine: () => root.Audio,
    getDefaultState: () => root.State,
  };
}
