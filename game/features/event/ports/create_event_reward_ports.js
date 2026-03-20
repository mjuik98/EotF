import * as Deps from '../../../core/deps_factory.js';

const EVENT_REWARD_DEP_CONTRACTS = Object.freeze({
  getEventDeps: 'event',
  getRewardDeps: 'reward',
  getRewardFlowDeps: 'rewardFlow',
  getRunReturnDeps: 'runReturn',
});

export function createEventRewardDepAccessors(depsFactory = Deps) {
  return Deps.buildFeatureContractAccessors(EVENT_REWARD_DEP_CONTRACTS, depsFactory);
}

export function createEventPorts(depsFactory = Deps) {
  const { getEventDeps } = createEventRewardDepAccessors(depsFactory);

  return {
    getEventDeps,
  };
}

export function createRewardPorts(depsFactory = Deps) {
  const {
    getRewardDeps,
    getRewardFlowDeps,
    getRunReturnDeps,
  } = createEventRewardDepAccessors(depsFactory);

  return {
    getRewardDeps,
    getRewardFlowDeps,
    getRunReturnDeps,
  };
}

export function createEventRewardPorts(depsFactory = Deps) {
  const eventPorts = createEventPorts(depsFactory);
  const rewardPorts = createRewardPorts(depsFactory);

  return {
    ...eventPorts,
    ...rewardPorts,
  };
}
