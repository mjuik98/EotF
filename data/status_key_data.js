'use strict';

export const DEBUFF_STATUS_KEYS = Object.freeze([
  'weakened',
  'poisoned',
  'burning',
  'cursed',
  'marked',
  'branded',
  'draw_block',
  'doom',
]);

export const PLAYER_STATUS_FALLBACK_BUFF_KEYS = Object.freeze([
  'resonance',
  'acceleration',
  'time_warp',
  'time_warp_plus',
  'soul_armor',
  'vanish',
  'immune',
  'shadow_atk',
  'dodge',
  'focus',
  'critical_turn',
  'lifesteal',
  'spike_shield',
  'mirror',
  'echo_on_hit',
  'blessing_of_light',
  'blessing_of_light_plus',
  'protection',
  'divine_aura',
  'berserk_mode',
  'berserk_mode_plus',
  'endure_buff',
  'echo_berserk',
  'unbreakable_wall',
  'unbreakable_wall_plus',
  'thorns',
  'stunImmune',
]);

export const INFINITE_DURATION_STATUS_KEYS = Object.freeze([
  'resonance',
  'acceleration',
  'echo_on_hit',
  'echo_berserk',
  'time_warp',
  'time_warp_plus',
  'blessing_of_light',
  'blessing_of_light_plus',
  'berserk_mode',
  'berserk_mode_plus',
  'unbreakable_wall',
  'unbreakable_wall_plus',
  'mirror',
  'divine_aura',
  'thorns',
  'soul_armor',
  'immune',
  'spike_shield',
  'stunImmune',
]);

export const INFINITE_STACK_BUFF_IDS = Object.freeze([
  'resonance',
  'time_warp',
  'time_warp_plus',
  'blessing_of_light',
  'blessing_of_light_plus',
  'berserk_mode',
  'berserk_mode_plus',
  'unbreakable_wall',
  'unbreakable_wall_plus',
]);

export const TURN_START_DEBUFF_KEYS = Object.freeze([
  'poisoned',
  'burning',
  'slowed',
  'confusion',
]);

export const ENEMY_TURN_BUFF_KEYS = Object.freeze([
  'mirror',
  'spike_shield',
  'immune',
  'dodge',
  'focus',
  'focus_plus',
  'vanish',
  'critical_turn',
]);

export const UNBREAKABLE_WALL_STACK_UNIT = 99;

export const STATUS_EFFECT_VALUE_FIELDS = Object.freeze({
  blessing_of_light: Object.freeze(['healPerTurn']),
  time_warp: Object.freeze(['energyPerTurn', 'nextEnergy']),
  berserk_mode: Object.freeze(['atkGrowth']),
  echo_berserk: Object.freeze(['atkGrowth']),
  soul_armor: Object.freeze(['echoRegen']),
  divine_grace: Object.freeze(['shieldBonus']),
  divine_aura: Object.freeze(['shieldBonus']),
  resonance: Object.freeze(['dmgBonus']),
  acceleration: Object.freeze(['dmgBonus']),
  lifesteal: Object.freeze(['percent']),
});

export const STATUS_EFFECT_VALUE_FALLBACK_FIELDS = Object.freeze([
  'amount',
  'value',
]);
