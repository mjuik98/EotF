import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  buildScreenPrimaryModules: vi.fn(() => ({ ScreenUI: { id: 'screen' }, EventUI: { id: 'event' } })),
  buildScreenOverlayModules: vi.fn(() => ({ HelpPauseUI: { id: 'help' }, SettingsUI: { id: 'settings' } })),
}));

vi.mock('../game/platform/browser/composition/build_screen_primary_modules.js', () => ({
  buildScreenPrimaryModules: hoisted.buildScreenPrimaryModules,
}));

vi.mock('../game/platform/browser/composition/build_screen_overlay_modules.js', () => ({
  buildScreenOverlayModules: hoisted.buildScreenOverlayModules,
}));

import { registerScreenModules } from '../game/platform/browser/composition/register_screen_modules.js';

describe('registerScreenModules', () => {
  it('merges primary screen modules and overlay/meta modules', () => {
    expect(registerScreenModules()).toEqual({
      ScreenUI: { id: 'screen' },
      EventUI: { id: 'event' },
      HelpPauseUI: { id: 'help' },
      SettingsUI: { id: 'settings' },
    });
    expect(hoisted.buildScreenPrimaryModules).toHaveBeenCalledTimes(1);
    expect(hoisted.buildScreenOverlayModules).toHaveBeenCalledTimes(1);
  });
});
