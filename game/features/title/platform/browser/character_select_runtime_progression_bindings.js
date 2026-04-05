import {
  createCharacterSelectProgressionFacade,
  ensureCharacterSelectMeta,
} from '../../ports/public_character_select_progression_capabilities.js';
import { CHARACTER_SELECT_CHARS } from '../../domain/character_select_catalog_content.js';

export function buildCharacterSelectProgressionRuntimeBindings() {
  return {
    chars: CHARACTER_SELECT_CHARS,
    createProgressionFacade: createCharacterSelectProgressionFacade,
    ensureMeta: ensureCharacterSelectMeta,
  };
}
