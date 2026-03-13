import { GAME, exposeGlobals } from '../../legacy/global_bridge.js';
import { RootUIBindings as GameInit } from '../root_ui_bindings.js';
import { GameAPI } from '../../legacy/game_api_compat.js';
import { CustomCursor } from '../effects/custom_cursor.js';

export function buildCoreRuntimeBridgeModules() {
  return {
    GAME,
    GameInit,
    GameAPI,
    exposeGlobals,
    CustomCursor,
  };
}
