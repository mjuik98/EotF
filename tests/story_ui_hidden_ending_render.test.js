import { describe, expect, it, vi } from 'vitest';

import { renderHiddenEndingOverlay } from '../game/ui/screens/story_ui_hidden_ending_render.js';

function createDoc() {
  const elements = new Map();
  const body = {
    children: [],
    appendChild(node) {
      this.children.push(node);
      if (node?.id) elements.set(node.id, node);
      return node;
    },
  };

  function createElement(tagName) {
    const el = {
      tagName: String(tagName || '').toUpperCase(),
      id: '',
      style: {},
      textContent: '',
      innerHTML: '',
      children: [],
      append(...nodes) {
        this.children.push(...nodes);
        nodes.forEach((node) => {
          if (node?.id) elements.set(node.id, node);
        });
      },
      appendChild(node) {
        this.children.push(node);
        if (node?.id) elements.set(node.id, node);
        return node;
      },
    };
    return el;
  }

  return {
    body,
    createElement,
    getElementById(id) {
      return elements.get(id) || null;
    },
  };
}

describe('story_ui_hidden_ending_render', () => {
  it('renders hidden ending overlay, unlocks inscription, and wires restart button', () => {
    const doc = createDoc();
    const restartFromEnding = vi.fn();
    const burstEffect = vi.fn();
    const playResonanceBurst = vi.fn();
    const scheduled = [];
    const setTimeoutFn = vi.fn((fn, delay) => {
      scheduled.push(delay);
      fn();
      return delay;
    });

    renderHiddenEndingOverlay({
      doc,
      win: { innerWidth: 1000, innerHeight: 800 },
      setTimeoutFn,
      restartFromEnding,
      particleSystem: { burstEffect },
      audioEngine: { playResonanceBurst },
      gs: {
        meta: {
          storyPieces: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          inscriptions: { void_heritage: 0 },
        },
      },
      data: {
        inscriptions: {
          void_heritage: { name: 'Void Heritage' },
        },
      },
    });

    const overlay = doc.getElementById('endingScreen');
    expect(overlay).toBeTruthy();
    expect(overlay.children).toHaveLength(5);
    const button = overlay.children[3].children[0];
    button.onclick();
    expect(restartFromEnding).toHaveBeenCalled();

    expect(scheduled).toEqual(expect.arrayContaining([2000, 0, 300, 600, 900, 1200]));
    expect(burstEffect).toHaveBeenCalledTimes(5);
    expect(playResonanceBurst).toHaveBeenCalled();
  });
});
