import { describe, expect, it, vi } from 'vitest';
import {
  beginSettingsRebindUi,
  cleanupSettingsRebindUi,
  setSettingsModalActive,
} from '../game/features/ui/public.js';

function createClassList(initial = []) {
  const set = new Set(initial);
  return {
    add: (...names) => names.forEach((name) => set.add(name)),
    remove: (...names) => names.forEach((name) => set.delete(name)),
    contains: (name) => set.has(name),
  };
}

describe('settings_ui_runtime_helpers', () => {
  it('toggles the settings modal active class', () => {
    const modal = { classList: createClassList() };

    expect(setSettingsModalActive(modal, true)).toBe(true);
    expect(modal.classList.contains('active')).toBe(true);

    expect(setSettingsModalActive(modal, false)).toBe(true);
    expect(modal.classList.contains('active')).toBe(false);
  });

  it('starts and cleans up settings rebind UI state', () => {
    const classList = createClassList();
    const button = {
      textContent: 'ESC',
      classList: {
        add: vi.fn((name) => classList.add(name)),
        remove: vi.fn((name) => classList.remove(name)),
      },
    };
    const doc = {
      querySelector: vi.fn((selector) => (selector === '[data-keybind="pause"]' ? button : null)),
    };
    const removeEventListener = vi.fn();
    const ui = {
      _listeningAction: null,
      _keydownHandler: () => {},
      _rebindWindow: { removeEventListener },
      _checkConflicts: vi.fn(),
    };
    const win = { marker: true };

    const started = beginSettingsRebindUi(ui, 'pause', doc, win);
    expect(started).toBe(button);
    expect(ui._listeningAction).toBe('pause');
    expect(ui._rebindWindow).toBe(win);
    expect(button.textContent).toBe('입력...');
    expect(button.classList.add).toHaveBeenCalledWith('listening');

    ui._keydownHandler = () => {};
    ui._rebindWindow = { removeEventListener };
    const cleaned = cleanupSettingsRebindUi(ui, 'pause', doc);
    expect(cleaned).toBe(button);
    expect(button.classList.remove).toHaveBeenCalledWith('listening');
    expect(removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(ui._listeningAction).toBe(null);
    expect(ui._rebindWindow).toBe(null);
    expect(ui._keydownHandler).toBe(null);
    expect(ui._checkConflicts).toHaveBeenCalledWith(doc);
  });
});
