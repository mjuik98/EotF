import { getModuleRegistryScope } from '../bindings/module_registry_scopes.js';
import {
  resolveModuleRegistryCompatValue,
  resolveModuleRegistryLegacyCompat,
} from '../bindings/resolve_module_registry_legacy_compat.js';

export function resolveLegacySurfaceModuleRefs(modules) {
  const legacyModules = resolveModuleRegistryLegacyCompat(modules);
  const coreModules = getModuleRegistryScope(modules, 'core');
  const titleModules = getModuleRegistryScope(modules, 'title');
  const combatModules = getModuleRegistryScope(modules, 'combat');
  const runModules = getModuleRegistryScope(modules, 'run');
  const screenModules = getModuleRegistryScope(modules, 'screen');
  const codexModules = getModuleRegistryScope(modules, 'codex');
  const eventModules = getModuleRegistryScope(modules, 'event');
  const rewardModules = getModuleRegistryScope(modules, 'reward');

  return {
    legacyModules,
    coreModules,
    titleModules,
    combatModules,
    runModules,
    screenModules,
    codexModules,
    eventModules,
    rewardModules,
  };
}

export function resolveLegacySurfaceModuleRef(modules, scopeName, key) {
  if (!key) return undefined;

  const scopedValue = scopeName ? getModuleRegistryScope(modules, scopeName)?.[key] : undefined;
  if (scopedValue !== undefined) return scopedValue;

  return resolveModuleRegistryCompatValue(modules, key);
}

export function resolveLegacySurfaceCoreRuntimeRefs(modules) {
  const { legacyModules, coreModules } = resolveLegacySurfaceModuleRefs(modules);

  return {
    GS: coreModules.GS || resolveModuleRegistryCompatValue({ legacyModules }, 'GS'),
    DATA: coreModules.DATA || resolveModuleRegistryCompatValue({ legacyModules }, 'DATA'),
    AudioEngine: coreModules.AudioEngine || resolveModuleRegistryCompatValue({ legacyModules }, 'AudioEngine'),
    ParticleSystem: coreModules.ParticleSystem || resolveModuleRegistryCompatValue({ legacyModules }, 'ParticleSystem'),
  };
}
