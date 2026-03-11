export function buildBindingUiHelpers({ modules, deps }) {
  return {
    getSelectedClass: () => modules.ClassSelectUI?.getSelectedClass?.() || null,
    clearSelectedClass: () =>
      modules.ClassSelectUI?.clearSelection?.(deps.getClassSelectDeps()),
    showPendingClassProgressSummary: () =>
      modules.CharacterSelectUI?.showPendingSummaries?.(),
    resetDeckModalFilter: () => modules.DeckModalUI?.resetFilter?.(),
  };
}
