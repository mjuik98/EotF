import {
  buildLevel12PresetSummary,
  buildRoadmapPreviewMeta,
} from './character_select_info_panel_markup.js';
import { bindCharacterInfoPanelInteractions } from './character_select_info_panel_interactions.js';
import {
  arraysEqual,
  normalizeRelicIds,
  resolveFeaturedCardIds,
  resolveFeaturedCardTags,
  resolvePlayStyle,
} from './character_select_info_panel_featured_content.js';
import {
  buildCharacterInfoDetailsSection,
  buildCharacterInfoSummarySection,
} from './character_select_info_panel_sections.js';

export function renderCharacterInfoPanel({
  panel,
  selectedChar,
  classProgress,
  roadmap,
  recentSummaries,
  pendingSummaryCount = 0,
  buildSectionLabel,
  buildRadar,
  cards,
  gs,
  generalTooltipUI,
  cardTooltipUI,
  doc,
  win,
  hover,
  echo,
  openModal,
  loadoutCustomization,
  onSaveLoadoutPreset,
  onClearLoadoutPreset,
  onSelectLoadoutPresetSlot,
} = {}) {
  if (!panel || !selectedChar || !classProgress) return;

  const baseDeck = Array.isArray(selectedChar.startDeck) ? selectedChar.startDeck : [];
  const previewDeck = loadoutCustomization?.previewDeck || selectedChar.startDeck;
  const baseRelics = [selectedChar.startRelic];
  const previewRelics = Array.isArray(loadoutCustomization?.previewRelics) && loadoutCustomization.previewRelics.length > 0
    ? loadoutCustomization.previewRelics
    : baseRelics;
  const baseRelicId = String(selectedChar.startRelicId || selectedChar.startRelic?.id || selectedChar.startRelic?.name || '');
  const hasCustomizedLoadout = !!loadoutCustomization && (
    !arraysEqual(baseDeck, previewDeck)
    || !arraysEqual(normalizeRelicIds(baseRelics, baseRelicId), normalizeRelicIds(previewRelics, baseRelicId))
  );
  const progressPct = Math.round(classProgress.progress * 100);
  const echoSkill = selectedChar.echoSkill;
  const summaryRelics = Array.isArray(loadoutCustomization?.previewRelics) && loadoutCustomization.previewRelics.length > 0
    ? loadoutCustomization.previewRelics
    : baseRelics;
  const bonusRelics = previewRelics.slice(baseRelics.length);
  const playStyleLines = resolvePlayStyle(selectedChar);
  const featuredCardIds = resolveFeaturedCardIds(selectedChar);
  const featuredCardTags = resolveFeaturedCardTags(selectedChar);
  const { previewText: roadmapPreviewText, summaryHint: roadmapSummaryHint } = buildRoadmapPreviewMeta(roadmap, classProgress);
  const level11Unlocked = !!loadoutCustomization?.level11Unlocked;
  const level12Unlocked = !!loadoutCustomization?.level12Unlocked;
  const level12Summary = buildLevel12PresetSummary(loadoutCustomization);
  const eligibleUpgradeIndices = (loadoutCustomization?.eligibleUpgradeTargets || []).map((entry) => entry.index);
  const eligibleSwapIndices = (loadoutCustomization?.eligibleSwapRemoveTargets || []).map((entry) => entry.index);
  const initialLevel11Mode = loadoutCustomization?.level11Preset?.type === 'swap' ? 'swap' : 'upgrade';
  const initialLevel11UpgradeIndex = null;
  const initialLevel11SwapIndex = null;

  panel.style.setProperty('--char-accent', selectedChar.accent);
  panel.style.setProperty('--char-color', selectedChar.color);
  panel.style.setProperty('--char-accent-faint', `${selectedChar.accent}06`);
  panel.style.setProperty('--char-accent-surface', `${selectedChar.accent}0a`);
  panel.style.setProperty('--char-accent-soft', `${selectedChar.accent}14`);
  panel.style.setProperty('--char-accent-border-soft', `${selectedChar.accent}22`);
  panel.style.setProperty('--char-accent-border', `${selectedChar.accent}44`);
  panel.style.setProperty('--char-accent-border-strong', `${selectedChar.accent}66`);
  panel.style.setProperty('--char-accent-dim', `${selectedChar.accent}66`);
  panel.style.setProperty('--char-accent-muted', `${selectedChar.accent}99`);
  panel.style.setProperty('--char-accent-glow', `${selectedChar.accent}33`);
  panel.style.setProperty('--char-color-soft', `${selectedChar.color}08`);
  panel.style.setProperty('--char-color-strong', `${selectedChar.color}1a`);
  panel.style.setProperty('--char-mastery-progress', `${progressPct}%`);
  panel.innerHTML = `
    <div class="char-info-shell">
      <div class="char-info-tabs" role="tablist" aria-label="캐릭터 상세">
        <button class="char-info-tab is-active" type="button" role="tab" aria-selected="true" data-tab="summary">
          요약
        </button>
        <button class="char-info-tab" type="button" role="tab" aria-selected="false" data-tab="details">
          자세히
        </button>
      </div>
      <div class="char-info-body">
        ${buildCharacterInfoSummarySection({
    selectedChar,
    buildSectionLabel,
    echoSkill,
    playStyleLines,
    summaryRelics,
    cards,
    featuredCardIds,
      featuredCardTags,
      roadmapPreviewText,
      pendingSummaryCount,
  })}
        ${buildCharacterInfoDetailsSection({
    selectedChar,
    classProgress,
    roadmap,
    buildSectionLabel,
    buildRadar,
    cards,
    progressPct,
    roadmapPreviewText,
    roadmapSummaryHint,
    baseRelics,
    bonusRelics,
    baseDeck,
    eligibleUpgradeIndices,
    eligibleSwapIndices,
    initialLevel11Mode,
    initialLevel11UpgradeIndex,
    initialLevel11SwapIndex,
    level11Unlocked,
    level12Unlocked,
    level12Summary,
    loadoutCustomization,
    recentSummaries,
  })}
      </div>
    </div>`;
  bindCharacterInfoPanelInteractions({
    panel,
    selectedChar,
    cards,
    gs,
    generalTooltipUI,
    cardTooltipUI,
    doc,
    win,
    hover,
    echo,
    openModal,
    loadoutState: {
      initialLevel11Mode,
      initialLevel11UpgradeIndex,
      initialLevel11SwapIndex,
    },
    onSaveLoadoutPreset,
    onClearLoadoutPreset,
    onSelectLoadoutPresetSlot,
  });
}
