import { getModuleRegistryScope } from '../bindings/module_registry_scopes.js';

export function createGameBootPorts(modules) {
  const coreModules = getModuleRegistryScope(modules, 'core');
  const titleModules = getModuleRegistryScope(modules, 'title');

  return {
    getRunDeps: () => coreModules.GAME?.getRunDeps?.() || {},
    getAudioEngine: () => coreModules.AudioEngine,
    getParticleSystem: () => coreModules.ParticleSystem,
    getHelpPauseUI: () => titleModules.HelpPauseUI,
    getGameBootUI: () => titleModules.GameBootUI,
    getSettingsUI: () => titleModules.SettingsUI,
  };
}
