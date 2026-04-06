import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';
import { ROOT, readText, toPosix, walkJsFiles } from './helpers/guardrail_fs.js';

function readFullPath(fullPath) {
  return readText(toPosix(path.relative(ROOT, fullPath)));
}

describe('architecture refactor guardrails', () => {
  it('keeps feature code free of direct core global bridge imports', () => {
    const matches = [];

    for (const fullPath of walkJsFiles(path.join(ROOT, 'game/features'))) {
      const source = readFullPath(fullPath);
      if (source.includes("from '../../../core/global_bridge.js'")
        || source.includes("from '../../core/global_bridge.js'")
        || source.includes("from '../core/global_bridge.js'")
        || source.includes("from './core/global_bridge.js'")) {
        matches.push(path.relative(ROOT, fullPath));
      }
    }

    expect(matches).toEqual([]);
  });

  it('keeps core run composition routed through public run capability ports', () => {
    const source = readText('game/platform/browser/composition/build_core_run_system_modules.js');

    expect(source).toContain("from '../../../features/run/ports/public_system_capabilities.js'");
    expect(source).toContain('configureSaveRuntimeContext');
    expect(source).not.toContain("from '../../../features/run/application/");
    expect(source).not.toContain('bindSaveStorage(');
    expect(source).not.toContain('bindSaveNotifications(');
  });

  it('keeps core progression composition routed through canonical feature/shared owners', () => {
    const source = readText('game/platform/browser/composition/build_core_progression_modules.js');

    expect(source).not.toContain("from '../../../combat/difficulty_scaler.js'");
    expect(source).not.toContain("from '../../../systems/set_bonus_system.js'");
    expect(source).not.toContain("from '../../../features/combat/domain/difficulty_scaler.js'");
    expect(source).not.toContain("from '../../../shared/class/class_mechanics.js'");
    expect(source).toContain("from '../../../features/combat/ports/public_system_capabilities.js'");
    expect(source).toContain("from '../../../shared/progression/public.js'");
    expect(source).toContain('ClassMechanics: classMechanics.ClassMechanics');
  });

  it('routes core runtime bindings through feature ports/runtime surfaces', () => {
    const files = [
      'game/core/bootstrap/build_game_boot_action_groups.js',
      'game/core/bootstrap/build_runtime_subscriber_action_groups.js',
    ];

    for (const file of files) {
      const source = readText(file);
      expect(source).toContain('/ports/runtime/');
    }
  });

  it('keeps core feature binding and contract catalogs behind core/composition-owned aggregate catalogs', () => {
    const bindingRefsSource = readText('game/core/bootstrap/build_binding_feature_refs.js');
    const contractsSource = readText('game/core/deps/contracts/create_feature_contract_capabilities.js');
    const debugSnapshotSource = readText('game/core/bootstrap/create_runtime_debug_snapshot.js');

    expect(bindingRefsSource).toContain("../composition/feature_binding_ref_catalog.js");
    expect(bindingRefsSource).not.toContain('../../features/combat/ports/public_binding_ref_capabilities.js');
    expect(contractsSource).toContain("../../composition/feature_contract_capability_catalog.js");
    expect(contractsSource).not.toContain("../../../features/combat/ports/public_contract_capabilities.js");
    expect(debugSnapshotSource).toContain("../composition/runtime_debug_snapshot_catalog.js");
    expect(debugSnapshotSource).not.toContain("../../features/combat/ports/runtime_debug_snapshot.js");
  });

  it('routes moved codex and loadout business logic through feature-owned canonical ports', () => {
    const titleLoadoutSource = readText('game/features/title/platform/browser/character_select_mount_loadout.js');
    const codexStateHelpersSource = readText('game/features/codex/presentation/browser/codex_ui_state_helpers.js');
    const combatCodexRuntimeSource = readText('game/features/combat/ports/public_codex_runtime_capabilities.js');

    expect(titleLoadoutSource).toContain("../../../meta_progression/ports/public_loadout_capabilities.js");
    expect(titleLoadoutSource).not.toContain("../../../../shared/progression/class_loadout_preset_use_case.js");
    expect(codexStateHelpersSource).toContain("../../ports/public_state_capabilities.js");
    expect(codexStateHelpersSource).not.toContain("../../../../shared/codex/codex_record_state_use_case.js");
    expect(combatCodexRuntimeSource).toContain("../../codex/ports/public_state_capabilities.js");
    expect(combatCodexRuntimeSource).not.toContain("../../../shared/codex/codex_records.js");
  });

  it('keeps title and ui shell orchestration delegated to the frontdoor feature', () => {
    const titleFlowSource = readText('game/features/title/platform/browser/create_title_flow_actions.js');
    const titleBootRuntimeSource = readText('game/features/title/presentation/browser/game_boot_ui_runtime.js');
    const uiHelpPauseContractSource = readText('game/features/ui/ports/contracts/build_ui_help_pause_contract.js');

    expect(titleFlowSource).toContain("../../../frontdoor/ports/public_application_capabilities.js");
    expect(titleFlowSource).not.toContain("../../application/title_run_entry_actions.js");
    expect(titleFlowSource).not.toContain("../../../codex/ports/public_browser_modules.js");
    expect(titleBootRuntimeSource).toContain("../../../frontdoor/ports/public_runtime_capabilities.js");
    expect(titleBootRuntimeSource).not.toContain("./game_boot_ui_fx.js");
    expect(titleBootRuntimeSource).not.toContain("../../platform/browser/title_asset_runtime.js");
    expect(uiHelpPauseContractSource).toContain("../../../frontdoor/ports/public_application_capabilities.js");
    expect(uiHelpPauseContractSource).not.toContain("../../../title/ports/public_help_pause_application_capabilities.js");
  });

  it('keeps frontdoor title-shell access behind frontdoor-local bridge ports', () => {
    const frontdoorFlowSource = readText('game/features/frontdoor/application/create_frontdoor_flow_actions.js');
    const frontdoorBootRuntimeSource = readText('game/features/frontdoor/platform/browser/frontdoor_boot_runtime.js');
    const frontdoorTitlePortsSource = readText('game/features/frontdoor/ports/frontdoor_title_flow_ports.js');
    const frontdoorTitleBootPortsSource = readText('game/features/frontdoor/ports/frontdoor_title_boot_ports.js');
    const titleFrontdoorFlowSource = readText('game/features/title/ports/public_frontdoor_flow_capabilities.js');
    const titleFrontdoorBootSource = readText('game/features/title/ports/public_frontdoor_boot_capabilities.js');
    const titleFrontdoorCompatSource = readText('game/features/title/ports/public_frontdoor_capabilities.js');

    expect(frontdoorFlowSource).toContain("../ports/frontdoor_title_flow_ports.js");
    expect(frontdoorFlowSource).not.toContain("../../title/ports/public_frontdoor_capabilities.js");
    expect(frontdoorBootRuntimeSource).toContain("../../ports/frontdoor_title_boot_ports.js");
    expect(frontdoorBootRuntimeSource).not.toContain("../../../title/ports/public_frontdoor_capabilities.js");
    expect(frontdoorTitlePortsSource).toContain("../../title/ports/public_frontdoor_flow_capabilities.js");
    expect(frontdoorTitlePortsSource).not.toContain("../../title/ports/public_frontdoor_capabilities.js");
    expect(frontdoorTitleBootPortsSource).toContain("../../title/ports/public_frontdoor_boot_capabilities.js");
    expect(titleFrontdoorFlowSource).toContain("../application/title_run_entry_actions.js");
    expect(titleFrontdoorFlowSource).toContain("../presentation/browser/title_screen_dom.js");
    expect(titleFrontdoorBootSource).toContain("../presentation/browser/game_boot_ui_fx.js");
    expect(titleFrontdoorBootSource).toContain("../presentation/browser/game_boot_ui_helpers.js");
    expect(titleFrontdoorCompatSource).toContain("./public_frontdoor_boot_capabilities.js");
    expect(titleFrontdoorCompatSource).toContain("./public_frontdoor_flow_capabilities.js");
  });

  it('keeps legacy bridge bootstrap registration routed through a single core helper', () => {
    const initRuntimeSource = readText('game/core/bootstrap/init_bootstrap_runtime.js');
    const registerLegacySource = readText('game/core/bootstrap/register_legacy_surface.js');

    expect(initRuntimeSource).toContain("./register_legacy_surface.js");
    expect(initRuntimeSource).not.toContain("../../platform/legacy/public.js");
    expect(registerLegacySource).toContain("../../platform/legacy/public.js");
  });

  it('keeps game state runtime method ownership in shared/state', () => {
    const gameStateSource = readText('game/core/game_state.js');
    const storeStateSource = readText('game/core/store/game_state.js');
    const compatSource = readText('game/core/game_state_core_methods.js');

    expect(gameStateSource).toContain("from './store/game_state.js'");
    expect(gameStateSource).not.toContain('export const GS = {');
    expect(storeStateSource).toContain("from '../../shared/state/game_state_runtime_methods.js'");
    expect(storeStateSource).not.toContain("from '../game_state_core_methods.js'");
    expect(storeStateSource).not.toContain('attachCombatGameStateRuntimeMethods(GS)');
    expect(compatSource).toContain("../shared/state/game_state_runtime_methods.js");
  });

  it('keeps browser runtime GS exports canonical and pushes legacy GS facade wrapping into compat helpers', () => {
    const engineSource = readText('game/platform/browser/composition/build_core_engine_modules.js');
    const compatSource = readText('game/core/bindings/create_module_registry_flat_compat.js');

    expect(engineSource).not.toContain("from '../../../platform/legacy/state/legacy_game_state_runtime_facade.js'");
    expect(engineSource).not.toContain('createLegacyGameStateRuntimeFacade(GS)');
    expect(compatSource).toContain("../game_state_core_methods.js");
    expect(compatSource).toContain('createLegacyGameStateRuntimeFacade');
  });

  it('scans systems as a frozen compat surface', () => {
    const config = JSON.parse(readText('config/quality/compat_surface_allowlist.json'));

    expect(config.scanDirs).toContain('game/systems');
  });

  it('keeps legacy game api adapters routed through feature ports and runtime surfaces', () => {
    const matches = [];

    for (const fullPath of walkJsFiles(path.join(ROOT, 'game/platform/legacy/game_api'))) {
      const source = readFullPath(fullPath);
      if (source.includes('/features/') && source.includes('/application/')) {
        matches.push(path.relative(ROOT, fullPath));
      }
      expect(source.includes('/features/') && source.includes('/public.js')).toBe(false);
    }

    expect(matches).toEqual([]);
  });

  it('keeps core and platform code off feature public-surface aggregators', () => {
    const roots = ['game/core', 'game/platform'];
    const matches = [];

    roots
      .flatMap((dir) => walkJsFiles(dir))
      .forEach((fullPath) => {
        const relPath = toPosix(path.relative(ROOT, fullPath));
        const source = readFullPath(fullPath);
        if (/\/features\/.+(\/public\.js|\/ports\/public_surface\.js)/.test(source)) {
          matches.push(relPath);
        }
      });

    expect(matches).toEqual([]);
  });

  it('keeps legacy player-state fallback enablement inside platform/legacy only', () => {
    const matches = [];

    for (const fullPath of walkJsFiles(path.join(ROOT, 'game'))) {
      const relPath = toPosix(path.relative(ROOT, fullPath));
      if (relPath.startsWith('game/platform/legacy/')) continue;
      if (relPath === 'game/shared/state/player_state_commands.js') continue;
      if (relPath === 'game/shared/state/player_state_command_compat.js') continue;

      const source = readFullPath(fullPath);
      if (source.includes('enableLegacyPlayerStateCommandFallback')) {
        matches.push(relPath);
      }
    }

    expect(matches).toEqual([]);
  });

  it('keeps shared player-state commands free of legacy fallback flag literals', () => {
    const source = readText('game/shared/state/player_state_commands.js');
    const bridgeSource = readText('game/shared/state/player_state_legacy_runtime_bridge.js');

    expect(source).not.toContain('__legacyPlayerStateCommandFallback');
    expect(source).not.toContain("./player_state_command_fallback_flag.js");
    expect(source).toContain("./player_state_legacy_runtime_bridge.js");
    expect(bridgeSource).toContain("../../platform/legacy/state/player_state_command_legacy_adapter.js");
  });

  it('keeps shared runtime methods routed through explicit legacy compat adapters for combat/card helpers', () => {
    const source = readText('game/shared/state/game_state_runtime_methods.js');

    expect(source).not.toContain("../../features/combat/application/card_methods_compat.js");
    expect(source).not.toContain("../../features/combat/application/combat_methods_compat.js");
    expect(source).toContain("./compat/game_state_card_runtime_compat_methods.js");
    expect(source).toContain("./compat/game_state_combat_runtime_compat_methods.js");
  });

  it('keeps run region rules free of the core global bridge fallback', () => {
    expect(fs.existsSync(path.join(ROOT, 'game/systems/run_rules_regions.js'))).toBe(false);
  });

  it('keeps run rules feature ownership free of legacy systems run-rule imports', () => {
    const source = readText('game/features/run/application/run_rules.js');
    const scalingSource = readText('game/features/run/application/run_rule_scaling.js');
    const metaSource = readText('game/features/run/application/run_rule_meta.js');

    expect(source).not.toContain("from '../../../systems/run_rules_");
    expect(source).toContain("from '../domain/run_rules_curses.js'");
    expect(source).toContain("from '../domain/run_rules_regions.js'");
    expect(scalingSource).toContain("from '../domain/run_rules_difficulty.js'");
    expect(metaSource).toContain("from '../domain/run_rules_meta.js'");
  });

  it('keeps maze runtime host access behind injected run platform ports', () => {
    const source = readText('game/features/run/application/create_maze_runtime.js');
    const browserRuntimeSource = readText('game/features/run/presentation/browser/create_maze_browser_runtime.js');

    expect(source).toContain('const host = deps.mazeHost || null;');
    expect(source).not.toContain('dom.getWin()?.');
    expect(browserRuntimeSource).toContain("../../platform/browser/maze_runtime_host.js");
  });

  it('routes run-start loadout ownership through canonical run state and meta progression ports', () => {
    const canonicalSource = readText('game/features/run/state/run_state_commands.js');
    const sharedSource = readText('game/shared/state/run_state_commands.js');
    const sharedLoadoutUseCaseSource = readText('game/shared/progression/class_loadout_preset_use_case.js');
    const sharedLoadoutHelpersSource = readText('game/shared/progression/class_loadout_preset_helpers.js');
    const sharedLoadoutCatalogSource = readText('game/shared/progression/class_loadout_preset_catalog.js');
    const sharedClassProgressSource = readText('game/shared/progression/class_progression_data_use_case.js');
    const titleXpPolicySource = readText('game/features/title/domain/class_progression/xp_policy.js');
    const titleMetaPersistenceSource = readText('game/features/title/domain/class_progression/meta_persistence.js');
    const titleQueriesSource = readText('game/features/title/domain/class_progression/class_progression_queries.js');

    expect(canonicalSource).toContain("../../meta_progression/ports/public_loadout_capabilities.js");
    expect(canonicalSource).not.toContain("../progression/class_loadout_preset_use_case.js");
    expect(sharedSource).toContain("../../features/run/state/run_state_commands.js");
    expect(sharedLoadoutUseCaseSource).toContain("../../features/meta_progression/ports/public_loadout_capabilities.js");
    expect(sharedLoadoutUseCaseSource).not.toContain("../../features/meta_progression/application/class_loadout_preset_use_case.js");
    expect(sharedLoadoutHelpersSource).toContain("../../features/meta_progression/ports/public_loadout_capabilities.js");
    expect(sharedLoadoutHelpersSource).not.toContain("../../features/meta_progression/domain/class_loadout_preset_helpers.js");
    expect(sharedLoadoutCatalogSource).toContain("../../features/meta_progression/ports/public_loadout_capabilities.js");
    expect(sharedLoadoutCatalogSource).not.toContain("../../features/meta_progression/domain/class_loadout_preset_catalog.js");
    expect(sharedClassProgressSource).toContain("../../features/meta_progression/ports/public_class_progression_capabilities.js");
    expect(titleXpPolicySource).toContain("../../../meta_progression/ports/public_class_progression_capabilities.js");
    expect(titleMetaPersistenceSource).toContain("../../../meta_progression/ports/public_class_progression_capabilities.js");
    expect(titleQueriesSource).toContain("../../../meta_progression/ports/public_class_progression_capabilities.js");
    expect(titleXpPolicySource).not.toContain("../../../../shared/progression/class_progression_data_use_case.js");
    expect(titleMetaPersistenceSource).not.toContain("../../../../shared/progression/class_progression_data_use_case.js");
    expect(titleQueriesSource).not.toContain("../../../../shared/progression/class_progression_data_use_case.js");
  });

  it('keeps title progression ports split between class progression and character-select helpers', () => {
    const classProgressionPortSource = readText('game/features/title/ports/public_class_progression_capabilities.js');
    const characterSelectProgressionPortSource = readText('game/features/title/ports/public_character_select_progression_capabilities.js');
    const compatProgressionPortSource = readText('game/features/title/ports/public_progression_capabilities.js');
    const compatClassProgressionAliasSource = readText('game/features/title/ports/class_progression_ports.js');
    const rewardPolicyPortSource = readText('game/features/reward/ports/reward_option_policy_ports.js');
    const runRuleProgressionPortsSource = readText('game/features/run/ports/create_run_rule_progression_ports.js');
    const runOutcomeIntegrationPortsSource = readText('game/features/run/ports/create_run_outcome_integration_ports.js');
    const mountRuntimeSource = readText('game/features/title/platform/browser/create_character_select_mount_runtime.js');
    const runtimeBindingsSource = readText('game/features/title/platform/browser/character_select_runtime_progression_bindings.js');

    expect(classProgressionPortSource).toContain("../domain/class_progression_system.js");
    expect(characterSelectProgressionPortSource).toContain("../application/load_character_select_use_case.js");
    expect(compatProgressionPortSource).toContain("./public_class_progression_capabilities.js");
    expect(compatProgressionPortSource).toContain("./public_character_select_progression_capabilities.js");
    expect(compatClassProgressionAliasSource).toContain("./public_class_progression_capabilities.js");
    expect(rewardPolicyPortSource).toContain("../../title/ports/public_class_progression_capabilities.js");
    expect(rewardPolicyPortSource).not.toContain("../../title/ports/public_progression_capabilities.js");
    expect(runRuleProgressionPortsSource).toContain("../../title/ports/public_class_progression_capabilities.js");
    expect(runRuleProgressionPortsSource).not.toContain("../../title/ports/public_progression_capabilities.js");
    expect(runOutcomeIntegrationPortsSource).toContain("../../title/ports/public_class_progression_capabilities.js");
    expect(runOutcomeIntegrationPortsSource).not.toContain("../../title/ports/public_progression_capabilities.js");
    expect(mountRuntimeSource).toContain("../../ports/public_character_select_progression_capabilities.js");
    expect(mountRuntimeSource).not.toContain("../../application/load_character_select_use_case.js");
    expect(runtimeBindingsSource).toContain("../../ports/public_character_select_progression_capabilities.js");
    expect(runtimeBindingsSource).not.toContain("../../application/load_character_select_use_case.js");
  });

  it('keeps meta progression consumers routed through narrow unlock and achievement ports', () => {
    const achievementPortSource = readText('game/features/meta_progression/ports/public_achievement_capabilities.js');
    const achievementApplicationPortSource = readText('game/features/meta_progression/ports/public_achievement_application_capabilities.js');
    const unlockApplicationPortSource = readText('game/features/meta_progression/ports/public_unlock_application_capabilities.js');
    const metaPublicSource = readText('game/features/meta_progression/public.js');
    const rewardPolicyPortSource = readText('game/features/reward/ports/reward_option_policy_ports.js');
    const itemShopPolicyPortSource = readText('game/features/event/ports/item_shop_policy_ports.js');
    const runRuleProgressionPortsSource = readText('game/features/run/ports/create_run_rule_progression_ports.js');
    const runOutcomeIntegrationPortsSource = readText('game/features/run/ports/create_run_outcome_integration_ports.js');
    const rewardUiHelpersSource = readText('game/features/reward/presentation/browser/reward_ui_helpers.js');
    const rewardScreenRuntimeHelpersSource = readText('game/features/reward/presentation/browser/reward_screen_runtime_helpers.js');
    const runModeUiSource = readText('game/features/run/presentation/browser/run_mode_ui.js');
    const runModeUiRenderSource = readText('game/features/run/presentation/browser/run_mode_ui_render.js');
    const runModeUiRuntimeSource = readText('game/features/run/presentation/browser/run_mode_ui_runtime.js');
    const codexPopupPayloadsSource = readText('game/features/codex/presentation/browser/codex_ui_popup_payloads.js');
    const codexProgressionQueriesSource = readText('game/features/codex/domain/codex_progression_queries.js');
    const endingScreenHelpersSource = readText('game/features/ui/presentation/browser/ending_screen_helpers.js');

    expect(achievementPortSource).toContain("../domain/achievement_definitions.js");
    expect(achievementPortSource).toContain("../domain/achievement_progress_queries.js");
    expect(achievementApplicationPortSource).toContain("../application/evaluate_achievement_trigger.js");
    expect(achievementApplicationPortSource).toContain("../application/reconcile_meta_progression.js");
    expect(unlockApplicationPortSource).toContain("../application/apply_content_unlock_rewards.js");
    expect(metaPublicSource).toContain("./ports/public_loadout_capabilities.js");
    expect(metaPublicSource).toContain("./ports/public_unlock_capabilities.js");
    expect(metaPublicSource).toContain("./ports/public_unlock_application_capabilities.js");
    expect(metaPublicSource).toContain("./ports/public_achievement_capabilities.js");
    expect(metaPublicSource).toContain("./ports/public_achievement_application_capabilities.js");
    expect(metaPublicSource).not.toContain("./domain/class_loadout_preset_catalog.js");
    expect(metaPublicSource).not.toContain("./domain/class_loadout_preset_helpers.js");
    expect(metaPublicSource).not.toContain("./application/class_loadout_preset_use_case.js");
    expect(metaPublicSource).not.toContain("./application/apply_content_unlock_rewards.js");
    expect(rewardPolicyPortSource).toContain("../../meta_progression/ports/public_unlock_capabilities.js");
    expect(rewardPolicyPortSource).not.toContain("../../meta_progression/public.js");
    expect(itemShopPolicyPortSource).toContain("../../meta_progression/ports/public_unlock_capabilities.js");
    expect(itemShopPolicyPortSource).not.toContain("../../meta_progression/public.js");
    expect(runRuleProgressionPortsSource).toContain("../../meta_progression/ports/public_achievement_application_capabilities.js");
    expect(runRuleProgressionPortsSource).not.toContain("../../meta_progression/public.js");
    expect(runOutcomeIntegrationPortsSource).toContain("../../meta_progression/ports/public_achievement_application_capabilities.js");
    expect(runOutcomeIntegrationPortsSource).not.toContain("../../meta_progression/public.js");
    expect(rewardUiHelpersSource).toContain("../../../meta_progression/ports/public_unlock_capabilities.js");
    expect(rewardUiHelpersSource).not.toContain("../../../meta_progression/public.js");
    expect(rewardScreenRuntimeHelpersSource).toContain("../../../meta_progression/ports/public_unlock_capabilities.js");
    expect(rewardScreenRuntimeHelpersSource).not.toContain("../../../meta_progression/public.js");
    expect(runModeUiSource).toContain("../../../meta_progression/ports/public_unlock_capabilities.js");
    expect(runModeUiSource).not.toContain("../../../meta_progression/public.js");
    expect(runModeUiRenderSource).toContain("../../../meta_progression/ports/public_unlock_capabilities.js");
    expect(runModeUiRenderSource).not.toContain("../../../meta_progression/public.js");
    expect(runModeUiRuntimeSource).toContain("../../../meta_progression/ports/public_unlock_capabilities.js");
    expect(runModeUiRuntimeSource).not.toContain("../../../meta_progression/public.js");
    expect(codexPopupPayloadsSource).toContain("../../../meta_progression/ports/public_unlock_capabilities.js");
    expect(codexPopupPayloadsSource).not.toContain("../../../meta_progression/public.js");
    expect(codexProgressionQueriesSource).toContain("../../meta_progression/ports/public_achievement_capabilities.js");
    expect(codexProgressionQueriesSource).toContain("../../meta_progression/ports/public_unlock_capabilities.js");
    expect(codexProgressionQueriesSource).not.toContain("../../meta_progression/public.js");
    expect(endingScreenHelpersSource).toContain("../../../meta_progression/ports/public_achievement_capabilities.js");
    expect(endingScreenHelpersSource).toContain("../../../meta_progression/ports/public_unlock_capabilities.js");
    expect(endingScreenHelpersSource).not.toContain("../../../meta_progression/public.js");
  });

  it('keeps feature code free of direct systems imports', () => {
    const matches = [];

    for (const fullPath of walkJsFiles('game/features')) {
      const source = readFullPath(fullPath);
      if (source.includes('/systems/')) {
        matches.push(toPosix(path.relative(ROOT, fullPath)));
      }
    }

    expect(matches).toEqual([]);
  });

  it('keeps the transitional game/domain root empty once canonical owners exist', () => {
    if (!fs.existsSync(path.join(ROOT, 'game/domain'))) {
      expect(true).toBe(true);
      return;
    }
    expect(walkJsFiles('game/domain')).toEqual([]);
  });

  it('keeps combat feature death flow routed through feature-owned helpers', () => {
    const files = [
      'game/features/combat/application/death_flow_actions.js',
      'game/features/combat/platform/death_runtime_ports.js',
    ];

    for (const file of files) {
      const source = readText(file);
      expect(source).not.toContain('/combat/death_handler_');
    }
  });

  it('keeps combat ui contracts free of GS playCard fallbacks', () => {
    const source = readText('game/features/combat/ports/contracts/build_combat_ui_contracts.js');

    expect(source).not.toContain('refs.GS?.playCard');
  });

  it('removes inline close handlers from the run settings modal shell', () => {
    const html = readText('index.html');
    expect(html).not.toContain('onclick="closeRunSettings()"');
  });

  it('keeps direct legacy global access inside platform/legacy only', () => {
    const matches = [];
    const blockedPatterns = [
      /\bwindow\.(?:GS|GAME|GameState)\b/,
      /\bglobalThis\.(?:GS|GAME|GameState)\b/,
    ];

    for (const fullPath of walkJsFiles('game')) {
      const relPath = toPosix(path.relative(ROOT, fullPath));
      if (relPath.startsWith('game/platform/legacy/')) continue;

      const source = readFullPath(fullPath);
      if (blockedPatterns.some((pattern) => pattern.test(source))) {
        matches.push(relPath);
      }
    }

    expect(matches).toEqual([]);
  });

  it('keeps combat hud shared view ports routed through platform browser effects', () => {
    const source = readText('game/features/combat/ports/hud_shared_view_ports.js');

    expect(source).toContain("from '../../../platform/browser/effects/button_feedback.js'");
    expect(source).not.toContain("from '../../../ui/feedback/button_feedback.js'");
  });

  it('keeps game state runtime methods routed through explicit shared compat adapters for combat/card helpers', () => {
    const source = readText('game/shared/state/game_state_runtime_methods.js');

    expect(source).toContain("from './compat/game_state_card_runtime_compat_methods.js'");
    expect(source).toContain("from './compat/game_state_combat_runtime_compat_methods.js'");
    expect(source).not.toContain("from '../../combat/card_methods.js'");
    expect(source).not.toContain("from '../../combat/combat_methods.js'");
  });

  it('routes event, run, and reward flow callers through canonical workflow owners', () => {
    const expectations = [
      [
        'game/features/event/application/create_event_ui_runtime.js',
        "from './workflows/event_choice_flow.js'",
        '../app/event_choice_flow_actions.js',
      ],
      [
        'game/features/run/presentation/browser/run_return_ui_runtime.js',
        "from '../../application/workflows/run_return_flow.js'",
        '../../application/run_return_actions.js',
      ],
      [
        'game/features/reward/presentation/browser/reward_ui.js',
        "from '../../application/workflows/show_reward_screen_workflow.js'",
        '../../application/show_reward_screen_runtime.js',
      ],
    ];

    for (const [file, allowedImport, blockedImport] of expectations) {
      const source = readText(file);
      expect(source).toContain(allowedImport);
      expect(source).not.toContain(blockedImport);
    }
  });

  it('keeps selected application workflows free of direct presentation and browser module imports', () => {
    const expectations = [
      [
        'game/features/event/application/workflows/event_choice_flow.js',
        '../../presentation/',
      ],
      [
        'game/features/event/application/workflows/event_choice_flow.js',
        '../../platform/',
      ],
      [
        'game/features/reward/application/workflows/show_reward_screen_workflow.js',
        '../../presentation/',
      ],
      [
        'game/features/run/application/create_maze_runtime.js',
        '../presentation/',
      ],
      [
        'game/features/run/application/create_maze_runtime.js',
        '../platform/browser/',
      ],
      [
        'game/features/run/application/workflows/run_return_flow.js',
        '../../presentation/',
      ],
      [
        'game/features/title/application/help_pause_abandon_actions.js',
        '../presentation/',
      ],
      [
        'game/features/event/application/resolve_event_choice_use_case.js',
        '../presentation/',
      ],
      [
        'game/features/run/application/create_map_navigation_runtime.js',
        '../presentation/',
      ],
    ];

    for (const [file, blockedImport] of expectations) {
      const source = readText(file);
      expect(source).not.toContain(blockedImport);
    }
  });

  it('keeps run return workflow on explicit feature-local runtime ports and logger-based error handling', () => {
    const source = readText('game/features/run/application/workflows/run_return_flow.js');

    expect(source).toContain("../../ports/public_run_return_presentation_capabilities.js");
    expect(source).toContain("../../ports/run_runtime_timing_ports.js");
    expect(source).not.toContain("../../../../platform/browser/dom/public.js");
    expect(source).toContain('getRunSetTimeout');
    expect(source).not.toContain('console.error');
    expect(source).not.toContain('setTimeout(');
    expect(source).not.toContain("../../presentation/browser/run_return_overlay_presenter.js");
    expect(source).not.toContain("../../presentation/browser/run_return_branch_presenter.js");
  });

  it('keeps selected application/runtime modules free of direct console logging', () => {
    const files = [
      'game/features/title/application/character_select_actions.js',
      'game/features/run/application/run_rule_outcome.js',
      'game/features/event/application/workflows/event_choice_flow_error_handler.js',
      'game/features/run/application/create_run_start_runtime.js',
      'game/features/run/application/run_start_gameplay_runtime.js',
      'game/features/combat/application/start_combat_flow_use_case.js',
      'game/features/run/application/create_map_navigation_runtime.js',
      'game/features/combat/application/end_player_turn_use_case.js',
    ];

    for (const file of files) {
      const source = readText(file);
      expect(source).not.toContain('console.');
    }
  });

  it('keeps selected core bootstrap modules free of direct console logging and hardwired browser globals', () => {
    const expectations = [
      ['game/core/bootstrap/build_runtime_boot_bindings.js', 'console.'],
      ['game/core/bootstrap/build_runtime_debug_hooks.js', 'console.'],
      ['game/core/bootstrap/create_bootstrap_context.js', '|| document'],
      ['game/core/bootstrap/create_bootstrap_context.js', '|| window'],
      ['game/core/init_sequence.js', 'doc: document'],
      ['game/core/init_sequence.js', 'win: window'],
    ];

    for (const [file, blockedPattern] of expectations) {
      const source = readText(file);
      expect(source).not.toContain(blockedPattern);
    }
  });

  it('keeps selected shared and combat domain modules free of direct console logging and document fallbacks', () => {
    const expectations = [
      ['game/shared/ui/player_hp_panel/player_hp_panel_ui.js', '|| document'],
      ['game/features/combat/domain/turn/enemy_effect_resolver.js', 'console.'],
      ['game/features/combat/domain/difficulty_scaler.js', 'console.'],
    ];

    for (const [file, blockedPattern] of expectations) {
      const source = readText(file);
      expect(source).not.toContain(blockedPattern);
    }
  });

  it('keeps combat lifecycle application free of browser global fallbacks and broad ui audio imports', () => {
    const source = readText('game/features/combat/application/combat_lifecycle_facade.js');

    expect(source).not.toContain('|| document');
    expect(source).not.toContain('|| window');
    expect(source).not.toContain('console.error');
    expect(source).not.toContain("../../ui/ports/public_audio_support_capabilities.js");
  });

  it('routes application scheduling helpers through feature-local runtime timing ports instead of platform imports', () => {
    const runStartSource = readText('game/features/run/application/run_start_gameplay_runtime.js');
    const endPlayerTurnSource = readText('game/features/combat/application/end_player_turn_use_case.js');

    expect(runStartSource).toContain("from '../ports/run_runtime_timing_ports.js'");
    expect(runStartSource).toContain('getRunSetTimeout');
    expect(runStartSource).toContain('getRunRaf');
    expect(runStartSource).not.toContain("from '../../../platform/browser/dom/public.js'");
    expect(runStartSource).not.toContain('setTimeout(');
    expect(endPlayerTurnSource).toContain("from '../ports/public_runtime_timing_capabilities.js'");
    expect(endPlayerTurnSource).toContain('getCombatSetTimeout');
    expect(endPlayerTurnSource).not.toContain("from '../../../platform/browser/dom/public.js'");
    expect(endPlayerTurnSource).not.toContain('setTimeout(');
  });

  it('keeps frontdoor codex readiness and combat run-rule access behind feature-local ports', () => {
    const frontdoorFlowSource = readText('game/features/frontdoor/application/create_frontdoor_flow_actions.js');
    const combatLifecycleSource = readText('game/features/combat/application/combat_lifecycle_facade.js');
    const runEnemyTurnSource = readText('game/features/combat/application/run_enemy_turn_use_case.js');

    expect(frontdoorFlowSource).toContain("../ports/create_frontdoor_codex_runtime_ports.js");
    expect(frontdoorFlowSource).not.toContain("../../codex/ports/public_browser_modules.js");
    expect(combatLifecycleSource).toContain("../ports/public_run_rule_capabilities.js");
    expect(combatLifecycleSource).not.toContain("../../run/ports/public_rule_capabilities.js");
    expect(runEnemyTurnSource).toContain("../ports/public_run_rule_capabilities.js");
    expect(runEnemyTurnSource).not.toContain("../../run/ports/public_rule_capabilities.js");
  });

  it('keeps save infrastructure free of embedded presenter imports and DOM toasts', () => {
    const saveSystemSource = readText('game/shared/save/save_system.js');
    const saveAdapterSource = readText('game/platform/storage/save_adapter.js');

    expect(saveSystemSource).not.toContain("./save_status_presenter.js");
    expect(saveAdapterSource).toContain("../browser/storage/local_save_adapter.js");
    expect(saveAdapterSource).not.toContain('doc.createElement');
    expect(saveAdapterSource).not.toContain('doc.body.appendChild');
  });

  it('routes feature utility access through feature-owned support wrappers', () => {
    const expectations = [
      [
        'game/features/event/application/create_event_ui_runtime.js',
        "from './event_idempotency.js'",
        "../../../utils/idempotency_utils.js",
      ],
      [
        'game/features/reward/application/reward_runtime_actions.js',
        "from './reward_idempotency.js'",
        "../../../utils/idempotency_utils.js",
      ],
      [
        'game/features/reward/application/workflows/show_reward_screen_workflow.js',
        "from '../reward_idempotency.js'",
        "../../../../utils/idempotency_utils.js",
      ],
      [
        'game/features/combat/application/public_combat_command_actions.js',
        "from '../ports/combat_logging.js'",
        "../../../utils/logger.js",
      ],
      [
        'game/features/combat/application/combat_lifecycle_facade.js',
        "from '../ports/combat_logging.js'",
        "../../../utils/log_utils.js",
      ],
      [
        'game/features/combat/application/damage_system_facade.js',
        "from '../ports/combat_logging.js'",
        "../../../utils/logger.js",
      ],
      [
        'game/features/combat/domain/enemy_turn_domain.js',
        "from '../ports/combat_logging.js'",
        "../../../utils/log_utils.js",
      ],
      [
        'game/features/combat/application/enemy_damage_resolution.js',
        "from '../ports/combat_logging.js'",
        "../../../utils/logger.js",
      ],
      [
        'game/features/combat/domain/player_status_tick_domain.js',
        "from '../ports/combat_logging.js'",
        "../../../utils/log_utils.js",
      ],
    ];

    for (const [file, allowedImport, blockedImport] of expectations) {
      const source = readText(file);
      expect(source).toContain(allowedImport);
      expect(source).not.toContain(blockedImport);
    }
  });

  it('keeps core card event subscribers as a thin combat feature compat surface', () => {
    const source = readText('game/core/event_subscribers_card_events.js').trim();

    expect(source).toBe(
      "export { registerCardEventSubscribers } from '../features/combat/ports/runtime/public_combat_runtime_surface.js';",
    );
  });

  it('keeps character-select mounting routed through the frontdoor runtime public surface', () => {
    const source = readText('game/core/bootstrap/mount_character_select.js');

    expect(source).toContain(
      "from '../../features/frontdoor/ports/runtime/public_frontdoor_runtime_surface.js'",
    );
    expect(source).not.toContain(
      "from '../../features/title/platform/browser/build_character_select_mount_payload.js'",
    );
  });
});
