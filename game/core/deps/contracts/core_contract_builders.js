import { playUiItemGet } from '../../../domain/audio/audio_event_helpers.js';
import { buildEventContractPublicBuilders } from '../../../features/event/public.js';
import { buildRunReturnContractPublicBuilders } from '../../../features/run/contracts/public_run_contract_builders.js';
import { buildTitleStoryContractBuilders } from '../../../features/title/ports/contracts/build_title_story_contracts.js';
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
  const eventContractBuilders = buildEventContractPublicBuilders(ctx);
  const runReturnContractBuilders = buildRunReturnContractPublicBuilders(ctx);
  const titleContractBuilders = buildTitleStoryContractBuilders(ctx);

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
