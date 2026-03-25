import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import {
  renderBlessingOption,
  renderItemOption,
  renderRewardCardOption,
} from '../game/features/reward/public.js';

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
    getBoundingClientRect() {
      return { left: 10, right: 180, top: 20 };
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
  it('keeps non-playable dimming scoped to combat hand cards so reward cards stay fully lit', () => {
    const source = readFileSync(path.join(process.cwd(), 'css/styles.css'), 'utf8');

    expect(source).toContain('.combat-hand-cards .card:not(.playable) {');
    expect(source).not.toContain('/* 사용 불가 카드 — 전체 투명도/채도 낮춤 */\n.card:not(.playable) {');
  });

  it('styles reward card descriptions for hover-like readability without reusing hover classes', () => {
    const source = readFileSync(path.join(process.cwd(), 'css/styles.css'), 'utf8');

    expect(source).toMatch(/\.card-desc-reward,\s*\.reward-card-desc \{\s*display: block;\s*font-size: 11\.5px;\s*line-height: 1\.66;\s*color: rgba\(224, 218, 242, 0\.94\);\s*text-align: left;\s*word-break: keep-all;\s*overflow-wrap: anywhere;\s*\}/);
    expect(source).toContain('.reward-card-wrapper:focus-visible {');
    expect(source).toContain('outline: 2px solid rgba(0, 255, 204, 0.9);');
  });

  it('keeps reward description keyword highlights aligned with comparison-card palette', () => {
    const source = readFileSync(path.join(process.cwd(), 'css/styles.css'), 'utf8');

    expect(source).toContain('.reward-card-desc .kw-dmg');
    expect(source).toContain('.reward-card-desc .kw-echo');
    expect(source).toContain('.reward-card-desc .kw-energy');
    expect(source).toContain('.reward-card-desc .kw-exhaust.kw-block');
  });

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
    expect(wrapper.getAttribute('aria-label')).toBe('Card A 카드 보상');
    expect(wrapper.style.animationDelay).toBe('0.08s');
    expect(wrapper.addEventListener).toHaveBeenCalledTimes(5);
    const card = wrapper.children[0];
    expect(card.className).toContain('card-frame-variant-reward');
    expect(card.className).toContain('reward-card-shell');
    expect(card.children.some((child) => child.className === 'card-rarity-strip card-rarity-strip-rare')).toBe(true);
    expect(card.children.some((child) => child.className === 'card-crystal-facet card-crystal-facet-type-attack')).toBe(true);
    expect(card.children.some((child) => String(child.className).includes('card-desc-reward'))).toBe(true);

    const mouseenter = wrapper.addEventListener.mock.calls.find(([name]) => name === 'mouseenter')[1];
    const mouseleave = wrapper.addEventListener.mock.calls.find(([name]) => name === 'mouseleave')[1];
    const focus = wrapper.addEventListener.mock.calls.find(([name]) => name === 'focus')[1];
    const blur = wrapper.addEventListener.mock.calls.find(([name]) => name === 'blur')[1];
    const click = wrapper.addEventListener.mock.calls.find(([name]) => name === 'click')[1];

    mouseenter({ type: 'mouseenter' });
    focus({ type: 'focus' });
    mouseleave();
    blur();
    click();

    expect(tooltipUI.showTooltip).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'mouseenter', currentTarget: wrapper }),
      'card_a',
      expect.objectContaining({ data: expect.any(Object), gs: expect.any(Object) }),
    );
    expect(tooltipUI.showTooltip).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'focus', currentTarget: wrapper }),
      'card_a',
      expect.objectContaining({ data: expect.any(Object), gs: expect.any(Object) }),
    );
    expect(tooltipUI.hideTooltip).toHaveBeenCalledTimes(3);
    expect(wrapper.classList.contains('selected')).toBe(true);
    expect(onPick).toHaveBeenCalledTimes(1);
  });

  it('adds a high-roll badge to upgraded reward cards only', () => {
    const container = createMockElement('div');
    const doc = createDoc();

    renderRewardCardOption(
      container,
      'card_plus',
      {
        cards: {
          card_plus: {
            name: 'Card A+',
            desc: 'Deal 12.',
            rarity: 'rare',
            type: 'attack',
            cost: 2,
            icon: 'A',
            upgraded: true,
          },
        },
      },
      { player: {} },
      { doc },
      vi.fn(),
      0,
    );

    const upgradedWrapper = container.children[0];
    expect(upgradedWrapper.classList.contains('reward-upgraded-card')).toBe(true);
    expect(upgradedWrapper.title).toContain('강화 카드');
    const badge = upgradedWrapper.children.find((child) => child.className === 'reward-upgraded-highroll-badge');
    expect(badge).toBeTruthy();
    expect(badge.textContent).toBe('강화 카드');
  });

  it('renders item rewards through the shared shell and item tooltip wiring', () => {
    const container = createMockElement('div');
    const doc = createDoc();
    const tooltipUI = {
      showItemTooltip: vi.fn(),
      hideItemTooltip: vi.fn(),
    };

    renderItemOption(
      container,
      {
        id: 'relic_a',
        name: 'Boss Relic A',
        desc: 'Gain 1 energy.',
        rarity: 'rare',
        icon: 'R',
      },
      { doc, tooltipUI },
      vi.fn(),
      2,
    );

    const wrapper = container.children[0];
    const card = wrapper.children[0];
    const type = card.children.find((child) => String(child.className).includes('reward-card-type'));
    const mouseenter = wrapper.addEventListener.mock.calls.find(([name]) => name === 'mouseenter')[1];
    const mouseleave = wrapper.addEventListener.mock.calls.find(([name]) => name === 'mouseleave')[1];
    const focus = wrapper.addEventListener.mock.calls.find(([name]) => name === 'focus')[1];
    const blur = wrapper.addEventListener.mock.calls.find(([name]) => name === 'blur')[1];

    expect(wrapper.getAttribute('aria-label')).toBe('Boss Relic A 유물 보상');
    expect(card.className).toContain('reward-card-shell');
    expect(card.className).toContain('reward-item-card');
    expect(type.textContent).toBe('유물 · 희귀');

    mouseenter({ type: 'mouseenter' });
    focus({ type: 'focus' });
    mouseleave();
    blur();
    wrapper.addEventListener.mock.calls.find(([name]) => name === 'click')[1]();

    expect(tooltipUI.showItemTooltip).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'mouseenter', currentTarget: wrapper }),
      'relic_a',
      expect.objectContaining({ data: expect.anything() }),
    );
    expect(tooltipUI.showItemTooltip).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'focus', currentTarget: wrapper }),
      'relic_a',
      expect.objectContaining({ data: expect.anything() }),
    );
    expect(tooltipUI.hideItemTooltip).toHaveBeenCalledTimes(3);
  });

  it('renders blessing rewards with general tooltip wiring', () => {
    const container = createMockElement('div');
    const doc = createDoc();
    const tooltipUI = {
      showGeneralTooltip: vi.fn(),
      hideGeneralTooltip: vi.fn(),
    };

    renderBlessingOption(
      container,
      {
        name: '체력의 축복',
        icon: 'HP',
        desc: '최대 체력이 영구히 증가합니다.',
      },
      { doc, tooltipUI },
      vi.fn(),
      0,
    );

    const wrapper = container.children[0];
    const card = wrapper.children[0];
    const mouseenter = wrapper.addEventListener.mock.calls.find(([name]) => name === 'mouseenter')[1];
    const mouseleave = wrapper.addEventListener.mock.calls.find(([name]) => name === 'mouseleave')[1];
    const focus = wrapper.addEventListener.mock.calls.find(([name]) => name === 'focus')[1];
    const blur = wrapper.addEventListener.mock.calls.find(([name]) => name === 'blur')[1];

    expect(wrapper.getAttribute('aria-label')).toBe('체력의 축복 축복 보상');
    expect(card.className).toContain('reward-card-shell');

    mouseenter({ type: 'mouseenter' });
    focus({ type: 'focus' });
    mouseleave();
    blur();
    wrapper.addEventListener.mock.calls.find(([name]) => name === 'click')[1]();

    expect(tooltipUI.showGeneralTooltip).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'mouseenter', currentTarget: wrapper }),
      '체력의 축복',
      '최대 체력이 영구히 증가합니다.',
      expect.objectContaining({ doc }),
    );
    expect(tooltipUI.showGeneralTooltip).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'focus', currentTarget: wrapper }),
      '체력의 축복',
      '최대 체력이 영구히 증가합니다.',
      expect.objectContaining({ doc }),
    );
    expect(tooltipUI.hideGeneralTooltip).toHaveBeenCalledTimes(3);
  });

  it('renders disabled energy blessing badges without click wiring', () => {
    const container = createMockElement('div');
    const doc = createDoc();

    renderBlessingOption(
      container,
      {
        name: '에너지의 축복',
        icon: 'EN',
        desc: '최대 에너지가 영구히 1 증가합니다.',
        type: 'energy',
        disabled: true,
        disabledReason: '이미 최대 에너지 (5)입니다.',
      },
      { doc },
      vi.fn(),
      0,
    );

    const wrapper = container.children[0];
    const card = wrapper.children[0];

    expect(wrapper.disabled).toBe(false);
    expect(wrapper.getAttribute('aria-disabled')).toBe('true');
    expect(wrapper.classList.contains('reward-permanent-energy-disabled')).toBe(true);
    expect(wrapper.title).toContain('(5)');
    expect(card.children.some((child) => child.className === 'reward-disabled-overlay')).toBe(true);
    expect(card.children.some((child) => child.className === 'reward-disabled-state-badge')).toBe(true);
    expect(card.children.some((child) => child.className === 'reward-disabled-reason')).toBe(true);
    expect(wrapper.addEventListener.mock.calls.some(([name]) => name === 'focus')).toBe(true);
    expect(wrapper.addEventListener.mock.calls.some(([name]) => name === 'blur')).toBe(true);
    expect(wrapper.addEventListener).not.toHaveBeenCalledWith('click', expect.any(Function));
  });
});
