import * as Deps from '../../core/deps_factory.js';

const RUN_API_DEP_CONTRACTS = Object.freeze({
  getRunSetupDeps: 'runSetup',
});

function buildRunApiDepAccessors(depsFactory = Deps) {
  return Deps.buildFeatureContractAccessors(RUN_API_DEP_CONTRACTS, depsFactory);
}

function resolveRunSetup() {
  try {
    const accessorDeps = buildRunApiDepAccessors().getRunSetupDeps?.();
    if (accessorDeps) return accessorDeps;
    if (typeof Deps.createDeps === 'function') {
      return Deps.createDeps(RUN_API_DEP_CONTRACTS.getRunSetupDeps);
    }
    return null;
  } catch {
    try {
      return typeof Deps.createDeps === 'function'
        ? Deps.createDeps(RUN_API_DEP_CONTRACTS.getRunSetupDeps)
        : null;
    } catch {
      return null;
    }
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
