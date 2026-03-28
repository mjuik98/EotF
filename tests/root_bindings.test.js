import { describe, expect, it, vi } from 'vitest';

const {
  loadSpy,
  setSpy,
  registerFrontdoorBindingsSpy,
  registerRunEntryBindingsSpy,
} = vi.hoisted(() => ({
  loadSpy: vi.fn(() => ({
    volumes: {
      master: 0.4,
      sfx: 0.5,
      ambient: 0.6,
    },
  })),
  setSpy: vi.fn(),
  registerFrontdoorBindingsSpy: vi.fn(),
  registerRunEntryBindingsSpy: vi.fn(),
}));

vi.mock('../game/platform/browser/settings/settings_manager.js', () => ({
  SettingsManager: {
    load: loadSpy,
    set: setSpy,
  },
}));

vi.mock('../game/features/frontdoor/ports/runtime/public_frontdoor_runtime_surface.js', () => ({
  registerFrontdoorBindings: registerFrontdoorBindingsSpy,
}));

vi.mock('../game/features/run/ports/runtime/public_run_runtime_surface.js', () => ({
  registerRunEntryBindings: registerRunEntryBindingsSpy,
}));

import { RootBindings } from '../game/platform/browser/bindings/root_bindings.js';

function createDoc() {
  const slider = { value: '', style: { setProperty: vi.fn() } };
  const value = { textContent: '' };
  const icon = { textContent: '' };
  const listeners = new Map();
  const defaultView = {
    addEventListener: vi.fn((type, handler) => {
      listeners.set(type, handler);
    }),
    dispatchEvent: (type, event) => listeners.get(type)?.(event),
  };
  return {
    defaultView,
    addEventListener: vi.fn((type, handler) => {
      listeners.set(type, handler);
    }),
    dispatchEvent: (type, event) => listeners.get(type)?.(event),
    getElementById: vi.fn(() => null),
    querySelectorAll: vi.fn((selector) => {
      if (selector.includes('master-val')) return [value];
      if (selector.includes('sfx-val')) return [value];
      if (selector.includes('ambient-val')) return [value];
      if (selector.includes('master-slider')) return [slider];
      if (selector.includes('sfx-slider')) return [slider];
      if (selector.includes('ambient-slider')) return [slider];
      if (selector.includes('master-icon')) return [icon];
      if (selector.includes('sfx-icon')) return [icon];
      if (selector.includes('ambient-icon')) return [icon];
      return [];
    }),
  };
}

describe('RootBindings', () => {
  it('boot passes the injected document through settings and runtime binding setup', () => {
    const doc = createDoc();
    const audioEngine = {
      setVolume: vi.fn(),
      setSfxVolume: vi.fn(),
      setAmbientVolume: vi.fn(),
      getVolumes: vi.fn(() => ({ master: 0.4, sfx: 0.5, ambient: 0.6 })),
    };
    const settingsUI = { applyOnBoot: vi.fn() };
    const helpPauseUI = {
      showMobileWarning: vi.fn(),
      handleGlobalHotkey: vi.fn(),
    };
    const gameBootUI = { bootGame: vi.fn(), refreshTitleSaveState: vi.fn() };
    const deps = {
      doc,
      audioEngine,
      settingsUI,
      helpPauseUI,
      gameBootUI,
      ScreenShake: {},
      HitStop: {},
      ParticleSystem: {},
      actions: {},
      gs: { currentScreen: 'title' },
      getGameBootDeps: vi.fn(() => ({ token: 'boot' })),
      getHelpPauseDeps: vi.fn(() => ({ token: 'help' })),
      getRunDeps: vi.fn(() => ({ gs: { currentScreen: 'game' }, live: true })),
    };

    RootBindings.boot(deps);

    expect(settingsUI.applyOnBoot).toHaveBeenCalledWith(expect.objectContaining({ doc }));
    expect(registerFrontdoorBindingsSpy).toHaveBeenCalledWith(expect.objectContaining({ doc }));
    expect(registerRunEntryBindingsSpy).toHaveBeenCalledWith(expect.objectContaining({ doc }));
    expect(helpPauseUI.showMobileWarning).toHaveBeenCalledWith(expect.objectContaining({ token: 'help', doc }));
    expect(doc.defaultView.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function), true);
    doc.defaultView.dispatchEvent('keydown', { key: 'a', code: 'KeyA' });
    expect(helpPauseUI.handleGlobalHotkey).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'a', code: 'KeyA' }),
      expect.objectContaining({
        doc,
        ui: helpPauseUI,
        deps: expect.objectContaining({ token: 'help', doc, live: true }),
      }),
    );
    expect(gameBootUI.bootGame).toHaveBeenCalledWith({ token: 'boot' });
    expect(gameBootUI.refreshTitleSaveState).toHaveBeenCalledWith({ token: 'boot' });
  });

  it('syncVolumeUI updates an injected document instead of relying on a global document', () => {
    const doc = createDoc();
    const audioEngine = {
      getVolumes: vi.fn(() => ({ master: 0.4, sfx: 0.5, ambient: 0.6 })),
    };

    RootBindings.syncVolumeUI(audioEngine, { doc });

    expect(doc.querySelectorAll).toHaveBeenCalled();
  });
});
