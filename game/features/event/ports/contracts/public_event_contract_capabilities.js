import { buildEventContractBuilders } from './build_event_contracts.js';
import { buildEventFlowContractBuilders } from './build_event_flow_contracts.js';

export function createEventContractCapabilities() {
  return {
    buildEvent: buildEventContractBuilders,
    buildFlow: buildEventFlowContractBuilders,
  };
}
