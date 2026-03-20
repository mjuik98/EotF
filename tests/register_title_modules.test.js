import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  createTitleModuleCapabilities: vi.fn(() => ({
    canvas: { TitleCanvasUI: { id: 'title-canvas' } },
    flow: { ClassSelectUI: { id: 'class-select' }, GameBootUI: { id: 'boot' } },
  })),
}));

vi.mock('../game/features/title/ports/public_module_capabilities.js', () => ({
  createTitleModuleCapabilities: hoisted.createTitleModuleCapabilities,
}));

import { registerTitleModules } from '../game/platform/browser/composition/register_title_modules.js';

describe('registerTitleModules', () => {
  it('merges title module capability slices directly from the title feature port', () => {
    expect(registerTitleModules()).toEqual({
      TitleCanvasUI: { id: 'title-canvas' },
      ClassSelectUI: { id: 'class-select' },
      GameBootUI: { id: 'boot' },
    });
    expect(hoisted.createTitleModuleCapabilities).toHaveBeenCalledTimes(1);
  });
});
