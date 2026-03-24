import { describe, expect, it } from 'vitest';
import { CLASS_ID_ORDER, CLASS_METADATA } from '../data/class_metadata.js';
import {
  ENEMY_TURN_BUFF_KEYS,
  TURN_START_DEBUFF_KEYS,
  UNBREAKABLE_WALL_STACK_UNIT,
} from '../data/status_key_data.js';
import { ENEMY_TURN_BUFFS, TURN_START_DEBUFFS } from '../game/features/combat/domain/turn/turn_manager_helpers.js';
import {
  getStatusDisplayValue,
  isInfiniteStatusDuration,
  resolveStatusEffectValue,
} from '../game/utils/status_value_utils.js';

describe('data module refactor', () => {
  it('derives class order from class metadata ids', () => {
    const expected = Object.values(CLASS_METADATA)
      .slice()
      .sort((a, b) => Number(a.id) - Number(b.id))
      .map((cls) => cls.class);

    expect(CLASS_ID_ORDER).toEqual(expected);
  });

  it('keeps turn-manager status key sets sourced from data', () => {
    expect([...TURN_START_DEBUFFS]).toEqual(TURN_START_DEBUFF_KEYS);
    expect([...ENEMY_TURN_BUFFS]).toEqual(ENEMY_TURN_BUFF_KEYS);
  });

  it('resolves centralized status display rules for persistent buffs', () => {
    expect(resolveStatusEffectValue('time_warp_plus', { stacks: 95, energyPerTurn: 2 })).toBe(2);
    expect(getStatusDisplayValue('unbreakable_wall_plus', { stacks: UNBREAKABLE_WALL_STACK_UNIT * 2 })).toBe('x2');
    expect(isInfiniteStatusDuration('time_warp_plus', { stacks: 95 }, { allowDegradedSentinel: true })).toBe(true);
  });
});
