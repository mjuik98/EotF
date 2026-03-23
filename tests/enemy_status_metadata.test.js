import { describe, expect, it } from 'vitest';
import { ENEMY_STATUS_DESC, ENEMY_STATUS_KR } from '../game/features/combat/presentation/browser/combat_ui.js';
import { LogUtils } from '../game/utils/log_utils.js';

const ENEMY_STATUS_KEYS_IN_USE = [
  'abyss_regen',
  'branded',
  'burning',
  'dodge',
  'doom',
  'draw_block',
  'immune',
  'marked',
  'poisoned',
  'stunned',
  'thorns',
  'weakened',
];

describe('enemy status metadata coverage', () => {
  it('has Korean labels and tooltip descriptions for all in-use enemy statuses', () => {
    ENEMY_STATUS_KEYS_IN_USE.forEach((key) => {
      const kr = ENEMY_STATUS_KR[key];
      const meta = ENEMY_STATUS_DESC[key];

      expect(kr, `${key} Korean label`).toBeTruthy();
      expect(meta, `${key} tooltip meta`).toBeTruthy();
      expect(meta.icon, `${key} icon`).toBeTruthy();
      expect(meta.desc, `${key} desc`).toBeTruthy();
      expect(kr.includes('_'), `${key} should not expose raw key`).toBe(false);
    });
  });

  it('localizes draw_block in combat logs', () => {
    expect(LogUtils.formatStatus('적', 'draw_block', 1)).toContain('드로우 간섭');
  });
});
