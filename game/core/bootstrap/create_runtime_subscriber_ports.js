import { createCombatRuntimeCapabilities } from '../../features/combat/ports/public_runtime_capabilities.js';

export function createRuntimeSubscriberPorts() {
  return {
    combat: createCombatRuntimeCapabilities(),
  };
}
