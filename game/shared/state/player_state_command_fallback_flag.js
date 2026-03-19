export const LEGACY_PLAYER_STATE_FALLBACK_FLAG = '__legacyPlayerStateCommandFallback';

export function isLegacyPlayerStateCommandFallbackEnabled(gs) {
  return gs?.[LEGACY_PLAYER_STATE_FALLBACK_FLAG] === true;
}
