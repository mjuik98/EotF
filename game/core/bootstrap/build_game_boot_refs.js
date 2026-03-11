import { createGameBootPorts } from './create_game_boot_ports.js';

export function buildGameBootRefs({ modules, deps }) {
  const ports = createGameBootPorts(modules);

  return {
    ...ports.getRunDeps(),
    audioEngine: ports.getAudioEngine(),
    particleSystem: ports.getParticleSystem(),
    helpPauseUI: ports.getHelpPauseUI(),
    gameBootUI: ports.getGameBootUI(),
    settingsUI: ports.getSettingsUI(),
    getGameBootDeps: () => deps.getGameBootDeps(),
    getHelpPauseDeps: () => deps.getHelpPauseDeps(),
  };
}
