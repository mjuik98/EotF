import { describe, expect, it, vi } from 'vitest';
import {
  closeRunEndScreenRuntime,
  destroyRunEndScreenRuntime,
  initRunEndScreenRuntime,
  showRunEndScreenRuntime,
} from '../game/features/title/ports/public_run_end_presentation_capabilities.js';

function createOverlayDoc() {
  const keyHandlers = [];
  const nodesById = new Map();

  const overlay = {
    id: '',
    style: {},
    innerHTML: '',
    removed: false,
    addEventListener: vi.fn(),
    querySelector: vi.fn((selector) => nodesById.get(selector.replace('#', '')) || null),
    remove: vi.fn(function remove() {
      this.removed = true;
    }),
  };

  [
    'classRunEndEyebrow',
    'classRunEndTitle',
    'classRunEndRows',
    'classRunEndTotalVal',
    'classRunEndBarLeft',
    'classRunEndBarRight',
    'classRunEndBarFill',
    'classRunEndCloseBtn',
  ].forEach((id) => {
    nodesById.set(id, {
      id,
      style: {},
      textContent: '',
      addEventListener: vi.fn(),
    });
  });

  return {
    overlay,
    nodesById,
    doc: {
      body: { appendChild: vi.fn() },
      createElement: vi.fn(() => overlay),
      addEventListener: vi.fn((name, handler) => {
        if (name === 'keydown') keyHandlers.push(handler);
      }),
      removeEventListener: vi.fn(),
      getElementById: vi.fn((id) => nodesById.get(id) || null),
    },
  };
}

describe('run_end_screen_runtime', () => {
  it('builds the overlay shell and shows normalized summary content', () => {
    const { doc, nodesById, overlay } = createOverlayDoc();
    const instance = {
      onClose: null,
      _doc: doc,
      _raf: vi.fn(),
      _setTimeout: vi.fn(),
    };

    initRunEndScreenRuntime(instance);
    showRunEndScreenRuntime(instance, {
      outcome: 'victory',
      rewards: [{ label: 'Base', xp: 10 }],
      totalGain: 10,
      before: { level: 1, progress: 0.1 },
      after: { level: 2, totalXp: 100, progress: 0.2 },
    }, {
      title: 'Mage',
      accent: '#33ccff',
    });

    expect(doc.body.appendChild).toHaveBeenCalledWith(overlay);
    expect(nodesById.get('classRunEndTitle').textContent).toBe('승리');
    expect(nodesById.get('classRunEndEyebrow').textContent).toBe('Mage - 전투 요약');
    expect(nodesById.get('classRunEndRows').innerHTML).toContain('Base');
    expect(nodesById.get('classRunEndBarFill').style.width).toBe('1%');
    expect(overlay.style.display).toBe('flex');
    expect(instance._setTimeout).toHaveBeenCalled();
  });

  it('closes and destroys the overlay runtime', () => {
    const { doc, overlay } = createOverlayDoc();
    const instance = {
      onClose: vi.fn(),
      _doc: doc,
      _raf: vi.fn(),
      _setTimeout: vi.fn(),
    };

    initRunEndScreenRuntime(instance);
    overlay.style.display = 'flex';

    closeRunEndScreenRuntime(instance);
    destroyRunEndScreenRuntime(instance);

    expect(overlay.style.display).toBe('none');
    expect(instance.onClose).toHaveBeenCalledTimes(2);
    expect(doc.removeEventListener).toHaveBeenCalledWith('keydown', instance._onKeyDown);
    expect(overlay.remove).toHaveBeenCalledTimes(1);
  });
});
