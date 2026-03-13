import { playAudioEvent } from './audio_event_core.js';

export function playEventBossPhase(audioEngine) {
  return playAudioEvent(audioEngine, 'event', 'bossPhase', 'playBossPhase');
}

export function playEventResonanceBurst(audioEngine) {
  return playAudioEvent(audioEngine, 'event', 'resonanceBurst', 'playResonanceBurst');
}
