import { playUiItemGet } from '../../../domain/audio/audio_event_helpers.js';
import { createRewardReturnActions } from '../../../shared/runtime/reward_return_actions.js';
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

    event: eventContractBuilders.event,

    combatFlow: combatFlowContractBuilders.combatFlow,

    eventFlow: eventFlowContractBuilders.eventFlow,

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
