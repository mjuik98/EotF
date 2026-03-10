import { CARDS } from '../../../data/cards.js';
import { ClassProgressionSystem } from '../../systems/class_progression_system.js';
import { TooltipUI } from '../cards/tooltip_ui.js';
import { createCharacterSelectSfx } from './character_select_audio.js';
import { setupCharacterSelectBindings } from './character_select_bindings.js';
import { CHARACTER_SELECT_CHARS } from './character_select_catalog.js';
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
import { setupCharacterCardFx } from './character_select_fx.js';
import { createCharacterSelectFlow } from './character_select_flow.js';
import {
  closeCharacterSkillModal,
  openCharacterSkillModal,
} from './character_select_modal.js';
import { createCharacterParticleRuntime } from './character_select_particles.js';
import { createCharacterSummaryReplay } from './character_select_summary_replay.js';
import { LevelUpPopupUI } from './level_up_popup_ui.js';
import { RunEndScreenUI } from './run_end_screen_ui.js';

function getDoc(deps) {
  return deps?.doc || document;
}

const CHARS = CHARACTER_SELECT_CHARS;

export const CharacterSelectUI = {
  CHARS,
  _runtime: null,

  onEnter() {
    this._runtime?.onEnter?.();
  },

  showPendingSummaries() {
    this._runtime?.showPendingSummaries?.();
  },

  mount(deps = {}) {
    const owner = this;
    const doc = getDoc(deps);
    const win = deps?.win || globalThis.window || globalThis;
    const state = { idx: 0, phase: 'select', activeSkill: null, typingTimer: null };
    const chars = CHARS;
    const classIds = chars.map((ch) => ch.class);
    const levelUpPopup = new LevelUpPopupUI();
    const runEndScreen = new RunEndScreenUI();
    let isReplayingSummary = false;
    const particleRuntime = createCharacterParticleRuntime({
      doc,
      requestAnimationFrameImpl: deps?.requestAnimationFrame || globalThis.requestAnimationFrame,
      cancelAnimationFrameImpl: deps?.cancelAnimationFrame || globalThis.cancelAnimationFrame,
    });

    ClassProgressionSystem.ensureMeta(deps?.gs?.meta, classIds);

    function getById(id) {
      return doc.getElementById(id);
    }

    function buildSectionLabel(text, accent) {
      return `<span class="s-label" style="border-left:2px solid ${accent}44">${text}</span>`;
    }

    function getClassProgress(classId) {
      const fallback = {
        classId,
        level: 1,
        totalXp: 0,
        currentLevelXp: 0,
        nextLevelXp: 100,
        progress: 0,
      };
      if (!deps?.gs?.meta || !classId) return fallback;
      return ClassProgressionSystem.getClassState(deps.gs.meta, classId, classIds) || fallback;
    }

    function saveProgressMeta() {
      if (typeof deps.onProgressConsumed === 'function') deps.onProgressConsumed();
    }

    function resolveClass(classId) {
      return chars.find((entry) => entry.class === classId) || chars[state.idx] || chars[0];
    }

    function updateAll() {
      ClassProgressionSystem.ensureMeta(deps?.gs?.meta, classIds);
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

    const summaryReplay = createCharacterSummaryReplay({
      progressionSystem: ClassProgressionSystem,
      meta: deps?.gs?.meta,
      classIds,
      resolveClass,
      levelUpPopup,
      runEndScreen,
      saveProgressMeta,
      updateAll,
      setReplaying: (value) => {
        isReplayingSummary = value;
      },
      isReplaying: () => isReplayingSummary,
      setTimeoutImpl: setTimeout,
      fallbackBonusText: '?????癰귣?瑗??? 揶쏅벤???뤿???щ빍??',
    });

    const sfx = createCharacterSelectSfx(deps);
    const flow = createCharacterSelectFlow({
      state,
      chars,
      resolveById: getById,
      sfx,
      updateAll,
      renderPhase,
      onConfirm: (selectedChar) => deps.onConfirm?.(selectedChar),
      setTimeoutImpl: setTimeout,
    });

    function openModal(skill, accent) {
      openCharacterSkillModal({
        skill,
        accent,
        state,
        resolveById: getById,
        onClose: closeModal,
      });
    }

    function closeModal() {
      closeCharacterSkillModal({
        state,
        resolveById: getById,
      });
    }

    function renderCard() {
      const ch = chars[state.idx];
      const card = getById('charCard');
      if (!card) return;
      const progress = getClassProgress(ch.class);
      renderCharacterCard({
        card,
        selectedChar: ch,
        classProgress: progress,
        maxLevel: ClassProgressionSystem.MAX_LEVEL,
        resolveById: getById,
        doc,
        traitBadgeText: `??${ch.traitName}`,
        xpText: progress.nextLevelXp === null
          ? `MAX LEVEL 쨌 ${progress.totalXp} XP`
          : `${progress.totalXp} / ${progress.nextLevelXp} XP`,
      });
    }

    function renderInfoPanel() {
      const ch = chars[state.idx];
      renderCharacterInfoPanel({
        panel: getById('infoPanel'),
        selectedChar: ch,
        classProgress: getClassProgress(ch.class),
        roadmap: ClassProgressionSystem.getRoadmap(ch.class),
        buildSectionLabel,
        buildRadar: buildCharacterRadar,
        cards: CARDS,
        generalTooltipUI: TooltipUI,
        cardTooltipUI: TooltipUI,
        doc,
        win,
        hover: () => sfx.hover(),
        echo: () => sfx.echo(),
        openModal,
      });
    }

    function renderDots() {
      renderCharacterDots(getById('dotsRow'), chars, state.idx, flow.jumpTo);
    }

    function renderButtons() {
      renderCharacterButtons(getById('buttonsRow'), chars[state.idx], () => sfx.hover(), flow.handleConfirm);
    }

    function stopTyping() {
      if (!state.typingTimer) return;
      clearInterval(state.typingTimer);
      state.typingTimer = null;
    }

    function renderPhase() {
      renderCharacterPhase({
        state,
        selectedChar: chars[state.idx],
        resolveById: getById,
        stopTyping,
        rerender: renderPhase,
        onStart: () => {
          console.log('[CharacterSelectUI] Journey Start clicked:', chars[state.idx]);
          deps.onStart?.(chars[state.idx]);
        },
      });
    }

    function updateArrows() {
      updateCharacterArrows(getById, chars[state.idx].accent);
    }

    const cleanupBindings = setupCharacterSelectBindings({
      doc,
      resolveById: getById,
      isModalOpen: () => getById('skillModal')?.classList.contains('open'),
      state,
      closeModal,
      stopTyping,
      renderPhase,
      onBack: deps.onBack,
      go: flow.go,
      handleConfirm: flow.handleConfirm,
      hover: () => sfx.hover(),
      getAccent: () => chars[state.idx].accent,
    });
    const cleanupCardFx = setupCharacterCardFx({
      card: getById('charCard'),
      resolveById: getById,
    });

    updateAll();
    setTimeout(() => doc.querySelectorAll('.intro').forEach((element) => element.classList.add('mounted')), 80);
    owner._runtime = {
      onEnter() {
        updateAll();
      },
      showPendingSummaries() {
        summaryReplay.consumePendingSummaries();
      },
    };

    return {
      destroy() {
        owner._runtime = null;
        cleanupBindings();
        cleanupCardFx();
        stopTyping();
        particleRuntime.stop();
        levelUpPopup.destroy();
        runEndScreen.destroy();
      },
    };
  },
};
