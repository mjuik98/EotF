import { describe, expect, it, vi } from 'vitest';
import {
  createCodexItemCard,
  renderCodexEmpty,
} from '../game/ui/screens/codex_ui_entry_renderers.js';

class MockElement {
  constructor(doc, tagName = 'div') {
    this.ownerDocument = doc;
    this.tagName = String(tagName).toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.className = '';
    this.dataset = {};
    this.style = {
      setProperty: vi.fn(),
    };
    this.listeners = {};
    this._innerHTML = '';
    this._textContent = '';

    this.classList = {
      add: (...tokens) => {
        const next = new Set(this.className.split(/\s+/).filter(Boolean));
        tokens.forEach((token) => next.add(token));
        this.className = [...next].join(' ');
      },
      contains: (token) => this.className.split(/\s+/).filter(Boolean).includes(token),
    };

    Object.defineProperty(this, 'innerHTML', {
      get: () => this._innerHTML,
      set: (value) => {
        this._innerHTML = String(value ?? '');
      },
    });

    Object.defineProperty(this, 'textContent', {
      get: () => this._textContent,
      set: (value) => {
        this._textContent = String(value ?? '');
        this._innerHTML = '';
        this.children = [];
      },
    });
  }

  appendChild(node) {
    if (!node) return node;
    node.parentNode = this;
    this.children.push(node);
    return node;
  }

  addEventListener(type, handler) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(handler);
  }
}

function createDoc() {
  return {
    createElement(tagName) {
      return new MockElement(this, tagName);
    },
  };
}

describe('codex_ui_entry_renderers', () => {
  it('renders a seen item card with set styling and open handler', () => {
    const doc = createDoc();
    const onOpen = vi.fn();
    const card = createCodexItemCard(doc, {
      id: 'relic_a',
      name: 'Relic A',
      icon: '✦',
      rarity: 'legendary',
      set: 'echo',
    }, 0, {
      gs: {
        meta: {
          codex: { enemies: new Set(), cards: new Set(), items: new Set(['relic_a']) },
        },
      },
      data: {
        itemSets: {
          echo: {
            name: 'Echo Set',
            color: '#00ffcc',
            border: 'rgba(0,255,204,.4)',
          },
        },
      },
      onOpen,
    });

    expect(card.innerHTML).toContain('Relic A');
    expect(card.innerHTML).toContain('Echo Set');
    expect(card.style.setProperty).toHaveBeenCalledWith('--cx-card-border', 'rgba(0,255,204,.4)');
    expect(card.listeners.click).toHaveLength(1);

    card.listeners.click[0]();
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('renders an empty codex state message', () => {
    const container = { innerHTML: '' };

    renderCodexEmpty(container, 'No entries.');

    expect(container.innerHTML).toContain('No entries.');
    expect(container.innerHTML).toContain('cx-empty-state');
  });
});
