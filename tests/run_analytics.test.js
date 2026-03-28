import { describe, expect, it } from 'vitest';

import {
  buildRunAnalyticsSnapshot,
  ensureRunAnalytics,
  recordRunAnalytics,
} from '../game/features/run/domain/run_analytics.js';

describe('run_analytics', () => {
  it('records aggregate totals and per-class breakdown from run summaries', () => {
    const meta = {};
    ensureRunAnalytics(meta);

    recordRunAnalytics(meta, {
      outcome: 'victory',
      classId: 'mage',
      floor: 8,
      kills: 14,
      clearTimeMs: 580000,
      storyCount: 4,
      unlockCount: 2,
      achievementCount: 1,
    });
    recordRunAnalytics(meta, {
      outcome: 'defeat',
      classId: 'guardian',
      floor: 5,
      kills: 7,
      clearTimeMs: 240000,
      storyCount: 1,
      unlockCount: 0,
      achievementCount: 0,
    });
    recordRunAnalytics(meta, {
      outcome: 'abandon',
      classId: 'mage',
      floor: 3,
      kills: 2,
      clearTimeMs: 60000,
      storyCount: 0,
      unlockCount: 0,
      achievementCount: 0,
    });

    expect(meta.analytics).toEqual(expect.objectContaining({
      totals: expect.objectContaining({
        runs: 3,
        victories: 1,
        defeats: 1,
        abandons: 1,
        kills: 23,
        floors: 16,
      }),
      classes: expect.objectContaining({
        mage: expect.objectContaining({ runs: 2, victories: 1, kills: 16, bestFloor: 8 }),
        guardian: expect.objectContaining({ runs: 1, defeats: 1, kills: 7, bestFloor: 5 }),
      }),
    }));
  });

  it('builds analytics snapshots from persisted analytics or recent run fallback data', () => {
    const meta = {
      recentRuns: [
        { outcome: 'victory', classId: 'mage', floor: 7, kills: 12 },
        { outcome: 'defeat', classId: 'guardian', floor: 5, kills: 4 },
        { outcome: 'victory', classId: 'mage', floor: 9, kills: 15 },
      ],
    };

    expect(buildRunAnalyticsSnapshot(meta)).toEqual(expect.objectContaining({
      totalRuns: 3,
      winRate: 67,
      avgFloor: 7,
      avgKills: 10.3,
      favoriteClassId: 'mage',
      bestClassId: 'mage',
      bestClassWinRate: 100,
      currentStreakOutcome: 'victory',
      currentStreakCount: 1,
      recentOutcomeLabels: ['승리', '패배', '승리'],
      classBreakdown: [
        expect.objectContaining({ classId: 'mage', runs: 2, winRate: 100, bestFloor: 9 }),
        expect.objectContaining({ classId: 'guardian', runs: 1, winRate: 0, bestFloor: 5 }),
      ],
    }));
  });
});
