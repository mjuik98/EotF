import { describe, expect, it, vi } from 'vitest';
import { renderCodexFilterBar } from '../game/ui/screens/codex_ui_filter_render.js';

class MockElement {
  constructor() {
    this.tagName = 'DIV';
    this.children = [];
    this.className = '';
    this.textContent = '';
    this.innerHTML = '';
    this.listeners = {};
  }

  appendChild(node) {
    this.children.push(node);
    return node;
  }

  addEventListener(type, handler) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(handler);
  }
}

function createDoc() {
  const bar = new MockElement();
  return {
    bar,
    createElement(tagName) {
      const node = new MockElement();
      node.tagName = String(tagName).toUpperCase();
      return node;
    },
    getElementById(id) {
      return id === 'cxFilterBar' ? bar : null;
    },
  };
}

describe('codex_ui_filter_render', () => {
  it('renders filter pills and wires callbacks', () => {
    const doc = createDoc();
    const onFilterChange = vi.fn();
    const onToggleUnknown = vi.fn();

    renderCodexFilterBar(doc, {
      definitions: [{ k: 'all', l: '전체' }, null, { k: 'boss', l: '보스', c: 'f-boss' }],
      filter: 'boss',
      showUnknown: false,
      onFilterChange,
      onToggleUnknown,
    });

    const buttons = doc.bar.children.filter((child) => child.tagName === 'BUTTON');
    buttons[0].listeners.click[0]();
    buttons[2].listeners.click[0]();

    expect(buttons[0].className).toBe('cx-filter-pill');
    expect(buttons[0].textContent).toBe('전체');
    expect(buttons[1].className).toContain('f-boss');
    expect(buttons[2].innerHTML).toContain('cx-toggle-track ');
    expect(onFilterChange).toHaveBeenCalledWith('all');
    expect(onToggleUnknown).toHaveBeenCalledTimes(1);
  });
});
