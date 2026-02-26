import { DATA } from '../data/game_data.js';
import { SetBonusSystem } from './set_bonus_system.js';
import { CombatMethods } from './methods/combat_methods.js';
import { CardMethods } from './methods/card_methods.js';
import { PlayerMethods } from './methods/player_methods.js';
import { GameAPI } from './game_api.js';
import { ItemSystem } from './systems/item_system.js';

/**
 * 게임 상태의 핵심 비즈니스 로직을 담당하는 메서드 모음.
 * 기능별로 분리된 모듈들을 하나로 통합합니다.
 */
export const GameStateCoreMethods = {
  // ── 공통/코어 로직 ──
  triggerItems(trigger, data) {
    return ItemSystem.triggerItems(this, trigger, data);
  },
  getSetBonuses() { return ItemSystem.getActiveSets(this); },

  addLog(msg, type = '') {
    this.combat.log.push({ msg, type });
    if (this.combat.log.length > 200) this.combat.log.shift();

    this.markDirty?.('log');
    if (typeof window.updateCombatLog === 'function') {
      window.updateCombatLog();
    } else {
      window.GAME?.call('updateCombatLog');
    }
  },

  // ── 모듈 통합 ──
  ...CombatMethods,
  ...CardMethods,
  ...PlayerMethods,
  API: GameAPI
};
