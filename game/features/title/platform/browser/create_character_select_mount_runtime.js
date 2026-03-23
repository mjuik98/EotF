import { CARDS } from '../../../../../data/cards.js';
import {
  ensureCharacterSelectMeta,
  getCharacterSelectPresentation,
} from '../../application/load_character_select_use_case.js';
import {
  buildClassLoadoutCustomizationPresentation,
  saveLevel11LoadoutPreset,
  saveLevel12LoadoutPreset,
} from '../../../../shared/progression/class_loadout_preset_use_case.js';
import { TooltipUI } from '../../../combat/ports/public_presentation_capabilities.js';
import {
  renderCharacterInfoPanel,
  renderCharacterPhase,
} from './character_select_panels.js';
import {
  renderCharacterButtons,
  renderCharacterDots,
  updateCharacterArrows,
} from './character_select_render.js';
import { buildCharacterRadar } from './character_select_radar.js';
import { renderCharacterCard } from './character_select_card_ui.js';

export function buildCharacterSelectSectionLabel(text, accent) {
  return `<span class="s-label" style="border-left:2px solid ${accent}44">${text}</span>`;
}

export function getCharacterClassProgress(meta, classId, classIds) {
  return getCharacterSelectPresentation(meta, classId, classIds).classProgress;
}

export function createCharacterSelectMountRuntime(options = {}) {
  const {
    chars = [],
    deps = {},
    doc,
    flow,
    getById,
    openModal,
    particleRuntime,
    sfx,
    state,
    stopTyping,
    win,
  } = options;

  const classIds = chars.map((ch) => ch.class);

  function resolveClass(classId) {
    return chars.find((entry) => entry.class === classId) || chars[state.idx] || chars[0];
  }

  function saveProgressMeta() {
    if (typeof deps.onProgressConsumed === 'function') deps.onProgressConsumed();
  }

  function buildLoadoutCustomization(ch, presentation) {
    const itemCatalog = deps?.data?.items || {};
    const dataCards = deps?.data?.cards || CARDS;
    const dataUpgradeMap = deps?.data?.upgradeMap || {};
    const dataStartDecks = deps?.data?.startDecks || {
      [ch.class]: ch.startDeck,
    };
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

  function renderCard() {
    const ch = chars[state.idx];
    const card = getById('charCard');
    if (!card) return;
    const presentation = getCharacterSelectPresentation(deps?.gs?.meta, ch.class, classIds);
    const progress = presentation.classProgress;
    const { customization } = buildLoadoutCustomization(ch, presentation);
    renderCharacterCard({
      card,
      selectedChar: ch,
      classProgress: progress,
      maxLevel: presentation.maxLevel,
      resolveById: getById,
      doc,
      traitBadgeText: ch.traitName,
      summaryText: ch.selectionSummary || ch.desc || ch.traitDesc || '',
      xpText: progress.nextLevelXp === null
        ? `최고 레벨 · ${progress.totalXp} 경험치`
        : `${progress.totalXp} / ${progress.nextLevelXp} 경험치`,
      loadoutSummaryText: customization.hasInvalidPreset ? '' : customization.cardSummaryLine,
      loadoutWarningText: customization.hasInvalidPreset ? '프리셋 확인 필요' : '',
    });
  }

  function renderInfoPanel() {
    const ch = chars[state.idx];
    const presentation = getCharacterSelectPresentation(deps?.gs?.meta, ch.class, classIds);
    const {
      customization,
      dataCards,
      dataStartDecks,
      dataUpgradeMap,
      itemCatalog,
    } = buildLoadoutCustomization(ch, presentation);

    renderCharacterInfoPanel({
      panel: getById('infoPanel'),
      selectedChar: ch,
      classProgress: presentation.classProgress,
      roadmap: presentation.roadmap,
      buildSectionLabel: buildCharacterSelectSectionLabel,
      buildRadar: buildCharacterRadar,
      cards: dataCards,
      generalTooltipUI: TooltipUI,
      cardTooltipUI: TooltipUI,
      doc,
      win,
      hover: () => sfx.hover(),
      echo: () => sfx.echo(),
      openModal,
      loadoutCustomization: customization,
      onSaveLoadoutPreset: (payload) => {
        if (!payload?.slot) return;
        if (payload.slot === 'level11') {
          saveLevel11LoadoutPreset(deps?.gs?.meta, ch.class, payload, {
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
          });
        } else if (payload.slot === 'level12') {
          saveLevel12LoadoutPreset(deps?.gs?.meta, ch.class, payload.bonusRelicId, {
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
          });
        }
        saveProgressMeta();
        updateAll();
      },
      onClearLoadoutPreset: (slot) => {
        const presets = deps?.gs?.meta?.classProgress?.loadoutPresets?.[ch.class];
        if (!presets || (slot !== 'level11' && slot !== 'level12')) return;
        presets[slot] = null;
        saveProgressMeta();
        updateAll();
      },
    });
  }

  function renderDots() {
    renderCharacterDots(getById('dotsRow'), chars, state.idx, flow.jumpTo);
  }

  function renderButtons() {
    renderCharacterButtons(getById('buttonsRow'), chars[state.idx], () => sfx.hover(), flow.handleConfirm);
  }

  function renderPhaseRuntime() {
    renderCharacterPhase({
      state,
      selectedChar: chars[state.idx],
      resolveById: getById,
      stopTyping,
      rerender: renderPhaseRuntime,
      onStart: () => {
        deps.onStart?.(chars[state.idx]);
      },
    });
  }

  function updateArrows() {
    updateCharacterArrows(getById, chars[state.idx].accent);
  }

  function updateAll() {
    ensureCharacterSelectMeta(deps?.gs?.meta, classIds);
    renderCard();
    renderInfoPanel();
    renderDots();
    renderButtons();
    const bgGradient = getById('bgGradient');
    if (bgGradient) {
      bgGradient.style.background = `radial-gradient(ellipse 70% 65% at 50% 50%,${chars[state.idx].glow}10 0%,transparent 70%)`;
    }
    const headerTitle = getById('headerTitle');
    if (headerTitle) headerTitle.style.textShadow = `0 0 40px ${chars[state.idx].glow}44`;
    particleRuntime.start(chars[state.idx].particle, chars[state.idx].accent);
    updateArrows();
  }

  return {
    classIds,
    renderPhase: renderPhaseRuntime,
    resolveClass,
    saveProgressMeta,
    updateAll,
  };
}
