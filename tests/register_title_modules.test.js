import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  buildTitleCanvasPublicModules: vi.fn(() => ({ TitleCanvasUI: { id: 'title-canvas' } })),
  buildTitlePublicModules: vi.fn(() => ({ ClassSelectUI: { id: 'class-select' }, GameBootUI: { id: 'boot' } })),
}));

vi.mock('../game/features/title/public.js', () => ({
  buildTitleCanvasPublicModules: hoisted.buildTitleCanvasPublicModules,
  buildTitlePublicModules: hoisted.buildTitlePublicModules,
}));

import { registerTitleModules } from '../game/platform/browser/composition/register_title_modules.js';

describe('registerTitleModules', () => {
  it('merges title canvas modules and title flow modules', () => {
    expect(registerTitleModules()).toEqual({
      TitleCanvasUI: { id: 'title-canvas' },
      ClassSelectUI: { id: 'class-select' },
      GameBootUI: { id: 'boot' },
    });
    expect(hoisted.buildTitleCanvasPublicModules).toHaveBeenCalledTimes(1);
    expect(hoisted.buildTitlePublicModules).toHaveBeenCalledTimes(1);
  });
});
