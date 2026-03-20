import { describe, expect, it } from 'vitest';

import { ensureCodexBrowserModules } from '../game/features/codex/platform/browser/ensure_codex_browser_modules.js';

describe('codex browser module resolution', () => {
  it('prefers codex-scoped CodexUI over stale top-level aliases', async () => {
    const scopedCodexUI = { id: 'scoped-codex-ui' };
    const modules = {
      CodexUI: { id: 'stale-codex-ui' },
      featureScopes: {
        codex: {
          CodexUI: scopedCodexUI,
        },
      },
    };

    await expect(ensureCodexBrowserModules(modules)).resolves.toEqual({
      CodexUI: scopedCodexUI,
    });
  });
});
