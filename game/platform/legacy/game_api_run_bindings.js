export function buildLegacyGameAPIRunBindings(_modules, fns) {
  return {
    refreshRunModePanel: fns.refreshRunModePanel,
    startGame: fns.startGame,
    showWorldMemoryNotice: fns.showWorldMemoryNotice,
    selectFragment: fns.selectFragment,
    shiftAscension: fns.shiftAscension,
  };
}
