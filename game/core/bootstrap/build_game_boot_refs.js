import { createGameBootPorts } from './create_game_boot_ports.js';
import { createBootstrapDepProviders } from './create_bootstrap_dep_providers.js';

export function buildGameBootRefs({ modules, deps }) {
  const ports = createGameBootPorts(modules);
  const depProviders = createBootstrapDepProviders(deps);

  return {
    ...ports.getRunDeps(),
    audioEngine: ports.getAudioEngine(),
    particleSystem: ports.getParticleSystem(),
    helpPauseUI: ports.getHelpPauseUI(),
    gameBootUI: ports.getGameBootUI(),
    settingsUI: ports.getSettingsUI(),
    getGameBootDeps: () => depProviders.title.getGameBootDeps(),
    getHelpPauseDeps: () => depProviders.title.getHelpPauseDeps(),
  };
}
