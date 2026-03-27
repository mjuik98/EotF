import { describe, expect, it, vi } from 'vitest';

import { finalizeRunOutcome } from '../game/features/run/application/run_rule_outcome.js';

function createGameState(curse = 'none') {
  return {
    _runOutcomeCommitted: false,
    currentRegion: 0,
    runConfig: { ascension: 0, endless: false, curse, disabledInscriptions: [] },
    worldMemory: {},
    stats: { _runStartTs: 0, _regionStartTs: 0, regionClearTimes: {} },
    meta: {
      unlocks: { ascension: true, endless: false },
      worldMemory: {},
      runCount: 1,
      achievements: { version: 1, states: {} },
      contentUnlocks: { version: 1, curses: {}, relics: {}, cards: { shared: {} } },
      progress: { victories: 0, failures: 0, echoShards: 0, totalDamage: 0, bossKills: {} },
    },
  };
}

describe('run outcome progression integration', () => {
  it('evaluates run_completed achievements after a victory', () => {
    const gs = createGameState();

    finalizeRunOutcome('victory', {}, {
      gs,
      saveSystem: { saveMeta: vi.fn(), clearSave: vi.fn() },
    });

    expect(gs.meta.achievements.states.first_victory.unlocked).toBe(true);
    expect(gs.meta.contentUnlocks.curses.blood_moon.unlocked).toBe(true);
  });

  it('unlocks cursed_conqueror_1 after a cursed victory', () => {
    const gs = createGameState('tax');

    finalizeRunOutcome('victory', {}, {
      gs,
      saveSystem: { saveMeta: vi.fn(), clearSave: vi.fn() },
    });

    expect(gs.meta.achievements.states.cursed_conqueror_1.unlocked).toBe(true);
    expect(gs.meta.contentUnlocks.curses.void_oath.unlocked).toBe(true);
  });

  it('captures newly unlocked content for follow-up feedback hooks', () => {
    const gs = createGameState();
    const onProgressionUnlocked = vi.fn();

    finalizeRunOutcome('victory', {}, {
      gs,
      onProgressionUnlocked,
      saveSystem: { saveMeta: vi.fn(), clearSave: vi.fn() },
    });

    expect(gs.runOutcomeUnlocks).toEqual([
      expect.objectContaining({
        type: 'curse',
        id: 'blood_moon',
      }),
    ]);
    expect(gs.runOutcomeAchievements).toEqual(['first_victory']);
    expect(onProgressionUnlocked).toHaveBeenCalledWith(gs.runOutcomeUnlocks, expect.objectContaining({
      kind: 'victory',
      gs,
      newlyUnlockedAchievements: ['first_victory'],
    }));
  });

  it('reports meta save status after committing the run outcome', () => {
    const gs = createGameState();
    const saveResult = { status: 'queued', persisted: false, queueDepth: 1 };
    const saveSystem = {
      saveMeta: vi.fn(() => saveResult),
      showSaveStatus: vi.fn(),
      clearSave: vi.fn(),
    };

    finalizeRunOutcome('victory', {}, {
      gs,
      doc: { body: {} },
      saveSystem,
    });

    expect(saveSystem.saveMeta).toHaveBeenCalledTimes(1);
    expect(saveSystem.showSaveStatus).toHaveBeenCalledWith(saveResult, expect.objectContaining({
      gs,
    }));
    expect(saveSystem.clearSave).toHaveBeenCalledTimes(1);
  });

  it('evaluates world-memory and chain achievements from synced run outcome state', () => {
    const gs = createGameState();
    gs.worldMemory.savedMerchant = 1;
    gs.stats.maxChain = 12;

    finalizeRunOutcome('victory', {}, {
      gs,
      saveSystem: { saveMeta: vi.fn(), clearSave: vi.fn() },
    });

    expect(gs.meta.achievements.states.chain_master_12.unlocked).toBe(true);
    expect(gs.meta.achievements.states.merchant_ally.unlocked).toBe(true);
    expect(gs.meta.contentUnlocks.relics.glitch_circuit.unlocked).toBe(true);
    expect(gs.meta.contentUnlocks.relics.ancient_battery.unlocked).toBe(true);
  });

  it('stores capped recent run summaries without reviving legacy runHistory', () => {
    const gs = createGameState();
    gs.player = { class: 'guardian', kills: 9 };
    gs.currentRegion = 2;
    gs.currentFloor = 7;
    gs.stats.maxChain = 14;
    gs.stats.clearTimeMs = 43210;
    gs.meta.storyPieces = [1, 2, 3, 4, 5];
    gs.meta.recentRuns = Array.from({ length: 10 }, (_, index) => ({
      runNumber: index + 1,
      outcome: 'defeat',
      classId: 'mage',
      timestamp: index + 1,
    }));

    finalizeRunOutcome('victory', {}, {
      gs,
      saveSystem: { saveMeta: vi.fn(), clearSave: vi.fn() },
    });

    expect(gs.meta.runHistory).toBeUndefined();
    expect(gs.meta.recentRuns).toHaveLength(10);
    expect(gs.meta.recentRuns.at(-1)).toMatchObject({
      outcome: 'victory',
      classId: 'guardian',
      region: 2,
      floor: 7,
      maxChain: 14,
      clearTimeMs: 43210,
      storyCount: 5,
      unlockCount: 2,
    });
    expect(gs.meta.recentRuns[0].runNumber).toBe(2);
  });
});
