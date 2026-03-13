export function invokeLegacy(audioEngine, legacyMethodName) {
  if (!audioEngine || !legacyMethodName) return false;
  const legacyMethod = audioEngine[legacyMethodName];
  if (typeof legacyMethod !== 'function') return false;
  legacyMethod.call(audioEngine);
  return true;
}

export function invokeHook(optionalHook) {
  if (typeof optionalHook !== 'function') return false;
  optionalHook();
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
