import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

function named(file, exportClause, target) {
  return [file, `export ${exportClause} from '${target}';\n`];
}

function star(file, target) {
  return [file, `export * from '${target}';\n`];
}

const EXACT_REEXPORTS = new Map([
  named(
    'game/ui/map/map_generation_ui.js',
    '{ MapGenerationUI }',
    '../../features/run/ports/public_presentation_capabilities.js',
  ),
  named(
    'game/ui/map/map_navigation_ui.js',
    '{ MapNavigationUI }',
    '../../features/run/ports/public_presentation_capabilities.js',
  ),
  named(
    'game/ui/map/map_ui.js',
    '{ MapUI }',
    '../../features/run/ports/public_presentation_capabilities.js',
  ),
  star('game/ui/map/map_ui_full_map.js', '../../features/run/ports/public_presentation_capabilities.js'),
  star('game/ui/map/map_ui_full_map_render.js', '../../features/run/ports/public_presentation_capabilities.js'),
  star('game/ui/map/map_ui_minimap.js', '../../features/run/ports/public_presentation_capabilities.js'),
  star('game/ui/map/map_ui_minimap_render.js', '../../features/run/ports/public_presentation_capabilities.js'),
  star('game/ui/map/map_ui_next_nodes.js', '../../features/run/ports/public_presentation_capabilities.js'),
  star('game/ui/map/map_ui_next_nodes_render.js', '../../features/run/ports/public_presentation_capabilities.js'),
  named(
    'game/ui/map/maze_system_ui.js',
    '{ MazeSystem }',
    '../../features/run/ports/public_presentation_capabilities.js',
  ),
  named(
    'game/ui/map/region_transition_ui.js',
    '{ RegionTransitionUI }',
    '../../features/run/ports/public_presentation_capabilities.js',
  ),
  named(
    'game/ui/map/world_canvas_ui.js',
    '{ WorldCanvasUI }',
    '../../features/run/ports/public_presentation_capabilities.js',
  ),
  named(
    'game/ui/map/world_render_loop_ui.js',
    '{ WorldRenderLoopUI }',
    '../../features/run/ports/public_presentation_capabilities.js',
  ),
  named(
    'game/ui/hud/dom_value_ui.js',
    '{ DomValueUI }',
    '../../features/combat/ports/public_presentation_capabilities.js',
  ),
  named(
    'game/ui/hud/feedback_ui.js',
    '{ FeedbackUI }',
    '../../features/combat/ports/public_presentation_capabilities.js',
  ),
  named(
    'game/ui/hud/hud_update_ui.js',
    '{ HudUpdateUI }',
    '../../features/combat/ports/public_presentation_capabilities.js',
  ),
  named(
    'game/ui/effects/echo_ripple_transition.js',
    '{ startEchoRippleDissolve }',
    '../../platform/browser/effects/echo_ripple_transition.js',
  ),
  named(
    'game/ui/title/class_select_ui.js',
    '{ ClassSelectUI }',
    '../../features/title/presentation/browser/class_select_ui.js',
  ),
  named(
    'game/ui/title/character_select_ui.js',
    '{ CharacterSelectUI }',
    '../../features/title/presentation/browser/character_select_ui.js',
  ),
  named(
    'game/ui/title/game_boot_ui.js',
    '{ GameBootUI }',
    '../../features/title/ports/public_game_boot_presentation_capabilities.js',
  ),
  named(
    'game/ui/title/title_canvas_ui.js',
    '{ TitleCanvasUI }',
    '../../features/title/ports/public_presentation_capabilities.js',
  ),
  named(
    'game/ui/title/game_canvas_setup_ui.js',
    '{ GameCanvasSetupUI }',
    '../../features/title/ports/public_presentation_capabilities.js',
  ),
  named(
    'game/ui/title/intro_cinematic_ui.js',
    '{ IntroCinematicUI }',
    '../../features/title/ports/public_presentation_capabilities.js',
  ),
  named(
    'game/ui/title/level_up_popup_ui.js',
    '{ LevelUpPopupUI }',
    '../../features/title/ports/public_presentation_capabilities.js',
  ),
  named(
    'game/ui/title/run_end_screen_ui.js',
    '{ RunEndScreenUI }',
    '../../features/title/ports/public_run_end_presentation_capabilities.js',
  ),
  named(
    'game/ui/title/class_select_buttons_ui.js',
    '{ renderClassSelectButtons }',
    '../../features/title/platform/browser/class_select_buttons_ui.js',
  ),
  star('game/ui/title/class_select_selection_ui.js', '../../features/title/platform/browser/class_select_selection_ui.js'),
  star('game/ui/title/class_select_tooltip_ui.js', '../../features/title/platform/browser/class_select_tooltip_ui.js'),
  named(
    'game/ui/title/character_select_audio.js',
    '{ createCharacterSelectSfx }',
    '../../features/title/platform/browser/character_select_audio.js',
  ),
  named(
    'game/ui/title/character_select_fx.js',
    '{ setupCharacterCardFx }',
    '../../features/title/platform/browser/character_select_fx.js',
  ),
  star('game/ui/title/character_select_bindings.js', '../../features/title/platform/browser/character_select_bindings.js'),
  star('game/ui/title/character_select_flow.js', '../../features/title/platform/browser/character_select_flow.js'),
  star('game/ui/title/character_select_modal.js', '../../features/title/platform/browser/character_select_modal.js'),
  named(
    'game/ui/title/character_select_summary_replay.js',
    '{ createCharacterSummaryReplay }',
    '../../features/title/platform/browser/character_select_summary_replay.js',
  ),
  named(
    'game/ui/run/run_mode_ui.js',
    '{ RunModeUI }',
    '../../features/run/presentation/browser/run_mode_ui.js',
  ),
  named(
    'game/ui/run/run_start_ui.js',
    '{ RunStartUI }',
    '../../features/run/presentation/browser/run_start_ui.js',
  ),
  named(
    'game/ui/run/run_setup_ui.js',
    '{ RunSetupUI }',
    '../../features/run/presentation/browser/run_setup_ui.js',
  ),
  named(
    'game/ui/run/run_return_ui.js',
    '{ RunReturnUI }',
    '../../features/run/presentation/browser/run_return_ui.js',
  ),
  named(
    'game/ui/combat/combat_start_ui.js',
    '{ CombatStartUI }',
    '../../features/combat/ports/public_presentation_capabilities.js',
  ),
  [
    'game/ui/combat/combat_ui.js',
    "export {\n  CombatUI,\n  ENEMY_STATUS_DESC,\n  ENEMY_STATUS_KR,\n  resolveEnemyStatusTooltipMetrics,\n} from '../../features/combat/ports/public_presentation_capabilities.js';\n",
  ],
  named(
    'game/ui/combat/combat_hud_ui.js',
    '{ CombatHudUI }',
    '../../features/combat/ports/public_presentation_capabilities.js',
  ),
  named(
    'game/ui/combat/echo_skill_ui.js',
    '{ EchoSkillUI }',
    '../../features/combat/ports/public_presentation_capabilities.js',
  ),
  [
    'game/ui/combat/status_effects_ui.js',
    "export {\n  resolvePlayerStatusTooltipMetrics,\n  StatusEffectsUI,\n} from '../../features/combat/ports/public_presentation_capabilities.js';\n",
  ],
  named(
    'game/ui/combat/combat_info_ui.js',
    '{ CombatInfoUI }',
    '../../features/combat/ports/public_presentation_capabilities.js',
  ),
  named(
    'game/ui/combat/combat_actions_ui.js',
    '{ CombatActionsUI }',
    '../../features/combat/ports/public_presentation_capabilities.js',
  ),
  named('game/ui/cards/card_ui.js', '{ CardUI }', '../../features/combat/ports/public_presentation_capabilities.js'),
  named(
    'game/ui/cards/card_target_ui.js',
    '{ CardTargetUI }',
    '../../features/combat/ports/public_presentation_capabilities.js',
  ),
  named('game/ui/cards/tooltip_ui.js', '{ TooltipUI }', '../../features/combat/ports/public_presentation_capabilities.js'),
  named(
    'game/ui/cards/deck_modal_ui.js',
    '{ DeckModalUI }',
    '../../features/combat/ports/public_presentation_capabilities.js',
  ),
  named(
    'game/presentation/combat/combat_turn_ui.js',
    '{ CombatTurnUI }',
    '../../features/combat/ports/public_presentation_capabilities.js',
  ),
  named(
    'game/ui/screens/screen_ui.js',
    '{ ScreenUI }',
    '../../features/ui/presentation/browser/screen_ui.js',
  ),
  named(
    'game/ui/screens/ending_screen_ui.js',
    '{ EndingScreenUI }',
    '../../features/ui/presentation/browser/ending_screen_ui.js',
  ),
  named(
    'game/ui/screens/story_ui.js',
    '{ StoryUI }',
    '../../features/ui/presentation/browser/story_ui.js',
  ),
  named(
    'game/ui/screens/meta_progression_ui.js',
    '{ MetaProgressionUI }',
    '../../features/ui/presentation/browser/meta_progression_ui.js',
  ),
  named(
    'game/ui/screens/help_pause_ui.js',
    '{ HelpPauseUI }',
    '../../features/ui/presentation/browser/help_pause_ui.js',
  ),
  named(
    'game/ui/screens/settings_ui.js',
    '{ SettingsUI }',
    '../../features/ui/presentation/browser/settings_ui.js',
  ),
  named(
    'game/ui/screens/codex_ui.js',
    '{ CodexUI }',
    '../../features/codex/presentation/browser/codex_ui.js',
  ),
]);

describe('ui feature entry compat reexports', () => {
  it('keeps moved ui entrypoints as thin feature-local reexports', () => {
    for (const [file, expected] of EXACT_REEXPORTS) {
      const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
      expect(source).toBe(expected);
    }
  });
});
