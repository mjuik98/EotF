import { ItemSystem } from '../shared/progression/item_system.js';
import { EventBus } from './event_bus.js';
import { CoreEvents } from './event_contracts.js';

function getCurrentCardLogSource(gs) {
  const currentCard = gs?._currentCard;
  if (!currentCard || typeof currentCard !== 'object') return null;

  const id = typeof currentCard.id === 'string' && currentCard.id ? currentCard.id : null;
  const name = typeof currentCard.name === 'string' && currentCard.name
    ? currentCard.name
    : (id || null);

  if (!name) return null;
  return { type: 'card', id, name };
}

function normalizeMetaSource(source) {
  if (!source || typeof source !== 'object') return null;

  const type = typeof source.type === 'string' && source.type ? source.type : 'effect';
  const id = typeof source.id === 'string' && source.id ? source.id : null;
  const name = typeof source.name === 'string' && source.name
    ? source.name
    : (id || null);

  if (!name) return null;
  return { type, id, name };
}

function mergeCombatLogMeta(gs, meta = null) {
  const nextMeta = meta && typeof meta === 'object' ? { ...meta } : {};
  const source = normalizeMetaSource(nextMeta.source) || getCurrentCardLogSource(gs);
  if (source) nextMeta.source = source;
  return Object.keys(nextMeta).length > 0 ? nextMeta : null;
}

function createCombatLogEntry(msg, type, turn, meta) {
  const entry = {
    msg,
    type,
    id: `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    turn,
  };
  if (meta) entry.meta = meta;
  return entry;
}

export const GameStateCommonMethods = {
  triggerItems(trigger, data) {
    return ItemSystem.triggerItems(this, trigger, data);
  },

  getSetBonuses() {
    return ItemSystem.getActiveSets(this);
  },

  addLog(msg, type = '', meta = null) {
    const entry = createCombatLogEntry(
      msg,
      type,
      this.combat?.turn ?? 0,
      mergeCombatLogMeta(this, meta),
    );
    this.combat.log.push(entry);
    if (this.combat.log.length > 200) this.combat.log.shift();

    EventBus.emit(CoreEvents.LOG_ADD, { msg, type, gs: this, entry });
  },
};
