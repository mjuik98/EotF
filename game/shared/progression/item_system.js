import { DATA } from '../../../data/game_data.js';
import { SetBonusSystem } from '../../features/combat/domain/set_bonus_system.js';
import { InscriptionSystem } from './inscription_system.js';

const TRIGGER_ALIASES = Object.freeze({
  COMBAT_START: 'combat_start',
  COMBAT_END: 'combat_end',
  TURN_START: 'turn_start',
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
  ECHO_GAIN: 'echo_gain',
  HEAL_AMOUNT: 'heal_amount',
  SHIELD_GAIN: 'shield_gain',
  SHIELD_BREAK: 'shield_break',
  BEFORE_CARD_COST: 'before_card_cost',
  DAMAGE_CALC: 'damage_calc',
  SHOP_PRICE_MOD: 'shop_price_mod',
  SHOP_BUY: 'shop_buy',
  ITEM_USE: 'item_use',
  REWARD_GENERATE: 'reward_generate',
});

function normalizeTrigger(trigger) {
  if (typeof trigger !== 'string') return trigger;
  return TRIGGER_ALIASES[trigger] || trigger;
}

export const ItemSystem = {
  triggerItems(gs, trigger, data) {
    const normalizedTrigger = normalizeTrigger(trigger);
    let numericResult = typeof data === 'number' ? data : null;
    let numericOverride = null;
    let boolResult = false;

    const sortedItems = [...gs.player.items].sort((a, b) => {
      if (normalizedTrigger === 'damage_taken') {
        const aPrio = (a === 'void_crystal' || a === 'blood_crown') ? -1 : 0;
        const bPrio = (b === 'void_crystal' || b === 'blood_crown') ? -1 : 0;
        return aPrio - bPrio;
      }
      return 0;
    });

    sortedItems.forEach((itemId) => {
      const item = DATA.items[itemId];
      if (!item?.passive) return;
      const payload = numericResult !== null ? numericResult : data;
      const result = item.passive(gs, normalizedTrigger, payload);
      if (typeof result === 'number' && Number.isFinite(result)) {
        if (numericResult !== null) numericResult = result;
        else numericOverride = result;
      }
      if (result === true) boolResult = true;
    });

    const setPayload = numericResult !== null ? numericResult : data;
    const setResult = SetBonusSystem.triggerSetBonuses(gs, normalizedTrigger, setPayload);
    if (typeof setResult === 'number' && Number.isFinite(setResult)) {
      if (numericResult !== null) numericResult = setResult;
      else numericOverride = setResult;
    }
    if (setResult === true) boolResult = true;

    InscriptionSystem.triggerSynergy(gs, normalizedTrigger, DATA, setPayload);

    if (boolResult) return true;
    if (numericResult !== null) return numericResult;
    if (numericOverride !== null) return numericOverride;
    return data;
  },

  getActiveSets(gs) {
    return SetBonusSystem.getActiveSets(gs);
  },
};
