import { describe, expect, it, vi } from 'vitest';

const {
  discardEventCardSpy,
  dismissTransientOverlaySpy,
  playAttackSlashSpy,
  playUiItemGetFeedbackSpy,
} = vi.hoisted(() => ({
  discardEventCardSpy: vi.fn(() => ({ success: true })),
  dismissTransientOverlaySpy: vi.fn((overlay) => overlay?.remove?.()),
  playAttackSlashSpy: vi.fn(),
  playUiItemGetFeedbackSpy: vi.fn(),
}));

vi.mock('../game/features/event/application/discard_event_card_use_case.js', () => ({
  discardEventCard: discardEventCardSpy,
}));

vi.mock('../game/features/event/ports/event_ui_view_ports.js', () => ({
  EVENT_DISCARD_CARD_RARITY_COLORS: { common: '#888', rare: '#ffd966' },
  playAttackSlash: playAttackSlashSpy,
  playUiItemGetFeedback: playUiItemGetFeedbackSpy,
}));

vi.mock('../game/features/event/presentation/browser/event_ui_helpers.js', () => ({
  dismissTransientOverlay: dismissTransientOverlaySpy,
  getAudioEngine: vi.fn(() => ({ playEvent: vi.fn() })),
}));

import { showEventCardDiscardOverlay } from '../game/features/event/presentation/browser/event_ui_card_discard.js';

function createElementFactory(elements) {
  return function createElement(tagName) {
    const el = {
      tagName: String(tagName || '').toUpperCase(),
      id: '',
      type: '',
      tabIndex: -1,
      style: {},
      attributes: {},
      textContent: '',
      innerHTML: '',
      className: '',
      children: [],
      append(...nodes) {
        this.children.push(...nodes);
        nodes.forEach((node) => {
          if (node?.id) elements[node.id] = node;
        });
      },
      appendChild(node) {
        this.children.push(node);
        if (node?.id) elements[node.id] = node;
        return node;
      },
      remove() {
        if (this.id) delete elements[this.id];
      },
      setAttribute(name, value) {
        this.attributes[name] = String(value);
      },
      getAttribute(name) {
        return this.attributes[name];
      },
      onclick: null,
      onmouseenter: null,
      onmouseleave: null,
      onfocus: null,
      onblur: null,
    };
    return el;
  };
}

function createDoc() {
  const elements = {};
  const createElement = createElementFactory(elements);
  const body = createElement('body');
  body.appendChild = (node) => {
    body.children.push(node);
    if (node?.id) elements[node.id] = node;
    return node;
  };

  return {
    body,
    createElement,
    getElementById: vi.fn((id) => elements[id] || null),
    elements,
  };
}

describe('event_ui_card_discard', () => {
  it('renders localized copy and shared description classes for discard card text', () => {
    const doc = createDoc();

    showEventCardDiscardOverlay(
      {
        player: {
          deck: ['strike'],
          hand: [],
          graveyard: [],
        },
        addLog: vi.fn(),
      },
      {
        cards: {
          strike: {
            name: '강타',
            desc: '피해 14 [소진]',
            rarity: 'rare',
            icon: 'S',
          },
        },
      },
      false,
      { doc },
    );

    const overlay = doc.elements.cardDiscardOverlay;
    const title = overlay.children[0];
    const list = doc.elements.discardCardList;
    const card = list.children[0];
    const desc = card.children[2];

    expect(title.children[0].textContent).toBe('카드 폐기');
    expect(title.children[1].textContent).toBe('버릴 카드를 선택하세요 (+8 골드)');
    expect(title.children[2].textContent).toBe('선택한 카드를 버리고 8 골드를 얻습니다.');
    expect(desc.className).toBe('event-card-discard-desc');
    expect(desc.innerHTML).toContain('kw-dmg');
    expect(desc.innerHTML).toContain('kw-exhaust kw-block');
    expect(typeof card.onfocus).toBe('function');
    expect(typeof card.onblur).toBe('function');
  });
});
