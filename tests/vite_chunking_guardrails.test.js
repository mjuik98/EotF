import { describe, expect, it } from 'vitest';
import { filterLazyChunkModulePreloads, getManualChunk } from '../vite.config.js';
import { readText } from './helpers/guardrail_fs.js';

describe('vite chunking guardrails', () => {
  it('splits gameplay-heavy browser code into focused feature chunks instead of one ui-gameplay bucket', () => {
    const source = readText('vite.config.js');

    expect(source).toContain("return 'ui-combat';");
    expect(source).toContain("return 'ui-combat-copy';");
    expect(source).toContain("return 'ui-combat-deck';");
    expect(source).toContain("return 'ui-combat-chronicle';");
    expect(source).toContain("return 'ui-combat-tooltips';");
    expect(source).toContain("return 'ui-shell';");
    expect(source).toContain("return 'ui-reward';");
    expect(source).toContain("return 'ui-reward-options';");
    expect(source).toContain("return 'ui-run-mode-runtime';");
    expect(source).toContain("return 'ui-event';");
    expect(source).toContain("return 'ui-event-overlays';");
    expect(source).toContain("return 'ui-support';");
    expect(source).toContain("return 'ui-shared-data';");
    expect(source).toContain("return 'ui-shell-hotkeys';");
    expect(source).toContain("return 'ui-settings-core';");
    expect(source).toContain("return 'ui-settings-hotkeys';");
  });

  it('targets canonical feature-owned browser paths instead of transitional ui/presentation screen paths', () => {
    const source = readText('vite.config.js');

    expect(source).toContain("/game/features/event/presentation/browser/");
    expect(source).toContain("/game/features/reward/presentation/browser/");
    expect(source).toContain("/game/features/ui/presentation/browser/ending_");
    expect(source).toContain("/game/features/ui/presentation/browser/story_");
    expect(source).toContain("/game/features/ui/presentation/browser/settings_ui.js");
    expect(source).toContain("/game/features/ui/ports/public_audio_presentation_capabilities.js");
    expect(source).toContain("/game/features/meta_progression/public.js");
    expect(source).toContain("/game/features/run/presentation/browser/run_mode_ui.js");
    expect(source).not.toContain("/game/presentation/screens/event_");
    expect(source).not.toContain("/game/ui/screens/event_");
    expect(source).not.toContain("/game/presentation/screens/reward_");
    expect(source).not.toContain("/game/ui/screens/reward_");
    expect(source).not.toContain("/game/ui/screens/settings_ui.js");
    expect(source).not.toContain("/game/ui/run/run_mode_ui.js");
  });

  it('filters lazy feature chunks out of html modulepreload dependencies', () => {
    const deps = [
      'assets/ui-combat-abc.js',
      'assets/ui-combat-copy-abc.js',
      'assets/ui-combat-deck-abc.js',
      'assets/ui-combat-chronicle-abc.js',
      'assets/ui-combat-status-abc.js',
      'assets/ui-combat-tooltips-abc.js',
      'assets/ui-event-abc.js',
      'assets/ui-event-overlays-abc.js',
      'assets/ui-reward-abc.js',
      'assets/ui-reward-options-abc.js',
      'assets/ui-run-mode-runtime-abc.js',
      'assets/ui-run-mode-config-abc.js',
      'assets/ui-shell-abc.js',
      'assets/ui-shell-hotkeys-abc.js',
      'assets/ui-settings-abc.js',
      'assets/ui-settings-core-abc.js',
      'assets/ui-settings-hotkeys-abc.js',
      'assets/ui-run-mode-abc.js',
      'assets/data-cards-abc.js',
      'assets/data-items-abc.js',
      'assets/vendor-abc.js',
    ];

    expect(filterLazyChunkModulePreloads(deps, { hostType: 'html', hostId: 'index.html' })).toEqual([
      'assets/vendor-abc.js',
    ]);
    expect(filterLazyChunkModulePreloads(deps, { hostType: 'js', hostId: 'game/core/main.js' })).toEqual(deps);
  });

  it('keeps status data and status utils on the combat chunk so tooltip-only helpers do not create circular subchunks', () => {
    expect(getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/data/status_key_data.js')).toBe('ui-combat');
    expect(getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/utils/status_value_utils.js')).toBe('ui-combat');
  });

  it('routes shared combat copy data into its own shared chunk', () => {
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/combat/presentation/browser/combat_copy.js'),
    ).toBe('ui-combat-copy');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/combat/presentation/browser/combat_keyword_copy.js'),
    ).toBe('ui-combat-copy');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/combat/presentation/browser/combat_surface_state.js'),
    ).toBe('ui-combat-copy');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/combat/presentation/browser/combat_relic_rail_ui.js'),
    ).toBe('ui-combat');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/combat/presentation/browser/combat_relic_visuals.js'),
    ).toBe('ui-combat');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/combat/presentation/browser/item_tooltip_fallback_text.js'),
    ).toBe('ui-combat');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/combat/presentation/browser/item_detail_navigation.js'),
    ).toBe('ui-combat');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/combat/presentation/browser/item_detail_state.js'),
    ).toBe('ui-combat');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/combat/presentation/browser/item_detail_view_model.js'),
    ).toBe('ui-combat');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/combat/presentation/browser/item_detail_panel_ui.js'),
    ).toBe('ui-combat');
  });

  it('splits reward option rendering helpers into a dedicated reward subchunk', () => {
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/reward/presentation/browser/reward_ui_options.js'),
    ).toBe('ui-reward-options');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/reward/presentation/browser/reward_ui_option_renderers.js'),
    ).toBe('ui-reward-options');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/reward/presentation/browser/reward_ui_option_bindings.js'),
    ).toBe('ui-reward-options');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/reward/presentation/browser/show_reward_screen_runtime.js'),
    ).toBe('ui-reward');
  });

  it('splits heavy event overlays into a dedicated lazy event subchunk', () => {
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/event/presentation/browser/event_ui_item_shop.js'),
    ).toBe('ui-event-overlays');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/event/presentation/browser/event_ui_card_discard.js'),
    ).toBe('ui-event-overlays');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/event/presentation/browser/event_rest_site_presenter.js'),
    ).toBe('ui-event-overlays');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/event/presentation/browser/event_ui_particles.js'),
    ).toBe('ui-event-overlays');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/event/presentation/browser/event_ui_runtime_helpers.js'),
    ).toBe('ui-event');
  });

  it('keeps combat status tooltip runtime and metadata on the main combat chunk to avoid circular combat subchunks', () => {
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/data/status_tooltip_meta_data.js'),
    ).toBe('ui-combat');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/combat/presentation/browser/status_tooltip_builder.js'),
    ).toBe('ui-combat');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/combat/presentation/browser/status_tooltip_runtime_ui.js'),
    ).toBe('ui-combat');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/combat/presentation/browser/combat_enemy_status_tooltip_ui.js'),
    ).toBe('ui-combat');
  });

  it('routes cross-feature ui support ports into a shared support chunk instead of leaving shell and combat to import each other', () => {
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/shared/ui/tooltip/tooltip_trigger_bindings.js'),
    ).toBe('ui-support');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/shared/ui/item_detail/item_detail_panel_ui.js'),
    ).toBe(null);
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/shared/ui/state/ui_surface_state_controller.js'),
    ).toBe(null);
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/run/presentation/browser/run_mode_text_highlight.js'),
    ).toBe(null);
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/platform/browser/dom/public.js'),
    ).toBe('ui-support');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/shared/ui/tooltip/public.js'),
    ).toBe('ui-support');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/shared/logging/public.js'),
    ).toBe('ui-support');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/ui/ports/public_feature_support_capabilities.js'),
    ).toBe(null);
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/ui/ports/public_text_support_capabilities.js'),
    ).toBe('ui-support');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/ui/ports/public_dom_support_capabilities.js'),
    ).toBe('ui-support');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/ui/ports/public_shared_support_capabilities.js'),
    ).toBe(null);
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/ui/ports/public_tooltip_support_capabilities.js'),
    ).toBe('ui-support');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/ui/ports/public_audio_support_capabilities.js'),
    ).toBe('ui-support');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/ui/ports/public_runtime_debug_support_capabilities.js'),
    ).toBe('ui-support');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/ui/ports/public_binding_ref_support_capabilities.js'),
    ).toBe('ui-support');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/ui/ports/public_card_cost_support_capabilities.js'),
    ).toBe(null);
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/ui/ports/public_logging_support_capabilities.js'),
    ).toBe('ui-support');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/ui/ports/public_reward_return_support_capabilities.js'),
    ).toBe('ui-support');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/utils/public_feature_support.js'),
    ).toBe(null);
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/shared/public_feature_support.js'),
    ).toBe(null);
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/ui/ports/contracts/build_ui_shell_contracts.js'),
    ).toBe('ui-support');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/ui/ports/contracts/public_ui_contract_capabilities.js'),
    ).toBe('ui-support');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/title/ports/public_help_pause_application_capabilities.js'),
    ).toBe('ui-support');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/codex/platform/browser/ensure_codex_modal_shell.js'),
    ).toBe(null);
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/codex/presentation/browser/codex_ui_style.js'),
    ).toBe(null);
  });

  it('keeps progression helpers out of the shell chunk so content data does not form circular chunk graphs', () => {
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/run/presentation/browser/run_mode_ui_runtime.js'),
    ).toBe('ui-run-mode-runtime');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/ui/ports/public_audio_presentation_capabilities.js'),
    ).toBe('ui-shell');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/meta_progression/public.js'),
    ).toBe('ui-shared-data');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/platform/browser/effects/echo_ripple_transition.js'),
    ).toBe('ui-shared-data');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/data/game_data.js'),
    ).toBe('ui-shared-data');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/data/death_quotes.js'),
    ).toBe('ui-shared-data');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/run/domain/run_rules_curses.js'),
    ).toBe('ui-shared-data');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/run/presentation/browser/run_mode_ui_render.js'),
    ).toBe('ui-run-mode-runtime');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/run/presentation/browser/run_mode_ui_presets_render.js'),
    ).toBe('ui-run-mode-runtime');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/run/presentation/browser/run_mode_ui_summary_render.js'),
    ).toBe('ui-run-mode-runtime');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/run/presentation/browser/run_mode_ui_inscriptions_render.js'),
    ).toBe('ui-run-mode-runtime');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/shared/progression/set_bonus_catalog.js'),
    ).toBe(null);
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/shared/progression/set_bonus_helpers.js'),
    ).toBe(null);
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/shared/progression/set_bonus_system.js'),
    ).toBe(null);
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/shared/progression/set_bonus_trigger_effects.js'),
    ).toBe(null);
  });

  it('routes shared progression and meta unlock logic through a dedicated shared-data chunk instead of forcing shell/combat to import each other', () => {
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/data/class_metadata.js'),
    ).toBe('data-classes');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/data/events_data.js'),
    ).toBe('data-events');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/meta_progression/application/class_loadout_preset_use_case.js'),
    ).toBe(null);
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/meta_progression/domain/class_loadout_preset_helpers.js'),
    ).toBe(null);
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/meta_progression/domain/achievement_definitions.js'),
    ).toBe('ui-shared-data');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/meta_progression/application/evaluate_achievement_trigger.js'),
    ).toBe('ui-shared-data');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/title/domain/class_progression/runtime_apply.js'),
    ).toBe(null);
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/title/domain/class_progression_system.js'),
    ).toBe(null);
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/title/application/load_character_select_use_case.js'),
    ).toBe(null);
  });

  it('keeps meta progression content labels on a dedicated shared data chunk through application-owned queries instead of pulling the run content port into overlay chunks', () => {
    const contentUnlockQueries = readText('game/features/meta_progression/application/content_unlock_progression_queries.js');
    const runContentCapabilities = readText('game/features/run/ports/public_content_capabilities.js');

    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/meta_progression/application/content_unlock_progression_queries.js'),
    ).toBe('ui-shared-data');
    expect(runContentCapabilities).toContain("from './public_data_runtime_capabilities.js'");
    expect(runContentCapabilities).toContain("from '../domain/run_rules_curses.js'");
    expect(contentUnlockQueries).toContain('../../run/ports/public_content_capabilities.js');
  });

  it('routes title and character-select progression flows through narrow feature ports instead of broad public barrels', () => {
    const titleRunArchiveHelpers = readText('game/features/title/presentation/browser/title_run_archive_helpers.js');
    const characterSelectProgression = readText('game/features/title/application/load_character_select_use_case.js');
    const characterSelectLoadout = readText('game/features/title/platform/browser/character_select_mount_loadout.js');
    const characterSelectMountRuntime = readText('game/features/title/platform/browser/create_character_select_mount_runtime.js');
    const characterSelectRuntimeBindings = readText('game/features/title/platform/browser/character_select_runtime_progression_bindings.js');
    const rewardUiHelpers = readText('game/features/reward/presentation/browser/reward_ui_helpers.js');
    const rewardScreenRuntimeHelpers = readText('game/features/reward/presentation/browser/reward_screen_runtime_helpers.js');
    const runModeUi = readText('game/features/run/presentation/browser/run_mode_ui.js');
    const runModeUiRender = readText('game/features/run/presentation/browser/run_mode_ui_render.js');
    const runModeUiRuntime = readText('game/features/run/presentation/browser/run_mode_ui_runtime.js');
    const codexPopupPayloads = readText('game/features/codex/presentation/browser/codex_ui_popup_payloads.js');
    const codexProgressionQueries = readText('game/features/codex/application/codex_progression_queries.js');
    const endingScreenHelpers = readText('game/features/ui/presentation/browser/ending_screen_helpers.js');

    expect(titleRunArchiveHelpers).toContain("../../../meta_progression/ports/public_roadmap_capabilities.js");
    expect(titleRunArchiveHelpers).toContain("../../../run/ports/public_analytics_capabilities.js");
    expect(titleRunArchiveHelpers).not.toContain("../../../meta_progression/public.js");
    expect(titleRunArchiveHelpers).not.toContain("../../../run/public.js");
    expect(characterSelectProgression).toContain('../../meta_progression/ports/public_unlock_application_capabilities.js');
    expect(characterSelectProgression).not.toContain('../../meta_progression/public.js');
    expect(characterSelectLoadout).toContain('../../../meta_progression/ports/public_unlock_capabilities.js');
    expect(characterSelectLoadout).not.toContain('../../../meta_progression/public.js');
    expect(characterSelectMountRuntime).toContain("../../ports/public_character_select_progression_capabilities.js");
    expect(characterSelectMountRuntime).not.toContain("../../application/load_character_select_use_case.js");
    expect(characterSelectRuntimeBindings).toContain("../../ports/public_character_select_progression_capabilities.js");
    expect(characterSelectRuntimeBindings).not.toContain("../../application/load_character_select_use_case.js");
    expect(rewardUiHelpers).toContain("../../../meta_progression/ports/public_unlock_capabilities.js");
    expect(rewardUiHelpers).not.toContain("../../../meta_progression/public.js");
    expect(rewardScreenRuntimeHelpers).toContain("../../../meta_progression/ports/public_unlock_capabilities.js");
    expect(rewardScreenRuntimeHelpers).not.toContain("../../../meta_progression/public.js");
    expect(runModeUi).toContain("../../../meta_progression/ports/public_unlock_capabilities.js");
    expect(runModeUi).not.toContain("../../../meta_progression/public.js");
    expect(runModeUiRender).toContain("../../../meta_progression/ports/public_unlock_capabilities.js");
    expect(runModeUiRender).not.toContain("../../../meta_progression/public.js");
    expect(runModeUiRuntime).toContain("../../../meta_progression/ports/public_unlock_capabilities.js");
    expect(runModeUiRuntime).not.toContain("../../../meta_progression/public.js");
    expect(codexPopupPayloads).toContain("../../../meta_progression/ports/public_unlock_capabilities.js");
    expect(codexPopupPayloads).not.toContain("../../../meta_progression/public.js");
    expect(codexProgressionQueries).toContain("../../meta_progression/ports/public_unlock_application_capabilities.js");
    expect(codexProgressionQueries).toContain("../../meta_progression/ports/public_achievement_capabilities.js");
    expect(codexProgressionQueries).not.toContain("../../meta_progression/public.js");
    expect(endingScreenHelpers).toContain("../../../meta_progression/ports/public_unlock_application_capabilities.js");
    expect(endingScreenHelpers).toContain("../../../meta_progression/ports/public_achievement_capabilities.js");
    expect(endingScreenHelpers).not.toContain("../../../meta_progression/public.js");
  });

  it('keeps combat runtime modules on narrow data catalogs instead of the aggregated game_data surface', () => {
    const cardMethodsFacade = readText('game/features/combat/application/card_methods_facade.js');
    const deathFlowRuntimeSupport = readText('game/features/combat/application/death_flow_runtime_support.js');
    const deathSpawnRuntime = readText('game/features/combat/platform/death_spawn_runtime.js');
    const startPlayerTurnPolicy = readText('game/features/combat/domain/turn/start_player_turn_policy.js');

    expect(cardMethodsFacade).not.toContain("from '../../../../data/game_data.js'");
    expect(deathFlowRuntimeSupport).not.toContain("from '../../../../data/game_data.js'");
    expect(deathSpawnRuntime).not.toContain("from '../../../../data/game_data.js'");
    expect(startPlayerTurnPolicy).not.toContain("from '../../../../../data/game_data.js'");
  });

  it('keeps SettingsManager in a dedicated settings-support chunk so shell overlays do not own settings persistence code', () => {
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/core/settings_manager.js'),
    ).toBe('ui-settings-core');
  });

  it('splits settings keybinding and rebind helpers away from the main settings chunk', () => {
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/ui/presentation/browser/settings_ui_keybinding_helpers.js'),
    ).toBe('ui-settings-hotkeys');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/ui/presentation/browser/settings_ui_runtime_helpers.js'),
    ).toBe('ui-settings-hotkeys');
  });

  it('splits help/pause hotkey helpers away from the main shell overlay chunk', () => {
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/ui/presentation/browser/help_pause_keybinding_helpers.js'),
    ).toBe('ui-shell-hotkeys');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/ui/presentation/browser/help_pause_run_hotkey_state.js'),
    ).toBe('ui-shell-hotkeys');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/ui/presentation/browser/help_pause_visibility.js'),
    ).toBe('ui-shell-hotkeys');
  });

  it('keeps title help/pause action modules on the shared shell-support chunk instead of the combat chunk', () => {
    const helpPauseAbandonActions = readText('game/features/title/application/help_pause_abandon_actions.js');

    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/title/application/help_pause_title_actions.js'),
    ).toBe('ui-support');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/title/application/help_pause_menu_actions.js'),
    ).toBe('ui-support');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/title/application/help_pause_abandon_actions.js'),
    ).toBe('ui-support');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/title/application/title_return_actions.js'),
    ).toBe('ui-support');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/title/application/ending_action_ports.js'),
    ).toBe('ui-support');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/title/ports/public_help_pause_application_capabilities.js'),
    ).toBe('ui-support');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/ui/presentation/browser/help_pause_ui_abandon_runtime.js'),
    ).toBe(null);

    expect(helpPauseAbandonActions).not.toContain("../../combat/ports/public_application_capabilities.js");
    expect(helpPauseAbandonActions).not.toContain("../ports/public_help_pause_presentation_capabilities.js");
  });

  it('keeps run config state commands on a dedicated config chunk so runtime-only rendering stays within budget without chunk cycles', () => {
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/run/state/run_config_state_commands.js'),
    ).toBe('ui-run-mode-config');
  });

  it('uses narrow title capability surfaces instead of the broad public application barrel in overlay-related runtimes', () => {
    const endingActionHelpers = readText('game/features/ui/presentation/browser/ending_screen_action_helpers.js');
    const metaProgressionRuntime = readText('game/features/ui/presentation/browser/meta_progression_ui_runtime.js');
    const hiddenEndingRender = readText('game/features/ui/presentation/browser/story_ui_hidden_ending_render.js');
    const helpPauseAbandonRuntime = readText('game/features/ui/presentation/browser/help_pause_ui_abandon_runtime.js');
    const helpPauseReturnRuntime = readText('game/features/ui/presentation/browser/help_pause_ui_return_runtime.js');
    const helpPauseMenuRuntime = readText('game/features/ui/presentation/browser/help_pause_menu_runtime_ui.js');
    const shellContracts = readText('game/features/ui/ports/contracts/build_ui_shell_contracts.js');
    const helpPauseContract = readText('game/features/ui/ports/contracts/build_ui_help_pause_contract.js');
    const nextNodeInteractions = readText('game/features/run/presentation/browser/map_ui_next_nodes_interactions.js');
    const runRules = readText('game/features/run/application/run_rules.js');
    const runRuleMeta = readText('game/features/run/application/run_rule_meta.js');
    const runRuleLifecycle = readText('game/features/run/application/run_rule_lifecycle.js');
    const runRuleOutcome = readText('game/features/run/application/run_rule_outcome.js');
    const runOutcomeExternalPorts = readText('game/features/run/application/run_outcome_external_ports.js');
    const runRuleProgressionPorts = readText('game/features/run/ports/create_run_rule_progression_ports.js');
    const worldRenderActions = readText('game/features/run/application/world_render_actions.js');
    const worldRenderRuntimePorts = readText('game/features/run/ports/create_run_world_render_runtime_ports.js');
    const runMapActions = readText('game/features/run/application/run_map_actions.js');
    const runMapRuntimePorts = readText('game/features/run/ports/create_run_map_runtime_ports.js');
    const itemShopActions = readText('game/features/event/application/item_shop_actions.js');
    const itemShopPolicyPorts = readText('game/features/event/ports/item_shop_policy_ports.js');
    const rewardOptions = readText('game/features/reward/application/build_reward_options_use_case.js');
    const rewardOptionPolicyPorts = readText('game/features/reward/ports/reward_option_policy_ports.js');
    const rewardActions = readText('game/features/reward/application/create_reward_runtime_actions.js');
    const rewardNavigation = readText('game/features/reward/application/reward_navigation_actions.js');
    const rewardRuntimeActionPorts = readText('game/features/reward/ports/create_reward_runtime_action_ports.js');
    const frontdoorFlow = readText('game/features/frontdoor/application/create_frontdoor_flow_actions.js');
    const frontdoorCodexRuntimePorts = readText('game/features/frontdoor/ports/create_frontdoor_codex_runtime_ports.js');
    const endPlayerTurn = readText('game/features/combat/application/end_player_turn_use_case.js');
    const combatTimingPorts = readText('game/features/combat/ports/public_runtime_timing_capabilities.js');

    expect(endingActionHelpers).toContain("../../../title/ports/public_ending_application_capabilities.js");
    expect(metaProgressionRuntime).toContain("../../../title/ports/public_ending_application_capabilities.js");
    expect(hiddenEndingRender).toContain("../../../title/ports/public_ending_application_capabilities.js");

    expect(helpPauseAbandonRuntime).toContain("../../../title/ports/public_help_pause_application_capabilities.js");
    expect(helpPauseReturnRuntime).toContain("../../../title/ports/public_help_pause_application_capabilities.js");
    expect(helpPauseMenuRuntime).toContain("../../../title/ports/public_help_pause_application_capabilities.js");
    expect(shellContracts).toContain("./build_ui_help_pause_contract.js");
    expect(helpPauseContract).toContain("../../../frontdoor/ports/public_application_capabilities.js");
    expect(nextNodeInteractions).toContain("../../../ui/ports/public_help_pause_hotkey_capabilities.js");
    expect(nextNodeInteractions).not.toContain("public_help_pause_presentation_capabilities.js");

    expect(runRuleMeta).toContain("../ports/create_run_rule_progression_ports.js");
    expect(runRuleLifecycle).toContain("../ports/create_run_rule_progression_ports.js");
    expect(runRuleProgressionPorts).toContain("../../title/ports/public_class_progression_capabilities.js");
    expect(runRuleProgressionPorts).toContain("../../meta_progression/ports/public_achievement_application_capabilities.js");
    expect(runRuleOutcome).toContain("./run_outcome_external_ports.js");
    expect(runOutcomeExternalPorts).toContain("../ports/create_run_outcome_integration_ports.js");
    expect(runOutcomeExternalPorts).not.toContain("../../title/ports/public_progression_capabilities.js");
    expect(worldRenderActions).toContain("../ports/create_run_world_render_runtime_ports.js");
    expect(worldRenderActions).not.toContain('modules.WorldRenderLoopUI');
    expect(worldRenderActions).not.toContain('modules.WorldCanvasUI');
    expect(worldRenderRuntimePorts).toContain('modules.WorldRenderLoopUI');
    expect(worldRenderRuntimePorts).toContain('modules.WorldCanvasUI');
    expect(runMapActions).toContain("../ports/create_run_map_runtime_ports.js");
    expect(runMapActions).not.toContain('modules.MapGenerationUI');
    expect(runMapActions).not.toContain('modules.MapUI');
    expect(runMapActions).not.toContain('modules.MapNavigationUI');
    expect(runMapRuntimePorts).toContain('modules.MapGenerationUI');
    expect(runMapRuntimePorts).toContain('modules.MapUI');
    expect(runMapRuntimePorts).toContain('modules.MapNavigationUI');
    expect(itemShopActions).toContain("../ports/item_shop_policy_ports.js");
    expect(itemShopActions).not.toContain("../../meta_progression/public.js");
    expect(itemShopPolicyPorts).toContain("../../meta_progression/ports/public_unlock_capabilities.js");
    expect(rewardOptions).toContain("../ports/reward_option_policy_ports.js");
    expect(rewardOptions).not.toContain("../../meta_progression/public.js");
    expect(rewardOptionPolicyPorts).toContain("../../meta_progression/ports/public_unlock_capabilities.js");
    expect(rewardOptionPolicyPorts).toContain("../../title/ports/public_class_progression_capabilities.js");
    expect(rewardActions).toContain("../ports/create_reward_runtime_action_ports.js");
    expect(rewardActions).not.toContain('modules.RewardUI');
    expect(rewardNavigation).toContain("../ports/create_reward_navigation_runtime_ports.js");
    expect(rewardNavigation).not.toContain('modules.RunReturnUI');
    expect(rewardRuntimeActionPorts).toContain('modules.RewardUI');
    expect(frontdoorFlow).toContain("../ports/create_frontdoor_codex_runtime_ports.js");
    expect(frontdoorFlow).not.toContain("../../codex/ports/public_browser_modules.js");
    expect(frontdoorCodexRuntimePorts).toContain("../../codex/ports/public_browser_modules.js");
    expect(endPlayerTurn).toContain("../ports/public_runtime_timing_capabilities.js");
    expect(endPlayerTurn).not.toContain("../../../platform/browser/dom/public.js");
    expect(combatTimingPorts).toContain("../../../platform/browser/dom/public.js");

    expect(endingActionHelpers).not.toContain('public_application_capabilities.js');
    expect(metaProgressionRuntime).not.toContain('public_application_capabilities.js');
    expect(hiddenEndingRender).not.toContain('public_application_capabilities.js');
    expect(helpPauseAbandonRuntime).not.toContain('public_application_capabilities.js');
    expect(helpPauseReturnRuntime).not.toContain('public_application_capabilities.js');
    expect(helpPauseMenuRuntime).not.toContain('public_application_capabilities.js');
    expect(shellContracts).not.toContain('public_application_capabilities.js');
    expect(runRules).not.toContain('public_application_capabilities.js');
    expect(rewardOptions).not.toContain('public_application_capabilities.js');
    expect(rewardOptions).not.toContain('../../title/ports/public_progression_capabilities.js');
  });

  it('targets canonical feature-owned browser paths instead of transitional ui/presentation screen paths', () => {
    const source = readText('vite.config.js');

    expect(source).toContain("/game/features/event/presentation/browser/");
    expect(source).toContain("/game/features/reward/presentation/browser/");
    expect(source).not.toContain("/game/presentation/screens/event_");
    expect(source).not.toContain("/game/ui/screens/event_");
    expect(source).not.toContain("/game/presentation/screens/reward_");
    expect(source).not.toContain("/game/ui/screens/reward_");
  });
});
