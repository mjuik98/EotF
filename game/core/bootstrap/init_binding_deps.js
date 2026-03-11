export function initBindingDeps({ modules, fns, deps }) {
  deps.initDepsFactory({
    ...modules,
    ...fns,
    _gameStarted: () => modules._gameStarted,
    markGameStarted: () => { modules._gameStarted = true; },
    getSelectedClass: () => modules.ClassSelectUI?.getSelectedClass?.() || null,
    clearSelectedClass: () => modules.ClassSelectUI?.clearSelection?.(deps.getClassSelectDeps()),
    showPendingClassProgressSummary: () => modules.CharacterSelectUI?.showPendingSummaries?.(),
    resetDeckModalFilter: () => modules.DeckModalUI?.resetFilter?.(),
  });
}
