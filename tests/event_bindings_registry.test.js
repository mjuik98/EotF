import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../game/core/deps_factory.js', () => ({
  initDepsFactory: vi.fn(),
  getHudUpdateDeps: vi.fn(() => ({ token: 'hud-deps' })),
  getClassSelectDeps: vi.fn(() => ({ token: 'class-select-deps' })),
  getRunReturnDeps: vi.fn(() => ({ token: 'run-return-deps' })),
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

import { setupBindings } from '../game/core/event_bindings.js';

function createModules() {
  const registered = {};
  return {
    GAME: {
      API: {},
      Modules: registered,
      getDeps: vi.fn(() => ({ token: 'game-deps' })),
      getCombatDeps: vi.fn(() => ({ token: 'combat-deps' })),
      register: vi.fn((name, value) => {
        registered[name] = value;
      }),
    },
    GS: {},
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
    CombatUI: {
      showEnemyStatusTooltip: vi.fn(),
      hideEnemyStatusTooltip: vi.fn(),
    },
    CombatHudUI: { updateEchoSkillBtn: vi.fn() },
    HudUpdateUI: {
      updateUI: vi.fn(),
      processDirtyFlags: vi.fn(),
    },
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
    GameAPI: { applyPlayerDamage: vi.fn(), drawCards: vi.fn(), executePlayerDraw: vi.fn() },
    GameInit: { syncVolumeUI: vi.fn() },
    DescriptionUtils: {},
    _gameStarted: false,
  };
}

describe('event binding registry wiring', () => {
  let originalWindow;

  beforeEach(() => {
    originalWindow = globalThis.window;
    globalThis.window = {};
  });

  afterEach(() => {
    globalThis.window = originalWindow;
  });

  it('preserves special window hooks and API wrappers', () => {
    const modules = createModules();

    const fns = setupBindings(modules);

    expect(globalThis.window.startGame).toBe(fns.startGame);

    globalThis.window.updateUI();
    expect(modules.HudUpdateUI.updateUI).toHaveBeenCalledWith({ token: 'hud-deps' });

    globalThis.window.showEnemyStatusTooltip('evt', 'poisoned');
    expect(modules.CombatUI.showEnemyStatusTooltip).toHaveBeenCalledWith('evt', 'poisoned', { token: 'combat-deps' });

    globalThis.window.hideEnemyStatusTooltip();
    expect(modules.CombatUI.hideEnemyStatusTooltip).toHaveBeenCalledWith({ token: 'combat-deps' });

    globalThis.window._syncVolumeUI();
    expect(modules.GameInit.syncVolumeUI).toHaveBeenCalledWith(modules.AudioEngine);

    modules.GAME.API.updateUI();
    expect(modules.HudUpdateUI.updateUI).toHaveBeenCalledTimes(2);

    modules.GAME.API.processDirtyFlags();
    expect(modules.HudUpdateUI.processDirtyFlags).toHaveBeenCalledWith({ token: 'hud-deps' });
  });
});
