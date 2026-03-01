import { DATA } from '../../data/game_data.js';
import { SetBonusSystem } from '../systems/set_bonus_system.js';
import { CombatMethods } from '../combat/combat_methods.js';
import { CardMethods } from '../combat/card_methods.js';
import { PlayerMethods } from '../combat/player_methods.js';
import { ItemSystem } from '../systems/item_system.js';
import { DamageSystem } from '../combat/damage_system.js';
import { EventBus } from './event_bus.js';
import { CoreEvents } from './event_contracts.js';

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
    const id = Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
    this.combat.log.push({ msg, baseMsg: msg, type, id, count: 1 });
    if (this.combat.log.length > 200) this.combat.log.shift();

    this.markDirty?.('log');
    // EventBus로 알림 → 구독자가 UI 갱신
    EventBus.emit(CoreEvents.LOG_ADD, { msg, type, gs: this });
  },

  // ── 모듈 통합 ──
  ...CombatMethods,
  ...CardMethods,
  ...PlayerMethods,
  // API: GameAPI 제거 (GAME.API 단일 경로로 통일하여 혼란 방지)
};
