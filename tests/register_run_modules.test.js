import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  buildRunMapModules: vi.fn(() => ({ MapUI: { id: 'map' }, MazeSystem: { id: 'maze' } })),
  buildRunFlowModules: vi.fn(() => ({ RunModeUI: { id: 'mode' }, RunStartUI: { id: 'start' } })),
}));

vi.mock('../game/platform/browser/composition/build_run_map_modules.js', () => ({
  buildRunMapModules: hoisted.buildRunMapModules,
}));

vi.mock('../game/platform/browser/composition/build_run_flow_modules.js', () => ({
  buildRunFlowModules: hoisted.buildRunFlowModules,
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
    expect(hoisted.buildRunMapModules).toHaveBeenCalledTimes(1);
    expect(hoisted.buildRunFlowModules).toHaveBeenCalledTimes(1);
  });
});
