import { describe, expect, it, vi } from 'vitest';

import {
  createCharacterSelectRuntimePorts,
} from '../game/features/title/ports/create_character_select_runtime_ports.js';
import {
  getTitleDoc,
  getTitleSetTimeout,
  getTitleWin,
  resolveTitleReload,
} from '../game/features/title/ports/title_runtime_ports.js';

describe('title_runtime_ports', () => {
  it('resolves title document and window from injected browser deps', () => {
    const doc = { id: 'doc', defaultView: { id: 'win' } };
    const win = { id: 'explicit-win', document: doc };

    expect(getTitleDoc({ doc })).toBe(doc);
    expect(getTitleWin({ doc })).toBe(doc.defaultView);
    expect(getTitleWin({ win })).toBe(win);
  });

  it('prefers injected timeout and reload handlers before browser fallbacks', () => {
    const explicitReload = vi.fn();
    const boundReload = vi.fn();
    const win = {
      location: {
        reload: boundReload,
      },
    };
    const timeout = vi.fn();

    expect(getTitleSetTimeout({ setTimeoutFn: timeout })).toBe(timeout);
    expect(resolveTitleReload({ reload: explicitReload })).toBe(explicitReload);
    const reload = resolveTitleReload({ win });

    expect(typeof reload).toBe('function');
    reload();
    expect(boundReload).toHaveBeenCalledTimes(1);
  });

  it('builds a character-select runtime port bag from browser deps', () => {
    const requestAnimationFrame = vi.fn();
    const cancelAnimationFrame = vi.fn();
    const setTimeoutImpl = vi.fn();
    const clearIntervalImpl = vi.fn();
    const win = {
      document: { id: 'doc' },
      requestAnimationFrame,
      cancelAnimationFrame,
      setTimeout: setTimeoutImpl,
      clearInterval: clearIntervalImpl,
    };

    expect(createCharacterSelectRuntimePorts({ win })).toEqual({
      doc: win.document,
      win,
      requestAnimationFrameImpl: expect.any(Function),
      cancelAnimationFrameImpl: expect.any(Function),
      setTimeoutImpl: expect.any(Function),
      clearIntervalImpl: expect.any(Function),
    });
  });
});
