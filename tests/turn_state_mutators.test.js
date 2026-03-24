import { describe, expect, it } from 'vitest';
import {
  decrementStackedBuff,
  drawFromRandomPlayerPool,
} from '../game/features/combat/domain/turn/turn_state_mutators.js';

describe('turn_state_mutators pure helpers', () => {
  it('decrements stacked buffs and removes exhausted entries at zero', () => {
    const buffs = {
      weakened: { stacks: 2 },
    };

    expect(decrementStackedBuff(buffs, 'weakened')).toBe(true);
    expect(buffs.weakened.stacks).toBe(1);
    expect(decrementStackedBuff(buffs, 'weakened')).toBe(true);
    expect(buffs.weakened).toBeUndefined();
  });

  it('draws a card from a pooled player collection without mutating unrelated pools', () => {
    const pools = [
      { key: 'deck', cards: ['a', 'b'] },
      { key: 'hand', cards: ['c'] },
      { key: 'graveyard', cards: ['d', 'e'] },
    ];

    expect(drawFromRandomPlayerPool({}, pools, 3)).toEqual({ poolKey: 'graveyard', cardId: 'd' });
    expect(pools[0].cards).toEqual(['a', 'b']);
    expect(pools[1].cards).toEqual(['c']);
    expect(pools[2].cards).toEqual(['e']);
  });
});
