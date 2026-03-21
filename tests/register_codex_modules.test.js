import { describe, expect, it, vi } from 'vitest';

import { registerCodexModules } from '../game/platform/browser/composition/register_codex_modules.js';

describe('registerCodexModules', () => {
  it('publishes a lazy codex facade instead of eagerly importing the full codex screen module', () => {
    const { CodexUI } = registerCodexModules();

    expect(CodexUI).toMatchObject({
      __lazyModule: true,
      openCodex: expect.any(Function),
      closeCodex: expect.any(Function),
      setCodexTab: expect.any(Function),
      renderCodexContent: expect.any(Function),
    });
  });
});
