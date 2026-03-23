import { describe, expect, it, vi } from 'vitest';

import { SaveAdapter } from '../game/core/save_adapter.js';

describe('SaveAdapter', () => {
  it('uses injected storage for load, save, remove, and has operations', () => {
    const storage = {
      getItem: vi.fn((key) => (key === 'run' ? '{"hp":7}' : null)),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };

    expect(SaveAdapter.load('run', { storage })).toEqual({ hp: 7 });
    expect(SaveAdapter.has('run', { storage })).toBe(true);
    expect(SaveAdapter.save('run', { hp: 8 }, { storage })).toBe(true);

    SaveAdapter.remove('run', { storage });

    expect(storage.setItem).toHaveBeenCalledWith('run', '{"hp":8}');
    expect(storage.removeItem).toHaveBeenCalledWith('run');
  });

  it('reports malformed loads through injected error reporter', () => {
    const reportErrorFn = vi.fn();
    const storage = {
      getItem: vi.fn(() => '{'),
    };

    expect(SaveAdapter.load('run', { storage, reportErrorFn })).toBe(null);
    expect(reportErrorFn).toHaveBeenCalledTimes(1);
  });

  it('renders quota notices with injected document and timer collaborators', () => {
    const appendChild = vi.fn();
    const timer = vi.fn();
    const notice = {
      style: {},
      remove: vi.fn(),
    };
    const doc = {
      body: { appendChild },
      createElement: vi.fn(() => notice),
    };
    const storage = {
      setItem: vi.fn(() => {
        const error = new Error('full');
        error.name = 'QuotaExceededError';
        throw error;
      }),
    };

    expect(SaveAdapter.save('run', { hp: 8 }, { storage, doc, setTimeoutFn: timer })).toBe(false);
    expect(doc.createElement).toHaveBeenCalledWith('div');
    expect(appendChild).toHaveBeenCalledWith(notice);
    expect(timer).toHaveBeenCalledTimes(1);
  });
});
