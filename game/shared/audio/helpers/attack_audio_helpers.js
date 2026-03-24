import { playAudioEvent } from './audio_event_core.js';

export function playAttackSlash(audioEngine) {
  return playAudioEvent(audioEngine, 'attack', 'slash', 'playHit');
}

export function playAttackHeavy(audioEngine) {
  return playAudioEvent(audioEngine, 'attack', 'heavy', 'playHeavyHit');
}

export function playAttackCritical(audioEngine) {
  return playAudioEvent(audioEngine, 'attack', 'critical', 'playCritical');
}
