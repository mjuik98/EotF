import { describe, expect, it } from 'vitest';

import {
  bindItemDetailDismissStrategy,
  clearItemDetailSurface,
  createManagedItemDetailSurface,
  createItemDetailSurfaceController,
  renderItemDetailSurface,
} from '../game/shared/ui/item_detail/item_detail_panel_ui.js';

class MockElement {
  constructor(doc, tagName = 'div') {
    this.ownerDocument = doc;
    this.tagName = String(tagName).toUpperCase();
    this.children = [];
    this.parentNode = null;
    this._textContent = '';
    this.className = '';
    this.style = {};
    this.dataset = {};
    this._listeners = new Map();

    Object.defineProperty(this, 'textContent', {
      get: () => this._textContent,
      set: (value) => {
        this._textContent = value == null ? '' : String(value);
        if (this.children.length) {
          this.children.forEach((child) => {
            child.parentNode = null;
          });
          this.children = [];
        }
      },
    });
  }

  append(...nodes) {
    nodes.forEach((node) => this.appendChild(node));
  }

  appendChild(node) {
    if (!node) return node;
    node.parentNode = this;
    this.children.push(node);
    return node;
  }

  contains(node) {
    if (node === this) return true;
    return this.children.some((child) => child?.contains?.(node));
  }

  setAttribute(name, value) {
    this[name] = String(value);
  }

  addEventListener(type, handler) {
    this._listeners.set(type, handler);
  }

  removeEventListener(type, handler) {
    if (this._listeners.get(type) === handler) this._listeners.delete(type);
  }
}

function createDoc() {
  const listeners = new Map();
  const viewListeners = new Map();
  const doc = {
    defaultView: {
      addEventListener(type, handler) {
        viewListeners.set(type, handler);
      },
      removeEventListener(type, handler) {
        if (viewListeners.get(type) === handler) viewListeners.delete(type);
      },
      requestAnimationFrame(callback) {
        callback();
      },
    },
    createElement(tagName) {
      return new MockElement(doc, tagName);
    },
    addEventListener(type, handler) {
      listeners.set(type, handler);
    },
    removeEventListener(type, handler) {
      if (listeners.get(type) === handler) listeners.delete(type);
    },
    dispatch(type, event) {
      listeners.get(type)?.(event);
    },
    dispatchView(type, event) {
      viewListeners.get(type)?.(event);
    },
  };
  return doc;
}

describe('item_detail_surface_ui', () => {
  it('renders shared open state and active entry markers', () => {
    const doc = createDoc();
    const detailPanel = doc.createElement('div');
    const detailList = doc.createElement('div');
    const entriesRoot = doc.createElement('div');
    const firstEntry = doc.createElement('button');
    const secondEntry = doc.createElement('button');
    entriesRoot.append(firstEntry, secondEntry);

    renderItemDetailSurface({
      doc,
      detailPanel,
      detailPanelList: detailList,
      entriesRoot,
      activeEntry: secondEntry,
      detail: {
        icon: '✧',
        title: '공유 패널',
        rarityLabel: '전설',
        triggerText: '전투 시작 시',
        desc: '설명 노출',
      },
      itemId: 'shared_relic',
      pinned: true,
      variant: 'inline',
    });

    expect(detailPanel.dataset.open).toBe('true');
    expect(detailPanel.dataset.pinned).toBe('true');
    expect(detailPanel.dataset.itemId).toBe('shared_relic');
    expect(firstEntry.dataset.active).toBeUndefined();
    expect(firstEntry['aria-pressed']).toBe('false');
    expect(secondEntry.dataset.active).toBe('true');
    expect(secondEntry['aria-pressed']).toBe('true');
    expect(detailList.children[0].children[0].textContent).toContain('공유 패널');
  });

  it('clears detail content and active state when closed', () => {
    const doc = createDoc();
    const detailPanel = doc.createElement('div');
    const detailList = doc.createElement('div');
    const entriesRoot = doc.createElement('div');
    const entry = doc.createElement('button');
    entry.dataset.active = 'true';
    entry.setAttribute('aria-pressed', 'true');
    entriesRoot.appendChild(entry);
    detailList.appendChild(doc.createElement('div'));
    detailPanel.dataset.open = 'true';
    detailPanel.dataset.pinned = 'true';
    detailPanel.dataset.itemId = 'stale';

    clearItemDetailSurface({
      detailPanel,
      detailPanelList: detailList,
      entriesRoot,
    });

    expect(detailPanel.dataset.open).toBe('false');
    expect(detailPanel.dataset.pinned).toBe('false');
    expect(detailPanel.dataset.itemId).toBeUndefined();
    expect(detailList.children).toHaveLength(0);
    expect(entry.dataset.active).toBeUndefined();
    expect(entry['aria-pressed']).toBe('false');
  });

  it('routes shared surface updates through the controller strategy hooks', () => {
    const doc = createDoc();
    const detailPanel = doc.createElement('div');
    const detailList = doc.createElement('div');
    const entriesRoot = doc.createElement('div');
    const entry = doc.createElement('button');
    entriesRoot.appendChild(entry);
    const events = [];

    const controller = createItemDetailSurfaceController({
      doc,
      detailPanel,
      detailPanelList: detailList,
      entriesRoot,
      variant: 'inline',
      strategy: {
        resolveShowState(context) {
          events.push(`resolve:${context.itemId}`);
          return { pinned: true };
        },
        afterShow(context) {
          events.push(`show:${context.itemId}:${context.pinned}`);
        },
        afterClear() {
          events.push('clear');
        },
      },
    });

    controller.show({
      activeEntry: entry,
      detail: {
        icon: '✧',
        title: '전략형 패널',
        rarityLabel: '희귀',
        triggerText: '지속',
        desc: '전략 훅 검증',
      },
      itemId: 'strategy_panel',
    });
    controller.clear();

    expect(detailPanel.dataset.open).toBe('false');
    expect(events).toEqual([
      'resolve:strategy_panel',
      'show:strategy_panel:true',
      'clear',
    ]);
  });

  it('binds dismiss rules through a shared strategy helper', () => {
    const doc = createDoc();
    const detailPanel = doc.createElement('div');
    const slotsEl = doc.createElement('div');
    const insideSlot = doc.createElement('button');
    const outside = doc.createElement('div');
    slotsEl.appendChild(insideSlot);
    detailPanel.appendChild(doc.createElement('div'));
    detailPanel.dataset.open = 'true';
    detailPanel.dataset.pinned = 'true';

    const reasons = [];
    const cleanup = bindItemDetailDismissStrategy({
      doc,
      win: doc.defaultView,
      detailPanel,
      shouldDismiss: ({ event, reason }) => {
        if (detailPanel.dataset.open !== 'true') return false;
        if (reason === 'keydown') return event?.key === 'Escape';
        return !slotsEl.contains(event?.target) && !detailPanel.contains(event?.target);
      },
      onDismiss: ({ reason }) => {
        reasons.push(reason);
      },
    });

    doc.dispatch('pointerdown', { target: insideSlot });
    doc.dispatchView('keydown', { key: 'Enter' });
    doc.dispatch('pointerdown', { target: outside });
    doc.dispatchView('keydown', { key: 'Escape' });
    cleanup();
    doc.dispatch('pointerdown', { target: outside });

    expect(reasons).toEqual(['pointerdown', 'keydown']);
  });

  it('creates a managed surface that shares controller and dismiss policy hooks', () => {
    const doc = createDoc();
    const detailPanel = doc.createElement('div');
    const detailList = doc.createElement('div');
    const entriesRoot = doc.createElement('div');
    const entry = doc.createElement('button');
    const outside = doc.createElement('div');
    entriesRoot.appendChild(entry);
    const events = [];

    const surface = createManagedItemDetailSurface({
      doc,
      win: doc.defaultView,
      detailPanel,
      detailPanelList: detailList,
      entriesRoot,
      variant: 'inline',
      strategy: {
        resolveShowState(context) {
          events.push(`resolve:${context.itemId}`);
          return { pinned: true };
        },
        shouldDismiss({ event, reason, detailPanel: activePanel }) {
          if (activePanel?.dataset?.open !== 'true') return false;
          if (reason === 'keydown') return event?.key === 'Escape';
          return event?.target === outside;
        },
        onDismiss({ reason, clear }) {
          events.push(`dismiss:${reason}`);
          clear();
        },
      },
    });

    surface.show({
      activeEntry: entry,
      detail: {
        icon: '✧',
        title: '관리형 패널',
        rarityLabel: '희귀',
        triggerText: '지속',
        desc: 'dismiss 전략 포함',
      },
      itemId: 'managed_panel',
    });
    const cleanup = surface.bindDismiss();

    doc.dispatch('pointerdown', { target: entry });
    doc.dispatch('pointerdown', { target: outside });
    surface.show({
      activeEntry: entry,
      detail: {
        icon: '✧',
        title: '관리형 패널',
        rarityLabel: '희귀',
        triggerText: '지속',
        desc: 'dismiss 전략 포함',
      },
      itemId: 'managed_panel',
    });
    doc.dispatchView('keydown', { key: 'Escape' });
    cleanup();

    expect(events).toEqual([
      'resolve:managed_panel',
      'dismiss:pointerdown',
      'resolve:managed_panel',
      'dismiss:keydown',
    ]);
    expect(detailPanel.dataset.open).toBe('false');
  });

  it('exposes a reusable escape close hook while the managed surface is open', () => {
    const doc = createDoc();
    const detailPanel = doc.createElement('div');
    const detailList = doc.createElement('div');
    const entriesRoot = doc.createElement('div');
    const entry = doc.createElement('button');
    entriesRoot.appendChild(entry);

    const surface = createManagedItemDetailSurface({
      doc,
      win: doc.defaultView,
      detailPanel,
      detailPanelList: detailList,
      entriesRoot,
      variant: 'inline',
    });

    surface.show({
      activeEntry: entry,
      detail: {
        icon: '✧',
        title: '공용 닫기 훅',
        rarityLabel: '희귀',
        triggerText: '지속',
        desc: 'escape hook',
      },
      itemId: 'escape_hook',
    });

    expect(typeof detailPanel.__closeEscapeSurface).toBe('function');
    detailPanel.__closeEscapeSurface();
    expect(detailPanel.dataset.open).toBe('false');
  });
});
