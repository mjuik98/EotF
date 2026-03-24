import { invokeLegacy, playAudioEvent } from './audio_event_core.js';

export function playReactionPlayerHit(audioEngine) {
  return playAudioEvent(audioEngine, 'reaction', 'playerHit', 'playPlayerHit');
}

export function playReactionEnemyDeath(audioEngine) {
  if (!audioEngine) return false;
  if (typeof audioEngine.playEvent === 'function') {
    audioEngine.playEvent('reaction', 'enemyDeath');
    return true;
  }
  return invokeLegacy(audioEngine, 'playEnemyDeath') || invokeLegacy(audioEngine, 'playDeath');
}

export function playReactionPlayerDeath(audioEngine) {
  return playAudioEvent(audioEngine, 'reaction', 'playerDeath', 'playDeath');
}
