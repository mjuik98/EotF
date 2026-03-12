import { playUiItemGet } from '../../../../domain/audio/audio_event_helpers.js';

export function buildEventContractBuilders(ctx) {
  const {
    getRefs,
    buildBaseDeps,
    getRaf,
  } = ctx;

  return {
    event: () => {
      const refs = getRefs();
      return {
        ...buildBaseDeps('event'),
        runRules: refs.RunRules,
        updateUI: refs.updateUI,
        showGameplayScreen: () => refs.switchScreen?.('game'),
        returnToGame: refs.returnToGame,
        switchScreen: refs.switchScreen,
        renderMinimap: refs.renderMinimap,
        updateNextNodes: refs.updateNextNodes,
        showItemToast: refs.showItemToast,
        audioEngine: refs.AudioEngine,
        screenShake: refs.ScreenShake,
        descriptionUtils: refs.DescriptionUtils,
        requestAnimationFrame: getRaf(),
        playItemGet: () => playUiItemGet(refs.AudioEngine),
      };
    },
  };
}
