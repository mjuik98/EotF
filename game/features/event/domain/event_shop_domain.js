import { CONSTANTS } from '../../../data/constants.js';

export function getEventShopMaxEnergyCap(state) {
  const overrideCap = Number(state?.player?.maxEnergyCap);
  if (Number.isFinite(overrideCap) && overrideCap >= 1) return Math.floor(overrideCap);
  const configCap = Number(CONSTANTS?.PLAYER?.MAX_ENERGY_CAP);
  if (Number.isFinite(configCap) && configCap >= 1) return Math.floor(configCap);
  return 5;
}

export function pickRandomBaseCardId(data = {}) {
  const cardPool = Object.values(data?.cards || {})
    .filter((card) => card && !card.upgraded)
    .map((card) => card.id)
    .filter(Boolean);

  if (!cardPool.length) return null;
  return cardPool[Math.floor(Math.random() * cardPool.length)];
}

export function pickRandomUpgradeableCardId(player = {}, upgradeMap = {}) {
  const upgradable = (player.deck || []).filter((id) => upgradeMap?.[id]);
  if (!upgradable.length) return null;
  return upgradable[Math.floor(Math.random() * upgradable.length)];
}

export function hasRestorableStagnationCards(state) {
  return Array.isArray(state?._stagnationVault) && state._stagnationVault.length > 0;
}
