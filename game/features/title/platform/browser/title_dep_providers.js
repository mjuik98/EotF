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

function buildTitleDepAccessors(depsFactory) {
  return Deps.buildFeatureContractAccessors(TITLE_DEP_CONTRACTS, depsFactory);
}

export function createTitleDepProviders(depsFactory = Deps) {
  return buildTitleDepAccessors(depsFactory);
}
