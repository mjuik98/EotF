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

function createClassList(initial = []) {
  const tokens = new Set(initial);
  return {
    contains: (name) => tokens.has(name),
    remove: (name) => tokens.delete(name),
  };
}

function createDoc(elements = {}, computedStyleById = {}) {
  const slider = { value: '', style: { setProperty: vi.fn() } };
  const value = { textContent: '' };
  const icon = { textContent: '' };
  const listeners = new Map();
  const defaultView = {
    addEventListener: vi.fn((type, handler) => {
      listeners.set(type, handler);
    }),
    dispatchEvent: (type, event) => listeners.get(type)?.(event),
    getComputedStyle: vi.fn((element) => ({
      display: computedStyleById[element?.id]?.display || element?.style?.display || 'none',
      visibility: computedStyleById[element?.id]?.visibility || 'visible',
      opacity: computedStyleById[element?.id]?.opacity || (element?.classList?.contains?.('active') ? '1' : '0'),
      pointerEvents: computedStyleById[element?.id]?.pointerEvents || (element?.classList?.contains?.('active') ? 'auto' : 'none'),
    })),
  };
  return {
    defaultView,
    addEventListener: vi.fn((type, handler) => {
      listeners.set(type, handler);
    }),
    dispatchEvent: (type, event) => listeners.get(type)?.(event),
    getElementById: vi.fn((id) => elements[id] || null),
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

function createAudioEngine() {
  return {
    getVolumes: vi.fn(() => ({ master: 0.4, sfx: 0.5, ambient: 0.6 })),
    setVolume: vi.fn(),
    setSfxVolume: vi.fn(),
    setAmbientVolume: vi.fn(),
  };
}

describe('RootBindings', () => {
  it('boot passes the injected document through settings and runtime binding setup', () => {
    const doc = createDoc();
    const audioEngine = createAudioEngine();
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
    const audioEngine = createAudioEngine();

    RootBindings.syncVolumeUI(audioEngine, { doc });

    expect(doc.querySelectorAll).toHaveBeenCalled();
  });

  it('does not try to close title-owned modals from the root help-pause handler', () => {
    const closeRunSettings = vi.fn();
    const modal = {
      style: { display: 'flex' },
      classList: createClassList(),
    };
    const doc = createDoc({ runSettingsModal: modal });
    const helpPauseUI = {
      showMobileWarning: vi.fn(),
      handleGlobalHotkey: vi.fn(),
      togglePause: vi.fn(),
      toggleHelp: vi.fn(),
      isHelpOpen: vi.fn(() => false),
    };
    const deps = {
      doc,
      audioEngine: createAudioEngine(),
      settingsUI: { applyOnBoot: vi.fn() },
      helpPauseUI,
      gameBootUI: { bootGame: vi.fn(), refreshTitleSaveState: vi.fn() },
      actions: {},
      gs: { currentScreen: 'title' },
      getGameBootDeps: vi.fn(() => ({})),
      getHelpPauseDeps: vi.fn(() => ({ closeRunSettings })),
      getRunDeps: vi.fn(() => ({ gs: { currentScreen: 'game' } })),
    };

    RootBindings.boot(deps);

    const event = {
      key: 'Escape',
      code: 'Escape',
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      stopImmediatePropagation: vi.fn(),
    };

    doc.defaultView.dispatchEvent('keydown', event);

    expect(closeRunSettings).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(event.stopPropagation).not.toHaveBeenCalled();
    expect(event.stopImmediatePropagation).not.toHaveBeenCalled();
    expect(helpPauseUI.handleGlobalHotkey).not.toHaveBeenCalled();
  });

  it('consumes Escape for gameplay modals when help-pause deps provide close actions', () => {
    const closeRunSettings = vi.fn();
    const modal = {
      id: 'runSettingsModal',
      style: { display: 'flex' },
      classList: createClassList(),
    };
    const doc = createDoc(
      { runSettingsModal: modal },
      {
        runSettingsModal: {
          display: 'flex',
          visibility: 'visible',
          opacity: '1',
          pointerEvents: 'auto',
        },
      },
    );
    const helpPauseUI = {
      showMobileWarning: vi.fn(),
      handleGlobalHotkey: vi.fn(),
      togglePause: vi.fn(),
      toggleHelp: vi.fn(),
      isHelpOpen: vi.fn(() => false),
    };
    const deps = {
      doc,
      audioEngine: createAudioEngine(),
      settingsUI: { applyOnBoot: vi.fn() },
      helpPauseUI,
      gameBootUI: { bootGame: vi.fn(), refreshTitleSaveState: vi.fn() },
      actions: {},
      gs: { currentScreen: 'game' },
      getGameBootDeps: vi.fn(() => ({})),
      getHelpPauseDeps: vi.fn(() => ({ closeRunSettings })),
      getRunDeps: vi.fn(() => ({ gs: { currentScreen: 'game' } })),
    };

    RootBindings.boot(deps);

    const event = {
      key: 'Escape',
      code: 'Escape',
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      stopImmediatePropagation: vi.fn(),
    };

    doc.defaultView.dispatchEvent('keydown', event);

    expect(closeRunSettings).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(event.stopPropagation).toHaveBeenCalledTimes(1);
    expect(event.stopImmediatePropagation).toHaveBeenCalledTimes(1);
    expect(helpPauseUI.handleGlobalHotkey).not.toHaveBeenCalled();
  });

  it('opens pause instead of closing an inactive settings shell without loaded modal CSS', () => {
    const closeSettings = vi.fn();
    const settingsModal = {
      id: 'settingsModal',
      style: {},
      classList: createClassList(),
    };
    const doc = createDoc(
      { settingsModal },
      {
        settingsModal: {
          display: 'block',
          visibility: 'visible',
          opacity: '1',
          pointerEvents: 'auto',
        },
      },
    );
    const helpPauseUI = {
      showMobileWarning: vi.fn(),
      handleGlobalHotkey: vi.fn(),
      togglePause: vi.fn(),
      toggleHelp: vi.fn(),
      isHelpOpen: vi.fn(() => false),
    };
    const deps = {
      doc,
      audioEngine: createAudioEngine(),
      settingsUI: { applyOnBoot: vi.fn() },
      helpPauseUI,
      gameBootUI: { bootGame: vi.fn(), refreshTitleSaveState: vi.fn() },
      actions: {},
      gs: { currentScreen: 'game' },
      getGameBootDeps: vi.fn(() => ({})),
      getHelpPauseDeps: vi.fn(() => ({ closeSettings })),
      getRunDeps: vi.fn(() => ({ gs: { currentScreen: 'game' } })),
    };

    RootBindings.boot(deps);

    const event = {
      key: 'Escape',
      code: 'Escape',
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      stopImmediatePropagation: vi.fn(),
    };

    doc.defaultView.dispatchEvent('keydown', event);

    expect(closeSettings).not.toHaveBeenCalled();
    expect(helpPauseUI.togglePause).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(event.stopPropagation).toHaveBeenCalledTimes(1);
    expect(event.stopImmediatePropagation).toHaveBeenCalledTimes(1);
  });

  it('opens pause instead of closing a hidden deck shell that only stays mounted for layout', () => {
    const closeDeckView = vi.fn();
    const deckViewModal = {
      id: 'deckViewModal',
      style: {},
      classList: createClassList(),
    };
    const doc = createDoc(
      { deckViewModal },
      {
        deckViewModal: {
          display: 'flex',
          visibility: 'hidden',
          opacity: '0',
          pointerEvents: 'none',
        },
      },
    );
    const helpPauseUI = {
      showMobileWarning: vi.fn(),
      handleGlobalHotkey: vi.fn(),
      togglePause: vi.fn(),
      toggleHelp: vi.fn(),
      isHelpOpen: vi.fn(() => false),
    };
    const deps = {
      doc,
      audioEngine: createAudioEngine(),
      settingsUI: { applyOnBoot: vi.fn() },
      helpPauseUI,
      gameBootUI: { bootGame: vi.fn(), refreshTitleSaveState: vi.fn() },
      actions: {},
      gs: { currentScreen: 'game' },
      getGameBootDeps: vi.fn(() => ({})),
      getHelpPauseDeps: vi.fn(() => ({ closeDeckView })),
      getRunDeps: vi.fn(() => ({ gs: { currentScreen: 'game' } })),
    };

    RootBindings.boot(deps);

    const event = {
      key: 'Escape',
      code: 'Escape',
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      stopImmediatePropagation: vi.fn(),
    };

    doc.defaultView.dispatchEvent('keydown', event);

    expect(closeDeckView).not.toHaveBeenCalled();
    expect(helpPauseUI.togglePause).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(event.stopPropagation).toHaveBeenCalledTimes(1);
    expect(event.stopImmediatePropagation).toHaveBeenCalledTimes(1);
  });

  it('closes the codex detail popup before closing the codex modal', () => {
    const closeCodex = vi.fn();
    const codexModal = {
      id: 'codexModal',
      style: { display: 'flex' },
      classList: createClassList(['active']),
    };
    const detailPopup = {
      id: 'cxDetailPopup',
      style: { display: 'flex' },
      classList: createClassList(['open']),
    };
    const doc = createDoc(
      { codexModal, cxDetailPopup: detailPopup },
      {
        codexModal: {
          display: 'flex',
          visibility: 'visible',
          opacity: '1',
          pointerEvents: 'auto',
        },
      },
    );
    const helpPauseUI = {
      showMobileWarning: vi.fn(),
      handleGlobalHotkey: vi.fn(),
      togglePause: vi.fn(),
      toggleHelp: vi.fn(),
      isHelpOpen: vi.fn(() => false),
    };
    const deps = {
      doc,
      audioEngine: createAudioEngine(),
      settingsUI: { applyOnBoot: vi.fn() },
      helpPauseUI,
      gameBootUI: { bootGame: vi.fn(), refreshTitleSaveState: vi.fn() },
      actions: {},
      gs: { currentScreen: 'game' },
      getGameBootDeps: vi.fn(() => ({})),
      getHelpPauseDeps: vi.fn(() => ({ closeCodex })),
      getRunDeps: vi.fn(() => ({ gs: { currentScreen: 'game' } })),
    };

    RootBindings.boot(deps);

    const event = {
      key: 'Escape',
      code: 'Escape',
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      stopImmediatePropagation: vi.fn(),
    };

    doc.defaultView.dispatchEvent('keydown', event);

    expect(detailPopup.classList.contains('open')).toBe(false);
    expect(closeCodex).not.toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(event.stopPropagation).toHaveBeenCalledTimes(1);
    expect(event.stopImmediatePropagation).toHaveBeenCalledTimes(1);
    expect(helpPauseUI.handleGlobalHotkey).not.toHaveBeenCalled();
  });

  it('closes a registered detail surface before opening pause', () => {
    const combatRelicPanel = {
      id: 'combatRelicPanel',
      dataset: { open: 'true' },
      style: { display: 'block' },
      classList: createClassList(),
      __closeEscapeSurface: vi.fn(function closeSurface() {
        this.dataset.open = 'false';
      }),
    };
    const doc = createDoc(
      { combatRelicPanel },
      {
        combatRelicPanel: {
          display: 'block',
          visibility: 'visible',
          opacity: '1',
          pointerEvents: 'auto',
        },
      },
    );
    const helpPauseUI = {
      showMobileWarning: vi.fn(),
      handleGlobalHotkey: vi.fn(),
      togglePause: vi.fn(),
      toggleHelp: vi.fn(),
      isHelpOpen: vi.fn(() => false),
    };
    const deps = {
      doc,
      audioEngine: createAudioEngine(),
      settingsUI: { applyOnBoot: vi.fn() },
      helpPauseUI,
      gameBootUI: { bootGame: vi.fn(), refreshTitleSaveState: vi.fn() },
      actions: {},
      gs: { currentScreen: 'game' },
      getGameBootDeps: vi.fn(() => ({})),
      getHelpPauseDeps: vi.fn(() => ({})),
      getRunDeps: vi.fn(() => ({ gs: { currentScreen: 'game' } })),
    };

    RootBindings.boot(deps);

    const event = {
      key: 'Escape',
      code: 'Escape',
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      stopImmediatePropagation: vi.fn(),
    };

    doc.defaultView.dispatchEvent('keydown', event);

    expect(combatRelicPanel.__closeEscapeSurface).toHaveBeenCalledTimes(1);
    expect(combatRelicPanel.dataset.open).toBe('false');
    expect(helpPauseUI.togglePause).not.toHaveBeenCalled();
    expect(helpPauseUI.handleGlobalHotkey).not.toHaveBeenCalled();
  });
});
