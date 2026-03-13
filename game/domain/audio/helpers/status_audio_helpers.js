import { playAudioEvent } from './audio_event_core.js';

export function playStatusHeal(audioEngine) {
  return playAudioEvent(audioEngine, 'status', 'heal', 'playHeal');
}

export function playStatusSkill(audioEngine) {
  return playAudioEvent(audioEngine, 'status', 'skill', 'playSkill');
}

export function playStatusEcho(audioEngine) {
  return playAudioEvent(audioEngine, 'status', 'echo', 'playEcho');
}
