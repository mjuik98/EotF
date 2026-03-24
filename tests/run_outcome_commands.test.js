import { describe, expect, it, vi } from 'vitest';
import { Actions } from '../game/core/store/state_actions.js';

import {
  applyPlayerMaxHpPenalty,
  applyRunOutcomeRewards,
  applySilenceCurseTurnStart,
  beginRunOutcomeCommit,
  captureRunOutcomeTiming,
  recordDefeatProgress,
  recordVictoryProgress,
  syncRunOutcomeMeta,
} from '../game/features/run/state/run_outcome_state_commands.js';

describe('run_outcome_commands', () => {
  it('applies hp penalties and silence turn rules through the run state command surface', () => {
    const gs = {
      player: { hp: 40, maxHp: 40, energy: 3, maxEnergy: 3 },
      combat: { turn: 2 },
    };

    expect(applyPlayerMaxHpPenalty(gs, 5)).toBe(35);
    expect(gs.player.hp).toBe(35);
    expect(applySilenceCurseTurnStart(gs)).toEqual({ energy: 1, maxEnergy: 1 });
  });

  it('tracks run outcome meta and rewards without direct caller mutations', () => {
    vi.spyOn(Date, 'now').mockReturnValue(6100);
    const gs = {
      _runOutcomeCommitted: false,
      currentRegion: 2,
      worldMemory: { savedMerchant: 1 },
      stats: { maxChain: 7, _runStartTs: 1000, _regionStartTs: 3000, regionClearTimes: {} },
      meta: {
        bestChain: 2,
        echoFragments: 1,
        runCount: 3,
        worldMemory: {},
        unlocks: { ascension: false, endless: false },
        progress: { victories: 0, cursedVictories: 0, failures: 0, echoShards: 0 },
      },
      runConfig: { curse: 'tax' },
    };

    expect(beginRunOutcomeCommit(gs)).toBe(true);
    expect(beginRunOutcomeCommit(gs)).toBe(false);
    expect(captureRunOutcomeTiming(gs)).toBe(gs.stats);
    expect(syncRunOutcomeMeta(gs)).toEqual({ bestChain: 7 });
    expect(recordVictoryProgress(gs)).toBe(5);
    expect(recordDefeatProgress(gs)).toBe(3);
    expect(applyRunOutcomeRewards(gs, 4)).toBe(5);
    expect(gs.stats.clearTimeMs).toBe(5100);
    expect(gs.stats.regionClearTimes[2]).toBe(3100);
    expect(gs.meta.worldMemory).toEqual({ savedMerchant: 1 });
    expect(gs.meta.unlocks.ascension).toBe(true);
    expect(gs.meta.progress.cursedVictories).toBe(1);
  });

  it('prefers shared player state commands for run outcome player mutations when dispatch is available', () => {
    const gs = {
      player: { hp: 40, maxHp: 40, energy: 3, maxEnergy: 3 },
      combat: { turn: 2 },
      dispatch: vi.fn((action, payload) => {
        if (action === Actions.PLAYER_MAX_HP_SET) {
          gs.player.maxHp = payload.amount;
          return { maxHpAfter: payload.amount };
        }
        if (action === Actions.PLAYER_HP_SET) {
          gs.player.hp = payload.amount;
          return { hpAfter: payload.amount };
        }
        if (action === Actions.PLAYER_MAX_ENERGY_SET) {
          gs.player.maxEnergy = payload.amount;
          return { maxEnergyAfter: payload.amount, energyAfter: Math.min(gs.player.energy, payload.amount) };
        }
        if (action === Actions.PLAYER_ENERGY_SET) {
          gs.player.energy = payload.amount;
          return { energyAfter: payload.amount };
        }
        return null;
      }),
    };

    expect(applyPlayerMaxHpPenalty(gs, 5)).toBe(35);
    expect(applySilenceCurseTurnStart(gs)).toEqual({ energy: 1, maxEnergy: 1 });
    expect(gs.dispatch).toHaveBeenCalledWith(Actions.PLAYER_MAX_HP_SET, { amount: 35 });
    expect(gs.dispatch).toHaveBeenCalledWith(Actions.PLAYER_HP_SET, { amount: 35 });
    expect(gs.dispatch).toHaveBeenCalledWith(Actions.PLAYER_MAX_ENERGY_SET, { amount: 1, maxEnergyCap: undefined });
    expect(gs.dispatch).toHaveBeenCalledWith(Actions.PLAYER_ENERGY_SET, { amount: 1 });
  });
});
