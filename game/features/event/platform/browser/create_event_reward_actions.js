import { createEventActions } from './create_event_runtime_actions.js';
import { createRewardActions } from '../../../reward/ports/runtime/public_reward_runtime_surface.js';

export function createEventRewardActions(modules, _fns, ports) {
  return {
    ...createEventActions(modules, ports),
    ...createRewardActions(modules, ports),
  };
}
