import { playUiClick } from '../../ports/public_audio_presentation_capabilities.js';

export function createEndingFragmentChoiceActions({
  audioEngine = null,
  disableChoices = () => {},
  pick = null,
  scheduleCleanup = () => {},
} = {}) {
  return {
    choose(effect) {
      disableChoices();
      playUiClick(audioEngine);
      pick?.(effect);
      scheduleCleanup();
    },
  };
}
