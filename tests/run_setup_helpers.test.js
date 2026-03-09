import { describe, expect, it, vi } from 'vitest';
import {
  applyStartBonuses,
  getActiveInscriptions,
  getActiveSynergies,
  resolveRunSetupContext,
  resetRunConfig,
} from '../game/ui/run/run_setup_helpers.js';
import { createDefaultGameStateShape, createDefaultMetaState } from '../game/core/game_state_defaults.js';

function createGS() {
  const gs = {
    ...createDefaultGameStateShape(),
    meta: createDefaultMetaState({
      inscriptions: {
        fury: 2,
        fortune: 1,
      },
      runConfig: {
        ascension: 3,
        endless: true,
        curse: 'frost',
        disabledInscriptions: ['fortune'],
      },
    }),
  };

  Object.defineProperty(gs, 'runConfig', {
    configurable: true,
    get() {
      return this.meta.runConfig;
    },
    set(value) {
      this.meta.runConfig = value;
    },
  });

  return gs;
}

describe('run setup helpers', () => {
  it('filters disabled inscriptions and passive synergies', () => {
    const gs = createGS();
    const applyFury = vi.fn((state) => {
      state.player.gold += 5;
    });
    const applyFortune = vi.fn();
    const applySynergy = vi.fn((state) => {
      state.player.echo += 2;
    });
    const data = {
      inscriptions: {
        fury: { maxLevel: 3, levels: [{}, { apply: applyFury }] },
        fortune: { maxLevel: 1, levels: [{ apply: applyFortune }] },
      },
      synergies: {
        'fury+fortune': { trigger: 'passive', effect: applySynergy },
      },
    };

    expect(getActiveInscriptions(gs, data).map((item) => item.id)).toEqual(['fury']);
    expect(getActiveSynergies(gs, data)).toEqual([]);

    applyStartBonuses(gs, data);

    expect(applyFury).toHaveBeenCalledTimes(1);
    expect(applyFortune).not.toHaveBeenCalled();
    expect(applySynergy).not.toHaveBeenCalled();
    expect(gs.player.gold).toBe(5);
  });

  it('validates run setup dependencies and hp config', () => {
    const logger = { error: vi.fn() };
    const missing = resolveRunSetupContext({ getSelectedClass: () => 'swordsman' }, logger);
    expect(missing).toBeNull();
    expect(logger.error).toHaveBeenCalledTimes(1);

    logger.error.mockClear();
    const invalidHp = resolveRunSetupContext({
      getSelectedClass: () => 'swordsman',
      gs: createGS(),
      data: {
        classes: { swordsman: { stats: { HP: 0 } } },
        startDecks: { swordsman: ['strike'] },
      },
      runRules: {},
      audioEngine: {},
    }, logger);
    expect(invalidHp).toBeNull();
    expect(logger.error).toHaveBeenCalledTimes(1);
  });

  it('rebuilds run config from meta defaults', () => {
    const gs = createGS();

    resetRunConfig(gs);

    expect(gs.runConfig.ascension).toBe(3);
    expect(gs.runConfig.endless).toBe(true);
    expect(gs.runConfig.endlessMode).toBe(true);
    expect(gs.runConfig.curse).toBe('frost');
    expect(gs.runConfig.disabledInscriptions).toEqual(['fortune']);
    expect(gs._runOutcomeCommitted).toBe(false);
    expect(gs._classMasteryRunStartApplied).toBe(false);
    expect(gs._classMasteryAppliedClassId).toBeNull();
  });
});
