import * as Deps from '../../../core/deps_factory.js';
import { createEventPorts } from './event_ports.js';
import { createRewardPorts } from './reward_ports.js';

export function createEventRewardPorts() {
  return {
    ...createEventPorts(Deps),
    ...createRewardPorts(Deps),
  };
}
