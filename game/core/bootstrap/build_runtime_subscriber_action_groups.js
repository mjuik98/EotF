import { createRuntimeSubscriberPorts } from './create_runtime_subscriber_ports.js';
import {
  buildUiRuntimeSubscriberPublicActions,
} from '../../features/ui/ports/runtime/public_ui_runtime_surface.js';

export function buildRuntimeSubscriberActionGroups(fns) {
  const runtimePorts = createRuntimeSubscriberPorts();

  return {
    gameplay: runtimePorts.combat.buildSubscriberActions(fns),
    shell: buildUiRuntimeSubscriberPublicActions(fns),
  };
}
