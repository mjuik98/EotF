import { describe, expect, it, vi } from 'vitest';

import {
  toggleAbandonConfirmRuntime,
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
    },
    getElementById: (id) => elements[id] || null,
  };
}

describe('help_pause_ui_dialog_runtime', () => {
  it('toggles the abandon confirm overlay and wires confirm callback', () => {
    const doc = createDoc();
    const onConfirm = vi.fn();

    expect(toggleAbandonConfirmRuntime({ doc }, onConfirm)).toBe(true);
    const overlay = doc.getElementById('abandonConfirm');
    expect(overlay).toBeTruthy();

    const buttonRow = overlay.children[3];
    const confirmButton = buttonRow.children[1];
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

    const buttonRow = overlay.children[3];
    const confirmButton = buttonRow.children[1];
    confirmButton.onclick();

    expect(deps.saveRun).toHaveBeenCalledWith({ gs: deps.gs });
    expect(doc.defaultView.location.reload).toHaveBeenCalledTimes(1);

    expect(toggleReturnTitleConfirmRuntime(deps)).toBe(true);
    expect(toggleReturnTitleConfirmRuntime(deps)).toBe(false);
    expect(doc.getElementById('returnTitleConfirm')).toBeNull();
  });
});
