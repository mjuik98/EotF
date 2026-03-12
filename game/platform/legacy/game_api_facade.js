import { buildLegacyGameApiCompatPayload } from './build_legacy_game_api_compat_payload.js';
import { createLegacyGameApi } from './create_legacy_game_api.js';

export function buildLegacyGameAPIFacade(apiRef) {
  return createLegacyGameApi(buildLegacyGameApiCompatPayload(apiRef));
}
