import { EventBus } from './event_bus.js';
import { Actions } from './state_actions.js';
import { createRuntimeSubscriberPorts } from './bootstrap/create_runtime_subscriber_ports.js';

export function registerCombatEventSubscribers(ctx) {
  const handlers = createRuntimeSubscriberPorts().combat.buildEventSubscriberHandlers(ctx);

  EventBus.on(Actions.ENEMY_DAMAGE, handlers.onEnemyDamage);
  EventBus.on(Actions.ENEMY_DEATH, handlers.onEnemyDeath);
  EventBus.on(Actions.ENEMY_STATUS, handlers.onEnemyStatus);
  EventBus.on(Actions.COMBAT_END, handlers.onCombatEnd);
  EventBus.on(Actions.TURN_START, handlers.onTurnStart);
}
