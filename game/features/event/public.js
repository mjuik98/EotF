import { createEventRewardActions } from './app/event_reward_actions.js';
import {
  createEventUiCallbacks,
  createEventUiRuntime,
} from './application/create_event_ui_runtime.js';
import { buildEventContractBuilders } from './ports/contracts/build_event_contracts.js';
import { buildEventFlowContractBuilders } from './ports/contracts/build_event_flow_contracts.js';
import { createEventRewardPorts } from './ports/create_event_reward_ports.js';

export function createEventRewardBindingActions(modules, fns, ports = createEventRewardPorts()) {
  return createEventRewardActions(modules, fns, ports);
}

export function buildEventContractPublicBuilders(ctx) {
  return buildEventContractBuilders(ctx);
}

export function buildEventFlowContractPublicBuilders(ctx) {
  return buildEventFlowContractBuilders(ctx);
}

export {
  buildEventContractBuilders,
  buildEventFlowContractBuilders,
  createEventRewardActions,
  createEventRewardPorts,
  createEventUiCallbacks,
  createEventUiRuntime,
};
