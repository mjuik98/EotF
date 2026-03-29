import { playClassSelect } from '../public_audio_support_capabilities.js';
import {
  buildTitleHelpPauseActions,
  returnToTitleFromPause as returnToTitleFromPauseAction,
} from '../../../title/ports/public_help_pause_application_capabilities.js';

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
      const runDeps = buildBaseDeps('run');
      const combatRefs = refs.featureRefs?.combat || {};
      const resolveCurrentRefs = () => getRefs();
      const resolveCurrentCoreRefs = () => resolveCurrentRefs().featureRefs?.core || {};
      const resolveCurrentRunDeps = () => buildBaseDeps('run');
      const resolveCurrentGs = () => {
        const currentRefs = resolveCurrentRefs();
        const currentCoreRefs = resolveCurrentCoreRefs();
        const currentRunDeps = resolveCurrentRunDeps();
        const currentCanonicalGs = currentCoreRefs.GS || currentRefs.GS || null;
        return currentCanonicalGs?.player ? currentCanonicalGs : (currentRunDeps.gs || currentCanonicalGs);
      };
      const resolveCurrentSaveSystem = () => {
        const currentRefs = resolveCurrentRefs();
        const currentCoreRefs = resolveCurrentCoreRefs();
        return currentCoreRefs.SaveSystem || currentRefs.SaveSystem;
      };
      const resolvedGs = resolveCurrentGs();
      const saveRun = (override = {}) => resolveCurrentSaveSystem()?.saveRun?.({
        gs: override.gs?.player ? override.gs : (resolveCurrentGs() || override.gs),
        isGameStarted: () => resolveCurrentRefs()._gameStarted?.(),
      });
      const showSaveStatus = (status) => resolveCurrentSaveSystem()?.showSaveStatus?.(
        status,
        {
          ...resolveCurrentRunDeps(),
          gs: resolveCurrentGs(),
        },
      );
      const returnToTitleFromPause = () => returnToTitleFromPauseAction({
        ...resolveCurrentRunDeps(),
        gs: resolveCurrentGs(),
        saveRun,
        showSaveStatus,
      });
      const titleActions = buildTitleHelpPauseActions({
        returnToTitleFromPause,
        restartEndingFlow: refs.restartEndingFlow || refs.restartFromEnding,
        restartFromEnding: refs.restartFromEnding,
        selectEndingFragment: refs.selectEndingFragment || refs.selectFragment,
        selectFragment: refs.selectFragment,
        openEndingCodex: refs.openEndingCodex || refs.openCodex,
        openCodex: refs.openCodex,
      });
      return {
        ...runDeps,
        gs: resolvedGs,
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
        useEchoSkill: combatRefs.useEchoSkill || refs.useEchoSkill,
        drawCard: combatRefs.drawCard || refs.drawCard,
        endPlayerTurn: combatRefs.endPlayerTurn || refs.endPlayerTurn,
        playCard: combatRefs.playCard || refs.playCard,
        renderCombatEnemies: combatRefs.renderCombatEnemies || refs.renderCombatEnemies,
        cleanupCombatAfterAbandon: combatRefs.cleanupCombatAfterAbandon || refs.cleanupCombatAfterAbandon,
        finalizeRunOutcome: refs.finalizeRunOutcome,
        showAbandonOutcome: refs.showAbandonOutcome,
        hudUpdateUI: combatRefs.HudUpdateUI || refs.HudUpdateUI,
        saveRun,
        showSaveStatus,
        clearActiveRunSave: () => resolveCurrentSaveSystem()?.clearSave?.(),
        ...titleActions,
        restartFromEnding: refs.restartFromEnding,
        selectFragment: refs.selectFragment,
        switchScreen: refs.switchScreen,
        returnToGame: refs.returnToGame,
        buttonFeedback: refs.ButtonFeedback,
      };
    },
  };
}
