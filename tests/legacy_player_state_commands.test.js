import { describe, expect, it, vi } from 'vitest';

import {
  applyLegacyPlayerGoldState,
  applyLegacyPlayerHealState,
  applyLegacyPlayerMaxEnergyGrowthState,
} from '../game/platform/legacy/state/legacy_player_state_command_fallback.js';
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
});
