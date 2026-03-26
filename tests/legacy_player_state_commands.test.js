import { describe, expect, it, vi } from 'vitest';

import {
  applyLegacyPlayerGoldState,
  applyLegacyPlayerHealState,
  applyLegacyPlayerMaxEnergyGrowthState,
} from '../game/platform/legacy/state/legacy_player_state_command_fallback.js';
import { Actions } from '../game/core/store/state_actions.js';
import { LEGACY_PLAYER_STATE_FALLBACK_FLAG } from '../game/platform/legacy/state/player_state_command_fallback_flag.js';

describe('legacy_player_state_commands', () => {
  it('enables compat fallback ownership before delegating to shared player state commands', () => {
    const state = {
      markDirty: vi.fn(),
      player: {
        gold: 10,
        hp: 8,
        maxHp: 20,
        energy: 2,
        maxEnergy: 3,
      },
    };

    expect(applyLegacyPlayerGoldState(state, 5)).toEqual({ goldAfter: 15, delta: 5 });
    expect(applyLegacyPlayerHealState(state, 4)).toEqual({ healed: 4, hpAfter: 12 });
    expect(applyLegacyPlayerMaxEnergyGrowthState(state, 1)).toEqual({ maxEnergyAfter: 4, energyAfter: 3 });
    expect(state[LEGACY_PLAYER_STATE_FALLBACK_FLAG]).toBe(true);
  });

  it('prefers dispatch-first state actions without importing shared player-state commands', () => {
    const state = {
      dispatch: vi.fn((action, payload) => {
        expect(action).toBe(Actions.PLAYER_GOLD);
        expect(payload).toEqual({ amount: 5 });
        return { goldAfter: 15, delta: 5 };
      }),
      player: { gold: 10 },
    };

    expect(applyLegacyPlayerGoldState(state, 5)).toEqual({ goldAfter: 15, delta: 5 });
    expect(state.dispatch).toHaveBeenCalledTimes(1);
    expect(state[LEGACY_PLAYER_STATE_FALLBACK_FLAG]).toBe(true);
  });
});
