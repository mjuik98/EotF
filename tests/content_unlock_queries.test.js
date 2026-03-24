import { describe, expect, it } from 'vitest';

import {
  getContentVisibility,
  getUnlockRequirementLabel,
  getUnlockedContent,
  isContentUnlocked,
} from '../game/features/meta_progression/domain/content_unlock_queries.js';

describe('content unlock queries', () => {
  it('reports locked-visible curses before unlock', () => {
    const meta = {
      contentUnlocks: { curses: {}, relics: {}, cards: { shared: {} } },
    };

    expect(isContentUnlocked(meta, { type: 'curse', id: 'blood_moon' })).toBe(false);
    expect(getContentVisibility(meta, { type: 'curse', id: 'blood_moon' })).toBe('locked-visible');
    expect(getUnlockRequirementLabel({ type: 'curse', id: 'blood_moon' })).toBe('첫 승리 필요');
    expect(getUnlockedContent(meta, { type: 'curse' })).toEqual([]);
  });
});
