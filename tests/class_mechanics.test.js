import { describe, expect, it, vi } from 'vitest';
import { ClassMechanics } from '../game/combat/class_mechanics.js';

function createState(overrides = {}) {
  const state = {
    player: {
      buffs: {},
    },
    combat: {
      active: true,
    },
    addBuff: vi.fn((id, stacks, data = {}) => {
      const buffs = state.player.buffs;
      if (!buffs[id]) {
        buffs[id] = { stacks, ...data };
        return;
      }
      buffs[id].stacks += stacks;
      for (const key of Object.keys(data)) {
        if (typeof data[key] === 'number') {
          buffs[id][key] = (buffs[id][key] || 0) + data[key];
        } else {
          buffs[id][key] = data[key];
        }
      }
    }),
    markDirty: vi.fn(),
    ...overrides,
  };
  return state;
}

describe('ClassMechanics.swordsman resonance updates', () => {
  it('increments resonance by 1 via addBuff on each card play', () => {
    const gs = createState({
      player: {
        buffs: {
          resonance: { stacks: 12, dmgBonus: 5 },
        },
      },
    });

    ClassMechanics.swordsman.onPlayCard(gs, { cardId: 'strike' });

    expect(gs.addBuff).toHaveBeenCalledWith('resonance', 0, { dmgBonus: 1 });
    expect(gs.player.buffs.resonance.dmgBonus).toBe(6);
    expect(gs.player.buffs.resonance.stacks).toBe(99);
    expect(gs.markDirty).toHaveBeenCalledWith('hud');
  });

  it('does not exceed resonance cap (30) on card play', () => {
    const gs = createState({
      player: {
        buffs: {
          resonance: { stacks: 80, dmgBonus: 30 },
        },
      },
    });

    ClassMechanics.swordsman.onPlayCard(gs, { cardId: 'strike' });

    expect(gs.addBuff).not.toHaveBeenCalled();
    expect(gs.player.buffs.resonance.dmgBonus).toBe(30);
    expect(gs.player.buffs.resonance.stacks).toBe(99);
    expect(gs.markDirty).toHaveBeenCalledWith('hud');
  });

  it('does not gain resonance from movement outside combat', () => {
    const gs = createState({
      combat: { active: false },
      player: {
        buffs: {
          resonance: { stacks: 99, dmgBonus: 10 },
        },
      },
    });

    ClassMechanics.swordsman.onMove(gs);

    expect(gs.player.buffs.resonance.dmgBonus).toBe(10);
  });
});
