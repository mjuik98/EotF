import { buildCombatRuntimeSubscriberPublicActions } from '../../features/combat/public.js';
import {
  buildUiRuntimeSubscriberPublicActions,
} from '../../features/ui/public.js';

export function buildRuntimeSubscriberActionGroups(fns) {
  return {
    gameplay: buildCombatRuntimeSubscriberPublicActions(fns),
    shell: buildUiRuntimeSubscriberPublicActions(fns),
  };
}
