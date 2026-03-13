import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  registerCardDiscovered: vi.fn(),
  registerItemFound: vi.fn(),
}));

vi.mock('../game/shared/codex/codex_record_state_use_case.js', () => ({
  registerCardDiscovered: hoisted.registerCardDiscovered,
  registerItemFound: hoisted.registerItemFound,
}));

import {
  applyRunStartLoadout,
  resetRunConfig,
  resetRuntimeState,
} from '../game/app/shared/state_commands/run_state_commands.js';
import {
  createDefaultGameStateShape,
  createDefaultMetaState,
} from '../game/core/game_state_defaults.js';

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

describe('run_state_commands', () => {
  it('resets run config from meta defaults', () => {
    const gs = createGS();

    resetRunConfig(gs);

    expect(gs.runConfig.ascension).toBe(2);
    expect(gs.runConfig.endless).toBe(true);
    expect(gs.runConfig.endlessMode).toBe(true);
    expect(gs.runConfig.curse).toBe('silence');
    expect(gs.runConfig.disabledInscriptions).toEqual(['fortune']);
    expect(gs._runOutcomeCommitted).toBe(false);
  });

  it('applies starting loadout and resets runtime state through shared commands', () => {
    const gs = createGS();
    gs.player.deck = ['old-card'];
    gs.mapNodes = [{ id: 'stale' }];
    gs.visitedNodes = new Set(['stale']);

    applyRunStartLoadout(gs, 'swordsman', {
      stats: { HP: 80 },
      startRelic: 'starter_relic',
    }, {
      startDecks: {
        swordsman: ['strike', 'defend'],
      },
      items: {
        starter_relic: {
          onAcquire: vi.fn(),
        },
      },
    });

    expect(gs.player.class).toBe('swordsman');
    expect(gs.player.hp).toBe(80);
    expect(gs.player.deck).toEqual(['strike', 'defend']);
    expect(gs.player.items).toContain('starter_relic');
    expect(hoisted.registerCardDiscovered).toHaveBeenCalledTimes(2);
    expect(hoisted.registerItemFound).toHaveBeenCalledWith(gs, 'starter_relic');

    resetRuntimeState(gs, gs.meta.worldMemory);

    expect(gs.currentFloor).toBe(0);
    expect(gs.mapNodes).toEqual([]);
    expect(gs.visitedNodes).toBeInstanceOf(Set);
    expect(gs.visitedNodes.size).toBe(0);
    expect(gs.worldMemory).toEqual({ savedMerchant: 1 });
    expect(gs.combat.active).toBe(false);
  });
});
