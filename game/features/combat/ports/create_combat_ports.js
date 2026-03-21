import * as Deps from '../../../core/deps_factory.js';
import { resolveModuleRegistryGameRoot } from '../../../core/bindings/module_registry_scopes.js';

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

function buildCombatDepAccessors(depsFactory = Deps) {
  return Deps.buildFeatureContractAccessors(COMBAT_DEP_CONTRACTS, depsFactory);
}

export function createCombatPorts(modules, depsFactory = Deps) {
  const game = resolveModuleRegistryGameRoot(modules);
  const depAccessors = buildCombatDepAccessors(depsFactory);

  return {
    ...depAccessors,
    getCombatDeps: (extra = {}) => buildFeatureDeps(game, 'getCombatDeps', extra),
    getHudDeps: (extra = {}) => buildFeatureDeps(game, 'getHudDeps', extra),
  };
}
