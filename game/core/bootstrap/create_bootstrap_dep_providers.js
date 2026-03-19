import * as Deps from '../deps_factory.js';

const STORY_DEP_CONTRACTS = Object.freeze({
  getStoryDeps: 'story',
});

const TITLE_BOOTSTRAP_DEP_CONTRACTS = Object.freeze({
  getClassSelectDeps: 'classSelect',
  getGameBootDeps: 'gameBoot',
  getHelpPauseDeps: 'helpPause',
});

function getOptionalDepsFactoryExport(exportName, depsFactory) {
  return depsFactory && Object.prototype.hasOwnProperty.call(depsFactory, exportName)
    ? depsFactory[exportName]
    : null;
}

function createStoryDepProviders(depsFactory = Deps) {
  return createDepsAccessors(STORY_DEP_CONTRACTS, depsFactory);
}

function createTitleBootstrapDepProviders(depsFactory = Deps) {
  return createDepsAccessors(TITLE_BOOTSTRAP_DEP_CONTRACTS, depsFactory);
}

function createDepsAccessors(contractMap, depsFactory) {
  const createDepsAccessors = getOptionalDepsFactoryExport('createDepsAccessors', Deps);
  const createDeps =
    typeof depsFactory === 'function'
      ? depsFactory
      : getOptionalDepsFactoryExport('createDeps', depsFactory);

  if (typeof createDepsAccessors === 'function' && typeof createDeps === 'function') {
    return createDepsAccessors(contractMap, createDeps);
  }

  const accessors = {};
  for (const accessorName of Object.keys(contractMap)) {
    accessors[accessorName] = (overrides = {}) => ({
      ...(depsFactory?.[accessorName]?.() || {}),
      ...overrides,
    });
  }

  return Object.freeze(accessors);
}

export function createBootstrapDepProviders(depsFactory = Deps) {
  return {
    story: createStoryDepProviders(depsFactory),
    title: createTitleBootstrapDepProviders(depsFactory),
  };
}
