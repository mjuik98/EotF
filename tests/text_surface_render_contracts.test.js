import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

function readRepoFile(relativePath) {
  return readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

describe('text surface render contracts', () => {
  it('keeps player-facing description surfaces on highlighted or safe render paths', () => {
    const expectations = [
      ['game/features/combat/presentation/browser/feedback_ui_toast_views.js', 'DomSafe.setHighlightedText'],
      ['game/features/combat/presentation/browser/tooltip_general_ui.js', 'DomSafe.setHighlightedText'],
      ['game/features/combat/presentation/browser/tooltip_card_render_ui.js', 'DomSafe.setHighlightedText'],
      ['game/features/combat/presentation/browser/tooltip_item_element.js', 'DomSafe.setHighlightedText'],
      ['game/features/combat/presentation/browser/feedback_ui_notices.js', 'DescriptionUtils?.highlight'],
      ['game/features/event/presentation/browser/event_ui_item_shop.js', 'DomSafe.setHighlightedText'],
      ['game/features/event/presentation/browser/event_ui_card_discard.js', 'DomSafe.setHighlightedText'],
      ['game/features/event/presentation/browser/event_text_surface.js', 'DomSafe.setHighlightedText'],
      ['game/features/event/presentation/browser/event_runtime_shell_presenter.js', 'applyEventShellCopy'],
      ['game/features/event/presentation/browser/event_choice_resolution_presenter.js', 'setEventDescriptionText'],
      ['game/features/run/presentation/browser/map_bottom_dock.js', 'DomSafe.setHighlightedText'],
      ['game/features/run/presentation/browser/region_transition_ui.js', 'DomSafe.setHighlightedText'],
      ['game/features/run/presentation/browser/map_ui_full_map_render_layout.js', 'DescriptionUtils.highlight'],
      ['game/features/run/presentation/browser/map_ui_next_nodes_render_panels.js', 'DescriptionUtils.highlight'],
      ['game/features/run/presentation/browser/run_mode_ui_render.js', 'highlightRunModeText'],
      ['game/features/run/presentation/browser/run_mode_ui_inscriptions_render.js', 'highlightRunModeText'],
      ['game/features/run/presentation/browser/run_mode_ui_summary_render.js', 'highlightRunModeText'],
      ['game/features/title/platform/browser/class_select_tooltip_ui.js', 'DomSafe.setHighlightedText'],
      ['game/features/title/platform/browser/character_select_modal.js', 'DescriptionUtils.highlight'],
      ['game/features/title/platform/browser/character_select_info_panel_summary_section.js', 'DescriptionUtils.highlight'],
      ['game/features/reward/presentation/browser/reward_ui_option_renderers.js', 'DomSafe.setHighlightedText'],
      ['game/features/ui/presentation/browser/ending_fragment_choice_presenter.js', 'DescriptionUtils.highlight'],
      ['game/features/ui/presentation/browser/ending_screen_render_helpers.js', 'DomSafe.setHighlightedText'],
      ['game/features/codex/presentation/browser/codex_ui_popup_runtime.js', 'safeHtml: highlightCodexDescription'],
      ['game/features/codex/presentation/browser/codex_ui_popup_payloads.js', 'safeHtml = (value) => value ||'],
    ];

    expectations.forEach(([relativePath, needle]) => {
      expect(readRepoFile(relativePath)).toContain(needle);
    });

    expect(readRepoFile('game/features/run/presentation/browser/run_mode_ui_render.js')).not.toContain('DescriptionUtils');
    expect(readRepoFile('game/features/run/presentation/browser/run_mode_ui_inscriptions_render.js')).not.toContain('DescriptionUtils');
    expect(readRepoFile('game/features/run/presentation/browser/run_mode_ui_summary_render.js')).not.toContain('DescriptionUtils');
  });
});
