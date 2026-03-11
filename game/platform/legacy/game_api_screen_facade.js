import { setScreen } from './game_api/screen_commands.js';

export function buildLegacyGameAPIScreenFacade() {
  return {
    setScreen,
  };
}
