import { beforeEach, describe, expect, it, vi } from 'vitest';

const lazySettingsUi = {
  openSettings: vi.fn(),
  closeSettings: vi.fn(),
};

vi.mock('../game/features/run/ports/public_browser_modules.js', () => ({
  createRunBrowserModuleCapabilities: () => ({
    ensureFlow: vi.fn(),
  }),
}));

vi.mock('../game/features/ui/public.js', () => ({
  createUiBrowserModuleCapabilities: () => ({
    ensureSettings: vi.fn(async () => ({ SettingsUI: lazySettingsUi })),
  }),
}));

import { createTitleSettingsActions } from '../game/features/title/app/title_settings_actions.js';

describe('createTitleSettingsActions', () => {
  beforeEach(() => {
    lazySettingsUi.openSettings.mockReset();
    lazySettingsUi.closeSettings.mockReset();
  });

  it('closes title settings through the lazily loaded settings ui after opening it', async () => {
    const ports = {
      getSettingsDeps: vi.fn(() => ({ source: 'settings-deps' })),
      getRunModeDeps: vi.fn(() => ({ source: 'run-mode-deps' })),
      getMetaProgressionDeps: vi.fn(() => ({})),
      getRegionTransitionDeps: vi.fn(() => ({})),
    };
    const actions = createTitleSettingsActions({
      doc: null,
      modules: {},
      moduleRegistry: {},
      ports,
      saveVolumes: vi.fn(),
      playClick: vi.fn(),
    });

    await actions.openSettings();
    actions.closeSettings();

    expect(lazySettingsUi.openSettings).toHaveBeenCalledWith({ source: 'settings-deps' });
    expect(lazySettingsUi.closeSettings).toHaveBeenCalledWith({ source: 'settings-deps' });
  });
});
