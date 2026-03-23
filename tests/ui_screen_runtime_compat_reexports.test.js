import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

function star(file, target) {
  return [file, `export * from '${target}';\n`];
}

const EXACT_REEXPORTS = new Map([
  ...[
    'screen_ui_helpers',
    'screen_ui_runtime',
    'settings_ui_helpers',
    'settings_ui_runtime',
    'settings_ui_apply_helpers',
    'settings_ui_bindings',
    'settings_ui_keybinding_helpers',
    'settings_ui_runtime_helpers',
    'story_ui_helpers',
    'story_ui_hidden_ending_render',
    'story_ui_render',
    'story_ui_runtime',
    'help_pause_ui_helpers',
    'help_pause_ui_runtime',
    'help_pause_ui_abandon_runtime',
    'help_pause_ui_dialog_runtime',
    'help_pause_ui_overlay_runtime',
    'help_pause_ui_pause_runtime',
    'help_pause_hotkeys_runtime_ui',
    'help_pause_menu_runtime_ui',
    'help_pause_ui_overlays',
    'help_pause_ui_return_runtime',
    'help_pause_ui_dialog_overlays',
    'help_pause_ui_pause_menu_overlay',
    'help_pause_ui_overlay_dom',
    'ending_screen_ui_runtime',
    'ending_screen_action_helpers',
    'meta_progression_ui_runtime',
  ].map((name) => star(`game/ui/screens/${name}.js`, `../../features/ui/public.js`)),
  ...[
    'run_mode_ui_helpers',
    'run_mode_ui_runtime',
    'run_mode_ui_render',
    'run_mode_ui_bindings',
    'run_mode_ui_presets_render',
    'run_mode_ui_summary_render',
    'run_return_ui_runtime',
  ].map((name) => star(`game/ui/run/${name}.js`, `../../features/run/public.js`)),
  ...[
    'codex_ui_controller',
    'codex_ui_controller_helpers',
    'codex_ui_content_runtime',
    'codex_ui_content_sections',
    'codex_ui_entry_renderers',
    'codex_ui_filter_render',
    'codex_ui_helpers',
    'codex_ui_inscriptions',
    'codex_ui_popup',
    'codex_ui_popup_payloads',
    'codex_ui_popup_runtime',
    'codex_ui_popup_runtime_helpers',
    'codex_ui_progress_render',
    'codex_ui_render',
    'codex_ui_runtime',
    'codex_ui_runtime_dispatch',
    'codex_ui_runtime_helpers',
    'codex_ui_section_render',
    'codex_ui_structure',
  ].map((name) => star(`game/ui/screens/${name}.js`, `../../features/codex/public.js`)),
  star(
    'game/ui/title/run_end_screen_helpers.js',
    '../../features/title/ports/public_run_end_presentation_capabilities.js',
  ),
  star(
    'game/ui/title/game_boot_ui_audio_fx.js',
    '../../features/title/ports/public_game_boot_presentation_capabilities.js',
  ),
  star(
    'game/ui/title/game_boot_ui_count_fx.js',
    '../../features/title/ports/public_game_boot_presentation_capabilities.js',
  ),
  star(
    'game/ui/title/game_boot_ui_lore_fx.js',
    '../../features/title/ports/public_game_boot_presentation_capabilities.js',
  ),
  star(
    'game/ui/title/game_boot_ui_nav_fx.js',
    '../../features/title/ports/public_game_boot_presentation_capabilities.js',
  ),
  star(
    'game/ui/title/game_boot_ui_warp_fx.js',
    '../../features/title/ports/public_game_boot_presentation_capabilities.js',
  ),
  ...[
    'character_select_particles',
    'character_select_panels',
    'character_select_info_panel',
    'character_select_phase_panel',
    'character_select_render',
    'character_select_radar',
    'character_select_card_ui',
  ].map((name) => star(`game/ui/title/${name}.js`, `../../features/title/ports/public_character_select_presentation_capabilities.js`)),
]);

describe('ui screen runtime compat reexports', () => {
  it('keeps extracted screen/ui/run/codex/title helpers as compat-only reexports', () => {
    for (const [file, expected] of EXACT_REEXPORTS) {
      const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
      expect(source).toBe(expected);
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
      'game/ui/title/run_end_screen_runtime.js',
      'game/ui/title/title_canvas_runtime.js',
    ];

    removedFiles.forEach((file) => {
      expect(fs.existsSync(path.join(process.cwd(), file))).toBe(false);
    });
  });
});
