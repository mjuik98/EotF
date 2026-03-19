import { describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const hoisted = vi.hoisted(() => ({
  buildCodexPrimaryModuleCatalog: vi.fn(() => ({ CodexUI: { id: 'codex-public' } })),
}));

vi.mock('../game/features/codex/modules/codex_module_catalog.js', () => ({
  buildCodexPrimaryModuleCatalog: hoisted.buildCodexPrimaryModuleCatalog,
}));

import {
  CodexPublicSurface,
  createCodexModuleCapabilities,
} from '../game/features/codex/public.js';

describe('codex feature public surface', () => {
  it('exposes codex screen modules through narrow capability exports', () => {
    const capabilities = createCodexModuleCapabilities();

    expect(capabilities.primary).toEqual({ CodexUI: { id: 'codex-public' } });
    expect(CodexPublicSurface.createCodexModuleCapabilities().primary).toEqual({ CodexUI: { id: 'codex-public' } });
    expect(hoisted.buildCodexPrimaryModuleCatalog).toHaveBeenCalledTimes(2);
  });

  it('does not export a grouped codex feature facade helper', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/features/codex/ports/public_surface.js'),
      'utf8',
    );

    expect(source).not.toContain('createCodexFeatureFacade');
  });
});
