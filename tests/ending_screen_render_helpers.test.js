import { describe, expect, it, vi } from 'vitest';

import {
  appendEndingFragmentChoices,
  applyEndingRank,
  buildEndingScreenDOM,
  ensureEndingScreenStyle,
} from '../game/ui/screens/ending_screen_render_helpers.js';

function createMockElement(tagName = 'div') {
  return {
    tagName: String(tagName).toUpperCase(),
    id: '',
    type: '',
    style: {},
    attrs: {},
    children: [],
    parentNode: null,
    innerHTML: '',
    textContent: '',
    className: '',
    disabled: false,
    title: '',
    appendChild(child) {
      child.parentNode = this;
      this.children.push(child);
      return child;
    },
    append(...children) {
      children.forEach((child) => this.appendChild(child));
    },
    insertBefore(child, anchor) {
      child.parentNode = this;
      const index = this.children.indexOf(anchor);
      if (index < 0) {
        this.children.push(child);
        return child;
      }
      this.children.splice(index, 0, child);
      return child;
    },
    addEventListener(type, handler) {
      this[`on_${type}`] = handler;
    },
    removeEventListener(type) {
      delete this[`on_${type}`];
    },
    setAttribute(name, value) {
      this.attrs[name] = value;
    },
    querySelectorAll(selector) {
      if (selector === '.frag-card') {
        return this.children.filter((child) => child.className.includes('frag-card'));
      }
      return [];
    },
  };
}

function createMockDocument() {
  const byId = new Map();
  const doc = {
    head: createMockElement('head'),
    body: createMockElement('body'),
    createElement(tagName) {
      return createMockElement(tagName);
    },
    getElementById(id) {
      return byId.get(id) || null;
    },
  };

  const register = (child) => {
    if (child?.id) byId.set(child.id, child);
    child?.children?.forEach(register);
  };
  const wrapAppend = (element) => {
    const baseAppendChild = element.appendChild.bind(element);
    element.appendChild = (child) => {
      register(child);
      return baseAppendChild(child);
    };
    const baseInsertBefore = element.insertBefore.bind(element);
    element.insertBefore = (child, anchor) => {
      register(child);
      return baseInsertBefore(child, anchor);
    };
  };
  wrapAppend(doc.head);
  wrapAppend(doc.body);

  return { doc, byId };
}

describe('ending_screen_render_helpers', () => {
  it('builds ending markup without the codex button', () => {
    const { doc } = createMockDocument();
    const root = buildEndingScreenDOM(doc, {
      eyebrow: 'eyebrow',
      title: 'title',
      subtitle: 'subtitle',
      stats: [],
    });

    expect(root.id).toBe('endingScreen');
    expect(root.innerHTML).not.toContain('btnCodex');
  });

  it('applies rank text, styles, and sigil attributes', () => {
    const { doc, byId } = createMockDocument();
    ['sg', 'sn', 'ss', 'sr1', 'sr2', 'sr3', 'stri', 'sdot', 'sigilEl'].forEach((id) => {
      const element = createMockElement('div');
      element.id = id;
      byId.set(id, element);
    });

    applyEndingRank(doc, {
      glyph: 'A',
      color: '#c084fc',
      glow: 'rgba(192,132,252,.5)',
      title: '숙련된 공명자',
      label: 'MASTER',
    }, 128);

    expect(doc.getElementById('sg').textContent).toBe('A');
    expect(doc.getElementById('sn').textContent).toBe('숙련된 공명자');
    expect(doc.getElementById('ss').textContent).toBe('MASTER · 128pt');
    expect(doc.getElementById('sr1').attrs.stroke).toBe('#c084fc');
    expect(doc.getElementById('stri').attrs['stroke-opacity']).toBe('.35');
    expect(doc.getElementById('sdot').attrs.fill).toBe('#c084fc');
    expect(doc.getElementById('sigilEl').style.filter).toContain('drop-shadow');
  });

  it('adds fragment choices and wires pick cleanup for non-victory outcomes', () => {
    const { doc, byId } = createMockDocument();
    const parent = createMockElement('div');
    const anchor = createMockElement('div');
    anchor.id = 's7';
    parent.appendChild(anchor);
    byId.set('s7', anchor);

    const cleanup = vi.fn();
    const selectFragment = vi.fn();
    const playEvent = vi.fn();
    const playClick = vi.fn();
    const setTimeout = vi.fn((fn) => {
      fn();
      return 99;
    });
    const session = { timers: [], cleanups: [] };

    appendEndingFragmentChoices(doc, {
      gs: { meta: { echoFragments: 2 } },
      win: { setTimeout },
      selectFragment,
      audioEngine: { playEvent, playClick },
    }, 'defeat', session, cleanup);

    expect(parent.children[0].id).toBe('s6b');
    const grid = parent.children[0].children[1];
    expect(grid.children).toHaveLength(3);

    grid.children[0].on_click();

    expect(playEvent).toHaveBeenCalledWith('ui', 'click');
    expect(playClick).not.toHaveBeenCalled();
    expect(selectFragment).toHaveBeenCalledWith('echo_boost');
    expect(cleanup).toHaveBeenCalledWith({ doc });
    expect(grid.children.every((child) => child.disabled)).toBe(true);
    expect(session.timers).toContain(99);
    expect(session.cleanups).toHaveLength(3);
  });

  it('injects the ending stylesheet only once', () => {
    const { doc } = createMockDocument();

    ensureEndingScreenStyle(doc);
    ensureEndingScreenStyle(doc);

    expect(doc.head.children).toHaveLength(1);
    expect(doc.head.children[0].id).toBe('ending-screen-styles');
    expect(doc.head.children[0].href).toBe('/css/ending_screen.css');
  });
});
