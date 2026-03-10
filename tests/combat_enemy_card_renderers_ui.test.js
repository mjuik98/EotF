import { describe, expect, it } from 'vitest';
import {
  appendEnemySelectionLabel,
  applyEnemyDeadState,
  renderEnemyHealthSection,
  renderEnemyIntentNode,
  syncEnemyPreviewState,
  syncEnemySelectionState,
} from '../game/ui/combat/combat_enemy_card_renderers_ui.js';

class MockElement {
  constructor(doc, tagName = 'div') {
    this.ownerDocument = doc;
    this.tagName = String(tagName || 'div').toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.className = '';
    this.style = {};
    this._textContent = '';
    this.innerHTML = '';

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

  append(...nodes) {
    nodes.forEach((node) => this.appendChild(node));
  }

  appendChild(node) {
    if (!node) return node;
    if (node.parentNode) {
      node.parentNode.children = node.parentNode.children.filter((child) => child !== node);
    }
    node.parentNode = this;
    this.children.push(node);
    return node;
  }

  prepend(node) {
    if (!node) return node;
    if (node.parentNode) {
      node.parentNode.children = node.parentNode.children.filter((child) => child !== node);
    }
    node.parentNode = this;
    this.children.unshift(node);
    return node;
  }

  remove() {
    if (!this.parentNode) return;
    this.parentNode.children = this.parentNode.children.filter((child) => child !== this);
    this.parentNode = null;
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
        if (node.className.split(/\s+/).filter(Boolean).includes(token)) result.push(node);
      }
      node.children.forEach(visit);
    };
    this.children.forEach(visit);
    return result;
  }
}

function createDoc() {
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

describe('combat_enemy_card_renderers_ui', () => {
  it('renders boss health section and combined intent content', () => {
    const doc = createDoc();
    const card = doc.createElement('div');
    const intentEl = doc.createElement('div');

    renderEnemyHealthSection({
      card,
      doc,
      index: 0,
      enemy: { isBoss: true, phase: 1, maxPhase: 3 },
      hpPct: 64,
      hpBarBackground: '#123',
    });
    renderEnemyIntentNode({
      intentEl,
      doc,
      intentIcon: '!',
      intentLabelHtml: '<b>Attack</b>',
      intentDmgVal: 12,
      combinedLabelHtml: '! <b>Attack</b>',
    });

    expect(card.querySelector('.boss-phase-bar')).not.toBeNull();
    expect(doc.getElementById('enemy_hpfill_0').style.width).toBe('64%');
    expect(card.children[1].children).toHaveLength(3);
    expect(intentEl.children[0].innerHTML).toContain('Attack');
    expect(intentEl.children[1].textContent).toBe('12');
  });

  it('syncs selection, preview, and dead presentation states', () => {
    const doc = createDoc();
    const card = doc.createElement('div');

    appendEnemySelectionLabel(card, doc, '>>');
    expect(card.querySelector('.target-label-anim')).not.toBeNull();

    syncEnemySelectionState({
      card,
      doc,
      isSelected: true,
      selectedMarkerText: '>>',
    });
    expect(card.classList.contains('selected-target')).toBe(true);

    syncEnemyPreviewState({ card, doc, previewText: '6 dmg' });
    expect(card.querySelector('.enemy-dmg-preview')?.textContent).toBe('6 dmg');

    syncEnemySelectionState({
      card,
      doc,
      isSelected: false,
      selectedMarkerText: '>>',
    });
    syncEnemyPreviewState({ card, doc, previewText: '' });
    expect(card.querySelector('.target-label-anim')).toBeNull();
    expect(card.querySelector('.enemy-dmg-preview')).toBeNull();

    applyEnemyDeadState(card);
    expect(card.style.opacity).toBe('0.3');
    expect(card.style.filter).toBe('grayscale(1)');
    expect(card.style.pointerEvents).toBe('none');
  });
});
