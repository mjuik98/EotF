import { describe, expect, it, vi } from 'vitest';
import { Reducers, Actions } from '../game/core/state_actions.js';
import { modifyEnergy } from '../game/platform/legacy/game_api/player_resource_commands.js';

function createState() {
  return {
    player: {
      energy: 1,
      maxEnergy: 3,
    },
    markDirty: vi.fn(),
    triggerItems: vi.fn((trigger, data) => data),
    dispatch(action, payload) {
      return Reducers[action](this, payload);
    },
  };
}

describe('game api player resource commands', () => {
  it('modifies energy through the reducer so item triggers are preserved', () => {
    const gs = createState();

    const result = modifyEnergy(2, gs);

    expect(result).toEqual({ energyAfter: 3 });
    expect(gs.player.energy).toBe(3);
    expect(gs.triggerItems).toHaveBeenCalledWith('energy_gain', { amount: 2 });
    expect(gs.markDirty).toHaveBeenCalledWith('hud');
  });

  it('preserves energy_empty trigger on depletion', () => {
    const gs = createState();

    modifyEnergy(-1, gs);

    expect(gs.player.energy).toBe(0);
    expect(gs.triggerItems).toHaveBeenCalledWith('energy_empty', { previous: 1, delta: -1 });
  });
});
