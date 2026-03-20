import { describe, expect, it } from 'vitest';

import { ensureRunFlowBrowserModules } from '../game/features/run/platform/browser/ensure_run_flow_browser_modules.js';

describe('run browser module resolution', () => {
  it('prefers run-scoped RunModeUI over stale top-level aliases', async () => {
    const scopedRunModeUI = { id: 'scoped-run-mode-ui' };
    const modules = {
      RunModeUI: { id: 'stale-run-mode-ui' },
      featureScopes: {
        run: {
          RunModeUI: scopedRunModeUI,
        },
      },
    };

    await expect(ensureRunFlowBrowserModules(modules)).resolves.toEqual({
      RunModeUI: scopedRunModeUI,
    });
  });
});
