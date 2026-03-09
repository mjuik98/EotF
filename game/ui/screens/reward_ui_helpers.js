import { CONSTANTS } from '../../data/constants.js';
import { RARITY_LABELS } from '../../../data/rarity_meta.js';

export const RELIC_REWARD_CHANCE_NORMAL = 0;
export const RELIC_REWARD_CHANCE_ELITE = 0.1;
export const RELIC_REWARD_CHANCE_MINIBOSS = 0.25;
export const RELIC_REWARD_CHANCE_BOSS = 0.5;

export function getDoc(deps) {
  return deps?.doc || document;
}

export function getGS(deps) {
  return deps?.gs;
}

export function getData(deps) {
  return deps?.data;
}

export function getMaxEnergyCap(gs) {
  const overrideCap = Number(gs?.player?.maxEnergyCap);
  if (Number.isFinite(overrideCap) && overrideCap >= 1) return Math.floor(overrideCap);
  const configCap = Number(CONSTANTS?.PLAYER?.MAX_ENERGY_CAP);
  if (Number.isFinite(configCap) && configCap >= 1) return Math.floor(configCap);
  return 5;
}

export function getDescriptionUtils(deps) {
  return deps?.DescriptionUtils || globalThis.DescriptionUtils || null;
}

export function normalizeRewardMode(mode) {
  if (mode === true) return 'boss';
  if (mode === false || mode == null) return 'normal';
  if (typeof mode === 'string') return mode;
  return 'normal';
}

export function resolveRewardCardConfig(rewardMode, isElite) {
  if (rewardMode === 'boss') {
    return {
      count: 4,
      rarities: ['uncommon', 'uncommon', 'rare', 'rare'],
    };
  }
  if (rewardMode === 'mini_boss') {
    return {
      count: 2,
      rarities: ['uncommon', 'rare'],
    };
  }
  return {
    count: 3,
    rarities: isElite ? ['uncommon', 'uncommon', 'rare'] : ['common', 'uncommon', 'common'],
  };
}

export function drawRewardCards(gs, count, rarities) {
  const out = [];
  const used = new Set();
  for (let i = 0; i < count; i += 1) {
    const rarity = rarities[Math.min(i, rarities.length - 1)] || 'common';
    let cardId = gs.getRandomCard?.(rarity);
    let guard = 0;
    while (cardId && used.has(cardId) && guard < 10) {
      cardId = gs.getRandomCard?.(rarity);
      guard += 1;
    }
    if (!cardId) continue;
    used.add(cardId);
    out.push(cardId);
  }
  return out;
}

export function toRarityLabel(rarity) {
  const key = String(rarity || 'common');
  return RARITY_LABELS[key] || RARITY_LABELS.common;
}

export function toTypeClass(type) {
  if (!type) return '';
  const value = String(type).toLowerCase();
  if (value === 'attack') return 'type-attack';
  if (value === 'skill') return 'type-skill';
  if (value === 'power') return 'type-power';
  return '';
}

export function isItemObtainableFrom(item, source = 'reward') {
  const routes = item?.obtainableFrom;
  if (!Array.isArray(routes) || routes.length === 0) return true;
  return routes.includes(source);
}

export function getRewardItemPool(gs, data, source = 'reward') {
  return Object.values(data.items || {}).filter((item) => {
    return !(gs.player.items || []).includes(item.id) && isItemObtainableFrom(item, source);
  });
}

export function drawUniqueItems(pool, count) {
  if (!Array.isArray(pool) || pool.length === 0 || count <= 0) return [];
  const available = [...pool];
  const picked = [];
  const target = Math.min(available.length, Math.max(0, Math.floor(count)));
  for (let i = 0; i < target; i += 1) {
    const idx = Math.floor(Math.random() * available.length);
    const [item] = available.splice(idx, 1);
    if (item) picked.push(item);
  }
  return picked;
}

export function markRewardSelection(container, wrapper) {
  if (!container || !wrapper) return;
  container
    .querySelectorAll('.reward-card-wrapper.selected')
    .forEach((el) => el.classList.remove('selected'));
  wrapper.classList.add('selected');
}
