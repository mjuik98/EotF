import {
  createCharacterSelectProgressionFacade,
  ensureCharacterSelectMeta,
} from '../../ports/public_character_select_progression_capabilities.js';
import { CHARACTER_SELECT_CHARS } from '../../application/character_select_catalog_queries.js';

export function buildCharacterSelectProgressionRuntimeBindings() {
  return {
    chars: CHARACTER_SELECT_CHARS,
    createProgressionFacade: createCharacterSelectProgressionFacade,
    ensureMeta: ensureCharacterSelectMeta,
  };
}
