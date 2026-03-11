import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  attachToCardSpy,
  createCombatCardElementSpy,
  destroyAllSpy,
  initSpy,
} = vi.hoisted(() => ({
  attachToCardSpy: vi.fn(),
  createCombatCardElementSpy: vi.fn(),
  destroyAllSpy: vi.fn(),
  initSpy: vi.fn(),
}));

vi.mock('../game/ui/cards/card_clone_ui.js', () => ({
  HandCardCloneUI: {
    init: initSpy,
    destroyAll: destroyAllSpy,
    attachToCard: attachToCardSpy,
  },
}));

vi.mock('../game/ui/cards/combat_card_render_ui.js', () => ({
  applyHandFanStyles: vi.fn(),
  createCombatCardElement: createCombatCardElementSpy,
}));

import { CardUI } from '../game/ui/cards/card_ui.js';

function createCardElement() {
  const listeners = new Map();
  return {
    listeners,
    addEventListener(type, handler) {
      listeners.set(type, handler);
    },
  };
}

function createDoc() {
  const combatHandCards = {
    dataset: {},
    style: {},
    textContent: 'filled',
    children: [],
    appendChild(node) {
      this.children.push(node);
    },
  };
  const handCards = {
    textContent: '',
    children: [],
    appendChild(node) {
      this.children.push(node);
    },
  };

  return {
    createElement(tag) {
      return {
        tag,
        className: '',
        textContent: '',
        title: '',
        children: [],
        listeners: new Map(),
        addEventListener(type, handler) {
          this.listeners.set(type, handler);
        },
        append(...nodes) {
          this.children.push(...nodes);
        },
      };
    },
    getElementById(id) {
      if (id === 'combatHandCards') return combatHandCards;
      if (id === 'handCards') return handCards;
      return null;
    },
    querySelectorAll() {
      return [];
    },
  };
}

describe('card_ui', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createCombatCardElementSpy.mockImplementation(() => createCardElement());
  });

  it('renders combat cards with injected card cost utils and drag handlers', () => {
    const prevCardCostUtils = globalThis.CardCostUtils;
    globalThis.CardCostUtils = {
      getCostDisplay: vi.fn(() => {
        throw new Error('global CardCostUtils should not be used');
      }),
    };

    const doc = createDoc();
    const dragStartHandler = vi.fn();
    const dragEndHandler = vi.fn();
    const cardCostUtils = {
      getCostDisplay: vi.fn(() => ({ displayCost: 1 })),
      calcEffectiveCost: vi.fn(() => 1),
      hasTraitDiscount: vi.fn(() => false),
      isCascadeFree: vi.fn(() => false),
      isChargeFree: vi.fn(() => false),
    };
    const gs = {
      player: {
        hand: ['strike'],
        energy: 2,
        _nextCardDiscount: 0,
        costDiscount: 0,
      },
    };
    const data = {
      cards: {
        strike: { cost: 1, rarity: 'common', type: 'ATTACK' },
      },
    };

    CardUI.renderCombatCards({
      cardCostUtils,
      data,
      doc,
      dragEndHandler,
      dragStartHandler,
      gs,
      playCardHandler: vi.fn(),
    });

    expect(initSpy).toHaveBeenCalledWith({ doc });
    expect(destroyAllSpy).toHaveBeenCalledWith({ doc });
    expect(cardCostUtils.getCostDisplay).toHaveBeenCalledWith('strike', data.cards.strike, gs.player, 0);
    expect(cardCostUtils.calcEffectiveCost).toHaveBeenCalledWith('strike', data.cards.strike, gs.player, 0);
    expect(createCombatCardElementSpy).toHaveBeenCalledWith(doc, expect.objectContaining({
      cardId: 'strike',
      displayCost: 1,
    }));

    const cardEl = doc.getElementById('combatHandCards').children[0];
    cardEl.listeners.get('dragstart')({ type: 'dragstart' });
    cardEl.listeners.get('dragend')({ type: 'dragend' });

    expect(dragStartHandler).toHaveBeenCalledWith({ type: 'dragstart' }, 'strike', 0);
    expect(dragEndHandler).toHaveBeenCalledWith({ type: 'dragend' });
    expect(attachToCardSpy).toHaveBeenCalledWith(
      cardEl,
      'strike',
      data.cards.strike,
      expect.objectContaining({ displayCost: 1 }),
      { doc },
    );

    globalThis.CardCostUtils = prevCardCostUtils;
  });

  it('does not fall back to global renderCombatCards in hand view', () => {
    const prevRenderCombatCards = globalThis.renderCombatCards;
    globalThis.renderCombatCards = vi.fn();

    const doc = createDoc();
    const playCardHandler = vi.fn();
    const gs = { player: { hand: ['strike'] } };
    const data = { cards: { strike: { cost: 1, desc: 'desc', icon: 'S', name: 'Strike', type: 'ATTACK' } } };

    CardUI.renderHand({ data, doc, gs, playCardHandler });

    const cardEl = doc.getElementById('handCards').children[0];
    cardEl.listeners.get('click')();

    expect(playCardHandler).toHaveBeenCalledWith('strike', 0);
    expect(globalThis.renderCombatCards).not.toHaveBeenCalled();

    globalThis.renderCombatCards = prevRenderCombatCards;
  });
});
