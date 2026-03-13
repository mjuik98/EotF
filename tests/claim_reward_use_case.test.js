import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  registerCardDiscovered: vi.fn(),
  registerItemFound: vi.fn(),
}));

vi.mock('../game/shared/codex/codex_record_state_use_case.js', () => ({
  registerCardDiscovered: hoisted.registerCardDiscovered,
  registerItemFound: hoisted.registerItemFound,
}));

import { claimReward } from '../game/app/reward/use_cases/claim_reward_use_case.js';

describe('claim_reward_use_case', () => {
  it('rejects energy blessings when already at cap', () => {
    const result = claimReward({
      gs: {
        player: {
          maxEnergy: 5,
          maxEnergyCap: 5,
        },
      },
      rewardType: 'blessing',
      rewardId: {
        type: 'energy',
        amount: 1,
      },
    });

    expect(result).toEqual(expect.objectContaining({
      success: false,
      reason: 'max-energy',
    }));
  });

  it('applies card, item, and upgrade rewards through a single use case surface', () => {
    const gs = {
      player: {
        deck: ['strike'],
        items: [],
      },
    };
    const data = {
      cards: {
        strike_plus: { name: 'Strike+' },
      },
      items: {
        charm: {
          id: 'charm',
          name: 'Charm',
          onAcquire: vi.fn(),
        },
      },
      upgradeMap: {
        strike: 'strike_plus',
      },
    };

    const cardResult = claimReward({
      gs,
      data,
      rewardType: 'card',
      rewardId: 'new_card',
    });
    const itemResult = claimReward({
      gs,
      data,
      rewardType: 'item',
      rewardId: 'charm',
    });
    const upgradeResult = claimReward({
      gs,
      data,
      rewardType: 'upgrade',
    });

    expect(cardResult.success).toBe(true);
    expect(gs.player.deck[0]).toBe('new_card');
    expect(itemResult.success).toBe(true);
    expect(gs.player.items).toContain('charm');
    expect(data.items.charm.onAcquire).toHaveBeenCalledWith(gs);
    expect(upgradeResult.success).toBe(true);
    expect(gs.player.deck).toContain('strike_plus');
    expect(hoisted.registerCardDiscovered).toHaveBeenCalled();
    expect(hoisted.registerItemFound).toHaveBeenCalledWith(gs, 'charm');
  });
});
