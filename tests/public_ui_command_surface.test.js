import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  createLegacyUiCommandFacade: vi.fn(),
}));

vi.mock('../game/features/ui/ports/runtime/public_ui_runtime_surface.js', () => ({
  createLegacyUiCommandFacade: hoisted.createLegacyUiCommandFacade,
}));

import { createPublicLegacyUiCommands } from '../game/features/ui/platform/public_ui_command_surface.js';

describe('public_ui_command_surface', () => {
  it('delegates legacy ui command facade assembly to the ui runtime public surface', () => {
    const facade = {
      toggleHudPin: vi.fn(),
      closeDeckView: vi.fn(),
      closeCodex: vi.fn(),
    };
    hoisted.createLegacyUiCommandFacade.mockReturnValueOnce(facade);

    const result = createPublicLegacyUiCommands({
      getModule: vi.fn(),
      getUiRuntimeDeps: vi.fn(),
      getCombatRuntimeDeps: vi.fn(),
      warn: vi.fn(),
    });

    expect(result).toBe(facade);
    expect(hoisted.createLegacyUiCommandFacade).toHaveBeenCalledWith({
      getModule: expect.any(Function),
      getUiRuntimeDeps: expect.any(Function),
      getCombatRuntimeDeps: expect.any(Function),
      warn: expect.any(Function),
    });
  });
});
