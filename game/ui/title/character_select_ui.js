import { ClassProgressionSystem } from '../../systems/class_progression_system.js';
import { createCharacterSelectSfx } from './character_select_audio.js';
import { setupCharacterSelectBindings } from './character_select_bindings.js';
import { CHARACTER_SELECT_CHARS } from './character_select_catalog.js';
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
import { createCharacterSelectMountRuntime } from './character_select_mount_runtime.js';

function getDoc(deps) {
  return deps?.doc || deps?.win?.document || null;
}

function bindBrowserFn(fn, context) {
  if (typeof fn !== 'function') return null;
  if (typeof fn.bind !== 'function') return fn;
  return fn.bind(context);
}

function getWin(deps, doc) {
  return deps?.win || doc?.defaultView || null;
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

  getSelectionSnapshot() {
    return this._runtime?.getSelectionSnapshot?.() || null;
  },

  mount(deps = {}) {
    const owner = this;
    const doc = getDoc(deps);
    const win = getWin(deps, doc);
    const requestAnimationFrameImpl = deps?.requestAnimationFrame || bindBrowserFn(win?.requestAnimationFrame, win);
    const cancelAnimationFrameImpl = deps?.cancelAnimationFrame || bindBrowserFn(win?.cancelAnimationFrame, win);
    const setTimeoutImpl = deps?.setTimeout || bindBrowserFn(win?.setTimeout, win) || setTimeout;
    const clearIntervalImpl = deps?.clearInterval || bindBrowserFn(win?.clearInterval, win) || clearInterval;
    const state = { idx: 0, phase: 'select', activeSkill: null, typingTimer: null };
    const chars = CHARS;
    const classIds = chars.map((ch) => ch.class);
    const levelUpPopup = new LevelUpPopupUI({
      cancelRaf: cancelAnimationFrameImpl,
      doc,
      raf: requestAnimationFrameImpl,
      win,
    });
    const runEndScreen = new RunEndScreenUI({
      doc,
      raf: requestAnimationFrameImpl,
      setTimeout: setTimeoutImpl,
      win,
    });
    let isReplayingSummary = false;
    const particleRuntime = createCharacterParticleRuntime({
      doc,
      win,
      requestAnimationFrameImpl,
      cancelAnimationFrameImpl,
    });

    ClassProgressionSystem.ensureMeta(deps?.gs?.meta, classIds);

    function getById(id) {
      return doc.getElementById(id);
    }

    let mountRuntime = null;

    const summaryReplay = createCharacterSummaryReplay({
      progressionSystem: ClassProgressionSystem,
      meta: deps?.gs?.meta,
      classIds,
      resolveClass: (classId) => mountRuntime.resolveClass(classId),
      levelUpPopup,
      runEndScreen,
      saveProgressMeta: () => mountRuntime.saveProgressMeta(),
      updateAll: () => mountRuntime.updateAll(),
      setReplaying: (value) => {
        isReplayingSummary = value;
      },
      isReplaying: () => isReplayingSummary,
      setTimeoutImpl,
      fallbackBonusText: '?????癰귣?瑗??? 揶쏅벤???뤿???щ빍??',
    });

    const sfx = createCharacterSelectSfx(deps);
    const flow = createCharacterSelectFlow({
      state,
      chars,
      resolveById: getById,
      sfx,
      updateAll: () => mountRuntime?.updateAll(),
      renderPhase: () => mountRuntime?.renderPhase(),
      onConfirm: (selectedChar) => deps.onConfirm?.(selectedChar),
      setTimeoutImpl,
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

    function stopTyping() {
      if (!state.typingTimer) return;
      clearIntervalImpl(state.typingTimer);
      state.typingTimer = null;
    }
    mountRuntime = createCharacterSelectMountRuntime({
      chars,
      deps,
      doc,
      flow,
      getById,
      openModal,
      particleRuntime,
      sfx,
      state,
      stopTyping,
      win,
    });

    const cleanupBindings = setupCharacterSelectBindings({
      doc,
      resolveById: getById,
      isModalOpen: () => getById('skillModal')?.classList.contains('open'),
      state,
      closeModal,
      stopTyping,
      renderPhase: mountRuntime.renderPhase,
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

    mountRuntime.updateAll();
    setTimeoutImpl(() => doc.querySelectorAll('.intro').forEach((element) => element.classList.add('mounted')), 80);
    owner._runtime = {
      onEnter() {
        mountRuntime.updateAll();
      },
      showPendingSummaries() {
        summaryReplay.consumePendingSummaries();
      },
      getSelectionSnapshot() {
        const selectedChar = chars[state.idx] || null;
        return {
          index: state.idx,
          phase: state.phase,
          classId: selectedChar?.class || null,
          title: selectedChar?.title || null,
          name: selectedChar?.name || null,
          accent: selectedChar?.accent || null,
        };
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
