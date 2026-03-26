export function buildTitleRunContractBuilders(ctx) {
  const { getRefs, buildBaseDeps, createDeps } = ctx;

  return {
    runMode: () => {
      const refs = getRefs();
      const saveSystemDeps = createDeps('saveSystem');
      const saveMeta = () => {
        const status = refs.SaveSystem?.saveMeta?.(saveSystemDeps);
        refs.SaveSystem?.showSaveStatus?.(status, saveSystemDeps);
        return status;
      };
      return {
        ...buildBaseDeps('run'),
        runRules: refs.RunRules,
        saveMeta,
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
        resetCharacterSelectState: refs.resetCharacterSelectState,
        refreshRunModePanel: refs.refreshRunModePanel,
        refreshTitleSaveState: () => refs.GameBootUI?.refreshTitleSaveState?.(createDeps('gameBoot')),
        showPendingClassProgressSummary: refs.showPendingClassProgressSummary,
      };
    },
  };
}
