import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const EXACT_REEXPORTS = new Map([
  ['game/ui/combat/card_popup_ui.js', "export * from '../../features/combat/presentation/browser/card_popup_ui.js';\n"],
  ['game/ui/combat/combat_actions_runtime_ui.js', "export * from '../../features/combat/presentation/browser/combat_actions_runtime_ui.js';\n"],
  ['game/ui/combat/combat_enemy_card_renderers_ui.js', "export * from '../../features/combat/presentation/browser/combat_enemy_card_renderers_ui.js';\n"],
  ['game/ui/combat/combat_enemy_card_sections_ui.js', "export * from '../../features/combat/presentation/browser/combat_enemy_card_sections_ui.js';\n"],
  ['game/ui/combat/combat_enemy_card_ui.js', "export * from '../../features/combat/presentation/browser/combat_enemy_card_ui.js';\n"],
  ['game/ui/combat/combat_enemy_runtime_ui.js', "export * from '../../features/combat/presentation/browser/combat_enemy_runtime_ui.js';\n"],
  ['game/ui/combat/combat_enemy_status_badges_ui.js', "export * from '../../features/combat/presentation/browser/combat_enemy_status_badges_ui.js';\n"],
  ['game/ui/combat/combat_enemy_status_tooltip_ui.js', "export * from '../../features/combat/presentation/browser/combat_enemy_status_tooltip_ui.js';\n"],
  ['game/ui/combat/combat_enemy_view_model_ui.js', "export * from '../../features/combat/presentation/browser/combat_enemy_view_model_ui.js';\n"],
  ['game/ui/combat/combat_hud_chronicle.js', "export * from '../../features/combat/presentation/browser/combat_hud_chronicle.js';\n"],
  ['game/ui/combat/combat_hud_chronicle_render_ui.js', "export * from '../../features/combat/presentation/browser/combat_hud_chronicle_render_ui.js';\n"],
  ['game/ui/combat/combat_hud_chronicle_runtime_ui.js', "export * from '../../features/combat/presentation/browser/combat_hud_chronicle_runtime_ui.js';\n"],
  ['game/ui/combat/combat_hud_feedback.js', "export * from '../../features/combat/presentation/browser/combat_hud_feedback.js';\n"],
  ['game/ui/combat/combat_hud_log_ui.js', "export * from '../../features/combat/presentation/browser/combat_hud_log_ui.js';\n"],
  ['game/ui/combat/combat_hud_special_ui.js', "export * from '../../features/combat/presentation/browser/combat_hud_special_ui.js';\n"],
  ['game/ui/combat/combat_hud_widgets_ui.js', "export * from '../../features/combat/presentation/browser/combat_hud_widgets_ui.js';\n"],
  ['game/ui/combat/combat_info_items_ui.js', "export * from '../../features/combat/presentation/browser/combat_info_items_ui.js';\n"],
  ['game/ui/combat/combat_info_runtime_ui.js', "export * from '../../features/combat/presentation/browser/combat_info_runtime_ui.js';\n"],
  ['game/ui/combat/combat_info_status_ui.js', "export * from '../../features/combat/presentation/browser/combat_info_status_ui.js';\n"],
  ['game/ui/combat/combat_intent_ui.js', "export * from '../../features/combat/presentation/browser/combat_intent_ui.js';\n"],
  ['game/ui/combat/combat_render_helpers.js', "export * from '../../features/combat/presentation/browser/combat_render_helpers.js';\n"],
  ['game/ui/combat/combat_start_render_ui.js', "export * from '../../features/combat/presentation/browser/combat_start_render_ui.js';\n"],
  ['game/ui/combat/combat_start_runtime_ui.js', "export * from '../../features/combat/presentation/browser/combat_start_runtime_ui.js';\n"],
  ['game/ui/combat/combat_turn_flow_ui.js', "export * from '../../features/combat/presentation/browser/combat_turn_flow_ui.js';\n"],
  ['game/ui/combat/combat_turn_render_ui.js', "export * from '../../features/combat/presentation/browser/combat_turn_render_ui.js';\n"],
  ['game/ui/combat/combat_turn_runtime_ui.js', "export * from '../../features/combat/presentation/browser/combat_turn_runtime_ui.js';\n"],
  ['game/ui/combat/combat_turn_ui.js', "export * from '../../features/combat/presentation/browser/combat_turn_ui.js';\n"],
  ['game/ui/combat/combat_ui_runtime_helpers.js', "export * from '../../features/combat/presentation/browser/combat_ui_runtime_helpers.js';\n"],
  ['game/ui/combat/draw_availability.js', "export * from '../../features/combat/presentation/browser/draw_availability.js';\n"],
  ['game/ui/combat/echo_skill_runtime_ui.js', "export * from '../../features/combat/presentation/browser/echo_skill_runtime_ui.js';\n"],
  ['game/ui/combat/status_tooltip_builder.js', "export * from '../../features/combat/presentation/browser/status_tooltip_builder.js';\n"],
  ['game/ui/combat/status_tooltip_copy.js', "export * from '../../features/combat/presentation/browser/status_tooltip_copy.js';\n"],
  ['game/ui/combat/status_tooltip_layout.js', "export * from '../../features/combat/presentation/browser/status_tooltip_layout.js';\n"],
  ['game/ui/combat/status_tooltip_runtime_ui.js', "export * from '../../features/combat/presentation/browser/status_tooltip_runtime_ui.js';\n"],
  ['game/ui/combat/status_tooltip_sections.js', "export * from '../../features/combat/presentation/browser/status_tooltip_sections.js';\n"],
  ['game/ui/cards/card_clone_render_ui.js', "export * from '../../features/combat/presentation/browser/card_clone_render_ui.js';\n"],
  ['game/ui/cards/card_clone_runtime_ui.js', "export * from '../../features/combat/presentation/browser/card_clone_runtime_ui.js';\n"],
  ['game/ui/cards/card_clone_ui.js', "export * from '../../features/combat/presentation/browser/card_clone_ui.js';\n"],
  ['game/ui/cards/card_render_helpers_ui.js', "export * from '../../features/combat/presentation/browser/card_render_helpers_ui.js';\n"],
  ['game/ui/cards/combat_card_render_ui.js', "export * from '../../features/combat/presentation/browser/combat_card_render_ui.js';\n"],
  ['game/ui/cards/deck_modal_render_ui.js', "export * from '../../features/combat/presentation/browser/deck_modal_render_ui.js';\n"],
  ['game/ui/cards/deck_modal_runtime_ui.js', "export * from '../../features/combat/presentation/browser/deck_modal_runtime_ui.js';\n"],
  ['game/ui/cards/tooltip_card_render_ui.js', "export * from '../../features/combat/presentation/browser/tooltip_card_render_ui.js';\n"],
  ['game/ui/cards/tooltip_general_ui.js', "export * from '../../features/combat/presentation/browser/tooltip_general_ui.js';\n"],
  ['game/ui/cards/tooltip_item_render_ui.js', "export * from '../../features/combat/presentation/browser/tooltip_item_render_ui.js';\n"],
  ['game/ui/cards/tooltip_item_ui.js', "export * from '../../features/combat/presentation/browser/tooltip_item_ui.js';\n"],
  ['game/ui/hud/feedback_ui_effects.js', "export * from '../../features/combat/presentation/browser/feedback_ui_effects.js';\n"],
  ['game/ui/hud/feedback_ui_notices.js', "export * from '../../features/combat/presentation/browser/feedback_ui_notices.js';\n"],
  ['game/ui/hud/feedback_ui_toasts.js', "export * from '../../features/combat/presentation/browser/feedback_ui_toasts.js';\n"],
  ['game/ui/hud/hud_effects_ui.js', "export * from '../../features/combat/presentation/browser/hud_effects_ui.js';\n"],
  ['game/ui/hud/hud_panel_runtime_helpers.js', "export * from '../../features/combat/presentation/browser/hud_panel_runtime_helpers.js';\n"],
  ['game/ui/hud/hud_panel_sections.js', "export * from '../../features/combat/presentation/browser/hud_panel_sections.js';\n"],
  ['game/ui/hud/hud_render_helpers.js', "export * from '../../features/combat/presentation/browser/hud_render_helpers.js';\n"],
  ['game/ui/hud/hud_stats_ui.js', "export * from '../../features/combat/presentation/browser/hud_stats_ui.js';\n"],
  ['game/ui/hud/hud_update_runtime_helpers.js', "export * from '../../features/combat/presentation/browser/hud_update_runtime_helpers.js';\n"],
]);

describe('combat ui compat reexports', () => {
  it('keeps combat/card/hud helper paths as thin feature-local reexports', () => {
    for (const [file, expected] of EXACT_REEXPORTS) {
      const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
      expect(source).toBe(expected);
    }
  });
});
