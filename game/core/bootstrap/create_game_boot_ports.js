import { getModuleRegistryScope } from '../bindings/module_registry_scopes.js';

export function createGameBootPorts(modules) {
  const coreModules = getModuleRegistryScope(modules, 'core');
  const titleModules = getModuleRegistryScope(modules, 'title');

  return {
    getRunDeps: () => (coreModules.GAME || modules.GAME)?.getRunDeps?.() || {},
    getAudioEngine: () => coreModules.AudioEngine || modules.AudioEngine,
    getParticleSystem: () => coreModules.ParticleSystem || modules.ParticleSystem,
    getHelpPauseUI: () => titleModules.HelpPauseUI || modules.HelpPauseUI,
    getGameBootUI: () => titleModules.GameBootUI || modules.GameBootUI,
    getSettingsUI: () => titleModules.SettingsUI || modules.SettingsUI,
  };
}
