import { describe, expect, it } from 'vitest';

import { renderCodexInscriptions } from '../game/ui/screens/codex_ui_inscriptions.js';

class MockElement {
  constructor(doc, tagName = 'div') {
    this.ownerDocument = doc;
    this.tagName = String(tagName).toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.className = '';
    this.style = {};
    this._innerHTML = '';
    this._textContent = '';
  }

  appendChild(node) {
    node.parentNode = this;
    this.children.push(node);
    return node;
  }

  set innerHTML(value) {
    this._innerHTML = String(value ?? '');
  }

  get innerHTML() {
    return this._innerHTML;
  }

  set textContent(value) {
    this._textContent = String(value ?? '');
    this._innerHTML = '';
    this.children = [];
  }

  get textContent() {
    return this._textContent;
  }
}

function createDoc() {
  return {
    createElement(tagName) {
      return new MockElement(this, tagName);
    },
  };
}

describe('codex_ui_inscriptions', () => {
  it('renders unlocked and locked inscription sections', () => {
    const doc = createDoc();
    const container = new MockElement(doc, 'div');

    renderCodexInscriptions(doc, container, [
      { id: 'echo', name: 'Echo', icon: 'E' },
      { id: 'void', name: 'Void', icon: 'V' },
    ], {
      meta: {
        inscriptions: {
          echo: 2,
          void: 0,
        },
      },
    });

    expect(container.children).toHaveLength(2);
    expect(container.children[0].innerHTML).toContain('해금됨');
    expect(container.children[1].innerHTML).toContain('미해금');
    expect(container.children[0].children[0].children[0].innerHTML).toContain('Echo');
    expect(container.children[1].children[0].children[0].innerHTML).toContain('???');
  });

  it('renders an empty state when there are no inscriptions', () => {
    const doc = createDoc();
    const container = new MockElement(doc, 'div');

    renderCodexInscriptions(doc, container, [], { meta: { inscriptions: {} } });

    expect(container.innerHTML).toContain('기록됩니다');
  });
});
