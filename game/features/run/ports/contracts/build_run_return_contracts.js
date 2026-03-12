export function buildRunReturnContractBuilders(ctx) {
  const { getRefs, buildBaseDeps } = ctx;

  return {
    runReturn: () => {
      const refs = getRefs();
      return {
        ...buildBaseDeps('run'),
        storySystem: refs.StorySystem,
        finalizeRunOutcome: refs.finalizeRunOutcome,
        advanceToNextRegion: refs.advanceToNextRegion,
        getBaseRegionIndex: refs.getBaseRegionIndex,
        getRegionCount: refs.getRegionCount,
        updateNextNodes: refs.updateNextNodes,
        renderMinimap: refs.renderMinimap,
        showGameplayScreen: () => refs.switchScreen?.('game'),
        switchScreen: refs.switchScreen,
      };
    },
  };
}
