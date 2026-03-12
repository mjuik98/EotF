import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  buildRunMapPublicModules: vi.fn(() => ({ MapUI: { id: 'map' }, MazeSystem: { id: 'maze' } })),
  buildRunFlowPublicModules: vi.fn(() => ({ RunModeUI: { id: 'mode' }, RunStartUI: { id: 'start' } })),
}));

vi.mock('../game/features/run/modules/public_run_modules.js', () => ({
  buildRunMapPublicModules: hoisted.buildRunMapPublicModules,
  buildRunFlowPublicModules: hoisted.buildRunFlowPublicModules,
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
    expect(hoisted.buildRunMapPublicModules).toHaveBeenCalledTimes(1);
    expect(hoisted.buildRunFlowPublicModules).toHaveBeenCalledTimes(1);
  });
});
