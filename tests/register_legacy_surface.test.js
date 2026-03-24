import { beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  registerLegacyBridge: vi.fn(),
}));

vi.mock('../game/platform/legacy/register_legacy_bridge.js', () => ({
  registerLegacyBridge: hoisted.registerLegacyBridge,
}));

import { registerLegacySurface } from '../game/core/bootstrap/register_legacy_surface.js';

describe('registerLegacySurface', () => {
  beforeEach(() => {
    hoisted.registerLegacyBridge.mockReset();
  });

  it('delegates legacy surface registration through the platform legacy bridge facade', () => {
    const exposeGlobals = vi.fn();
    const modules = {
      GAME: { init: vi.fn() },
      GS: {},
      DATA: {},
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
      SaveSystem: {},
      CardCostUtils: {},
      DescriptionUtils: {},
      CodexUI: {},
      EventUI: {},
      CombatUI: {},
      DeckModalUI: {},
      RunModeUI: {},
      ScreenUI: {},
      TitleCanvasUI: {},
      ClassSelectUI: {},
      CombatHudUI: {},
      HudUpdateUI: {},
      StatusEffectsUI: {},
      RewardUI: {},
      CombatActionsUI: {},
      TooltipUI: {},
      HelpPauseUI: {},
      RunSetupUI: {},
      exposeGlobals,
    };
    const fns = { startGame: vi.fn(), drawCard: vi.fn() };

    registerLegacySurface({ modules, fns });

    expect(hoisted.registerLegacyBridge).toHaveBeenCalledWith({ modules, fns });
  });
});
