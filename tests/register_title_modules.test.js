import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  buildTitleCanvasModules: vi.fn(() => ({ TitleCanvasUI: { id: 'title-canvas' } })),
  buildTitleFlowModules: vi.fn(() => ({ ClassSelectUI: { id: 'class-select' }, GameBootUI: { id: 'boot' } })),
}));

vi.mock('../game/platform/browser/composition/build_title_canvas_modules.js', () => ({
  buildTitleCanvasModules: hoisted.buildTitleCanvasModules,
}));

vi.mock('../game/platform/browser/composition/build_title_flow_modules.js', () => ({
  buildTitleFlowModules: hoisted.buildTitleFlowModules,
}));

import { registerTitleModules } from '../game/platform/browser/composition/register_title_modules.js';

describe('registerTitleModules', () => {
  it('merges title canvas modules and title flow modules', () => {
    expect(registerTitleModules()).toEqual({
      TitleCanvasUI: { id: 'title-canvas' },
      ClassSelectUI: { id: 'class-select' },
      GameBootUI: { id: 'boot' },
    });
    expect(hoisted.buildTitleCanvasModules).toHaveBeenCalledTimes(1);
    expect(hoisted.buildTitleFlowModules).toHaveBeenCalledTimes(1);
  });
});
