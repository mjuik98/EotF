import { createUiActions } from './app/ui_actions.js';
import { buildUiRuntimeSubscriberActions } from './app/build_runtime_subscriber_actions.js';
import { buildUiShellContractBuilders } from './ports/contracts/build_ui_shell_contracts.js';
import { createUiPorts } from './ports/create_ui_ports.js';

export function createUiBindingContext(modules, fns, options = {}) {
  const ports = createUiPorts(options);
  return {
    actions: createUiActions(modules, fns, ports),
    ports,
  };
}

export function createUiBindingsActions(modules, fns, options = {}) {
  return createUiBindingContext(modules, fns, options).actions;
}

export function buildUiRuntimeSubscriberPublicActions(fns) {
  return buildUiRuntimeSubscriberActions(fns);
}

export function buildUiShellContractPublicBuilders(ctx) {
  return buildUiShellContractBuilders(ctx);
}

export {
  buildUiRuntimeSubscriberActions,
  buildUiShellContractBuilders,
  createUiActions,
  createUiPorts,
};
