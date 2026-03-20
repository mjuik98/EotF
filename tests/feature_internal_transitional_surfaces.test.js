import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();

describe('feature internal transitional surfaces', () => {
  it('keeps selected transitional files as thin re-exports to canonical owners', () => {
    const expectations = {
      'game/features/combat/app/build_runtime_subscriber_actions.js': /export\s+\{\s*buildCombatRuntimeSubscriberActions\s*\}\s+from\s+'\.\.\/application\/build_combat_runtime_subscriber_actions\.js';/,
      'game/features/combat/app/combat_actions.js': /export\s+\{\s*createCombatActions\s*\}\s+from\s+'\.\.\/platform\/browser\/create_combat_actions\.js';/,
      'game/features/combat/app/combat_lifecycle_feature_bridge.js': /export\s+\{\s*runEndCombatFlow\s*\}\s+from\s+'\.\.\/application\/run_end_combat_flow_use_case\.js';/,
      'game/features/combat/app/combat_turn_compat_actions.js': /export\s+\{[\s\S]*processEnemyStatusTicksAction[\s\S]*processPlayerStatusTicksAction[\s\S]*handleBossPhaseShiftAction[\s\S]*handleEnemyEffectAction[\s\S]*\}\s+from\s+'\.\.\/application\/combat_turn_runtime_actions\.js';/,
      'game/features/combat/app/enemy_spawn_planner.js': /export\s+\{\s*createEnemySpawnPlan\s*\}\s+from\s+'\.\.\/domain\/enemy_spawn_plan_domain\.js';/,
      'game/features/combat/app/game_state_card_actions.js': /export\s+\{[\s\S]*discardStateCard[\s\S]*drawStateCards[\s\S]*playStateCard[\s\S]*\}\s+from\s+'\.\.\/application\/public_combat_command_actions\.js';/,
      'game/features/combat/app/use_cases/end_combat_use_case.js': /export\s+\{\s*endCombatUseCase\s*\}\s+from\s+'\.\.\/\.\.\/application\/end_combat_use_case\.js';/,
      'game/features/event/app/event_actions.js': /export\s+\{\s*createEventActions\s*\}\s+from\s+'\.\.\/platform\/browser\/create_event_runtime_actions\.js';/,
      'game/features/event/app/event_choice_actions.js': /export\s+\{[\s\S]*createEventChoiceResult[\s\S]*createFailedEventChoiceResult[\s\S]*pickRandomEvent[\s\S]*resolveEventChoice[\s\S]*\}\s+from\s+'\.\.\/application\/resolve_event_choice_actions\.js';/,
      'game/features/event/app/event_choice_flow_actions.js': /export\s+\{\s*finishEventFlow,\s*resolveEventChoiceFlow,\s*\}\s+from\s+'\.\.\/application\/workflows\/event_choice_flow\.js';/,
      'game/features/event/app/event_item_shop_actions.js': /export\s+\{[\s\S]*discardEventCard[\s\S]*generateItemShopStock[\s\S]*purchaseItem[\s\S]*\}\s+from\s+'\.\.\/application\/item_shop_actions\.js';/,
      'game/features/event/app/event_manager_actions.js': /export\s+\{[\s\S]*buildItemShopStockAction[\s\S]*createRestEventAction[\s\S]*createShopEventAction[\s\S]*discardEventCardAction[\s\S]*pickRandomEventAction[\s\S]*purchaseItemFromShopAction[\s\S]*resolveEventChoiceAction[\s\S]*\}\s+from\s+'\.\.\/application\/event_manager_actions\.js';/,
      'game/features/event/app/event_reward_actions.js': /export\s+\{\s*createEventRewardActions\s*\}\s+from\s+'\.\.\/platform\/browser\/create_event_reward_actions\.js';/,
      'game/features/event/app/event_shop_actions.js': /export\s+\{[\s\S]*createRestEvent[\s\S]*createShopEvent[\s\S]*resolveRestResetStagnationChoice[\s\S]*resolveRestUpgradeChoice[\s\S]*resolveShopCardChoice[\s\S]*resolveShopPotionChoice[\s\S]*resolveShopUpgradeChoice[\s\S]*restResetStagnationDeck[\s\S]*restUpgradeCard[\s\S]*shopBuyCard[\s\S]*shopBuyEnergy[\s\S]*shopBuyPotion[\s\S]*shopUpgradeCard[\s\S]*\}\s+from\s+'\.\.\/application\/event_shop_actions\.js';/,
      'game/features/event/app/reward_actions.js': /export\s+\{\s*createRewardActions\s*\}\s+from\s+'\.\.\/\.\.\/reward\/ports\/runtime\/public_reward_runtime_surface\.js';/,
      'game/features/event/app/reward_navigation_actions.js': /export\s+\{\s*createRewardNavigationActions\s*\}\s+from\s+'\.\.\/\.\.\/reward\/ports\/runtime\/public_reward_runtime_surface\.js';/,
      'game/features/run/app/canvas_lifecycle_actions.js': /export\s+\{\s*createCanvasLifecycleActions\s*\}\s+from\s+'\.\.\/platform\/browser\/run_canvas_lifecycle_actions\.js';/,
      'game/features/run/app/create_run_canvas_actions.js': /export\s+\{\s*createRunCanvasActions\s*\}\s+from\s+'\.\.\/application\/create_run_canvas_actions\.js';/,
      'game/features/run/app/run_canvas_actions.js': /export\s+\{\s*createRunCanvasActions\s*\}\s+from\s+'\.\.\/application\/create_run_canvas_actions\.js';/,
      'game/features/run/app/run_map_actions.js': /export\s+\{\s*createRunMapActions\s*\}\s+from\s+'\.\.\/application\/run_map_actions\.js';/,
      'game/features/run/app/world_render_actions.js': /export\s+\{\s*createWorldRenderActions\s*\}\s+from\s+'\.\.\/application\/world_render_actions\.js';/,
      'game/features/combat/bindings/public_combat_bindings.js': /export\s+\{\s*createCombatBindingsActions\s+as\s+createCombatBindingsActions\s*\}\s+from\s+'\.\.\/ports\/public_binding_capabilities\.js';/,
      'game/features/combat/modules/public_combat_modules.js': /export\s+\{[\s\S]*buildCombatCardPublicModules[\s\S]*buildCombatHudPublicModules[\s\S]*buildCombatPublicModules[\s\S]*\}\s+from\s+'\.\.\/ports\/public_module_capabilities\.js';/,
      'game/features/combat/runtime/public_combat_runtime_actions.js': /export\s+\{[\s\S]*buildCombatRuntimeSubscriberPublicActions[\s\S]*createCombatRuntimeCapabilities[\s\S]*\}\s+from\s+'\.\.\/ports\/public_runtime_capabilities\.js';/,
      'game/features/run/presentation/browser/map/public_run_map_browser_modules.js': /export\s+\{\s*MapGenerationUI,\s*MapNavigationUI,\s*MapUI,\s*MazeSystem,\s*WorldCanvasUI,\s*WorldRenderLoopUI,?\s*\}\s+from\s+'\.\.\/public_run_map_modules\.js';/,
      'game/features/run/presentation/browser/transition/public_run_transition_browser_modules.js': /export\s+\{\s*RegionTransitionUI,\s*RunReturnUI,\s*RunSetupUI,\s*RunStartUI,?\s*\}\s+from\s+'\.\.\/public_run_transition_modules\.js';/,
      'game/features/run/bindings/public_run_bindings.js': /export\s+\{\s*createRunCanvasBindings\s+as\s+createRunCanvasBindings\s*\}\s+from\s+'\.\.\/ports\/public_binding_capabilities\.js';/,
      'game/features/run/modules/public_run_modules.js': /export\s+\{[\s\S]*buildRunFlowPublicModules[\s\S]*buildRunMapPublicModules[\s\S]*\}\s+from\s+'\.\.\/ports\/public_module_capabilities\.js';/,
      'game/features/run/runtime/public_run_runtime_actions.js': /export\s+\{[\s\S]*buildRunBootPublicActions[\s\S]*buildRunReturnRuntimePublicActions[\s\S]*createRunRuntimeCapabilities[\s\S]*\}\s+from\s+'\.\.\/ports\/public_runtime_capabilities\.js';/,
      'game/features/run/ui/run_entry_bindings.js': /export\s+\{\s*registerRunEntryBindings\s*\}\s+from\s+'\.\.\/ports\/public_binding_capabilities\.js';/,
      'game/features/title/app/build_title_boot_actions.js': /export\s+\{\s*buildTitleBootActions\s*\}\s+from\s+'\.\.\/application\/build_title_boot_actions\.js';/,
      'game/features/title/app/create_title_actions.js': /export\s+\{\s*createTitleActions\s*\}\s+from\s+'\.\.\/ports\/runtime\/public_title_runtime_surface\.js';/,
      'game/features/title/app/title_action_helpers.js': /export\s+\*\s+from\s+'\.\.\/platform\/browser\/title_action_helpers\.js';/,
      'game/features/title/app/title_actions.js': /export\s+\{\s*createTitleActions\s*\}\s+from\s+'\.\.\/ports\/runtime\/public_title_runtime_surface\.js';/,
      'game/features/title/app/title_flow_actions.js': /export\s+\{\s*createTitleFlowActions\s*\}\s+from\s+'\.\.\/platform\/browser\/create_title_flow_actions\.js';/,
      'game/features/title/app/title_return_actions.js': /export\s+\{[\s\S]*completeTitleReturn[\s\S]*returnToTitleFromPause[\s\S]*\}\s+from\s+'\.\.\/application\/title_return_actions\.js';/,
      'game/features/title/app/title_settings_actions.js': /export\s+\{\s*createTitleSettingsActions\s*\}\s+from\s+'\.\.\/platform\/browser\/create_title_settings_actions\.js';/,
      'game/features/title/app/title_system_actions.js': /export\s+\{\s*createTitleSystemActions\s*\}\s+from\s+'\.\.\/platform\/browser\/create_title_system_actions\.js';/,
      'game/features/title/modules/title_module_catalog.js': /export\s+\{[\s\S]*buildTitleCanvasModuleCatalog[\s\S]*buildTitleFlowModuleCatalog[\s\S]*\}\s+from\s+'\.\.\/ports\/public_module_capabilities\.js';/,
      'game/features/title/ui/title_bindings.js': /export\s+\{\s*registerTitleBindings\s*\}\s+from\s+'\.\.\/ports\/public_binding_capabilities\.js';/,
      'game/features/title/ui/title_screen_dom.js': /export\s+\*\s+from\s+'\.\.\/ports\/public_presentation_capabilities\.js';/,
      'game/features/ui/app/build_runtime_subscriber_actions.js': /export\s+\{\s*buildUiRuntimeSubscriberActions\s*\}\s+from\s+'\.\.\/application\/build_runtime_subscriber_actions\.js';/,
      'game/features/ui/app/ui_actions.js': /export\s+\{\s*createUiActions\s*\}\s+from\s+'\.\.\/ports\/runtime\/public_ui_runtime_surface\.js';/,
      'game/features/ui/app/legacy_query_groups.js': /export\s+\{\s*buildLegacyGameApiRuntimeHudQueryGroups,\s*buildLegacyWindowUiQueryGroups,\s*createLegacyHudRuntimeQueryBindings,?\s*\}\s+from\s+'\.\.\/ports\/runtime\/public_ui_runtime_surface\.js';/,
      'game/features/combat/presentation/browser/hud/public_combat_hud_modules.js': /export\s+\{\s*CombatHudUI,\s*HudUpdateUI,?\s*\}\s+from\s+'\.\.\/public_combat_hud_modules\.js';/,
      'game/features/combat/presentation/browser/feedback/public_feedback_modules.js': /export\s+\{\s*DomValueUI,\s*FeedbackUI,?\s*\}\s+from\s+'\.\.\/public_feedback_modules\.js';/,
    };

    for (const [file, expectedPattern] of Object.entries(expectations)) {
      const source = fs.readFileSync(path.join(ROOT, file), 'utf8');
      expect(source).toMatch(expectedPattern);
    }
  });
});
