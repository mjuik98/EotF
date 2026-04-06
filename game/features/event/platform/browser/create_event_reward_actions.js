import { createEventActions } from './create_event_runtime_actions.js';
import { createRewardActions } from '../../integration/reward_runtime_capabilities.js';

export function createEventRewardActions(modules, _fns, ports) {
  return {
    ...createEventActions(modules, ports),
    ...createRewardActions(modules, ports),
  };
}
