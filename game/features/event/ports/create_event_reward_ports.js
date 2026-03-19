import * as Deps from '../../../core/deps_factory.js';

const EVENT_REWARD_DEP_CONTRACTS = Object.freeze({
  getEventDeps: 'event',
  getRewardDeps: 'reward',
  getRewardFlowDeps: 'rewardFlow',
  getRunReturnDeps: 'runReturn',
});

function getOptionalFactoryExport(exportName, depsFactory = Deps) {
  return Object.prototype.hasOwnProperty.call(depsFactory, exportName)
    ? depsFactory[exportName]
    : null;
}

export function createEventRewardDepAccessors(depsFactory = Deps) {
  const createDepsAccessors = getOptionalFactoryExport('createDepsAccessors');
  const createDeps = getOptionalFactoryExport('createDeps', depsFactory);

  if (typeof createDepsAccessors === 'function' && typeof createDeps === 'function') {
    return createDepsAccessors(EVENT_REWARD_DEP_CONTRACTS, createDeps);
  }

  const accessors = {};

  for (const accessorName of Object.keys(EVENT_REWARD_DEP_CONTRACTS)) {
    accessors[accessorName] = (overrides = {}) => ({
      ...(depsFactory?.[accessorName]?.() || {}),
      ...overrides,
    });
  }

  return Object.freeze(accessors);
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
