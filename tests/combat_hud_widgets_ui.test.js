import { describe, expect, it, vi } from 'vitest';
import {
  applyNoiseWidgetState,
  resolveNoiseWidgetState,
  updateCombatChainWidgets,
} from '../game/features/combat/public.js';

class MockElement {
  constructor(doc, tagName = 'div') {
    this.ownerDocument = doc;
    this.tagName = String(tagName || 'div').toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.className = '';
    this.style = {};
    this._textContent = '';

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
      toggle: (token, force) => {
        const hasToken = this.classList.contains(token);
        const shouldAdd = force === undefined ? !hasToken : !!force;
        if (shouldAdd) this.classList.add(token);
        else this.classList.remove(token);
        return shouldAdd;
      },
    };

    Object.defineProperty(this, 'id', {
      get: () => this._id || '',
      set: (value) => {
        if (this._id) this.ownerDocument._elements.delete(this._id);
        this._id = value;
        if (value) this.ownerDocument._elements.set(value, this);
      },
    });

    Object.defineProperty(this, 'textContent', {
      get: () => this._textContent,
      set: (value) => {
        this._textContent = String(value ?? '');
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

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  querySelectorAll(selector) {
    const result = [];
    const visit = (node) => {
      if (!(node instanceof MockElement)) return;
      if (selector.startsWith('.')) {
        const token = selector.slice(1);
        if (node.className.split(/\s+/).filter(Boolean).includes(token)) {
          result.push(node);
        }
      }
      node.children.forEach(visit);
    };
    this.children.forEach(visit);
    return result;
  }
}

function createMockDocument() {
  return {
    _elements: new Map(),
    createElement(tagName) {
      return new MockElement(this, tagName);
    },
    getElementById(id) {
      return this._elements.get(id) || null;
    },
  };
}

function createChainDots(doc, id) {
  const el = doc.createElement('div');
  el.id = id;
  for (let index = 0; index < 5; index += 1) {
    const dot = doc.createElement('div');
    dot.className = 'chain-dot';
    el.appendChild(dot);
  }
  return el;
}

describe('combat_hud_widgets_ui', () => {
  it('updates both chain widgets and burst state', () => {
    const doc = createMockDocument();
    const chainCount = doc.createElement('div');
    chainCount.id = 'chainCount';
    const chainDots = createChainDots(doc, 'chainDots');
    const combatChainInline = doc.createElement('div');
    combatChainInline.id = 'combatChainInline';
    const combatChainCount = doc.createElement('div');
    combatChainCount.id = 'combatChainCount';
    const combatChainDots = createChainDots(doc, 'combatChainDots');

    updateCombatChainWidgets(doc, 5, true);

    expect(chainCount.textContent).toBe('5');
    expect(chainCount.classList.contains('burst')).toBe(true);
    expect(combatChainInline.style.display).toBe('flex');
    expect(chainDots.querySelectorAll('.chain-dot').every((dot) => dot.classList.contains('burst-dot'))).toBe(true);
    expect(combatChainCount.classList.contains('burst')).toBe(true);
    expect(combatChainDots.querySelectorAll('.chain-dot').every((dot) => dot.classList.contains('burst-dot'))).toBe(true);
  });

  it('resolves silence-city and time-wasteland noise widget states', () => {
    expect(resolveNoiseWidgetState({
      combat: { active: true },
      _activeRegionId: 1,
      player: { silenceGauge: 8, timeRiftGauge: 0 },
    })).toEqual(expect.objectContaining({
      visible: true,
      gauge: 8,
      isWarn: true,
      fillColor: 'var(--danger)',
      warnDisplay: 'block',
    }));

    expect(resolveNoiseWidgetState({
      combat: { active: true },
      currentRegion: 'unknown',
      player: { silenceGauge: 0, timeRiftGauge: 4 },
    }, vi.fn(() => 5))).toEqual(expect.objectContaining({
      visible: true,
      gauge: 4,
      isWarn: false,
      fillColor: '#b066ff',
      warnDisplay: 'none',
    }));
  });

  it('applies resolved noise widget state to the DOM and hides inactive widgets', () => {
    const doc = createMockDocument();
    const widget = doc.createElement('div');
    widget.id = 'noiseWidget';
    const title = doc.createElement('div');
    title.className = 'nw-title';
    widget.appendChild(title);
    const dots = doc.createElement('div');
    dots.id = 'nwDots';
    const fill = doc.createElement('div');
    fill.id = 'nwBarFill';
    const val = doc.createElement('div');
    val.id = 'nwVal';
    const warn = doc.createElement('div');
    warn.id = 'nwWarn';

    applyNoiseWidgetState(doc, {
      visible: true,
      title: 'noise',
      pct: 40,
      fillColor: '#b066ff',
      valueText: '4 / 10',
      warnText: 'warn',
      warnDisplay: 'none',
      borderColor: 'rgba(130,51,255,0.3)',
      boxShadow: '0 0 20px rgba(130,51,255,0.1)',
      dots: Array.from({ length: 10 }, (_, index) => ({ active: index < 4, warn: false })),
    });

    expect(widget.style.display).toBe('flex');
    expect(title.textContent).toBe('noise');
    expect(dots.children).toHaveLength(10);
    expect(fill.style.width).toBe('40%');
    expect(val.textContent).toBe('4 / 10');
    expect(warn.style.display).toBe('none');

    applyNoiseWidgetState(doc, { visible: false });
    expect(widget.style.display).toBe('none');
  });
});
