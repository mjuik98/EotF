import * as Deps from '../../core/deps_factory.js';

function resolveRunSetup() {
  try {
    return Deps.getRunSetupDeps?.() || null;
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
