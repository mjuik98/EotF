import { describe, expect, it } from 'vitest';
import { pathExists, readText } from './helpers/guardrail_fs.js';

describe('ui feature entry compat reexports', () => {
  it('keeps the remaining non-ui compat entrypoint as a thin feature-local reexport', () => {
    const source = readText('game/presentation/combat/combat_turn_ui.js');

    expect(source).toBe("export { CombatTurnUI } from '../../features/combat/public.js';\n");
  });

  it('removes combat compat entrypoints once callers use feature-owned browser modules directly', () => {
    const removedFiles = [
      'game/ui/combat/combat_actions_ui.js',
      'game/ui/combat/combat_hud_ui.js',
      'game/ui/combat/combat_info_ui.js',
      'game/ui/combat/combat_start_ui.js',
      'game/ui/combat/combat_ui.js',
      'game/ui/combat/echo_skill_ui.js',
      'game/ui/combat/status_effects_ui.js',
    ];

    removedFiles.forEach((file) => {
      expect(pathExists(file)).toBe(false);
    });
  });

  it('removes screen-level ui entry wrappers once callers use feature-owned surfaces directly', () => {
    const removedFiles = [
      'game/ui/cards/card_render_helpers_ui.js',
      'game/ui/cards/card_target_ui.js',
      'game/ui/cards/card_ui.js',
      'game/ui/cards/combat_card_render_ui.js',
      'game/ui/cards/deck_modal_render_ui.js',
      'game/ui/cards/deck_modal_runtime_ui.js',
      'game/ui/cards/deck_modal_ui.js',
      'game/ui/cards/tooltip_card_render_ui.js',
      'game/ui/cards/tooltip_general_ui.js',
      'game/ui/cards/tooltip_item_render_ui.js',
      'game/ui/cards/tooltip_item_ui.js',
      'game/ui/cards/tooltip_ui.js',
      'game/ui/common/custom_cursor.js',
      'game/ui/effects/echo_ripple_transition.js',
      'game/ui/feedback/button_feedback.js',
      'game/ui/hud/dom_value_ui.js',
      'game/ui/hud/feedback_ui.js',
      'game/ui/hud/feedback_ui_effects.js',
      'game/ui/hud/feedback_ui_notices.js',
      'game/ui/hud/feedback_ui_toasts.js',
      'game/ui/hud/hud_effects_ui.js',
      'game/ui/hud/hud_panel_runtime_helpers.js',
      'game/ui/hud/hud_panel_sections.js',
      'game/ui/hud/hud_render_helpers.js',
      'game/ui/hud/hud_stats_ui.js',
      'game/ui/hud/hud_update_runtime_helpers.js',
      'game/ui/hud/hud_update_ui.js',
      'game/ui/map/map_navigation_presenter.js',
      'game/ui/map/maze_system_render_ui.js',
      'game/ui/map/maze_system_runtime_ui.js',
      'game/ui/shared/class_trait_panel_ui.js',
      'game/ui/run/run_mode_ui.js',
      'game/ui/run/run_return_ui.js',
      'game/ui/map/map_ui_next_nodes.js',
      'game/ui/map/map_ui_next_nodes_render.js',
      'game/ui/map/map_generation_ui.js',
      'game/ui/map/map_navigation_ui.js',
      'game/ui/map/map_ui.js',
      'game/ui/map/map_ui_full_map.js',
      'game/ui/map/map_ui_full_map_render.js',
      'game/ui/map/map_ui_minimap.js',
      'game/ui/map/map_ui_minimap_render.js',
      'game/ui/map/maze_system_ui.js',
      'game/ui/map/region_transition_ui.js',
      'game/ui/map/world_canvas_ui.js',
      'game/ui/map/world_render_loop_ui.js',
      'game/ui/screens/screen_ui.js',
      'game/ui/screens/ending_screen_ui.js',
      'game/ui/screens/story_ui.js',
      'game/ui/screens/meta_progression_ui.js',
      'game/ui/screens/help_pause_ui.js',
      'game/ui/screens/settings_ui.js',
      'game/ui/screens/codex_ui.js',
      'game/ui/run/run_start_ui.js',
      'game/ui/run/run_setup_ui.js',
      'game/ui/run/run_setup_helpers.js',
      'game/ui/run/run_start_ui_runtime.js',
      'game/ui/title/class_select_buttons_ui.js',
      'game/ui/title/class_select_selection_ui.js',
      'game/ui/title/class_select_tooltip_ui.js',
      'game/ui/title/character_select_audio.js',
      'game/ui/title/character_select_bindings.js',
      'game/ui/title/character_select_card_ui.js',
      'game/ui/title/character_select_catalog.js',
      'game/ui/title/character_select_flow.js',
      'game/ui/title/character_select_fx.js',
      'game/ui/title/character_select_info_panel.js',
      'game/ui/title/character_select_modal.js',
      'game/ui/title/character_select_panels.js',
      'game/ui/title/character_select_particles.js',
      'game/ui/title/character_select_phase_panel.js',
      'game/ui/title/character_select_radar.js',
      'game/ui/title/character_select_render.js',
      'game/ui/title/character_select_summary_replay.js',
      'game/ui/title/game_boot_ui_audio_fx.js',
      'game/ui/title/game_boot_ui_count_fx.js',
      'game/ui/title/game_boot_ui_lore_fx.js',
      'game/ui/title/game_boot_ui.js',
      'game/ui/title/game_boot_ui_nav_fx.js',
      'game/ui/title/game_boot_ui_warp_fx.js',
      'game/ui/title/game_canvas_setup_ui.js',
      'game/ui/title/character_select_ui.js',
      'game/ui/title/class_select_ui.js',
      'game/ui/title/intro_cinematic_ui.js',
      'game/ui/title/level_up_popup_ui.js',
      'game/ui/title/run_end_screen_helpers.js',
      'game/ui/title/run_end_screen_ui.js',
      'game/ui/title/title_canvas_ui.js',
    ];

    removedFiles.forEach((file) => {
      expect(pathExists(file)).toBe(false);
    });
  });

  it('keeps HelpPauseUI out of the static UI feature public barrel so lazy loading can split it', () => {
    const source = readText('game/features/ui/ports/public_help_pause_presentation_capabilities.js');

    expect(source).not.toContain('HelpPauseUI');
  });
});
