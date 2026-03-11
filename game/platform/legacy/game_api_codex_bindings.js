export function buildLegacyGameAPICodexBindings(_modules, fns) {
  return {
    setCodexTab: (tab) => fns.setCodexTab(tab),
    closeCodex: fns.closeCodex,
    openCodex: fns.openCodex,
    setDeckFilter: (filterValue) => fns.setDeckFilter(filterValue),
    closeDeckView: fns.closeDeckView,
  };
}
