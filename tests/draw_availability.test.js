import { describe, expect, it } from 'vitest';
import {
  resolveDrawAvailability,
  resolvePlayerMaxHand,
} from '../game/ui/combat/draw_availability.js';

describe('resolveDrawAvailability', () => {
  it('enables draw when in player turn, with energy, and below hand cap', () => {
    const state = resolveDrawAvailability({
      combat: { active: true, playerTurn: true },
      player: { energy: 2, hand: ['a', 'b'] },
    });

    expect(state.canDraw).toBe(true);
    expect(state.handFull).toBe(false);
    expect(state.hasEnergy).toBe(true);
  });

  it('blocks draw during enemy turn even when energy exists', () => {
    const state = resolveDrawAvailability({
      combat: { active: true, playerTurn: false },
      player: { energy: 3, hand: ['a'] },
    });

    expect(state.canDraw).toBe(false);
    expect(state.playerTurn).toBe(false);
    expect(state.hasEnergy).toBe(true);
  });

  it('applies reduced hand cap from hand cap penalty', () => {
    const maxHand = resolvePlayerMaxHand({ _handCapMinus: 2 });
    const state = resolveDrawAvailability({
      combat: { active: true, playerTurn: true },
      player: { energy: 3, _handCapMinus: 2, hand: ['a', 'b', 'c', 'd', 'e', 'f'] },
    });

    expect(maxHand).toBe(6);
    expect(state.handFull).toBe(true);
    expect(state.canDraw).toBe(false);
  });

  it('treats missing hand as empty array', () => {
    const state = resolveDrawAvailability({
      combat: { active: true, playerTurn: true },
      player: { energy: 1, hand: null },
    });

    expect(state.handCount).toBe(0);
    expect(state.canDraw).toBe(true);
  });
});
