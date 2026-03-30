import { describe, expect, it, vi } from 'vitest';

import {
  toggleAbandonConfirmRuntime,
  toggleQuitGameConfirmRuntime,
  toggleReturnTitleConfirmRuntime,
} from '../game/features/ui/public.js';

function createElementFactory(elements) {
  return function createElement(tagName) {
    const el = {
      tagName: String(tagName || '').toUpperCase(),
      id: '',
      style: {},
      className: '',
      textContent: '',
      innerHTML: '',
      children: [],
      append(...nodes) {
        this.children.push(...nodes);
      },
      appendChild(node) {
        this.children.push(node);
        if (node?.id) elements[node.id] = node;
        return node;
      },
      remove() {
        if (this.id) delete elements[this.id];
      },
    };
    return el;
  };
}

function createDoc() {
  const elements = {};
  const createElement = createElementFactory(elements);
  const body = createElement('body');
  body.appendChild = (node) => {
    body.children.push(node);
    if (node?.id) elements[node.id] = node;
    return node;
  };

  return {
    createElement,
    body,
    defaultView: {
      location: {
        reload: vi.fn(),
      },
      close: vi.fn(),
    },
    getElementById: (id) => elements[id] || null,
  };
}

function findById(node, id) {
  if (!node) return null;
  if (node.id === id) return node;
  for (const child of node.children || []) {
    const found = findById(child, id);
    if (found) return found;
  }
  return null;
}

describe('help_pause_ui_dialog_runtime', () => {
  it('toggles the abandon confirm overlay and wires confirm callback', () => {
    const doc = createDoc();
    const onConfirm = vi.fn();

    expect(toggleAbandonConfirmRuntime({ doc }, onConfirm)).toBe(true);
    const overlay = doc.getElementById('abandonConfirm');
    expect(overlay).toBeTruthy();

    const confirmButton = findById(overlay, 'abandonConfirmSubmitBtn');
    confirmButton.onclick();

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(toggleAbandonConfirmRuntime({ doc }, onConfirm)).toBe(false);
    expect(doc.getElementById('abandonConfirm')).toBeNull();
  });

  it('toggles the return-to-title confirm overlay and runs the return flow', () => {
    const doc = createDoc();
    const deps = {
      doc,
      gs: { currentScreen: 'game' },
      saveRun: vi.fn(),
    };

    expect(toggleReturnTitleConfirmRuntime(deps)).toBe(true);
    const overlay = doc.getElementById('returnTitleConfirm');
    expect(overlay).toBeTruthy();

    const confirmButton = findById(overlay, 'returnTitleSubmitBtn');
    confirmButton.onclick();

    expect(deps.saveRun).toHaveBeenCalledWith({ gs: deps.gs });
    expect(doc.defaultView.location.reload).toHaveBeenCalledTimes(1);

    expect(toggleReturnTitleConfirmRuntime(deps)).toBe(true);
    expect(toggleReturnTitleConfirmRuntime(deps)).toBe(false);
    expect(doc.getElementById('returnTitleConfirm')).toBeNull();
  });

  it('toggles the quit confirm overlay and keeps a browser fallback status visible after requesting close', () => {
    const doc = createDoc();
    const deps = {
      doc,
      win: doc.defaultView,
    };

    expect(toggleQuitGameConfirmRuntime(deps)).toBe(true);
    const overlay = doc.getElementById('quitGameConfirm');
    expect(overlay).toBeTruthy();

    const confirmButton = findById(overlay, 'quitGameSubmitBtn');
    confirmButton.onclick();

    expect(doc.defaultView.close).toHaveBeenCalledTimes(1);
    expect(doc.getElementById('quitGameConfirm')).toBeTruthy();
    expect(findById(overlay, 'quitGameStatus')?.textContent).toContain('창 닫기를 요청했습니다.');
    expect(findById(overlay, 'quitGameCancelBtn')?.textContent).toBe('닫기');
    expect(findById(overlay, 'quitGameSubmitBtn')?.textContent).toBe('종료 요청됨');
  });

  it('uses an injected native quit request when available', () => {
    const doc = createDoc();
    const quitGameRequest = vi.fn(() => true);
    const deps = {
      doc,
      win: doc.defaultView,
      quitGameRequest,
    };

    expect(toggleQuitGameConfirmRuntime(deps)).toBe(true);
    const overlay = doc.getElementById('quitGameConfirm');
    const confirmButton = findById(overlay, 'quitGameSubmitBtn');
    confirmButton.onclick();

    expect(quitGameRequest).toHaveBeenCalledWith(expect.objectContaining({
      doc,
      win: doc.defaultView,
    }));
    expect(doc.defaultView.close).not.toHaveBeenCalled();
    expect(doc.getElementById('quitGameConfirm')).toBeNull();
  });
});
