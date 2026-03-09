import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RunSetupUI } from '../game/ui/run/run_setup_ui.js';
import {
  createDefaultGameStateShape,
  createDefaultMetaState,
} from '../game/core/game_state_defaults.js';
import { clearIdempotencyPrefix } from '../game/utils/idempotency_utils.js';

function createGS() {
  const gs = {
    ...createDefaultGameStateShape(),
    meta: createDefaultMetaState({
      worldMemory: { savedMerchant: 1 },
      runConfig: {
        ascension: 2,
        endless: true,
        curse: 'silence',
        disabledInscriptions: ['fortune'],
      },
    }),
    markDirty: vi.fn(),
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

describe('RunSetupUI.startGame', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-09T12:34:56Z'));
    clearIdempotencyPrefix('run:');
  });

  afterEach(() => {
    clearIdempotencyPrefix('run:');
    vi.useRealTimers();
  });

  it('resets runtime state from shared defaults while preserving configured run settings', () => {
    const gs = createGS();
    gs.visitedNodes = new Set(['stale']);
    gs.mapNodes = [{ id: 'old-node' }];
    gs.player.deck = ['old-card'];
    gs.worldMemory = { stale: true };
    gs.stats.regionClearTimes = { 0: 1234 };

    const deps = {
      gs,
      getSelectedClass: () => 'swordsman',
      data: {
        classes: {
          swordsman: {
            stats: { HP: 90 },
          },
        },
        startDecks: {
          swordsman: ['strike', 'defend'],
        },
        items: {},
      },
      runRules: {
        ensureMeta: vi.fn(),
        applyRunStart: vi.fn(),
      },
      audioEngine: {
        init: vi.fn(),
        resume: vi.fn(),
      },
      shuffleArray: vi.fn((deck) => deck.reverse()),
      resetDeckModalFilter: vi.fn(),
      enterRun: vi.fn(),
      updateUI: vi.fn(),
    };

    RunSetupUI.startGame(deps);

    expect(gs.player.class).toBe('swordsman');
    expect(gs.player.hp).toBe(90);
    expect(gs.player.deck).toEqual(['defend', 'strike']);
    expect(gs.player.timeRiftGauge).toBe(0);
    expect(gs.player._nextCardDiscount).toBe(0);
    expect(gs.player._cascadeCards).toBeInstanceOf(Map);
    expect(gs.player.upgradedCards).toBeInstanceOf(Set);

    expect(gs.currentRegion).toBe(0);
    expect(gs.currentFloor).toBe(0);
    expect(gs.mapNodes).toEqual([]);
    expect(gs.visitedNodes).toBeInstanceOf(Set);
    expect(gs.visitedNodes.size).toBe(0);
    expect(gs.combat.active).toBe(false);
    expect(gs.stats.clearTimeMs).toBe(0);
    expect(gs.stats.regionClearTimes).toEqual({});
    expect(gs.stats._runStartTs).toBe(new Date('2026-03-09T12:34:56Z').getTime());
    expect(gs.stats._regionStartTs).toBe(new Date('2026-03-09T12:34:56Z').getTime());

    expect(gs.runConfig.ascension).toBe(2);
    expect(gs.runConfig.endless).toBe(true);
    expect(gs.runConfig.endlessMode).toBe(true);
    expect(gs.runConfig.curse).toBe('silence');
    expect(gs.runConfig.disabledInscriptions).toEqual(['fortune']);

    expect(gs.worldMemory).toEqual({ savedMerchant: 1 });
    expect(gs.worldMemory).not.toBe(gs.meta.worldMemory);
    expect(gs.markDirty).toHaveBeenCalledWith('hud');
    expect(deps.enterRun).toHaveBeenCalledTimes(1);
    expect(deps.updateUI).toHaveBeenCalledTimes(1);
  });
});
