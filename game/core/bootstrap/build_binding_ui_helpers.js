import { getModuleRegistryScope } from '../bindings/module_registry_scopes.js';
import { createBootstrapDepProviders } from './create_bootstrap_dep_providers.js';

export function buildBindingUiHelpers({ modules, deps }) {
  const titleModules = getModuleRegistryScope(modules, 'title');
  const combatModules = getModuleRegistryScope(modules, 'combat');
  const depProviders = createBootstrapDepProviders(deps);

  return {
    getSelectedClass: () => titleModules.ClassSelectUI?.getSelectedClass?.() || null,
    clearSelectedClass: () =>
      titleModules.ClassSelectUI?.clearSelection?.(depProviders.title.getClassSelectDeps()),
    resetCharacterSelectState: () =>
      titleModules.CharacterSelectUI?.resetSelectionState?.(),
    showPendingClassProgressSummary: () =>
      titleModules.CharacterSelectUI?.showPendingSummaries?.(),
    resetDeckModalFilter: () =>
      combatModules.DeckModalUI?.resetFilter?.(),
  };
}
