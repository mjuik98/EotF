const LEGACY_PLAYER_STATE_FALLBACK_FLAG = '__legacyPlayerStateCommandFallback';

export function enableLegacyPlayerStateCommandFallback(gs) {
  if (gs && typeof gs === 'object') {
    gs[LEGACY_PLAYER_STATE_FALLBACK_FLAG] = true;
  }
  return gs;
}
