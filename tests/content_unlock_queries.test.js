import { describe, expect, it } from 'vitest';

import { buildAchievementRoadmap } from '../game/features/meta_progression/ports/public_roadmap_capabilities.js';
import {
  buildUnlockRoadmap,
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

  it('builds the next account and class unlock roadmap entries', () => {
    const meta = {
      stats: {
        victories: 0,
        cursedVictories: 0,
      },
      classProgress: {
        levels: {
          paladin: 2,
        },
      },
      contentUnlocks: {
        curses: {},
        relics: {},
        cards: { shared: {} },
      },
    };

    expect(buildUnlockRoadmap(meta, { classId: 'paladin' })).toEqual({
      account: [
        {
          contentType: 'curse',
          contentId: 'blood_moon',
          contentLabel: '핏빛 월식',
          requirementLabel: '첫 승리 필요',
          progressLabel: '0 / 1',
          achievementTitle: '첫 승리',
          focusLabel: '승리 런',
        },
        {
          contentType: 'curse',
          contentId: 'void_oath',
          contentLabel: '공허의 맹세',
          requirementLabel: '저주 활성화 상태로 승리 1회 필요',
          progressLabel: '0 / 1',
          achievementTitle: '저주 정복자 I',
          focusLabel: '저주 승리',
        },
      ],
      class: [{
        contentType: 'card',
        contentId: 'judgement',
        contentLabel: '심판',
        requirementLabel: '찬송기사 숙련도 3 달성 필요',
        progressLabel: '2 / 3',
        achievementTitle: '성기사 숙련',
        focusLabel: '클래스 숙련',
      }],
    });
  });

  it('skips unlock roadmap entries that are already unlocked', () => {
    const meta = {
      stats: {
        victories: 1,
        cursedVictories: 1,
      },
      classProgress: {
        levels: {
          paladin: 3,
        },
      },
      contentUnlocks: {
        curses: {
          blood_moon: { unlocked: true },
        },
        relics: {},
        cards: {
          shared: {},
          paladin: {
            judgement: { unlocked: true },
          },
        },
      },
    };

    expect(buildUnlockRoadmap(meta, { classId: 'paladin' })).toEqual({
      account: [
        {
          contentType: 'curse',
          contentId: 'void_oath',
          contentLabel: '공허의 맹세',
          requirementLabel: '저주 활성화 상태로 승리 1회 필요',
          progressLabel: '1 / 1',
          achievementTitle: '저주 정복자 I',
          focusLabel: '저주 승리',
        },
        {
          contentType: 'relic',
          contentId: 'ancient_battery',
          contentLabel: '고대 배터리',
          requirementLabel: '잃어버린 상인을 1회 구출 필요',
          progressLabel: '0 / 1',
          achievementTitle: '상인의 인연',
          focusLabel: '세계 기억',
        },
      ],
      class: [],
    });
  });

  it('surfaces multiple near-term account unlocks instead of only the first entry', () => {
    const meta = {
      bestChain: 11,
      worldMemory: {
        savedMerchant: 1,
      },
      progress: {
        victories: 4,
        failures: 2,
      },
      classProgress: {
        levels: {},
      },
      contentUnlocks: {
        curses: {
          blood_moon: { unlocked: true },
          void_oath: { unlocked: true },
          shadow_burden: { unlocked: true },
          ruinous_tide: { unlocked: true },
        },
        relics: {
          ancient_battery: { unlocked: true },
        },
        relicsByClass: {},
        cards: { shared: {} },
      },
    };

    expect(buildUnlockRoadmap(meta, { classId: 'mage' }).account).toEqual([
      expect.objectContaining({
        contentType: 'relic',
        contentId: 'dimension_key',
        achievementTitle: '루프 개척자',
        progressLabel: '4 / 5',
      }),
      expect.objectContaining({
        contentType: 'relic',
        contentId: 'eternal_fragment',
        achievementTitle: '상처 입은 귀환',
        progressLabel: '2 / 3',
      }),
    ]);
  });

  it('tracks story-piece and codex-entry progress in the unlock roadmap', () => {
    const meta = {
      storyPieces: [1, 2, 3, 4],
      codex: {
        enemies: new Set(['a', 'b', 'c', 'd', 'e', 'f']),
        cards: new Set(['g', 'h', 'i', 'j', 'k']),
        items: new Set(['l', 'm', 'n', 'o', 'p', 'q', 'r']),
      },
      progress: {
        victories: 0,
        failures: 0,
      },
      classProgress: {
        levels: {},
      },
      contentUnlocks: {
        curses: {
          blood_moon: { unlocked: true },
          void_oath: { unlocked: true },
          shadow_burden: { unlocked: true },
          ruinous_tide: { unlocked: true },
        },
        relics: {
          ancient_battery: { unlocked: true },
        },
        relicsByClass: {},
        cards: { shared: {} },
      },
    };

    expect(buildUnlockRoadmap(meta, { classId: 'guardian' }).account).toEqual([
      expect.objectContaining({
        contentId: 'memory_thread',
        achievementTitle: '기억 수집가',
        progressLabel: '4 / 5',
        focusLabel: '스토리 조각',
      }),
      expect.objectContaining({
        contentId: 'field_journal',
        achievementTitle: '현장 조사원',
        progressLabel: '18 / 20',
        focusLabel: '도감 수집',
      }),
    ]);
  });

  it('builds the next achievement roadmap entries for account and class progression', () => {
    const meta = {
      progress: {
        victories: 2,
        cursedVictories: 0,
        failures: 1,
      },
      classProgress: {
        levels: {
          paladin: 2,
        },
      },
      achievements: {
        states: {
          first_victory: { unlocked: true },
        },
      },
    };

    expect(typeof buildAchievementRoadmap).toBe('function');
    expect(buildAchievementRoadmap(meta, { classId: 'paladin' })).toEqual({
      account: [
        expect.objectContaining({
          id: 'cursed_conqueror_1',
          title: '저주 정복자 I',
          progressLabel: '0 / 1',
          rewardLabel: '보상 · 공허의 맹세',
        }),
        expect.objectContaining({
          id: 'merchant_ally',
          title: '상인의 인연',
          progressLabel: '0 / 1',
          rewardLabel: '보상 · 고대 배터리',
        }),
      ],
      class: [
        expect.objectContaining({
          id: 'paladin_mastery_3',
          title: '성기사 숙련',
          progressLabel: '2 / 3',
          rewardLabel: '보상 · 심판',
        }),
      ],
    });
  });

  it('prioritizes diversified achievement roadmap entries from boss, region, and ascension progress', () => {
    const meta = {
      progress: {
        victories: 6,
        cursedVictories: 0,
        failures: 0,
        bossKills: { silent_tyrant: 1 },
        regionVictories: { 1: 1 },
        highestVictoryAscension: 4,
      },
      achievements: {
        states: {
          first_victory: { unlocked: true },
          veteran_victory_3: { unlocked: true },
          veteran_victory_5: { unlocked: true },
        },
      },
    };

    expect(buildAchievementRoadmap(meta, { classId: 'mage' }).account).toEqual([
      expect.objectContaining({
        id: 'ascension_vanguard_5',
        focusLabel: '승천 승리',
        progressLabel: '4 / 5',
      }),
      expect.objectContaining({
        id: 'city_conqueror',
        focusLabel: '지역 정복',
        progressLabel: '1 / 1',
      }),
    ]);
  });
});
