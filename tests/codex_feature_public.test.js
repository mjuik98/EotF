import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  buildCodexPrimaryModuleCatalog: vi.fn(() => ({ CodexUI: { id: 'codex-public' } })),
}));

vi.mock('../game/features/codex/modules/codex_module_catalog.js', () => ({
  buildCodexPrimaryModuleCatalog: hoisted.buildCodexPrimaryModuleCatalog,
}));

import { createCodexFeatureFacade } from '../game/features/codex/public.js';

describe('codex feature public facade', () => {
  it('exposes codex screen modules through a single feature boundary', () => {
    const facade = createCodexFeatureFacade();

    expect(facade.moduleCapabilities.primary).toEqual({ CodexUI: { id: 'codex-public' } });
    expect(hoisted.buildCodexPrimaryModuleCatalog).toHaveBeenCalledTimes(1);
  });
});
