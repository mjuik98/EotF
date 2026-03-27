import { describe, expect, it, vi } from 'vitest';

import { applyResolvedEnemyDamageEffects } from '../game/features/combat/application/damage_system_effects.js';

describe('damage_system_effects', () => {
  it('runs the resolved enemy damage callbacks and follow-up hooks in order', () => {
    const host = {
      markDirty: vi.fn(),
      onEnemyDeath: vi.fn(),
    };
    const events = [];

    const actualDamage = applyResolvedEnemyDamageEffects(host, {
      enemy: { name: 'Shade' },
      resolvedTargetIdx: 0,
      result: { actualDamage: 8, totalDamage: 10, isDead: true },
      damage: 10,
      noChain: false,
      deps: {
        onDealDamageResolved: ({ damage }) => events.push(`resolved:${damage}`),
        updateStatusDisplay: () => events.push('status'),
      },
      win: { id: 'window' },
      getBuff: () => null,
      source: null,
      base: { hasCritBuff: false },
      helpers: {
        advancePlayerChain: () => events.push('chain'),
        runDealDamageClassHook: (_host, damage, targetIdx, deps, win) => {
          events.push(`class:${damage}:${targetIdx}:${win.id}`);
          expect(typeof deps.updateStatusDisplay).toBe('function');
        },
        logDealDamageResult: () => events.push('log'),
        applyLifesteal: () => events.push('lifesteal'),
      },
    });

    expect(actualDamage).toBe(8);
    expect(events).toEqual([
      'chain',
      'resolved:10',
      'class:10:0:window',
      'log',
      'lifesteal',
      'status',
    ]);
    expect(host.markDirty).toHaveBeenCalledWith('enemies');
    expect(host.onEnemyDeath).toHaveBeenCalledWith({ name: 'Shade' }, 0, expect.any(Object));
  });
});
