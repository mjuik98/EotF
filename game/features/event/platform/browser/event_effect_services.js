function noop() {}

export function createEventEffectServices({
  audioEngine,
  playItemGet,
  showItemToast,
} = {}) {
  return {
    playItemGet: playItemGet
      || audioEngine?.playItemGet?.bind?.(audioEngine)
      || noop,
    showItemToast: showItemToast || noop,
  };
}
