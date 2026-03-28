import {
  getModuleRegistryScope,
  resolveModuleRegistryValue,
} from '../bindings/module_registry_scopes.js';

export function createGameBootPorts(modules) {
  const coreModules = getModuleRegistryScope(modules, 'core');

  return {
    getRunDeps: () => coreModules.GAME?.getRunDeps?.() || {},
    getAudioEngine: () => coreModules.AudioEngine,
    getParticleSystem: () => coreModules.ParticleSystem,
    getHelpPauseUI: () => resolveModuleRegistryValue(modules, 'HelpPauseUI', ['screen', 'title']),
    getGameBootUI: () => resolveModuleRegistryValue(modules, 'GameBootUI', ['title']),
    getSettingsUI: () => resolveModuleRegistryValue(modules, 'SettingsUI', ['title', 'screen']),
  };
}
