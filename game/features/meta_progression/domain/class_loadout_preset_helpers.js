import { CLASS_CARD_POOLS } from './class_loadout_preset_catalog.js';

export function cloneLevel12Preset(preset) {
  const bonusRelicId = String(preset?.bonusRelicId || '');
  return bonusRelicId ? { bonusRelicId } : null;
}

export function cloneLevel11Preset(preset) {
  if (!preset || typeof preset !== 'object') return null;
  if (preset.type === 'upgrade') {
    return {
      type: 'upgrade',
      targetIndex: Math.max(0, Math.floor(Number(preset.targetIndex) || 0)),
      cardId: String(preset.cardId || ''),
    };
  }
  if (preset.type === 'swap') {
    return {
      type: 'swap',
      removeIndex: Math.max(0, Math.floor(Number(preset.removeIndex) || 0)),
      removeCardId: String(preset.removeCardId || ''),
      addCardId: String(preset.addCardId || ''),
    };
  }
  return null;
}

export function clonePresetEntry(entry) {
  return {
    level11: cloneLevel11Preset(entry?.level11),
    level12: cloneLevel12Preset(entry?.level12),
  };
}

export function buildLevel11PresetSummary(preset, data) {
  if (!preset) return '';
  if (preset.type === 'upgrade') {
    const cardName = data?.cards?.[preset.cardId]?.name || preset.cardId;
    return `${cardName} 강화`;
  }
  if (preset.type === 'swap') {
    const fromName = data?.cards?.[preset.removeCardId]?.name || preset.removeCardId;
    const toName = data?.cards?.[preset.addCardId]?.name || preset.addCardId;
    return `${fromName}→${toName}`;
  }
  return '';
}

export function buildLevel12PresetSummary(preset, data) {
  if (!preset?.bonusRelicId) return '';
  const relicName = data?.items?.[preset.bonusRelicId]?.name || preset.bonusRelicId;
  return `+${relicName}`;
}

export function buildCardSummaryLine(level11Summary, level12Summary, hasInvalidPreset) {
  if (hasInvalidPreset) return '프리셋 확인 필요';
  return [level11Summary, level12Summary].filter(Boolean).join(' | ');
}

export function toSet(value) {
  if (value instanceof Set) return value;
  if (Array.isArray(value)) return new Set(value);
  return new Set();
}

export function buildUpgradeReverseMap(data) {
  return Object.entries(data?.upgradeMap || {}).reduce((acc, [baseId, upgradedId]) => {
    acc[String(upgradedId)] = String(baseId);
    return acc;
  }, {});
}

export function resolveBaseCardId(cardId, data) {
  const key = String(cardId || '');
  if (!key) return '';
  const reverseMap = buildUpgradeReverseMap(data);
  return reverseMap[key] || key;
}

export function getCodex(meta, data) {
  const rawCodex = meta?.codex || {};
  return {
    cards: new Set(Array.from(toSet(rawCodex.cards)).map((cardId) => resolveBaseCardId(cardId, data)).filter(Boolean)),
    items: toSet(rawCodex.items),
  };
}

export function getEligibleUpgradeTargets(baseDeck, data) {
  return baseDeck
    .map((cardId, index) => ({ index, cardId: String(cardId || '') }))
    .filter(({ cardId }) => !!data?.upgradeMap?.[cardId]);
}

export function getEligibleSwapAddCardIds(meta, classId, data) {
  const codex = getCodex(meta, data);
  const unlockedCards = new Set(
    (Array.isArray(data?.unlockedCardIds) ? data.unlockedCardIds : [])
      .map((cardId) => resolveBaseCardId(cardId, data))
      .filter(Boolean),
  );
  const restrictedCards = new Set(
    (Array.isArray(data?.classScopedCardIds) ? data.classScopedCardIds : [])
      .map((cardId) => resolveBaseCardId(cardId, data))
      .filter(Boolean),
  );
  const pool = new Set(CLASS_CARD_POOLS[String(classId)] || []);
  return Array.from(new Set([...codex.cards, ...unlockedCards]))
    .map((cardId) => resolveBaseCardId(cardId, data))
    .filter((cardId) => pool.has(cardId))
    .filter((cardId) => !restrictedCards.has(cardId) || unlockedCards.has(cardId))
    .filter((cardId) => !!data?.cards?.[cardId] && !data.cards[cardId].upgraded)
    .sort();
}

export function getEligibleBonusRelicIds(meta, baseRelicId, data) {
  const codex = getCodex(meta, data);
  const unlockedRelics = new Set(
    (Array.isArray(data?.unlockedRelicIds) ? data.unlockedRelicIds : [])
      .map((itemId) => String(itemId || ''))
      .filter(Boolean),
  );
  const restrictedRelics = new Set(
    (Array.isArray(data?.classScopedRelicIds) ? data.classScopedRelicIds : [])
      .map((itemId) => String(itemId || ''))
      .filter(Boolean),
  );
  return Array.from(new Set([...codex.items, ...unlockedRelics]))
    .map((itemId) => String(itemId || ''))
    .filter((itemId) => !!data?.items?.[itemId])
    .filter((itemId) => !restrictedRelics.has(itemId) || unlockedRelics.has(itemId))
    .filter((itemId) => itemId !== baseRelicId)
    .sort();
}

export function applyLevel11Preset(baseDeck, preset, data) {
  const deck = [...baseDeck];
  if (!preset) return deck;

  if (preset.type === 'upgrade') {
    if (deck[preset.targetIndex] !== preset.cardId) return deck;
    const upgradedId = data?.upgradeMap?.[preset.cardId];
    if (!upgradedId) return deck;
    deck[preset.targetIndex] = upgradedId;
    return deck;
  }

  if (preset.type === 'swap') {
    if (deck[preset.removeIndex] !== preset.removeCardId) return deck;
    deck[preset.removeIndex] = preset.addCardId;
    return deck;
  }

  return deck;
}
