import { describe, expect, it, vi } from 'vitest';
import { playCardService } from '../game/app/combat/play_card_service.js';
import { Actions } from '../game/core/store/state_actions.js';
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
      deck: ['drawn_card'],
      graveyard: [],
      exhausted: [],
      _nextCardDiscount: 0,
      _freeCardUses: 0,
      _traitCardDiscounts: {},
      costDiscount: 0,
      zeroCost: false,
      echo: 0,
      echoChain: 0,
      silenceGauge: 0,
    },
    combat: {
      active: true,
      playerTurn: true,
      _isPlayingCard: false,
      enemies: [{
        name: 'Training Dummy',
        hp: 20,
        shield: 0,
        statusEffects: {},
        ai: () => ({ dmg: 0 }),
      }],
    },
    stats: {
      cardsPlayed: 0,
      damageDealt: 0,
    },
    dispatch(action, payload) {
      if (action === Actions.PLAYER_ENERGY) {
        this.player.energy = Math.max(0, this.player.energy + Number(payload.amount || 0));
        return { energyAfter: this.player.energy };
      }
      if (action === Actions.CARD_DRAW) {
        const attempts = Math.max(0, Number(payload.count || 0));
        for (let i = 0; i < attempts; i += 1) {
          const nextCard = this.player.deck.shift();
          if (!nextCard) break;
          this.player.hand.push(nextCard);
        }
        return { attempts };
      }
      if (action === Actions.ENEMY_DAMAGE) {
        const enemy = this.combat.enemies[payload.targetIdx];
        const amount = Number(payload.amount || 0);
        enemy.hp = Math.max(0, enemy.hp - amount);
        this.stats.damageDealt += amount;
        return {
          actualDamage: amount,
          totalDamage: amount,
          shieldAbsorbed: 0,
          hpAfter: enemy.hp,
          isDead: enemy.hp <= 0,
          targetIdx: payload.targetIdx,
        };
      }
      if (action === Actions.ENEMY_STATUS) {
        const enemy = this.combat.enemies[payload.targetIdx];
        enemy.statusEffects[payload.status] = Number(payload.duration || 0);
        return {
          duration: enemy.statusEffects[payload.status],
          targetIdx: payload.targetIdx,
        };
      }
      return {};
    },
    addSilence(amount) {
      this.player.silenceGauge += amount;
    },
    addEcho(amount) {
      this.player.echo += Number(amount || 0);
    },
    addLog: vi.fn(),
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

  it('executes card effects through a compat runtime facade without mutating canonical GS helpers', () => {
    const cardId = 'runtime_facade_card';
    const gs = createState(cardId);
    const logger = createLogger();
    const observed = {};

    const result = playCardService({
      cardId,
      handIdx: 0,
      gs,
      card: {
        id: cardId,
        name: 'Runtime Facade Card',
        cost: 1,
        effect: (runtimeGs) => {
          observed.sameReference = runtimeGs === gs;
          observed.dealDamageType = typeof runtimeGs.dealDamage;
          observed.drawCardsType = typeof runtimeGs.drawCards;

          if (typeof runtimeGs.dealDamage === 'function') {
            runtimeGs.dealDamage(4, 0);
          }
          if (typeof runtimeGs.drawCards === 'function') {
            runtimeGs.drawCards(1);
          }
        },
      },
      cardCostUtils: CardCostUtils,
      classMechanics: {},
      discardCard: vi.fn(),
      logger,
      audioEngine: {},
      runtimeDeps: {
        getRegionData: () => ({ id: 1 }),
        renderCombatCards: vi.fn(),
        updateChainDisplay: vi.fn(),
      },
      hudUpdateUI: { processDirtyFlags: vi.fn() },
    });

    expect(result).toBe(true);
    expect(observed.sameReference).toBe(false);
    expect(observed.dealDamageType).toBe('function');
    expect(observed.drawCardsType).toBe('function');
    expect(logger.error).not.toHaveBeenCalled();
    expect(gs.dealDamage).toBeUndefined();
    expect(gs.drawCards).toBeUndefined();
    expect(gs.combat.enemies[0].hp).toBe(16);
    expect(gs.player.hand).toEqual(['drawn_card']);
    expect(gs.stats.damageDealt).toBe(4);
  });

  it('applies enemy statuses through the runtime facade using the default target slot', () => {
    const cardId = 'runtime_status_card';
    const gs = createState(cardId);
    const logger = createLogger();

    const result = playCardService({
      cardId,
      handIdx: 0,
      gs,
      card: {
        id: cardId,
        name: 'Heavy Blow Probe',
        cost: 1,
        effect: (runtimeGs) => {
          runtimeGs.applyEnemyStatus('stunned', 1);
        },
      },
      cardCostUtils: CardCostUtils,
      classMechanics: {},
      discardCard: vi.fn(),
      logger,
      audioEngine: {},
      runtimeDeps: {
        renderCombatCards: vi.fn(),
      },
      hudUpdateUI: { processDirtyFlags: vi.fn() },
    });

    expect(result).toBe(true);
    expect(gs.combat.enemies[0].statusEffects.stunned).toBe(1);
    expect(logger.error).not.toHaveBeenCalled();
  });
});
