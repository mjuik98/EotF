import { describe, expect, it, vi } from 'vitest';

import {
  buildEchoSkillTooltipTiers,
  hideEchoSkillTooltip,
  showEchoSkillTooltip,
  showTurnBanner,
} from '../game/features/combat/public.js';

class MockElement {
  constructor(doc, tagName = 'div') {
    this.ownerDocument = doc;
    this.tagName = String(tagName).toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.className = '';
    this.style = {};
    this.dataset = {};
    this._innerHTML = '';
    this._textContent = '';
    this.offsetHeight = 80;
    this.offsetWidth = 0;

    this.classList = {
      add: (...tokens) => {
        const next = new Set(this.className.split(/\s+/).filter(Boolean));
        tokens.forEach((token) => next.add(token));
        this.className = [...next].join(' ');
      },
      remove: (...tokens) => {
        const next = new Set(this.className.split(/\s+/).filter(Boolean));
        tokens.forEach((token) => next.delete(token));
        this.className = [...next].join(' ');
      },
      contains: (token) => this.className.split(/\s+/).filter(Boolean).includes(token),
    };

    Object.defineProperty(this, 'id', {
      get: () => this._id || '',
      set: (value) => {
        if (this._id) this.ownerDocument._elements.delete(this._id);
        this._id = value;
        if (value) this.ownerDocument._elements.set(value, this);
      },
    });
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

  appendChild(node) {
    node.parentNode = this;
    this.children.push(node);
    return node;
  }
}

function createDoc() {
  const doc = {
    _elements: new Map(),
    createElement(tagName) {
      return new MockElement(doc, tagName);
    },
    getElementById(id) {
      return this._elements.get(id) || null;
    },
  };
  return doc;
}

describe('combat_hud_feedback', () => {
  it('builds echo tooltip tiers with potential damage replacements', () => {
    const tiers = buildEchoSkillTooltipTiers({
      player: { class: 'berserker', echo: 60 },
      calculatePotentialDamage: (value) => value + 3,
    });

    expect(tiers).toHaveLength(3);
    expect(tiers[0].active).toBe(true);
    expect(tiers[2].active).toBe(false);
    expect(tiers.some((tier) => tier.desc.includes('피해'))).toBe(true);
  });

  it('renders and hides the echo tooltip overlay', () => {
    const doc = createDoc();
    const tooltip = doc.createElement('div');
    tooltip.id = 'echoSkillTooltip';
    const content = doc.createElement('div');
    content.id = 'echoSkillTtContent';
    const win = {
      innerWidth: 1280,
      requestAnimationFrame: (callback) => callback(),
    };
    const event = {
      target: {
        getBoundingClientRect: () => ({ left: 500, top: 120, bottom: 160 }),
      },
    };

    const shown = showEchoSkillTooltip(doc, win, event, {
      player: { class: 'berserker', echo: 2 },
      calculatePotentialDamage: (value) => value,
    });

    expect(shown).toBe(true);
    expect(tooltip.classList.contains('visible')).toBe(true);
    expect(content.children).toHaveLength(3);
    expect(tooltip.style.left).toBe('500px');

    hideEchoSkillTooltip(doc);
    expect(tooltip.classList.contains('visible')).toBe(false);
  });

  it('shows a turn banner and schedules its hide timer', () => {
    const doc = createDoc();
    const banner = doc.createElement('div');
    banner.id = 'turnBanner';
    const timer = vi.fn((callback) => {
      callback();
      return 1;
    });
    const clearTimeout = vi.fn();

    const shown = showTurnBanner(doc, { setTimeout: timer, clearTimeout }, 'enemy');

    expect(shown).toBe(true);
    expect(banner.className).toBe('enemy');
    expect(banner.textContent).toContain('적의 턴');
    expect(clearTimeout).toHaveBeenCalledTimes(1);
    expect(timer).toHaveBeenCalledWith(expect.any(Function), 1200);
    expect(banner.style.display).toBe('none');
  });
});
