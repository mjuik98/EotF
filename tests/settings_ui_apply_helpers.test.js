import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsManager } from '../game/core/settings_manager.js';
import {
  applySettingsAccessibility,
  applySettingsVisual,
  applySettingsVolume,
  normalizeSettingsVolumePercent,
  resetSettingsToDefaults,
  toggleSettingsMute,
} from '../game/ui/screens/settings_ui_apply_helpers.js';

function createLocalStorageMock(initial = {}) {
  const store = new Map(Object.entries(initial));
  return {
    getItem: vi.fn((key) => (store.has(key) ? store.get(key) : null)),
    setItem: vi.fn((key, value) => {
      store.set(key, String(value));
    }),
    removeItem: vi.fn((key) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
    }),
  };
}

function createClassList(initial = []) {
  const set = new Set(initial);
  return {
    add: (...names) => names.forEach((name) => set.add(name)),
    remove: (...names) => names.forEach((name) => set.delete(name)),
    contains: (name) => set.has(name),
    toggle: (name, force) => {
      if (force === undefined) {
        if (set.has(name)) {
          set.delete(name);
          return false;
        }
        set.add(name);
        return true;
      }
      if (force) set.add(name);
      else set.delete(name);
      return !!force;
    },
  };
}

describe('settings_ui_apply_helpers', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: createLocalStorageMock(),
      configurable: true,
      writable: true,
    });
    SettingsManager._data = null;
    SettingsManager.resetToDefaults();
  });

  it('normalizes and applies volume to storage, engine, and synced controls', () => {
    const valueEl = { textContent: '' };
    const sliderEl = { value: '0', style: { setProperty: vi.fn() } };
    const iconEl = { textContent: '' };
    const doc = {
      querySelectorAll: vi.fn((selector) => ({
        '#settings-vol-master-val': [valueEl],
        '#settings-vol-master-slider': [sliderEl],
        '#settings-vol-master-icon': [iconEl],
      }[selector] || [])),
    };
    const audioEngine = { setVolume: vi.fn() };

    expect(normalizeSettingsVolumePercent(140)).toBe(100);
    const result = applySettingsVolume('master', 55, { doc, audioEngine });

    expect(result).toEqual({ percent: 55, normalized: 0.55 });
    expect(audioEngine.setVolume).toHaveBeenCalledWith(0.55);
    expect(SettingsManager.get('volumes.master')).toBe(0.55);
    expect(valueEl.textContent).toBe('55%');
    expect(sliderEl.value).toBe('55');
    expect(iconEl.textContent).toBe('🔉');
  });

  it('toggles mute using the previous slider value and updates visual/accessibility state', () => {
    const slider = { value: '35', dataset: {} };
    const visualToggle = { checked: false };
    const fontBtn = { dataset: { fontSize: 'large' }, classList: { toggle: vi.fn() } };
    const doc = {
      querySelector: vi.fn((selector) => (selector === '#settings-vol-master-slider' ? slider : null)),
      getElementById: vi.fn((id) => (id === 'settings-visual-reducedMotion' ? visualToggle : null)),
      querySelectorAll: vi.fn((selector) => (selector === '[data-font-size]' ? [fontBtn] : [])),
      documentElement: { classList: createClassList(), dataset: {} },
    };
    const applyVolume = vi.fn();

    expect(toggleSettingsMute('master', { doc }, applyVolume)).toBe(true);
    expect(slider.dataset.prevValue).toBe('35');
    expect(applyVolume).toHaveBeenCalledWith('master', 0, { doc });

    slider.value = '0';
    expect(toggleSettingsMute('master', { doc }, applyVolume)).toBe(true);
    expect(applyVolume).toHaveBeenLastCalledWith('master', 35, { doc });

    applySettingsVisual('reducedMotion', true, { doc });
    expect(doc.documentElement.classList.contains('reduced-motion')).toBe(true);
    expect(visualToggle.checked).toBe(true);

    applySettingsAccessibility('fontSize', 'large', { doc });
    expect(doc.documentElement.dataset.fontSize).toBe('large');
    expect(fontBtn.classList.toggle).toHaveBeenCalledWith('active', true);
  });

  it('resets defaults and reapplies engine and document state', () => {
    SettingsManager.set('visual.reducedMotion', true);
    SettingsManager.set('accessibility.fontSize', 'large');
    const doc = {
      documentElement: { classList: createClassList(['reduced-motion', 'high-contrast']), dataset: { fontSize: 'large' } },
    };
    const syncAllTabs = vi.fn();
    const audioEngine = { setVolume: vi.fn(), setSfxVolume: vi.fn(), setAmbientVolume: vi.fn() };
    const ScreenShake = { setEnabled: vi.fn() };
    const HitStop = { setEnabled: vi.fn() };
    const ParticleSystem = { setEnabled: vi.fn() };

    const defaults = resetSettingsToDefaults(
      { doc, audioEngine, ScreenShake, HitStop, ParticleSystem },
      syncAllTabs,
    );

    expect(syncAllTabs).toHaveBeenCalledWith(doc);
    expect(defaults.volumes.master).toBe(0.8);
    expect(audioEngine.setVolume).toHaveBeenCalledWith(0.8);
    expect(ScreenShake.setEnabled).toHaveBeenCalledWith(true);
    expect(doc.documentElement.classList.contains('reduced-motion')).toBe(false);
    expect(doc.documentElement.dataset.fontSize).toBe('normal');
    expect(doc.documentElement.classList.contains('high-contrast')).toBe(false);
  });
});
