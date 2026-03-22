import { describe, expect, it } from 'vitest';

import { renderItemDetailPanelContent } from '../game/features/combat/presentation/browser/item_detail_panel_ui.js';

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
}

function createDoc() {
  const doc = {
    createElement(tagName) {
      return new MockElement(doc, tagName);
    },
  };
  return doc;
}

describe('item_detail_panel_ui', () => {
  it('renders a structured layout with badges, charge, and set bonuses', () => {
    const doc = createDoc();
    const panelList = doc.createElement('div');

    renderItemDetailPanelContent(doc, panelList, {
      icon: '✧',
      title: '전설 유물',
      rarityLabel: '전설',
      triggerText: '전투 시작 시',
      desc: '카드 1장 추가 드로우',
      charge: {
        label: '이번 전투 카드 사용',
        value: '2 / 10',
        tone: 'accent',
      },
      set: {
        name: '전설 연계',
        count: 1,
        total: 2,
        members: [
          { id: 'legendary_relic', icon: '✧', name: '전설 유물', owned: true },
          { id: 'echo_relic', icon: '◇', name: '메아리 유물', owned: false },
        ],
        bonuses: [
          { tier: 2, label: '시작 손패 +1', active: false },
        ],
      },
    });

    expect(panelList.children[0].className).toBe('crp-head');
    expect(panelList.children[0].children[0].textContent).toContain('전설 유물');
    expect(panelList.children[0].children[1].children[0].textContent).toBe('전설');
    expect(panelList.children[0].children[1].children[1].textContent).toBe('전투 시작 시');
    expect(panelList.children[1].className).toContain('crp-box');
    expect(panelList.children[2].className).toContain('is-accent');
    expect(panelList.children[3].children[0].textContent).toContain('전설 연계');
    expect(panelList.children[4].className).toContain('is-owned');
    expect(panelList.children[5].className).not.toContain('is-owned');
    expect(panelList.children[6].children[0].textContent).toBe('2세트');
    expect(panelList.children[6].children[1].textContent).toBe('대기');
  });
});
