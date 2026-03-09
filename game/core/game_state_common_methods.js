import { ItemSystem } from '../systems/item_system.js';
import { EventBus } from './event_bus.js';
import { CoreEvents } from './event_contracts.js';

function createCombatLogEntry(msg, type, turn) {
  return {
    msg,
    type,
    id: `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    turn,
  };
}

export const GameStateCommonMethods = {
  triggerItems(trigger, data) {
    return ItemSystem.triggerItems(this, trigger, data);
  },

  getSetBonuses() {
    return ItemSystem.getActiveSets(this);
  },

  addLog(msg, type = '') {
    this.combat.log.push(createCombatLogEntry(msg, type, this.combat?.turn ?? 0));
    if (this.combat.log.length > 200) this.combat.log.shift();

    EventBus.emit(CoreEvents.LOG_ADD, { msg, type, gs: this });
  },
};
