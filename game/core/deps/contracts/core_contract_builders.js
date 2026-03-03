export function buildCoreContractBuilders(ctx) {
  const { getRefs, buildBaseDeps, getGameDeps } = ctx;

  return {
    base: () => ({
      ...buildBaseDeps(),
    }),

    story: () => {
      const refs = getRefs();
      return {
        ...buildBaseDeps(),
        audioEngine: refs.AudioEngine,
        particleSystem: refs.ParticleSystem,
        showWorldMemoryNotice: refs.showWorldMemoryNotice,
        restartFromEnding: refs.restartFromEnding,
      };
    },

    combatTurnBase: () => {
      const refs = getRefs();
      return {
        ...getGameDeps(),
        enemyTurn: refs.enemyTurn,
        updateChainUI: refs.updateChainUI,
        showTurnBanner: refs.showTurnBanner,
        renderCombatEnemies: refs.renderCombatEnemies,
        renderCombatCards: refs.renderCombatCards,
        updateStatusDisplay: refs.updateStatusDisplay,
        updateClassSpecialUI: refs.updateClassSpecialUI,
        updateCombatEnergy: (gs) => refs.HudUpdateUI?.updateCombatEnergy?.(gs, getGameDeps()),
        hudUpdateUI: refs.HudUpdateUI,
        updateUI: refs.updateUI,
        showEchoBurstOverlay: refs.showEchoBurstOverlay,
        showDmgPopup: refs.showDmgPopup,
        shuffleArray: (arr) => refs.RandomUtils?.shuffleArray?.(arr) || arr,
      };
    },

    event: () => {
      const refs = getRefs();
      return {
        ...buildBaseDeps(),
        runRules: refs.RunRules,
        updateUI: refs.updateUI,
        returnToGame: refs.returnToGame,
        switchScreen: refs.switchScreen,
        renderMinimap: refs.renderMinimap,
        updateNextNodes: refs.updateNextNodes,
        showItemToast: refs.showItemToast,
        audioEngine: refs.AudioEngine,
        screenShake: refs.ScreenShake,
        playItemGet: () => refs.AudioEngine?.playItemGet?.(),
      };
    },

    reward: () => {
      const refs = getRefs();
      return {
        ...buildBaseDeps(),
        switchScreen: refs.switchScreen,
        returnToGame: refs.returnToGame,
        showItemToast: refs.showItemToast,
        playItemGet: () => refs.AudioEngine?.playItemGet?.(),
      };
    },

    runReturn: () => {
      const refs = getRefs();
      return {
        ...buildBaseDeps(),
        storySystem: refs.StorySystem,
        finalizeRunOutcome: refs.finalizeRunOutcome,
        advanceToNextRegion: refs.advanceToNextRegion,
        updateNextNodes: refs.updateNextNodes,
        renderMinimap: refs.renderMinimap,
      };
    },

    saveSystem: () => {
      const refs = getRefs();
      return {
        ...buildBaseDeps(),
        runRules: refs.RunRules,
        isGameStarted: () => refs._gameStarted?.(),
      };
    },
  };
}
