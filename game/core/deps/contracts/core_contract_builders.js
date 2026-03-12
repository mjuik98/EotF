import { playUiItemGet } from '../../../domain/audio/audio_event_helpers.js';
import { createRewardReturnActions } from '../../../shared/runtime/reward_return_actions.js';

export function buildCoreContractBuilders(ctx) {
  const {
    getRefs,
    buildBaseDeps,
    getCombatDeps,
    getEventDeps,
    getRunDeps,
    getUiDeps,
    getHudDeps,
    getRaf,
  } = ctx;

  return {
    base: () => ({
      ...buildBaseDeps('run'),
    }),

    story: () => {
      const refs = getRefs();
      const restartEndingFlow = refs.restartEndingFlow || refs.restartFromEnding;
      const selectEndingFragment = refs.selectEndingFragment || refs.selectFragment;
      const openEndingCodex = refs.openEndingCodex || refs.openCodex;
      return {
        ...buildBaseDeps('run'),
        audioEngine: refs.AudioEngine,
        particleSystem: refs.ParticleSystem,
        showWorldMemoryNotice: refs.showWorldMemoryNotice,
        restartEndingFlow: () => restartEndingFlow?.(),
        selectEndingFragment: (effect) => selectEndingFragment?.(effect),
        openEndingCodex: () => openEndingCodex?.(),
        endingActions: {
          restart: () => restartEndingFlow?.(),
          selectFragment: (effect) => selectEndingFragment?.(effect),
          openCodex: () => openEndingCodex?.(),
        },
        restartFromEnding: refs.restartFromEnding,
        openCodex: refs.openCodex,
      };
    },

    combatTurnBase: () => {
      const refs = getRefs();
      return {
        ...getCombatDeps(),
        enemyTurn: refs.enemyTurn,
        updateChainUI: refs.updateChainUI,
        showTurnBanner: refs.showTurnBanner,
        renderCombatEnemies: refs.renderCombatEnemies,
        renderCombatCards: refs.renderCombatCards,
        updateStatusDisplay: refs.updateStatusDisplay,
        updateClassSpecialUI: refs.updateClassSpecialUI,
        updateCombatEnergy: (gs) => refs.HudUpdateUI?.updateCombatEnergy?.(gs, getHudDeps()),
        hudUpdateUI: refs.HudUpdateUI,
        updateUI: refs.updateUI,
        cardCostUtils: refs.CardCostUtils,
        classMechanics: refs.ClassMechanics,
        showEchoBurstOverlay: refs.showEchoBurstOverlay,
        showDmgPopup: refs.showDmgPopup,
        shuffleArray: (arr) => refs.RandomUtils?.shuffleArray?.(arr) || arr,
      };
    },

    event: () => {
      const refs = getRefs();
      return {
        ...buildBaseDeps('event'),
        runRules: refs.RunRules,
        updateUI: refs.updateUI,
        showGameplayScreen: () => refs.switchScreen?.('game'),
        returnToGame: refs.returnToGame,
        switchScreen: refs.switchScreen,
        renderMinimap: refs.renderMinimap,
        updateNextNodes: refs.updateNextNodes,
        showItemToast: refs.showItemToast,
        audioEngine: refs.AudioEngine,
        screenShake: refs.ScreenShake,
        descriptionUtils: refs.DescriptionUtils,
        requestAnimationFrame: getRaf(),
        playItemGet: () => playUiItemGet(refs.AudioEngine),
      };
    },

    reward: () => {
      const refs = getRefs();
      const returnActions = createRewardReturnActions({
        returnToGame: (fromReward = false) => refs.returnToGame?.(fromReward),
      });
      return {
        ...buildBaseDeps('run'),
        showGameplayScreen: () => refs.switchScreen?.('game'),
        switchScreen: refs.switchScreen,
        showRewardScreen: () => refs.switchScreen?.('reward'),
        ...returnActions,
        showItemToast: refs.showItemToast,
        tooltipUI: refs.TooltipUI,
        TooltipUI: refs.TooltipUI,
        descriptionUtils: refs.DescriptionUtils,
        DescriptionUtils: refs.DescriptionUtils,
        playItemGet: () => playUiItemGet(refs.AudioEngine),
      };
    },

    runReturn: () => {
      const refs = getRefs();
      return {
        ...buildBaseDeps('run'),
        storySystem: refs.StorySystem,
        finalizeRunOutcome: refs.finalizeRunOutcome,
        advanceToNextRegion: refs.advanceToNextRegion,
        getBaseRegionIndex: refs.getBaseRegionIndex,
        getRegionCount: refs.getRegionCount,
        updateNextNodes: refs.updateNextNodes,
        renderMinimap: refs.renderMinimap,
      };
    },

    saveSystem: () => {
      const refs = getRefs();
      return {
        ...buildBaseDeps('run'),
        runRules: refs.RunRules,
        isGameStarted: () => refs._gameStarted?.(),
      };
    },
  };
}
