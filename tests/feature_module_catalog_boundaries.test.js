import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const FILES = [
  'game/features/codex/modules/codex_module_catalog.js',
  'game/features/title/modules/title_module_catalog.js',
  'game/features/run/modules/run_module_catalog.js',
  'game/features/combat/modules/public_combat_modules.js',
];
const BROWSER_MODULE_FILES = [
  'game/features/run/platform/browser/run_browser_modules.js',
  'game/features/combat/platform/browser/combat_browser_modules.js',
];
const FEATURE_BROWSER_RUNTIME_FILES = [
  'game/features/event/platform/browser/create_event_runtime_dom_actions.js',
  'game/features/reward/platform/browser/reward_runtime_context.js',
  'game/features/reward/presentation/browser/show_reward_screen_runtime.js',
];
const FEATURE_EVENT_SCREEN_FILES = [
  'game/features/event/app/event_choice_flow_actions.js',
  'game/features/event/presentation/browser/event_ui_runtime_helpers.js',
  'game/features/event/presentation/browser/event_shop_presenter.js',
  'game/features/event/presentation/browser/event_choice_resolution_presenter.js',
];
const UI_FEATURE_SCREEN_FILES = [
  'game/features/ui/presentation/browser/screen_ui.js',
  'game/features/ui/presentation/browser/screen_ui_helpers.js',
  'game/features/ui/presentation/browser/screen_ui_runtime.js',
  'game/features/ui/presentation/browser/settings_ui.js',
  'game/features/ui/presentation/browser/settings_ui_helpers.js',
  'game/features/ui/presentation/browser/settings_ui_apply_helpers.js',
  'game/features/ui/presentation/browser/settings_ui_bindings.js',
  'game/features/ui/presentation/browser/settings_ui_keybinding_helpers.js',
  'game/features/ui/presentation/browser/settings_ui_runtime.js',
  'game/features/ui/presentation/browser/settings_ui_runtime_helpers.js',
  'game/features/ui/presentation/browser/story_ui.js',
  'game/features/ui/presentation/browser/story_ui_helpers.js',
  'game/features/ui/presentation/browser/story_ui_hidden_ending_render.js',
  'game/features/ui/presentation/browser/story_ui_render.js',
  'game/features/ui/presentation/browser/story_ui_runtime.js',
  'game/features/ui/presentation/browser/help_pause_ui.js',
  'game/features/ui/presentation/browser/help_pause_ui_helpers.js',
  'game/features/ui/presentation/browser/help_pause_ui_runtime.js',
  'game/features/ui/presentation/browser/help_pause_ui_abandon_runtime.js',
  'game/features/ui/presentation/browser/help_pause_ui_dialog_runtime.js',
  'game/features/ui/presentation/browser/help_pause_ui_overlay_runtime.js',
  'game/features/ui/presentation/browser/help_pause_ui_pause_runtime.js',
  'game/features/ui/presentation/browser/help_pause_hotkeys_runtime_ui.js',
  'game/features/ui/presentation/browser/help_pause_menu_runtime_ui.js',
  'game/features/ui/presentation/browser/help_pause_ui_overlays.js',
  'game/features/ui/presentation/browser/help_pause_ui_dialog_overlays.js',
  'game/features/ui/presentation/browser/help_pause_ui_pause_menu_overlay.js',
  'game/features/ui/presentation/browser/help_pause_ui_overlay_dom.js',
  'game/features/ui/presentation/browser/help_pause_ui_return_runtime.js',
  'game/features/ui/presentation/browser/ending_screen_ui.js',
  'game/features/ui/presentation/browser/ending_screen_ui_runtime.js',
  'game/features/ui/presentation/browser/ending_screen_helpers.js',
  'game/features/ui/presentation/browser/ending_screen_runtime_helpers.js',
  'game/features/ui/presentation/browser/ending_screen_fx.js',
  'game/features/ui/presentation/browser/ending_screen_scene_runtime.js',
  'game/features/ui/presentation/browser/ending_screen_render_helpers.js',
  'game/features/ui/presentation/browser/ending_screen_action_helpers.js',
  'game/features/ui/presentation/browser/ending_fragment_choice_presenter.js',
  'game/features/ui/presentation/browser/ending_fragment_choice_actions.js',
  'game/features/ui/presentation/browser/meta_progression_ui.js',
  'game/features/ui/presentation/browser/meta_progression_ui_runtime.js',
];
const CODEX_FEATURE_BROWSER_FILES = [
  'game/features/codex/presentation/browser/codex_ui.js',
  'game/features/codex/presentation/browser/codex_ui_controller.js',
  'game/features/codex/presentation/browser/codex_ui_controller_helpers.js',
  'game/features/codex/presentation/browser/codex_ui_content_runtime.js',
  'game/features/codex/presentation/browser/codex_ui_content_sections.js',
  'game/features/codex/presentation/browser/codex_ui_entry_renderers.js',
  'game/features/codex/presentation/browser/codex_ui_filter_render.js',
  'game/features/codex/presentation/browser/codex_ui_helpers.js',
  'game/features/codex/presentation/browser/codex_ui_inscriptions.js',
  'game/features/codex/presentation/browser/codex_ui_popup.js',
  'game/features/codex/presentation/browser/codex_ui_popup_payloads.js',
  'game/features/codex/presentation/browser/codex_ui_popup_runtime.js',
  'game/features/codex/presentation/browser/codex_ui_popup_runtime_helpers.js',
  'game/features/codex/presentation/browser/codex_ui_progress_render.js',
  'game/features/codex/presentation/browser/codex_ui_render.js',
  'game/features/codex/presentation/browser/codex_ui_runtime.js',
  'game/features/codex/presentation/browser/codex_ui_runtime_dispatch.js',
  'game/features/codex/presentation/browser/codex_ui_runtime_helpers.js',
  'game/features/codex/presentation/browser/codex_ui_section_render.js',
  'game/features/codex/presentation/browser/codex_ui_structure.js',
];
const RUN_FEATURE_BROWSER_FILES = [
  'game/features/run/presentation/browser/run_mode_ui.js',
  'game/features/run/presentation/browser/run_mode_ui_helpers.js',
  'game/features/run/presentation/browser/run_mode_ui_runtime.js',
  'game/features/run/presentation/browser/run_mode_ui_render.js',
  'game/features/run/presentation/browser/run_mode_ui_bindings.js',
  'game/features/run/presentation/browser/run_mode_ui_presets_render.js',
  'game/features/run/presentation/browser/run_mode_ui_summary_render.js',
  'game/features/run/presentation/browser/run_return_ui.js',
  'game/features/run/presentation/browser/run_return_ui_runtime.js',
];
const TITLE_FEATURE_BROWSER_FILES = [
  'game/features/title/presentation/browser/title_canvas_ui.js',
  'game/features/title/presentation/browser/title_canvas_runtime.js',
  'game/features/title/presentation/browser/run_end_screen_ui.js',
  'game/features/title/presentation/browser/run_end_screen_runtime.js',
  'game/features/title/presentation/browser/run_end_screen_helpers.js',
  'game/features/title/presentation/browser/level_up_popup_ui.js',
  'game/features/title/presentation/browser/level_up_popup_runtime.js',
  'game/features/title/presentation/browser/level_up_popup_helpers.js',
  'game/features/title/presentation/browser/intro_cinematic_ui.js',
  'game/features/title/presentation/browser/intro_cinematic_runtime.js',
  'game/features/title/presentation/browser/intro_cinematic_helpers.js',
  'game/features/title/presentation/browser/game_canvas_setup_ui.js',
  'game/features/title/presentation/browser/game_canvas_setup_ui_runtime.js',
  'game/features/title/presentation/browser/game_boot_ui.js',
  'game/features/title/presentation/browser/game_boot_ui_fx.js',
  'game/features/title/presentation/browser/game_boot_ui_helpers.js',
  'game/features/title/presentation/browser/game_boot_ui_runtime.js',
  'game/features/title/presentation/browser/game_boot_ui_audio_fx.js',
  'game/features/title/presentation/browser/game_boot_ui_count_fx.js',
  'game/features/title/presentation/browser/game_boot_ui_lore_fx.js',
  'game/features/title/presentation/browser/game_boot_ui_nav_fx.js',
  'game/features/title/presentation/browser/game_boot_ui_warp_fx.js',
  'game/features/title/platform/browser/create_character_select_runtime_bindings.js',
  'game/features/title/platform/browser/create_character_select_mount_runtime.js',
  'game/features/title/platform/browser/character_select_particles.js',
  'game/features/title/platform/browser/character_select_panels.js',
  'game/features/title/platform/browser/character_select_info_panel.js',
  'game/features/title/platform/browser/character_select_phase_panel.js',
  'game/features/title/platform/browser/character_select_render.js',
  'game/features/title/platform/browser/character_select_radar.js',
  'game/features/title/platform/browser/character_select_card_ui.js',
];
const PUBLIC_FILES = [
  'game/features/codex/public.js',
  'game/features/title/public.js',
  'game/features/run/public.js',
  'game/features/combat/public.js',
];

describe('feature module catalog boundaries', () => {
  it('keeps feature module catalogs free of direct ui imports', () => {
    for (const file of FILES) {
      const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
      expect(source).not.toMatch(/ui\//);
    }
  });

  it('keeps browser module entrypoints free of direct map and hud ui imports', () => {
    for (const file of BROWSER_MODULE_FILES) {
      const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
      expect(source).not.toMatch(/ui\/map/);
      expect(source).not.toMatch(/ui\/hud/);
    }
  });

  it('keeps event and reward browser runtime files free of direct ui screen imports', () => {
    for (const file of FEATURE_BROWSER_RUNTIME_FILES) {
      const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
      expect(source).not.toMatch(/ui\/screens\/(event_|reward_)/);
    }
  });

  it('keeps event feature flows free of direct presentation screen imports', () => {
    for (const file of FEATURE_EVENT_SCREEN_FILES) {
      const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
      expect(source).not.toMatch(/presentation\/screens\/event_/);
      expect(source).not.toMatch(/ui\/screens\/event_/);
    }
  });

  it('keeps extracted ui feature browser files free of direct screen compat imports', () => {
    for (const file of UI_FEATURE_SCREEN_FILES) {
      const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
      expect(source).not.toMatch(/ui\/screens\/(screen_|settings_|story_|help_pause_|ending_|meta_progression_)/);
    }
  });

  it('keeps extracted codex browser files free of direct codex compat imports', () => {
    for (const file of CODEX_FEATURE_BROWSER_FILES) {
      const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
      expect(source).not.toMatch(/ui\/screens\/codex_/);
    }
  });

  it('keeps extracted run browser files free of direct run compat imports', () => {
    for (const file of RUN_FEATURE_BROWSER_FILES) {
      const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
      expect(source).not.toMatch(/ui\/run\/run_(mode|return)_/);
    }
  });

  it('keeps extracted title browser files free of direct title compat imports', () => {
    for (const file of TITLE_FEATURE_BROWSER_FILES) {
      const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
      expect(source).not.toMatch(/ui\/title\/(title_canvas_|run_end_screen_|level_up_popup_|intro_cinematic_|game_canvas_setup_ui_|game_boot_ui_|character_select_)/);
    }
  });

  it('keeps feature public surfaces free of raw public module builder exports', () => {
    for (const file of PUBLIC_FILES) {
      const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
      expect(source).not.toMatch(/build.*PublicModules/);
    }
  });
});
