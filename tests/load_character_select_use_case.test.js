import { describe, expect, it, vi } from 'vitest';
import {
  ensureCharacterSelectMeta,
  getCharacterSelectPresentation,
} from '../game/features/title/public.js';

describe('load_character_select_use_case', () => {
  it('no-ops ensureMeta when meta is absent', () => {
    const progressionSystem = { ensureMeta: vi.fn() };

    expect(ensureCharacterSelectMeta(null, ['paladin'], progressionSystem)).toBeNull();
    expect(progressionSystem.ensureMeta).not.toHaveBeenCalled();
  });

  it('builds fallback and populated presentation payloads', () => {
    const progressionSystem = {
      MAX_LEVEL: 10,
      ensureMeta: vi.fn(),
      getClassState: vi.fn(() => ({
        classId: 'paladin',
        level: 2,
        totalXp: 20,
        currentLevelXp: 20,
        nextLevelXp: 100,
        progress: 0.2,
      })),
      getRoadmap: vi.fn(() => ['skill-a']),
      getRecentSummaries: vi.fn(() => ['summary-a']),
    };

    expect(getCharacterSelectPresentation(null, 'paladin', ['paladin'], progressionSystem)).toEqual({
      classProgress: expect.objectContaining({
        classId: 'paladin',
        level: 1,
      }),
      maxLevel: 10,
      roadmap: ['skill-a'],
      unlockRoadmap: { account: [], class: [] },
      recentSummaries: [],
    });

    expect(getCharacterSelectPresentation({}, 'paladin', ['paladin'], progressionSystem)).toEqual({
      classProgress: expect.objectContaining({
        classId: 'paladin',
        level: 2,
      }),
      maxLevel: 10,
      roadmap: ['skill-a'],
      unlockRoadmap: expect.objectContaining({
        account: expect.any(Array),
        class: expect.any(Array),
      }),
      recentSummaries: ['summary-a'],
    });
  });
});
