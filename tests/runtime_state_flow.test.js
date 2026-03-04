import { afterEach, describe, expect, it, vi } from 'vitest';
import { GameAPI } from '../game/core/game_api.js';
import { GAME } from '../game/core/global_bridge.js';
import { Actions } from '../game/core/state_actions.js';
import { CardCostUtils } from '../game/utils/card_cost_utils.js';
import { DamageSystem } from '../game/combat/damage_system.js';

const ORIGINAL_GAME = {
  Data: GAME.Data,
  Modules: GAME.Modules,
  Audio: GAME.Audio,
  API: GAME.API,
  getDeps: GAME.getDeps,
};

function createPlayableState(cardId, overrides = {}) {
  const {
    player: playerOverrides = {},
    combat: combatOverrides = {},
    stats: statsOverrides = {},
    ...restOverrides
  } = overrides;

  const player = {
    class: 'swordsman',
    energy: 3,
    hand: [cardId],
    graveyard: [],
    exhausted: [],
    _nextCardDiscount: 0,
    _freeCardUses: 0,
    _traitCardDiscounts: {},
    zeroCost: false,
    costDiscount: 0,
    silenceGauge: 0,
    ...playerOverrides,
  };

  return {
    currentRegion: 0,
    player,
    combat: {
      active: true,
      playerTurn: true,
      _isPlayingCard: false,
      ...combatOverrides,
    },
    stats: {
      cardsPlayed: 0,
      ...statsOverrides,
    },
    dispatch(action, payload = {}) {
      if (action === Actions.PLAYER_ENERGY) {
        this.player.energy = Math.max(0, this.player.energy + Number(payload.amount || 0));
        return { energyAfter: this.player.energy };
      }
      return {};
    },
    addSilence(amount) {
      this.player.silenceGauge = Math.max(0, this.player.silenceGauge + Number(amount || 0));
    },
    markDirty() {},
    bus: {
      emit: vi.fn(),
    },
    ...restOverrides,
  };
}

afterEach(() => {
  GAME.Data = ORIGINAL_GAME.Data;
  GAME.Modules = ORIGINAL_GAME.Modules;
  GAME.Audio = ORIGINAL_GAME.Audio;
  GAME.API = ORIGINAL_GAME.API;
  GAME.getDeps = ORIGINAL_GAME.getDeps;
  vi.restoreAllMocks();
});

describe('runtime state flow guards', () => {
  it('rolls back transient card-play state when card effect throws', () => {
    const cardId = 'runtime_throw_card';
    const gs = createPlayableState(cardId, {
      currentRegion: 1,
      player: {
        _nextCardDiscount: 1,
        _traitCardDiscounts: { [cardId]: 1 },
      },
    });

    GAME.Data = {
      cards: {
        [cardId]: {
          id: cardId,
          name: 'Explosive Script',
          cost: 3,
          effect: () => {
            throw new Error('effect failed');
          },
        },
      },
    };
    GAME.Modules = {
      CardCostUtils,
      ClassMechanics: {},
      HudUpdateUI: { processDirtyFlags: vi.fn() },
    };
    GAME.getDeps = () => ({
      getBaseRegionIndex: () => 1,
      renderCombatCards: vi.fn(),
    });

    const discardSpy = vi.spyOn(GameAPI, 'discardCard').mockImplementation(() => {});
    const played = GameAPI.playCard(cardId, 0, gs);

    expect(played).toBe(false);
    expect(discardSpy).not.toHaveBeenCalled();
    expect(gs.player.energy).toBe(3);
    expect(gs.player.hand).toEqual([cardId]);
    expect(gs.player.silenceGauge).toBe(0);
    expect(gs.player._nextCardDiscount).toBe(1);
    expect(gs.player._traitCardDiscounts[cardId]).toBe(1);
    expect(gs.stats.cardsPlayed).toBe(0);
  });

  it('consumes free-charge state after successful card play', () => {
    const cardId = 'runtime_free_charge_card';
    const gs = createPlayableState(cardId, {
      player: {
        _freeCardUses: 1,
      },
    });

    GAME.Data = {
      cards: {
        [cardId]: {
          id: cardId,
          name: 'Free Pulse',
          cost: 2,
          effect: () => {},
        },
      },
    };
    GAME.Modules = {
      CardCostUtils,
      ClassMechanics: {},
      HudUpdateUI: { processDirtyFlags: vi.fn() },
    };
    GAME.getDeps = () => ({
      getBaseRegionIndex: () => 0,
      renderCombatCards: vi.fn(),
    });

    const discardSpy = vi.spyOn(GameAPI, 'discardCard').mockImplementation(() => {});
    const played = GameAPI.playCard(cardId, 0, gs);

    expect(played).toBe(true);
    expect(discardSpy).toHaveBeenCalledTimes(1);
    expect(gs.player._freeCardUses).toBe(0);
    expect(gs.player.hand).toEqual([]);
    expect(gs.stats.cardsPlayed).toBe(1);
  });

  it('fires card_play item trigger after successful card play', () => {
    const cardId = 'runtime_item_hook_card';
    const triggerItems = vi.fn();
    const gs = createPlayableState(cardId, { triggerItems });

    GAME.Data = {
      cards: {
        [cardId]: {
          id: cardId,
          name: 'Item Hook Probe',
          cost: 2,
          effect: () => {},
        },
      },
    };
    GAME.Modules = {
      CardCostUtils,
      ClassMechanics: {},
      HudUpdateUI: { processDirtyFlags: vi.fn() },
    };
    GAME.getDeps = () => ({
      getBaseRegionIndex: () => 0,
      renderCombatCards: vi.fn(),
    });

    const discardSpy = vi.spyOn(GameAPI, 'discardCard').mockImplementation(() => {});
    const played = GameAPI.playCard(cardId, 0, gs);

    expect(played).toBe(true);
    expect(discardSpy).toHaveBeenCalledTimes(1);
    expect(triggerItems).toHaveBeenCalledWith('card_play', { cardId, cost: 2 });
  });

  it('does not consume a next-card discount granted by the card being played', () => {
    const cardId = 'tempo_like_card';
    const gs = createPlayableState(cardId, {
      player: {
        energy: 3,
        _nextCardDiscount: 0,
      },
    });

    GAME.Data = {
      cards: {
        [cardId]: {
          id: cardId,
          name: 'Tempo Like',
          cost: 2,
          effect: (state) => {
            state.player._nextCardDiscount = (state.player._nextCardDiscount || 0) + 1;
          },
        },
      },
    };
    GAME.Modules = {
      CardCostUtils,
      ClassMechanics: {},
      HudUpdateUI: { processDirtyFlags: vi.fn() },
    };
    GAME.getDeps = () => ({
      getBaseRegionIndex: () => 0,
      renderCombatCards: vi.fn(),
    });

    const discardSpy = vi.spyOn(GameAPI, 'discardCard').mockImplementation(() => {});
    const played = GameAPI.playCard(cardId, 0, gs);

    expect(played).toBe(true);
    expect(discardSpy).toHaveBeenCalledTimes(1);
    expect(gs.player.energy).toBe(1);
    expect(gs.player._nextCardDiscount).toBe(1);
  });

  it('applies before_card_cost item hook before energy check', () => {
    const cardId = 'runtime_cost_hook_card';
    const triggerItems = vi.fn((trigger) => (trigger === 'before_card_cost' ? -1 : undefined));
    const gs = createPlayableState(cardId, {
      player: {
        energy: 1,
      },
      triggerItems,
    });

    GAME.Data = {
      cards: {
        [cardId]: {
          id: cardId,
          name: 'Coupon Check',
          cost: 2,
          effect: () => {},
        },
      },
    };
    GAME.Modules = {
      CardCostUtils,
      ClassMechanics: {},
      HudUpdateUI: { processDirtyFlags: vi.fn() },
    };
    GAME.getDeps = () => ({
      getBaseRegionIndex: () => 0,
      renderCombatCards: vi.fn(),
    });

    const discardSpy = vi.spyOn(GameAPI, 'discardCard').mockImplementation(() => {});
    const played = GameAPI.playCard(cardId, 0, gs);

    expect(played).toBe(true);
    expect(triggerItems).toHaveBeenCalledWith('before_card_cost', { cardId, cost: 2, baseCost: 2 });
    expect(discardSpy).toHaveBeenCalledTimes(1);
    expect(gs.player.energy).toBe(0);
  });

  it('passes deps through dealDamageAll to each damage call', () => {
    const deps = { marker: 'runtime-deps' };
    const host = {
      combat: {
        enemies: [{ hp: 10 }, { hp: 0 }, { hp: 12 }],
      },
      dealDamage: vi.fn(),
    };

    DamageSystem.dealDamageAll.call(host, 7, false, deps);

    expect(host.dealDamage).toHaveBeenCalledTimes(2);
    expect(host.dealDamage).toHaveBeenNthCalledWith(1, 7, 0, true, null, deps);
    expect(host.dealDamage).toHaveBeenNthCalledWith(2, 7, 2, false, null, deps);
  });
});
