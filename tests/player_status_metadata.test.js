import { describe, expect, it } from 'vitest';
import { StatusEffectsUI } from '../game/features/combat/presentation/browser/status_effects_ui.js';
import { INFINITE_DURATION_STATUS_KEYS } from '../data/status_key_data.js';

const PLAYER_STATUS_KEYS_IN_USE = [
  'resonance',
  'acceleration',
  'time_warp',
  'time_warp_plus',
  'soul_armor',
  'vanish',
  'immune',
  'shadow_atk',
  'mirror',
  'focus',
  'critical_turn',
  'lifesteal',
  'spike_shield',
  'echo_on_hit',
  'blessing_of_light',
  'blessing_of_light_plus',
  'protection',
  'divine_aura',
  'berserk_mode',
  'berserk_mode_plus',
  'endure_buff',
  'unbreakable_wall',
  'unbreakable_wall_plus',
  'echo_berserk',
  'dodge',
  'thorns',
  'stunImmune',
  'weakened',
  'poisoned',
  'stunned',
  'cursed',
  'vulnerable',
];

describe('player status metadata coverage', () => {
  it('has label, icon and tooltip description for all in-use player statuses', () => {
    const statusMap = StatusEffectsUI.getStatusMap();

    PLAYER_STATUS_KEYS_IN_USE.forEach((key) => {
      const meta = statusMap[key];
      expect(meta, `${key} status meta`).toBeTruthy();
      expect(meta.name, `${key} name`).toBeTruthy();
      expect(meta.icon, `${key} icon`).toBeTruthy();
      expect(meta.desc, `${key} desc`).toBeTruthy();
      expect(meta.name.includes('_'), `${key} should not expose raw key`).toBe(false);
    });
  });

  it('describes lifesteal as healing from dealt damage', () => {
    const statusMap = StatusEffectsUI.getStatusMap();
    expect(statusMap.lifesteal.desc).toContain('회복');
  });

  it('tracks expanded infinite-duration combat buffs', () => {
    expect(INFINITE_DURATION_STATUS_KEYS).toEqual(expect.arrayContaining([
      'acceleration',
      'time_warp_plus',
      'blessing_of_light_plus',
      'berserk_mode_plus',
      'unbreakable_wall_plus',
      'mirror',
      'divine_aura',
      'thorns',
      'immune',
      'soul_armor',
      'spike_shield',
      'stunImmune',
      'echo_on_hit',
      'echo_berserk',
    ]));
  });
});
