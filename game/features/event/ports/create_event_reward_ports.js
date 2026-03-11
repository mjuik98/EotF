import * as Deps from '../../../core/deps_factory.js';

export function createEventRewardPorts() {
  return {
    getEventDeps: () => Deps.getEventDeps(),
    getRewardDeps: () => Deps.getRewardDeps(),
    getRunReturnDeps: () => Deps.getRunReturnDeps(),
  };
}
