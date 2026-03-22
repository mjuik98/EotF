import { describe, expect, it } from 'vitest';

import { updateCombatLog } from '../game/ui/combat/combat_hud_log_ui.js';

class MockElement {
  constructor(doc, tagName = 'div') {
    this.ownerDocument = doc;
    this.tagName = String(tagName).toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.className = '';
    this.style = {};
    this.dataset = {};
    this.scrollTop = 0;
    this.scrollHeight = 240;
    this._innerHTML = '';
    this._textContent = '';

    Object.defineProperty(this, 'id', {
      get: () => this._id || '',
      set: (value) => {
        if (this._id) this.ownerDocument._elements.delete(this._id);
        this._id = value;
        if (value) this.ownerDocument._elements.set(value, this);
      },
    });
  }

  set textContent(value) {
    this._textContent = String(value ?? '');
    this._innerHTML = '';
    this.children = [];
  }

  get textContent() {
    if (this.children.length > 0) {
      return this.children.map((child) => child.textContent).join('');
    }
    return this._textContent;
  }

  appendChild(node) {
    node.parentNode = this;
    this.children.push(node);
    return node;
  }

  removeChild(node) {
    const index = this.children.indexOf(node);
    if (index >= 0) {
      this.children.splice(index, 1);
      node.parentNode = null;
    }
    return node;
  }

  remove() {
    if (this.parentNode) this.parentNode.removeChild(this);
  }

  get firstChild() {
    return this.children[0] || null;
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

function createLogSurfaces(doc) {
  const combatLog = doc.createElement('div');
  combatLog.id = 'combatLog';

  const recentCombatFeed = doc.createElement('div');
  recentCombatFeed.id = 'recentCombatFeed';

  return { combatLog, recentCombatFeed };
}

describe('combat_hud_log_ui', () => {
  it('renders new logs and scrolls when entries are appended', () => {
    const doc = createDoc();
    const { combatLog, recentCombatFeed } = createLogSurfaces(doc);

    const updated = updateCombatLog(doc, [
      { id: 'a', msg: 'Player attacks', type: 'attack' },
      { id: 'b', msg: 'Enemy is stunned', type: 'status' },
    ]);

    expect(updated).toBe(true);
    expect(combatLog.children).toHaveLength(2);
    expect(combatLog.children[0].dataset.logId).toBe('a');
    expect(combatLog.children[1].className).toBe('log-entry status');
    expect(combatLog.scrollTop).toBe(combatLog.scrollHeight);
    expect(recentCombatFeed.children).toHaveLength(1);
    expect(recentCombatFeed.children[0].textContent).toBe('Enemy is stunned');
  });

  it('updates existing id-based entries, prunes stale nodes, and keeps recent limit', () => {
    const doc = createDoc();
    const { combatLog, recentCombatFeed } = createLogSurfaces(doc);

    updateCombatLog(doc, [
      { id: 'a', msg: 'Old A', type: 'attack' },
      { id: 'b', msg: 'Old B', type: 'status' },
    ]);
    combatLog.scrollTop = 0;

    updateCombatLog(doc, [
      { id: 'b', msg: '🃏 [방호]: 방어막 +6', type: 'buff' },
      { id: 'c', msg: 'New C', type: 'attack' },
    ]);

    expect(combatLog.children).toHaveLength(2);
    expect(combatLog.children[0].dataset.logId).toBe('b');
    expect(combatLog.children[0].textContent).toBe('🃏 [방호]: 방어막 +6');
    expect(combatLog.children[0].className).toBe('log-entry buff');
    expect(combatLog.children[0].style.animation).toBe('none');
    expect(combatLog.children[1].dataset.logId).toBe('c');
    expect(combatLog.scrollTop).toBe(combatLog.scrollHeight);
    expect(recentCombatFeed.children).toHaveLength(1);
    expect(recentCombatFeed.children[0].textContent).toBe('🃏 [방호]: 방어막 +6');
  });

  it('deduplicates id-less messages and clears the container when logs become empty', () => {
    const doc = createDoc();
    const { combatLog, recentCombatFeed } = createLogSurfaces(doc);

    updateCombatLog(doc, [
      { msg: 'Repeated line', type: 'info' },
      { msg: 'Repeated line', type: 'info' },
      { msg: 'Unique line', type: 'info' },
    ]);

    expect(combatLog.children).toHaveLength(2);
    expect(combatLog.children[0].textContent).toBe('Repeated line');
    expect(combatLog.children[1].textContent).toBe('Unique line');
    expect(recentCombatFeed.children).toHaveLength(0);

    updateCombatLog(doc, []);
    expect(combatLog.children).toHaveLength(0);
    expect(combatLog.textContent).toBe('');
    expect(recentCombatFeed.children).toHaveLength(0);
  });

  it('renders only the latest 3 eligible entries into the recent combat feed', () => {
    const doc = createDoc();
    const { recentCombatFeed } = createLogSurfaces(doc);

    updateCombatLog(doc, [
      { id: 'sys', msg: '⚔️ 전투 시작!', type: 'system' },
      { id: 'card-1', msg: '🃏 [베기] → 슬라임: 4 피해', type: 'card-log' },
      { id: 'enemy', msg: '⚔️ 적 → 플레이어: 7 피해', type: 'damage' },
      { id: 'buff', msg: '🃏 [방호]: 방어막 +6', type: 'buff' },
      { id: 'echo', msg: '✨ 공명 폭발: 10 피해!', type: 'echo' },
      { id: 'card-2', msg: '🃏 [응급 처치]: 5 회복', type: 'card-log' },
    ]);

    expect(recentCombatFeed.children).toHaveLength(3);
    expect(recentCombatFeed.children[0].dataset.logId).toBe('buff');
    expect(recentCombatFeed.children[1].dataset.logId).toBe('echo');
    expect(recentCombatFeed.children[2].dataset.logId).toBe('card-2');
  });
});
