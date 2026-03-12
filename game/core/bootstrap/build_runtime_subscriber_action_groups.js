import {
  buildCombatRuntimeSubscriberPublicActions,
} from '../../features/combat/runtime/public_combat_runtime_actions.js';
import {
  buildUiRuntimeSubscriberPublicActions,
} from '../../features/ui/public.js';

export function buildRuntimeSubscriberActionGroups(fns) {
  return {
    gameplay: buildCombatRuntimeSubscriberPublicActions(fns),
    shell: buildUiRuntimeSubscriberPublicActions(fns),
  };
}
