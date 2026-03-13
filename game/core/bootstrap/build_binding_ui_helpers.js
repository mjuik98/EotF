import { getModuleRegistryScope } from '../bindings/module_registry_scopes.js';

export function buildBindingUiHelpers({ modules, deps }) {
  const titleModules = getModuleRegistryScope(modules, 'title');
  const combatModules = getModuleRegistryScope(modules, 'combat');

  return {
    getSelectedClass: () => titleModules.ClassSelectUI?.getSelectedClass?.()
      || modules.ClassSelectUI?.getSelectedClass?.()
      || null,
    clearSelectedClass: () =>
      (titleModules.ClassSelectUI || modules.ClassSelectUI)
        ?.clearSelection?.(deps.getClassSelectDeps()),
    showPendingClassProgressSummary: () =>
      (titleModules.CharacterSelectUI || modules.CharacterSelectUI)
        ?.showPendingSummaries?.(),
    resetDeckModalFilter: () =>
      (combatModules.DeckModalUI || modules.DeckModalUI)?.resetFilter?.(),
  };
}
