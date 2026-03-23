import { describe, expect, it } from 'vitest';
import { pathExists, readText } from './helpers/guardrail_fs.js';

function read(file) {
  return readText(file);
}

describe('refactor structure guardrails', () => {
  it('keeps the legacy global bridge as a thin assembly over helper modules', () => {
    const source = read('game/platform/legacy/global_bridge_runtime.js');

    expect(source).toContain("./legacy_game_root_state.js");
    expect(source).toContain("./legacy_module_registry.js");
    expect(source).toContain("./legacy_root_deps.js");
    expect(source).toContain("./legacy_api_caller.js");
  });

  it('isolates module-registry flat compat behind a helper', () => {
    const source = read('game/core/bindings/module_registry.js');

    expect(source).toContain("./create_module_registry_flat_compat.js");
    expect(source).toContain("./create_module_registry_feature_scopes.js");
    expect(source).toContain("./create_module_registry_runtime_state.js");
    expect(source).toContain('const featureScopes = createModuleRegistryFeatureScopes(groups);');
    expect(source).toContain('const legacyModules = createModuleRegistryFlatCompat(featureScopes);');
    expect(source).not.toContain('...legacyModules');
    expect(source).toContain('legacyModules,');
    expect(source).not.toContain('featureScopes: Object.freeze({');
    expect(source).not.toContain('_gameStarted: false');
    expect(source).not.toContain('_canvasRefs: null');
  });

  it('keeps binding deps/runtime assembly on scoped module registry readers instead of legacy compat flattening', () => {
    const depsRefsSource = read('game/core/bootstrap/build_binding_deps_refs.js');
    const runtimePortsSource = read('game/core/bootstrap/build_binding_runtime_ports.js');

    expect(depsRefsSource).toContain("../bindings/module_registry_scopes.js");
    expect(runtimePortsSource).toContain("../bindings/module_registry_scopes.js");
    expect(depsRefsSource).not.toContain('resolveModuleRegistryLegacyCompat');
    expect(runtimePortsSource).not.toContain('resolveModuleRegistryLegacyCompat');
  });

  it('routes legacy bootstrap assembly through explicit module-registry compat payloads', () => {
    const globalsSource = read('game/core/bootstrap/build_legacy_surface_global_groups.js');
    const engineGlobalsSource = read('game/core/bootstrap/legacy_surface_engine_globals.js');
    const systemGlobalsSource = read('game/core/bootstrap/legacy_surface_system_globals.js');
    const uiGlobalsSource = read('game/core/bootstrap/legacy_surface_ui_globals.js');
    const initArgsSource = read('game/platform/legacy/build_legacy_bridge_init_args.js');
    const apiRegistrySource = read('game/platform/legacy/game_api_registry.js');
    const moduleRegistrySource = read('game/platform/legacy/game_module_registry.js');
    const executorSource = read('game/core/bootstrap/execute_legacy_surface_registration.js');

    expect(globalsSource).toContain("./legacy_surface_engine_globals.js");
    expect(globalsSource).toContain("./legacy_surface_system_globals.js");
    expect(globalsSource).toContain("./legacy_surface_ui_globals.js");
    expect(engineGlobalsSource).toContain("./resolve_legacy_surface_module_refs.js");
    expect(systemGlobalsSource).toContain("./resolve_legacy_surface_module_refs.js");
    expect(uiGlobalsSource).toContain("./resolve_legacy_surface_module_refs.js");
    expect(initArgsSource).toContain('modules?.legacyModules || modules || {}');
    expect(apiRegistrySource).toContain("./resolve_legacy_module_bag.js");
    expect(moduleRegistrySource).toContain("./resolve_legacy_module_bag.js");
    expect(executorSource).toContain('../bindings/resolve_module_registry_legacy_compat.js');
  });

  it('delegates combat damage runtime helpers into focused helper modules', () => {
    const source = read('game/features/combat/application/damage_system_runtime_helpers.js');

    expect(source).toContain("./damage_runtime_context.js");
    expect(source).toContain("../domain/damage_value_domain.js");
    expect(source).toContain("./enemy_damage_resolution.js");
    expect(source).toContain("./combat_damage_side_effects.js");
  });

  it('keeps core combat event subscribers as orchestration over feature-owned runtime handlers', () => {
    const source = read('game/core/event_subscribers_combat_events.js');
    const runtimePortsSource = read('game/core/bootstrap/create_runtime_subscriber_ports.js');

    expect(runtimePortsSource).toContain("../../features/combat/ports/public_runtime_capabilities.js");
    expect(source).not.toContain('ctx.ui.CombatUI');
    expect(source).not.toContain("getElementById?.('hudOverlay')");
    expect(source).not.toContain('createElement?.(');
  });

  it('delegates set bonus trigger orchestration into grouped rule modules', () => {
    const source = read('game/shared/progression/set_bonus_trigger_effects.js');

    expect(source).toContain("./set_bonus_trigger_session_state.js");
    expect(source).toContain("./set_bonus_damage_rules.js");
    expect(source).toContain("./set_bonus_survival_rules.js");
    expect(source).toContain("./set_bonus_resource_rules.js");
  });

  it('delegates echo ripple rendering into focused browser effect helpers', () => {
    const source = read('game/platform/browser/effects/echo_ripple_transition.js');

    expect(source).toContain("./echo_ripple_runtime_context.js");
    expect(source).toContain("./echo_ripple_particles.js");
    expect(source).toContain("./echo_ripple_renderer.js");
  });

  it('delegates run-mode inscription rendering into focused browser helpers', () => {
    const source = read('game/features/run/presentation/browser/run_mode_ui_render.js');

    expect(source).toContain("./run_mode_ui_inscriptions_render.js");
  });

  it('keeps title cross-feature abandon and ending hooks on public feature ports', () => {
    const abandonActionsSource = read('game/features/title/application/help_pause_abandon_actions.js');
    const abandonPresenterSource = read('game/features/title/presentation/browser/abandon_outcome_presenter.js');

    expect(abandonActionsSource).toContain('../../combat/ports/public_application_capabilities.js');
    expect(abandonActionsSource).not.toContain('../../combat/ports/help_pause_combat_ports.js');
    expect(abandonPresenterSource).toContain('../../../ui/ports/public_ending_presentation_capabilities.js');
    expect(abandonPresenterSource).not.toContain('../../../ui/ports/ending_screen_runtime_ports.js');
  });

  it('keeps title browser helpers on canonical cross-feature public surfaces', () => {
    const settingsActionsSource = read('game/features/title/platform/browser/create_title_settings_actions.js');
    const mountRuntimeSource = read('game/features/title/platform/browser/create_character_select_mount_runtime.js');
    const loadCharacterSelectSource = read('game/features/title/application/load_character_select_use_case.js');
    const rewardOptionsSource = read('game/features/reward/application/build_reward_options_use_case.js');
    const runRulesSource = read('game/features/run/application/run_rules.js');
    const runRuleMetaSource = read('game/features/run/application/run_rule_meta.js');
    const runRuleLifecycleSource = read('game/features/run/application/run_rule_lifecycle.js');
    const runRuleOutcomeSource = read('game/features/run/application/run_rule_outcome.js');
    const hiddenEndingSource = read('game/features/ui/presentation/browser/story_ui_hidden_ending_render.js');
    const metaProgressionSource = read('game/features/ui/presentation/browser/meta_progression_ui_runtime.js');
    const endingActionsSource = read('game/features/ui/presentation/browser/ending_screen_action_helpers.js');
    const helpPauseReturnSource = read('game/features/ui/presentation/browser/help_pause_ui_return_runtime.js');
    const helpPauseAbandonSource = read('game/features/ui/presentation/browser/help_pause_ui_abandon_runtime.js');
    const helpPauseMenuSource = read('game/features/ui/presentation/browser/help_pause_menu_runtime_ui.js');
    const uiShellContractsSource = read('game/features/ui/ports/contracts/build_ui_shell_contracts.js');

    expect(settingsActionsSource).toContain("from '../../../ui/public.js'");
    expect(settingsActionsSource).not.toContain("from '../../../ui/ports/public_browser_modules.js'");
    expect(mountRuntimeSource).toContain("from '../../../combat/ports/public_presentation_capabilities.js'");
    expect(mountRuntimeSource).not.toContain("from '../../../combat/ports/tooltip_ui_ports.js'");
    expect(loadCharacterSelectSource).toContain("from '../domain/class_progression_system.js'");
    expect(loadCharacterSelectSource).not.toContain("from '../ports/class_progression_ports.js'");
    expect(rewardOptionsSource).toContain("from '../ports/reward_option_policy_ports.js'");
    expect(rewardOptionsSource).not.toContain("from '../../title/ports/public_progression_capabilities.js'");
    expect(runRulesSource).not.toContain("from '../../title/ports/class_progression_ports.js'");
    expect(runRuleMetaSource).toContain("from '../../title/ports/public_progression_capabilities.js'");
    expect(runRuleLifecycleSource).toContain("from '../../title/ports/public_progression_capabilities.js'");
    expect(runRuleOutcomeSource).toContain("from '../../title/ports/public_progression_capabilities.js'");
    expect(runRuleMetaSource).not.toContain("from '../../title/ports/class_progression_ports.js'");
    expect(runRuleLifecycleSource).not.toContain("from '../../title/ports/class_progression_ports.js'");
    expect(runRuleOutcomeSource).not.toContain("from '../../title/ports/class_progression_ports.js'");
    expect(hiddenEndingSource).toContain("from '../../../title/ports/public_ending_application_capabilities.js'");
    expect(hiddenEndingSource).not.toContain("from '../../../title/ports/ending_ui_ports.js'");
    expect(metaProgressionSource).toContain("from '../../../title/ports/public_ending_application_capabilities.js'");
    expect(metaProgressionSource).not.toContain("from '../../../title/ports/ending_ui_ports.js'");
    expect(endingActionsSource).toContain("from '../../../title/ports/public_ending_application_capabilities.js'");
    expect(endingActionsSource).not.toContain("from '../../../title/ports/ending_ui_ports.js'");
    expect(helpPauseReturnSource).toContain("from '../../../title/ports/public_help_pause_application_capabilities.js'");
    expect(helpPauseReturnSource).not.toContain("from '../../../title/ports/help_pause_ui_ports.js'");
    expect(helpPauseAbandonSource).toContain("from '../../../title/ports/public_help_pause_application_capabilities.js'");
    expect(helpPauseAbandonSource).not.toContain("from '../../../title/ports/help_pause_ui_ports.js'");
    expect(helpPauseMenuSource).toContain("from '../../../title/ports/public_help_pause_application_capabilities.js'");
    expect(helpPauseMenuSource).not.toContain("from '../../../title/ports/help_pause_ui_ports.js'");
    expect(uiShellContractsSource).toContain("from '../../../title/ports/public_help_pause_application_capabilities.js'");
    expect(uiShellContractsSource).not.toContain("from '../../../title/ports/help_pause_ui_ports.js'");
  });

  it('splits title, run, and event runtime hubs into focused helper modules', () => {
    const mountRuntimeSource = read('game/features/title/platform/browser/create_character_select_mount_runtime.js');
    const runtimeBindingsSource = read('game/features/title/platform/browser/create_character_select_runtime_bindings.js');
    const runStartRuntimeSource = read('game/features/run/application/create_run_start_runtime.js');
    const runRulesSource = read('game/features/run/application/run_rules.js');
    const deathFlowSource = read('game/features/combat/application/death_flow_actions.js');
    const eventRuntimeContextSource = read('game/features/event/platform/event_runtime_context.js');
    const eventApplicationSource = read('game/features/event/ports/public_application_capabilities.js');
    const combatSupportSource = read('game/features/combat/ports/public_presentation_support_capabilities.js');
    const cardMethodsSource = read('game/features/combat/application/card_methods_facade.js');

    expect(mountRuntimeSource).toContain("./character_select_mount_loadout.js");
    expect(mountRuntimeSource).not.toContain("from '../../../../../data/cards.js'");
    expect(runtimeBindingsSource).toContain("./character_select_runtime_progression_bindings.js");
    expect(runtimeBindingsSource).toContain("./character_select_runtime_flow_bindings.js");
    expect(runtimeBindingsSource).toContain("./character_select_runtime_ui_bindings.js");
    expect(runStartRuntimeSource).toContain("./run_start_transition_runtime.js");
    expect(runStartRuntimeSource).toContain("./run_start_gameplay_runtime.js");
    expect(runRulesSource).toContain("./run_rule_lifecycle.js");
    expect(runRulesSource).toContain("./run_rule_meta.js");
    expect(runRulesSource).toContain("./run_rule_outcome.js");
    expect(runRulesSource).toContain("./run_rule_scaling.js");
    expect(deathFlowSource).toContain("./death_flow_enemy_runtime.js");
    expect(deathFlowSource).toContain("./death_flow_player_runtime.js");
    expect(eventRuntimeContextSource).toContain("./event_runtime_deps.js");
    expect(eventRuntimeContextSource).toContain("./event_runtime_hud.js");
    expect(eventApplicationSource).toContain("./public_event_session_application_capabilities.js");
    expect(eventApplicationSource).toContain("./public_event_shop_application_capabilities.js");
    expect(combatSupportSource).toContain("./presentation/public_combat_browser_support_capabilities.js");
    expect(combatSupportSource).toContain("./presentation/public_combat_card_support_capabilities.js");
    expect(combatSupportSource).toContain("./presentation/public_combat_runtime_support_capabilities.js");
    expect(combatSupportSource).toContain("./presentation/public_combat_status_support_capabilities.js");
    expect(cardMethodsSource).toContain("../platform/combat_card_runtime_ports.js");
    expect(cardMethodsSource).not.toContain("../../../platform/legacy/adapters/create_legacy_game_state_card_ports.js");
  });

  it('delegates combat item tooltip state and DOM construction into focused helpers', () => {
    const source = read('game/features/combat/presentation/browser/tooltip_item_render_ui.js');

    expect(source).toContain("./tooltip_item_state.js");
    expect(source).toContain("./tooltip_item_element.js");
  });

  it('delegates card clone placement and keyword hover binding into focused helpers', () => {
    const source = read('game/features/combat/presentation/browser/card_clone_ui.js');

    expect(source).toContain("./card_clone_positioning.js");
    expect(source).toContain("./card_clone_keyword_interactions.js");
  });

  it('delegates run-map relic detail surfaces and slot binding into focused helpers', () => {
    const source = read('game/features/run/presentation/browser/map_ui_next_nodes_render_panels.js');

    expect(source).toContain("./map_ui_next_nodes_relic_detail_surface.js");
    expect(source).toContain("./map_ui_next_nodes_relic_slots.js");
  });

  it('keeps scan-heavy guardrail tests on the shared cached fs helper', () => {
    const files = [
      'tests/architecture_refactor_guardrails.test.js',
      'tests/build_first_optimization_guardrails.test.js',
      'tests/feature_dep_accessor_boundaries.test.js',
      'tests/ui_feature_entry_compat_reexports.test.js',
      'tests/vite_chunking_guardrails.test.js',
    ];

    for (const file of files) {
      const source = read(file);
      expect(source).toContain("./helpers/guardrail_fs.js");
      expect(source).not.toContain('process.cwd()');
    }
  });

  it('consolidates narrow compat and lint guardrails into broader domain test files', () => {
    const consolidatedFiles = [
      'tests/compat_lint_guardrails.test.js',
      'tests/feature_compat_structure.test.js',
      'tests/combat_compat_guardrails.test.js',
    ];
    const removedFiles = [
      'tests/compat_public_entrypoint_guardrails.test.js',
      'tests/canonical_feature_import_guardrails.test.js',
      'tests/feature_compat_boundaries.test.js',
      'tests/feature_compat_capability_structure.test.js',
      'tests/combat_compat_structure.test.js',
      'tests/combat_compat_reexports.test.js',
    ];

    for (const file of consolidatedFiles) {
      expect(pathExists(file)).toBe(true);
    }

    for (const file of removedFiles) {
      expect(pathExists(file)).toBe(false);
    }
  });

  it('consolidates composition and bootstrap assembly checks into broader test files', () => {
    const consolidatedFiles = [
      'tests/composition_module_registrars.test.js',
      'tests/composition_module_assembly.test.js',
      'tests/bootstrap_registrar_assembly.test.js',
      'tests/bootstrap_payload_assembly.test.js',
    ];
    const removedFiles = [
      'tests/register_codex_modules.test.js',
      'tests/register_event_modules.test.js',
      'tests/register_reward_modules.test.js',
      'tests/register_run_modules.test.js',
      'tests/register_screen_modules.test.js',
      'tests/register_title_modules.test.js',
      'tests/register_core_runtime_modules.test.js',
      'tests/build_screen_primary_modules.test.js',
      'tests/build_screen_overlay_modules.test.js',
      'tests/build_game_binding_registrars.test.js',
      'tests/build_event_subscriber_registrars.test.js',
      'tests/build_runtime_subscriber_actions.test.js',
      'tests/build_game_boot_payload.test.js',
      'tests/build_character_select_mount_payload.test.js',
      'tests/build_runtime_subscriber_payload.test.js',
    ];

    for (const file of consolidatedFiles) {
      expect(pathExists(file)).toBe(true);
    }

    for (const file of removedFiles) {
      expect(pathExists(file)).toBe(false);
    }
  });

  it('routes noisy regression suites through the shared console-silencing helper', () => {
    const files = [
      'tests/runtime_state_flow.test.js',
      'tests/title_settings_bindings.test.js',
      'tests/save_system_outbox.test.js',
    ];

    for (const file of files) {
      const source = read(file);
      expect(source).toContain("./helpers/silence_console.js");
    }
  });
});
