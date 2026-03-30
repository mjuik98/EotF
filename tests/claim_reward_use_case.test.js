import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  registerCardDiscovered: vi.fn(),
  registerItemFound: vi.fn(),
}));

vi.mock('../game/shared/codex/codex_record_state_use_case.js', () => ({
  registerCardDiscovered: hoisted.registerCardDiscovered,
  registerItemFound: hoisted.registerItemFound,
}));

import { claimReward } from '../game/features/reward/public.js';

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
    expect(upgradeResult.notification.payload.name).toBe('강화 완료: Strike+');
    expect(upgradeResult.notification.payload.desc).toBe('무작위 카드 1장이 강화되었습니다.');
    expect(hoisted.registerCardDiscovered).toHaveBeenCalled();
    expect(hoisted.registerItemFound).toHaveBeenCalledWith(gs, 'charm');
  });

  it('localizes mini-boss reward logs', async () => {
    const { ensureMiniBossBonus } = await import('../game/features/reward/public.js');
    const addLog = vi.fn();
    const showItemToast = vi.fn();
    const playItemGet = vi.fn();
    const data = {
      items: {
        relic_rare: {
          id: 'relic_rare',
          name: '희귀 유물',
          icon: '@',
          rarity: 'rare',
        },
      },
    };
    const gs = {
      currentRegion: 0,
      player: {
        maxHp: 20,
        hp: 10,
        items: [],
      },
      addLog,
    };

    const originalRandom = Math.random;
    Math.random = vi.fn(() => 0);

    try {
      const reward = ensureMiniBossBonus(gs, data, { showItemToast, playItemGet });

      expect(reward?.id).toBe('relic_rare');
      expect(addLog).toHaveBeenCalledWith('중간 보스 보상: 골드 +12, 체력 +3', 'system');
      expect(addLog).toHaveBeenCalledWith('중간 보스 유물: @ 희귀 유물', 'system');
    } finally {
      Math.random = originalRandom;
    }
  });

  it('routes mini-boss bonus healing through the live heal hook', async () => {
    const { ensureMiniBossBonus } = await import('../game/features/reward/public.js');
    const { ItemSystem } = await import('../game/shared/progression/item_system.js');
    const showItemToast = vi.fn();
    const playItemGet = vi.fn();
    const data = {
      items: {
        relic_rare: {
          id: 'relic_rare',
          name: '희귀 유물',
          icon: '@',
          rarity: 'rare',
        },
      },
    };
    const gs = {
      currentRegion: 0,
      player: {
        maxHp: 20,
        hp: 10,
        items: ['titan_heart'],
      },
      addLog: vi.fn(),
      markDirty: vi.fn(),
      heal(amount) {
        let adjusted = amount;
        const scaled = this.triggerItems('heal_amount', adjusted);
        if (typeof scaled === 'number' && Number.isFinite(scaled)) {
          adjusted = Math.max(0, Math.floor(scaled));
        }
        const healed = Math.min(adjusted, this.player.maxHp - this.player.hp);
        this.player.hp += healed;
        return { healed, hpAfter: this.player.hp };
      },
      triggerItems(trigger, payload) {
        return ItemSystem.triggerItems(this, trigger, payload);
      },
    };

    const originalRandom = Math.random;
    Math.random = vi.fn(() => 0);

    try {
      ensureMiniBossBonus(gs, data, { showItemToast, playItemGet });

      expect(gs.player.hp).toBe(10);
      expect(gs.addLog).toHaveBeenCalledWith('중간 보스 보상: 골드 +12, 체력 +0', 'system');
    } finally {
      Math.random = originalRandom;
    }
  });
});
