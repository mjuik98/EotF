import { beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  buildLegacySurfaceRegistrationPayload: vi.fn(),
  executeLegacySurfaceRegistration: vi.fn(),
}));

vi.mock('../game/core/bootstrap/build_legacy_surface_registration_payload.js', () => ({
  buildLegacySurfaceRegistrationPayload: hoisted.buildLegacySurfaceRegistrationPayload,
}));

vi.mock('../game/core/bootstrap/execute_legacy_surface_registration.js', () => ({
  executeLegacySurfaceRegistration: hoisted.executeLegacySurfaceRegistration,
}));

import { registerLegacySurface } from '../game/core/bootstrap/register_legacy_surface.js';

describe('registerLegacySurface', () => {
  beforeEach(() => {
    hoisted.buildLegacySurfaceRegistrationPayload.mockReset();
    hoisted.executeLegacySurfaceRegistration.mockReset();
  });

  it('builds legacy surface registration payload and executes the expose flow', () => {
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
    const payload = {
      initArgs: [modules.GS, modules.DATA, modules.AudioEngine, modules.ParticleSystem],
      globals: { startGame: fns.startGame, drawCard: fns.drawCard },
    };

    hoisted.buildLegacySurfaceRegistrationPayload.mockReturnValue(payload);

    registerLegacySurface({ modules, fns });

    expect(hoisted.buildLegacySurfaceRegistrationPayload).toHaveBeenCalledWith({ modules, fns });
    expect(hoisted.executeLegacySurfaceRegistration).toHaveBeenCalledWith({ modules, payload });
  });
});
