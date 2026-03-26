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
    expect(onProgressionUnlocked).toHaveBeenCalledWith(gs.runOutcomeUnlocks, expect.objectContaining({
      kind: 'victory',
      gs,
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
});
