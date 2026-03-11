import { playUiItemGetFeedback } from '../../../domain/audio/audio_event_helpers.js';
import { registerCardDiscovered, registerItemFound } from '../../../systems/codex_records_system.js';
import { getRewardMaxEnergyCap } from './build_reward_options_use_case.js';

export function playRewardClaimFeedback(deps = {}) {
  return playUiItemGetFeedback(deps.playItemGet, deps.audioEngine);
}

export function ensureMiniBossBonus(gs, data, deps = {}) {
  const heal = Math.max(1, Math.floor((gs.player.maxHp || 1) * 0.15));
  const hpBefore = gs.player.hp || 0;
  gs.player.hp = Math.min(gs.player.maxHp || 1, hpBefore + heal);

  const goldGain = Math.max(12, Math.floor((gs.currentRegion + 1) * 6));
  gs.player.gold = (gs.player.gold || 0) + goldGain;
  gs.addLog?.(`Mini-boss reward: +${goldGain} gold, +${gs.player.hp - hpBefore} HP`, 'system');

  const rareItems = Object.values(data.items || {}).filter((item) => {
    const isRareEnough = item.rarity === 'rare' || item.rarity === 'legendary';
    return isRareEnough && !(gs.player.items || []).includes(item.id);
  });
  if (rareItems.length === 0) return null;

  const guaranteed = rareItems[Math.floor(Math.random() * rareItems.length)];
  gs.player.items.push(guaranteed.id);
  registerItemFound(gs, guaranteed.id);
  playRewardClaimFeedback(deps);
  deps.showItemToast?.(guaranteed, { forceQueue: true });
  gs.addLog?.(`Mini-boss relic: ${guaranteed.icon || '@'} ${guaranteed.name}`, 'system');
  return guaranteed;
}

export function claimReward({
  gs,
  data,
  rewardType,
  rewardId,
  context = {},
} = {}) {
  if (!gs) return { success: false };

  if (rewardType === 'blessing') {
    const blessing = rewardId;
    if (blessing?.type === 'energy' && (gs.player.maxEnergy || 0) >= getRewardMaxEnergyCap(gs)) {
      return { success: false, reason: 'max-energy' };
    }

    if (blessing?.type === 'hp') {
      if (typeof gs.dispatch === 'function') gs.dispatch('player:max-hp-growth', { amount: blessing.amount });
      else gs.player.maxHp = (gs.player.maxHp || 0) + blessing.amount;
    }

    if (blessing?.type === 'energy') {
      if (typeof gs.dispatch === 'function') gs.dispatch('player:max-energy-growth', { amount: blessing.amount });
      else gs.player.maxEnergy = (gs.player.maxEnergy || 0) + blessing.amount;
    }

    return {
      success: true,
      notification: { payload: { name: blessing.name, icon: blessing.icon, desc: blessing.desc } },
      updatedState: gs,
    };
  }

  if (rewardType === 'card') {
    gs.player.deck.unshift(rewardId);
    registerCardDiscovered(gs, rewardId);
    const card = data?.cards?.[rewardId];
    return {
      success: true,
      notification: { payload: { name: card?.name || rewardId, icon: card?.icon || '*', desc: card?.desc || '' } },
      updatedState: gs,
    };
  }

  if (rewardType === 'item') {
    gs.player.items.push(rewardId);
    registerItemFound(gs, rewardId);

    const item = data?.items?.[rewardId];
    if (item && typeof item.onAcquire === 'function') item.onAcquire(gs);
    return {
      success: true,
      notification: { payload: item, options: { forceQueue: true } },
      updatedState: gs,
    };
  }

  if (rewardType === 'upgrade') {
    const upgradable = (gs.player.deck || []).filter((id) => data?.upgradeMap?.[id]);
    if (!upgradable.length) {
      return { success: false, reason: 'no-upgrade-target' };
    }

    const cardId = upgradable[Math.floor(Math.random() * upgradable.length)];
    const upgradedId = data.upgradeMap[cardId];
    const idx = gs.player.deck.indexOf(cardId);
    if (idx >= 0) gs.player.deck[idx] = upgradedId;
    registerCardDiscovered(gs, upgradedId);

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

  return { success: false, reason: 'unsupported-reward', context };
}
