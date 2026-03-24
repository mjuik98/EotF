import { describe, expect, it } from 'vitest';

import { CARDS } from '../data/cards.js';
import { CLASS_METADATA } from '../data/class_metadata.js';
import { ITEMS } from '../data/items.js';
import { ACHIEVEMENTS } from '../game/features/meta_progression/domain/achievement_definitions.js';
import { getContentLabel } from '../game/features/meta_progression/domain/content_unlock_queries.js';
import { UNLOCKABLES } from '../game/features/meta_progression/domain/unlockable_definitions.js';
import { CURSES } from '../game/features/run/domain/run_rules_curses.js';
import { CLASS_CARD_POOLS } from '../game/shared/progression/class_loadout_preset_catalog.js';

describe('achievement definitions', () => {
  it('declares the initial curse unlock achievements', () => {
    expect(ACHIEVEMENTS.first_victory.trigger).toBe('run_completed');
    expect(ACHIEVEMENTS.cursed_conqueror_1.trigger).toBe('run_completed');
    expect(ACHIEVEMENTS.veteran_victory_3.condition).toMatchObject({ type: 'victories', count: 3 });
    expect(ACHIEVEMENTS.swordsman_mastery_3.condition).toMatchObject({ type: 'class_level', classId: 'swordsman', count: 3 });
    expect(UNLOCKABLES.curses.blood_moon).toMatchObject({
      requires: ['first_victory'],
      unlockHint: '첫 승리 필요',
      visibleBeforeUnlock: true,
    });
    expect(UNLOCKABLES.cards.blade_dance).toMatchObject({
      scope: 'class',
      classId: 'swordsman',
      unlockHint: '잔향검사 숙련도 3 달성 필요',
    });
  });

  it('keeps unlockable curse ids aligned with the run curse catalog', () => {
    for (const curseId of Object.keys(UNLOCKABLES.curses)) {
      expect(CURSES[curseId]).toBeTruthy();
    }
  });

  it('keeps unlockable curse labels aligned with the run curse catalog', () => {
    for (const curseId of Object.keys(UNLOCKABLES.curses)) {
      expect(getContentLabel({ type: 'curse', id: curseId })).toBe(CURSES[curseId].name);
    }
  });

  it('keeps achievement unlock rewards aligned with unlockable definitions', () => {
    for (const achievement of Object.values(ACHIEVEMENTS)) {
      for (const reward of achievement.rewards || []) {
        if (reward?.type !== 'unlock') continue;
        const bucket = UNLOCKABLES[`${reward.contentType}s`] || {};
        expect(bucket[reward.contentId]).toBeTruthy();
      }
    }
  });

  it('keeps class-scoped unlockables aligned with runtime catalogs and class ownership', () => {
    for (const [cardId, unlockable] of Object.entries(UNLOCKABLES.cards)) {
      expect(CARDS[cardId]).toBeTruthy();
      expect(CLASS_CARD_POOLS[unlockable.classId]).toContain(cardId);
      expect(CLASS_METADATA[unlockable.classId]?.startDeck || []).not.toContain(cardId);
    }
    for (const [relicId, unlockable] of Object.entries(UNLOCKABLES.relics)) {
      expect(ITEMS[relicId]).toBeTruthy();
      expect(CLASS_METADATA[unlockable.classId]).toBeTruthy();
    }
  });

  it('keeps class-scoped achievement rewards aligned with unlockable class ids', () => {
    for (const achievement of Object.values(ACHIEVEMENTS)) {
      for (const reward of achievement.rewards || []) {
        if (reward?.type !== 'unlock' || !reward.classId) continue;
        const unlockable = UNLOCKABLES[`${reward.contentType}s`]?.[reward.contentId];
        expect(unlockable).toBeTruthy();
        expect(unlockable.classId).toBe(reward.classId);
      }
    }
  });
});
