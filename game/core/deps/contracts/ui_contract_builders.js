export function buildUiContractBuilders(ctx) {
  const { getRefs, buildBaseDeps, getGameDeps, getRaf, getSyncVolumeUIFallback } = ctx;

  return {
    hudUpdate: () => {
      const refs = getRefs();
      return {
        ...buildBaseDeps(),
        setBonusSystem: refs.SetBonusSystem,
        classMechanics: refs.ClassMechanics,
        StatusEffectsUI: refs.StatusEffectsUI,
        statusEffectsUI: refs.StatusEffectsUI,
        TooltipUI: refs.TooltipUI,
        tooltipUI: refs.TooltipUI,
        runRules: refs.RunRules,
        isGameStarted: () => refs._gameStarted?.(),
        requestAnimationFrame: getRaf(),
        setBar: (id, pct) => refs.setBar?.(id, pct),
        setText: (id, val) => refs.setText?.(id, val),
        updateNoiseWidget: () => refs.updateNoiseWidget?.(),
        updateEchoSkillBtn: (overrideDeps) => refs.CombatHudUI?.updateEchoSkillBtn?.(overrideDeps || getGameDeps()),
        updateStatusDisplay: () => refs.updateStatusDisplay?.(),
        renderCombatEnemies: () => refs.renderCombatEnemies?.(),
        renderCombatCards: () => refs.renderCombatCards?.(),
        showItemTooltip: (event, id) => refs.showItemTooltip?.(event, id),
        hideItemTooltip: () => refs.hideItemTooltip?.(),
        showGeneralTooltip: (event, title, desc, deps) => refs.showGeneralTooltip?.(event, title, desc, deps),
        hideGeneralTooltip: () => refs.hideGeneralTooltip?.(),
        getRegionData: refs.getRegionData,
      };
    },

    combatHud: () => {
      const refs = getRefs();
      return {
        ...buildBaseDeps(),
        updateChainUI: refs.updateChainUI,
        updateNoiseWidget: refs.updateNoiseWidget,
        updateClassSpecialUI: refs.updateClassSpecialUI,
        updateUI: refs.updateUI,
        getBaseRegionIndex: refs.getBaseRegionIndex,
      };
    },

    cardTarget: () => {
      const refs = getRefs();
      return {
        ...buildBaseDeps(),
        renderCombatEnemies: refs.renderCombatEnemies,
      };
    },

    baseCard: () => {
      const refs = getRefs();
      return {
        ...getGameDeps(),
        playCardHandler: refs.GS?.playCard?.bind(refs.GS),
        renderCombatCardsHandler: refs.renderCombatCards,
        dragStartHandler: refs.handleCardDragStart,
        dragEndHandler: refs.handleCardDragEnd,
        showTooltipHandler: refs.showTooltip,
        hideTooltipHandler: refs.hideTooltip,
      };
    },

    feedback: () => {
      const refs = getRefs();
      return {
        ...buildBaseDeps(),
        audioEngine: refs.AudioEngine,
        screenShake: refs.ScreenShake,
      };
    },

    codex: () => ({
      ...buildBaseDeps(),
    }),

    deckModal: () => ({
      ...buildBaseDeps(),
    }),

    tooltip: () => {
      const refs = getRefs();
      return {
        ...buildBaseDeps(),
        setBonusSystem: refs.SetBonusSystem,
      };
    },

    screen: () => {
      const refs = getRefs();
      return {
        ...buildBaseDeps(),
        onEnterTitle: () => refs.animateTitle?.(),
      };
    },

    combatInfo: () => {
      const refs = getRefs();
      return {
        ...buildBaseDeps(),
        statusKr: refs.StatusEffectsUI?.getStatusMap?.() || {},
      };
    },

    classSelect: () => {
      const refs = getRefs();
      return {
        ...buildBaseDeps(),
        playClassSelect: (cls) => {
          try {
            refs.AudioEngine?.init?.();
            refs.AudioEngine?.resume?.();
            refs.AudioEngine?.playClassSelect?.(cls);
          } catch (e) {
            console.warn('Audio error:', e);
          }
        },
      };
    },

    helpPause: () => {
      const refs = getRefs();
      return {
        ...buildBaseDeps(),
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
        clearActiveRunSave: () => refs.SaveSystem?.clearSave?.(),
        restartFromEnding: refs.restartFromEnding,
        selectFragment: refs.selectFragment,
        switchScreen: refs.switchScreen,
        returnToGame: refs.returnToGame,
        buttonFeedback: refs.ButtonFeedback,
      };
    },

    worldCanvas: () => {
      const refs = getRefs();
      return {
        ...buildBaseDeps(),
        getRegionData: refs.getRegionData,
      };
    },

    settings: () => {
      const refs = getRefs();
      return {
        ...buildBaseDeps(),
        audioEngine: refs.AudioEngine,
        ScreenShake: refs.ScreenShake,
        HitStop: refs.HitStop,
        ParticleSystem: refs.ParticleSystem,
        openSettings: refs.openSettings,
        closeSettings: refs.closeSettings,
        setSettingsTab: refs.setSettingsTab,
      };
    },
  };
}
