import { buildCombatRuntimeSubscriberPublicActions } from '../../features/combat/ports/runtime/public_combat_runtime_surface.js';
import {
  buildUiRuntimeSubscriberPublicActions,
} from '../../features/ui/ports/runtime/public_ui_runtime_surface.js';

export function buildRuntimeSubscriberActionGroups(fns) {
  return {
    gameplay: buildCombatRuntimeSubscriberPublicActions(fns),
    shell: buildUiRuntimeSubscriberPublicActions(fns),
  };
}
