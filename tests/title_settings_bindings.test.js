import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../game/core/deps_factory.js', () => ({
  getClassSelectDeps: vi.fn(() => ({})),
  getRunModeDeps: vi.fn(() => ({})),
  getMetaProgressionDeps: vi.fn(() => ({})),
  getRegionTransitionDeps: vi.fn(() => ({})),
  getHelpPauseDeps: vi.fn(() => ({})),
  getSaveSystemDeps: vi.fn(() => ({ gs: { currentRegion: 2 } })),
  getRunStartDeps: vi.fn(() => ({
    continueLoadedRun: vi.fn(({ currentRegion, loadRun, onBeforeResume, onAfterCanvasReady, setTimeoutFn }) => {
      loadRun?.();
      const runStartDeps = {
        markGameStarted: vi.fn(),
        switchScreen: vi.fn(),
        audioEngine: { startAmbient: vi.fn() },
        updateUI: vi.fn(),
        updateClassSpecialUI: vi.fn(),
        initGameCanvas: vi.fn(),
        gameLoop: vi.fn(),
        requestAnimationFrame: vi.fn(),
      };
      onBeforeResume?.(runStartDeps);
      runStartDeps.markGameStarted();
      runStartDeps.switchScreen('game');
      runStartDeps.audioEngine.startAmbient(currentRegion);
      runStartDeps.updateUI();
      runStartDeps.updateClassSpecialUI();
      setTimeoutFn?.(() => {
        runStartDeps.initGameCanvas();
        runStartDeps.requestAnimationFrame(runStartDeps.gameLoop);
        onAfterCanvasReady?.(runStartDeps);
      });
      return true;
    }),
    switchScreen: vi.fn(),
    markGameStarted: vi.fn(),
    audioEngine: { startAmbient: vi.fn() },
    updateUI: vi.fn(),
    updateClassSpecialUI: vi.fn(),
    initGameCanvas: vi.fn(),
    gameLoop: vi.fn(),
    requestAnimationFrame: vi.fn(),
  })),
  getRunSetupDeps: vi.fn(() => ({ token: 'run-setup-deps', startGame: vi.fn() })),
}));

vi.mock('../game/features/title/presentation/browser/intro_cinematic_ui.js', () => ({
  IntroCinematicUI: {
    play: vi.fn((_deps, onComplete) => onComplete?.()),
  },
}));

vi.mock('../game/platform/browser/effects/echo_ripple_transition.js', () => ({
  startEchoRippleDissolve: vi.fn((overlayEl, deps = {}) => {
    overlayEl?.remove?.();
    deps.onComplete?.();
  }),
}));

import { createTitleSettingsBindings } from '../game/core/bindings/title_settings_bindings.js';
import * as Deps from '../game/core/deps_factory.js';
import { IntroCinematicUI } from '../game/features/title/presentation/browser/intro_cinematic_ui.js';
import { startEchoRippleDissolve } from '../game/platform/browser/effects/echo_ripple_transition.js';

function createMockDocument() {
  const elements = {
    classSelectContainer: { addEventListener: vi.fn(), style: {} },
    mainTitleSubScreen: { style: {} },
    charSelectSubScreen: { style: {} },
  };

  return {
    body: { appendChild: vi.fn() },
    querySelectorAll: vi.fn(() => []),
    createElement: vi.fn(() => ({ style: {}, remove: vi.fn() })),
    getElementById: vi.fn((id) => elements[id] || null),
    elements,
  };
}

function createModules() {
  return {
    GS: {},
    AudioEngine: { playClick: vi.fn() },
    SaveSystem: { loadRun: vi.fn(() => true) },
    CharacterSelectUI: { onEnter: vi.fn(), showPendingSummaries: vi.fn() },
    ClassSelectUI: { getSelectedClass: vi.fn(() => 'swordsman') },
    RunSetupUI: { startGame: vi.fn() },
    GameInit: { saveVolumes: vi.fn() },
    RunModeUI: {},
    CodexUI: {},
    MetaProgressionUI: {},
    RegionTransitionUI: {},
    HelpPauseUI: {},
    RandomUtils: {},
  };
}

describe('title start flow transition', () => {
  let originalDocument;
  let originalWindow;

  beforeEach(() => {
    originalDocument = globalThis.document;
    originalWindow = globalThis.window;
    vi.clearAllMocks();
  });

  afterEach(() => {
    globalThis.document = originalDocument;
    globalThis.window = originalWindow;
  });

  it('plays pre-run ripple before intro cinematic and run setup start', () => {
    const doc = createMockDocument();
    globalThis.document = doc;
    globalThis.window = {};

    const modules = createModules();
    const fns = {};
    createTitleSettingsBindings(modules, fns);

    fns.startGame();

    expect(startEchoRippleDissolve).toHaveBeenCalledTimes(1);
    expect(IntroCinematicUI.play).toHaveBeenCalledTimes(1);
    const runSetupDeps = Deps.getRunSetupDeps.mock.results.at(-1)?.value;
    expect(runSetupDeps.startGame).toHaveBeenCalledTimes(1);
    expect(modules.RunSetupUI.startGame).not.toHaveBeenCalled();
    expect(modules.GS._preRunRipplePlayed).toBe(true);
    expect(doc.elements.mainTitleSubScreen.style.display).toBe('none');
    expect(doc.elements.charSelectSubScreen.style.display).toBe('none');
  });

  it('continues run start flow even if pre-run ripple fails', () => {
    startEchoRippleDissolve.mockImplementationOnce(() => {
      throw new Error('ripple fail');
    });
    const doc = createMockDocument();
    globalThis.document = doc;
    globalThis.window = {};

    const modules = createModules();
    const fns = {};
    createTitleSettingsBindings(modules, fns);

    fns.startGame();

    expect(IntroCinematicUI.play).toHaveBeenCalledTimes(1);
    const runSetupDeps = Deps.getRunSetupDeps.mock.results.at(-1)?.value;
    expect(runSetupDeps.startGame).toHaveBeenCalledTimes(1);
    expect(modules.RunSetupUI.startGame).not.toHaveBeenCalled();
    expect(modules.GS._preRunRipplePlayed).toBe(true);
  });

  it('loads save data and switches directly into gameplay on continue', () => {
    vi.useFakeTimers();
    const doc = createMockDocument();
    globalThis.document = doc;
    globalThis.window = {};

    const modules = createModules();
    const fns = { renderMinimap: vi.fn(), updateNextNodes: vi.fn() };
    createTitleSettingsBindings(modules, fns);

    fns.continueRun();
    vi.advanceTimersByTime(90);

    const runStartDeps = Deps.getRunStartDeps.mock.results.at(-1)?.value;
    expect(modules.SaveSystem.loadRun).toHaveBeenCalledTimes(1);
    expect(runStartDeps.continueLoadedRun).toHaveBeenCalledTimes(1);
    expect(fns.renderMinimap).toHaveBeenCalledTimes(1);
    expect(fns.updateNextNodes).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it('does not replay run summary when merely opening character select', () => {
    const doc = createMockDocument();
    globalThis.document = doc;
    globalThis.window = {};

    const modules = createModules();
    modules.CharacterSelectUI.onEnter = vi.fn();
    modules.CharacterSelectUI.showPendingSummaries = vi.fn();

    const fns = {};
    createTitleSettingsBindings(modules, fns);

    fns.showCharacterSelect();

    expect(modules.CharacterSelectUI.onEnter).toHaveBeenCalledTimes(1);
    expect(modules.CharacterSelectUI.showPendingSummaries).not.toHaveBeenCalled();
    expect(doc.elements.mainTitleSubScreen.style.display).toBe('none');
    expect(doc.elements.charSelectSubScreen.style.display).toBe('block');
  });
});
