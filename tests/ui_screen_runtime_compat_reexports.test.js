import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const EXACT_REEXPORTS = new Map([
  [
    'game/ui/screens/screen_ui_helpers.js',
    "export * from '../../features/ui/presentation/browser/screen_ui_helpers.js';\n",
  ],
  [
    'game/ui/screens/screen_ui_runtime.js',
    "export * from '../../features/ui/presentation/browser/screen_ui_runtime.js';\n",
  ],
  [
    'game/ui/screens/settings_ui_helpers.js',
    "export * from '../../features/ui/presentation/browser/settings_ui_helpers.js';\n",
  ],
  [
    'game/ui/screens/settings_ui_runtime.js',
    "export * from '../../features/ui/presentation/browser/settings_ui_runtime.js';\n",
  ],
  [
    'game/ui/screens/settings_ui_apply_helpers.js',
    "export * from '../../features/ui/presentation/browser/settings_ui_apply_helpers.js';\n",
  ],
  [
    'game/ui/screens/settings_ui_bindings.js',
    "export * from '../../features/ui/presentation/browser/settings_ui_bindings.js';\n",
  ],
  [
    'game/ui/screens/settings_ui_keybinding_helpers.js',
    "export * from '../../features/ui/presentation/browser/settings_ui_keybinding_helpers.js';\n",
  ],
  [
    'game/ui/screens/settings_ui_runtime_helpers.js',
    "export * from '../../features/ui/presentation/browser/settings_ui_runtime_helpers.js';\n",
  ],
  [
    'game/ui/screens/story_ui_helpers.js',
    "export * from '../../features/ui/presentation/browser/story_ui_helpers.js';\n",
  ],
  [
    'game/ui/screens/story_ui_hidden_ending_render.js',
    "export * from '../../features/ui/presentation/browser/story_ui_hidden_ending_render.js';\n",
  ],
  [
    'game/ui/screens/story_ui_render.js',
    "export * from '../../features/ui/presentation/browser/story_ui_render.js';\n",
  ],
  [
    'game/ui/screens/story_ui_runtime.js',
    "export * from '../../features/ui/presentation/browser/story_ui_runtime.js';\n",
  ],
  [
    'game/ui/screens/help_pause_ui_helpers.js',
    "export * from '../../features/ui/presentation/browser/help_pause_ui_helpers.js';\n",
  ],
  [
    'game/ui/screens/help_pause_ui_runtime.js',
    "export * from '../../features/ui/presentation/browser/help_pause_ui_runtime.js';\n",
  ],
  [
    'game/ui/screens/help_pause_ui_abandon_runtime.js',
    "export * from '../../features/ui/presentation/browser/help_pause_ui_abandon_runtime.js';\n",
  ],
  [
    'game/ui/screens/help_pause_ui_dialog_runtime.js',
    "export * from '../../features/ui/presentation/browser/help_pause_ui_dialog_runtime.js';\n",
  ],
  [
    'game/ui/screens/help_pause_ui_overlay_runtime.js',
    "export * from '../../features/ui/presentation/browser/help_pause_ui_overlay_runtime.js';\n",
  ],
  [
    'game/ui/screens/help_pause_ui_pause_runtime.js',
    "export * from '../../features/ui/presentation/browser/help_pause_ui_pause_runtime.js';\n",
  ],
  [
    'game/ui/screens/help_pause_hotkeys_runtime_ui.js',
    "export * from '../../features/ui/presentation/browser/help_pause_hotkeys_runtime_ui.js';\n",
  ],
  [
    'game/ui/screens/help_pause_menu_runtime_ui.js',
    "export * from '../../features/ui/presentation/browser/help_pause_menu_runtime_ui.js';\n",
  ],
  [
    'game/ui/screens/help_pause_ui_overlays.js',
    "export * from '../../features/ui/presentation/browser/help_pause_ui_overlays.js';\n",
  ],
  [
    'game/ui/screens/help_pause_ui_return_runtime.js',
    "export * from '../../features/ui/presentation/browser/help_pause_ui_return_runtime.js';\n",
  ],
  [
    'game/ui/screens/help_pause_ui_dialog_overlays.js',
    "export * from '../../features/ui/presentation/browser/help_pause_ui_dialog_overlays.js';\n",
  ],
  [
    'game/ui/screens/help_pause_ui_pause_menu_overlay.js',
    "export * from '../../features/ui/presentation/browser/help_pause_ui_pause_menu_overlay.js';\n",
  ],
  [
    'game/ui/screens/help_pause_ui_overlay_dom.js',
    "export * from '../../features/ui/presentation/browser/help_pause_ui_overlay_dom.js';\n",
  ],
  [
    'game/ui/screens/ending_screen_helpers.js',
    "export * from '../../features/ui/presentation/browser/ending_screen_helpers.js';\n",
  ],
  [
    'game/ui/screens/ending_screen_runtime_helpers.js',
    "export * from '../../features/ui/presentation/browser/ending_screen_runtime_helpers.js';\n",
  ],
  [
    'game/ui/screens/ending_screen_fx.js',
    "export * from '../../features/ui/presentation/browser/ending_screen_fx.js';\n",
  ],
  [
    'game/ui/screens/ending_screen_scene_runtime.js',
    "export * from '../../features/ui/presentation/browser/ending_screen_scene_runtime.js';\n",
  ],
  [
    'game/ui/screens/ending_screen_render_helpers.js',
    "export * from '../../features/ui/presentation/browser/ending_screen_render_helpers.js';\n",
  ],
  [
    'game/ui/screens/ending_screen_ui_runtime.js',
    "export * from '../../features/ui/presentation/browser/ending_screen_ui_runtime.js';\n",
  ],
  [
    'game/ui/screens/ending_screen_action_helpers.js',
    "export * from '../../features/ui/presentation/browser/ending_screen_action_helpers.js';\n",
  ],
  [
    'game/ui/screens/ending_fragment_choice_presenter.js',
    "export * from '../../features/ui/presentation/browser/ending_fragment_choice_presenter.js';\n",
  ],
  [
    'game/ui/screens/ending_fragment_choice_actions.js',
    "export * from '../../features/ui/presentation/browser/ending_fragment_choice_actions.js';\n",
  ],
  [
    'game/ui/run/run_mode_ui_helpers.js',
    "export * from '../../features/run/presentation/browser/run_mode_ui_helpers.js';\n",
  ],
  [
    'game/ui/run/run_mode_ui_runtime.js',
    "export * from '../../features/run/presentation/browser/run_mode_ui_runtime.js';\n",
  ],
  [
    'game/ui/run/run_mode_ui_render.js',
    "export * from '../../features/run/presentation/browser/run_mode_ui_render.js';\n",
  ],
  [
    'game/ui/run/run_mode_ui_bindings.js',
    "export * from '../../features/run/presentation/browser/run_mode_ui_bindings.js';\n",
  ],
  [
    'game/ui/run/run_mode_ui_presets_render.js',
    "export * from '../../features/run/presentation/browser/run_mode_ui_presets_render.js';\n",
  ],
  [
    'game/ui/run/run_mode_ui_summary_render.js',
    "export * from '../../features/run/presentation/browser/run_mode_ui_summary_render.js';\n",
  ],
  [
    'game/ui/run/run_return_ui_runtime.js',
    "export * from '../../features/run/presentation/browser/run_return_ui_runtime.js';\n",
  ],
  [
    'game/ui/screens/meta_progression_ui_runtime.js',
    "export * from '../../features/ui/presentation/browser/meta_progression_ui_runtime.js';\n",
  ],
  [
    'game/ui/screens/codex_ui_controller.js',
    "export * from '../../features/codex/presentation/browser/codex_ui_controller.js';\n",
  ],
  [
    'game/ui/screens/codex_ui_controller_helpers.js',
    "export * from '../../features/codex/presentation/browser/codex_ui_controller_helpers.js';\n",
  ],
  [
    'game/ui/screens/codex_ui_content_runtime.js',
    "export * from '../../features/codex/presentation/browser/codex_ui_content_runtime.js';\n",
  ],
  [
    'game/ui/screens/codex_ui_content_sections.js',
    "export * from '../../features/codex/presentation/browser/codex_ui_content_sections.js';\n",
  ],
  [
    'game/ui/screens/codex_ui_entry_renderers.js',
    "export * from '../../features/codex/presentation/browser/codex_ui_entry_renderers.js';\n",
  ],
  [
    'game/ui/screens/codex_ui_filter_render.js',
    "export * from '../../features/codex/presentation/browser/codex_ui_filter_render.js';\n",
  ],
  [
    'game/ui/screens/codex_ui_helpers.js',
    "export * from '../../features/codex/presentation/browser/codex_ui_helpers.js';\n",
  ],
  [
    'game/ui/screens/codex_ui_inscriptions.js',
    "export * from '../../features/codex/presentation/browser/codex_ui_inscriptions.js';\n",
  ],
  [
    'game/ui/screens/codex_ui_popup.js',
    "export * from '../../features/codex/presentation/browser/codex_ui_popup.js';\n",
  ],
  [
    'game/ui/screens/codex_ui_popup_payloads.js',
    "export * from '../../features/codex/presentation/browser/codex_ui_popup_payloads.js';\n",
  ],
  [
    'game/ui/screens/codex_ui_popup_runtime.js',
    "export * from '../../features/codex/presentation/browser/codex_ui_popup_runtime.js';\n",
  ],
  [
    'game/ui/screens/codex_ui_popup_runtime_helpers.js',
    "export * from '../../features/codex/presentation/browser/codex_ui_popup_runtime_helpers.js';\n",
  ],
  [
    'game/ui/screens/codex_ui_progress_render.js',
    "export * from '../../features/codex/presentation/browser/codex_ui_progress_render.js';\n",
  ],
  [
    'game/ui/screens/codex_ui_render.js',
    "export * from '../../features/codex/presentation/browser/codex_ui_render.js';\n",
  ],
  [
    'game/ui/screens/codex_ui_runtime.js',
    "export * from '../../features/codex/presentation/browser/codex_ui_runtime.js';\n",
  ],
  [
    'game/ui/screens/codex_ui_runtime_dispatch.js',
    "export * from '../../features/codex/presentation/browser/codex_ui_runtime_dispatch.js';\n",
  ],
  [
    'game/ui/screens/codex_ui_runtime_helpers.js',
    "export * from '../../features/codex/presentation/browser/codex_ui_runtime_helpers.js';\n",
  ],
  [
    'game/ui/screens/codex_ui_section_render.js',
    "export * from '../../features/codex/presentation/browser/codex_ui_section_render.js';\n",
  ],
  [
    'game/ui/screens/codex_ui_structure.js',
    "export * from '../../features/codex/presentation/browser/codex_ui_structure.js';\n",
  ],
  [
    'game/ui/title/title_canvas_runtime.js',
    "export * from '../../features/title/presentation/browser/title_canvas_runtime.js';\n",
  ],
  [
    'game/ui/title/run_end_screen_runtime.js',
    "export * from '../../features/title/presentation/browser/run_end_screen_runtime.js';\n",
  ],
  [
    'game/ui/title/run_end_screen_helpers.js',
    "export * from '../../features/title/presentation/browser/run_end_screen_helpers.js';\n",
  ],
  [
    'game/ui/title/level_up_popup_runtime.js',
    "export * from '../../features/title/presentation/browser/level_up_popup_runtime.js';\n",
  ],
  [
    'game/ui/title/level_up_popup_helpers.js',
    "export * from '../../features/title/presentation/browser/level_up_popup_helpers.js';\n",
  ],
  [
    'game/ui/title/intro_cinematic_runtime.js',
    "export * from '../../features/title/presentation/browser/intro_cinematic_runtime.js';\n",
  ],
  [
    'game/ui/title/intro_cinematic_helpers.js',
    "export * from '../../features/title/presentation/browser/intro_cinematic_helpers.js';\n",
  ],
  [
    'game/ui/title/game_canvas_setup_ui_runtime.js',
    "export * from '../../features/title/presentation/browser/game_canvas_setup_ui_runtime.js';\n",
  ],
  [
    'game/ui/title/game_boot_ui_fx.js',
    "export * from '../../features/title/presentation/browser/game_boot_ui_fx.js';\n",
  ],
  [
    'game/ui/title/game_boot_ui_helpers.js',
    "export * from '../../features/title/presentation/browser/game_boot_ui_helpers.js';\n",
  ],
  [
    'game/ui/title/game_boot_ui_runtime.js',
    "export * from '../../features/title/presentation/browser/game_boot_ui_runtime.js';\n",
  ],
  [
    'game/ui/title/game_boot_ui_audio_fx.js',
    "export * from '../../features/title/presentation/browser/game_boot_ui_audio_fx.js';\n",
  ],
  [
    'game/ui/title/game_boot_ui_count_fx.js',
    "export * from '../../features/title/presentation/browser/game_boot_ui_count_fx.js';\n",
  ],
  [
    'game/ui/title/game_boot_ui_lore_fx.js',
    "export * from '../../features/title/presentation/browser/game_boot_ui_lore_fx.js';\n",
  ],
  [
    'game/ui/title/game_boot_ui_nav_fx.js',
    "export * from '../../features/title/presentation/browser/game_boot_ui_nav_fx.js';\n",
  ],
  [
    'game/ui/title/game_boot_ui_warp_fx.js',
    "export * from '../../features/title/presentation/browser/game_boot_ui_warp_fx.js';\n",
  ],
  [
    'game/ui/title/character_select_particles.js',
    "export * from '../../features/title/platform/browser/character_select_particles.js';\n",
  ],
  [
    'game/ui/title/character_select_panels.js',
    "export * from '../../features/title/platform/browser/character_select_panels.js';\n",
  ],
  [
    'game/ui/title/character_select_info_panel.js',
    "export * from '../../features/title/platform/browser/character_select_info_panel.js';\n",
  ],
  [
    'game/ui/title/character_select_phase_panel.js',
    "export * from '../../features/title/platform/browser/character_select_phase_panel.js';\n",
  ],
  [
    'game/ui/title/character_select_render.js',
    "export * from '../../features/title/platform/browser/character_select_render.js';\n",
  ],
  [
    'game/ui/title/character_select_radar.js',
    "export * from '../../features/title/platform/browser/character_select_radar.js';\n",
  ],
  [
    'game/ui/title/character_select_card_ui.js',
    "export * from '../../features/title/platform/browser/character_select_card_ui.js';\n",
  ],
]);

describe('ui screen runtime compat reexports', () => {
  it('keeps extracted screen/ui/run/codex/title helpers as compat-only reexports', () => {
    for (const [file, expected] of EXACT_REEXPORTS) {
      const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
      expect(source).toBe(expected);
    }
  });
});
