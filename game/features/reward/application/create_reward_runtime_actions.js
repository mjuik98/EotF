import { createRewardNavigationActions } from './reward_navigation_actions.js';
import { createRewardRuntimeActionPorts } from '../ports/create_reward_runtime_action_ports.js';

export function createRewardActions(modules, ports) {
  const navigation = createRewardNavigationActions(modules, ports);
  const runtimePorts = ports.getRewardRuntimeActionPorts?.()
    || createRewardRuntimeActionPorts(modules, ports);

  return {
    showRewardScreen(isBoss) {
      return runtimePorts.showRewardScreen?.(isBoss);
    },

    openReward(mode = false) {
      return runtimePorts.openReward?.(mode);
    },

    takeRewardCard(cardId) {
      return runtimePorts.takeRewardCard?.(cardId);
    },

    takeRewardItem(itemKey) {
      return runtimePorts.takeRewardItem?.(itemKey);
    },

    takeRewardUpgrade() {
      return runtimePorts.takeRewardUpgrade?.();
    },

    takeRewardRemove() {
      return runtimePorts.takeRewardRemove?.();
    },

    showSkipConfirm() {
      return runtimePorts.showSkipConfirm?.();
    },

    hideSkipConfirm() {
      return runtimePorts.hideSkipConfirm?.();
    },

    skipReward() {
      return runtimePorts.skipReward?.();
    },

    returnFromReward: navigation.returnFromReward,

    returnToGame: navigation.returnToGame,
  };
}
