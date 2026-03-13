import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  createUiModuleCapabilities: vi.fn(() => ({
    overlays: {
      MetaProgressionUI: { id: 'meta-public' },
      HelpPauseUI: { id: 'help-public' },
      SettingsUI: { id: 'settings-public' },
    },
  })),
}));

vi.mock('../game/features/ui/ports/public_module_capabilities.js', () => ({
  createUiModuleCapabilities: hoisted.createUiModuleCapabilities,
}));

import { buildScreenOverlayModules } from '../game/platform/browser/composition/build_screen_overlay_modules.js';

describe('buildScreenOverlayModules', () => {
  it('routes overlay modules through the ui module-capability port', () => {
    expect(buildScreenOverlayModules()).toEqual({
      MetaProgressionUI: { id: 'meta-public' },
      HelpPauseUI: { id: 'help-public' },
      SettingsUI: { id: 'settings-public' },
    });
    expect(hoisted.createUiModuleCapabilities).toHaveBeenCalledTimes(1);
  });
});
