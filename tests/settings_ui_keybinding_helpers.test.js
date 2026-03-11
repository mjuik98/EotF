import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsManager } from '../game/core/settings_manager.js';
import {
  checkConflicts,
  codeToLabel,
  resolveKeybindRow,
  sortKeybindingRows,
  updateConflictBanner,
} from '../game/ui/screens/settings_ui_keybinding_helpers.js';

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

describe('settings_ui_keybinding_helpers', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: createLocalStorageMock(),
      configurable: true,
      writable: true,
    });
    SettingsManager._data = null;
    SettingsManager.resetToDefaults();
  });

  it('formats key codes and renders conflict banner text', () => {
    const banner = { style: {}, textContent: '' };

    expect(codeToLabel('Escape')).toBe('ESC');
    expect(codeToLabel('ArrowLeft')).toBe('LEFT');
    expect(codeToLabel('KeyP')).toBe('P');

    updateConflictBanner(banner, [{ code: 'KeyP', actions: ['pause', 'deckView'] }]);
    expect(banner.style.display).toBe('flex');
    expect(banner.textContent).toContain('P');
    expect(banner.textContent).toContain('일시정지');
    expect(banner.textContent).toContain('덱 보기');

    updateConflictBanner(banner, []);
    expect(banner.style.display).toBe('none');
  });

  it('resolves keybind rows and sorts conflicts to the front of each group', () => {
    const pauseRow = { id: 'pauseRow', classList: { toggle: vi.fn() } };
    const deckRow = { id: 'deckRow', classList: { toggle: vi.fn() } };
    const pauseBtn = { closest: vi.fn(() => pauseRow) };
    const deckBtn = { closest: vi.fn(() => deckRow) };
    const groupLabels = [{ id: 'g1' }, { id: 'g2' }];
    const panel = {
      insertBefore: vi.fn(),
      querySelectorAll: vi.fn(() => groupLabels),
    };
    const doc = {
      querySelector: vi.fn((selector) => {
        if (selector === '[data-keybind="pause"]') return pauseBtn;
        if (selector === '[data-keybind="deckView"]') return deckBtn;
        if (selector === '.settings-tab-panel[data-tab="keybindings"]') return panel;
        return null;
      }),
      querySelectorAll: vi.fn(() => []),
    };

    expect(resolveKeybindRow(doc, 'pause')).toBe(pauseRow);
    sortKeybindingRows(doc, new Set(['deckView']), (innerDoc, action) => {
      if (action === 'pause') return pauseRow;
      if (action === 'deckView') return deckRow;
      return null;
    });

    expect(panel.insertBefore).toHaveBeenCalled();
    expect(deckRow.classList.toggle).toHaveBeenCalledWith('settings-row-conflict', true);
  });

  it('detects conflicting keybindings and routes banner/sort handlers', () => {
    SettingsManager.set('keybindings.pause', 'KeyP');
    SettingsManager.set('keybindings.deckView', 'KeyP');
    const pauseBtn = { dataset: { keybind: 'pause' }, classList: { toggle: vi.fn() } };
    const deckBtn = { dataset: { keybind: 'deckView' }, classList: { toggle: vi.fn() } };
    const banner = { style: {}, textContent: '' };
    const updateBanner = vi.fn();
    const sortRows = vi.fn();
    const doc = {
      querySelectorAll: vi.fn((selector) => (selector === '[data-keybind]' ? [pauseBtn, deckBtn] : [])),
      getElementById: vi.fn((id) => (id === 'settings-conflict-banner' ? banner : null)),
    };

    checkConflicts(doc, { updateConflictBanner: updateBanner, sortKeybindingRows: sortRows });

    expect(pauseBtn.classList.toggle).toHaveBeenCalledWith('conflict', true);
    expect(deckBtn.classList.toggle).toHaveBeenCalledWith('conflict', true);
    expect(updateBanner).toHaveBeenCalledWith(banner, [{ code: 'KeyP', actions: ['pause', 'deckView'] }]);
    expect(sortRows).toHaveBeenCalledWith(doc, expect.any(Set));
  });
});
