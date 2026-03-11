import { describe, expect, it, vi } from 'vitest';
import { registerLegacySurface } from '../game/core/bootstrap/register_legacy_surface.js';

describe('registerLegacySurface', () => {
  it('composes engine, system, ui, and binding globals into a single expose call', () => {
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

    expect(modules.GAME.init).toHaveBeenCalledWith(
      modules.GS,
      modules.DATA,
      modules.AudioEngine,
      modules.ParticleSystem,
    );
    expect(exposeGlobals).toHaveBeenCalledTimes(1);
    expect(exposeGlobals).toHaveBeenCalledWith(expect.objectContaining({
      AudioEngine: modules.AudioEngine,
      RunRules: modules.RunRules,
      CombatUI: modules.CombatUI,
      startGame: fns.startGame,
      drawCard: fns.drawCard,
      classMechanics: modules.ClassMechanics,
    }));
  });
});
