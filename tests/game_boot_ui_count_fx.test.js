import { afterEach, describe, expect, it, vi } from 'vitest';
import { countUp } from '../game/ui/title/game_boot_ui_count_fx.js';

describe('game_boot_ui_count_fx', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('animates to the final count with suffix through RAF timestamps', () => {
    const el = { textContent: '' };
    const queue = [];
    const originalRaf = globalThis.requestAnimationFrame;
    globalThis.requestAnimationFrame = vi.fn((handler) => {
      queue.push(handler);
      return queue.length;
    });

    countUp(el, 25, 1000, '%');

    expect(queue).toHaveLength(1);
    queue.shift()(1);
    queue.shift()(501);
    queue.shift()(1001);

    expect(el.textContent).toBe('25%');

    globalThis.requestAnimationFrame = originalRaf;
  });
});
