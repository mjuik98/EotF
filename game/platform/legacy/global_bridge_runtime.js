import {
  exposeLegacyGlobals,
  getLegacyRoot,
} from './global_bridge_helpers.js';
import { createLegacyApiCaller } from './legacy_api_caller.js';
import { createLegacyGameRootState } from './legacy_game_root_state.js';
import { createLegacyModuleRegistry } from './legacy_module_registry.js';
import { createLegacyRootDeps } from './legacy_root_deps.js';

export const GAME = {};
Object.assign(
  GAME,
  createLegacyGameRootState(GAME),
  createLegacyModuleRegistry(GAME),
  createLegacyRootDeps(GAME),
  createLegacyApiCaller(GAME),
);

export function exposeGlobals(mapping, root = getLegacyRoot()) {
  exposeLegacyGlobals(mapping, root);
}
