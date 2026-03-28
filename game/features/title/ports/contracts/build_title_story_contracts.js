function resolveEndingActions(refs = {}) {
  return {
    restart: refs.restartEndingFlow || refs.restartFromEnding,
    selectFragment: refs.selectEndingFragment || refs.selectFragment,
    openCodex: refs.openEndingCodex || refs.openCodex,
  };
}

export function buildTitleStoryContractBuilders(ctx) {
  const {
    getRefs,
    buildBaseDeps,
  } = ctx;

  return {
    story: () => {
      const refs = getRefs();
      const endingActions = resolveEndingActions(refs);

      return {
        ...buildBaseDeps('run'),
        audioEngine: refs.AudioEngine,
        particleSystem: refs.ParticleSystem,
        showWorldMemoryNotice: refs.showWorldMemoryNotice,
        restartEndingFlow: () => endingActions.restart?.(),
        selectEndingFragment: (effect) => endingActions.selectFragment?.(effect),
        openEndingCodex: () => endingActions.openCodex?.(),
        endingActions,
        restartFromEnding: refs.restartFromEnding,
        openCodex: refs.openCodex,
      };
    },
  };
}
