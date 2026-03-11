import { createEventActions } from './event_actions.js';
import { createRewardActions } from './reward_actions.js';

export function createEventRewardActions(modules, _fns, ports) {
  return {
    ...createEventActions(modules, ports),
    ...createRewardActions(modules, ports),
  };
}
