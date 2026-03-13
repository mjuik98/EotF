import { buildCombatRuntimeSubscriberActions } from '../application/build_combat_runtime_subscriber_actions.js';

export function buildCombatRuntimeSubscriberPublicActions(fns) {
  return buildCombatRuntimeSubscriberActions(fns);
}
