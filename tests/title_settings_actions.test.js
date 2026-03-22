import { beforeEach, describe, expect, it, vi } from 'vitest';

const { ensureFlow, lazyRunModeUi } = vi.hoisted(() => ({
  ensureFlow: vi.fn(),
  lazyRunModeUi: {
    openSettings: vi.fn(),
    closeSettings: vi.fn(),
  },
}));

const lazySettingsUi = {
  openSettings: vi.fn(),
  closeSettings: vi.fn(),
};

vi.mock('../game/features/run/ports/public_browser_modules.js', () => ({
  createRunBrowserModuleCapabilities: () => ({
    ensureFlow,
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
    ensureFlow.mockReset();
    ensureFlow.mockResolvedValue({ RunModeUI: lazyRunModeUi });
    lazyRunModeUi.openSettings.mockReset();
    lazyRunModeUi.closeSettings.mockReset();
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

  it('closes run settings through the lazily loaded run mode ui after opening it', async () => {
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

    await actions.openRunSettings();
    actions.closeRunSettings();

    expect(lazyRunModeUi.openSettings).toHaveBeenCalledWith({ source: 'run-mode-deps' });
    expect(lazyRunModeUi.closeSettings).toHaveBeenCalledWith({ source: 'run-mode-deps' });
  });
});
