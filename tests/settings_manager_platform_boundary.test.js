import { describe, expect, it } from 'vitest';

import { readText } from './helpers/guardrail_fs.js';

describe('settings manager platform boundary', () => {
  it('keeps browser settings persistence canonically owned by platform/browser', () => {
    const coreCompatSource = readText('game/core/settings_manager.js');
    const platformSource = readText('game/platform/browser/settings/settings_manager.js');

    expect(coreCompatSource).toContain("../platform/browser/settings/settings_manager.js");
    expect(coreCompatSource).not.toContain('localStorage.getItem');
    expect(platformSource).toContain('localStorage.getItem');
    expect(platformSource).toContain('localStorage.setItem');
  });

  it('routes direct settings consumers to the platform-owned module', () => {
    const featureSettingsAdapter = readText('game/features/ui/platform/browser/settings_manager.js');
    const settingsRuntime = readText('game/features/ui/presentation/browser/settings_ui_runtime.js');
    const settingsHelpers = readText('game/features/ui/presentation/browser/settings_ui_helpers.js');
    const settingsApplyHelpers = readText('game/features/ui/presentation/browser/settings_ui_apply_helpers.js');
    const settingsKeybindingHelpers = readText('game/features/ui/presentation/browser/settings_ui_keybinding_helpers.js');
    const helpPauseKeybindingHelpers = readText('game/features/ui/presentation/browser/help_pause_keybinding_helpers.js');
    const rootBindings = readText('game/platform/browser/bindings/root_bindings.js');

    expect(featureSettingsAdapter).toContain("../../../../platform/browser/settings/settings_manager.js");
    expect(settingsRuntime).toContain("../../platform/browser/settings_manager.js");
    expect(settingsHelpers).toContain("../../platform/browser/settings_manager.js");
    expect(settingsApplyHelpers).toContain("../../platform/browser/settings_manager.js");
    expect(settingsKeybindingHelpers).toContain("../../platform/browser/settings_manager.js");
    expect(helpPauseKeybindingHelpers).toContain("../../platform/browser/settings_manager.js");
    expect(rootBindings).toContain("../settings/settings_manager.js");
  });
});
