import { describe, expect, it, vi } from 'vitest';

import { createLegacyUiCommandFacade } from '../game/features/ui/ports/runtime/public_ui_runtime_surface.js';

describe('ui runtime surface', () => {
  it('warns through the injected logger when a legacy ui command is missing', () => {
    const logger = { warn: vi.fn() };
    const facade = createLegacyUiCommandFacade({
      getModule: vi.fn(() => null),
      getUiRuntimeDeps: vi.fn(() => ({ token: 'ui' })),
      getCombatRuntimeDeps: vi.fn(() => ({ token: 'combat' })),
      logger,
    });

    facade.closeDeckView();

    expect(logger.warn).toHaveBeenCalledWith('[API] DeckModalUI.closeDeckView not available');
  });
});
