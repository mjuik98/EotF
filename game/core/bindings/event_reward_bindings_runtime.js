import { createEventRewardBindingActions } from '../../features/event/public.js';

export function applyEventRewardBindings({
  modules,
  fns,
  createActions = createEventRewardBindingActions,
  createPorts,
}) {
  const ports = typeof createPorts === 'function' ? createPorts() : null;
  Object.assign(fns, ports ? createActions(modules, fns, ports) : createActions(modules, fns));
  return fns;
}
