import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  createUiFeatureFacade: vi.fn(() => ({
    moduleCapabilities: {
      overlays: {
        MetaProgressionUI: { id: 'meta-public' },
        HelpPauseUI: { id: 'help-public' },
        SettingsUI: { id: 'settings-public' },
      },
    },
  })),
}));

vi.mock('../game/features/ui/public.js', () => ({
  createUiFeatureFacade: hoisted.createUiFeatureFacade,
}));

import { buildScreenOverlayModules } from '../game/platform/browser/composition/build_screen_overlay_modules.js';

describe('buildScreenOverlayModules', () => {
  it('routes overlay modules through the ui feature public facade', () => {
    expect(buildScreenOverlayModules()).toEqual({
      MetaProgressionUI: { id: 'meta-public' },
      HelpPauseUI: { id: 'help-public' },
      SettingsUI: { id: 'settings-public' },
    });
    expect(hoisted.createUiFeatureFacade).toHaveBeenCalledTimes(1);
  });
});
