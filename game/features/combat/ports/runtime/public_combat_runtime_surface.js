import { buildCombatRuntimeSubscriberActions } from '../../application/build_combat_runtime_subscriber_actions.js';
import { createCombatBindingsActions } from '../../platform/browser/create_combat_bindings.js';
import { registerCardEventSubscribers } from '../../platform/runtime/register_card_event_subscribers.js';

export function createCombatRuntimeCapabilities() {
  return {
    buildSubscriberActions: buildCombatRuntimeSubscriberPublicActions,
  };
}

export function buildCombatRuntimeSubscriberPublicActions(fns) {
  return buildCombatRuntimeSubscriberActions(fns);
}

export { registerCardEventSubscribers };
export { createCombatBindingsActions };
