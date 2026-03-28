import { beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  buildScreenScenePrimaryModules: vi.fn(() => ({
    ScreenUI: { id: 'screen-public' },
  })),
  buildScreenSceneOverlayModules: vi.fn(() => ({
    MetaProgressionUI: { id: 'meta-public' },
    HelpPauseUI: { id: 'help-public' },
    SettingsUI: { id: 'settings-public' },
  })),
}));

vi.mock('../game/features/ui/ports/public_scene_module_capabilities.js', () => ({
  buildScreenScenePrimaryModules: hoisted.buildScreenScenePrimaryModules,
  buildScreenSceneOverlayModules: hoisted.buildScreenSceneOverlayModules,
}));

import { buildScreenPrimaryModules } from '../game/platform/browser/composition/build_screen_primary_modules.js';
import { buildScreenOverlayModules } from '../game/platform/browser/composition/build_screen_overlay_modules.js';

describe('composition module assembly', () => {
  beforeEach(() => {
    hoisted.buildScreenScenePrimaryModules.mockClear();
    hoisted.buildScreenSceneOverlayModules.mockClear();
  });

  it('routes only screen shell modules through the narrow scene-module port', () => {
    expect(buildScreenPrimaryModules()).toEqual({
      ScreenUI: { id: 'screen-public' },
    });
    expect(hoisted.buildScreenScenePrimaryModules).toHaveBeenCalledTimes(1);
    expect(hoisted.buildScreenSceneOverlayModules).not.toHaveBeenCalled();
  });

  it('routes overlay modules through the narrow scene-module port', () => {
    expect(buildScreenOverlayModules()).toEqual({
      MetaProgressionUI: { id: 'meta-public' },
      HelpPauseUI: { id: 'help-public' },
      SettingsUI: { id: 'settings-public' },
    });
    expect(hoisted.buildScreenSceneOverlayModules).toHaveBeenCalledTimes(1);
    expect(hoisted.buildScreenScenePrimaryModules).not.toHaveBeenCalled();
  });
});
