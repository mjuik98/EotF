import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  createTitleFeatureFacade: vi.fn(() => ({
    modules: {
      canvas: { TitleCanvasUI: { id: 'title-canvas' } },
      flow: { ClassSelectUI: { id: 'class-select' }, GameBootUI: { id: 'boot' } },
    },
  })),
}));

vi.mock('../game/features/title/public.js', () => ({
  createTitleFeatureFacade: hoisted.createTitleFeatureFacade,
}));

import { registerTitleModules } from '../game/platform/browser/composition/register_title_modules.js';

describe('registerTitleModules', () => {
  it('merges title canvas modules and title flow modules', () => {
    expect(registerTitleModules()).toEqual({
      TitleCanvasUI: { id: 'title-canvas' },
      ClassSelectUI: { id: 'class-select' },
      GameBootUI: { id: 'boot' },
    });
    expect(hoisted.createTitleFeatureFacade).toHaveBeenCalledTimes(1);
  });
});
