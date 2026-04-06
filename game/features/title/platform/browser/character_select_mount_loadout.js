import { CARDS } from '../../../../shared/cards/card_data.js';
import {
  buildClassLoadoutCustomizationPresentation,
  getUnlockedContent,
  setActiveClassLoadoutPresetSlot,
  saveLevel11LoadoutPreset,
  saveLevel12LoadoutPreset,
  UNLOCKABLES,
} from '../../integration/meta_progression_capabilities.js';

export function buildCharacterSelectLoadoutPayload(ch, presentation, deps = {}) {
  const meta = deps?.gs?.meta;
  const itemCatalog = deps?.data?.items || {};
  const dataCards = deps?.data?.cards || CARDS;
  const dataUpgradeMap = deps?.data?.upgradeMap || {};
  const dataStartDecks = deps?.data?.startDecks || {
    [ch.class]: ch.startDeck,
  };
  const unlockedCardIds = getUnlockedContent(meta, { type: 'card', classId: ch.class });
  const unlockedRelicIds = getUnlockedContent(meta, { type: 'relic', classId: ch.class });
  const classScopedCardIds = Object.values(UNLOCKABLES.cards || {})
    .filter((entry) => entry?.scope === 'class' && entry.classId === ch.class)
    .map((entry) => entry.id);
  const classScopedRelicIds = Object.values(UNLOCKABLES.relics || {})
    .filter((entry) => entry?.scope === 'class')
    .map((entry) => entry.id);
  const customization = buildClassLoadoutCustomizationPresentation(deps?.gs?.meta, ch.class, {
    classLevel: presentation.classProgress.level,
    classMeta: {
      class: ch.class,
      startDeck: ch.startDeck,
      startRelic: ch.startRelicId,
    },
    data: {
      cards: dataCards,
      items: itemCatalog,
      startDecks: dataStartDecks,
      upgradeMap: dataUpgradeMap,
      unlockedCardIds,
      unlockedRelicIds,
      classScopedCardIds,
      classScopedRelicIds,
    },
  });
  const previewRelics = customization.previewRelicIds
    .map((relicId) => {
      const relic = itemCatalog[relicId];
      if (!relic && relicId === ch.startRelicId) {
        return {
          id: relicId,
          icon: ch.startRelic?.icon || '?',
          name: ch.startRelic?.name || relicId,
          desc: ch.startRelic?.desc || 'Data unavailable',
        };
      }
      if (!relic) return { id: relicId, icon: '?', name: relicId, desc: 'Data unavailable' };
      return {
        id: relicId,
        icon: relic.icon || '?',
        name: relic.name || relicId,
        desc: relic.desc || 'Data unavailable',
      };
    })
    .filter(Boolean);

  return {
    customization: {
      ...customization,
      previewRelics,
      eligibleSwapAddCards: customization.eligibleSwapAddCardIds.map((cardId) => ({
        cardId,
        name: dataCards[cardId]?.name || cardId,
      })),
      eligibleBonusRelics: customization.eligibleBonusRelicIds.map((relicId) => ({
        id: relicId,
        name: itemCatalog[relicId]?.name || relicId,
      })),
    },
    dataCards,
    dataStartDecks,
    dataUpgradeMap,
    itemCatalog,
  };
}

export function saveCharacterSelectLoadoutPreset({
  ch,
  deps = {},
  payload,
  presentation,
  dataCards,
  dataStartDecks,
  dataUpgradeMap,
  itemCatalog,
}) {
  if (!payload?.slot) return false;

  const sharedArgs = {
    classLevel: presentation.classProgress.level,
    classMeta: {
      class: ch.class,
      startDeck: ch.startDeck,
      startRelic: ch.startRelicId,
    },
    data: {
      cards: dataCards,
      items: itemCatalog,
      startDecks: dataStartDecks,
      upgradeMap: dataUpgradeMap,
    },
  };

  if (payload.slot === 'level11') {
    saveLevel11LoadoutPreset(deps?.gs?.meta, ch.class, payload, sharedArgs);
    return true;
  }

  if (payload.slot === 'level12') {
    saveLevel12LoadoutPreset(deps?.gs?.meta, ch.class, payload.bonusRelicId, sharedArgs);
    return true;
  }

  return false;
}

export function clearCharacterSelectLoadoutPreset(gs, classId, slot) {
  const presets = gs?.meta?.classProgress?.loadoutPresets?.[classId];
  if (!presets || (slot !== 'level11' && slot !== 'level12')) return false;
  const activeSlot = String(presets.activeSlot || 'slot1');
  if (presets.slotEntries?.[activeSlot]) {
    presets.slotEntries[activeSlot][slot] = null;
    presets.level11 = presets.slotEntries[activeSlot].level11 || null;
    presets.level12 = presets.slotEntries[activeSlot].level12 || null;
    return true;
  }
  presets[slot] = null;
  return true;
}

export function selectCharacterSelectLoadoutPresetSlot(gs, classId, slotId) {
  return !!setActiveClassLoadoutPresetSlot(gs?.meta, classId, slotId);
}
