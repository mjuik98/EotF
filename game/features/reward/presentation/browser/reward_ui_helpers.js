import { getRewardMaxEnergyCap } from '../../application/build_reward_options_use_case.js';
import { RARITY_LABELS } from '../../ports/reward_ui_view_ports.js';
import { isContentAvailable } from '../../../meta_progression/public.js';
import {
  drawRewardCards,
  getData,
  getDoc,
  getGS,
  normalizeRewardMode,
  resolveRewardCardConfig,
} from './reward_screen_runtime_helpers.js';

export {
  drawRewardCards,
  getData,
  getDoc,
  getGS,
  normalizeRewardMode,
  resolveRewardCardConfig,
};

export function getMaxEnergyCap(gs) {
  return getRewardMaxEnergyCap(gs);
}

export function getDescriptionUtils(deps) {
  return deps?.descriptionUtils || deps?.DescriptionUtils || null;
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

function isItemObtainableFrom(item, source = 'reward') {
  const routes = item?.obtainableFrom;
  if (!Array.isArray(routes) || routes.length === 0) return true;
  return routes.includes(source);
}

export function getRewardItemPool(gs, data, source = 'reward') {
  return Object.values(data.items || {}).filter((item) => {
    return !(gs.player.items || []).includes(item.id)
      && isItemObtainableFrom(item, source)
      && isContentAvailable(gs?.meta, {
        type: 'relic',
        id: item.id,
        classId: gs?.player?.class,
      });
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
