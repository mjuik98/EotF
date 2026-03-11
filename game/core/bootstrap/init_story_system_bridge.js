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
  const storySystem = createStorySystem(modules.StoryUI, deps);
  modules.GAME.register('storySystem', storySystem);
  modules.StorySystem = storySystem;
  deps.patchRefs({ StorySystem: storySystem });
  return storySystem;
}
