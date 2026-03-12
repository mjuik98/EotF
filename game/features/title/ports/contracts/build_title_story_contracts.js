import { buildTitleHelpPauseActions } from '../../application/help_pause_title_actions.js';

export function buildTitleStoryContractBuilders(ctx) {
  const {
    getRefs,
    buildBaseDeps,
  } = ctx;

  return {
    story: () => {
      const refs = getRefs();
      const titleActions = buildTitleHelpPauseActions({
        restartEndingFlow: refs.restartEndingFlow || refs.restartFromEnding,
        restartFromEnding: refs.restartFromEnding,
        selectEndingFragment: refs.selectEndingFragment || refs.selectFragment,
        selectFragment: refs.selectFragment,
        openEndingCodex: refs.openEndingCodex || refs.openCodex,
        openCodex: refs.openCodex,
      });

      return {
        ...buildBaseDeps('run'),
        audioEngine: refs.AudioEngine,
        particleSystem: refs.ParticleSystem,
        showWorldMemoryNotice: refs.showWorldMemoryNotice,
        restartEndingFlow: titleActions.restartEndingFlow,
        selectEndingFragment: titleActions.selectEndingFragment,
        openEndingCodex: titleActions.openEndingCodex,
        endingActions: titleActions.endingActions,
        restartFromEnding: refs.restartFromEnding,
        openCodex: refs.openCodex,
      };
    },
  };
}
