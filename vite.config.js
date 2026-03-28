import { defineConfig } from 'vite';

const LAZY_HTML_PRELOAD_PATTERNS = [
  /\/?assets\/ui-combat-[^/]+\.js$/,
  /\/?assets\/ui-combat-copy-[^/]+\.js$/,
  /\/?assets\/ui-combat-relics-[^/]+\.js$/,
  /\/?assets\/ui-combat-deck-[^/]+\.js$/,
  /\/?assets\/ui-combat-chronicle-[^/]+\.js$/,
  /\/?assets\/ui-combat-status-[^/]+\.js$/,
  /\/?assets\/ui-combat-tooltips-[^/]+\.js$/,
  /\/?assets\/ui-event-[^/]+\.js$/,
  /\/?assets\/ui-reward-[^/]+\.js$/,
  /\/?assets\/ui-run-mode-config-[^/]+\.js$/,
  /\/?assets\/ui-run-mode-runtime-[^/]+\.js$/,
  /\/?assets\/ui-shell-overlays-[^/]+\.js$/,
  /\/?assets\/ui-shell-hotkeys-[^/]+\.js$/,
  /\/?assets\/ui-settings-[^/]+\.js$/,
  /\/?assets\/ui-settings-core-[^/]+\.js$/,
  /\/?assets\/ui-settings-hotkeys-[^/]+\.js$/,
  /\/?assets\/ui-run-mode-[^/]+\.js$/,
  /\/?assets\/ui-progression-core-[^/]+\.js$/,
  /\/?assets\/data-classes-[^/]+\.js$/,
  /\/?assets\/data-events-[^/]+\.js$/,
  /\/?assets\/data-cards-[^/]+\.js$/,
  /\/?assets\/data-items-[^/]+\.js$/,
  /\/?assets\/data-enemies-[^/]+\.js$/,
];

export function filterLazyChunkModulePreloads(deps, context = {}) {
  if (context.hostType !== 'html') return deps;

  return deps.filter((dep) => {
    return !LAZY_HTML_PRELOAD_PATTERNS.some((pattern) => pattern.test(dep));
  });
}

export function getManualChunk(id) {
  const normalized = id.replace(/\\/g, '/');

  if (normalized.includes('/node_modules/')) return 'vendor';

  if (normalized.endsWith('/data/cards.js')) return 'data-cards';
  if (normalized.endsWith('/data/items.js')) return 'data-items';
  if (normalized.endsWith('/data/enemies.js')) return 'data-enemies';
  if (normalized.endsWith('/data/class_metadata.js')) return 'data-classes';
  if (normalized.endsWith('/data/events_data.js')) return 'data-events';
  if (normalized.endsWith('/data/status_tooltip_meta_data.js')) return 'ui-combat-status';
  if (normalized.endsWith('/data/status_key_data.js')) return 'ui-combat-status';
  if (normalized.endsWith('/game/utils/status_value_utils.js')) return 'ui-combat-status';
  if (normalized.includes('/game/shared/progression/set_bonus_')) return 'ui-progression-core';
  if (normalized.includes('/game/shared/progression/class_loadout_preset_')) return 'ui-progression-core';
  if (normalized.includes('/game/features/meta_progression/domain/')) return 'ui-progression-core';
  if (normalized.includes('/game/features/meta_progression/application/')) return 'ui-progression-core';
  if (normalized.includes('/game/features/title/domain/class_progression/')) return 'ui-progression-core';
  if (normalized.endsWith('/game/features/title/domain/class_progression_system.js')) return 'ui-progression-core';
  if (normalized.endsWith('/game/features/title/application/load_character_select_use_case.js')) return 'ui-progression-core';
  if (normalized.includes('/game/shared/ui/tooltip/')) return 'ui-shared-surfaces';
  if (normalized.includes('/game/shared/ui/item_detail/')) return 'ui-shared-surfaces';
  if (normalized.includes('/game/shared/ui/state/')) return 'ui-shared-surfaces';
  if (normalized.endsWith('/game/features/ui/ports/public_feature_support_capabilities.js')) return 'ui-shared-surfaces';
  if (normalized.endsWith('/game/features/ui/ports/public_text_support_capabilities.js')) return 'ui-shared-surfaces';
  if (normalized.endsWith('/game/features/ui/ports/public_dom_support_capabilities.js')) return 'ui-shared-surfaces';
  if (normalized.endsWith('/game/features/ui/ports/public_shared_support_capabilities.js')) return 'ui-shared-surfaces';
  if (normalized.endsWith('/game/features/ui/ports/public_tooltip_support_capabilities.js')) return 'ui-shared-surfaces';
  if (normalized.endsWith('/game/features/ui/ports/public_audio_support_capabilities.js')) return 'ui-shared-surfaces';
  if (normalized.endsWith('/game/features/ui/ports/public_runtime_debug_support_capabilities.js')) return 'ui-shared-surfaces';
  if (normalized.endsWith('/game/features/ui/ports/public_binding_ref_support_capabilities.js')) return 'ui-shared-surfaces';
  if (normalized.endsWith('/game/features/ui/ports/contracts/build_ui_shell_contracts.js')) return 'ui-shared-surfaces';
  if (normalized.endsWith('/game/features/ui/ports/contracts/public_ui_contract_capabilities.js')) return 'ui-shared-surfaces';
  if (normalized.endsWith('/game/features/codex/platform/browser/ensure_codex_modal_shell.js')) return 'ui-shared-surfaces';
  if (normalized.endsWith('/game/features/codex/presentation/browser/codex_ui_style.js')) return 'ui-shared-surfaces';
  if (normalized.endsWith('/game/features/run/presentation/browser/run_mode_text_highlight.js')) return 'ui-shared-surfaces';
  if (normalized.endsWith('/game/features/combat/presentation/browser/combat_surface_state.js')) return 'ui-combat-copy';
  if (normalized.endsWith('/game/features/combat/presentation/browser/combat_copy.js')) return 'ui-combat-copy';
  if (normalized.endsWith('/game/features/combat/presentation/browser/combat_keyword_copy.js')) return 'ui-combat-copy';
  if (normalized.endsWith('/game/features/combat/presentation/browser/combat_relic_rail_ui.js')) return 'ui-combat-relics';
  if (normalized.endsWith('/game/features/combat/presentation/browser/combat_relic_visuals.js')) return 'ui-combat-relics';
  if (normalized.endsWith('/game/features/combat/presentation/browser/item_tooltip_fallback_text.js')) return 'ui-combat-relics';
  if (normalized.endsWith('/game/features/combat/presentation/browser/item_detail_navigation.js')) return 'ui-combat-relics';
  if (normalized.endsWith('/game/features/combat/presentation/browser/item_detail_state.js')) return 'ui-combat-relics';
  if (normalized.endsWith('/game/features/combat/presentation/browser/item_detail_view_model.js')) return 'ui-combat-relics';
  if (normalized.includes('/game/features/combat/presentation/browser/item_detail_')) return 'ui-combat-relics';
  if (normalized.includes('/game/ui/map/')) return 'ui-map';
  if (normalized.includes('/game/features/event/presentation/browser/')) return 'ui-event';
  if (
    normalized.includes('/game/features/combat/presentation/browser/deck_modal_')
    || normalized.endsWith('/game/features/combat/presentation/browser/deck_modal_ui.js')
  ) return 'ui-combat-deck';
  if (normalized.includes('/game/features/combat/presentation/browser/combat_hud_chronicle')) {
    return 'ui-combat-chronicle';
  }
  if (
    normalized.endsWith('/game/features/combat/ports/presentation/public_combat_status_support_capabilities.js')
    || normalized.endsWith('/game/features/combat/ports/presentation/public_combat_status_presentation_capabilities.js')
  ) return 'ui-combat-status';
  if (
    normalized.includes('/game/features/combat/platform/browser/combat_tooltip_browser_modules.js')
    || normalized.includes('/game/features/combat/presentation/browser/tooltip_general_')
    || normalized.includes('/game/features/combat/presentation/browser/tooltip_item_')
    || normalized.includes('/game/features/combat/presentation/browser/tooltip_card_')
  ) return 'ui-combat-tooltips';
  if (
    normalized.includes('/game/features/combat/presentation/browser/status_tooltip_')
    || normalized.endsWith('/game/features/combat/presentation/browser/combat_enemy_status_tooltip_ui.js')
  ) return 'ui-combat-status';

  if (
    normalized.includes('/game/ui/combat/')
    || normalized.includes('/game/ui/cards/')
    || normalized.includes('/game/ui/hud/')
    || normalized.includes('/game/features/combat/presentation/browser/')
    || normalized.includes('/game/presentation/combat/')
  ) return 'ui-combat';
  if (normalized.includes('/game/features/reward/presentation/browser/')) return 'ui-reward';

  if (
    normalized.includes('/game/features/ui/presentation/browser/ending_')
    || normalized.includes('/game/features/ui/presentation/browser/story_')
    || normalized.includes('/game/features/ui/presentation/browser/meta_progression_')
  ) return 'ui-overlays';
  if (
    normalized.endsWith('/game/features/ui/presentation/browser/help_pause_keybinding_helpers.js')
    || normalized.endsWith('/game/features/ui/presentation/browser/help_pause_run_hotkey_state.js')
    || normalized.endsWith('/game/features/ui/presentation/browser/help_pause_visibility.js')
  ) return 'ui-shell-hotkeys';

  if (
    normalized.endsWith('/game/features/title/application/help_pause_title_actions.js')
    || normalized.endsWith('/game/features/title/application/help_pause_menu_actions.js')
    || normalized.endsWith('/game/features/title/application/help_pause_abandon_actions.js')
    || normalized.endsWith('/game/features/title/application/title_return_actions.js')
    || normalized.endsWith('/game/features/title/application/ending_action_ports.js')
    || normalized.endsWith('/game/features/title/ports/public_help_pause_application_capabilities.js')
  ) return 'ui-shell-overlays';

  if (
    normalized.includes('/game/features/ui/platform/browser/create_lazy_help_pause_module.js')
    || normalized.includes('/game/features/ui/platform/browser/import_help_pause_module.js')
    || normalized.includes('/game/features/ui/platform/browser/create_lazy_meta_progression_module.js')
    || normalized.includes('/game/features/ui/platform/browser/import_meta_progression_module.js')
    || normalized.includes('/game/features/ui/presentation/browser/help_pause_')
  ) return 'ui-shell-overlays';

  if (normalized.endsWith('/game/platform/browser/settings/settings_manager.js')) return 'ui-settings-core';
  if (normalized.endsWith('/game/core/settings_manager.js')) return 'ui-settings-core';
  if (normalized.endsWith('/game/features/ui/presentation/browser/settings_ui.js')) return 'ui-settings';
  if (
    normalized.endsWith('/game/features/ui/presentation/browser/settings_ui_keybinding_helpers.js')
    || normalized.endsWith('/game/features/ui/presentation/browser/settings_ui_runtime_helpers.js')
  ) return 'ui-settings-hotkeys';
  if (
    normalized.endsWith('/game/features/run/presentation/browser/run_mode_ui_runtime.js')
    || normalized.endsWith('/game/features/run/presentation/browser/run_mode_ui_render.js')
    || normalized.endsWith('/game/features/run/presentation/browser/run_mode_ui_summary_render.js')
    || normalized.endsWith('/game/features/run/presentation/browser/run_mode_ui_presets_render.js')
    || normalized.endsWith('/game/features/run/presentation/browser/run_mode_ui_inscriptions_render.js')
  ) return 'ui-run-mode-runtime';
  if (normalized.endsWith('/game/features/run/state/run_config_state_commands.js')) return 'ui-run-mode-config';
  if (normalized.endsWith('/game/features/run/presentation/browser/run_mode_ui.js')) return 'ui-run-mode';

  return null;
}

export default defineConfig({
  server: {
    port: 8000,
    open: true,
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 650,
    modulePreload: {
      resolveDependencies(_filename, deps, context) {
        return filterLazyChunkModulePreloads(deps, context);
      },
    },
    rollupOptions: {
      input: 'index.html',
      output: {
        manualChunks(id) {
          return getManualChunk(id);
        },
      },
    },
  },
  assetsInclude: ['**/*.mp3', '**/*.ogg'],
});
