import { describe, expect, it, vi } from 'vitest';

import {
  appendEndingFragmentChoices,
  applyEndingRank,
  buildEndingScreenDOM,
  ensureEndingScreenStyle,
  populateEndingMeta,
} from '../game/features/ui/public.js';

function createMockElement(tagName = 'div') {
  return {
    tagName: String(tagName).toUpperCase(),
    id: '',
    type: '',
    style: {},
    dataset: {},
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
      progressionSummary: ['검사 · A2', '새 해금 1건'],
      achievements: [{
        id: 'first_victory',
        icon: '🏁',
        title: '첫 승리',
        description: '첫 승리를 달성했다.',
      }],
    });

    expect(root.id).toBe('endingScreen');
    expect(root.innerHTML).not.toContain('btnCodex');
    expect(root.innerHTML).toContain('이번 업적');
    expect(root.innerHTML).toContain('achievementRow');
    expect(root.innerHTML).toContain('이번 귀환');
    expect(root.innerHTML).toContain('progressionRow');
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
    const endingActions = { selectFragment: vi.fn() };
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
      endingActions,
      selectFragment,
      audioEngine: { playEvent, playClick },
    }, 'defeat', session, cleanup);

    expect(parent.children[0].id).toBe('s6b');
    const grid = parent.children[0].children[1];
    expect(grid.children).toHaveLength(3);

    grid.children[0].on_click();

    expect(playEvent).toHaveBeenCalledWith('ui', 'click');
    expect(playClick).not.toHaveBeenCalled();
    expect(endingActions.selectFragment).toHaveBeenCalledWith('echo_boost');
    expect(selectFragment).not.toHaveBeenCalled();
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

  it('renders a hover detail layout for ending deck preview cards', () => {
    const { doc, byId } = createMockDocument();
    doc.defaultView = {
      setTimeout(callback) {
        callback();
        return 1;
      },
    };

    const deckCol = createMockElement('div');
    const deckGrid = createMockElement('div');
    deckGrid.id = 'deckGrid';
    deckCol.appendChild(deckGrid);
    const tlNodes = createMockElement('div');
    tlNodes.id = 'tlNodes';
    const chipRow = createMockElement('div');
    chipRow.id = 'chipRow';
    const pillRow = createMockElement('div');
    pillRow.id = 'pillRow';
    const achievementRow = createMockElement('div');
    achievementRow.id = 'achievementRow';
    const progressionRow = createMockElement('div');
    progressionRow.id = 'progressionRow';
    byId.set('deckGrid', deckGrid);
    byId.set('tlNodes', tlNodes);
    byId.set('chipRow', chipRow);
    byId.set('pillRow', pillRow);
    byId.set('achievementRow', achievementRow);
    byId.set('progressionRow', progressionRow);

    const session = { timers: [] };
    populateEndingMeta(doc, {
      regions: [],
      deck: [{
        icon: '⚡',
        title: 'Spark',
        desc: 'Deal 8 damage.',
        typeLabel: '공격',
        rarityLabel: '희귀',
        costText: '1',
        cls: 'r',
      }],
      chips: [],
      inscriptions: [],
      unlocks: [],
      progressionSummary: ['검사 · A2', '새 해금 1건'],
      achievements: [{
        id: 'first_victory',
        icon: '🏁',
        title: '첫 승리',
        description: '첫 승리를 달성했다.',
      }],
    }, session, { win: doc.defaultView });

    expect(deckCol.children.some((child) => child.id === 'endingDeckDetail')).toBe(true);
    const detail = deckCol.children.find((child) => child.id === 'endingDeckDetail');
    const card = deckGrid.children[0];

    expect(detail.dataset.open).toBe('false');
    card.on_mouseenter?.({ currentTarget: card });
    expect(detail.dataset.open).toBe('true');
    expect(detail.children[1].textContent).toBe('Spark');
    expect(detail.children[3].textContent).toBe('Deal 8 damage.');
    expect(detail.children[2].textContent).toContain('공격');
    expect(detail.children[2].textContent).toContain('희귀');
    expect(detail.children[2].textContent).toContain('비용 1');
    expect(achievementRow.children[0].textContent).toContain('🏁');
    expect(achievementRow.children[0].textContent).toContain('첫 승리');
    expect(progressionRow.children[0].textContent).toContain('검사 · A2');
    expect(progressionRow.children[1].textContent).toContain('새 해금 1건');

    card.on_mouseleave?.({ currentTarget: card, relatedTarget: null });
    expect(detail.dataset.open).toBe('false');
  });
});
