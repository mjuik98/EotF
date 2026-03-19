import { buildCombatRuntimeSubscriberActions } from '../application/build_combat_runtime_subscriber_actions.js';
import { createCombatBindingsActions } from '../platform/browser/create_combat_bindings.js';
import { createCombatEventSubscriberHandlers } from '../platform/browser/create_combat_event_subscriber_handlers.js';

export function createCombatRuntimeCapabilities() {
  return {
    buildEventSubscriberHandlers: createCombatEventSubscriberHandlers,
    buildSubscriberActions: buildCombatRuntimeSubscriberPublicActions,
  };
}

export function buildCombatRuntimeSubscriberPublicActions(fns) {
  return buildCombatRuntimeSubscriberActions(fns);
}

export {
  createCombatBindingsActions,
  createCombatEventSubscriberHandlers,
};
