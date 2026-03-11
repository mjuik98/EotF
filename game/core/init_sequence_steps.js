function createStorySystem(storyUI, deps) {
  return {
    unlockNextFragment: () => storyUI?.unlockNextFragment?.(deps.getStoryDeps()),
    showRunFragment: (overrides = {}) => storyUI?.showRunFragment?.({
      ...deps.getStoryDeps(),
      ...overrides,
    }),
    displayFragment: (frag) => storyUI?.displayFragment?.(frag, deps.getStoryDeps()),
    checkHiddenEnding: () => !!storyUI?.checkHiddenEnding?.(deps.getStoryDeps()),
    showNormalEnding: () => storyUI?.showNormalEnding?.(deps.getStoryDeps()),
    showHiddenEnding: () => storyUI?.showHiddenEnding?.(deps.getStoryDeps()),
  };
}

export function setupStorySystemBridge({ modules, deps }) {
  const storySystem = createStorySystem(modules.StoryUI, deps);
  modules.GAME.register('storySystem', storySystem);
  modules.StorySystem = storySystem;
  deps.patchRefs({ StorySystem: storySystem });
  return storySystem;
}

export function registerInitSequenceBindings({ game, modules, fns }) {
  game.register('advanceToNextRegion', fns.advanceToNextRegion);
  game.register('finalizeRunOutcome', modules.finalizeRunOutcome);
  game.register('switchScreen', fns.switchScreen);
  game.register('updateUI', fns.updateUI);
  game.register('updateNextNodes', fns.updateNextNodes);
  game.register('renderMinimap', fns.renderMinimap);
}

export function configureMazeSystem({ mazeSystem, gs, fovEngine, fns, doc, win }) {
  mazeSystem?.configure?.({
    gs,
    doc,
    win,
    fovEngine,
    showWorldMemoryNotice: (text) => fns.showWorldMemoryNotice(text),
    startCombat: (isBoss) => fns.startCombat(isBoss),
  });
}

export function mountCharacterSelect({ modules, deps, fns, doc }) {
  if (!modules.CharacterSelectUI) return;

  modules.CharacterSelectUI.mount({
    doc,
    gs: modules.GS,
    audioEngine: modules.AudioEngine,
    onProgressConsumed: () => modules.SaveSystem?.saveMeta?.(deps.getSaveSystemDeps()),
    onConfirm: (char) => {
      if (fns.selectClass) fns.selectClass(char.id);
    },
    onBack: () => {
      if (fns.backToTitle) fns.backToTitle();
    },
    onStart: (char) => {
      if (fns.startGame) fns.startGame(char.id);
    },
  });
}

export function buildGameBootPayload({ modules, deps, fns }) {
  return {
    ...(modules.GAME.getRunDeps?.() || {}),
    audioEngine: modules.AudioEngine,
    particleSystem: modules.ParticleSystem,
    helpPauseUI: modules.HelpPauseUI,
    gameBootUI: modules.GameBootUI,
    settingsUI: modules.SettingsUI,
    getGameBootDeps: () => deps.getGameBootDeps(),
    getHelpPauseDeps: () => deps.getHelpPauseDeps(),
    actions: {
      showCharacterSelect: fns.showCharacterSelect,
      continueRun: fns.continueRun,
      openRunSettings: fns.openRunSettings,
      openCodexFromTitle: fns.openCodexFromTitle,
      quitGame: fns.quitGame,
      selectClass: fns.selectClass,
      startGame: fns.startGame,
      backToTitle: fns.backToTitle,
      closeRunSettings: fns.closeRunSettings,
      shiftAscension: fns.shiftAscension,
      toggleEndlessMode: fns.toggleEndlessMode,
      cycleRunCurse: fns.cycleRunCurse,
      setMasterVolume: (value) => fns.setMasterVolume(value),
      setSfxVolume: (value) => fns.setSfxVolume(value),
      setAmbientVolume: (value) => fns.setAmbientVolume(value),
      openSettings: fns.openSettings,
      closeSettings: fns.closeSettings,
      drawCard: fns.drawCard,
      endPlayerTurn: fns.endPlayerTurn,
      useEchoSkill: fns.useEchoSkill,
    },
  };
}
