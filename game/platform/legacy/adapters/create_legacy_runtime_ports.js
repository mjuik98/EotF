import { GAME } from '../global_bridge.js';
import { enableLegacyPlayerStateCommandFallback } from '../state/legacy_player_state_command_fallback.js';
import {
  getLegacyFeatureDeps,
} from './legacy_runtime_resolvers.js';

export function createLegacyRuntimePorts(root = GAME) {
  return {
    getGameDeps: () => root?.getDeps?.() || {},
    getFeatureDeps: (feature = 'run') => getLegacyFeatureDeps(root, feature),
    getRuntimeDeps: () => getLegacyFeatureDeps(root, 'run'),
    getRunRuntimeDeps: () => getLegacyFeatureDeps(root, 'run'),
    getCombatRuntimeDeps: () => getLegacyFeatureDeps(root, 'combat'),
    getUiRuntimeDeps: () => getLegacyFeatureDeps(root, 'ui'),
    getModule: (name) => root.Modules?.[name],
    getCurrentCard: (cardId) => root.Data?.cards?.[cardId],
    getAudioEngine: () => root.Audio,
    getDefaultState: () => enableLegacyPlayerStateCommandFallback(root.State),
  };
}
