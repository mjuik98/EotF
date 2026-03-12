export function buildTitleRunContractBuilders(ctx) {
  const { getRefs, buildBaseDeps, createDeps } = ctx;

  return {
    runMode: () => {
      const refs = getRefs();
      return {
        ...buildBaseDeps('run'),
        runRules: refs.RunRules,
        saveMeta: () => refs.SaveSystem?.saveMeta?.(createDeps('saveSystem')),
        notice: (msg) => refs.showWorldMemoryNotice?.(msg),
      };
    },

    metaProgression: () => {
      const refs = getRefs();
      return {
        ...buildBaseDeps('run'),
        switchScreen: refs.switchScreen,
        showTitleScreen: () => refs.switchScreen?.('title'),
        completeTitleReturn: () => refs.completeTitleReturn?.(),
        clearSelectedClass: refs.clearSelectedClass,
        refreshRunModePanel: refs.refreshRunModePanel,
        refreshTitleSaveState: () => refs.GameBootUI?.refreshTitleSaveState?.(createDeps('gameBoot')),
        showPendingClassProgressSummary: refs.showPendingClassProgressSummary,
      };
    },
  };
}
