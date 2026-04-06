import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('meta progression compat port re-exports', () => {
  it('keeps meta progression compat entrypoints as thin aliases to canonical capability ports', () => {
    const expectations = {
      'game/features/meta_progression/public.js': [
        "export { CLASS_CARD_POOLS, DEFAULT_LOADOUT_PRESET_SLOT, LOADOUT_PRESET_SLOTS } from './ports/public_loadout_capabilities.js';",
        'export {',
        '  CLASS_MASTERY_LEVEL_XP,',
        '  getClassMasteryRoadmap,',
        '  MAX_CLASS_MASTERY_LEVEL,',
        "} from './ports/public_class_progression_capabilities.js';",
        "export * from './ports/public_achievement_capabilities.js';",
        "export { buildAchievementRoadmap } from './ports/public_roadmap_capabilities.js';",
        "export { buildCardSummaryLine, buildLevel11PresetSummary, buildLevel12PresetSummary, getEligibleBonusRelicIds, getEligibleSwapAddCardIds } from './ports/public_loadout_capabilities.js';",
        'export {',
        '  buildClassLoadoutCustomizationPresentation,',
        '  clearClassLoadoutPreset,',
        '  resolveClassStartingLoadout,',
        '  saveLevel11LoadoutPreset,',
        '  saveLevel12LoadoutPreset,',
        '  setActiveClassLoadoutPresetSlot,',
        "} from './ports/public_loadout_capabilities.js';",
        "export * from './ports/public_unlock_capabilities.js';",
        "export { applyContentUnlockRewards } from './ports/public_unlock_application_capabilities.js';",
        "export * from './ports/public_achievement_application_capabilities.js';",
      ].join('\n'),
      'game/features/meta_progression/ports/public_unlock_application_capabilities.js': [
        "export { applyContentUnlockRewards } from '../application/apply_content_unlock_rewards.js';",
        "export { buildUnlockRoadmap, getContentLabel } from '../application/content_unlock_progression_queries.js';",
      ].join('\n'),
    };

    for (const [file, expected] of Object.entries(expectations)) {
      const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8').trim();
      expect(source).toBe(expected);
    }
  });
});
