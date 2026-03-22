export function getDoc(deps) {
  return deps?.doc || deps?.win?.document || null;
}

export function getGS(deps) {
  return deps?.gs;
}

export function getData(deps) {
  return deps?.data;
}

export function resolveCurrentNodeType(gs) {
  return gs?.currentNode?.type || null;
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

function drawRandomRewardCardId(data, rarity = 'common', used = new Set()) {
  const allCards = Object.values(data?.cards || {});
  const pickFromPool = (targetRarity) => allCards
    .filter((card) => card?.rarity === targetRarity && !card?.upgraded && !used.has(card.id))
    .map((card) => card.id);

  const pool = pickFromPool(rarity);
  if (pool.length > 0) {
    return pool[Math.floor(Math.random() * pool.length)] || null;
  }

  const commonPool = pickFromPool('common');
  return commonPool[Math.floor(Math.random() * commonPool.length)] || null;
}

export function drawRewardCards(gs, count, rarities, data = null) {
  const out = [];
  const used = new Set();
  for (let i = 0; i < count; i += 1) {
    const rarity = rarities[Math.min(i, rarities.length - 1)] || 'common';
    let cardId = gs.getRandomCard?.(rarity) || drawRandomRewardCardId(data, rarity, used);
    let guard = 0;
    while (cardId && used.has(cardId) && guard < 10) {
      cardId = gs.getRandomCard?.(rarity) || drawRandomRewardCardId(data, rarity, used);
      guard += 1;
    }
    if (!cardId) continue;
    used.add(cardId);
    out.push(cardId);
  }
  return out;
}
