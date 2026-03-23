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
    '../../features/run/public.js',
  ),
  named(
    'game/ui/map/map_navigation_ui.js',
    '{ MapNavigationUI }',
    '../../features/run/public.js',
  ),
  named(
    'game/ui/map/map_ui.js',
    '{ MapUI }',
    '../../features/run/public.js',
  ),
  star('game/ui/map/map_ui_full_map.js', '../../features/run/public.js'),
  star('game/ui/map/map_ui_full_map_render.js', '../../features/run/public.js'),
  star('game/ui/map/map_ui_minimap.js', '../../features/run/public.js'),
  star('game/ui/map/map_ui_minimap_render.js', '../../features/run/public.js'),
  star('game/ui/map/map_ui_next_nodes.js', '../../features/run/public.js'),
  star('game/ui/map/map_ui_next_nodes_render.js', '../../features/run/public.js'),
  named(
    'game/ui/map/maze_system_ui.js',
    '{ MazeSystem }',
    '../../features/run/public.js',
  ),
  named(
    'game/ui/map/region_transition_ui.js',
    '{ RegionTransitionUI }',
    '../../features/run/public.js',
  ),
  named(
    'game/ui/map/world_canvas_ui.js',
    '{ WorldCanvasUI }',
    '../../features/run/public.js',
  ),
  named(
    'game/ui/map/world_render_loop_ui.js',
    '{ WorldRenderLoopUI }',
    '../../features/run/public.js',
  ),
  named(
    'game/ui/hud/dom_value_ui.js',
    '{ DomValueUI }',
    '../../features/combat/public.js',
  ),
  named(
    'game/ui/hud/feedback_ui.js',
    '{ FeedbackUI }',
    '../../features/combat/public.js',
  ),
  named(
    'game/ui/hud/hud_update_ui.js',
    '{ HudUpdateUI }',
    '../../features/combat/public.js',
  ),
  named(
    'game/ui/effects/echo_ripple_transition.js',
    '{ startEchoRippleDissolve }',
    '../../platform/browser/effects/echo_ripple_transition.js',
  ),
  named(
    'game/ui/title/class_select_ui.js',
    '{ ClassSelectUI }',
    '../../features/title/ports/public_character_select_presentation_capabilities.js',
  ),
  named(
    'game/ui/title/character_select_ui.js',
    '{ CharacterSelectUI }',
    '../../features/title/ports/public_character_select_presentation_capabilities.js',
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
    '../../features/title/ports/public_character_select_presentation_capabilities.js',
  ),
  star('game/ui/title/class_select_selection_ui.js', '../../features/title/ports/public_character_select_presentation_capabilities.js'),
  star('game/ui/title/class_select_tooltip_ui.js', '../../features/title/ports/public_character_select_presentation_capabilities.js'),
  named(
    'game/ui/title/character_select_audio.js',
    '{ createCharacterSelectSfx }',
    '../../features/title/ports/public_character_select_presentation_capabilities.js',
  ),
  named(
    'game/ui/title/character_select_fx.js',
    '{ setupCharacterCardFx }',
    '../../features/title/ports/public_character_select_presentation_capabilities.js',
  ),
  star('game/ui/title/character_select_bindings.js', '../../features/title/ports/public_character_select_presentation_capabilities.js'),
  star('game/ui/title/character_select_flow.js', '../../features/title/ports/public_character_select_presentation_capabilities.js'),
  star('game/ui/title/character_select_modal.js', '../../features/title/ports/public_character_select_presentation_capabilities.js'),
  named(
    'game/ui/title/character_select_summary_replay.js',
    '{ createCharacterSummaryReplay }',
    '../../features/title/ports/public_character_select_presentation_capabilities.js',
  ),
  named(
    'game/ui/run/run_mode_ui.js',
    '{ RunModeUI }',
    '../../features/run/public.js',
  ),
  named(
    'game/ui/run/run_start_ui.js',
    '{ RunStartUI }',
    '../../features/run/public.js',
  ),
  named(
    'game/ui/run/run_setup_ui.js',
    '{ RunSetupUI }',
    '../../features/run/public.js',
  ),
  named(
    'game/ui/run/run_return_ui.js',
    '{ RunReturnUI }',
    '../../features/run/public.js',
  ),
  named(
    'game/ui/combat/combat_start_ui.js',
    '{ CombatStartUI }',
    '../../features/combat/public.js',
  ),
  named(
    'game/ui/combat/combat_hud_ui.js',
    '{ CombatHudUI }',
    '../../features/combat/public.js',
  ),
  named(
    'game/ui/combat/echo_skill_ui.js',
    '{ EchoSkillUI }',
    '../../features/combat/public.js',
  ),
  named(
    'game/ui/combat/combat_info_ui.js',
    '{ CombatInfoUI }',
    '../../features/combat/public.js',
  ),
  named(
    'game/ui/combat/combat_actions_ui.js',
    '{ CombatActionsUI }',
    '../../features/combat/public.js',
  ),
  named('game/ui/cards/card_ui.js', '{ CardUI }', '../../features/combat/public.js'),
  named(
    'game/ui/cards/card_target_ui.js',
    '{ CardTargetUI }',
    '../../features/combat/public.js',
  ),
  named('game/ui/cards/tooltip_ui.js', '{ TooltipUI }', '../../features/combat/public.js'),
  named(
    'game/ui/cards/deck_modal_ui.js',
    '{ DeckModalUI }',
    '../../features/combat/public.js',
  ),
  named(
    'game/presentation/combat/combat_turn_ui.js',
    '{ CombatTurnUI }',
    '../../features/combat/public.js',
  ),
]);

describe('ui feature entry compat reexports', () => {
  it('keeps moved ui entrypoints as thin feature-local reexports', () => {
    for (const [file, expected] of EXACT_REEXPORTS) {
      const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
      expect(source).toBe(expected);
    }
  });

  it('removes combat metadata compat entrypoints once callers use feature-owned browser modules directly', () => {
    const removedFiles = [
      'game/ui/combat/combat_ui.js',
      'game/ui/combat/status_effects_ui.js',
    ];

    removedFiles.forEach((file) => {
      expect(fs.existsSync(path.join(process.cwd(), file))).toBe(false);
    });
  });

  it('removes screen-level ui entry wrappers once callers use feature-owned surfaces directly', () => {
    const removedFiles = [
      'game/ui/screens/screen_ui.js',
      'game/ui/screens/ending_screen_ui.js',
      'game/ui/screens/story_ui.js',
      'game/ui/screens/meta_progression_ui.js',
      'game/ui/screens/help_pause_ui.js',
      'game/ui/screens/settings_ui.js',
      'game/ui/screens/codex_ui.js',
    ];

    removedFiles.forEach((file) => {
      expect(fs.existsSync(path.join(process.cwd(), file))).toBe(false);
    });
  });

  it('keeps HelpPauseUI out of the static UI feature public barrel so lazy loading can split it', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/features/ui/ports/public_help_pause_presentation_capabilities.js'),
      'utf8',
    );

    expect(source).not.toContain('HelpPauseUI');
  });
});
