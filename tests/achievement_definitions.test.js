import { describe, expect, it } from 'vitest';

import { ACHIEVEMENTS } from '../game/features/meta_progression/domain/achievement_definitions.js';
import { UNLOCKABLES } from '../game/features/meta_progression/domain/unlockable_definitions.js';

describe('achievement definitions', () => {
  it('declares the initial curse unlock achievements', () => {
    expect(ACHIEVEMENTS.first_victory.trigger).toBe('run_completed');
    expect(ACHIEVEMENTS.cursed_conqueror_1.trigger).toBe('run_completed');
    expect(UNLOCKABLES.curses.blood_moon).toMatchObject({
      requires: ['first_victory'],
      unlockHint: '첫 승리 필요',
      visibleBeforeUnlock: true,
    });
  });
});
