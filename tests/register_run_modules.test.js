import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  createRunFeatureFacade: vi.fn(() => ({
    moduleCapabilities: {
      map: { MapUI: { id: 'map' }, MazeSystem: { id: 'maze' } },
      flow: { RunModeUI: { id: 'mode' }, RunStartUI: { id: 'start' } },
    },
  })),
}));

vi.mock('../game/features/run/public.js', () => ({
  createRunFeatureFacade: hoisted.createRunFeatureFacade,
}));

import { registerRunModules } from '../game/platform/browser/composition/register_run_modules.js';

describe('registerRunModules', () => {
  it('merges map/runtime modules and run flow modules', () => {
    expect(registerRunModules()).toEqual({
      MapUI: { id: 'map' },
      MazeSystem: { id: 'maze' },
      RunModeUI: { id: 'mode' },
      RunStartUI: { id: 'start' },
    });
    expect(hoisted.createRunFeatureFacade).toHaveBeenCalledTimes(1);
  });
});
