import { registerLegacyModule } from '../../platform/legacy/game_module_registry.js';
import { getModuleRegistryScope } from '../bindings/module_registry_scopes.js';

function createStorySystem(storyUI, deps) {
  return {
    unlockNextFragment: () => storyUI?.unlockNextFragment?.(deps.getStoryDeps()),
    showRunFragment: (overrides = {}) => storyUI?.showRunFragment?.({
      ...deps.getStoryDeps(),
      ...overrides,
    }),
    displayFragment: (frag) => storyUI?.displayFragment?.(frag, deps.getStoryDeps()),
    checkHiddenEnding: () => !!storyUI?.checkHiddenEnding?.(deps.getStoryDeps()),
    showNormalEnding: () => storyUI?.showNormalEnding?.(deps.getStoryDeps()),
    showHiddenEnding: () => storyUI?.showHiddenEnding?.(deps.getStoryDeps()),
  };
}

export function setupStorySystemBridge({ modules, deps }) {
  const screenModules = getModuleRegistryScope(modules, 'screen');
  const storySystem = createStorySystem(screenModules.StoryUI, deps);
  registerLegacyModule(modules, 'storySystem', storySystem, { assignKey: 'StorySystem' });
  deps.patchRefs({ StorySystem: storySystem });
  return storySystem;
}
