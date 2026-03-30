import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';

import { ITEMS } from '../data/items.js';
import { CARDS } from '../data/cards.js';
import { Trigger } from '../game/data/triggers.js';
import { ItemSystem } from '../game/shared/progression/item_system.js';
import { CardCostUtils } from '../game/utils/card_cost_utils.js';
import { playCardService } from '../game/features/combat/application/play_card_service.js';
import { startPlayerTurnPolicy } from '../game/features/combat/domain/turn/start_player_turn_policy.js';
import { shopBuyPotion } from '../game/features/event/application/event_shop_actions.js';
import { moveToNodeUseCase } from '../game/features/run/application/move_to_node_use_case.js';
import { buildRewardOptionsUseCase } from '../game/features/reward/application/build_reward_options_use_case.js';
import { drawRewardCards } from '../game/features/reward/presentation/browser/reward_screen_runtime_helpers.js';
import { getResolvedEnemyAction } from '../game/features/combat/domain/enemy_intent_domain.js';
import { Actions, Reducers } from '../game/core/store/state_actions.js';

const REPO_ROOT = process.cwd();

const ITEM_TRIGGER_CONTRACTS = Object.freeze({
  combat_start: {
    publishers: [
      ['game/features/combat/application/start_combat_flow_use_case.js', "gs.triggerItems?.('combat_start');"],
    ],
  },
  combat_end: {
    publishers: [
      ['game/features/combat/application/combat_lifecycle_facade.js', "state.triggerItems?.('combat_end', {"],
      ['game/features/combat/application/death_flow_player_runtime.js', "gs.triggerItems?.('combat_end', { isBoss: false, defeated: true });"],
    ],
  },
  turn_start: {
    publishers: [
      ['game/features/combat/domain/turn/start_player_turn_policy.js', "gs.triggerItems?.('turn_start');"],
    ],
  },
  turn_draw_complete: {
    publishers: [
      ['game/features/combat/domain/turn/start_player_turn_policy.js', "gs.triggerItems?.('turn_draw_complete');"],
    ],
  },
  turn_end: {
    publishers: [
      ['game/features/combat/domain/turn/end_player_turn_policy.js', "gs.triggerItems?.('turn_end');"],
    ],
  },
  card_play: {
    publishers: [
      ['game/features/combat/application/play_card_service.js', "const cardPlayResult = gs.triggerItems?.('card_play', cardPlayPayload);"],
    ],
    consumers: [
      ['game/features/combat/application/play_card_service.js', 'cardPlayResult?.doubleCast'],
    ],
  },
  card_exhaust: {
    publishers: [
      ['game/core/state_reducers/card_reducers.js', "preventedExhaust = gs.triggerItems('card_exhaust', { cardId }) === true;"],
    ],
    consumers: [
      ['game/core/state_reducers/card_reducers.js', '=== true'],
    ],
  },
  chain_reach_5: {
    publishers: [
      ['game/features/combat/application/combat_damage_side_effects.js', "gs.triggerItems?.('chain_reach_5', { chain: nextChain });"],
    ],
  },
  deal_damage: {
    publishers: [
      ['game/features/combat/domain/damage_value_domain.js', "const itemScaled = triggerItem('deal_damage', { amount: dmg, targetIdx });"],
      ['game/features/combat/application/combat_lifecycle_facade.js', "resolveDamage: ({ amount, index }) => this.triggerItems('deal_damage', {"],
    ],
    consumers: [
      ['game/features/combat/domain/damage_value_domain.js', "typeof itemScaled === 'number'"],
      ['game/features/combat/domain/damage_value_domain.js', 'Number.isFinite(itemScaled.amount)'],
    ],
  },
  heal_amount: {
    publishers: [
      ['game/shared/player/player_resource_use_cases.js', "const scaled = this.triggerItems('heal_amount', adjusted);"],
    ],
    consumers: [
      ['game/shared/player/player_resource_use_cases.js', "typeof scaled === 'number'"],
    ],
  },
  enemy_intent: {
    publishers: [
      ['game/features/combat/domain/enemy_intent_domain.js', 'const result = gs.triggerItems(Trigger.ENEMY_INTENT, { enemy, action, turn });'],
    ],
    consumers: [
      ['game/features/combat/domain/enemy_intent_domain.js', 'result.action && typeof result.action === \'object\''],
    ],
  },
  enemy_kill: {
    publishers: [
      ['game/features/combat/application/enemy_death_state.js', "deps.triggerItems?.('enemy_kill', { enemy, idx, gold: goldGained });"],
    ],
  },
  floor_start: {
    publishers: [
      ['game/features/run/application/move_to_node_use_case.js', 'gs.triggerItems?.(floorStartTrigger, { floor: traversalState.currentFloor });'],
    ],
  },
  rest_upgrade: {
    publishers: [
      ['game/features/event/application/event_shop_actions.js', "state.triggerItems?.('rest_upgrade', {"],
    ],
  },
  shop_price_mod: {
    publishers: [
      ['game/features/run/domain/run_rules_difficulty.js', "const itemMult = gs.triggerItems('shop_price_mod', {"],
    ],
    consumers: [
      ['game/features/run/domain/run_rules_difficulty.js', "typeof itemMult === 'number'"],
      ['game/features/run/domain/run_rules_difficulty.js', 'Number.isFinite(itemMult.multiplier)'],
    ],
  },
  shop_buy: {
    publishers: [
      ['game/features/event/application/event_shop_actions.js', "state.triggerItems?.('shop_buy', payload);"],
      ['game/features/event/application/item_shop_actions.js', "gs.triggerItems('shop_buy', { item, cost });"],
    ],
  },
  item_use: {
    publishers: [
      ['game/features/event/application/event_shop_actions.js', "const itemUseResult = state.triggerItems?.('item_use', { itemId: 'potion', cost, kind: 'potion' });"],
    ],
    consumers: [
      ['game/features/event/application/event_shop_actions.js', 'itemUseResult?.costFree'],
      ['game/features/event/application/event_shop_actions.js', 'itemUseResult?.cost ?? cost'],
    ],
  },
  reward_generate: {
    publishers: [
      ['game/features/reward/presentation/browser/reward_screen_runtime_helpers.js', "const result = gs.triggerItems('reward_generate', { type: 'card', count: totalChoices });"],
      ['game/features/reward/application/build_reward_options_use_case.js', "const result = gs.triggerItems('reward_generate', { type: 'item', count: totalChoices });"],
    ],
    consumers: [
      ['game/features/reward/presentation/browser/reward_screen_runtime_helpers.js', "typeof result === 'number'"],
      ['game/features/reward/presentation/browser/reward_screen_runtime_helpers.js', 'Number.isFinite(result.count)'],
      ['game/features/reward/application/build_reward_options_use_case.js', "typeof result === 'number'"],
      ['game/features/reward/application/build_reward_options_use_case.js', 'Number.isFinite(result.count)'],
    ],
  },
  pre_death: {
    publishers: [
      ['game/features/combat/application/death_flow_player_runtime.js', "const preDeathResult = gs.triggerItems?.('pre_death');"],
    ],
    consumers: [
      ['game/features/combat/application/death_flow_player_runtime.js', 'preDeathResult === true'],
    ],
  },
  death: {
    publishers: [
      ['game/features/combat/application/death_flow_player_runtime.js', "gs.triggerItems('death');"],
    ],
  },
  before_card_cost: {
    publishers: [
      ['game/utils/card_cost_utils.js', "const delta = triggerItems('before_card_cost', {"],
    ],
    consumers: [
      ['game/utils/card_cost_utils.js', "typeof delta === 'number'"],
      ['game/utils/card_cost_utils.js', 'Number.isFinite(delta.costDelta)'],
    ],
  },
});

function readRepoFile(relativePath) {
  return readFileSync(path.join(REPO_ROOT, relativePath), 'utf8');
}

function collectItemTriggers(item) {
  if (typeof item?.passive !== 'function') return [];
  const source = item.passive.toString();
  const triggers = new Set(
    [...source.matchAll(/Trigger\.([A-Z0-9_]+)/g)]
      .map(([, triggerKey]) => Trigger[triggerKey])
      .filter(Boolean),
  );
  if (/['"]death['"]/.test(source)) {
    triggers.add('death');
  }
  return [...triggers];
}

function createLogger() {
  return {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    group: vi.fn(),
    groupEnd: vi.fn(),
  };
}

function createCostHookState(items, drawPile = ['strike']) {
  const gs = {
    currentRegion: 0,
    _activeRegionId: 0,
    player: {
      class: 'guardian',
      items,
      energy: 1,
      maxEnergy: 1,
      hand: [],
      deck: [],
      drawPile: [...drawPile],
      graveyard: [],
      exhausted: [],
      buffs: {},
      drawCount: 0,
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
    dispatch(action, payload = {}) {
      if (action === Actions.PLAYER_ENERGY) {
        this.player.energy = Math.max(0, this.player.energy + Number(payload.amount || 0));
        return { energyAfter: this.player.energy };
      }
      if (action === Actions.CARD_DRAW || action === 'card:draw') {
        return Reducers[Actions.CARD_DRAW](this, { count: payload.count });
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
      return {};
    },
    addEcho(amount) {
      this.player.echo = Number(this.player.echo || 0) + Number(amount || 0);
    },
    addSilence(amount) {
      this.player.silenceGauge += Number(amount || 0);
    },
    addLog: vi.fn(),
    markDirty: vi.fn(),
    bus: {
      emit: vi.fn(),
    },
    triggerItems(trigger, data) {
      return ItemSystem.triggerItems(this, trigger, data);
    },
  };

  startPlayerTurnPolicy(gs, {
    beginPlayerTurnState(state) {
      state.combat.playerTurn = true;
      state.player.energy = state.player.maxEnergy;
      return { isStunned: false };
    },
    drawCardsState(state, count) {
      return Reducers[Actions.CARD_DRAW](state, { count });
    },
    resolveActiveRegionId: () => 0,
  });

  return gs;
}

describe('item runtime contracts', () => {
  it('covers every trigger referenced from item definitions with a runtime contract map', () => {
    const usedTriggers = new Set(
      Object.values(ITEMS).flatMap((item) => collectItemTriggers(item)),
    );

    expect([...usedTriggers].filter((trigger) => !(trigger in ITEM_TRIGGER_CONTRACTS))).toEqual([]);
  });

  it('keeps runtime publisher and consumer anchors in sync with item trigger contracts', () => {
    Object.entries(ITEM_TRIGGER_CONTRACTS).forEach(([, contract]) => {
      for (const [filePath, pattern] of contract.publishers || []) {
        expect(readRepoFile(filePath)).toContain(pattern);
      }
      for (const [filePath, pattern] of contract.consumers || []) {
        expect(readRepoFile(filePath)).toContain(pattern);
      }
    });
  });

  it('routes dimension_key through the real reward_generate card path', () => {
    const gs = {
      player: {
        class: 'guardian',
        items: ['dimension_key'],
      },
      getRandomCard: vi.fn(() => null),
      triggerItems(trigger, data) {
        return ItemSystem.triggerItems(this, trigger, data);
      },
      meta: {},
    };
    const data = {
      cards: {
        strike: { id: 'strike', rarity: 'common' },
        defend: { id: 'defend', rarity: 'common' },
        bash: { id: 'bash', rarity: 'common' },
        guard: { id: 'guard', rarity: 'common' },
      },
      upgradeMap: {},
    };

    const rewardCards = drawRewardCards(gs, 3, ['common', 'common', 'common'], data, {
      rewardMode: 'normal',
      isElite: false,
    });

    expect(rewardCards).toHaveLength(4);
    expect(gs.getRandomCard).toHaveBeenCalledTimes(4);
  });

  it('accepts object count payloads on the real reward item generation path', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
    const gs = {
      player: {
        class: 'guardian',
        items: [],
        maxEnergy: 3,
      },
      meta: {},
      triggerItems: vi.fn(() => ({ count: 2 })),
    };
    const data = {
      classes: {},
      items: {
        relic_a: { id: 'relic_a', rarity: 'boss' },
        relic_b: { id: 'relic_b', rarity: 'boss' },
        relic_c: { id: 'relic_c', rarity: 'boss' },
      },
    };

    const result = buildRewardOptionsUseCase({
      rewardMode: 'boss',
      isElite: false,
      rewardCards: [],
      data,
      gs,
    });

    expect(gs.triggerItems).toHaveBeenCalledWith('reward_generate', { type: 'item', count: 1 });
    expect(result.items).toHaveLength(2);

    randomSpy.mockRestore();
  });

  it('chains item_use and shop_buy through the live potion purchase path', () => {
    const gs = {
      player: {
        gold: 50,
        maxHp: 40,
        hp: 20,
        items: ['ancient_battery', 'merchants_pendant'],
      },
      heal(amount) {
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + amount);
      },
      addLog: vi.fn(),
      triggerItems(trigger, data) {
        return ItemSystem.triggerItems(this, trigger, data);
      },
    };

    const result = shopBuyPotion(gs, 25);

    expect(result).toBe('❤️ 체력 30 회복. 남은 골드: 50');
    expect(gs.player.gold).toBe(50);
    expect(gs.player.maxHp).toBe(41);
    expect(gs.player.hp).toBe(41);
  });

  it('consumes hand-indexed before_card_cost modifiers through the real turn and play flow', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
    const gs = createCostHookState(['everlasting_oil']);
    const discardCard = vi.fn((cardId, exhaust, state, skipHandRemove) => Reducers[Actions.CARD_DISCARD](state, {
      cardId,
      exhaust,
      skipHandRemove,
    }));

    expect(gs.player.hand).toEqual(['strike']);
    expect(CardCostUtils.calcEffectiveCost('strike', CARDS.strike, gs.player, 0, {
      triggerItems: gs.triggerItems.bind(gs),
    })).toBe(0);

    const played = playCardService({
      cardId: 'strike',
      handIdx: 0,
      gs,
      card: {
        id: 'strike',
        name: CARDS.strike.name,
        cost: CARDS.strike.cost,
        effect: () => {},
      },
      cardCostUtils: CardCostUtils,
      classMechanics: {},
      discardCard,
      logger: createLogger(),
      audioEngine: {},
      runtimeDeps: {
        getRegionData: () => ({ id: 0 }),
        renderCombatCards: vi.fn(),
        updateChainDisplay: vi.fn(),
      },
      hudUpdateUI: { processDirtyFlags: vi.fn() },
    });

    expect(played).toBe(true);
    expect(gs.player.energy).toBe(1);
    expect(discardCard).toHaveBeenCalledTimes(1);

    randomSpy.mockRestore();
  });

  it('publishes floor_start through node traversal and applies actual floor relic effects', () => {
    const gs = {
      _nodeMoveLock: false,
      currentFloor: 0,
      currentNode: null,
      player: {
        class: 'hunter',
        hp: 10,
        maxHp: 20,
        gold: 7,
        items: ['travelers_map'],
      },
      mapNodes: [
        { id: '1-0', floor: 1, type: 'event', visited: false, accessible: true, children: [] },
      ],
      heal(amount) {
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + amount);
      },
      addGold(amount) {
        this.player.gold += amount;
      },
      triggerItems(trigger, data) {
        return ItemSystem.triggerItems(this, trigger, data);
      },
    };

    const result = moveToNodeUseCase({
      combatNodeTypes: ['combat', 'elite', 'mini_boss', 'boss'],
      floorStartTrigger: Trigger.FLOOR_START,
      gs,
      nodeRef: '1-0',
      lockNodeMovement(state, locked) {
        state._nodeMoveLock = locked;
      },
    });

    expect(result.ok).toBe(true);
    expect(gs.player.hp).toBe(13);
    expect(gs.player.gold).toBe(11);
  });

  it('applies enemy_intent modifiers through the real enemy action resolver', () => {
    const gs = {
      player: {
        items: ['magnifying_glass'],
      },
      triggerItems(trigger, data) {
        return ItemSystem.triggerItems(this, trigger, data);
      },
    };
    const enemy = {
      hp: 20,
      ai: () => ({ type: 'strike', intent: '공격 10', dmg: 10 }),
    };

    const action = getResolvedEnemyAction(gs, enemy, 1);

    expect(action.dmg).toBe(9);
    expect(action.intent).toContain('9');
  });
});
