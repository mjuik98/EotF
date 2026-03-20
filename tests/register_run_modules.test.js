import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  createRunModuleCapabilities: vi.fn(() => ({
    map: { MapUI: { id: 'map' }, MazeSystem: { id: 'maze' } },
    flow: { RunModeUI: { id: 'mode' }, RunStartUI: { id: 'start' } },
  })),
}));

vi.mock('../game/features/run/ports/public_module_capabilities.js', () => ({
  createRunModuleCapabilities: hoisted.createRunModuleCapabilities,
}));

import { registerRunModules } from '../game/platform/browser/composition/register_run_modules.js';

describe('registerRunModules', () => {
  it('merges run module capability slices directly from the run feature port', () => {
    expect(registerRunModules()).toEqual({
      MapUI: { id: 'map' },
      MazeSystem: { id: 'maze' },
      RunModeUI: { id: 'mode' },
      RunStartUI: { id: 'start' },
    });
    expect(hoisted.createRunModuleCapabilities).toHaveBeenCalledTimes(1);
  });
});
