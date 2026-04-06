export function resolveEventShopMaxEnergyCap({
  overrideCap,
  configCap,
  fallbackCap = 5,
} = {}) {
  const normalizedOverrideCap = Number(overrideCap);
  if (Number.isFinite(normalizedOverrideCap) && normalizedOverrideCap >= 1) {
    return Math.floor(normalizedOverrideCap);
  }

  const normalizedConfigCap = Number(configCap);
  if (Number.isFinite(normalizedConfigCap) && normalizedConfigCap >= 1) {
    return Math.floor(normalizedConfigCap);
  }

  return fallbackCap;
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
