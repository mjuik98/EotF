import { DATA } from '../data/game_data.js';
import { SetBonusSystem } from './set_bonus_system.js';
import { CombatMethods } from './methods/combat_methods.js';
import { CardMethods } from './methods/card_methods.js';
import { PlayerMethods } from './methods/player_methods.js';

/**
 * 게임 상태의 핵심 비즈니스 로직을 담당하는 메서드 모음.
 * 기능별로 분리된 모듈들을 하나로 통합합니다.
 */
export const GameStateCoreMethods = {
  // ── 공통/코어 로직 ──
  triggerItems(trigger, data) {
    let numericResult = typeof data === 'number' ? data : null;
    let boolResult = false;

    const sortedItems = [...this.player.items].sort((a, b) => {
      if (trigger === 'damage_taken') {
        const aPrio = (a === 'void_crystal' || a === 'blood_crown') ? -1 : 0;
        const bPrio = (b === 'void_crystal' || b === 'blood_crown') ? -1 : 0;
        return aPrio - bPrio;
      }
      return 0;
    });

    sortedItems.forEach(itemId => {
      const item = DATA.items[itemId];
      if (!item?.passive) return;
      const payload = numericResult !== null ? numericResult : data;
      const result = item.passive(this, trigger, payload);
      if (typeof result === 'number' && Number.isFinite(result) && numericResult !== null) {
        numericResult = result;
      }
      if (result === true) boolResult = true;
    });

    const setPayload = numericResult !== null ? numericResult : data;
    const setResult = SetBonusSystem.triggerSetBonuses(this, trigger, setPayload);
    if (typeof setResult === 'number' && Number.isFinite(setResult) && numericResult !== null) {
      numericResult = setResult;
    }
    if (setResult === true) boolResult = true;

    if (boolResult) return true;
    if (numericResult !== null) return numericResult;
    return data;
  },

  getSetBonuses() { return SetBonusSystem.getActiveSets(this); },

  addLog(msg, type = '') {
    this.combat.log.push({ msg, type });
    if (this.combat.log.length > 200) this.combat.log.shift();
    GAME.call('updateCombatLog');
  },

  // ── 모듈 통합 ──
  ...CombatMethods,
  ...CardMethods,
  ...PlayerMethods
};
