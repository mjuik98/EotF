import { buildLegacyGameAPICombatFacade } from './game_api_combat_facade.js';
import { buildLegacyGameAPIPlayerFacade } from './game_api_player_facade.js';
import { buildLegacyGameAPIScreenFacade } from './game_api_screen_facade.js';
import { buildLegacyGameAPIUIFacade } from './game_api_ui_facade.js';

export function buildLegacyGameApiCompatPayload(apiRef) {
  return {
    playerActions: buildLegacyGameAPIPlayerFacade(apiRef),
    combatActions: buildLegacyGameAPICombatFacade(apiRef),
    screenActions: buildLegacyGameAPIScreenFacade(),
    uiActions: buildLegacyGameAPIUIFacade(),
  };
}
