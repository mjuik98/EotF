import { describe, expect, it } from 'vitest';

import {
  getEnemyStatusMeta,
  getEnemyStatusName,
  getPlayerStatusMeta,
  getStatusDisplayName,
  getStatusTooltipSemanticMeta,
  normalizeStatusKey,
} from '../data/status_effects_data.js';

describe('status_effects_data accessors', () => {
  it('normalizes plus-suffixed keys for shared lookups', () => {
    expect(normalizeStatusKey('time_warp_plus')).toBe('time_warp');
    expect(normalizeStatusKey('draw_block')).toBe('draw_block');
  });

  it('resolves player status metadata from the shared source', () => {
    expect(getPlayerStatusMeta('resonance')?.name).toBeTruthy();
    expect(getPlayerStatusMeta('time_warp_plus')?.name).toBeTruthy();
  });

  it('resolves enemy labels and tooltip metadata from the shared source', () => {
    expect(getEnemyStatusName('draw_block')).toBeTruthy();
    expect(getEnemyStatusMeta('draw_block')?.icon).toBeTruthy();
    expect(getEnemyStatusMeta('draw_block')?.desc).toBeTruthy();
  });

  it('uses the same display-name resolution path for player, enemy, and override-only keys', () => {
    expect(getStatusDisplayName('resonance')).toBe(getPlayerStatusMeta('resonance')?.name);
    expect(getStatusDisplayName('draw_block')).toBe(getEnemyStatusName('draw_block'));
    expect(getStatusDisplayName('silence')).toBeTruthy();
  });

  it('resolves shared tooltip semantics from the centralized status data', () => {
    expect(getStatusTooltipSemanticMeta('focus')?.nameEn).toBe('Focus');
    expect(getStatusTooltipSemanticMeta('time_warp_plus')?.typeLabel).toBeTruthy();
  });
});
