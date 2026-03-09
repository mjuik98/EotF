import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../game/core/deps_factory.js', () => ({
  initDepsFactory: vi.fn(),
  getHudUpdateDeps: vi.fn(() => ({})),
}));

vi.mock('../game/core/bindings/canvas_bindings.js', () => ({
  createCanvasBindings: vi.fn(),
}));

vi.mock('../game/core/bindings/combat_bindings.js', () => ({
  createCombatBindings: vi.fn(),
}));

vi.mock('../game/core/bindings/event_reward_bindings.js', () => ({
  createEventRewardBindings: vi.fn(),
}));

vi.mock('../game/core/bindings/ui_bindings.js', () => ({
  createUIBindings: vi.fn(),
}));

vi.mock('../game/core/bindings/title_settings_bindings.js', () => ({
  createTitleSettingsBindings: vi.fn(),
}));

import { setupBindings } from '../game/core/event_bindings.js';

function createModules() {
  const registered = {};
  return {
    GAME: {
      API: {},
      Modules: registered,
      register: vi.fn((name, value) => {
        registered[name] = value;
      }),
    },
    AudioEngine: {},
    ParticleSystem: {},
    ScreenShake: {},
    HitStop: {},
    FovEngine: {},
    DifficultyScaler: {},
    RandomUtils: {},
    RunRules: {},
    getRegionData: vi.fn(),
    getBaseRegionIndex: vi.fn(),
    getRegionCount: vi.fn(),
    ClassMechanics: {},
    SetBonusSystem: {},
    SaveSystem: { getOutboxMetrics: vi.fn(), flushOutbox: vi.fn() },
    CardCostUtils: {},
    EventUI: {},
    CombatUI: {},
    HudUpdateUI: {},
    StatusEffectsUI: { updateStatusDisplay: vi.fn() },
    MazeSystem: {},
    StoryUI: {},
    CodexUI: {},
    EndingScreenUI: {},
    RunModeUI: {},
    MetaProgressionUI: {},
    HelpPauseUI: {},
    SettingsUI: {},
    TooltipUI: {},
    FeedbackUI: {},
    ScreenUI: {},
    RunSetupUI: {},
    RunStartUI: {},
    GameAPI: {},
    GameInit: { syncVolumeUI: vi.fn() },
    DescriptionUtils: {},
    _gameStarted: false,
  };
}

describe('setupBindings status effects registration', () => {
  let originalWindow;

  beforeEach(() => {
    originalWindow = globalThis.window;
    globalThis.window = {};
  });

  afterEach(() => {
    globalThis.window = originalWindow;
  });

  it('registers StatusEffectsUI on GAME.Modules', () => {
    const modules = createModules();

    setupBindings(modules);

    expect(modules.GAME.register).toHaveBeenCalledWith('StatusEffectsUI', modules.StatusEffectsUI);
    expect(modules.GAME.Modules.StatusEffectsUI).toBe(modules.StatusEffectsUI);
  });
});
