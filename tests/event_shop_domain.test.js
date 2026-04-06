import { describe, expect, it, vi } from 'vitest';

import {
  hasRestorableStagnationCards,
  pickRandomBaseCardId,
  pickRandomUpgradeableCardId,
  resolveEventShopMaxEnergyCap,
} from '../game/features/event/domain/event_shop_rule_queries.js';
import { getEventShopMaxEnergyCap } from '../game/features/event/application/event_shop_policy_queries.js';

describe('event_shop_domain', () => {
  it('chooses card candidates from base and upgradeable pools', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);

    expect(pickRandomBaseCardId({
      cards: {
        strike: { id: 'strike', upgraded: false },
        strikePlus: { id: 'strikePlus', upgraded: true },
      },
    })).toBe('strike');

    expect(pickRandomUpgradeableCardId({
      deck: ['strike', 'guard'],
    }, {
      strike: 'strikePlus',
    })).toBe('strike');

    randomSpy.mockRestore();
  });

  it('computes energy cap from pure inputs and runtime state', () => {
    expect(resolveEventShopMaxEnergyCap({ overrideCap: 7, configCap: 5 })).toBe(7);
    expect(resolveEventShopMaxEnergyCap({ overrideCap: undefined, configCap: 6 })).toBe(6);
    expect(resolveEventShopMaxEnergyCap({ overrideCap: undefined, configCap: undefined })).toBe(5);
    expect(getEventShopMaxEnergyCap({ player: { maxEnergyCap: 7 } })).toBe(7);
    expect(getEventShopMaxEnergyCap({ player: {} })).toBeGreaterThanOrEqual(5);
  });

  it('computes stagnation availability from state', () => {
    expect(hasRestorableStagnationCards({ _stagnationVault: ['a'] })).toBe(true);
    expect(hasRestorableStagnationCards({ _stagnationVault: [] })).toBe(false);
  });
});
