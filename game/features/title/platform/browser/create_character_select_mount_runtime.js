import {
  ensureCharacterSelectMeta,
  getCharacterSelectPresentation,
} from '../../application/load_character_select_use_case.js';
import {
  buildCharacterSelectLoadoutPayload,
  clearCharacterSelectLoadoutPreset,
  saveCharacterSelectLoadoutPreset,
} from './character_select_mount_loadout.js';
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

  function renderCard() {
    const ch = chars[state.idx];
    const card = getById('charCard');
    if (!card) return;
    const presentation = getCharacterSelectPresentation(deps?.gs?.meta, ch.class, classIds);
    const progress = presentation.classProgress;
    const { customization } = buildCharacterSelectLoadoutPayload(ch, presentation, deps);
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
    } = buildCharacterSelectLoadoutPayload(ch, presentation, deps);

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
        const didSave = saveCharacterSelectLoadoutPreset({
          ch,
          deps,
          payload,
          presentation,
          dataCards,
          dataStartDecks,
          dataUpgradeMap,
          itemCatalog,
        });
        if (!didSave) return;
        saveProgressMeta();
        updateAll();
      },
      onClearLoadoutPreset: (slot) => {
        const didClear = clearCharacterSelectLoadoutPreset(deps?.gs, ch.class, slot);
        if (!didClear) return;
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
