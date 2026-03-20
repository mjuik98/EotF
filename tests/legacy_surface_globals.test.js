import { describe, expect, it } from 'vitest';

import { buildLegacySurfaceEngineGlobals } from '../game/core/bootstrap/legacy_surface_engine_globals.js';
import { buildLegacySurfaceSystemGlobals } from '../game/core/bootstrap/legacy_surface_system_globals.js';
import { buildLegacySurfaceUIGlobals } from '../game/core/bootstrap/legacy_surface_ui_globals.js';

describe('legacy surface global builders', () => {
  it('prefers scoped core modules over stale top-level engine aliases', () => {
    const modules = {
      AudioEngine: { id: 'stale-audio' },
      featureScopes: {
        core: {
          AudioEngine: { id: 'scoped-audio' },
          ParticleSystem: { id: 'scoped-particles' },
          ScreenShake: { id: 'scoped-shake' },
          HitStop: { id: 'scoped-hit-stop' },
          FovEngine: { id: 'scoped-fov' },
          DifficultyScaler: { id: 'scoped-difficulty' },
          RandomUtils: { id: 'scoped-random' },
        },
      },
      legacyModules: {
        AudioEngine: { id: 'legacy-audio' },
      },
    };

    const globals = buildLegacySurfaceEngineGlobals(modules);

    expect(globals).toMatchObject({
      AudioEngine: modules.featureScopes.core.AudioEngine,
      ParticleSystem: modules.featureScopes.core.ParticleSystem,
      ScreenShake: modules.featureScopes.core.ScreenShake,
      HitStop: modules.featureScopes.core.HitStop,
      FovEngine: modules.featureScopes.core.FovEngine,
      DifficultyScaler: modules.featureScopes.core.DifficultyScaler,
      RandomUtils: modules.featureScopes.core.RandomUtils,
    });
  });

  it('prefers scoped combat/core modules over top-level system aliases', () => {
    const modules = {
      RunRules: { id: 'stale-rules' },
      featureScopes: {
        core: {
          RunRules: { id: 'scoped-rules' },
          getRegionData: { id: 'scoped-region-data' },
          getBaseRegionIndex: { id: 'scoped-base-region-index' },
          getRegionCount: { id: 'scoped-region-count' },
          SaveSystem: { id: 'scoped-save' },
          CardCostUtils: { id: 'scoped-card-cost' },
          DescriptionUtils: { id: 'scoped-description' },
        },
        combat: {
          ClassMechanics: { id: 'scoped-class-mechanics' },
          SetBonusSystem: { id: 'scoped-set-bonus' },
        },
      },
      legacyModules: {
        RunRules: { id: 'legacy-rules' },
      },
    };

    const globals = buildLegacySurfaceSystemGlobals(modules);

    expect(globals).toMatchObject({
      RunRules: modules.featureScopes.core.RunRules,
      getRegionData: modules.featureScopes.core.getRegionData,
      getBaseRegionIndex: modules.featureScopes.core.getBaseRegionIndex,
      getRegionCount: modules.featureScopes.core.getRegionCount,
      ClassMechanics: modules.featureScopes.combat.ClassMechanics,
      SetBonusSystem: modules.featureScopes.combat.SetBonusSystem,
      SaveSystem: modules.featureScopes.core.SaveSystem,
      CardCostUtils: modules.featureScopes.core.CardCostUtils,
      DescriptionUtils: modules.featureScopes.core.DescriptionUtils,
      classMechanics: modules.featureScopes.combat.ClassMechanics,
    });
  });

  it('prefers scoped feature modules over stale top-level UI aliases', () => {
    const modules = {
      HelpPauseUI: { id: 'stale-help-pause' },
      featureScopes: {
        title: {
          TitleCanvasUI: { id: 'scoped-title-canvas' },
          ClassSelectUI: { id: 'scoped-class-select' },
          HelpPauseUI: { id: 'scoped-help-pause' },
        },
        combat: {
          CombatUI: { id: 'scoped-combat-ui' },
          DeckModalUI: { id: 'scoped-deck-modal' },
          CombatHudUI: { id: 'scoped-combat-hud' },
          HudUpdateUI: { id: 'scoped-hud-update' },
          StatusEffectsUI: { id: 'scoped-status-effects' },
          CombatActionsUI: { id: 'scoped-combat-actions' },
        },
        run: {
          RunModeUI: { id: 'scoped-run-mode' },
          RunSetupUI: { id: 'scoped-run-setup' },
        },
        screen: {
          ScreenUI: { id: 'scoped-screen' },
          TooltipUI: { id: 'scoped-tooltip' },
        },
        codex: {
          CodexUI: { id: 'scoped-codex' },
        },
        event: {
          EventUI: { id: 'scoped-event' },
        },
        reward: {
          RewardUI: { id: 'scoped-reward' },
        },
      },
      legacyModules: {
        HelpPauseUI: { id: 'legacy-help-pause' },
      },
    };

    const globals = buildLegacySurfaceUIGlobals(modules);

    expect(globals).toMatchObject({
      CodexUI: modules.featureScopes.codex.CodexUI,
      EventUI: modules.featureScopes.event.EventUI,
      CombatUI: modules.featureScopes.combat.CombatUI,
      DeckModalUI: modules.featureScopes.combat.DeckModalUI,
      RunModeUI: modules.featureScopes.run.RunModeUI,
      ScreenUI: modules.featureScopes.screen.ScreenUI,
      TitleCanvasUI: modules.featureScopes.title.TitleCanvasUI,
      ClassSelectUI: modules.featureScopes.title.ClassSelectUI,
      CombatHudUI: modules.featureScopes.combat.CombatHudUI,
      HudUpdateUI: modules.featureScopes.combat.HudUpdateUI,
      StatusEffectsUI: modules.featureScopes.combat.StatusEffectsUI,
      RewardUI: modules.featureScopes.reward.RewardUI,
      CombatActionsUI: modules.featureScopes.combat.CombatActionsUI,
      TooltipUI: modules.featureScopes.screen.TooltipUI,
      HelpPauseUI: modules.featureScopes.title.HelpPauseUI,
      RunSetupUI: modules.featureScopes.run.RunSetupUI,
    });
  });
});
