import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  StoreGS: { token: 'store-gs' },
}));

vi.mock('../game/core/store/public.js', () => ({
  GS: hoisted.StoreGS,
}));

import { buildCoreEngineModules } from '../game/platform/browser/composition/build_core_engine_modules.js';

describe('buildCoreEngineModules', () => {
  it('sources GS from the core store public surface', () => {
    const modules = buildCoreEngineModules();

    expect(modules.GS).toBe(hoisted.StoreGS);
  });
});
