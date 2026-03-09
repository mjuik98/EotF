import { describe, expect, it, vi } from 'vitest';
import {
  bindCharacterSelectArrows,
  bindCharacterSelectDrag,
  bindCharacterSelectKeyboard,
  setupCharacterSelectBindings,
} from '../game/ui/title/character_select_bindings.js';

function createDoc() {
  const listeners = new Map();
  return {
    addEventListener: vi.fn((name, handler) => {
      listeners.set(name, handler);
    }),
    removeEventListener: vi.fn((name, handler) => {
      if (listeners.get(name) === handler) listeners.delete(name);
    }),
    listeners,
  };
}

function createButton() {
  const listeners = {};
  return {
    style: {},
    addEventListener: vi.fn((name, handler) => {
      listeners[name] = handler;
    }),
    removeEventListener: vi.fn((name, handler) => {
      if (listeners[name] === handler) delete listeners[name];
    }),
    listeners,
  };
}

describe('character select bindings', () => {
  it('routes keyboard shortcuts through the expected state transitions', () => {
    const doc = createDoc();
    const state = { phase: 'done', activeSkill: null };
    const closeModal = vi.fn();
    const stopTyping = vi.fn();
    const renderPhase = vi.fn();
    const onBack = vi.fn();
    const go = vi.fn();
    const handleConfirm = vi.fn();

    const cleanup = bindCharacterSelectKeyboard(doc, {
      state,
      closeModal,
      stopTyping,
      renderPhase,
      onBack,
      go,
      handleConfirm,
    });

    doc.listeners.get('keydown')({ key: 'Escape' });
    expect(state.phase).toBe('select');
    expect(stopTyping).toHaveBeenCalledTimes(1);
    expect(renderPhase).toHaveBeenCalledTimes(1);

    state.activeSkill = { id: 'echo' };
    doc.listeners.get('keydown')({ key: 'Escape' });
    expect(closeModal).toHaveBeenCalledTimes(1);

    state.activeSkill = null;
    doc.listeners.get('keydown')({ key: 'ArrowLeft' });
    doc.listeners.get('keydown')({ key: 'ArrowRight' });
    doc.listeners.get('keydown')({ key: 'Enter' });
    expect(go).toHaveBeenNthCalledWith(1, -1);
    expect(go).toHaveBeenNthCalledWith(2, 1);
    expect(handleConfirm).toHaveBeenCalledTimes(1);

    cleanup();
    expect(doc.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('uses drag thresholds and ignores mouse drags while modal is open', () => {
    const doc = createDoc();
    const go = vi.fn();
    let modalOpen = false;

    const cleanup = bindCharacterSelectDrag(doc, {
      isModalOpen: () => modalOpen,
      go,
    });

    doc.listeners.get('mousedown')({ clientX: 200 });
    doc.listeners.get('mouseup')({ clientX: 100 });
    expect(go).toHaveBeenCalledWith(1);

    modalOpen = true;
    doc.listeners.get('mousedown')({ clientX: 200 });
    doc.listeners.get('mouseup')({ clientX: 40 });
    expect(go).toHaveBeenCalledTimes(1);

    modalOpen = false;
    doc.listeners.get('touchstart')({ touches: [{ clientX: 30 }] });
    doc.listeners.get('touchend')({ changedTouches: [{ clientX: 120 }] });
    expect(go).toHaveBeenNthCalledWith(2, -1);

    cleanup();
    expect(doc.removeEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
    expect(doc.removeEventListener).toHaveBeenCalledWith('touchend', expect.any(Function));
  });

  it('wires arrow buttons through hover styling and click navigation', () => {
    const left = createButton();
    const right = createButton();
    const hover = vi.fn();
    const go = vi.fn();
    const resolveById = (id) => ({ btnLeft: left, btnRight: right }[id] || null);

    const cleanup = bindCharacterSelectArrows(resolveById, {
      hover,
      getAccent: () => '#7CC8FF',
      go,
    });

    left.listeners.mouseenter();
    expect(hover).toHaveBeenCalledTimes(1);
    expect(left.style.background).toBe('#7CC8FF22');
    expect(left.style.transform).toBe('scale(1.1)');

    right.listeners.mouseleave();
    expect(right.style.boxShadow).toBe('0 0 16px #7CC8FF22');

    left.listeners.click();
    right.listeners.click();
    expect(go).toHaveBeenNthCalledWith(1, -1);
    expect(go).toHaveBeenNthCalledWith(2, 1);

    cleanup();
    expect(left.removeEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    expect(right.removeEventListener).toHaveBeenCalledWith('mouseleave', expect.any(Function));
  });

  it('combines keyboard, drag, and arrow cleanup in one setup helper', () => {
    const doc = createDoc();
    const left = createButton();
    const right = createButton();
    const cleanup = setupCharacterSelectBindings({
      doc,
      resolveById: (id) => ({ btnLeft: left, btnRight: right }[id] || null),
      isModalOpen: () => false,
      state: { phase: 'select', activeSkill: null },
      go: vi.fn(),
      handleConfirm: vi.fn(),
      getAccent: () => '#ffd700',
    });

    expect(doc.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(doc.addEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
    expect(left.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));

    cleanup();
    expect(doc.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(left.removeEventListener).toHaveBeenCalledWith('mouseenter', expect.any(Function));
  });
});
