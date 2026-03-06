import { afterEach, describe, expect, it, vi } from 'vitest';
import { GAME } from '../game/core/global_bridge.js';
import { RunRules, finalizeRunOutcome } from '../game/systems/run_rules.js';

describe('RunRules preview meta support', () => {
  const originalState = GAME.State;
  const originalModules = GAME.Modules;

  afterEach(() => {
    GAME.State = originalState;
    GAME.Modules = originalModules;
    vi.restoreAllMocks();
  });

  it('initializes preview preset and history containers', () => {
    const meta = {
      runCount: 1,
      unlocks: { ascension: true, endless: true },
      maxAscension: 3,
      runConfig: { ascension: 1, endless: true, blessing: 'forge', curse: 'silence', disabledInscriptions: [] },
    };

    RunRules.ensureMeta(meta);

    expect(meta.runConfigPresets).toEqual([null, null, null, null]);
    expect(meta.runHistory).toEqual([]);
  });

  it('records a compact history entry on run finalize', () => {
    const saveMeta = vi.fn();
    const clearSave = vi.fn();
    GAME.Modules = { SaveSystem: { saveMeta, clearSave } };
    GAME.State = {
      _runOutcomeCommitted: false,
      runConfig: { ascension: 2, endless: true, blessing: 'spark', curse: 'tax' },
      worldMemory: {},
      stats: { maxChain: 4 },
      meta: {
        runCount: 2,
        worldMemory: {},
        runHistory: [],
        runConfig: { ascension: 2, endless: true, blessing: 'spark', curse: 'tax', disabledInscriptions: [] },
        unlocks: { ascension: true, endless: true },
        maxAscension: 4,
        progress: { victories: 0, failures: 0, echoShards: 0, totalDamage: 0, bossKills: {} },
      },
    };

    const gain = finalizeRunOutcome('victory');

    expect(gain).toBe(5);
    expect(GAME.State.meta.runHistory).toHaveLength(1);
    expect(GAME.State.meta.runHistory[0]).toMatchObject({
      result: 'victory',
      ascension: 2,
      endless: true,
      blessing: 'spark',
      curse: 'tax',
      score: expect.any(Number),
    });
    expect(saveMeta).toHaveBeenCalledTimes(1);
    expect(clearSave).toHaveBeenCalledTimes(1);
  });
});
