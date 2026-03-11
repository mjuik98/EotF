import * as Deps from '../../../core/deps_factory.js';

function buildFeatureDeps(game, getterName, extra = {}) {
  const deps = game?.[getterName]?.() || {};
  return { ...deps, ...extra };
}

export function createCombatPorts(modules) {
  return {
    getBaseCardDeps: () => Deps.baseCardDeps(),
    getCardTargetDeps: () => Deps.getCardTargetDeps(),
    getCombatDeps: (extra = {}) => buildFeatureDeps(modules.GAME, 'getCombatDeps', extra),
    getCombatTurnBaseDeps: () => Deps.getCombatTurnBaseDeps(),
    getFeedbackDeps: () => Deps.getFeedbackDeps(),
    getHudDeps: (extra = {}) => buildFeatureDeps(modules.GAME, 'getHudDeps', extra),
  };
}
