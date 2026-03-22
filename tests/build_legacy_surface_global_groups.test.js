import { describe, expect, it, vi } from 'vitest';

import { buildLegacySurfaceGlobalGroups } from '../game/core/bootstrap/build_legacy_surface_global_groups.js';

describe('buildLegacySurfaceGlobalGroups', () => {
  it('prefers canonical scoped modules and only overlays explicit legacy compat bindings', () => {
    const modules = {
      HelpPauseUI: { id: 'stale-help-pause' },
      featureScopes: {
        core: {
          AudioEngine: { id: 'audio' },
          ParticleSystem: { id: 'particles' },
          FovEngine: { id: 'fov' },
          DifficultyScaler: { id: 'difficulty' },
          RandomUtils: { id: 'random' },
          RunRules: { id: 'rules' },
          getRegionData: vi.fn(),
          getBaseRegionIndex: vi.fn(),
          getRegionCount: vi.fn(),
          SaveSystem: { id: 'save' },
          CardCostUtils: { id: 'card-cost' },
          DescriptionUtils: { id: 'description' },
          ClassMechanics: { id: 'class-mechanics' },
          SetBonusSystem: { id: 'set-bonus' },
        },
        combat: {
          CombatUI: { id: 'combat-ui' },
          DeckModalUI: { id: 'deck-modal' },
          CombatHudUI: { id: 'combat-hud' },
          HudUpdateUI: { id: 'hud-update' },
          StatusEffectsUI: { id: 'status-effects' },
          CombatActionsUI: { id: 'combat-actions' },
        },
        run: {
          RunModeUI: { id: 'run-mode' },
          RunSetupUI: { id: 'run-setup' },
        },
        screen: {
          ScreenUI: { id: 'screen-ui' },
          TooltipUI: { id: 'tooltip-ui' },
        },
        title: {
          TitleCanvasUI: { id: 'title-canvas' },
          ClassSelectUI: { id: 'class-select' },
          HelpPauseUI: { id: 'scoped-help-pause' },
        },
        codex: {
          CodexUI: { id: 'codex-ui' },
        },
        event: {
          EventUI: { id: 'event-ui' },
        },
        reward: {
          RewardUI: { id: 'reward-ui' },
        },
      },
      legacyModules: {
        GAME: { id: 'legacy-game' },
      },
    };
    const fns = {
      startGame: vi.fn(),
    };

    const groups = buildLegacySurfaceGlobalGroups({ modules, fns });

    expect(groups.engine).toMatchObject({
      AudioEngine: modules.featureScopes.core.AudioEngine,
      ParticleSystem: modules.featureScopes.core.ParticleSystem,
      FovEngine: modules.featureScopes.core.FovEngine,
      DifficultyScaler: modules.featureScopes.core.DifficultyScaler,
      RandomUtils: modules.featureScopes.core.RandomUtils,
    });
    expect(groups.system).toMatchObject({
      RunRules: modules.featureScopes.core.RunRules,
      SaveSystem: modules.featureScopes.core.SaveSystem,
      ClassMechanics: modules.featureScopes.core.ClassMechanics,
      SetBonusSystem: modules.featureScopes.core.SetBonusSystem,
    });
    expect(groups.ui).toMatchObject({
      CodexUI: modules.featureScopes.codex.CodexUI,
      EventUI: modules.featureScopes.event.EventUI,
      CombatUI: modules.featureScopes.combat.CombatUI,
      RunModeUI: modules.featureScopes.run.RunModeUI,
      ScreenUI: modules.featureScopes.screen.ScreenUI,
      TitleCanvasUI: modules.featureScopes.title.TitleCanvasUI,
      ClassSelectUI: modules.featureScopes.title.ClassSelectUI,
      HelpPauseUI: modules.featureScopes.title.HelpPauseUI,
    });
    expect(groups.binding.startGame).toBe(fns.startGame);
  });
});
