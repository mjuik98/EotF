import { invokeHook, playAudioEvent } from './audio_event_core.js';

export function playUiClick(audioEngine) {
  return playAudioEvent(audioEngine, 'ui', 'click', 'playClick');
}

export function playUiFootstep(audioEngine) {
  return playAudioEvent(audioEngine, 'ui', 'footstep', 'playFootstep');
}

export function playUiCard(audioEngine) {
  return playAudioEvent(audioEngine, 'ui', 'card', 'playCard');
}

export function playClassSelect(audioEngine, classId) {
  if (!audioEngine || !classId) return false;
  if (typeof audioEngine.playEvent === 'function') {
    audioEngine.playEvent('classSelect', classId);
    return true;
  }

  const legacyMethod = audioEngine.playClassSelect;
  if (typeof legacyMethod !== 'function') return false;
  legacyMethod.call(audioEngine, classId);
  return true;
}

export function playUiLegendary(audioEngine) {
  return playAudioEvent(audioEngine, 'ui', 'legendary', 'playLegendary');
}

export function playUiItemGet(audioEngine) {
  return playAudioEvent(audioEngine, 'ui', 'itemGet', 'playItemGet');
}

export function playUiItemGetFeedback(optionalHook, audioEngine) {
  return invokeHook(optionalHook) || playUiItemGet(audioEngine);
}
