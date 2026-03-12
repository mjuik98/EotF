import { playUiClick } from '../../domain/audio/audio_event_helpers.js';

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
