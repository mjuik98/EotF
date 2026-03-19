import * as Deps from '../../core/deps_factory.js';

const RUN_API_DEP_CONTRACTS = Object.freeze({
  getRunSetupDeps: 'runSetup',
});

function buildRunApiDepAccessors(depsFactory = Deps) {
  const createDepsAccessors = depsFactory.createDepsAccessors;
  const createDeps = depsFactory.createDeps;

  if (typeof createDepsAccessors === 'function' && typeof createDeps === 'function') {
    return createDepsAccessors(RUN_API_DEP_CONTRACTS, createDeps);
  }

  return Object.freeze({
    getRunSetupDeps: () => depsFactory.getRunSetupDeps?.() || {},
  });
}

function resolveRunSetup() {
  try {
    return buildRunApiDepAccessors().getRunSetupDeps?.() || null;
  } catch {
    return null;
  }
}

export function buildLegacyGameAPIRunBindings(_modules, fns) {
  const runSetup = resolveRunSetup();
  const runSetupStartGame = typeof runSetup?.startGame === 'function' ? runSetup.startGame : null;

  return {
    refreshRunModePanel: fns.refreshRunModePanel,
    startGame: (options) => {
      if (runSetupStartGame) return runSetupStartGame(options);
      return fns.startGame?.(options);
    },
    showWorldMemoryNotice: fns.showWorldMemoryNotice,
    selectFragment: fns.selectFragment,
    shiftAscension: fns.shiftAscension,
  };
}
