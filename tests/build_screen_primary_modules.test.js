import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  createUiModuleCapabilities: vi.fn(() => ({
    primary: {
      ScreenUI: { id: 'screen-public' },
    },
  })),
}));

vi.mock('../game/features/ui/ports/public_module_capabilities.js', () => ({
  createUiModuleCapabilities: hoisted.createUiModuleCapabilities,
}));

import { buildScreenPrimaryModules } from '../game/platform/browser/composition/build_screen_primary_modules.js';

describe('buildScreenPrimaryModules', () => {
  it('routes only screen shell modules through the ui module capability export', () => {
    expect(buildScreenPrimaryModules()).toEqual({
      ScreenUI: { id: 'screen-public' },
    });
    expect(hoisted.createUiModuleCapabilities).toHaveBeenCalledTimes(1);
  });
});
