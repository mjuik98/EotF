import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../game/core/deps_factory.js', () => ({
  getClassSelectDeps: vi.fn(() => ({})),
  getGameBootDeps: vi.fn(() => ({ gs: { currentRegion: 2 }, data: { codex: 'game-boot-data' } })),
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
  getSettingsDeps: vi.fn(() => ({})),
  buildFeatureContractAccessors: vi.fn((contractMap, depsFactory) => Object.freeze(
    Object.fromEntries(
      Object.keys(contractMap).map((name) => [
        name,
        (overrides = {}) => ({
          ...(depsFactory?.[name]?.() || {}),
          ...overrides,
        }),
      ]),
    ),
  )),
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
import { silenceConsole } from './helpers/silence_console.js';

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
    silenceConsole(['error']);
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
    Deps.getGameBootDeps.mockReturnValueOnce({ gs: modules.GS, data: { codex: 'title-data' } });
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
    Deps.getGameBootDeps.mockReturnValueOnce({ gs: modules.GS, data: { codex: 'title-data' } });
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
    expect(runStartDeps.continueLoadedRun.mock.calls[0][0].currentRegion).toBe(2);
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

  it('prefers canonical feature scopes over stale flat module aliases', () => {
    const doc = createMockDocument();
    globalThis.document = doc;
    globalThis.window = {};

    const scopedCharacterSelectUI = { onEnter: vi.fn(), showPendingSummaries: vi.fn() };
    const scopedRunSetupStart = vi.fn();
    const scopedSaveLoad = vi.fn(() => true);
    const scopedGS = {};
    const modules = {
      ...createModules(),
      GS: { stale: true },
      SaveSystem: { loadRun: vi.fn(() => false) },
      CharacterSelectUI: { onEnter: vi.fn(), showPendingSummaries: vi.fn() },
      ClassSelectUI: { getSelectedClass: vi.fn(() => 'stale') },
      RunSetupUI: { startGame: vi.fn() },
      featureScopes: {
        core: {
          GS: scopedGS,
          SaveSystem: { loadRun: scopedSaveLoad },
        },
        title: {
          CharacterSelectUI: scopedCharacterSelectUI,
        },
        run: {
          RunSetupUI: { startGame: scopedRunSetupStart },
        },
      },
    };
    Deps.getGameBootDeps.mockReturnValueOnce({ gs: scopedGS, data: { codex: 'scoped-data' } });
    const fns = {};
    createTitleSettingsBindings(modules, fns);

    fns.showCharacterSelect();
    fns.startGame();
    fns.continueRun();

    expect(scopedCharacterSelectUI.onEnter).toHaveBeenCalledTimes(1);
    expect(modules.CharacterSelectUI.onEnter).not.toHaveBeenCalled();
    expect(scopedSaveLoad).toHaveBeenCalledTimes(1);
    expect(modules.SaveSystem.loadRun).not.toHaveBeenCalled();
    expect(scopedGS._preRunRipplePlayed).toBe(true);
    expect(modules.GS._preRunRipplePlayed).not.toBe(true);

    const runSetupDeps = Deps.getRunSetupDeps.mock.results.at(-1)?.value;
    expect(runSetupDeps.startGame).toHaveBeenCalledTimes(1);
    expect(scopedRunSetupStart).not.toHaveBeenCalled();
  });

  it('opens title codex with game-boot deps instead of stale flat module state', async () => {
    const doc = createMockDocument();
    globalThis.document = doc;
    globalThis.window = {};

    const scopedGs = { currentRegion: 7 };
    const scopedData = { codex: 'scoped-data' };
    const modules = {
      ...createModules(),
      GS: { stale: true },
      DATA: { stale: true },
      CodexUI: { openCodex: vi.fn() },
    };
    Deps.getGameBootDeps.mockReturnValueOnce({ gs: scopedGs, data: scopedData });

    const fns = {};
    createTitleSettingsBindings(modules, fns);

    await fns.openCodexFromTitle();

    expect(modules.CodexUI.openCodex).toHaveBeenCalledWith({
      gs: scopedGs,
      data: scopedData,
    });
  });

  it('falls back to legacy compat modules before stale top-level title aliases', () => {
    const doc = createMockDocument();
    globalThis.document = doc;
    globalThis.window = {};

    const compatCharacterSelectUI = { onEnter: vi.fn(), showPendingSummaries: vi.fn() };
    const compatGs = {};
    const compatSaveLoad = vi.fn(() => true);
    const modules = {
      ...createModules(),
      GS: { stale: true },
      SaveSystem: { loadRun: vi.fn(() => false) },
      CharacterSelectUI: { onEnter: vi.fn(), showPendingSummaries: vi.fn() },
      legacyModules: {
        GS: compatGs,
        SaveSystem: { loadRun: compatSaveLoad },
        CharacterSelectUI: compatCharacterSelectUI,
      },
    };
    Deps.getGameBootDeps.mockReturnValueOnce({ gs: compatGs, data: { codex: 'compat-data' } });
    Deps.getSaveSystemDeps.mockReturnValueOnce({});
    const fns = {};

    createTitleSettingsBindings(modules, fns);
    fns.showCharacterSelect();
    fns.continueRun();

    expect(compatCharacterSelectUI.onEnter).toHaveBeenCalledTimes(1);
    expect(modules.CharacterSelectUI.onEnter).not.toHaveBeenCalled();
    expect(compatSaveLoad).toHaveBeenCalledTimes(1);
    expect(modules.SaveSystem.loadRun).not.toHaveBeenCalled();
  });

  it('prefers screen-scoped settings ui over stale top-level aliases for close settings', () => {
    const doc = createMockDocument();
    globalThis.document = doc;
    globalThis.window = {};

    const scopedCloseSettings = vi.fn();
    const modules = {
      ...createModules(),
      SettingsUI: { closeSettings: vi.fn() },
      featureScopes: {
        screen: {
          SettingsUI: { closeSettings: scopedCloseSettings },
        },
      },
    };
    const fns = {};

    createTitleSettingsBindings(modules, fns);
    fns.closeSettings();

    expect(scopedCloseSettings).toHaveBeenCalledTimes(1);
    expect(modules.SettingsUI.closeSettings).not.toHaveBeenCalled();
  });

  it('prefers run-scoped RunModeUI over stale top-level aliases for open run settings', async () => {
    const doc = createMockDocument();
    globalThis.document = doc;
    globalThis.window = {};

    const scopedOpenSettings = vi.fn();
    const modules = {
      ...createModules(),
      RunModeUI: { openSettings: vi.fn() },
      featureScopes: {
        run: {
          RunModeUI: { openSettings: scopedOpenSettings },
        },
      },
    };
    const fns = {};

    createTitleSettingsBindings(modules, fns);
    await fns.openRunSettings();

    expect(scopedOpenSettings).toHaveBeenCalledTimes(1);
    expect(modules.RunModeUI.openSettings).not.toHaveBeenCalled();
  });
});
