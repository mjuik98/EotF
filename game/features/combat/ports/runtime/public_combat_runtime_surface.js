import { buildCombatRuntimeSubscriberActions } from '../../application/build_combat_runtime_subscriber_actions.js';
import { runEndCombatFlow } from '../../application/run_end_combat_flow_use_case.js';
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

export const runCombatRewardTransition = runEndCombatFlow;
export { registerCardEventSubscribers };
export { createCombatBindingsActions };
