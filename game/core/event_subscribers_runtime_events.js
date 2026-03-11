import { EventBus } from './event_bus.js';
import { Actions } from './state_actions.js';
import { CoreEvents } from './event_contracts.js';

export function registerRuntimeEventSubscribers(ctx) {
  EventBus.on(Actions.SCREEN_CHANGE, () => {
    ctx.callAction('updateUI');
  });

  EventBus.on(CoreEvents.LOG_ADD, () => {
    ctx.callAction('updateCombatLog');
  });
}
