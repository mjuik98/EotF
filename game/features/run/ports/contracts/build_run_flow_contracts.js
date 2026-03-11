export function buildRunFlowContractBuilders(ctx) {
  const { getRefs, buildBaseDeps, getRunDeps, getRaf, createDeps } = ctx;

  return {
    runStart: () => {
      const refs = getRefs();
      return {
        ...buildBaseDeps('run'),
        switchScreen: refs.switchScreen,
        markGameStarted: refs.markGameStarted,
        generateMap: refs.generateMap,
        audioEngine: refs.AudioEngine,
        updateUI: refs.updateUI,
        updateClassSpecialUI: refs.updateClassSpecialUI,
        initGameCanvas: refs.initGameCanvas,
        gameLoop: refs.gameLoop,
        requestAnimationFrame: getRaf(),
        showRunFragment: (overrides) => refs.StorySystem?.showRunFragment?.(overrides),
        showWorldMemoryNotice: refs.showWorldMemoryNotice,
      };
    },

    runSetup: () => {
      const refs = getRefs();
      return {
        ...buildBaseDeps('run'),
        runRules: refs.RunRules,
        audioEngine: refs.AudioEngine,
        getSelectedClass: refs.getSelectedClass,
        shuffleArray: refs.shuffleArray,
        resetDeckModalFilter: refs.resetDeckModalFilter,
        enterRun: () => refs.RunStartUI?.enterRun?.(createDeps('runStart')),
      };
    },

    regionTransition: () => {
      const refs = getRefs();
      return {
        ...buildBaseDeps('run'),
        mazeSystem: refs.MazeSystem,
        getRegionData: refs.getRegionData,
        getBaseRegionIndex: refs.getBaseRegionIndex,
        audioEngine: refs.AudioEngine,
        particleSystem: refs.ParticleSystem,
        screenShake: refs.ScreenShake,
        generateMap: refs.generateMap,
        updateUI: refs.updateUI,
        showRunFragment: () => refs.StorySystem?.showRunFragment?.(),
      };
    },

    gameBoot: () => {
      const refs = getRefs();
      return {
        ...getRunDeps(),
        audioEngine: refs.AudioEngine,
        runRules: refs.RunRules,
        saveSystem: refs.SaveSystem,
        saveSystemDeps: createDeps('saveSystem'),
        initTitleCanvas: refs.initTitleCanvas,
        updateUI: refs.updateUI,
        refreshRunModePanel: refs.refreshRunModePanel,
      };
    },
  };
}
