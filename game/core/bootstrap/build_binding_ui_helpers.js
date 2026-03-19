import { getModuleRegistryScope } from '../bindings/module_registry_scopes.js';

export function buildBindingUiHelpers({ modules, deps }) {
  const titleModules = getModuleRegistryScope(modules, 'title');
  const combatModules = getModuleRegistryScope(modules, 'combat');

  return {
    getSelectedClass: () => titleModules.ClassSelectUI?.getSelectedClass?.() || null,
    clearSelectedClass: () =>
      titleModules.ClassSelectUI?.clearSelection?.(deps.getClassSelectDeps()),
    showPendingClassProgressSummary: () =>
      titleModules.CharacterSelectUI?.showPendingSummaries?.(),
    resetDeckModalFilter: () =>
      combatModules.DeckModalUI?.resetFilter?.(),
  };
}
