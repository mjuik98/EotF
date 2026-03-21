import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  importHelpPauseModule: vi.fn(async () => ({
    HelpPauseUI: {
      toggleHelp: vi.fn(),
      togglePause: vi.fn(),
    },
  })),
}));

vi.mock('../game/features/ui/platform/browser/import_help_pause_module.js', () => ({
  importHelpPauseModule: hoisted.importHelpPauseModule,
}));

import { createLazyHelpPauseModule } from '../game/features/ui/platform/browser/create_lazy_help_pause_module.js';

describe('createLazyHelpPauseModule', () => {
  it('loads the help/pause module once and forwards calls', async () => {
    const lazyModule = createLazyHelpPauseModule();

    await lazyModule.toggleHelp({ doc: { id: 'doc' } });
    await lazyModule.togglePause({ doc: { id: 'doc' } });

    expect(hoisted.importHelpPauseModule).toHaveBeenCalledTimes(1);
    const { HelpPauseUI } = await hoisted.importHelpPauseModule.mock.results[0].value;
    expect(HelpPauseUI.toggleHelp).toHaveBeenCalledWith({ doc: { id: 'doc' } });
    expect(HelpPauseUI.togglePause).toHaveBeenCalledWith({ doc: { id: 'doc' } });
  });
});
