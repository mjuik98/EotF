import { afterEach, describe, expect, it, vi } from 'vitest';
import { CardMethods } from '../game/features/combat/public.js';
import { GAME } from '../game/core/global_bridge.js';

const ORIGINAL_GAME = {
  Data: GAME.Data,
  Modules: GAME.Modules,
  Audio: GAME.Audio,
  getCombatDeps: GAME.getCombatDeps,
  getRunDeps: GAME.getRunDeps,
};

function createPlayableState(cardId) {
  return {
    currentRegion: 0,
    player: {
      class: 'swordsman',
      energy: 3,
      hand: [cardId],
      graveyard: [],
      exhausted: [],
      _nextCardDiscount: 0,
      _freeCardUses: 0,
      _traitCardDiscounts: {},
    },
    combat: {
      active: true,
      playerTurn: true,
      _isPlayingCard: false,
    },
    stats: {
      cardsPlayed: 0,
    },
    dispatch: vi.fn((action, payload = {}) => {
      if (action === 'card:draw') {
        return { attempts: Number(payload.count || 0) };
      }
      return {};
    }),
    markDirty: vi.fn(),
    addSilence: vi.fn(),
    triggerItems: vi.fn(),
    bus: {
      emit: vi.fn(),
    },
  };
}

afterEach(() => {
  GAME.Data = ORIGINAL_GAME.Data;
  GAME.Modules = ORIGINAL_GAME.Modules;
  GAME.Audio = ORIGINAL_GAME.Audio;
  GAME.getCombatDeps = ORIGINAL_GAME.getCombatDeps;
  GAME.getRunDeps = ORIGINAL_GAME.getRunDeps;
  vi.restoreAllMocks();
});

describe('CardMethods', () => {
  it('drawCards uses run runtime deps without GameAPI module', () => {
    const gs = {
      combat: { active: false },
      dispatch: vi.fn(() => ({ attempts: 2 })),
    };

    GAME.Modules = {};
    GAME.getRunDeps = () => ({ getRegionData: vi.fn() });

    const result = CardMethods.drawCards.call(gs, 2, { skipRift: true });

    expect(gs.dispatch).toHaveBeenCalledWith('card:draw', { count: 2 });
    expect(result).toEqual({ attempts: 2 });
  });

  it('playCard works through shared card action path without GameAPI module', () => {
    const cardId = 'card_methods_probe';
    const gs = createPlayableState(cardId);
    gs.dispatch = vi.fn((action, payload = {}) => {
      if (action === 'player:energy') {
        gs.player.energy = Math.max(0, gs.player.energy + Number(payload.amount || 0));
        return { energyAfter: gs.player.energy };
      }
      if (action === 'card:discard') {
        gs.player.graveyard.push(payload.cardId);
        return {};
      }
      return {};
    });

    GAME.Data = {
      cards: {
        [cardId]: {
          id: cardId,
          name: 'Probe Strike',
          cost: 1,
          effect: vi.fn(),
        },
      },
    };
    GAME.Modules = {
      CardCostUtils: {
        calcEffectiveCost: vi.fn(() => 1),
        consumeTraitDiscount: vi.fn(),
        consumeFreeCharge: vi.fn(),
      },
      ClassMechanics: {},
      HudUpdateUI: { processDirtyFlags: vi.fn() },
    };
    GAME.getCombatDeps = () => ({
      getBaseRegionIndex: () => 0,
      renderCombatCards: vi.fn(),
    });

    const played = CardMethods.playCard.call(gs, cardId, 0);

    expect(played).toBe(true);
    expect(gs.player.energy).toBe(2);
    expect(gs.player.hand).toEqual([]);
    expect(gs.player.graveyard).toEqual([cardId]);
    expect(gs.stats.cardsPlayed).toBe(1);
  });
});
