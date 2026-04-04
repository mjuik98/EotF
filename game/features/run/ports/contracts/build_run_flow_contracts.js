import { continueLoadedRunUseCase } from '../../application/continue_loaded_run_use_case.js';
import { createNodeHandoffRuntime } from '../../application/create_node_handoff_runtime.js';
import { startGameRuntime } from '../../application/create_run_setup_runtime.js';
import { enterRunRuntime } from '../../application/create_run_start_runtime.js';

export function buildRunFlowContractBuilders(ctx) {
  const { getRefs, buildBaseDeps, getRunDeps, getRaf, createDeps } = ctx;

  return {
    runStart: () => {
      const refs = getRefs();
      const deps = {
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

      return {
        ...deps,
        continueLoadedRun: (options = {}) => continueLoadedRunUseCase({
          ...deps,
          ...options,
        }),
      };
    },

    runSetup: () => {
      const refs = getRefs();
      const deps = {
        ...buildBaseDeps('run'),
        runRules: refs.RunRules,
        audioEngine: refs.AudioEngine,
        getSelectedClass: refs.getSelectedClass,
        shuffleArray: refs.shuffleArray,
        resetDeckModalFilter: refs.resetDeckModalFilter,
        enterGameplay: (options = {}) => enterRunRuntime({
          ...createDeps('runStart'),
          ...options,
        }),
      };

      return {
        ...deps,
        enterRun: deps.enterGameplay,
        startGame: (options = {}) => startGameRuntime({
          ...deps,
          ...options,
        }),
      };
    },

    runNodeHandoff: () => {
      const baseDeps = buildBaseDeps('run');
      const deps = {
        combatFlow: createDeps('combatFlow'),
        eventFlow: createDeps('eventFlow'),
        rewardFlow: createDeps('rewardFlow'),
      };

      return {
        ...baseDeps,
        ...deps,
        startCombat: (mode = 'normal') => deps.combatFlow.startCombat?.(mode),
        openEvent: () => deps.eventFlow.openEvent?.(),
        openShop: () => deps.eventFlow.openShop?.(),
        openRestSite: () => deps.eventFlow.openRestSite?.(),
        openReward: (mode = false) => deps.rewardFlow.openReward?.(mode),
        createRuntime: (overrides = {}) => createNodeHandoffRuntime({
          nodeHandoff: {
            startCombat: (mode) => deps.combatFlow.startCombat?.(mode),
            openEvent: () => deps.eventFlow.openEvent?.(),
            openShop: () => deps.eventFlow.openShop?.(),
            openRestSite: () => deps.eventFlow.openRestSite?.(),
            openReward: (mode) => deps.rewardFlow.openReward?.(mode),
          },
          ...overrides,
        }),
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
        descriptionUtils: refs.DescriptionUtils,
        DescriptionUtils: refs.DescriptionUtils,
        generateMap: refs.generateMap,
        updateUI: refs.updateUI,
        showRunFragment: () => refs.StorySystem?.showRunFragment?.(),
      };
    },

    gameBoot: () => {
      const refs = getRefs();
      const runDeps = getRunDeps();
      const coreRefs = refs.featureRefs?.core || {};
      const canonicalGs = coreRefs.GS || refs.GS || null;
      const saveRuntimeContext = coreRefs.SaveRuntimeContext || refs.SaveRuntimeContext || null;
      const saveSystem = saveRuntimeContext?.saveSystem || coreRefs.SaveSystem || refs.SaveSystem;
      return {
        ...runDeps,
        gs: canonicalGs?.player ? canonicalGs : (runDeps.gs || canonicalGs),
        audioEngine: refs.AudioEngine,
        runRules: refs.RunRules,
        saveSystem,
        saveRuntimeContext,
        saveSystemDeps: createDeps('saveSystem'),
        initTitleCanvas: refs.initTitleCanvas,
        updateUI: refs.updateUI,
        refreshRunModePanel: refs.refreshRunModePanel,
      };
    },
  };
}
