import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const REMOVED_COMBAT_COMPAT_FILES = [
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
  'game/ui/combat/card_popup_ui.js',
  'game/ui/combat/combat_actions_runtime_ui.js',
  'game/ui/combat/combat_actions_ui.js',
  'game/ui/combat/combat_enemy_card_renderers_ui.js',
  'game/ui/combat/combat_enemy_card_sections_ui.js',
  'game/ui/combat/combat_enemy_card_ui.js',
  'game/ui/combat/combat_enemy_runtime_ui.js',
  'game/ui/combat/combat_enemy_status_badges_ui.js',
  'game/ui/combat/combat_enemy_status_tooltip_ui.js',
  'game/ui/combat/combat_enemy_view_model_ui.js',
  'game/ui/combat/combat_hud_chronicle.js',
  'game/ui/combat/combat_hud_chronicle_render_ui.js',
  'game/ui/combat/combat_hud_chronicle_runtime_ui.js',
  'game/ui/combat/combat_hud_feedback.js',
  'game/ui/combat/combat_hud_log_ui.js',
  'game/ui/combat/combat_hud_special_ui.js',
  'game/ui/combat/combat_hud_ui.js',
  'game/ui/combat/combat_hud_widgets_ui.js',
  'game/ui/combat/combat_info_items_ui.js',
  'game/ui/combat/combat_info_runtime_ui.js',
  'game/ui/combat/combat_info_status_ui.js',
  'game/ui/combat/combat_info_ui.js',
  'game/ui/combat/combat_intent_ui.js',
  'game/ui/combat/combat_render_helpers.js',
  'game/ui/combat/combat_start_render_ui.js',
  'game/ui/combat/combat_start_runtime_ui.js',
  'game/ui/combat/combat_start_ui.js',
  'game/ui/combat/combat_turn_flow_ui.js',
  'game/ui/combat/combat_turn_render_ui.js',
  'game/ui/combat/combat_turn_runtime_ui.js',
  'game/ui/combat/combat_turn_ui.js',
  'game/ui/combat/combat_ui_runtime_helpers.js',
  'game/ui/combat/draw_availability.js',
  'game/ui/combat/echo_skill_runtime_ui.js',
  'game/ui/combat/echo_skill_ui.js',
  'game/ui/combat/status_tooltip_builder.js',
  'game/ui/combat/status_tooltip_copy.js',
  'game/ui/combat/status_tooltip_layout.js',
  'game/ui/combat/status_tooltip_runtime_ui.js',
  'game/ui/combat/status_tooltip_sections.js',
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
];

describe('combat ui compat reexports', () => {
  it('removes the transitional combat compat surfaces once callers import from the feature public surface', () => {
    for (const file of REMOVED_COMBAT_COMPAT_FILES) {
      expect(fs.existsSync(path.join(process.cwd(), file))).toBe(false);
    }
  });
});
