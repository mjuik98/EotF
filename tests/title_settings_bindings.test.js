import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../game/core/deps_factory.js', () => ({
  getClassSelectDeps: vi.fn(() => ({})),
  getRunModeDeps: vi.fn(() => ({})),
  getMetaProgressionDeps: vi.fn(() => ({})),
  getRegionTransitionDeps: vi.fn(() => ({})),
  getHelpPauseDeps: vi.fn(() => ({})),
  getRunSetupDeps: vi.fn(() => ({ token: 'run-setup-deps' })),
}));

vi.mock('../game/ui/title/intro_cinematic_ui.js', () => ({
  IntroCinematicUI: {
    play: vi.fn((_deps, onComplete) => onComplete?.()),
  },
}));

vi.mock('../game/ui/effects/echo_ripple_transition.js', () => ({
  startEchoRippleDissolve: vi.fn((overlayEl, deps = {}) => {
    overlayEl?.remove?.();
    deps.onComplete?.();
  }),
}));

import { createTitleSettingsBindings } from '../game/core/bindings/title_settings_bindings.js';
import { IntroCinematicUI } from '../game/ui/title/intro_cinematic_ui.js';
import { startEchoRippleDissolve } from '../game/ui/effects/echo_ripple_transition.js';

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
    expect(modules.RunSetupUI.startGame).toHaveBeenCalledTimes(1);
    expect(modules.RunSetupUI.startGame).toHaveBeenCalledWith({ token: 'run-setup-deps' });
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
    expect(modules.RunSetupUI.startGame).toHaveBeenCalledTimes(1);
    expect(modules.GS._preRunRipplePlayed).toBe(true);
  });
});
