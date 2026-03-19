import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { registerSubscribers } = vi.hoisted(() => ({
  registerSubscribers: vi.fn(),
}));

vi.mock('../game/core/event_subscribers.js', () => ({
  registerSubscribers,
}));

import { bootGame } from '../game/core/init_sequence.js';

function createModules() {
  const registered = {};
  const modules = {
    GAME: {
      init: vi.fn(),
      getDeps: vi.fn(() => ({ token: 'game-deps' })),
      getRunDeps: vi.fn(() => ({ token: 'run-deps' })),
      register: vi.fn((name, value) => {
        registered[name] = value;
      }),
      Modules: registered,
    },
    GS: {},
    DATA: {},
    AudioEngine: {},
    ParticleSystem: {},
    FovEngine: {},
    ScreenShake: {},
    HitStop: {},
    DifficultyScaler: {},
    RandomUtils: {},
    RunRules: {},
    getRegionData: vi.fn(),
    getBaseRegionIndex: vi.fn(),
    getRegionCount: vi.fn(),
    ClassMechanics: {},
    SetBonusSystem: {},
    SaveSystem: { saveMeta: vi.fn() },
    CardCostUtils: {},
    CodexUI: {},
    EventUI: {},
    CombatUI: {},
    DeckModalUI: {},
    RunModeUI: {},
    ScreenUI: {},
    TitleCanvasUI: {},
    ClassSelectUI: {},
    CharacterSelectUI: { mount: vi.fn() },
    CombatHudUI: {},
    HudUpdateUI: {},
    StatusEffectsUI: {},
    RewardUI: {},
    CombatActionsUI: {},
    TooltipUI: {},
    HelpPauseUI: {},
    RunSetupUI: {},
    DescriptionUtils: {},
    FeedbackUI: {},
    StoryUI: {
      unlockNextFragment: vi.fn(),
      showRunFragment: vi.fn(),
      displayFragment: vi.fn(),
      checkHiddenEnding: vi.fn(() => true),
      showNormalEnding: vi.fn(),
      showHiddenEnding: vi.fn(),
    },
    MazeSystem: { configure: vi.fn() },
    GameInit: { boot: vi.fn(), syncVolumeUI: vi.fn() },
    GameBootUI: {},
    SettingsUI: {},
    finalizeRunOutcome: vi.fn(),
    exposeGlobals: vi.fn(),
  };

  modules.featureScopes = {
    core: {
      GAME: modules.GAME,
      GS: modules.GS,
      DATA: modules.DATA,
      AudioEngine: modules.AudioEngine,
      ParticleSystem: modules.ParticleSystem,
      FovEngine: modules.FovEngine,
      ScreenShake: modules.ScreenShake,
      HitStop: modules.HitStop,
      GameInit: modules.GameInit,
    },
    title: {
      CharacterSelectUI: modules.CharacterSelectUI,
      HelpPauseUI: modules.HelpPauseUI,
      GameBootUI: modules.GameBootUI,
      SettingsUI: modules.SettingsUI,
    },
    combat: {
      CombatUI: modules.CombatUI,
      CombatHudUI: modules.CombatHudUI,
      HudUpdateUI: modules.HudUpdateUI,
      StatusEffectsUI: modules.StatusEffectsUI,
      DeckModalUI: modules.DeckModalUI,
      FeedbackUI: modules.FeedbackUI,
      TooltipUI: modules.TooltipUI,
    },
    run: {
      SaveSystem: modules.SaveSystem,
      MazeSystem: modules.MazeSystem,
      RunRules: modules.RunRules,
      getRegionData: modules.getRegionData,
      getBaseRegionIndex: modules.getBaseRegionIndex,
      getRegionCount: modules.getRegionCount,
      finalizeRunOutcome: modules.finalizeRunOutcome,
    },
    screen: {
      ScreenUI: modules.ScreenUI,
      StoryUI: modules.StoryUI,
      CodexUI: modules.CodexUI,
      EventUI: modules.EventUI,
      RewardUI: modules.RewardUI,
    },
  };

  return modules;
}

function createFns() {
  return {
    showWorldMemoryNotice: vi.fn(),
    startCombat: vi.fn(),
    advanceToNextRegion: vi.fn(),
    switchScreen: vi.fn(),
    updateUI: vi.fn(),
    updateNextNodes: vi.fn(),
    renderMinimap: vi.fn(),
    renderHand: vi.fn(),
    renderCombatCards: vi.fn(),
    updateEchoSkillBtn: vi.fn(),
    updateNoiseWidget: vi.fn(),
    updateStatusDisplay: vi.fn(),
    showCardPlayEffect: vi.fn(),
    showDmgPopup: vi.fn(),
    renderCombatEnemies: vi.fn(),
    showTurnBanner: vi.fn(),
    updateCombatLog: vi.fn(),
    showCharacterSelect: vi.fn(),
    continueRun: vi.fn(),
    openRunSettings: vi.fn(),
    openCodexFromTitle: vi.fn(),
    quitGame: vi.fn(),
    selectClass: vi.fn(),
    startGame: vi.fn(),
    backToTitle: vi.fn(),
    closeRunSettings: vi.fn(),
    shiftAscension: vi.fn(),
    toggleEndlessMode: vi.fn(),
    cycleRunCurse: vi.fn(),
    setMasterVolume: vi.fn(),
    setSfxVolume: vi.fn(),
    setAmbientVolume: vi.fn(),
    openSettings: vi.fn(),
    closeSettings: vi.fn(),
    drawCard: vi.fn(),
    endPlayerTurn: vi.fn(),
    useEchoSkill: vi.fn(),
  };
}

function createDeps() {
  return {
    getStoryDeps: vi.fn(() => ({ token: 'story-deps' })),
    patchRefs: vi.fn(),
    getSaveSystemDeps: vi.fn(() => ({ token: 'save-deps' })),
    getGameBootDeps: vi.fn(() => ({ token: 'game-boot-deps' })),
    getHelpPauseDeps: vi.fn(() => ({ token: 'help-pause-deps' })),
  };
}

describe('bootGame', () => {
  let originalWindow;
  let originalDocument;

  beforeEach(() => {
    vi.useFakeTimers();
    originalWindow = globalThis.window;
    originalDocument = globalThis.document;
    globalThis.window = {};
    globalThis.document = { body: {} };
    registerSubscribers.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
    globalThis.window = originalWindow;
    globalThis.document = originalDocument;
  });

  it('wires story system, init registrations, maze config, delayed character mount, and boot payload', () => {
    const modules = createModules();
    const fns = createFns();
    const deps = createDeps();

    const result = bootGame(modules, fns, deps);

    expect(modules.GAME.init).toHaveBeenCalledWith(modules.GS, modules.DATA, modules.AudioEngine, modules.ParticleSystem);
    expect(registerSubscribers).toHaveBeenCalledTimes(1);
    expect(modules.GAME.register).toHaveBeenCalledWith('storySystem', result.StorySystem);
    expect(deps.patchRefs).toHaveBeenCalledWith({ StorySystem: result.StorySystem });
    expect(modules.GAME.register).toHaveBeenCalledWith('advanceToNextRegion', fns.advanceToNextRegion);
    expect(modules.GAME.register).toHaveBeenCalledWith('finalizeRunOutcome', modules.finalizeRunOutcome);

    expect(modules.MazeSystem.configure).toHaveBeenCalledWith(expect.objectContaining({
      gs: modules.GS,
      fovEngine: modules.FovEngine,
      doc: globalThis.document,
      win: globalThis.window,
    }));

    expect(modules.CharacterSelectUI.mount).not.toHaveBeenCalled();
    vi.advanceTimersByTime(50);
    expect(modules.CharacterSelectUI.mount).toHaveBeenCalledTimes(1);
    expect(modules.CharacterSelectUI.mount).toHaveBeenCalledWith(expect.objectContaining({
      doc: globalThis.document,
      gs: modules.GS,
      audioEngine: modules.AudioEngine,
    }));

    expect(modules.GameInit.boot).toHaveBeenCalledWith(expect.objectContaining({
      token: 'run-deps',
      audioEngine: modules.AudioEngine,
      particleSystem: modules.ParticleSystem,
      helpPauseUI: modules.HelpPauseUI,
      gameBootUI: modules.GameBootUI,
      settingsUI: modules.SettingsUI,
    }));
    expect(typeof modules.GameInit.boot.mock.calls[0][0].actions.startGame).toBe('function');

    result.StorySystem.showRunFragment({ stage: 2 });
    expect(modules.StoryUI.showRunFragment).toHaveBeenCalledWith({ token: 'story-deps', stage: 2 });
  });
});
