import { LEGACY_PLAYER_STATE_FALLBACK_FLAG } from '../../../shared/state/player_state_command_fallback_flag.js';

export function enableLegacyPlayerStateCommandFallback(gs) {
  if (gs && typeof gs === 'object') {
    gs[LEGACY_PLAYER_STATE_FALLBACK_FLAG] = true;
  }
  return gs;
}
