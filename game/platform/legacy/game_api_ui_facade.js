import { closeCodex, closeDeckView, toggleHudPin } from './game_api/ui_commands.js';

export function buildLegacyGameAPIUIFacade() {
  return {
    toggleHudPin,
    closeDeckView,
    closeCodex,
  };
}
