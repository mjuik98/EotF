import {
  buildTitleHelpPauseActions,
  returnToTitleFromPause as returnToTitleFromPauseAction,
} from '../integration/title_help_pause_application_capabilities.js';

export function buildFrontdoorHelpPauseContract(ctx) {
  const {
    buildBaseDeps,
    getRefs,
    getSyncVolumeUIFallback,
  } = ctx;

  const refs = getRefs();
  const runDeps = buildBaseDeps('run');
  const combatRefs = refs.featureRefs?.combat || {};
  const resolveCurrentRefs = () => getRefs();
  const resolveCurrentCoreRefs = () => resolveCurrentRefs().featureRefs?.core || {};
  const resolveCurrentRunDeps = () => buildBaseDeps('run');
  const resolveCurrentSaveRuntimeContext = () => {
    const currentRefs = resolveCurrentRefs();
    const currentCoreRefs = resolveCurrentCoreRefs();
    return currentCoreRefs.SaveRuntimeContext || currentRefs.SaveRuntimeContext || null;
  };
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
    return resolveCurrentSaveRuntimeContext()?.saveSystem || currentCoreRefs.SaveSystem || currentRefs.SaveSystem;
  };
  const resolvedGs = resolveCurrentGs();
  const saveRun = (override = {}) => resolveCurrentSaveSystem()?.saveRun?.({
    gs: override.gs?.player ? override.gs : (resolveCurrentGs() || override.gs),
    saveRuntimeContext: override.saveRuntimeContext || resolveCurrentSaveRuntimeContext(),
    isGameStarted: () => resolveCurrentRefs()._gameStarted?.(),
  });
  const showSaveStatus = (status) => resolveCurrentSaveSystem()?.showSaveStatus?.(
    status,
    {
      ...resolveCurrentRunDeps(),
      gs: resolveCurrentGs(),
      saveRuntimeContext: resolveCurrentSaveRuntimeContext(),
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
    saveRuntimeContext: resolveCurrentSaveRuntimeContext(),
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
    clearActiveRunSave: () => resolveCurrentSaveSystem()?.clearSave?.({
      saveRuntimeContext: resolveCurrentSaveRuntimeContext(),
    }),
    ...titleActions,
    restartFromEnding: refs.restartFromEnding,
    selectFragment: refs.selectFragment,
    switchScreen: refs.switchScreen,
    returnToGame: refs.returnToGame,
    buttonFeedback: refs.ButtonFeedback,
  };
}
