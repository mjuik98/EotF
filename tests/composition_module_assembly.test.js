import { beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  createUiModuleCapabilities: vi.fn(() => ({
    primary: {
      ScreenUI: { id: 'screen-public' },
    },
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

import { buildScreenPrimaryModules } from '../game/platform/browser/composition/build_screen_primary_modules.js';
import { buildScreenOverlayModules } from '../game/platform/browser/composition/build_screen_overlay_modules.js';

describe('composition module assembly', () => {
  beforeEach(() => {
    hoisted.createUiModuleCapabilities.mockClear();
  });

  it('routes only screen shell modules through the ui module capability export', () => {
    expect(buildScreenPrimaryModules()).toEqual({
      ScreenUI: { id: 'screen-public' },
    });
    expect(hoisted.createUiModuleCapabilities).toHaveBeenCalledTimes(1);
  });

  it('routes overlay modules through narrow ui module capability exports', () => {
    expect(buildScreenOverlayModules()).toEqual({
      MetaProgressionUI: { id: 'meta-public' },
      HelpPauseUI: { id: 'help-public' },
      SettingsUI: { id: 'settings-public' },
    });
    expect(hoisted.createUiModuleCapabilities).toHaveBeenCalledTimes(1);
  });
});
