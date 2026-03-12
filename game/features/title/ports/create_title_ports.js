export function createTitlePorts(modules, fns, options = {}) {
  return {
    doc: options.doc || null,
    win: options.win || null,
    fns,
    modules,
    setTimeoutFn: options.setTimeoutFn || setTimeout,
    playIntroCinematic: options.playIntroCinematic,
    startPreRunRipple: options.startPreRunRipple,
    getClassSelectDeps: options.getClassSelectDeps,
    getRunModeDeps: options.getRunModeDeps,
    getMetaProgressionDeps: options.getMetaProgressionDeps,
    getRegionTransitionDeps: options.getRegionTransitionDeps,
    getHelpPauseDeps: options.getHelpPauseDeps,
    getSaveSystemDeps: options.getSaveSystemDeps,
    getRunStartDeps: options.getRunStartDeps,
    getRunSetupDeps: options.getRunSetupDeps,
    getSettingsDeps: options.getSettingsDeps,
  };
}
