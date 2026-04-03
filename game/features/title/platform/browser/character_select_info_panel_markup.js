export {
  arraysEqual,
  buildFeaturedCardMarkup,
  buildPlayStyleMarkup,
  inferFeaturedCardTag,
  normalizeRelicIds,
  resolveFeaturedCardIds,
  resolveFeaturedCardTags,
  resolvePlayStyle,
} from './character_select_info_panel_featured_content.js';
export {
  buildDeckCardMarkup,
  buildInteractiveDeckCardMarkup,
  buildRelicMarkup,
} from './character_select_info_panel_markup_deck.js';
export {
  buildFeatureSectionMarkup,
  buildLockedStateMarkup,
  buildRoadmapSummaryMarkup,
} from './character_select_info_panel_markup_sections.js';

export function buildLevel11PresetSummary(preset, cards) {
  if (!preset) return '없음';
  if (preset.type === 'upgrade') {
    const cardName = cards?.[preset.cardId]?.name || preset.cardId;
    return `강화: ${cardName}`;
  }
  if (preset.type === 'swap') {
    const fromName = cards?.[preset.removeCardId]?.name || preset.removeCardId;
    const toName = cards?.[preset.addCardId]?.name || preset.addCardId;
    return `교체: ${fromName} -> ${toName}`;
  }
  return '없음';
}

export function buildRoadmapPreviewMeta(roadmap = [], classProgress = {}) {
  const nextReward = (roadmap || []).find((row) => row?.lv > classProgress.level);
  if (!nextReward) {
    return {
      previewText: '모든 마스터리 보상 해금 완료',
      summaryHint: '획득한 보상 다시 보기',
    };
  }
  return {
    previewText: `다음 해금: Lv.${nextReward.lv} ${nextReward.desc}`,
    summaryHint: '펼쳐서 전체 해금 보상 보기',
  };
}

export function buildLevel12PresetSummary(loadoutCustomization = {}) {
  return loadoutCustomization.level12Preset?.bonusRelicId
    ? (loadoutCustomization.eligibleBonusRelics?.find(
      (entry) => entry.id === loadoutCustomization.level12Preset.bonusRelicId,
    )?.name
      || loadoutCustomization.previewRelics?.find(
        (entry) => entry.id === loadoutCustomization.level12Preset.bonusRelicId,
      )?.name
      || loadoutCustomization.level12Preset.bonusRelicId)
    : '미선택';
}
