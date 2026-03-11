export function buildTitleBootActions(fns) {
  return {
    showCharacterSelect: fns.showCharacterSelect,
    continueRun: fns.continueRun,
    openRunSettings: fns.openRunSettings,
    openCodexFromTitle: fns.openCodexFromTitle,
    quitGame: fns.quitGame,
    selectClass: fns.selectClass,
    startGame: fns.startGame,
    backToTitle: fns.backToTitle,
    closeRunSettings: fns.closeRunSettings,
    shiftAscension: fns.shiftAscension,
    toggleEndlessMode: fns.toggleEndlessMode,
    cycleRunCurse: fns.cycleRunCurse,
    setMasterVolume: (value) => fns.setMasterVolume(value),
    setSfxVolume: (value) => fns.setSfxVolume(value),
    setAmbientVolume: (value) => fns.setAmbientVolume(value),
    openSettings: fns.openSettings,
    closeSettings: fns.closeSettings,
  };
}
