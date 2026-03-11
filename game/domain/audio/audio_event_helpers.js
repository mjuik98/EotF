function invokeLegacy(audioEngine, legacyMethodName) {
  if (!audioEngine || !legacyMethodName) return false;
  const legacyMethod = audioEngine[legacyMethodName];
  if (typeof legacyMethod !== 'function') return false;
  legacyMethod.call(audioEngine);
  return true;
}

export function playAudioEvent(audioEngine, category, key, legacyMethodName = '') {
  if (!audioEngine) return false;
  if (typeof audioEngine.playEvent === 'function') {
    audioEngine.playEvent(category, key);
    return true;
  }
  return invokeLegacy(audioEngine, legacyMethodName);
}

export function playUiClick(audioEngine) {
  return playAudioEvent(audioEngine, 'ui', 'click', 'playClick');
}

export function playUiFootstep(audioEngine) {
  return playAudioEvent(audioEngine, 'ui', 'footstep', 'playFootstep');
}

export function playUiCard(audioEngine) {
  return playAudioEvent(audioEngine, 'ui', 'card', 'playCard');
}

export function playUiLegendary(audioEngine) {
  return playAudioEvent(audioEngine, 'ui', 'legendary', 'playLegendary');
}

export function playAttackSlash(audioEngine) {
  return playAudioEvent(audioEngine, 'attack', 'slash', 'playHit');
}

export function playAttackHeavy(audioEngine) {
  return playAudioEvent(audioEngine, 'attack', 'heavy', 'playHeavyHit');
}

export function playAttackCritical(audioEngine) {
  return playAudioEvent(audioEngine, 'attack', 'critical', 'playCritical');
}

export function playReactionPlayerHit(audioEngine) {
  return playAudioEvent(audioEngine, 'reaction', 'playerHit', 'playPlayerHit');
}

export function playStatusHeal(audioEngine) {
  return playAudioEvent(audioEngine, 'status', 'heal', 'playHeal');
}

export function playStatusSkill(audioEngine) {
  return playAudioEvent(audioEngine, 'status', 'skill', 'playSkill');
}

export function playStatusEcho(audioEngine) {
  return playAudioEvent(audioEngine, 'status', 'echo', 'playEcho');
}
