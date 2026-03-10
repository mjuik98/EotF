import { describe, expect, it, vi } from 'vitest';
import {
  renderBlessingOption,
  renderRewardCardOption,
} from '../game/ui/screens/reward_ui_option_renderers.js';

function querySelectorAllByClass(root, selector) {
  if (typeof selector !== 'string' || !selector.startsWith('.')) return [];
  const required = selector.slice(1).split('.').filter(Boolean);
  const found = [];
  const walk = (node) => {
    for (const child of node.children || []) {
      if (child?.classList && required.every((token) => child.classList.contains(token))) {
        found.push(child);
      }
      walk(child);
    }
  };
  walk(root);
  return found;
}

function createMockElement(tag = 'div') {
  const classes = new Set();
  const attributes = {};
  const element = {
    tagName: String(tag).toUpperCase(),
    children: [],
    style: {},
    dataset: {},
    disabled: false,
    title: '',
    type: '',
    innerHTML: '',
    textContent: '',
    append(...nodes) {
      this.children.push(...nodes);
    },
    appendChild(node) {
      this.children.push(node);
      return node;
    },
    addEventListener: vi.fn(),
    setAttribute(name, value) {
      attributes[name] = String(value);
    },
    getAttribute(name) {
      return attributes[name];
    },
    querySelectorAll(selector) {
      return querySelectorAllByClass(this, selector);
    },
  };

  Object.defineProperty(element, 'className', {
    get() {
      return [...classes].join(' ');
    },
    set(value) {
      classes.clear();
      String(value || '').split(/\s+/).filter(Boolean).forEach((token) => classes.add(token));
    },
    configurable: true,
  });

  element.classList = {
    add: (...tokens) => tokens.forEach((token) => classes.add(token)),
    remove: (...tokens) => tokens.forEach((token) => classes.delete(token)),
    contains: (token) => classes.has(token),
  };

  return element;
}

function createDoc() {
  return {
    createElement: vi.fn((tag) => createMockElement(tag)),
  };
}

describe('reward_ui_option_renderers', () => {
  it('renders a card reward with tooltip wiring and selection callback', () => {
    const container = createMockElement('div');
    const doc = createDoc();
    const tooltipUI = {
      showTooltip: vi.fn(),
      hideTooltip: vi.fn(),
    };
    const onPick = vi.fn();
    const deps = {
      doc,
      tooltipUI,
      DescriptionUtils: {
        highlight: vi.fn((text) => `<b>${text}</b>`),
      },
    };

    renderRewardCardOption(
      container,
      'card_a',
      {
        cards: {
          card_a: {
            name: 'Card A',
            desc: 'Deal 8.',
            rarity: 'rare',
            type: 'attack',
            cost: 2,
            icon: 'A',
          },
        },
      },
      { player: {} },
      deps,
      onPick,
      1,
    );

    expect(container.children).toHaveLength(1);
    const wrapper = container.children[0];
    expect(wrapper.getAttribute('aria-label')).toContain('Card A');
    expect(wrapper.style.animationDelay).toBe('0.08s');
    expect(wrapper.addEventListener).toHaveBeenCalledTimes(3);

    const mouseenter = wrapper.addEventListener.mock.calls.find(([name]) => name === 'mouseenter')[1];
    const mouseleave = wrapper.addEventListener.mock.calls.find(([name]) => name === 'mouseleave')[1];
    const click = wrapper.addEventListener.mock.calls.find(([name]) => name === 'click')[1];

    mouseenter({ type: 'mouseenter' });
    mouseleave();
    click();

    expect(tooltipUI.showTooltip).toHaveBeenCalledWith(
      { type: 'mouseenter' },
      'card_a',
      expect.objectContaining({ data: expect.any(Object), gs: expect.any(Object) }),
    );
    expect(tooltipUI.hideTooltip).toHaveBeenCalledTimes(1);
    expect(wrapper.classList.contains('selected')).toBe(true);
    expect(onPick).toHaveBeenCalledTimes(1);
  });

  it('renders disabled energy blessing badges without click wiring', () => {
    const container = createMockElement('div');
    const doc = createDoc();

    renderBlessingOption(
      container,
      {
        name: 'Energy Blessing',
        icon: 'EN',
        desc: 'Increase max Energy.',
        type: 'energy',
        disabled: true,
        disabledReason: 'Already at maximum energy (5).',
      },
      { doc },
      vi.fn(),
      0,
    );

    const wrapper = container.children[0];
    const card = wrapper.children[0];

    expect(wrapper.disabled).toBe(true);
    expect(wrapper.classList.contains('reward-permanent-energy-disabled')).toBe(true);
    expect(wrapper.title).toContain('(5)');
    expect(card.children.some((child) => child.className === 'reward-disabled-overlay')).toBe(true);
    expect(card.children.some((child) => child.className === 'reward-disabled-state-badge')).toBe(true);
    expect(card.children.some((child) => child.className === 'reward-disabled-reason')).toBe(true);
    expect(wrapper.addEventListener).not.toHaveBeenCalledWith('click', expect.any(Function));
  });
});
