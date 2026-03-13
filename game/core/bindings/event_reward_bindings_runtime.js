import { createEventBindingCapabilities } from '../../features/event/ports/public_event_binding_surface.js';

export function applyEventRewardBindings({
  modules,
  fns,
  createActions = createEventBindingCapabilities().createEventRewardBindings,
  createPorts,
}) {
  const ports = typeof createPorts === 'function' ? createPorts() : null;
  Object.assign(fns, ports ? createActions(modules, fns, ports) : createActions(modules, fns));
  return fns;
}
