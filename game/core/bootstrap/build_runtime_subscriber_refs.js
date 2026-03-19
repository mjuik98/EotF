import { getModuleRegistryScope } from '../bindings/module_registry_scopes.js';

export function buildRuntimeSubscriberRefs({ modules, doc, win }) {
  const coreModules = getModuleRegistryScope(modules, 'core');
  const combatModules = getModuleRegistryScope(modules, 'combat');

  return {
    HudUpdateUI: combatModules.HudUpdateUI,
    CombatHudUI: combatModules.CombatHudUI,
    FeedbackUI: combatModules.FeedbackUI,
    CombatUI: combatModules.CombatUI,
    StatusEffectsUI: combatModules.StatusEffectsUI,
    AudioEngine: coreModules.AudioEngine,
    ParticleSystem: coreModules.ParticleSystem,
    ScreenShake: coreModules.ScreenShake,
    HitStop: coreModules.HitStop,
    doc,
    win,
  };
}
