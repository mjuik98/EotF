import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const EXACT_REEXPORTS = new Map([
  [
    'game/ui/map/map_generation_ui.js',
    "export { MapGenerationUI } from '../../features/run/ports/public_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/map/map_navigation_ui.js',
    "export { MapNavigationUI } from '../../features/run/ports/public_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/map/map_ui.js',
    "export { MapUI } from '../../features/run/ports/public_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/map/map_ui_full_map.js',
    "export * from '../../features/run/ports/public_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/map/map_ui_full_map_render.js',
    "export * from '../../features/run/ports/public_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/map/map_ui_minimap.js',
    "export * from '../../features/run/ports/public_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/map/map_ui_minimap_render.js',
    "export * from '../../features/run/ports/public_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/map/map_ui_next_nodes.js',
    "export * from '../../features/run/ports/public_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/map/map_ui_next_nodes_render.js',
    "export * from '../../features/run/ports/public_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/map/maze_system_ui.js',
    "export { MazeSystem } from '../../features/run/ports/public_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/map/region_transition_ui.js',
    "export { RegionTransitionUI } from '../../features/run/ports/public_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/map/world_canvas_ui.js',
    "export { WorldCanvasUI } from '../../features/run/ports/public_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/map/world_render_loop_ui.js',
    "export { WorldRenderLoopUI } from '../../features/run/ports/public_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/hud/dom_value_ui.js',
    "export { DomValueUI } from '../../features/combat/ports/public_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/hud/feedback_ui.js',
    "export { FeedbackUI } from '../../features/combat/ports/public_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/hud/hud_update_ui.js',
    "export { HudUpdateUI } from '../../features/combat/ports/public_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/effects/echo_ripple_transition.js',
    "export { startEchoRippleDissolve } from '../../platform/browser/effects/echo_ripple_transition.js';\n",
  ],
  [
    'game/ui/title/class_select_ui.js',
    "export { ClassSelectUI } from '../../features/title/ports/public_character_select_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/title/character_select_ui.js',
    "export { CharacterSelectUI } from '../../features/title/ports/public_character_select_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/title/game_boot_ui.js',
    "export { GameBootUI } from '../../features/title/ports/public_game_boot_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/title/title_canvas_ui.js',
    "export { TitleCanvasUI } from '../../features/title/ports/public_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/title/game_canvas_setup_ui.js',
    "export { GameCanvasSetupUI } from '../../features/title/ports/public_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/title/intro_cinematic_ui.js',
    "export { IntroCinematicUI } from '../../features/title/ports/public_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/title/level_up_popup_ui.js',
    "export { LevelUpPopupUI } from '../../features/title/ports/public_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/title/run_end_screen_ui.js',
    "export { RunEndScreenUI } from '../../features/title/ports/public_run_end_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/title/class_select_buttons_ui.js',
    "export { renderClassSelectButtons } from '../../features/title/ports/public_character_select_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/title/class_select_selection_ui.js',
    "export * from '../../features/title/ports/public_character_select_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/title/class_select_tooltip_ui.js',
    "export * from '../../features/title/ports/public_character_select_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/title/character_select_audio.js',
    "export { createCharacterSelectSfx } from '../../features/title/ports/public_character_select_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/title/character_select_fx.js',
    "export { setupCharacterCardFx } from '../../features/title/ports/public_character_select_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/title/character_select_bindings.js',
    "export * from '../../features/title/ports/public_character_select_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/title/character_select_flow.js',
    "export * from '../../features/title/ports/public_character_select_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/title/character_select_modal.js',
    "export * from '../../features/title/ports/public_character_select_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/title/character_select_summary_replay.js',
    "export { createCharacterSummaryReplay } from '../../features/title/ports/public_character_select_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/run/run_mode_ui.js',
    "export { RunModeUI } from '../../features/run/ports/public_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/run/run_start_ui.js',
    "export { RunStartUI } from '../../features/run/ports/public_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/run/run_setup_ui.js',
    "export { RunSetupUI } from '../../features/run/ports/public_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/run/run_return_ui.js',
    "export { RunReturnUI } from '../../features/run/ports/public_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/combat/combat_start_ui.js',
    "export { CombatStartUI } from '../../features/combat/ports/public_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/combat/combat_ui.js',
    "export {\n  CombatUI,\n  ENEMY_STATUS_DESC,\n  ENEMY_STATUS_KR,\n  resolveEnemyStatusTooltipMetrics,\n} from '../../features/combat/ports/public_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/combat/combat_hud_ui.js',
    "export { CombatHudUI } from '../../features/combat/ports/public_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/combat/echo_skill_ui.js',
    "export { EchoSkillUI } from '../../features/combat/ports/public_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/combat/status_effects_ui.js',
    "export {\n  resolvePlayerStatusTooltipMetrics,\n  StatusEffectsUI,\n} from '../../features/combat/ports/public_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/combat/combat_info_ui.js',
    "export { CombatInfoUI } from '../../features/combat/ports/public_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/combat/combat_actions_ui.js',
    "export { CombatActionsUI } from '../../features/combat/ports/public_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/cards/card_ui.js',
    "export { CardUI } from '../../features/combat/ports/public_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/cards/card_target_ui.js',
    "export { CardTargetUI } from '../../features/combat/ports/public_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/cards/tooltip_ui.js',
    "export { TooltipUI } from '../../features/combat/ports/public_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/cards/deck_modal_ui.js',
    "export { DeckModalUI } from '../../features/combat/ports/public_presentation_capabilities.js';\n",
  ],
  [
    'game/presentation/combat/combat_turn_ui.js',
    "export { CombatTurnUI } from '../../features/combat/ports/public_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/screens/screen_ui.js',
    "export { ScreenUI } from '../../features/ui/ports/public_screen_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/screens/ending_screen_ui.js',
    "export { EndingScreenUI } from '../../features/ui/ports/public_ending_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/screens/story_ui.js',
    "export { StoryUI } from '../../features/ui/ports/public_story_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/screens/meta_progression_ui.js',
    "export { MetaProgressionUI } from '../../features/ui/ports/public_meta_progression_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/screens/help_pause_ui.js',
    "export { HelpPauseUI } from '../../features/ui/ports/public_help_pause_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/screens/settings_ui.js',
    "export { SettingsUI } from '../../features/ui/ports/public_settings_presentation_capabilities.js';\n",
  ],
  [
    'game/ui/screens/codex_ui.js',
    "export { CodexUI } from '../../features/codex/ports/public_presentation_capabilities.js';\n",
  ],
]);

describe('ui feature entry compat reexports', () => {
  it('keeps moved ui entrypoints as thin feature-local reexports', () => {
    for (const [file, expected] of EXACT_REEXPORTS) {
      const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
      expect(source).toBe(expected);
    }
  });
});
