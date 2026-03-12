import { describe, expect, it, vi } from 'vitest';

import {
  getEventShopMaxEnergyCap,
  hasRestorableStagnationCards,
  pickRandomBaseCardId,
  pickRandomUpgradeableCardId,
} from '../game/features/event/domain/event_shop_domain.js';

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

  it('computes energy cap and stagnation availability from state', () => {
    expect(getEventShopMaxEnergyCap({ player: { maxEnergyCap: 7 } })).toBe(7);
    expect(getEventShopMaxEnergyCap({ player: {} })).toBeGreaterThanOrEqual(5);
    expect(hasRestorableStagnationCards({ _stagnationVault: ['a'] })).toBe(true);
    expect(hasRestorableStagnationCards({ _stagnationVault: [] })).toBe(false);
  });
});
