import * as Deps from '../../../core/deps_factory.js';

const COMBAT_DEP_CONTRACTS = Object.freeze({
  getBaseCardDeps: 'baseCard',
  getCardTargetDeps: 'cardTarget',
  getCombatTurnBaseDeps: 'combatTurnBase',
  getFeedbackDeps: 'feedback',
});

function buildFeatureDeps(game, getterName, extra = {}) {
  const deps = game?.[getterName]?.() || {};
  return { ...deps, ...extra };
}

function resolveCoreRuntimeModule(modules = {}, key) {
  const coreRefs = modules?.featureScopes?.core || {};
  if (coreRefs[key] !== undefined) {
    return coreRefs[key];
  }

  if (modules?.legacyModules?.[key] !== undefined) {
    return modules.legacyModules[key];
  }

  if (modules?.[key] !== undefined) {
    return modules[key];
  }

  return undefined;
}

function buildCombatDepAccessors(depsFactory = Deps) {
  return Deps.buildFeatureContractAccessors(COMBAT_DEP_CONTRACTS, depsFactory);
}

export function createCombatPorts(modules, depsFactory = Deps) {
  const game = resolveCoreRuntimeModule(modules, 'GAME');
  const depAccessors = buildCombatDepAccessors(depsFactory);

  return {
    ...depAccessors,
    getCombatDeps: (extra = {}) => buildFeatureDeps(game, 'getCombatDeps', extra),
    getHudDeps: (extra = {}) => buildFeatureDeps(game, 'getHudDeps', extra),
  };
}
