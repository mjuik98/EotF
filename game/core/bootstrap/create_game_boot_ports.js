export function createGameBootPorts(modules) {
  return {
    getRunDeps: () => modules.GAME?.getRunDeps?.() || {},
    getAudioEngine: () => modules.AudioEngine,
    getParticleSystem: () => modules.ParticleSystem,
    getHelpPauseUI: () => modules.HelpPauseUI,
    getGameBootUI: () => modules.GameBootUI,
    getSettingsUI: () => modules.SettingsUI,
  };
}
