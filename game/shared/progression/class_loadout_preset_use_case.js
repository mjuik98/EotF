const EMPTY_PRESET = Object.freeze({
  level11: null,
  level12: null,
});

const CLASS_CARD_POOLS = Object.freeze({
  swordsman: Object.freeze([
    'foot_step',
    'twin_strike',
    'acceleration',
    'charge',
    'afterimage',
    'blade_dance',
    'echo_dance',
    'phantom_blade',
    'vibrations_end',
  ]),
  mage: Object.freeze([
    'foresight',
    'time_echo',
    'void_mirror',
    'prediction',
    'temporal_echo',
    'arcane_storm',
    'time_warp',
  ]),
  hunter: Object.freeze([
    'silent_stab',
    'vanish',
    'counter',
    'death_mark',
    'shadow_step',
    'poison_blade',
    'phantom_step',
    'silent_strike',
    'focus',
    'combat_frenzy',
    'vampiric_touch',
    'spike_shield',
  ]),
  paladin: Object.freeze([
    'holy_strike',
    'divine_grace',
    'brand_of_light',
    'blessing_of_light',
    'hallowed_ground',
    'retribution',
    'divine_aura',
    'judgement',
  ]),
  berserker: Object.freeze([
    'blood_fury',
    'reckless_swing',
    'battle_dance',
    'berserk_mode',
    'abyssal_thirst',
    'frenzy_strike',
    'endure',
    'blood_contract',
    'wild_slash',
  ]),
  guardian: Object.freeze([
    'iron_defense',
    'shield_slam',
    'resonant_shield',
    'unbreakable_wall',
    'bastion',
    'iron_spikes',
    'fortify',
    'impulse',
  ]),
});

function ensureClassProgressContainer(meta) {
  if (!meta || typeof meta !== 'object') return null;
  if (!meta.classProgress || typeof meta.classProgress !== 'object' || Array.isArray(meta.classProgress)) {
    meta.classProgress = {};
  }
  const cp = meta.classProgress;
  if (!cp.levels || typeof cp.levels !== 'object' || Array.isArray(cp.levels)) cp.levels = {};
  if (!cp.xp || typeof cp.xp !== 'object' || Array.isArray(cp.xp)) cp.xp = {};
  if (!Array.isArray(cp.pendingSummaries)) cp.pendingSummaries = [];
  if (!cp.loadoutPresets || typeof cp.loadoutPresets !== 'object' || Array.isArray(cp.loadoutPresets)) {
    cp.loadoutPresets = {};
  }
  return cp;
}

function cloneLevel12Preset(preset) {
  const bonusRelicId = String(preset?.bonusRelicId || '');
  return bonusRelicId ? { bonusRelicId } : null;
}

function cloneLevel11Preset(preset) {
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

function clonePresetEntry(entry) {
  return {
    level11: cloneLevel11Preset(entry?.level11),
    level12: cloneLevel12Preset(entry?.level12),
  };
}

function buildLevel11PresetSummary(preset, data) {
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

function buildLevel12PresetSummary(preset, data) {
  if (!preset?.bonusRelicId) return '';
  const relicName = data?.items?.[preset.bonusRelicId]?.name || preset.bonusRelicId;
  return `+${relicName}`;
}

function buildCardSummaryLine(level11Summary, level12Summary, hasInvalidPreset) {
  if (hasInvalidPreset) return '프리셋 확인 필요';
  return [level11Summary, level12Summary].filter(Boolean).join(' | ');
}

function ensurePresetEntry(meta, classId) {
  const cp = ensureClassProgressContainer(meta);
  if (!cp || !classId) return null;
  const key = String(classId);
  const current = cp.loadoutPresets[key];
  const normalized = clonePresetEntry(current || EMPTY_PRESET);
  cp.loadoutPresets[key] = normalized;
  return normalized;
}

function readPresetEntry(meta, classId) {
  const key = String(classId || '');
  const current = meta?.classProgress?.loadoutPresets?.[key];
  return clonePresetEntry(current || EMPTY_PRESET);
}

function getClassMasteryLevel(meta, classId, overrideLevel) {
  const explicit = Number(overrideLevel);
  if (Number.isFinite(explicit)) return Math.max(1, Math.floor(explicit));
  const cp = ensureClassProgressContainer(meta);
  return Math.max(1, Math.floor(Number(cp?.levels?.[classId]) || 1));
}

function getBaseStartDeck(classId, classMeta, data) {
  const fromData = data?.startDecks?.[classId];
  if (Array.isArray(fromData) && fromData.length > 0) return [...fromData];
  if (Array.isArray(classMeta?.startDeck) && classMeta.startDeck.length > 0) return [...classMeta.startDeck];
  return [];
}

function getBaseStartRelicId(classMeta) {
  return String(classMeta?.startRelic || '');
}

function toSet(value) {
  if (value instanceof Set) return value;
  if (Array.isArray(value)) return new Set(value);
  return new Set();
}

function buildUpgradeReverseMap(data) {
  return Object.entries(data?.upgradeMap || {}).reduce((acc, [baseId, upgradedId]) => {
    acc[String(upgradedId)] = String(baseId);
    return acc;
  }, {});
}

function resolveBaseCardId(cardId, data) {
  const key = String(cardId || '');
  if (!key) return '';
  const reverseMap = buildUpgradeReverseMap(data);
  return reverseMap[key] || key;
}

function getCodex(meta, data) {
  const rawCodex = meta?.codex || {};
  return {
    cards: new Set(Array.from(toSet(rawCodex.cards)).map((cardId) => resolveBaseCardId(cardId, data)).filter(Boolean)),
    items: toSet(rawCodex.items),
  };
}

function getEligibleUpgradeTargets(baseDeck, data) {
  return baseDeck
    .map((cardId, index) => ({ index, cardId: String(cardId || '') }))
    .filter(({ cardId }) => !!data?.upgradeMap?.[cardId]);
}

function getEligibleSwapAddCardIds(meta, classId, data) {
  const codex = getCodex(meta, data);
  const pool = new Set(CLASS_CARD_POOLS[String(classId)] || []);
  return Array.from(codex.cards)
    .map((cardId) => resolveBaseCardId(cardId, data))
    .filter((cardId) => pool.has(cardId))
    .filter((cardId) => !!data?.cards?.[cardId] && !data.cards[cardId].upgraded)
    .sort();
}

function getEligibleBonusRelicIds(meta, baseRelicId, data) {
  const codex = getCodex(meta, data);
  return Array.from(codex.items)
    .map((itemId) => String(itemId || ''))
    .filter((itemId) => !!data?.items?.[itemId])
    .filter((itemId) => itemId !== baseRelicId)
    .sort();
}

function validateLevel11Preset(meta, classId, input, options = {}) {
  const classLevel = getClassMasteryLevel(meta, classId, options.classLevel);
  if (classLevel < 11 || !input || typeof input !== 'object') return null;

  const baseDeck = getBaseStartDeck(classId, options.classMeta, options.data);
  if (baseDeck.length === 0) return null;

  if (input.type === 'upgrade') {
    const targetIndex = Math.floor(Number(input.targetIndex));
    const eligibleTargets = getEligibleUpgradeTargets(baseDeck, options.data);
    const target = eligibleTargets.find((entry) => entry.index === targetIndex);
    if (!target) return null;
    return {
      type: 'upgrade',
      targetIndex,
      cardId: target.cardId,
    };
  }

  if (input.type === 'swap') {
    const removeIndex = Math.floor(Number(input.removeIndex));
    const addCardId = resolveBaseCardId(input.addCardId, options.data);
    if (!Number.isInteger(removeIndex) || removeIndex < 0 || removeIndex >= baseDeck.length) return null;
    const eligibleAddCardIds = getEligibleSwapAddCardIds(meta, classId, options.data);
    if (!eligibleAddCardIds.includes(addCardId)) return null;
    return {
      type: 'swap',
      removeIndex,
      removeCardId: String(baseDeck[removeIndex] || ''),
      addCardId,
    };
  }

  return null;
}

function validateLevel12Preset(meta, classId, bonusRelicId, options = {}) {
  const classLevel = getClassMasteryLevel(meta, classId, options.classLevel);
  if (classLevel < 12) return null;
  const baseRelicId = getBaseStartRelicId(options.classMeta);
  const normalizedRelicId = String(bonusRelicId || '');
  if (!normalizedRelicId) return null;
  const eligibleRelicIds = getEligibleBonusRelicIds(meta, baseRelicId, options.data);
  if (!eligibleRelicIds.includes(normalizedRelicId)) return null;
  return { bonusRelicId: normalizedRelicId };
}

function applyLevel11Preset(baseDeck, preset, data) {
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

export function clearClassLoadoutPreset(meta, classId, slot) {
  const entry = ensurePresetEntry(meta, classId);
  if (!entry || (slot !== 'level11' && slot !== 'level12')) return null;
  entry[slot] = null;
  return entry;
}

export function saveLevel11LoadoutPreset(meta, classId, input, options = {}) {
  const entry = ensurePresetEntry(meta, classId);
  if (!entry) return null;
  const preset = validateLevel11Preset(meta, classId, input, options);
  if (!preset) return null;
  entry.level11 = preset;
  return preset;
}

export function saveLevel12LoadoutPreset(meta, classId, bonusRelicId, options = {}) {
  const entry = ensurePresetEntry(meta, classId);
  if (!entry) return null;
  const preset = validateLevel12Preset(meta, classId, bonusRelicId, options);
  if (!preset) return null;
  entry.level12 = preset;
  return preset;
}

export function resolveClassStartingLoadout(meta, classId, options = {}) {
  const baseDeck = getBaseStartDeck(classId, options.classMeta, options.data);
  const baseRelicId = getBaseStartRelicId(options.classMeta);
  const entry = readPresetEntry(meta, classId);

  const level11Preset = validateLevel11Preset(meta, classId, entry?.level11, options);
  const level12Preset = validateLevel12Preset(meta, classId, entry?.level12?.bonusRelicId, options);

  const deck = applyLevel11Preset(baseDeck, level11Preset, options.data);
  const relicIds = [baseRelicId].filter(Boolean);
  if (level12Preset?.bonusRelicId) relicIds.push(level12Preset.bonusRelicId);

  return {
    deck,
    relicIds,
    level11Preset,
    level12Preset,
  };
}

export function buildClassLoadoutCustomizationPresentation(meta, classId, options = {}) {
  const classLevel = getClassMasteryLevel(meta, classId, options.classLevel);
  const baseDeck = getBaseStartDeck(classId, options.classMeta, options.data);
  const baseRelicId = getBaseStartRelicId(options.classMeta);
  const savedPreset = readPresetEntry(meta, classId);
  const resolved = resolveClassStartingLoadout(meta, classId, options);
  const invalidWarnings = [];

  if (savedPreset?.level11 && !resolved.level11Preset) {
    invalidWarnings.push('Lv.11 시작 덱 프리셋을 적용할 수 없습니다. 저장된 설정을 확인하세요.');
  }
  if (savedPreset?.level12 && !resolved.level12Preset) {
    invalidWarnings.push('Lv.12 시작 유물 프리셋을 적용할 수 없습니다. 저장된 설정을 확인하세요.');
  }

  const hasInvalidPreset = invalidWarnings.length > 0;
  const level11Summary = buildLevel11PresetSummary(resolved.level11Preset, options.data);
  const level12Summary = buildLevel12PresetSummary(resolved.level12Preset, options.data);

  return {
    level11Unlocked: classLevel >= 11,
    level12Unlocked: classLevel >= 12,
    level11Preset: resolved.level11Preset,
    level12Preset: resolved.level12Preset,
    level11Summary,
    level12Summary,
    hasInvalidPreset,
    invalidWarnings,
    cardSummaryLine: buildCardSummaryLine(level11Summary, level12Summary, hasInvalidPreset),
    previewDeck: resolved.deck,
    previewRelicIds: resolved.relicIds,
    eligibleUpgradeTargets: getEligibleUpgradeTargets(baseDeck, options.data),
    eligibleSwapRemoveTargets: baseDeck.map((cardId, index) => ({ index, cardId: String(cardId || '') })),
    eligibleSwapAddCardIds: getEligibleSwapAddCardIds(meta, classId, options.data),
    eligibleBonusRelicIds: getEligibleBonusRelicIds(meta, baseRelicId, options.data),
  };
}
