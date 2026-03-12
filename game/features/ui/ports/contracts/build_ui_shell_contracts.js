import { playClassSelect } from '../../../../domain/audio/audio_event_helpers.js';

export function buildUiShellContractBuilders(ctx) {
  const {
    getRefs,
    buildBaseDeps,
    getRaf,
    getSyncVolumeUIFallback,
  } = ctx;

  return {
    feedback: () => {
      const refs = getRefs();
      return {
        ...buildBaseDeps('ui'),
        audioEngine: refs.AudioEngine,
        screenShake: refs.ScreenShake,
        requestAnimationFrame: getRaf(),
      };
    },

    codex: () => ({
      ...buildBaseDeps('ui'),
    }),

    deckModal: () => ({
      ...buildBaseDeps('ui'),
    }),

    tooltip: () => {
      const refs = getRefs();
      return {
        ...buildBaseDeps('ui'),
        setBonusSystem: refs.SetBonusSystem,
      };
    },

    screen: () => {
      const refs = getRefs();
      return {
        ...buildBaseDeps('ui'),
        onEnterTitle: () => refs.animateTitle?.(),
      };
    },

    classSelect: () => {
      const refs = getRefs();
      return {
        ...buildBaseDeps('ui'),
        playClassSelect: (cls) => {
          try {
            playClassSelect(refs.AudioEngine, cls);
          } catch (e) {
            console.warn('Audio error:', e);
          }
        },
      };
    },

    settings: () => {
      const refs = getRefs();
      return {
        ...buildBaseDeps('ui'),
        audioEngine: refs.AudioEngine,
        ScreenShake: refs.ScreenShake,
        HitStop: refs.HitStop,
        ParticleSystem: refs.ParticleSystem,
        openSettings: refs.openSettings,
        closeSettings: refs.closeSettings,
        setSettingsTab: refs.setSettingsTab,
      };
    },

    helpPause: () => {
      const refs = getRefs();
      const restartEndingFlow = refs.restartEndingFlow || refs.restartFromEnding;
      const selectEndingFragment = refs.selectEndingFragment || refs.selectFragment;
      const openEndingCodex = refs.openEndingCodex || refs.openCodex;
      return {
        ...buildBaseDeps('run'),
        audioEngine: refs.AudioEngine,
        showDeckView: refs.showDeckView,
        closeDeckView: refs.closeDeckView,
        openCodex: refs.openCodex,
        closeCodex: refs.closeCodex,
        closeRunSettings: refs.closeRunSettings,
        openSettings: refs.openSettings,
        closeSettings: refs.closeSettings,
        quitGame: refs.quitGame,
        setMasterVolume: refs.setMasterVolume,
        setSfxVolume: refs.setSfxVolume,
        setAmbientVolume: refs.setAmbientVolume,
        closeBattleChronicle: refs.closeBattleChronicle,
        _syncVolumeUI: refs._syncVolumeUI || getSyncVolumeUIFallback(),
        useEchoSkill: refs.useEchoSkill,
        drawCard: refs.drawCard,
        endPlayerTurn: refs.endPlayerTurn,
        renderCombatEnemies: refs.renderCombatEnemies,
        finalizeRunOutcome: refs.finalizeRunOutcome,
        hudUpdateUI: refs.HudUpdateUI,
        saveRun: (override = {}) => refs.SaveSystem?.saveRun?.({
          gs: override.gs || refs.GS,
          isGameStarted: () => refs._gameStarted?.(),
        }),
        returnToTitleFromPause: () => refs.returnToTitleFromPause?.(),
        clearActiveRunSave: () => refs.SaveSystem?.clearSave?.(),
        restartEndingFlow: () => restartEndingFlow?.(),
        selectEndingFragment: (effect) => selectEndingFragment?.(effect),
        openEndingCodex: () => openEndingCodex?.(),
        endingActions: {
          restart: () => restartEndingFlow?.(),
          selectFragment: (effect) => selectEndingFragment?.(effect),
          openCodex: () => openEndingCodex?.(),
        },
        restartFromEnding: refs.restartFromEnding,
        selectFragment: refs.selectFragment,
        switchScreen: refs.switchScreen,
        returnToGame: refs.returnToGame,
        buttonFeedback: refs.ButtonFeedback,
      };
    },
  };
}
