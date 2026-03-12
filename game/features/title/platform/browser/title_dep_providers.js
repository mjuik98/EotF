import * as Deps from '../../../../core/deps_factory.js';

export function createTitleDepProviders(depsFactory = Deps) {
  return {
    getClassSelectDeps: () => depsFactory.getClassSelectDeps(),
    getRunModeDeps: () => depsFactory.getRunModeDeps(),
    getMetaProgressionDeps: () => depsFactory.getMetaProgressionDeps(),
    getRegionTransitionDeps: () => depsFactory.getRegionTransitionDeps(),
    getHelpPauseDeps: () => depsFactory.getHelpPauseDeps(),
    getSaveSystemDeps: () => depsFactory.getSaveSystemDeps(),
    getRunStartDeps: () => depsFactory.getRunStartDeps(),
    getRunSetupDeps: () => depsFactory.getRunSetupDeps(),
    getSettingsDeps: () => depsFactory.getSettingsDeps(),
  };
}
