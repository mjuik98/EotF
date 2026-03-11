import { buildCombatRuntimeSubscriberActions } from '../../features/combat/app/build_runtime_subscriber_actions.js';
import { buildUiRuntimeSubscriberActions } from '../../features/ui/app/build_runtime_subscriber_actions.js';

export function buildRuntimeSubscriberActions(fns) {
  return {
    ...buildCombatRuntimeSubscriberActions(fns),
    ...buildUiRuntimeSubscriberActions(fns),
  };
}
