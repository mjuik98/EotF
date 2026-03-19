import { describe, expect, it, vi } from 'vitest';

import { executeLegacySurfaceRegistration } from '../game/core/bootstrap/execute_legacy_surface_registration.js';

describe('executeLegacySurfaceRegistration', () => {
  it('initializes the legacy bridge through the explicit legacy module bag', () => {
    const init = vi.fn();
    const exposeGlobals = vi.fn();
    const modules = {
      GAME: { init: vi.fn() },
      legacyModules: {
        GAME: { init },
      },
      exposeGlobals,
    };
    const payload = {
      initArgs: [{ id: 'gs' }, { id: 'data' }],
      globals: { GAME: { id: 'compat' } },
    };

    executeLegacySurfaceRegistration({ modules, payload });

    expect(init).toHaveBeenCalledWith(...payload.initArgs);
    expect(modules.GAME.init).not.toHaveBeenCalled();
    expect(exposeGlobals).toHaveBeenCalledWith(payload.globals);
  });
});
