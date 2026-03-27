import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  buildCharacterSelectMountPayload: vi.fn(() => ({ mounted: true })),
  ensureCharacterSelectShell: vi.fn(),
  getModuleRegistryScope: vi.fn((modules, scope) => modules[scope]),
}));

vi.mock('../game/features/frontdoor/ports/runtime/public_frontdoor_runtime_surface.js', () => ({
  buildCharacterSelectMountPayload: hoisted.buildCharacterSelectMountPayload,
  ensureCharacterSelectShell: hoisted.ensureCharacterSelectShell,
}));

vi.mock('../game/core/bindings/module_registry_scopes.js', () => ({
  getModuleRegistryScope: hoisted.getModuleRegistryScope,
}));

import { mountCharacterSelect } from '../game/core/bootstrap/mount_character_select.js';

describe('mountCharacterSelect', () => {
  it('ensures the character-select shell before mounting the presentation runtime', () => {
    const doc = { getElementById: vi.fn() };
    const CharacterSelectUI = { mount: vi.fn() };
    const modules = {
      core: {
        AudioEngine: { resume: vi.fn() },
        GS: { currentScreen: 'title' },
      },
      run: {
        SaveSystem: { load: vi.fn() },
      },
      title: {
        CharacterSelectUI,
      },
    };
    const deps = { dep: true };
    const fns = { fn: true };

    mountCharacterSelect({ modules, deps, fns, doc });

    expect(hoisted.ensureCharacterSelectShell).toHaveBeenCalledWith(doc);
    expect(hoisted.buildCharacterSelectMountPayload).toHaveBeenCalledWith({
      gs: modules.core.GS,
      audioEngine: modules.core.AudioEngine,
      saveSystem: modules.run.SaveSystem,
      deps,
      fns,
      doc,
    });
    expect(CharacterSelectUI.mount).toHaveBeenCalledWith({ mounted: true });
  });
});
