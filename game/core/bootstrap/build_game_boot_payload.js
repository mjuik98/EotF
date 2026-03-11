import { buildGameBootActions } from './build_game_boot_actions.js';

export function buildGameBootPayload({ modules, deps, fns }) {
  return {
    ...(modules.GAME.getRunDeps?.() || {}),
    audioEngine: modules.AudioEngine,
    particleSystem: modules.ParticleSystem,
    helpPauseUI: modules.HelpPauseUI,
    gameBootUI: modules.GameBootUI,
    settingsUI: modules.SettingsUI,
    getGameBootDeps: () => deps.getGameBootDeps(),
    getHelpPauseDeps: () => deps.getHelpPauseDeps(),
    actions: buildGameBootActions(fns),
  };
}
