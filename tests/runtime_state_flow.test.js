import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GameAPI } from '../game/core/game_api.js';
import { GAME } from '../game/core/global_bridge.js';
import { ClassMechanics } from '../game/shared/class/class_mechanic_rules.js';
import { Actions } from '../game/core/state_actions.js';
import { CardCostUtils } from '../game/utils/card_cost_utils.js';
import { DamageSystem } from '../game/features/combat/public.js';
import { silenceConsole } from './helpers/silence_console.js';

const ORIGINAL_GAME = {
  Data: GAME.Data,
  Modules: GAME.Modules,
  Audio: GAME.Audio,
  API: GAME.API,
  getCombatDeps: GAME.getCombatDeps,
  getDeps: GAME.getDeps,
  getRunDeps: GAME.getRunDeps,
};

beforeEach(() => {
  silenceConsole(['error', 'group', 'groupCollapsed', 'groupEnd']);
});

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
    addEcho(amount) {
      this.player.echo = Math.max(0, Number(this.player.echo || 0) + Number(amount || 0));
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
  GAME.getCombatDeps = ORIGINAL_GAME.getCombatDeps;
  GAME.getDeps = ORIGINAL_GAME.getDeps;
  GAME.getRunDeps = ORIGINAL_GAME.getRunDeps;
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
    GAME.getCombatDeps = () => ({
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
    GAME.getCombatDeps = () => ({
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
    GAME.getCombatDeps = () => ({
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
    GAME.getCombatDeps = () => ({
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
    GAME.getCombatDeps = () => ({
      getBaseRegionIndex: () => 0,
      renderCombatCards: vi.fn(),
    });

    const discardSpy = vi.spyOn(GameAPI, 'discardCard').mockImplementation(() => {});
    const played = GameAPI.playCard(cardId, 0, gs);

    expect(played).toBe(true);
    expect(triggerItems).toHaveBeenCalledWith('before_card_cost', expect.objectContaining({
      cardId,
      handIndex: 0,
      cost: 2,
      baseCost: 2,
    }));
    expect(discardSpy).toHaveBeenCalledTimes(1);
    expect(gs.player.energy).toBe(0);
  });

  it('passes deps through dealDamageAll to each damage call', () => {
    const deps = { marker: 'runtime-deps' };
    const host = {
      player: {
        class: 'swordsman',
        echoChain: 0,
        buffs: {},
      },
      combat: {
        enemies: [
          { name: 'A', hp: 10, shield: 0, statusEffects: {} },
          { name: 'Down', hp: 0, shield: 0, statusEffects: {} },
          { name: 'B', hp: 12, shield: 0, statusEffects: {} },
        ],
      },
      addEcho: vi.fn(),
      addLog: vi.fn(),
      markDirty: vi.fn(),
      triggerItems: vi.fn(),
      dispatch: vi.fn((action, payload) => {
        if (action !== Actions.ENEMY_DAMAGE) return {};
        const enemy = host.combat.enemies[payload.targetIdx];
        enemy.hp = Math.max(0, enemy.hp - payload.amount);
        return {
          actualDamage: payload.amount,
          totalDamage: payload.amount,
          shieldAbsorbed: 0,
          hpAfter: enemy.hp,
          isDead: enemy.hp <= 0,
          targetIdx: payload.targetIdx,
        };
      }),
    };
    const updateStatusDisplay = vi.fn();

    DamageSystem.dealDamageAll.call(host, 7, false, { ...deps, updateStatusDisplay });

    expect(host.dispatch).toHaveBeenCalledTimes(2);
    expect(host.dispatch).toHaveBeenNthCalledWith(1, Actions.ENEMY_DAMAGE, expect.objectContaining({
      amount: 7,
      targetIdx: 0,
    }));
    expect(host.dispatch).toHaveBeenNthCalledWith(2, Actions.ENEMY_DAMAGE, expect.objectContaining({
      amount: 7,
      targetIdx: 2,
    }));
    expect(updateStatusDisplay).toHaveBeenCalledTimes(2);
  });

  it('applies swordsman resonance damage growth across successive real card plays', () => {
    const cardId = 'runtime_swordsman_strike';
    const gs = createPlayableState(cardId, {
      player: {
        hand: [cardId, cardId],
        buffs: {},
      },
      combat: {
        enemies: [{
          name: 'Training Dummy',
          hp: 30,
          shield: 0,
          statusEffects: {},
          ai: () => ({ dmg: 0 }),
        }],
      },
      dispatch(action, payload = {}) {
        if (action === Actions.PLAYER_ENERGY) {
          this.player.energy = Math.max(0, this.player.energy + Number(payload.amount || 0));
          return { energyAfter: this.player.energy };
        }
        if (action === Actions.PLAYER_BUFF) {
          if (!this.player.buffs) this.player.buffs = {};
          const current = this.player.buffs[payload.id] || { stacks: 0 };
          const nextBonus = payload.data?.dmgBonus !== undefined && Number(payload.stacks || 0) === 0
            ? Number(current.dmgBonus || 0) + Number(payload.data.dmgBonus || 0)
            : payload.data?.dmgBonus;
          this.player.buffs[payload.id] = {
            ...current,
            ...payload.data,
            ...(nextBonus === undefined ? {} : { dmgBonus: nextBonus }),
            stacks: Math.max(Number(current.stacks || 0), Number(payload.stacks || 0)),
          };
          return this.player.buffs[payload.id];
        }
        if (action === Actions.ENEMY_DAMAGE) {
          const enemy = this.combat.enemies[payload.targetIdx];
          enemy.hp = Math.max(0, enemy.hp - Number(payload.amount || 0));
          return {
            actualDamage: Number(payload.amount || 0),
            totalDamage: Number(payload.amount || 0),
            shieldAbsorbed: 0,
            hpAfter: enemy.hp,
            isDead: enemy.hp <= 0,
            targetIdx: payload.targetIdx,
          };
        }
        return {};
      },
    });

    GAME.Data = {
      cards: {
        [cardId]: {
          id: cardId,
          name: 'Resonance Slash',
          cost: 1,
          effect: (state) => {
            state.dealDamage(9, 0, true);
          },
        },
      },
    };
    GAME.Modules = {
      CardCostUtils,
      ClassMechanics,
      HudUpdateUI: { processDirtyFlags: vi.fn() },
    };
    GAME.getCombatDeps = () => ({
      ClassMechanics,
      getBaseRegionIndex: () => 0,
      renderCombatCards: vi.fn(),
    });

    const discardSpy = vi.spyOn(GameAPI, 'discardCard').mockImplementation(() => {});
    const playedFirst = GameAPI.playCard(cardId, 0, gs);
    const hpAfterFirst = gs.combat.enemies[0].hp;
    const playedSecond = GameAPI.playCard(cardId, 0, gs);
    const hpAfterSecond = gs.combat.enemies[0].hp;

    expect(playedFirst).toBe(true);
    expect(playedSecond).toBe(true);
    expect(discardSpy).toHaveBeenCalledTimes(2);
    expect(30 - hpAfterFirst).toBe(9);
    expect(hpAfterFirst - hpAfterSecond).toBe(10);
    expect(gs.player.buffs.resonance?.dmgBonus).toBe(2);
  });
});
