import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';

const HELPER_PATH = '../game/shared/ui/tooltip/tooltip_trigger_bindings.js';

function readRepoFile(relativePath) {
  return readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

describe('tooltip_trigger_bindings', () => {
  it('exports a shared tooltip trigger helper surface', async () => {
    const mod = await import(HELPER_PATH).catch(() => null);

    expect(typeof mod?.bindTooltipTrigger).toBe('function');
    expect(typeof mod?.applyTooltipTriggerA11y).toBe('function');
    expect(typeof mod?.createTooltipTriggerEvent).toBe('function');
  });

  it('moves repeated tooltip trigger wiring onto the shared helper', () => {
    const targetFiles = [
      ['game/features/combat/presentation/browser/tooltip_ui.js', 'public_tooltip_support_capabilities.js'],
      ['game/features/combat/presentation/browser/hud_panel_item_runtime_helpers.js', 'public_tooltip_support_capabilities.js'],
      ['game/features/combat/presentation/browser/combat_enemy_card_ui.js', 'bindEnemyIntentTooltip('],
      ['game/features/combat/presentation/browser/combat_enemy_card_sections_ui.js', 'public_tooltip_support_capabilities.js'],
      ['game/features/combat/presentation/browser/combat_relic_rail_ui.js', 'public_tooltip_support_capabilities.js'],
      ['game/features/combat/presentation/browser/status_effects_ui.js', 'public_tooltip_support_capabilities.js'],
      ['game/features/combat/presentation/browser/combat_enemy_status_badges_ui.js', 'public_tooltip_support_capabilities.js'],
      ['game/features/combat/presentation/browser/class_trait_panel_ui.js', 'public_tooltip_support_capabilities.js'],
      ['game/features/combat/presentation/browser/hud_panel_sections.js', 'public_tooltip_support_capabilities.js'],
      ['game/features/event/presentation/browser/event_ui_item_shop.js', 'public_tooltip_support_capabilities.js'],
      ['game/features/event/presentation/browser/event_ui_card_discard.js', 'public_tooltip_support_capabilities.js'],
      ['game/features/reward/presentation/browser/reward_ui_option_bindings.js', 'public_tooltip_support_capabilities.js'],
      ['game/features/run/platform/browser/register_run_entry_bindings.js', 'public_tooltip_support_capabilities.js'],
      ['game/features/run/presentation/browser/map_ui_full_map.js', 'public_tooltip_support_capabilities.js'],
      ['game/features/run/presentation/browser/map_ui_next_nodes_relic_slots.js', 'public_tooltip_support_capabilities.js'],
      ['game/features/title/platform/browser/character_select_info_panel_tooltips.js', 'public_tooltip_support_capabilities.js'],
      ['game/features/title/platform/browser/class_select_button_bindings.js', 'public_tooltip_support_capabilities.js'],
    ];

    targetFiles.forEach(([relativePath, needle]) => {
      const source = readRepoFile(relativePath);
      expect(source).toContain(needle);
    });
  });

  it('blocks direct hover/focus tooltip wiring from returning on helper-owned surfaces', () => {
    const guardedFiles = [
      'game/features/combat/presentation/browser/tooltip_ui.js',
      'game/features/combat/presentation/browser/hud_panel_item_runtime_helpers.js',
      'game/features/combat/presentation/browser/combat_enemy_card_sections_ui.js',
      'game/features/combat/presentation/browser/combat_relic_rail_ui.js',
      'game/features/combat/presentation/browser/status_effects_ui.js',
      'game/features/combat/presentation/browser/combat_enemy_status_badges_ui.js',
      'game/features/combat/presentation/browser/class_trait_panel_ui.js',
      'game/features/combat/presentation/browser/hud_panel_sections.js',
      'game/features/event/presentation/browser/event_ui_item_shop.js',
      'game/features/event/presentation/browser/event_ui_card_discard.js',
      'game/features/reward/presentation/browser/reward_ui_option_renderers.js',
      'game/features/run/platform/browser/register_run_entry_bindings.js',
      'game/features/run/presentation/browser/map_ui_full_map.js',
      'game/features/run/presentation/browser/map_ui_next_nodes_relic_slots.js',
      'game/features/title/platform/browser/class_select_buttons_ui.js',
    ];
    const directBindingPattern = /addEventListener\('(?:mouseenter|mouseleave|focus|blur|mousemove)'|onmouseenter|onmouseleave|onfocus|onblur/;

    guardedFiles.forEach((relativePath) => {
      expect(readRepoFile(relativePath)).not.toMatch(directBindingPattern);
    });
  });

  it('normalizes hover and focus tooltip events against the current target', async () => {
    const mod = await import(HELPER_PATH).catch(() => null);
    const calls = [];
    const listeners = new Map();
    const element = {
      addEventListener: vi.fn((name, handler) => listeners.set(name, handler)),
      setAttribute: vi.fn(),
    };

    mod?.bindTooltipTrigger?.(element, {
      label: '설명',
      show(event) {
        calls.push(event);
      },
      hide: vi.fn(),
    });

    listeners.get('mouseenter')?.({ type: 'mouseenter', target: { id: 'child' } });
    listeners.get('focus')?.({ type: 'focus' });

    expect(calls).toHaveLength(2);
    expect(calls[0].currentTarget).toBe(element);
    expect(calls[0].target).toEqual({ id: 'child' });
    expect(calls[1].currentTarget).toBe(element);
    expect(calls[1].target).toBe(element);
  });
});
