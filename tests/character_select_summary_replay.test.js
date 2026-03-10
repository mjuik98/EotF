import { describe, expect, it, vi } from 'vitest';
import { createCharacterSummaryReplay } from '../game/ui/title/character_select_summary_replay.js';

describe('character select summary replay helper', () => {
  it('consumes a pending summary and chains run-end into level-up popups', () => {
    const saveProgressMeta = vi.fn();
    const updateAll = vi.fn();
    const setTimeoutImpl = vi.fn((handler) => handler());
    let replaying = false;

    const levelUpPopup = {
      onClose: null,
      show: vi.fn(),
    };
    const runEndScreen = {
      onClose: null,
      show: vi.fn(),
    };
    const progressionSystem = {
      consumePendingSummary: vi.fn(() => ({
        classId: 'paladin',
        levelUps: [2, 3],
      })),
      getRoadmap: vi.fn(() => [
        { lv: 2, desc: 'Gain halo' },
        { lv: 3, desc: 'Gain ward' },
      ]),
    };

    const replay = createCharacterSummaryReplay({
      progressionSystem,
      meta: { pending: true },
      classIds: ['paladin'],
      resolveClass: () => ({ title: 'Paladin', name: 'Guardian', accent: '#7CC8FF' }),
      levelUpPopup,
      runEndScreen,
      saveProgressMeta,
      updateAll,
      setReplaying: (value) => {
        replaying = value;
      },
      isReplaying: () => replaying,
      setTimeoutImpl,
      fallbackBonusText: 'fallback',
    });

    replay.consumePendingSummaries();

    expect(saveProgressMeta).toHaveBeenCalledTimes(1);
    expect(runEndScreen.show).toHaveBeenCalledWith(
      expect.objectContaining({ classId: 'paladin' }),
      { title: 'Paladin', name: 'Guardian', accent: '#7CC8FF' },
    );
    expect(replaying).toBe(true);

    runEndScreen.onClose();
    expect(levelUpPopup.show).toHaveBeenNthCalledWith(1, expect.objectContaining({
      newLevel: 2,
      bonusText: 'Gain halo',
    }));

    levelUpPopup.onClose();
    expect(levelUpPopup.show).toHaveBeenNthCalledWith(2, expect.objectContaining({
      newLevel: 3,
      bonusText: 'Gain ward',
    }));

    progressionSystem.consumePendingSummary.mockReturnValue(null);
    levelUpPopup.onClose();
    expect(replaying).toBe(false);
    expect(saveProgressMeta).toHaveBeenCalledTimes(2);
    expect(updateAll).toHaveBeenCalledTimes(1);
    expect(setTimeoutImpl).toHaveBeenCalledWith(expect.any(Function), 10);
  });

  it('uses fallback bonus text and ignores consumption while replaying', () => {
    const progressionSystem = {
      consumePendingSummary: vi.fn(),
      getRoadmap: vi.fn(() => []),
    };
    const levelUpPopup = {
      onClose: null,
      show: vi.fn(),
    };
    let replaying = true;

    const replay = createCharacterSummaryReplay({
      progressionSystem,
      meta: {},
      classIds: ['guardian'],
      resolveClass: () => ({ title: 'Guardian', accent: '#FFAA55' }),
      levelUpPopup,
      runEndScreen: { onClose: null, show: vi.fn() },
      setReplaying: (value) => {
        replaying = value;
      },
      isReplaying: () => replaying,
      fallbackBonusText: 'fallback bonus',
    });

    replay.consumePendingSummaries();
    expect(progressionSystem.consumePendingSummary).not.toHaveBeenCalled();

    replaying = false;
    replay.showLevelUpChain({ classId: 'guardian', levelUps: [4] });
    expect(levelUpPopup.show).toHaveBeenCalledWith(expect.objectContaining({
      bonusText: 'fallback bonus',
      accent: '#FFAA55',
    }));
  });
});
