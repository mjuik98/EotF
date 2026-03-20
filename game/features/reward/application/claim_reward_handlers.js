import {
  addRewardCardToDeck,
  addRewardItemToInventory,
  applyBlessingRewardState,
  upgradeRandomRewardCardState,
} from '../state/reward_state_commands.js';
import { getRewardMaxEnergyCap } from './build_reward_options_use_case.js';

function claimBlessingReward({ gs, rewardId }) {
  const blessing = rewardId;
  const maxEnergy = gs?.player?.maxEnergy || 0;
  if (blessing?.type === 'energy' && maxEnergy >= getRewardMaxEnergyCap(gs)) {
    return { success: false, reason: 'max-energy' };
  }

  applyBlessingRewardState(gs, blessing);

  return {
    success: true,
    notification: { payload: { name: blessing.name, icon: blessing.icon, desc: blessing.desc } },
    updatedState: gs,
  };
}

function claimCardReward({ data, gs, rewardId }) {
  addRewardCardToDeck(gs, rewardId);
  const card = data?.cards?.[rewardId];
  return {
    success: true,
    notification: { payload: { name: card?.name || rewardId, icon: card?.icon || '*', desc: card?.desc || '' } },
    updatedState: gs,
  };
}

function claimItemReward({ data, gs, rewardId }) {
  const item = data?.items?.[rewardId];
  addRewardItemToInventory(gs, rewardId, item);
  return {
    success: true,
    notification: { payload: item, options: { forceQueue: true } },
    updatedState: gs,
  };
}

function claimUpgradeReward({ data, gs }) {
  const deck = gs?.player?.deck || [];
  const upgradable = deck.filter((id) => data?.upgradeMap?.[id]);
  if (!upgradable.length) {
    return { success: false, reason: 'no-upgrade-target' };
  }

  const upgradedId = upgradeRandomRewardCardState(gs, data);
  if (!upgradedId) {
    return { success: false, reason: 'no-upgrade-target' };
  }

  return {
    success: true,
    notification: {
      payload: {
        name: `Upgrade complete: ${data.cards?.[upgradedId]?.name || upgradedId}`,
        icon: 'UP',
        desc: 'A random card has been upgraded.',
      },
    },
    updatedState: gs,
    rewardId: upgradedId,
  };
}

export function claimRewardByType({
  context = {},
  data,
  gs,
  rewardId,
  rewardType,
} = {}) {
  if (rewardType === 'blessing') {
    return claimBlessingReward({ gs, rewardId });
  }
  if (rewardType === 'card') {
    return claimCardReward({ data, gs, rewardId });
  }
  if (rewardType === 'item') {
    return claimItemReward({ data, gs, rewardId });
  }
  if (rewardType === 'upgrade') {
    return claimUpgradeReward({ data, gs });
  }

  return { success: false, reason: 'unsupported-reward', context };
}
