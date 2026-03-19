import { beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  applyPlayerGoldState: vi.fn((gs, amount) => {
    gs.player.gold = Number(gs.player.gold || 0) + amount;
    return { goldAfter: gs.player.gold, delta: amount };
  }),
  applyPlayerHealState: vi.fn((gs, amount) => {
    const hpBefore = Number(gs.player.hp || 0);
    gs.player.hp = Math.min(Number(gs.player.maxHp || 0), hpBefore + amount);
    return { healed: gs.player.hp - hpBefore, hpAfter: gs.player.hp };
  }),
  applyPlayerMaxEnergyGrowthState: vi.fn((gs, amount) => {
    gs.player.maxEnergy = Number(gs.player.maxEnergy || 0) + amount;
    gs.player.energy = gs.player.maxEnergy;
    return { maxEnergyAfter: gs.player.maxEnergy, energyAfter: gs.player.energy };
  }),
  applyPlayerMaxHpGrowthState: vi.fn((gs, amount) => {
    gs.player.maxHp = Number(gs.player.maxHp || 0) + amount;
    gs.player.hp = Math.min(gs.player.maxHp, Number(gs.player.hp || 0) + amount);
    return { maxHpAfter: gs.player.maxHp, hpAfter: gs.player.hp };
  }),
  registerCardDiscovered: vi.fn(),
  registerItemFound: vi.fn(),
}));

vi.mock('../game/shared/state/player_state_commands.js', () => ({
  applyPlayerGoldState: hoisted.applyPlayerGoldState,
  applyPlayerHealState: hoisted.applyPlayerHealState,
  applyPlayerMaxEnergyGrowthState: hoisted.applyPlayerMaxEnergyGrowthState,
  applyPlayerMaxHpGrowthState: hoisted.applyPlayerMaxHpGrowthState,
}));

vi.mock('../game/shared/codex/codex_record_state_use_case.js', () => ({
  registerCardDiscovered: hoisted.registerCardDiscovered,
  registerItemFound: hoisted.registerItemFound,
}));

describe('event/reward state command ownership', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('routes event shop player mutations through shared player state commands', async () => {
    const {
      applyShopCardPurchaseState,
      applyShopEnergyPurchaseState,
      purchaseEventShopItemState,
    } = await import('../game/features/event/state/event_state_commands.js');

    const state = {
      player: {
        deck: [],
        energy: 3,
        gold: 100,
        items: [],
        maxEnergy: 3,
      },
    };

    purchaseEventShopItemState(state, { id: 'relic' }, 20);
    applyShopCardPurchaseState(state, 'new_card', 15);
    const energyResult = applyShopEnergyPurchaseState(state, 12, 5);

    expect(hoisted.applyPlayerGoldState).toHaveBeenCalledWith(state, -20);
    expect(hoisted.applyPlayerGoldState).toHaveBeenCalledWith(state, -15);
    expect(hoisted.applyPlayerGoldState).toHaveBeenCalledWith(state, -12);
    expect(hoisted.applyPlayerMaxEnergyGrowthState).toHaveBeenCalledWith(state, 1, { maxEnergyCap: 5 });
    expect(energyResult).toEqual({ gold: 53, maxEnergy: 4, energy: 4 });
  });

  it('routes reward player mutations through shared player state commands', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const {
      applyBlessingRewardState,
      applyMiniBossBonusState,
    } = await import('../game/features/reward/state/reward_state_commands.js');

    const state = {
      currentRegion: 2,
      player: {
        energy: 3,
        gold: 5,
        hp: 20,
        items: [],
        maxEnergy: 3,
        maxHp: 40,
      },
    };
    const data = {
      items: {
        rare: { id: 'rare', rarity: 'rare' },
      },
    };

    const miniBossResult = applyMiniBossBonusState(state, data);
    expect(applyBlessingRewardState(state, { type: 'hp', amount: 5 })).toBe(true);
    expect(applyBlessingRewardState(state, { type: 'energy', amount: 1 })).toBe(true);

    expect(miniBossResult).toEqual(expect.objectContaining({ goldGain: 18, healed: 6 }));
    expect(hoisted.applyPlayerHealState).toHaveBeenCalledWith(state, 6);
    expect(hoisted.applyPlayerGoldState).toHaveBeenCalledWith(state, 18);
    expect(hoisted.applyPlayerMaxHpGrowthState).toHaveBeenCalledWith(state, 5);
    expect(hoisted.applyPlayerMaxEnergyGrowthState).toHaveBeenCalledWith(state, 1);
    vi.restoreAllMocks();
  });
});
