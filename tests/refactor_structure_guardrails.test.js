import { describe, expect, it } from 'vitest';
import { pathExists, readJson, readText } from './helpers/guardrail_fs.js';

function read(file) {
  return readText(file);
}

function getFeatureName(file) {
  const match = /^game\/features\/([^/]+)\//.exec(String(file || ''));
  return match?.[1] || null;
}

function collectFeatureCycles(graph = {}) {
  const adjacency = new Map();
  const knownFeatures = new Set();

  for (const [source, targets] of Object.entries(graph)) {
    const sourceFeature = getFeatureName(source);
    if (!sourceFeature) continue;
    knownFeatures.add(sourceFeature);
    if (!adjacency.has(sourceFeature)) adjacency.set(sourceFeature, new Set());

    for (const target of targets || []) {
      const targetFeature = getFeatureName(target);
      if (!targetFeature || targetFeature === sourceFeature) continue;
      knownFeatures.add(targetFeature);
      adjacency.get(sourceFeature).add(targetFeature);
      if (!adjacency.has(targetFeature)) adjacency.set(targetFeature, new Set());
    }
  }

  const indexes = new Map();
  const lowLinks = new Map();
  const stack = [];
  const active = new Set();
  const components = [];
  let nextIndex = 0;

  function visit(feature) {
    indexes.set(feature, nextIndex);
    lowLinks.set(feature, nextIndex);
    nextIndex += 1;
    stack.push(feature);
    active.add(feature);

    for (const neighbor of adjacency.get(feature) || []) {
      if (!indexes.has(neighbor)) {
        visit(neighbor);
        lowLinks.set(feature, Math.min(lowLinks.get(feature), lowLinks.get(neighbor)));
        continue;
      }

      if (active.has(neighbor)) {
        lowLinks.set(feature, Math.min(lowLinks.get(feature), indexes.get(neighbor)));
      }
    }

    if (lowLinks.get(feature) !== indexes.get(feature)) return;

    const component = [];
    while (stack.length > 0) {
      const current = stack.pop();
      active.delete(current);
      component.push(current);
      if (current === feature) break;
    }

    if (component.length > 1) {
      components.push(component.sort());
    }
  }

  for (const feature of [...knownFeatures].sort()) {
    if (!indexes.has(feature)) {
      visit(feature);
    }
  }

  return components.sort((left, right) => {
    if (right.length !== left.length) return right.length - left.length;
    return left.join(',').localeCompare(right.join(','));
  });
}

describe('refactor structure guardrails', () => {
  it('keeps the current cross-feature cycle set from expanding', () => {
    const graph = readJson('artifacts/dependency_map.json').graph;
    const cycles = collectFeatureCycles(graph);

    expect(cycles).toEqual([
      [
        'codex',
        'combat',
        'combat_session',
        'meta_progression',
        'run',
        'title',
        'ui',
      ],
    ]);
  });

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

  it('routes core runtime context resolution through a shared runtime-environment helper', () => {
    const bootstrapContextSource = read('game/core/bootstrap/create_bootstrap_context.js');
    const initSequenceSource = read('game/core/init_sequence.js');
    const subscriberContextSource = read('game/core/event_subscriber_context.js');
    const titleSettingsSource = read('game/core/bindings/title_settings_bindings.js');
    const runtimeEnvironmentSource = read('game/core/runtime_environment.js');

    expect(bootstrapContextSource).toContain("../runtime_environment.js");
    expect(initSequenceSource).toContain("./runtime_environment.js");
    expect(subscriberContextSource).toContain("./runtime_environment.js");
    expect(titleSettingsSource).toContain("../runtime_environment.js");
    expect(runtimeEnvironmentSource).toContain('export function resolveBrowserRuntime');
    expect(runtimeEnvironmentSource).toContain('export function resolveBrowserDocument');
    expect(runtimeEnvironmentSource).toContain('export function resolveBrowserWindow');
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

  it('routes run map/render and reward compat runtime assembly through dedicated port helpers', () => {
    const worldRenderSource = read('game/features/run/application/world_render_actions.js');
    const worldRenderPortsSource = read('game/features/run/ports/create_run_world_render_runtime_ports.js');
    const runMapSource = read('game/features/run/application/run_map_actions.js');
    const runMapPortsSource = read('game/features/run/ports/create_run_map_runtime_ports.js');
    const rewardActionsSource = read('game/features/reward/application/create_reward_runtime_actions.js');
    const rewardActionPortsSource = read('game/features/reward/ports/create_reward_runtime_action_ports.js');

    expect(worldRenderSource).toContain("../ports/create_run_world_render_runtime_ports.js");
    expect(worldRenderSource).not.toContain('modules.WorldRenderLoopUI');
    expect(worldRenderSource).not.toContain('modules.WorldCanvasUI');
    expect(worldRenderPortsSource).toContain('modules.WorldRenderLoopUI');
    expect(worldRenderPortsSource).toContain('modules.WorldCanvasUI');

    expect(runMapSource).toContain("../ports/create_run_map_runtime_ports.js");
    expect(runMapSource).not.toContain('modules.MapGenerationUI');
    expect(runMapSource).not.toContain('modules.MapUI');
    expect(runMapSource).not.toContain('modules.MapNavigationUI');
    expect(runMapPortsSource).toContain('modules.MapGenerationUI');
    expect(runMapPortsSource).toContain('modules.MapUI');
    expect(runMapPortsSource).toContain('modules.MapNavigationUI');

    expect(rewardActionsSource).toContain("../ports/create_reward_runtime_action_ports.js");
    expect(rewardActionsSource).not.toContain('modules.RewardUI');
    expect(rewardActionPortsSource).toContain('modules.RewardUI');
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

  it('uses explicit vitest suite include lists instead of suite-sized exclude arrays', () => {
    const source = read('vitest.config.js');

    expect(source).toContain('function getSuiteIncludes()');
    expect(source).toContain('include: getSuiteIncludes()');
    expect(source).toContain("if (suite === 'fast') return fast;");
    expect(source).toContain("if (suite === 'guardrails') return guardrails;");
    expect(source).toContain('return allTestFiles;');
  });

  it('keeps title cross-feature abandon and ending hooks on public feature ports', () => {
    const abandonActionsSource = read('game/features/title/application/help_pause_abandon_actions.js');
    const abandonPresenterSource = read('game/features/title/presentation/browser/abandon_outcome_presenter.js');
    const helpPauseAbandonRuntimeSource = read('game/features/ui/presentation/browser/help_pause_ui_abandon_runtime.js');
    const uiShellContractsSource = read('game/features/ui/ports/contracts/build_ui_shell_contracts.js');
    const helpPauseContractSource = read('game/features/ui/ports/contracts/build_ui_help_pause_contract.js');
    const eventSessionSource = read('game/features/event/ports/public_event_session_application_capabilities.js');
    const runReturnFlowSource = read('game/features/run/application/workflows/run_return_flow.js');
    const runReturnActionsSource = read('game/features/run/application/build_run_return_runtime_actions.js');

    expect(abandonActionsSource).toContain('resolveCombatCleanup');
    expect(abandonActionsSource).toContain('deps.cleanupCombatAfterAbandon');
    expect(abandonActionsSource).toContain('deps.deactivateCombat?.(gs)');
    expect(abandonActionsSource).toContain('deps.showAbandonOutcome');
    expect(abandonActionsSource).not.toContain("from '../../../shared/state/runtime_flow_controls.js'");
    expect(abandonActionsSource).not.toContain('gs.combat.active = false');
    expect(abandonActionsSource).not.toContain('../../combat/ports/public_application_capabilities.js');
    expect(abandonActionsSource).not.toContain("../ports/public_help_pause_presentation_capabilities.js");
    expect(abandonActionsSource).not.toContain("../presentation/browser/abandon_outcome_presenter.js");
    expect(abandonActionsSource).not.toContain('../../combat/ports/help_pause_combat_ports.js');
    expect(abandonPresenterSource).toContain('../../../ui/ports/public_ending_presentation_capabilities.js');
    expect(abandonPresenterSource).not.toContain('../../../ui/ports/ending_screen_runtime_ports.js');
    expect(helpPauseAbandonRuntimeSource).toContain("../../ports/public_ending_presentation_capabilities.js");
    expect(helpPauseAbandonRuntimeSource).toContain("showAbandonOutcome: deps.showAbandonOutcome || ((nextDeps) => EndingScreenUI.showOutcome('abandon', nextDeps))");
    expect(uiShellContractsSource).toContain("./build_ui_help_pause_contract.js");
    expect(helpPauseContractSource).toContain("../../../frontdoor/ports/public_application_capabilities.js");
    expect(helpPauseContractSource).not.toContain("../../../title/ports/public_help_pause_application_capabilities.js");
    expect(eventSessionSource).toContain("../application/event_choice_view_model.js");
    expect(eventSessionSource).not.toContain("../presentation/event_choice_view_model.js");
    expect(runReturnFlowSource).toContain("../../ports/public_run_return_presentation_capabilities.js");
    expect(runReturnFlowSource).not.toContain("../../presentation/browser/run_return_overlay_presenter.js");
    expect(runReturnFlowSource).not.toContain("../../presentation/browser/run_return_branch_presenter.js");
    expect(runReturnActionsSource).toContain("./run_return_timing.js");
    expect(runReturnActionsSource).not.toContain("../presentation/browser/run_return_overlay_presenter.js");
  });

  it('routes title runtime environment lookups through title port helpers', () => {
    const titleRunEntrySource = read('game/features/title/application/title_run_entry_actions.js');
    const titleReturnSource = read('game/features/title/application/title_return_actions.js');
    const metaProgressionSource = read('game/features/title/application/meta_progression_actions.js');
    const helpPauseAbandonSource = read('game/features/title/application/help_pause_abandon_actions.js');
    const characterSelectActionsSource = read('game/features/title/application/character_select_actions.js');
    const characterSelectRuntimeSource = read('game/features/title/application/create_character_select_runtime.js');
    const titleRuntimePortsSource = read('game/features/title/ports/title_runtime_ports.js');
    const characterSelectRuntimePortsSource = read('game/features/title/ports/create_character_select_runtime_ports.js');

    expect(titleRunEntrySource).toContain("../ports/title_runtime_ports.js");
    expect(titleRunEntrySource).not.toContain('setTimeoutFn = setTimeout');
    expect(titleReturnSource).toContain("../ports/title_runtime_ports.js");
    expect(titleReturnSource).not.toContain('win?.location?.reload');
    expect(metaProgressionSource).toContain("../ports/title_runtime_ports.js");
    expect(metaProgressionSource).not.toContain('setTimeoutFn = setTimeout');
    expect(helpPauseAbandonSource).toContain("../ports/title_runtime_ports.js");
    expect(helpPauseAbandonSource).not.toContain('deps.win?.document');
    expect(characterSelectActionsSource).toContain("../ports/title_runtime_ports.js");
    expect(characterSelectActionsSource).not.toContain('setTimeoutImpl = setTimeout');
    expect(characterSelectRuntimeSource).toContain("../ports/create_character_select_runtime_ports.js");
    expect(characterSelectRuntimeSource).not.toContain("./character_select_runtime_env.js");
    expect(titleRuntimePortsSource).toContain("from '../../../platform/browser/dom/public.js'");
    expect(characterSelectRuntimePortsSource).toContain("./title_runtime_ports.js");
  });

  it('keeps title browser helpers on canonical cross-feature public surfaces', () => {
    const settingsActionsSource = read('game/features/title/platform/browser/create_title_settings_actions.js');
    const buildCoreRunSystemModulesSource = read('game/platform/browser/composition/build_core_run_system_modules.js');
    const sharedSavePublicSource = read('game/shared/save/public.js');
    const mountRuntimeSource = read('game/features/title/platform/browser/create_character_select_mount_runtime.js');
    const loadCharacterSelectSource = read('game/features/title/application/load_character_select_use_case.js');
    const rewardOptionsSource = read('game/features/reward/application/build_reward_options_use_case.js');
    const rewardOptionPolicyPortsSource = read('game/features/reward/ports/reward_option_policy_ports.js');
    const itemShopActionsSource = read('game/features/event/application/item_shop_actions.js');
    const itemShopPolicyPortsSource = read('game/features/event/ports/item_shop_policy_ports.js');
    const runRulesSource = read('game/features/run/application/run_rules.js');
    const runRuleMetaSource = read('game/features/run/application/run_rule_meta.js');
    const runRuleLifecycleSource = read('game/features/run/application/run_rule_lifecycle.js');
    const runRuleOutcomeSource = read('game/features/run/application/run_rule_outcome.js');
    const runOutcomeExternalPortsSource = read('game/features/run/application/run_outcome_external_ports.js');
    const runOutcomeIntegrationPortsSource = read('game/features/run/ports/create_run_outcome_integration_ports.js');
    const runRuleProgressionPortsSource = read('game/features/run/ports/create_run_rule_progression_ports.js');
    const combatEndFlowSource = read('game/features/combat/application/run_end_combat_flow_use_case.js');
    const combatEndRuntimePortsSource = read('game/features/combat/platform/create_combat_end_runtime_ports.js');
    const combatDeathRuntimeSource = read('game/features/combat/application/death_flow_player_runtime.js');
    const combatDeathRuntimePortsSource = read('game/features/combat/platform/create_combat_death_runtime_ports.js');
    const frontdoorFlowSource = read('game/features/frontdoor/application/create_frontdoor_flow_actions.js');
    const frontdoorRuntimePortsSource = read('game/features/frontdoor/application/frontdoor_runtime_ports.js');
    const frontdoorCodexRuntimePortsSource = read('game/features/frontdoor/ports/create_frontdoor_codex_runtime_ports.js');
    const rewardNavigationSource = read('game/features/reward/application/reward_navigation_actions.js');
    const rewardNavigationRuntimePortsSource = read('game/features/reward/ports/create_reward_navigation_runtime_ports.js');
    const hiddenEndingSource = read('game/features/ui/presentation/browser/story_ui_hidden_ending_render.js');
    const metaProgressionSource = read('game/features/ui/presentation/browser/meta_progression_ui_runtime.js');
    const endingActionsSource = read('game/features/ui/presentation/browser/ending_screen_action_helpers.js');
    const endingFragmentChoiceSource = read('game/features/ui/presentation/browser/ending_fragment_choice_presenter.js');
    const helpPauseReturnSource = read('game/features/ui/presentation/browser/help_pause_ui_return_runtime.js');
    const helpPauseAbandonSource = read('game/features/ui/presentation/browser/help_pause_ui_abandon_runtime.js');
    const helpPauseMenuSource = read('game/features/ui/presentation/browser/help_pause_menu_runtime_ui.js');
    const uiShellContractsSource = read('game/features/ui/ports/contracts/build_ui_shell_contracts.js');

    expect(settingsActionsSource).toContain("from '../../../ui/ports/public_browser_modules.js'");
    expect(settingsActionsSource).not.toContain("from '../../../ui/public.js'");
    expect(buildCoreRunSystemModulesSource).toContain("from '../notifications/save_status_presenter.js'");
    expect(buildCoreRunSystemModulesSource).toContain('configureSaveRuntimeContext');
    expect(sharedSavePublicSource).not.toContain("./save_status_presenter.js");
    expect(sharedSavePublicSource).toContain("./save_runtime_context.js");
    expect(mountRuntimeSource).toContain('function resolveTooltipUI');
    expect(mountRuntimeSource).not.toContain("from '../../../combat/ports/public_presentation_capabilities.js'");
    expect(mountRuntimeSource).not.toContain("from '../../../combat/ports/tooltip_ui_ports.js'");
    expect(loadCharacterSelectSource).toContain("from '../domain/class_progression_system.js'");
    expect(loadCharacterSelectSource).not.toContain("from '../ports/class_progression_ports.js'");
    expect(rewardOptionsSource).toContain("from '../ports/reward_option_policy_ports.js'");
    expect(rewardOptionsSource).not.toContain("from '../../meta_progression/public.js'");
    expect(rewardOptionsSource).not.toContain("from '../../title/ports/public_progression_capabilities.js'");
    expect(rewardOptionPolicyPortsSource).toContain("from '../../meta_progression/public.js'");
    expect(itemShopActionsSource).toContain("from '../ports/item_shop_policy_ports.js'");
    expect(itemShopActionsSource).not.toContain("from '../../meta_progression/public.js'");
    expect(itemShopPolicyPortsSource).toContain("from '../../meta_progression/public.js'");
    expect(runRulesSource).not.toContain("from '../../title/ports/class_progression_ports.js'");
    expect(runRuleMetaSource).toContain("from '../ports/create_run_rule_progression_ports.js'");
    expect(runRuleLifecycleSource).toContain("from '../ports/create_run_rule_progression_ports.js'");
    expect(runRuleOutcomeSource).toContain("./run_outcome_external_ports.js");
    expect(runOutcomeExternalPortsSource).toContain("../ports/create_run_outcome_integration_ports.js");
    expect(runOutcomeIntegrationPortsSource).toContain("from '../../title/ports/public_progression_capabilities.js'");
    expect(runOutcomeIntegrationPortsSource).toContain("from '../../meta_progression/public.js'");
    expect(runRuleProgressionPortsSource).toContain("from '../../title/ports/public_progression_capabilities.js'");
    expect(runRuleProgressionPortsSource).toContain("from '../../meta_progression/public.js'");
    expect(runRuleMetaSource).not.toContain("from '../../title/ports/public_progression_capabilities.js'");
    expect(runRuleLifecycleSource).not.toContain("from '../../title/ports/public_progression_capabilities.js'");
    expect(runRuleMetaSource).not.toContain("from '../../meta_progression/public.js'");
    expect(runRuleMetaSource).not.toContain("from '../../title/ports/class_progression_ports.js'");
    expect(runRuleLifecycleSource).not.toContain("from '../../title/ports/class_progression_ports.js'");
    expect(runRuleOutcomeSource).not.toContain("from '../../title/ports/class_progression_ports.js'");
    expect(runOutcomeExternalPortsSource).not.toContain("from '../../title/ports/public_progression_capabilities.js'");
    expect(runOutcomeExternalPortsSource).not.toContain("from '../../meta_progression/public.js'");
    expect(runOutcomeExternalPortsSource).not.toContain("from '../../title/ports/class_progression_ports.js'");
    expect(rewardNavigationSource).toContain("../ports/create_reward_navigation_runtime_ports.js");
    expect(rewardNavigationSource).not.toContain('modules.RunReturnUI');
    expect(rewardNavigationRuntimePortsSource).toContain('modules.RunReturnUI');
    expect(combatEndFlowSource).toContain("../platform/create_combat_end_runtime_ports.js");
    expect(combatEndFlowSource).not.toContain('win?.showCombatSummary');
    expect(combatEndFlowSource).not.toContain('win?.updateUI');
    expect(combatEndRuntimePortsSource).toContain("./combat_end_ports.js");
    expect(combatDeathRuntimeSource).toContain("../platform/create_combat_death_runtime_ports.js");
    expect(combatDeathRuntimeSource).not.toContain('win.updateUI');
    expect(combatDeathRuntimeSource).not.toContain('win.selectFragment');
    expect(combatDeathRuntimePortsSource).toContain("./death_runtime_ports.js");
    expect(frontdoorFlowSource).toContain("./frontdoor_runtime_ports.js");
    expect(frontdoorFlowSource).toContain("../ports/create_frontdoor_codex_runtime_ports.js");
    expect(frontdoorFlowSource).not.toContain("../../codex/ports/public_browser_modules.js");
    expect(frontdoorFlowSource).not.toContain('modules.RunSetupUI?.startGame');
    expect(frontdoorFlowSource).not.toContain('modules.SaveSystem?.loadRun?.');
    expect(frontdoorRuntimePortsSource).toContain('modules.RunSetupUI');
    expect(frontdoorRuntimePortsSource).toContain('modules.SaveSystem');
    expect(frontdoorCodexRuntimePortsSource).toContain("../../codex/ports/public_browser_modules.js");
    expect(hiddenEndingSource).toContain("from '../../../title/ports/public_ending_application_capabilities.js'");
    expect(hiddenEndingSource).not.toContain("from '../../../title/ports/ending_ui_ports.js'");
    expect(metaProgressionSource).toContain("from '../../../title/ports/public_ending_application_capabilities.js'");
    expect(metaProgressionSource).not.toContain("from '../../../title/ports/ending_ui_ports.js'");
    expect(endingActionsSource).toContain("from '../../../title/ports/public_ending_application_capabilities.js'");
    expect(endingActionsSource).not.toContain("from '../../../title/ports/ending_ui_ports.js'");
    expect(endingFragmentChoiceSource).not.toContain("from '../../../../utils/description_utils.js'");
    expect(helpPauseReturnSource).toContain("from '../../../title/ports/public_help_pause_application_capabilities.js'");
    expect(helpPauseReturnSource).not.toContain("from '../../../title/ports/help_pause_ui_ports.js'");
    expect(helpPauseAbandonSource).toContain("from '../../../title/ports/public_help_pause_application_capabilities.js'");
    expect(helpPauseAbandonSource).not.toContain("from '../../../title/ports/help_pause_ui_ports.js'");
    expect(helpPauseMenuSource).toContain("from '../../../title/ports/public_help_pause_application_capabilities.js'");
    expect(helpPauseMenuSource).not.toContain("from '../../../title/ports/help_pause_ui_ports.js'");
    expect(uiShellContractsSource).toContain("./build_ui_help_pause_contract.js");
    expect(uiShellContractsSource).not.toContain("from '../../../title/ports/help_pause_ui_ports.js'");
    expect(pathExists('game/features/ui/ports/contracts/build_ui_help_pause_contract.js')).toBe(true);
    expect(pathExists('game/features/run/ports/create_run_outcome_integration_ports.js')).toBe(true);
    expect(pathExists('game/features/combat/platform/create_combat_end_runtime_ports.js')).toBe(true);
    expect(pathExists('game/features/combat/platform/create_combat_death_runtime_ports.js')).toBe(true);
    expect(pathExists('game/features/frontdoor/application/frontdoor_runtime_ports.js')).toBe(true);
    expect(pathExists('game/features/frontdoor/ports/create_frontdoor_codex_runtime_ports.js')).toBe(true);
  });

  it('splits overlay escape runtime into surface, visibility, and registry helpers', () => {
    const source = read('game/shared/runtime/overlay_escape_support.js');

    expect(source).toContain("./overlay_escape_surface_definitions.js");
    expect(source).toContain("./overlay_escape_visibility.js");
    expect(source).toContain("./overlay_escape_registry.js");
    expect(pathExists('game/shared/runtime/overlay_escape_surface_definitions.js')).toBe(true);
    expect(pathExists('game/shared/runtime/overlay_escape_visibility.js')).toBe(true);
    expect(pathExists('game/shared/runtime/overlay_escape_registry.js')).toBe(true);
  });

  it('keeps save system IO as an orchestration facade over focused helpers', () => {
    const source = read('game/shared/save/save_system_io.js');

    expect(source).toContain("./save_system_run_meta_io.js");
    expect(source).toContain("./save_system_slot_summaries.js");
    expect(source).toContain("./save_system_bundle_io.js");
    expect(pathExists('game/shared/save/save_system_run_meta_io.js')).toBe(true);
    expect(pathExists('game/shared/save/save_system_slot_summaries.js')).toBe(true);
    expect(pathExists('game/shared/save/save_system_bundle_io.js')).toBe(true);
  });

  it('keeps save system facade and outbox lifecycle split across focused helpers', () => {
    const source = read('game/shared/save/save_system.js');

    expect(source).toContain("./save_system_outbox_controller.js");
    expect(source).toContain("./save_system_public_facade.js");
    expect(pathExists('game/shared/save/save_system_outbox_controller.js')).toBe(true);
    expect(pathExists('game/shared/save/save_system_public_facade.js')).toBe(true);
  });

  it('keeps root browser bindings as a facade over focused binding helpers', () => {
    const source = read('game/platform/browser/bindings/root_bindings.js');

    expect(source).toContain("./root_binding_settings.js");
    expect(source).toContain("./root_binding_events.js");
    expect(source).toContain("./root_binding_help_pause.js");
    expect(pathExists('game/platform/browser/bindings/root_binding_settings.js')).toBe(true);
    expect(pathExists('game/platform/browser/bindings/root_binding_events.js')).toBe(true);
    expect(pathExists('game/platform/browser/bindings/root_binding_help_pause.js')).toBe(true);
  });

  it('keeps event runtime helpers thin over lazy overlay loader modules', () => {
    const source = read('game/features/event/presentation/browser/event_ui_runtime_helpers.js');

    expect(source).toContain("./load_event_item_shop_overlay.js");
    expect(source).toContain("./load_event_rest_site_overlay.js");
    expect(source).toContain("./load_event_card_discard_overlay.js");
    expect(pathExists('game/features/event/presentation/browser/load_event_item_shop_overlay.js')).toBe(true);
    expect(pathExists('game/features/event/presentation/browser/load_event_rest_site_overlay.js')).toBe(true);
    expect(pathExists('game/features/event/presentation/browser/load_event_card_discard_overlay.js')).toBe(true);
  });

  it('splits character select card rendering and info-panel markup into focused helper modules', () => {
    const cardSource = read('game/features/title/platform/browser/character_select_card_ui.js');
    const markupSource = read('game/features/title/platform/browser/character_select_info_panel_markup.js');

    expect(cardSource).toContain("./character_select_card_nodes.js");
    expect(cardSource).toContain("./character_select_card_visual_styles.js");
    expect(pathExists('game/features/title/platform/browser/character_select_card_nodes.js')).toBe(true);
    expect(pathExists('game/features/title/platform/browser/character_select_card_visual_styles.js')).toBe(true);
    expect(markupSource).toContain("./character_select_info_panel_markup_deck.js");
    expect(markupSource).toContain("./character_select_info_panel_markup_sections.js");
    expect(pathExists('game/features/title/platform/browser/character_select_info_panel_markup_deck.js')).toBe(true);
    expect(pathExists('game/features/title/platform/browser/character_select_info_panel_markup_sections.js')).toBe(true);
  });

  it('keeps the settings modal shell as assembly over extracted shell sections', () => {
    const source = read('game/features/ui/platform/browser/ensure_settings_modal_shell.js');

    expect(source).toContain("./settings_modal_shell_frame.js");
    expect(source).toContain("./settings_modal_shell_panels.js");
    expect(pathExists('game/features/ui/platform/browser/settings_modal_shell_frame.js')).toBe(true);
    expect(pathExists('game/features/ui/platform/browser/settings_modal_shell_panels.js')).toBe(true);
  });

  it('keeps item detail panel UI as a facade over controller, dismiss, and content helpers', () => {
    const source = read('game/shared/ui/item_detail/item_detail_panel_ui.js');

    expect(source).toContain("./item_detail_surface_controller.js");
    expect(source).toContain("./item_detail_surface_dismiss.js");
    expect(source).toContain("./item_detail_panel_content.js");
    expect(pathExists('game/shared/ui/item_detail/item_detail_surface_controller.js')).toBe(true);
    expect(pathExists('game/shared/ui/item_detail/item_detail_surface_dismiss.js')).toBe(true);
    expect(pathExists('game/shared/ui/item_detail/item_detail_panel_content.js')).toBe(true);
  });

  it('keeps shared player resource rules off run feature capability imports', () => {
    const resourceUseCaseSource = read('game/shared/player/player_resource_use_cases.js');
    const ruleSupportSource = read('game/shared/player/player_resource_rule_support.js');

    expect(resourceUseCaseSource).not.toContain("../../features/run/ports/public_rule_capabilities.js");
    expect(ruleSupportSource).not.toContain('/features/run/');
  });

  it('keeps shared game-state compat wrappers on combat ports instead of combat application internals', () => {
    const cardCompatSource = read('game/shared/state/compat/game_state_card_runtime_compat_methods.js');
    const combatCompatSource = read('game/shared/state/compat/game_state_combat_runtime_compat_methods.js');
    const runtimePortSource = read('game/features/combat/ports/public_game_state_runtime_capabilities.js');

    expect(cardCompatSource).toContain("from '../../../features/combat/ports/public_game_state_runtime_capabilities.js'");
    expect(cardCompatSource).not.toContain('/application/card_methods_facade.js');
    expect(combatCompatSource).toContain("from '../../../features/combat/ports/public_game_state_runtime_capabilities.js'");
    expect(combatCompatSource).not.toContain('/application/combat_methods_facade.js');
    expect(runtimePortSource).toContain("../application/card_methods_facade.js");
    expect(runtimePortSource).toContain("../application/combat_methods_facade.js");
  });

  it('keeps combat feature state/event action access behind a local port surface', () => {
    const files = [
      'game/features/combat/state/card_state_commands.js',
      'game/features/combat/application/damage_system_facade.js',
      'game/features/combat/application/play_card_service.js',
      'game/features/combat/application/death_flow_enemy_runtime.js',
      'game/features/combat/application/combat_lifecycle_facade.js',
    ];
    const portSource = read('game/features/combat/ports/public_state_action_capabilities.js');

    expect(portSource).toContain("from '../../../core/event_bus.js'");
    expect(portSource).toContain("from '../../../core/store/state_actions.js'");

    for (const file of files) {
      const source = read(file);
      expect(source).toContain("../ports/public_state_action_capabilities.js");
      expect(source).not.toContain("from '../../../core/store/state_actions.js'");
      expect(source).not.toContain("from '../../../core/event_bus.js'");
    }
  });

  it('splits title, run, and event runtime hubs into focused helper modules', () => {
    const mountRuntimeSource = read('game/features/title/platform/browser/create_character_select_mount_runtime.js');
    const runtimeBindingsSource = read('game/features/title/platform/browser/create_character_select_runtime_bindings.js');
    const runStartRuntimeSource = read('game/features/run/application/create_run_start_runtime.js');
    const runRulesSource = read('game/features/run/application/run_rules.js');
    const deathFlowSource = read('game/features/combat/application/death_flow_actions.js');
    const playCardServiceSource = read('game/features/combat/application/play_card_service.js');
    const combatLifecycleSource = read('game/features/combat/application/combat_lifecycle_facade.js');
    const eventRuntimeContextSource = read('game/features/event/platform/event_runtime_context.js');
    const eventApplicationSource = read('game/features/event/ports/public_application_capabilities.js');
    const combatSupportSource = read('game/features/combat/ports/public_presentation_support_capabilities.js');
    const cardMethodsSource = read('game/features/combat/application/card_methods_facade.js');

    expect(mountRuntimeSource).toContain("./character_select_mount_loadout.js");
    expect(mountRuntimeSource).not.toContain("from '../../../../../data/cards.js'");
    expect(runtimeBindingsSource).toContain("./character_select_runtime_progression_bindings.js");
    expect(runtimeBindingsSource).toContain("./character_select_runtime_flow_bindings.js");
    expect(runtimeBindingsSource).toContain("./character_select_runtime_ui_bindings.js");
    expect(runStartRuntimeSource).toContain("../presentation/browser/run_start_transition_runtime.js");
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
    expect(playCardServiceSource).toContain("./combat_card_runtime_facade.js");
    expect(playCardServiceSource).toContain("./combat_card_play_resolution.js");
    expect(playCardServiceSource).not.toContain('new Proxy(');
    expect(combatLifecycleSource).toContain("./combat_lifecycle_runtime_support.js");
    expect(combatLifecycleSource).not.toContain('function resolveRuntimeHost');
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

  it('centralizes repeated selectors, runtime deps, and save formatting helpers on shared modules', () => {
    const runOutcomeSource = read('game/features/run/state/run_outcome_state_commands.js');
    const playerStateCommandsSource = read('game/shared/state/player_state_commands.js');
    const playerLegacyMutationsSource = read('game/shared/state/player_state_legacy_mutations.js');
    const eventUiHelpersSource = read('game/features/event/presentation/browser/event_ui_helpers.js');
    const runModeHelpersSource = read('game/features/run/presentation/browser/run_mode_ui_helpers.js');
    const endingActionPortsSource = read('game/features/title/application/ending_action_ports.js');
    const combatTurnPortsSource = read('game/features/combat/platform/combat_turn_runtime_ports.js');
    const saveStatusPresenterSource = read('game/platform/browser/notifications/save_status_presenter.js');
    const saveRuntimeNotificationsSource = read('game/platform/browser/notifications/save_runtime_notifications.js');
    const titleSaveSlotHelpersSource = read('game/features/title/presentation/browser/title_save_slot_helpers.js');
    const titleSaveSlotControlsSource = read('game/features/title/presentation/browser/title_save_slot_controls.js');

    expect(runOutcomeSource).toContain("from '../../../core/store/selectors.js'");
    expect(runOutcomeSource).not.toContain('function selectCombatState(');
    expect(runOutcomeSource).not.toContain('function selectMetaState(');
    expect(runOutcomeSource).not.toContain('function selectPlayerState(');
    expect(runOutcomeSource).not.toContain('function selectStatsState(');

    expect(playerStateCommandsSource).toContain("from './player_state_helpers.js'");
    expect(playerLegacyMutationsSource).toContain("from './player_state_helpers.js'");

    expect(eventUiHelpersSource).toContain("from '../../platform/event_runtime_deps.js'");
    expect(eventUiHelpersSource).not.toContain('export function getEventId(');
    expect(eventUiHelpersSource).not.toContain('export function getDoc(');
    expect(eventUiHelpersSource).not.toContain('export function getGS(');
    expect(eventUiHelpersSource).not.toContain('export function getData(');
    expect(eventUiHelpersSource).not.toContain('export function getRunRules(');
    expect(eventUiHelpersSource).not.toContain('export function getAudioEngine(');

    expect(runModeHelpersSource).toContain("from '../../../../platform/browser/dom/public.js'");
    expect(endingActionPortsSource).toContain("from '../ports/ending_runtime_ports.js'");
    expect(endingActionPortsSource).not.toContain("from '../../../platform/browser/dom/public.js'");
    expect(combatTurnPortsSource).toContain("from '../../../utils/runtime_deps.js'");
    expect(saveRuntimeNotificationsSource).not.toContain("from '../../../utils/runtime_deps.js'");

    expect(saveStatusPresenterSource).toContain("from '../../../shared/save/save_status_formatters.js'");
    expect(titleSaveSlotHelpersSource).toContain("from './title_save_slot_controls.js'");
    expect(titleSaveSlotHelpersSource).not.toContain("from '../../../../shared/save/save_status_formatters.js'");
    expect(titleSaveSlotControlsSource).toContain("from '../../../../shared/save/save_status_formatters.js'");
  });
});
