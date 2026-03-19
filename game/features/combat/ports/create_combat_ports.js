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

function getOptionalFactoryExport(exportName, depsFactory = Deps) {
  return Object.prototype.hasOwnProperty.call(depsFactory, exportName)
    ? depsFactory[exportName]
    : null;
}

function buildCombatDepAccessors(depsFactory = Deps) {
  const createDepsAccessors = getOptionalFactoryExport('createDepsAccessors');
  const createDeps = getOptionalFactoryExport('createDeps', depsFactory);

  if (typeof createDepsAccessors === 'function' && typeof createDeps === 'function') {
    return createDepsAccessors(COMBAT_DEP_CONTRACTS, createDeps);
  }

  const accessors = {};

  for (const accessorName of Object.keys(COMBAT_DEP_CONTRACTS)) {
    accessors[accessorName] = (overrides = {}) => ({
      ...(depsFactory?.[accessorName]?.() || {}),
      ...overrides,
    });
  }

  return Object.freeze(accessors);
}

function resolveCombatModuleBag(modules) {
  return modules?.legacyModules || modules || {};
}

export function createCombatPorts(modules, depsFactory = Deps) {
  const moduleBag = resolveCombatModuleBag(modules);
  const depAccessors = buildCombatDepAccessors(depsFactory);

  return {
    ...depAccessors,
    getCombatDeps: (extra = {}) => buildFeatureDeps(moduleBag.GAME, 'getCombatDeps', extra),
    getHudDeps: (extra = {}) => buildFeatureDeps(moduleBag.GAME, 'getHudDeps', extra),
  };
}
