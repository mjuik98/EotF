import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const REMOVED_RUNTIME_COMPAT_FILES = [
  'game/ui/screens/ending_screen_action_helpers.js',
  'game/ui/screens/ending_screen_ui_runtime.js',
  'game/ui/screens/help_pause_hotkeys_runtime_ui.js',
  'game/ui/screens/help_pause_menu_runtime_ui.js',
  'game/ui/screens/help_pause_ui_abandon_runtime.js',
  'game/ui/screens/help_pause_ui_dialog_overlays.js',
  'game/ui/screens/help_pause_ui_dialog_runtime.js',
  'game/ui/screens/help_pause_ui_helpers.js',
  'game/ui/screens/help_pause_ui_overlay_dom.js',
  'game/ui/screens/help_pause_ui_overlay_runtime.js',
  'game/ui/screens/help_pause_ui_overlays.js',
  'game/ui/screens/help_pause_ui_pause_menu_overlay.js',
  'game/ui/screens/help_pause_ui_pause_runtime.js',
  'game/ui/screens/help_pause_ui_return_runtime.js',
  'game/ui/screens/help_pause_ui_runtime.js',
  'game/ui/screens/meta_progression_ui_runtime.js',
  'game/ui/screens/screen_ui_helpers.js',
  'game/ui/screens/settings_ui_apply_helpers.js',
  'game/ui/screens/settings_ui_bindings.js',
  'game/ui/screens/settings_ui_helpers.js',
  'game/ui/screens/settings_ui_keybinding_helpers.js',
  'game/ui/screens/settings_ui_runtime.js',
  'game/ui/screens/settings_ui_runtime_helpers.js',
  'game/ui/screens/story_ui_helpers.js',
  'game/ui/screens/story_ui_hidden_ending_render.js',
  'game/ui/screens/story_ui_render.js',
  'game/ui/run/run_mode_ui.js',
  'game/ui/run/run_mode_ui_bindings.js',
  'game/ui/run/run_mode_ui_helpers.js',
  'game/ui/run/run_mode_ui_presets_render.js',
  'game/ui/run/run_mode_ui_render.js',
  'game/ui/run/run_mode_ui_runtime.js',
  'game/ui/run/run_mode_ui_summary_render.js',
  'game/ui/run/run_return_ui.js',
  'game/ui/run/run_return_ui_branch_ui.js',
  'game/ui/run/run_return_ui_runtime.js',
];

describe('ui screen runtime compat reexports', () => {
  it('removes extracted screen and run runtime wrappers once callers import feature-owned surfaces directly', () => {
    for (const file of REMOVED_RUNTIME_COMPAT_FILES) {
      expect(fs.existsSync(path.join(process.cwd(), file))).toBe(false);
    }
  });

  it('removes ending helper shims once tests import the feature-owned ui surface directly', () => {
    const removedFiles = [
      'game/ui/screens/ending_fragment_choice_actions.js',
      'game/ui/screens/ending_fragment_choice_presenter.js',
      'game/ui/screens/ending_screen_fx.js',
      'game/ui/screens/ending_screen_helpers.js',
      'game/ui/screens/ending_screen_render_helpers.js',
      'game/ui/screens/ending_screen_runtime_helpers.js',
      'game/ui/screens/ending_screen_scene_runtime.js',
      'game/ui/screens/screen_ui_runtime.js',
      'game/ui/screens/story_ui_runtime.js',
    ];

    removedFiles.forEach((file) => {
      expect(fs.existsSync(path.join(process.cwd(), file))).toBe(false);
    });
  });

  it('removes title runtime/helper shims once tests import title feature surfaces directly', () => {
    const removedFiles = [
      'game/ui/title/game_boot_ui_fx.js',
      'game/ui/title/game_boot_ui_helpers.js',
      'game/ui/title/game_boot_ui_runtime.js',
      'game/ui/title/game_canvas_setup_ui_runtime.js',
      'game/ui/title/intro_cinematic_helpers.js',
      'game/ui/title/intro_cinematic_runtime.js',
      'game/ui/title/level_up_popup_helpers.js',
      'game/ui/title/level_up_popup_runtime.js',
      'game/ui/title/run_end_screen_helpers.js',
      'game/ui/title/game_boot_ui_audio_fx.js',
      'game/ui/title/game_boot_ui_count_fx.js',
      'game/ui/title/game_boot_ui_lore_fx.js',
      'game/ui/title/game_boot_ui_nav_fx.js',
      'game/ui/title/game_boot_ui_warp_fx.js',
      'game/ui/title/character_select_card_ui.js',
      'game/ui/title/character_select_info_panel.js',
      'game/ui/title/character_select_panels.js',
      'game/ui/title/character_select_particles.js',
      'game/ui/title/character_select_phase_panel.js',
      'game/ui/title/character_select_radar.js',
      'game/ui/title/character_select_render.js',
      'game/ui/title/run_end_screen_runtime.js',
      'game/ui/title/title_canvas_runtime.js',
    ];

    removedFiles.forEach((file) => {
      expect(fs.existsSync(path.join(process.cwd(), file))).toBe(false);
    });
  });

  it('removes codex runtime/helper shims once tests import codex feature surfaces directly', () => {
    const removedFiles = [
      'game/ui/screens/codex_ui_controller.js',
      'game/ui/screens/codex_ui_controller_helpers.js',
      'game/ui/screens/codex_ui_content_runtime.js',
      'game/ui/screens/codex_ui_content_sections.js',
      'game/ui/screens/codex_ui_entry_renderers.js',
      'game/ui/screens/codex_ui_filter_render.js',
      'game/ui/screens/codex_ui_helpers.js',
      'game/ui/screens/codex_ui_inscriptions.js',
      'game/ui/screens/codex_ui_popup.js',
      'game/ui/screens/codex_ui_popup_payloads.js',
      'game/ui/screens/codex_ui_popup_runtime.js',
      'game/ui/screens/codex_ui_popup_runtime_helpers.js',
      'game/ui/screens/codex_ui_progress_render.js',
      'game/ui/screens/codex_ui_render.js',
      'game/ui/screens/codex_ui_runtime.js',
      'game/ui/screens/codex_ui_runtime_dispatch.js',
      'game/ui/screens/codex_ui_runtime_helpers.js',
      'game/ui/screens/codex_ui_section_render.js',
      'game/ui/screens/codex_ui_structure.js',
    ];

    removedFiles.forEach((file) => {
      expect(fs.existsSync(path.join(process.cwd(), file))).toBe(false);
    });
  });
});
