import { describe, expect, it, vi } from 'vitest';
import { playCardService } from '../game/app/combat/play_card_service.js';
import { CardCostUtils } from '../game/utils/card_cost_utils.js';

function createLogger() {
  return {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    group: vi.fn(),
    groupEnd: vi.fn(),
  };
}

function createState(cardId) {
  return {
    currentRegion: 1,
    player: {
      class: 'guardian',
      energy: 3,
      hand: [cardId],
      graveyard: [],
      exhausted: [],
      _nextCardDiscount: 0,
      _freeCardUses: 0,
      _traitCardDiscounts: {},
      costDiscount: 0,
      zeroCost: false,
      echoChain: 0,
      silenceGauge: 0,
    },
    combat: {
      active: true,
      playerTurn: true,
      _isPlayingCard: false,
    },
    stats: {
      cardsPlayed: 0,
    },
    dispatch(action, payload) {
      if (action === 'player:energy') {
        this.player.energy = Math.max(0, this.player.energy + Number(payload.amount || 0));
        return { energyAfter: this.player.energy };
      }
      return {};
    },
    addSilence(amount) {
      this.player.silenceGauge += amount;
    },
    markDirty: vi.fn(),
    triggerItems: vi.fn(),
    bus: {
      emit: vi.fn(),
    },
  };
}

describe('play_card_service', () => {
  it('plays a card successfully and forwards post-play hooks', () => {
    const cardId = 'service_card';
    const gs = createState(cardId);
    const logger = createLogger();
    const discardCard = vi.fn();
    const classHook = vi.fn();
    const processDirtyFlags = vi.fn();

    const result = playCardService({
      cardId,
      handIdx: 0,
      gs,
      card: { id: cardId, name: 'Service Card', cost: 2, effect: vi.fn() },
      cardCostUtils: CardCostUtils,
      classMechanics: { guardian: { onPlayCard: classHook } },
      discardCard,
      logger,
      audioEngine: {},
      runtimeDeps: {
        getRegionData: () => ({ id: 1 }),
        renderCombatCards: vi.fn(),
      },
      hudUpdateUI: { processDirtyFlags },
    });

    expect(result).toBe(true);
    expect(discardCard).toHaveBeenCalledWith(cardId, undefined, gs, true);
    expect(classHook).toHaveBeenCalledWith(gs, { cardId });
    expect(gs.player.silenceGauge).toBe(1);
    expect(gs.stats.cardsPlayed).toBe(1);
    expect(processDirtyFlags).toHaveBeenCalled();
    expect(gs.combat._isPlayingCard).toBe(false);
  });

  it('rolls back energy and hand when the card effect throws', () => {
    const cardId = 'service_fail_card';
    const gs = createState(cardId);
    const logger = createLogger();

    const result = playCardService({
      cardId,
      handIdx: 0,
      gs,
      card: { id: cardId, name: 'Fail Card', cost: 2, effect: () => { throw new Error('boom'); } },
      cardCostUtils: CardCostUtils,
      classMechanics: {},
      discardCard: vi.fn(),
      logger,
      audioEngine: {},
      runtimeDeps: {},
      hudUpdateUI: { processDirtyFlags: vi.fn() },
    });

    expect(result).toBe(false);
    expect(gs.player.energy).toBe(3);
    expect(gs.player.hand).toEqual([cardId]);
    expect(gs.stats.cardsPlayed).toBe(0);
    expect(gs.combat._isPlayingCard).toBe(false);
    expect(logger.error).toHaveBeenCalled();
  });
});
