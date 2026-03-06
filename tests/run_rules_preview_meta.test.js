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
      runConfig: { ascension: 1, endless: true, curse: 'silence', disabledInscriptions: [] },
    };

    RunRules.ensureMeta(meta);

    expect(meta.runConfigPresets).toEqual([null, null, null, null]);
    expect(meta.runHistory).toEqual([]);
    expect(meta.runConfig).not.toHaveProperty('blessing');
  });

  it('records a compact history entry on run finalize', () => {
    const saveMeta = vi.fn();
    const clearSave = vi.fn();
    GAME.Modules = { SaveSystem: { saveMeta, clearSave } };
    GAME.State = {
      _runOutcomeCommitted: false,
      runConfig: { ascension: 2, endless: true, curse: 'tax', disabledInscriptions: ['fortune'] },
      worldMemory: {},
      stats: { maxChain: 4 },
      meta: {
        runCount: 2,
        worldMemory: {},
        inscriptions: { echo_boost: 2, fortune: 1, resilience: 0 },
        runHistory: [],
        runConfig: { ascension: 2, endless: true, curse: 'tax', disabledInscriptions: ['fortune'] },
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
      curse: 'tax',
      activeInscriptions: 1,
      score: expect.any(Number),
    });
    expect(saveMeta).toHaveBeenCalledTimes(1);
    expect(clearSave).toHaveBeenCalledTimes(1);
  });

  it('reduces difficulty score for active inscriptions', () => {
    const base = {
      runConfig: { ascension: 0, endless: false, curse: 'none', disabledInscriptions: [] },
      meta: { inscriptions: {} },
    };
    const echoOnly = {
      runConfig: { ascension: 0, endless: false, curse: 'none', disabledInscriptions: [] },
      meta: { inscriptions: { echo_boost: 1 } },
    };
    const frailOnly = {
      runConfig: { ascension: 0, endless: false, curse: 'frail', disabledInscriptions: [] },
      meta: { inscriptions: {} },
    };
    const mitigated = {
      runConfig: { ascension: 0, endless: false, curse: 'frail', disabledInscriptions: [] },
      meta: { inscriptions: { resilience: 1 } },
    };

    expect(RunRules.getDifficultyScore(base)).toBe(0);
    expect(RunRules.getDifficultyScore(echoOnly)).toBe(0);
    expect(RunRules.getDifficultyScore(frailOnly)).toBe(8);
    expect(RunRules.getInscriptionScoreAdjustment(mitigated)).toBe(-3);
    expect(RunRules.getDifficultyScore(mitigated)).toBe(5);
    expect(RunRules.getRewardMultiplier(mitigated)).toBe(1.07);
  });

  it('ignores disabled inscriptions and scales stronger inscription stacks', () => {
    const taxWithFortune = {
      runConfig: { ascension: 0, endless: false, curse: 'tax', disabledInscriptions: [] },
      meta: { inscriptions: { fortune: 2 } },
    };
    const silenceWithEcho = {
      runConfig: { ascension: 0, endless: false, curse: 'silence', disabledInscriptions: [] },
      meta: { inscriptions: { echo_boost: 3 } },
    };
    const disabledFortune = {
      runConfig: { ascension: 0, endless: false, curse: 'tax', disabledInscriptions: ['fortune'] },
      meta: { inscriptions: { fortune: 2 } },
    };

    expect(RunRules.getDifficultyScore(taxWithFortune)).toBe(1);
    expect(RunRules.getDifficultyScore(silenceWithEcho)).toBe(1);
    expect(RunRules.getDifficultyScore(disabledFortune)).toBe(5);
  });
});
