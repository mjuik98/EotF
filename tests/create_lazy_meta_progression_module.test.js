import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  importMetaProgressionModule: vi.fn(async () => ({
    MetaProgressionUI: {
      selectFragment: vi.fn(),
      restartFromEnding: vi.fn(),
    },
  })),
}));

vi.mock('../game/features/ui/platform/browser/import_meta_progression_module.js', () => ({
  importMetaProgressionModule: hoisted.importMetaProgressionModule,
}));

import { createLazyMetaProgressionModule } from '../game/features/ui/platform/browser/create_lazy_meta_progression_module.js';

describe('createLazyMetaProgressionModule', () => {
  it('loads the meta progression module once and forwards calls', async () => {
    const lazyModule = createLazyMetaProgressionModule();

    await lazyModule.selectFragment('echo_boost', { token: 'deps' });
    await lazyModule.restartFromEnding({ token: 'deps' });

    expect(hoisted.importMetaProgressionModule).toHaveBeenCalledTimes(1);
    const { MetaProgressionUI } = await hoisted.importMetaProgressionModule.mock.results[0].value;
    expect(MetaProgressionUI.selectFragment).toHaveBeenCalledWith('echo_boost', { token: 'deps' });
    expect(MetaProgressionUI.restartFromEnding).toHaveBeenCalledWith({ token: 'deps' });
  });
});
