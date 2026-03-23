import { describe, expect, it } from 'vitest';
import { resolveEnemyStatusTooltipMetrics } from '../game/features/combat/presentation/browser/combat_ui.js';
import { resolvePlayerStatusTooltipMetrics } from '../game/features/combat/presentation/browser/status_effects_ui.js';

describe('status tooltip metrics', () => {
  it('separates duration and stacks for finite player status values', () => {
    const metrics = resolvePlayerStatusTooltipMetrics('weakened', { stacks: 3 });
    expect(metrics).toEqual({ duration: '3턴', stacks: '3' });
  });

  it('treats high-stack persistent buffs as infinite duration and resolves effect stack', () => {
    const metrics = resolvePlayerStatusTooltipMetrics('blessing_of_light', { stacks: 99, healPerTurn: 4 });
    expect(metrics).toEqual({ duration: '무한', stacks: '4' });
  });

  it('recognizes configured infinite buffs even when the sentinel value degraded slightly', () => {
    const metrics = resolvePlayerStatusTooltipMetrics('time_warp_plus', { stacks: 95, energyPerTurn: 2 });
    expect(metrics).toEqual({ duration: '무한', stacks: '2' });
  });

  it('resolves resonance stacks from bonus payload', () => {
    const metrics = resolvePlayerStatusTooltipMetrics('resonance', { stacks: 99, dmgBonus: 7 });
    expect(metrics).toEqual({ duration: '무한', stacks: '7' });
  });

  it('falls back to dash when player status has no numeric payload', () => {
    const metrics = resolvePlayerStatusTooltipMetrics('mystery', {});
    expect(metrics).toEqual({ duration: '-', stacks: '-' });
  });

  it('separates enemy duration and stacks from status value', () => {
    const metrics = resolveEnemyStatusTooltipMetrics('poisoned', 5);
    expect(metrics).toEqual({ duration: '5턴', stacks: '5' });
  });

  it('marks very high enemy status values as infinite duration', () => {
    const metrics = resolveEnemyStatusTooltipMetrics('doom', 120);
    expect(metrics).toEqual({ duration: '무한', stacks: '120' });
  });

  it('falls back to dash for missing enemy status value', () => {
    const metrics = resolveEnemyStatusTooltipMetrics('poisoned', null);
    expect(metrics).toEqual({ duration: '-', stacks: '-' });
  });
});
