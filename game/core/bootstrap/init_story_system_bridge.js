import { registerLegacyModule } from '../../platform/legacy/game_module_registry.js';
import { getModuleRegistryScope } from '../bindings/module_registry_scopes.js';
import { createBootstrapDepProviders } from './create_bootstrap_dep_providers.js';

function createStorySystem(storyUI, deps) {
  const depProviders = createBootstrapDepProviders(deps);
  const storyPorts = depProviders.story;

  return {
    unlockNextFragment: () => storyUI?.unlockNextFragment?.(storyPorts.getStoryDeps()),
    showRunFragment: (overrides = {}) => storyUI?.showRunFragment?.({
      ...storyPorts.getStoryDeps(),
      ...overrides,
    }),
    displayFragment: (frag) => storyUI?.displayFragment?.(frag, storyPorts.getStoryDeps()),
    checkHiddenEnding: () => !!storyUI?.checkHiddenEnding?.(storyPorts.getStoryDeps()),
    showNormalEnding: () => storyUI?.showNormalEnding?.(storyPorts.getStoryDeps()),
    showHiddenEnding: () => storyUI?.showHiddenEnding?.(storyPorts.getStoryDeps()),
  };
}

export function setupStorySystemBridge({ modules, deps }) {
  const screenModules = getModuleRegistryScope(modules, 'screen');
  const storySystem = createStorySystem(screenModules.StoryUI, deps);
  registerLegacyModule(modules, 'storySystem', storySystem, { assignKey: 'StorySystem' });
  deps.patchRefs({ StorySystem: storySystem });
  return storySystem;
}
