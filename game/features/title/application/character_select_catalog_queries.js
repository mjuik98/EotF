import {
  CLASS_METADATA,
  ITEMS,
} from '../ports/public_character_select_data_capabilities.js';
import { buildCharacterSelectChars } from '../domain/character_select_catalog_queries.js';

export const CHARACTER_SELECT_CHARS = buildCharacterSelectChars({
  classMetadata: CLASS_METADATA,
  items: ITEMS,
});
