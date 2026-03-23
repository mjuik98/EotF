import { describe, expect, it } from 'vitest';
import { filterLazyChunkModulePreloads, getManualChunk } from '../vite.config.js';
import { readText } from './helpers/guardrail_fs.js';

describe('vite chunking guardrails', () => {
  it('splits gameplay-heavy browser code into focused feature chunks instead of one ui-gameplay bucket', () => {
    const source = readText('vite.config.js');

    expect(source).toContain("return 'ui-combat';");
    expect(source).toContain("return 'ui-combat-copy';");
    expect(source).toContain("return 'ui-combat-relics';");
    expect(source).toContain("return 'ui-combat-deck';");
    expect(source).toContain("return 'ui-combat-chronicle';");
    expect(source).toContain("return 'ui-combat-tooltips';");
    expect(source).toContain("return 'ui-shared-surfaces';");
    expect(source).toContain("return 'ui-reward';");
    expect(source).toContain("return 'ui-event';");
    expect(source).toContain("return 'ui-shell-overlays';");
    expect(source).toContain("return 'ui-shell-hotkeys';");
    expect(source).toContain("return 'ui-settings-core';");
    expect(source).toContain("return 'ui-settings-hotkeys';");
  });

  it('targets canonical feature-owned browser paths instead of transitional ui/presentation screen paths', () => {
    const source = readText('vite.config.js');

    expect(source).toContain("/game/features/event/presentation/browser/");
    expect(source).toContain("/game/features/reward/presentation/browser/");
    expect(source).toContain("/game/features/ui/presentation/browser/ending_");
    expect(source).toContain("/game/features/ui/presentation/browser/story_");
    expect(source).toContain("/game/features/ui/presentation/browser/settings_ui.js");
    expect(source).toContain("/game/features/run/presentation/browser/run_mode_ui.js");
    expect(source).not.toContain("/game/presentation/screens/event_");
    expect(source).not.toContain("/game/ui/screens/event_");
    expect(source).not.toContain("/game/presentation/screens/reward_");
    expect(source).not.toContain("/game/ui/screens/reward_");
    expect(source).not.toContain("/game/ui/screens/settings_ui.js");
    expect(source).not.toContain("/game/ui/run/run_mode_ui.js");
  });

  it('filters lazy feature chunks out of html modulepreload dependencies', () => {
    const deps = [
      'assets/ui-combat-abc.js',
      'assets/ui-combat-copy-abc.js',
      'assets/ui-combat-deck-abc.js',
      'assets/ui-combat-chronicle-abc.js',
      'assets/ui-combat-tooltips-abc.js',
      'assets/ui-event-abc.js',
      'assets/ui-reward-abc.js',
      'assets/ui-shell-overlays-abc.js',
      'assets/ui-shell-hotkeys-abc.js',
      'assets/ui-settings-abc.js',
      'assets/ui-settings-core-abc.js',
      'assets/ui-settings-hotkeys-abc.js',
      'assets/ui-run-mode-abc.js',
      'assets/data-cards-abc.js',
      'assets/vendor-abc.js',
    ];

    expect(filterLazyChunkModulePreloads(deps, { hostType: 'html', hostId: 'index.html' })).toEqual([
      'assets/vendor-abc.js',
    ]);
    expect(filterLazyChunkModulePreloads(deps, { hostType: 'js', hostId: 'game/core/main.js' })).toEqual(deps);
  });

  it('keeps status data and status utils with the combat presentation chunk to avoid overlay chunk cycles', () => {
    expect(getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/data/status_key_data.js')).toBe('ui-combat');
    expect(getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/utils/status_value_utils.js')).toBe('ui-combat');
  });

  it('routes shared combat copy data into its own shared chunk', () => {
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/combat/presentation/browser/combat_copy.js'),
    ).toBe('ui-combat-copy');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/combat/presentation/browser/combat_relic_rail_ui.js'),
    ).toBe('ui-combat-relics');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/combat/presentation/browser/item_tooltip_fallback_text.js'),
    ).toBe('ui-combat-relics');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/combat/presentation/browser/item_detail_panel_ui.js'),
    ).toBe('ui-combat-relics');
  });

  it('keeps shared item-detail surface helpers out of the combat presentation chunk to avoid circular chunk imports', () => {
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/shared/ui/item_detail/item_detail_panel_ui.js'),
    ).toBe('ui-shared-surfaces');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/shared/ui/state/ui_surface_state_controller.js'),
    ).toBe('ui-shared-surfaces');
  });

  it('keeps SettingsManager in a dedicated settings-support chunk so shell overlays do not own settings persistence code', () => {
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/core/settings_manager.js'),
    ).toBe('ui-settings-core');
  });

  it('splits settings keybinding and rebind helpers away from the main settings chunk', () => {
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/ui/presentation/browser/settings_ui_keybinding_helpers.js'),
    ).toBe('ui-settings-hotkeys');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/ui/presentation/browser/settings_ui_runtime_helpers.js'),
    ).toBe('ui-settings-hotkeys');
  });

  it('splits help/pause hotkey helpers away from the main shell overlay chunk', () => {
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/ui/presentation/browser/help_pause_keybinding_helpers.js'),
    ).toBe('ui-shell-hotkeys');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/ui/presentation/browser/help_pause_run_hotkey_state.js'),
    ).toBe('ui-shell-hotkeys');
    expect(
      getManualChunk('/mnt/c/Users/mjuik/RoguelikeRPG/game/features/ui/presentation/browser/help_pause_visibility.js'),
    ).toBe('ui-shell-hotkeys');
  });

  it('uses narrow title capability surfaces instead of the broad public application barrel in overlay-related runtimes', () => {
    const endingActionHelpers = readText('game/features/ui/presentation/browser/ending_screen_action_helpers.js');
    const metaProgressionRuntime = readText('game/features/ui/presentation/browser/meta_progression_ui_runtime.js');
    const hiddenEndingRender = readText('game/features/ui/presentation/browser/story_ui_hidden_ending_render.js');
    const helpPauseAbandonRuntime = readText('game/features/ui/presentation/browser/help_pause_ui_abandon_runtime.js');
    const helpPauseReturnRuntime = readText('game/features/ui/presentation/browser/help_pause_ui_return_runtime.js');
    const helpPauseMenuRuntime = readText('game/features/ui/presentation/browser/help_pause_menu_runtime_ui.js');
    const shellContracts = readText('game/features/ui/ports/contracts/build_ui_shell_contracts.js');
    const runRules = readText('game/features/run/application/run_rules.js');
    const rewardOptions = readText('game/features/reward/application/build_reward_options_use_case.js');

    expect(endingActionHelpers).toContain("../../../title/ports/public_ending_application_capabilities.js");
    expect(metaProgressionRuntime).toContain("../../../title/ports/public_ending_application_capabilities.js");
    expect(hiddenEndingRender).toContain("../../../title/ports/public_ending_application_capabilities.js");

    expect(helpPauseAbandonRuntime).toContain("../../../title/ports/public_help_pause_application_capabilities.js");
    expect(helpPauseReturnRuntime).toContain("../../../title/ports/public_help_pause_application_capabilities.js");
    expect(helpPauseMenuRuntime).toContain("../../../title/ports/public_help_pause_application_capabilities.js");
    expect(shellContracts).toContain("../../../title/ports/public_help_pause_application_capabilities.js");

    expect(runRules).toContain("../../title/ports/public_progression_capabilities.js");
    expect(rewardOptions).toContain("../../title/ports/public_progression_capabilities.js");

    expect(endingActionHelpers).not.toContain('public_application_capabilities.js');
    expect(metaProgressionRuntime).not.toContain('public_application_capabilities.js');
    expect(hiddenEndingRender).not.toContain('public_application_capabilities.js');
    expect(helpPauseAbandonRuntime).not.toContain('public_application_capabilities.js');
    expect(helpPauseReturnRuntime).not.toContain('public_application_capabilities.js');
    expect(helpPauseMenuRuntime).not.toContain('public_application_capabilities.js');
    expect(shellContracts).not.toContain('public_application_capabilities.js');
    expect(runRules).not.toContain('public_application_capabilities.js');
    expect(rewardOptions).not.toContain('public_application_capabilities.js');
  });

  it('targets canonical feature-owned browser paths instead of transitional ui/presentation screen paths', () => {
    const source = readText('vite.config.js');

    expect(source).toContain("/game/features/event/presentation/browser/");
    expect(source).toContain("/game/features/reward/presentation/browser/");
    expect(source).not.toContain("/game/presentation/screens/event_");
    expect(source).not.toContain("/game/ui/screens/event_");
    expect(source).not.toContain("/game/presentation/screens/reward_");
    expect(source).not.toContain("/game/ui/screens/reward_");
  });
});
