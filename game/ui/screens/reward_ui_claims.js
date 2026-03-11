import { playUiItemGetFeedback } from '../../domain/audio/audio_event_helpers.js';
import { registerCardDiscovered, registerItemFound } from '../../systems/codex_records_system.js';

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
  if (rareItems.length === 0) return;

  const guaranteed = rareItems[Math.floor(Math.random() * rareItems.length)];
  gs.player.items.push(guaranteed.id);
  registerItemFound(gs, guaranteed.id);
  playUiItemGetFeedback(deps.playItemGet, deps.audioEngine);
  deps.showItemToast?.(guaranteed, { forceQueue: true });
  gs.addLog?.(`Mini-boss relic: ${guaranteed.icon || '@'} ${guaranteed.name}`, 'system');
}

export function applyRewardBlessing(gs, blessing) {
  if (blessing.type === 'hp') {
    if (typeof gs.dispatch === 'function') gs.dispatch('player:max-hp-growth', { amount: blessing.amount });
    else gs.player.maxHp = (gs.player.maxHp || 0) + blessing.amount;
    return;
  }

  if (blessing.type === 'energy') {
    if (typeof gs.dispatch === 'function') gs.dispatch('player:max-energy-growth', { amount: blessing.amount });
    else gs.player.maxEnergy = (gs.player.maxEnergy || 0) + blessing.amount;
  }
}

export function applyRewardCard(gs, data, cardId) {
  gs.player.deck.unshift(cardId);
  registerCardDiscovered(gs, cardId);
  return data.cards?.[cardId];
}

export function applyRewardItem(gs, data, itemKey) {
  gs.player.items.push(itemKey);
  registerItemFound(gs, itemKey);

  const item = data.items?.[itemKey];
  if (item && typeof item.onAcquire === 'function') item.onAcquire(gs);
  return item;
}

export function applyRewardUpgrade(gs, data) {
  const upgradable = (gs.player.deck || []).filter((id) => data.upgradeMap?.[id]);
  if (!upgradable.length) return null;

  const cardId = upgradable[Math.floor(Math.random() * upgradable.length)];
  const upgradedId = data.upgradeMap[cardId];
  const idx = gs.player.deck.indexOf(cardId);
  if (idx >= 0) gs.player.deck[idx] = upgradedId;
  registerCardDiscovered(gs, upgradedId);
  return upgradedId;
}
