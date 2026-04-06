import { describe, expect, it, vi } from 'vitest';

import {
  downloadTextFile,
  readImportFileText,
} from '../game/platform/browser/storage/title_save_file_io.js';

describe('title save file io', () => {
  it('downloads text through injected browser primitives', () => {
    const anchor = {
      style: {},
      click: vi.fn(),
      remove: vi.fn(),
    };
    const doc = {
      body: { appendChild: vi.fn() },
      createElement: vi.fn(() => anchor),
    };
    const win = {
      URL: {
        createObjectURL: vi.fn(() => 'blob:save'),
        revokeObjectURL: vi.fn(),
      },
    };

    expect(downloadTextFile('slot-1.json', '{"slot":1}', { doc, win })).toBe(true);
    expect(doc.createElement).toHaveBeenCalledWith('a');
    expect(anchor.download).toBe('slot-1.json');
    expect(anchor.href).toBe('blob:save');
    expect(anchor.click).toHaveBeenCalledTimes(1);
    expect(win.URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(win.URL.revokeObjectURL).toHaveBeenCalledWith('blob:save');
  });

  it('fails cleanly when browser download primitives are unavailable', () => {
    expect(downloadTextFile('slot-1.json', '{}', { doc: null, win: null })).toBe(false);
  });

  it('reads imported text through the file text() contract when available', async () => {
    const file = {
      text: vi.fn(async () => '{"slot":2}'),
    };

    await expect(readImportFileText(file)).resolves.toBe('{"slot":2}');
    await expect(readImportFileText({})).resolves.toBe('');
  });
});
