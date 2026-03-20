import { resolveCharacterSelectRuntimeEnv } from './character_select_runtime_env.js';
import {
  createCharacterSelectModalController,
  createCharacterSelectRuntimeState,
  stopCharacterSelectTyping,
} from './character_select_runtime_state.js';

export function createCharacterSelectRuntime(deps = {}, runtime = {}) {
  const {
    chars = [],
    createProgressionFacade,
    ensureMeta,
    createSfx,
    setupBindings,
    setupCardFx,
    createFlow,
    openSkillModal,
    closeSkillModal,
    createParticleRuntime,
    createSummaryReplay,
    LevelUpPopup,
    RunEndScreen,
    createMountRuntime,
  } = runtime;
  const {
    doc,
    win,
    requestAnimationFrameImpl,
    cancelAnimationFrameImpl,
    setTimeoutImpl,
    clearIntervalImpl,
  } = resolveCharacterSelectRuntimeEnv(deps);
  const state = createCharacterSelectRuntimeState();
  const classIds = chars.map((ch) => ch.class);
  const progressionFacade = createProgressionFacade(deps?.gs?.meta, classIds);
  const levelUpPopup = new LevelUpPopup({
    cancelRaf: cancelAnimationFrameImpl,
    doc,
    raf: requestAnimationFrameImpl,
    win,
  });
  const runEndScreen = new RunEndScreen({
    doc,
    raf: requestAnimationFrameImpl,
    setTimeout: setTimeoutImpl,
    win,
  });
  let isReplayingSummary = false;
  const particleRuntime = createParticleRuntime({
    doc,
    win,
    requestAnimationFrameImpl,
    cancelAnimationFrameImpl,
  });

  ensureMeta(deps?.gs?.meta, classIds);

  function getById(id) {
    return doc.getElementById(id);
  }

  let mountRuntime = null;

  const summaryReplay = createSummaryReplay({
    progressionSystem: progressionFacade,
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

  const sfx = createSfx(deps);
  const flow = createFlow({
    state,
    chars,
    resolveById: getById,
    sfx,
    updateAll: () => mountRuntime?.updateAll(),
    renderPhase: () => mountRuntime?.renderPhase(),
    onConfirm: (selectedChar) => deps.onConfirm?.(selectedChar),
    setTimeoutImpl,
  });
  const { closeModal, openModal } = createCharacterSelectModalController({
    state,
    resolveById: getById,
    openSkillModal,
    closeSkillModal,
  });
  const stopTyping = () => stopCharacterSelectTyping(state, clearIntervalImpl);

  mountRuntime = createMountRuntime({
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

  const cleanupBindings = setupBindings({
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
  const cleanupCardFx = setupCardFx({
    card: getById('charCard'),
    resolveById: getById,
  });

  mountRuntime.updateAll();
  setTimeoutImpl(() => doc.querySelectorAll('.intro').forEach((element) => element.classList.add('mounted')), 80);

  return {
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
    destroy() {
      cleanupBindings();
      cleanupCardFx();
      stopTyping();
      particleRuntime.stop();
      levelUpPopup.destroy();
      runEndScreen.destroy();
    },
  };
}
