import { createRewardReturnActions, playUiItemGet } from '../../shared_support_capabilities.js';
import { createFeatureContractCapabilities } from './create_feature_contract_capabilities.js';

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
  const featureContracts = createFeatureContractCapabilities();
  const eventContractBuilders = featureContracts.event.buildEvent(ctx);
  const eventFlowContractBuilders = featureContracts.event.buildFlow(ctx);
  const combatFlowContractBuilders = featureContracts.combat.buildFlow(ctx);
  const rewardFlowContractBuilders = featureContracts.reward.buildFlow(ctx);
  const runReturnContractBuilders = featureContracts.run.buildReturn(ctx);
  const titleContractBuilders = featureContracts.title.buildStory(ctx);

  return {
    base: () => ({
      ...buildBaseDeps('run'),
    }),

    story: titleContractBuilders.story,

    combatTurnBase: () => {
      const refs = getRefs();
      const combatRefs = refs.featureRefs?.combat || {};
      return {
        ...getCombatDeps(),
        enemyTurn: combatRefs.enemyTurn || refs.enemyTurn,
        updateChainUI: combatRefs.updateChainUI || refs.updateChainUI,
        showTurnBanner: combatRefs.showTurnBanner || refs.showTurnBanner,
        renderCombatEnemies: combatRefs.renderCombatEnemies || refs.renderCombatEnemies,
        renderCombatCards: combatRefs.renderCombatCards || refs.renderCombatCards,
        updateStatusDisplay: refs.updateStatusDisplay,
        updateClassSpecialUI: refs.updateClassSpecialUI,
        updateCombatEnergy: (gs) => (combatRefs.HudUpdateUI || refs.HudUpdateUI)
          ?.updateCombatEnergy?.(gs, getHudDeps()),
        hudUpdateUI: combatRefs.HudUpdateUI || refs.HudUpdateUI,
        updateUI: combatRefs.updateUI || refs.updateUI,
        cardCostUtils: combatRefs.CardCostUtils || refs.CardCostUtils,
        classMechanics: combatRefs.ClassMechanics || refs.ClassMechanics,
        showEchoBurstOverlay: combatRefs.showEchoBurstOverlay || refs.showEchoBurstOverlay,
        showDmgPopup: combatRefs.showDmgPopup || refs.showDmgPopup,
        shuffleArray: (arr) => refs.RandomUtils?.shuffleArray?.(arr) || arr,
      };
    },

    event: eventContractBuilders.event,

    combatFlow: combatFlowContractBuilders.combatFlow,

    eventFlow: eventFlowContractBuilders.eventFlow,

    reward: () => {
      const refs = getRefs();
      const rewardRefs = refs.featureRefs?.reward || {};
      const screenRefs = refs.featureRefs?.screen || {};
      const showRewardScreenAction = rewardRefs.showRewardScreen || refs.showRewardScreen;
      const switchScreenAction = screenRefs.switchScreen || refs.switchScreen;
      const returnActions = createRewardReturnActions({
        returnToGame: (fromReward = false) => (rewardRefs.returnToGame || refs.returnToGame)?.(fromReward),
      });
      return {
        ...buildBaseDeps('run'),
        showGameplayScreen: () => switchScreenAction?.('game'),
        switchScreen: switchScreenAction,
        showRewardScreen: (mode = false) => {
          if (typeof showRewardScreenAction === 'function') {
            return showRewardScreenAction(mode);
          }
          return switchScreenAction?.('reward');
        },
        takeRewardCard: (cardId) => (rewardRefs.takeRewardCard || refs.takeRewardCard)?.(cardId),
        takeRewardItem: (itemKey) => (rewardRefs.takeRewardItem || refs.takeRewardItem)?.(itemKey),
        takeRewardUpgrade: () => (rewardRefs.takeRewardUpgrade || refs.takeRewardUpgrade)?.(),
        takeRewardRemove: () => (rewardRefs.takeRewardRemove || refs.takeRewardRemove)?.(),
        showSkipConfirm: () => (rewardRefs.showSkipConfirm || refs.showSkipConfirm)?.(),
        hideSkipConfirm: () => (rewardRefs.hideSkipConfirm || refs.hideSkipConfirm)?.(),
        skipReward: () => (rewardRefs.skipReward || refs.skipReward)?.(),
        ...returnActions,
        showItemToast: rewardRefs.showItemToast || refs.showItemToast,
        tooltipUI: refs.TooltipUI,
        TooltipUI: refs.TooltipUI,
        descriptionUtils: refs.DescriptionUtils,
        DescriptionUtils: refs.DescriptionUtils,
        playItemGet: () => playUiItemGet(refs.AudioEngine),
      };
    },

    rewardFlow: rewardFlowContractBuilders.rewardFlow,

    runReturn: runReturnContractBuilders.runReturn,

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
