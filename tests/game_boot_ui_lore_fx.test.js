import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { startLoreTicker, stopLoreTicker } from '../game/ui/title/game_boot_ui_lore_fx.js';

function createDoc() {
  const tokens = new Set();
  const el = {
    innerHTML: '',
    classList: {
      add: vi.fn((token) => tokens.add(token)),
      remove: vi.fn((token) => tokens.delete(token)),
      contains: (token) => tokens.has(token),
    },
    querySelectorAll: vi.fn(() => [
      { style: { setProperty: vi.fn() } },
      { style: { setProperty: vi.fn() } },
    ]),
  };
  return {
    getElementById: vi.fn((id) => (id === 'titleLoreText' ? el : null)),
    element: el,
  };
}

describe('game_boot_ui_lore_fx', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('starts lore ticker with injected random source', () => {
    const doc = createDoc();
    const random = vi.fn(() => 0.5);

    startLoreTicker(doc, { random });

    expect(doc.getElementById).toHaveBeenCalledWith('titleLoreText');
    expect(doc.element.innerHTML).toContain('title-lore-char');
    vi.advanceTimersByTime(4200);
    expect(doc.element.classList.add).toHaveBeenCalledWith('is-exiting');
    expect(random).toHaveBeenCalled();
  });

  it('stops lore ticker through injected clear timers', () => {
    const clearIntervalSpy = vi.fn(clearInterval);
    const clearTimeoutSpy = vi.fn(clearTimeout);
    const doc = createDoc();

    startLoreTicker(doc);
    stopLoreTicker({
      clearInterval: clearIntervalSpy,
      clearTimeout: clearTimeoutSpy,
    });

    expect(clearIntervalSpy).toHaveBeenCalled();
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('binds timer methods to the injected timer host', () => {
    const doc = createDoc();
    const timerHost = {
      setInterval: vi.fn(function () {
        expect(this).toBe(timerHost);
        return 11;
      }),
      clearInterval: vi.fn(function () {
        expect(this).toBe(timerHost);
      }),
      setTimeout: vi.fn(function () {
        expect(this).toBe(timerHost);
        return 12;
      }),
      clearTimeout: vi.fn(function () {
        expect(this).toBe(timerHost);
      }),
    };

    startLoreTicker(doc, { win: timerHost });
    stopLoreTicker({ win: timerHost });

    expect(timerHost.setInterval).toHaveBeenCalled();
    expect(timerHost.setTimeout).toHaveBeenCalled();
    expect(timerHost.clearInterval).toHaveBeenCalled();
    expect(timerHost.clearTimeout).toHaveBeenCalled();
  });
});
