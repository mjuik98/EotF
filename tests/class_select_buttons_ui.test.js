import { describe, expect, it, vi } from 'vitest';
import { renderClassSelectButtons } from '../game/ui/title/class_select_buttons_ui.js';
import { CLASS_METADATA } from '../data/class_metadata.js';
import { readFileSync } from 'node:fs';

function createInteractiveNode() {
  const listeners = {};
  return {
    style: {},
    dataset: {},
    listeners,
    addEventListener: vi.fn((name, handler) => {
      listeners[name] = handler;
    }),
    setAttribute: vi.fn(function setAttribute(name, value) {
      this[name] = String(value);
    }),
  };
}

function createGenericNode() {
  return {
    className: '',
    style: {},
    dataset: {},
    children: [],
    _textContent: '',
    appendChild(node) {
      this.children.push(node);
      return node;
    },
    append(...nodes) {
      nodes.forEach((node) => this.appendChild(node));
    },
    setAttribute(name, value) {
      this[name] = String(value);
    },
    get textContent() {
      return this._textContent;
    },
    set textContent(value) {
      this._textContent = value == null ? '' : String(value);
      this.children = [];
    },
  };
}

function createButtonNode() {
  const trait = createInteractiveNode();
  const relic = createInteractiveNode();
  return {
    id: '',
    className: '',
    dataset: {},
    innerHTML: '',
    children: [],
    appendChild(node) {
      this.children.push(node);
      return node;
    },
    querySelector: vi.fn((selector) => {
      if (selector === '.class-btn-trait') return trait;
      if (selector === '.class-btn-relic') return relic;
      return null;
    }),
    _trait: trait,
    _relic: relic,
  };
}

describe('class select buttons helper', () => {
  it('renders trait tooltip wiring and a shared relic detail panel instead of relic tooltips', () => {
    const appended = [];
    const container = {
      innerHTML: 'stale',
      appendChild: vi.fn((node) => appended.push(node)),
    };
    const showTooltip = vi.fn();
    const hideTooltip = vi.fn();
    const doc = {
      createElement: vi.fn((tagName) => (tagName === 'button' ? createButtonNode() : createGenericNode())),
    };

    renderClassSelectButtons(container, {
      doc,
      showTooltip,
      hideTooltip,
      rarityLabels: { common: '일반' },
      data: {
        classes: {
          swordsman: {
            id: 0,
            emoji: '🗡️',
            name: '잔향검사',
            style: 'swordsman',
            desc: 'desc',
            traitName: '공명',
            traitTitle: '공명',
            traitDesc: 'trait desc',
            startRelic: 'dull_blade',
          },
        },
        items: {
          dull_blade: {
            icon: '⚔',
            name: '둔검',
            rarity: 'common',
            desc: 'item desc',
          },
        },
      },
    });

    expect(container.innerHTML).toBe('');
    expect(appended).toHaveLength(2);
    const button = appended[0];
    const relicPanel = appended[1];
    expect(button.id).toBe('class_0');
    expect(button.dataset.class).toBe(0);
    expect(button.innerHTML).toContain('잔향검사');
    expect(relicPanel.className).toContain('class-select-relic-panel');

    button._trait.listeners.mouseenter({ stopPropagation: vi.fn() });
    expect(showTooltip).toHaveBeenCalledWith(expect.anything(), '공명', 'trait desc');
    button._trait.listeners.mouseleave();
    expect(hideTooltip).toHaveBeenCalledTimes(1);

    button._relic.listeners.mouseenter({ stopPropagation: vi.fn() });
    expect(showTooltip).toHaveBeenCalledTimes(1);
    expect(relicPanel.children[0].children[0].children[0].textContent).toContain('둔검');
    expect(relicPanel.children[0].children[1].textContent).toContain('item desc');
    expect(button._relic['aria-controls']).toBe('classSelectRelicDetail');
  });

  it('keeps the long-form class descriptions short enough for a single-line card layout', () => {
    expect(CLASS_METADATA.mage.desc).toBe('카드 흐름을 왜곡하는 공명 마법사.');
    expect(CLASS_METADATA.paladin.desc).toBe('치유의 선율로 전선을 지키는 성기사.');
    expect(CLASS_METADATA.berserker.desc).toBe('상처를 힘으로 바꾸는 파열의 투사.');
    expect(CLASS_METADATA.guardian.desc).toBe('무음의 장벽으로 전선을 지키는 수호자.');
  });

  it('styles class descriptions as a single-line caption with ellipsis fallback', () => {
    const css = readFileSync(new URL('../css/styles.css', import.meta.url), 'utf8');

    expect(css).toContain('.class-btn-desc');
    expect(css).toContain('white-space: nowrap;');
    expect(css).toContain('overflow: hidden;');
    expect(css).toContain('text-overflow: ellipsis;');
  });

  it('styles the shared class relic detail panel as an inline layout block', () => {
    const css = readFileSync(new URL('../css/styles.css', import.meta.url), 'utf8');

    expect(css).toContain('.class-select-relic-panel');
    expect(css).toContain('.class-select-relic-panel[data-open=\'true\']');
    expect(css).toContain('.class-select-relic-panel .crp-title');
  });

  it('keeps class relic and trait rows as full-width interactive lines', () => {
    const css = readFileSync(new URL('../css/styles.css', import.meta.url), 'utf8');

    expect(css).toMatch(/\.class-btn-trait,\s*\.class-btn-relic\s*\{[^}]*display:\s*block;/s);
    expect(css).toMatch(/\.class-btn-trait,\s*\.class-btn-relic\s*\{[^}]*width:\s*100%;/s);
    expect(css).toMatch(/\.class-btn-trait,\s*\.class-btn-relic\s*\{[^}]*box-sizing:\s*border-box;/s);
  });
});
