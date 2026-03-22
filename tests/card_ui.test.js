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

vi.mock('../game/features/combat/presentation/browser/card_clone_ui.js', () => ({
  HandCardCloneUI: {
    init: initSpy,
    destroyAll: destroyAllSpy,
    attachToCard: attachToCardSpy,
  },
}));

vi.mock('../game/features/combat/presentation/browser/combat_card_render_ui.js', () => ({
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
    defaultView: {},
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
      getCostDisplay: vi.fn(() => ({
        anyFree: false,
        canPlay: true,
        displayCost: 1,
        totalDiscount: 0,
      })),
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
    expect(cardCostUtils.getCostDisplay).toHaveBeenCalledWith(
      'strike',
      data.cards.strike,
      gs.player,
      0,
      expect.objectContaining({ triggerItems: undefined }),
    );
    expect(cardCostUtils.calcEffectiveCost).not.toHaveBeenCalled();
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
      expect.objectContaining({ doc }),
    );

    globalThis.CardCostUtils = prevCardCostUtils;
  });

  it('reuses combat hand rendering for the compatibility renderHand entrypoint', () => {
    const doc = createDoc();
    const playCardHandler = vi.fn();
    const cardCostUtils = {
      getCostDisplay: vi.fn(() => ({
        anyFree: false,
        canPlay: true,
        displayCost: 1,
        totalDiscount: 0,
      })),
      calcEffectiveCost: vi.fn(() => 1),
      hasTraitDiscount: vi.fn(() => false),
      isCascadeFree: vi.fn(() => false),
      isChargeFree: vi.fn(() => false),
    };
    const gs = { player: { hand: ['strike'], energy: 2, _nextCardDiscount: 0, costDiscount: 0 } };
    const data = { cards: { strike: { cost: 1, desc: 'desc', icon: 'S', name: 'Strike', rarity: 'common', type: 'ATTACK' } } };

    CardUI.renderHand({ cardCostUtils, data, doc, gs, playCardHandler });

    expect(createCombatCardElementSpy).toHaveBeenCalledWith(doc, expect.objectContaining({
      cardId: 'strike',
      displayCost: 1,
    }));

    const cardEl = doc.getElementById('combatHandCards').children[0];
    cardEl.listeners.get('click')({ stopPropagation: vi.fn() });

    expect(playCardHandler).toHaveBeenCalledWith('strike', 0);
    expect(doc.getElementById('handCards').children).toHaveLength(0);
  });

  it('treats cards as playable in the UI when before-card-cost hooks reduce their cost', () => {
    const doc = createDoc();
    const cardCostUtils = {
      getCostDisplay: vi.fn(() => ({
        canPlay: true,
        displayCost: 1,
        isDiscounted: true,
        totalDiscount: 1,
      })),
      calcEffectiveCost: vi.fn(() => 1),
      hasTraitDiscount: vi.fn(() => false),
      isCascadeFree: vi.fn(() => false),
      isChargeFree: vi.fn(() => false),
    };
    const gs = {
      player: {
        hand: ['defend'],
        energy: 1,
        _nextCardDiscount: 0,
        costDiscount: 0,
      },
      triggerItems: vi.fn((trigger) => (trigger === 'before_card_cost' ? -1 : undefined)),
    };
    const data = {
      cards: {
        defend: { cost: 2, desc: '방어막 8 획득', icon: '🛡', name: '수비', rarity: 'common', type: 'SKILL' },
      },
    };

    CardUI.renderCombatCards({
      cardCostUtils,
      data,
      doc,
      gs,
      playCardHandler: vi.fn(),
    });

    expect(cardCostUtils.getCostDisplay).toHaveBeenCalledWith(
      'defend',
      data.cards.defend,
      gs.player,
      0,
      expect.objectContaining({ triggerItems: expect.any(Function) }),
    );
    expect(createCombatCardElementSpy).toHaveBeenCalledWith(doc, expect.objectContaining({
      canPlay: true,
      cardId: 'defend',
      displayCost: 1,
      totalDisc: 1,
    }));
    expect(attachToCardSpy).toHaveBeenCalledWith(
      doc.getElementById('combatHandCards').children[0],
      'defend',
      data.cards.defend,
      expect.objectContaining({ canPlay: true, displayCost: 1, totalDisc: 1 }),
      expect.objectContaining({ doc }),
    );
  });

  it('wires hand card hover events to the injected tooltip handlers', async () => {
    const doc = createDoc();
    const showTooltipHandler = vi.fn();
    const hideTooltipHandler = vi.fn();
    const cardCostUtils = {
      getCostDisplay: vi.fn(() => ({
        anyFree: false,
        canPlay: true,
        displayCost: 1,
        totalDiscount: 0,
      })),
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
        strike: { cost: 1, desc: 'desc', icon: 'S', name: 'Strike', rarity: 'common', type: 'ATTACK' },
      },
    };

    CardUI.renderCombatCards({
      cardCostUtils,
      data,
      doc,
      gs,
      hideTooltipHandler,
      playCardHandler: vi.fn(),
      showTooltipHandler,
    });

    const cardEl = doc.getElementById('combatHandCards').children[0];
    await cardEl.listeners.get('mouseenter')({ type: 'mouseenter', currentTarget: cardEl });
    await cardEl.listeners.get('mouseleave')();

    expect(showTooltipHandler).toHaveBeenCalledWith(
      { type: 'mouseenter', currentTarget: cardEl },
      'strike',
    );
    expect(hideTooltipHandler).toHaveBeenCalledTimes(1);
  });

  it('does not bind hover tooltip listeners when explicit deps are absent', () => {
    const doc = createDoc();
    const cardCostUtils = {
      getCostDisplay: vi.fn(() => ({
        anyFree: false,
        canPlay: true,
        displayCost: 1,
        totalDiscount: 0,
      })),
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
        strike: { cost: 1, desc: 'desc', icon: 'S', name: 'Strike', rarity: 'common', type: 'ATTACK' },
      },
    };

    CardUI.renderCombatCards({
      cardCostUtils,
      data,
      doc,
      gs,
      playCardHandler: vi.fn(),
    });

    const cardEl = doc.getElementById('combatHandCards').children[0];
    expect(cardEl.listeners.has('mouseenter')).toBe(false);
    expect(cardEl.listeners.has('mouseleave')).toBe(false);
  });
});
