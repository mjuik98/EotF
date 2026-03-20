import { describe, expect, it } from 'vitest';

import { ensureSettingsBrowserModules } from '../game/features/ui/platform/browser/ensure_settings_browser_modules.js';

describe('ui browser module resolution', () => {
  it('prefers screen-scoped SettingsUI over stale top-level aliases', async () => {
    const scopedSettingsUI = { id: 'scoped-settings-ui' };
    const modules = {
      SettingsUI: { id: 'stale-settings-ui' },
      featureScopes: {
        screen: {
          SettingsUI: scopedSettingsUI,
        },
      },
    };

    await expect(ensureSettingsBrowserModules(modules)).resolves.toEqual({
      SettingsUI: scopedSettingsUI,
    });
  });
});
