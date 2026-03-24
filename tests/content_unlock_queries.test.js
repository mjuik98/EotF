import { describe, expect, it } from 'vitest';

import {
  isContentAvailable,
  getContentVisibility,
  getContentLabel,
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
    expect(getContentLabel({ type: 'curse', id: 'blood_moon' })).toBe('핏빛 월식');
    expect(getUnlockRequirementLabel({ type: 'curse', id: 'blood_moon' })).toBe('첫 승리 필요');
    expect(getUnlockedContent(meta, { type: 'curse' })).toEqual([]);
    expect(isContentAvailable(meta, { type: 'curse', id: 'blood_moon' })).toBe(false);
  });

  it('reads shared and class-scoped card unlock buckets', () => {
    const meta = {
      contentUnlocks: {
        curses: {},
        relics: {},
        cards: {
          shared: {
            shared_burst: { unlocked: true },
          },
          swordsman: {
            echo_slash: { unlocked: true },
          },
        },
      },
    };

    expect(isContentUnlocked(meta, { type: 'card', id: 'shared_burst' })).toBe(true);
    expect(isContentUnlocked(meta, { type: 'card', id: 'shared_burst', classId: 'swordsman' })).toBe(true);
    expect(isContentUnlocked(meta, { type: 'card', id: 'echo_slash', classId: 'swordsman' })).toBe(true);
    expect(getUnlockedContent(meta, { type: 'card' })).toEqual(['shared_burst']);
    expect(getUnlockedContent(meta, { type: 'card', classId: 'swordsman' })).toEqual(['shared_burst', 'echo_slash']);
  });

  it('reads shared and class-scoped relic unlock buckets', () => {
    const meta = {
      contentUnlocks: {
        curses: {},
        relics: {
          shared_compass: { unlocked: true },
        },
        relicsByClass: {
          swordsman: {
            void_compass: { unlocked: true },
          },
        },
        cards: { shared: {} },
      },
    };

    expect(isContentUnlocked(meta, { type: 'relic', id: 'shared_compass' })).toBe(true);
    expect(isContentUnlocked(meta, { type: 'relic', id: 'shared_compass', classId: 'swordsman' })).toBe(true);
    expect(isContentUnlocked(meta, { type: 'relic', id: 'void_compass', classId: 'swordsman' })).toBe(true);
    expect(getUnlockedContent(meta, { type: 'relic' })).toEqual(['shared_compass']);
    expect(getUnlockedContent(meta, { type: 'relic', classId: 'swordsman' })).toEqual(['shared_compass', 'void_compass']);
  });

  it('resolves localized labels for cards and relics from runtime catalogs', () => {
    expect(getContentLabel({ type: 'card', id: 'strike' })).toBe('타격');
    expect(getContentLabel({ type: 'relic', id: 'void_compass' })).toBe('공허의 나침반');
  });

  it('falls back to provided labels when runtime catalogs do not know the content id', () => {
    expect(getContentLabel({ type: 'card', id: 'unknown_card', fallbackLabel: '미지의 카드' })).toBe('미지의 카드');
    expect(getContentLabel({ type: 'relic', id: 'unknown_relic', fallbackLabel: '미지의 유물' })).toBe('미지의 유물');
  });

  it('treats undefined unlockables as available and class-scoped content as gated by matching unlock state', () => {
    const meta = {
      contentUnlocks: {
        curses: {},
        relics: {},
        relicsByClass: {
          mage: {
            void_compass: { unlocked: true },
          },
        },
        cards: {
          shared: {},
          swordsman: {
            blade_dance: { unlocked: true },
          },
        },
      },
    };

    expect(isContentAvailable(meta, { type: 'card', id: 'strike', classId: 'swordsman' })).toBe(true);
    expect(isContentAvailable(meta, { type: 'card', id: 'blade_dance', classId: 'swordsman' })).toBe(true);
    expect(isContentAvailable(meta, { type: 'card', id: 'blade_dance', classId: 'hunter' })).toBe(false);
    expect(isContentAvailable(meta, { type: 'relic', id: 'void_compass', classId: 'mage' })).toBe(true);
    expect(isContentAvailable(meta, { type: 'relic', id: 'void_compass', classId: 'guardian' })).toBe(false);
  });
});
