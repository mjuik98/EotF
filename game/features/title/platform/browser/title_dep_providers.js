import * as Deps from '../../../../core/deps_factory.js';

const TITLE_DEP_CONTRACTS = Object.freeze({
  getClassSelectDeps: 'classSelect',
  getGameBootDeps: 'gameBoot',
  getRunModeDeps: 'runMode',
  getMetaProgressionDeps: 'metaProgression',
  getRegionTransitionDeps: 'regionTransition',
  getHelpPauseDeps: 'helpPause',
  getSaveSystemDeps: 'saveSystem',
  getRunStartDeps: 'runStart',
  getRunSetupDeps: 'runSetup',
  getSettingsDeps: 'settings',
});

function getOptionalDepsFactoryExport(exportName, depsFactory) {
  return depsFactory && Object.prototype.hasOwnProperty.call(depsFactory, exportName)
    ? depsFactory[exportName]
    : null;
}

function buildTitleDepAccessors(depsFactory) {
  const createDepsAccessors = getOptionalDepsFactoryExport('createDepsAccessors', Deps);
  const createDeps =
    typeof depsFactory === 'function'
      ? depsFactory
      : getOptionalDepsFactoryExport('createDeps', depsFactory);

  if (typeof createDepsAccessors === 'function' && typeof createDeps === 'function') {
    return createDepsAccessors(TITLE_DEP_CONTRACTS, createDeps);
  }

  const accessors = {};

  for (const accessorName of Object.keys(TITLE_DEP_CONTRACTS)) {
    accessors[accessorName] = (overrides = {}) => ({
      ...(depsFactory?.[accessorName]?.() || {}),
      ...overrides,
    });
  }

  return Object.freeze(accessors);
}

export function createTitleDepProviders(depsFactory = Deps) {
  return buildTitleDepAccessors(depsFactory);
}
