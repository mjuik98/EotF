import { DATA } from '../../../data/game_data.js';
import { InscriptionSystem } from './inscription_system.js';
import { SetBonusSystem } from './set_bonus_system.js';
import { CardGameStateRuntimeCompatMethods } from '../state/compat/game_state_card_runtime_compat_methods.js';
import { createLegacyGameStateRuntimeFacade } from '../state/game_state_runtime_compat.js';

const TRIGGER_ALIASES = Object.freeze({
  COMBAT_START: 'combat_start',
  COMBAT_END: 'combat_end',
  TURN_START: 'turn_start',
  TURN_DRAW_COMPLETE: 'turn_draw_complete',
  TURN_END: 'turn_end',
  CARD_PLAY: 'card_play',
  CARD_DRAW: 'card_draw',
  CARD_DISCARD: 'card_discard',
  CARD_EXHAUST: 'card_exhaust',
  DEAL_DAMAGE: 'deal_damage',
  DAMAGE_TAKEN: 'damage_taken',
  ENEMY_KILL: 'enemy_kill',
  FLOOR_START: 'floor_start',
  BOSS_START: 'boss_start',
  ECHO_SKILL: 'echo_skill',
  CHAIN_DMG: 'chain_dmg',
  RESONANCE_BURST: 'resonance_burst',
  ENERGY_GAIN: 'energy_gain',
  PRE_DEATH: 'pre_death',
  CHAIN_GAIN: 'chain_gain',
  CHAIN_BREAK: 'chain_break',
  CHAIN_REACH_5: 'chain_reach_5',
  ENERGY_EMPTY: 'energy_empty',
  REST_UPGRADE: 'rest_upgrade',
  ECHO_GAIN: 'echo_gain',
  HEAL_AMOUNT: 'heal_amount',
  SHIELD_GAIN: 'shield_gain',
  SHIELD_BREAK: 'shield_break',
  BEFORE_CARD_COST: 'before_card_cost',
  ENEMY_INTENT: 'enemy_intent',
  SHOP_PRICE_MOD: 'shop_price_mod',
  SHOP_BUY: 'shop_buy',
  ITEM_USE: 'item_use',
  REWARD_GENERATE: 'reward_generate',
});

function normalizeTrigger(trigger) {
  if (typeof trigger !== 'string') return trigger;
  return TRIGGER_ALIASES[trigger] || trigger;
}

function createItemPassiveRuntimeFacade(gs) {
  const runtimeGs = createLegacyGameStateRuntimeFacade(gs);
  const drawCards = CardGameStateRuntimeCompatMethods.drawCards;

  return new Proxy(runtimeGs, {
    get(target, prop, receiver) {
      if (prop === 'drawCards' && typeof drawCards === 'function') {
        return drawCards.bind(receiver);
      }

      return Reflect.get(target, prop, receiver);
    },
  });
}

function applyTriggerResult(currentResult, result) {
  if (result === undefined || result === true) return currentResult;
  if (
    currentResult
    && result
    && typeof currentResult === 'object'
    && typeof result === 'object'
    && !Array.isArray(currentResult)
    && !Array.isArray(result)
  ) {
    return { ...currentResult, ...result };
  }
  return result;
}

export const ItemSystem = {
  triggerItems(gs, trigger, data) {
    const normalizedTrigger = normalizeTrigger(trigger);
    const runtimeGs = createItemPassiveRuntimeFacade(gs);
    let currentResult = data;
    let boolResult = false;
    const sortedItems = [...gs.player.items];

    sortedItems.forEach((itemId) => {
      const item = DATA.items[itemId];
      if (!item?.passive) return;
      const result = item.passive(runtimeGs, normalizedTrigger, currentResult);
      if (result === true) boolResult = true;
      else currentResult = applyTriggerResult(currentResult, result);
    });

    const setResult = SetBonusSystem.triggerSetBonuses(gs, normalizedTrigger, currentResult);
    if (setResult === true) boolResult = true;
    else currentResult = applyTriggerResult(currentResult, setResult);

    InscriptionSystem.triggerSynergy(gs, normalizedTrigger, DATA, currentResult);

    if (boolResult) return true;
    return currentResult;
  },

  getActiveSets(gs) {
    return SetBonusSystem.getActiveSets(gs);
  },
};
