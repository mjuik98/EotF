import { buildCombatRuntimeSubscriberActions } from '../../application/build_combat_runtime_subscriber_actions.js';
import { createCombatBindingsActions } from '../../platform/browser/create_combat_bindings.js';

export function createCombatRuntimeCapabilities() {
  return {
    buildSubscriberActions: buildCombatRuntimeSubscriberPublicActions,
  };
}

export function buildCombatRuntimeSubscriberPublicActions(fns) {
  return buildCombatRuntimeSubscriberActions(fns);
}

export { createCombatBindingsActions };
