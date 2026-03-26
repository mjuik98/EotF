import { playUiItemGet } from '../../audio_feedback_support_capabilities.js';
import { createRewardReturnActions } from '../../reward_return_support_capabilities.js';

export function buildRewardContract(ctx) {
  const {
    getRefs,
    buildBaseDeps,
  } = ctx;
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
}
