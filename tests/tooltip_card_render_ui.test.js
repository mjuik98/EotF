import { describe, expect, it, vi } from 'vitest';
import {
  buildUnbreakableWallCardTooltip,
  extractTooltipCardId,
  positionCardTooltip,
  renderCardTooltipContent,
  syncCardKeywordTooltip,
} from '../game/ui/cards/tooltip_card_render_ui.js';

function createElement() {
  return {
    className: '',
    style: {},
    textContent: '',
    innerHTML: '',
    children: [],
    append(...nodes) {
      this.children.push(...nodes);
    },
    appendChild(node) {
      this.children.push(node);
      return node;
    },
  };
}

function createDocMap() {
  const elements = {
    ttIcon: createElement(),
    ttCost: createElement(),
    ttName: createElement(),
    ttType: createElement(),
    ttDesc: createElement(),
    ttRarity: createElement(),
    ttPredicted: createElement(),
    subTooltip: createElement(),
    stTitle: createElement(),
    stContent: createElement(),
  };

  return {
    elements,
    createElement: vi.fn(() => createElement()),
    createTextNode: vi.fn((text) => ({ nodeType: 3, textContent: text })),
    getElementById: vi.fn((id) => elements[id] || null),
  };
}

describe('tooltip_card_render_ui', () => {
  it('renders tooltip content with predicted damage and unbreakable wall follow-up text', () => {
    const doc = createDocMap();
    const card = {
      name: '불굴의 벽',
      icon: '🧱',
      cost: 2,
      type: 'power',
      rarity: 'rare',
      desc: '[지속] 방어막 비례 반사',
      dmg: 10,
    };
    const gs = {
      player: { echoChain: 3, shield: 20 },
      getBuff: vi.fn((id) => {
        if (id === 'resonance') return { dmgBonus: 2 };
        if (id === 'acceleration') return { dmgBonus: 3 };
        if (id === 'unbreakable_wall') return { stacks: 10 };
        return null;
      }),
    };

    renderCardTooltipContent(doc, card, gs, { cardId: 'unbreakable_wall' });

    expect(doc.elements.ttName.textContent).toBe('불굴의 벽');
    expect(doc.elements.ttRarity.className).toBe('card-tooltip-rarity rarity-rare');
    expect(doc.elements.ttPredicted.style.display).toBe('block');
    expect(doc.elements.ttPredicted.children[1].textContent).toBe(17);
    expect(doc.elements.ttPredicted.children[2].textContent).toContain('공명');
    expect(doc.elements.ttPredicted.children[3].textContent).toContain('가속');
    expect(doc.elements.ttPredicted.children[4].textContent).toContain('체인');
    expect(doc.elements.ttDesc.innerHTML).toContain('현재 중첩');
    expect(doc.elements.ttDesc.innerHTML).toContain('20 피해');
  });

  it('positions the tooltip and shows the highest-priority keyword sub-tooltip', () => {
    const doc = createDocMap();
    const tooltipEl = createElement();
    const win = { innerWidth: 320, innerHeight: 280 };
    const event = {
      currentTarget: {
        getBoundingClientRect: () => ({ right: 280, left: 240, top: 40 }),
      },
    };
    const card = {
      desc: '기절 면역과 [소진] 효과를 가진다',
      exhaust: true,
    };

    const position = positionCardTooltip(event, tooltipEl, win);
    const keywordState = syncCardKeywordTooltip(doc, card, position, win);

    expect(position).toEqual({ x: 68, y: 15 });
    expect(tooltipEl.style.left).toBe('68px');
    expect(tooltipEl.style.top).toBe('15px');
    expect(keywordState.keyword).toBe('기절 면역');
    expect(doc.elements.stTitle.textContent).toContain('기절 면역');
    expect(doc.elements.subTooltip.style.display).toBe('block');
  });

  it('extracts playCard ids and ignores unrelated onclick handlers', () => {
    expect(extractTooltipCardId("playCard('strike', 0)")).toBe('strike');
    expect(extractTooltipCardId('openDeckModal()')).toBeNull();
  });

  it('builds follow-up text only for unbreakable wall variants', () => {
    const gs = {
      player: { shield: 12 },
      getBuff: vi.fn(() => ({ stacks: 5 })),
    };

    expect(buildUnbreakableWallCardTooltip('unbreakable_wall_plus', gs)).toContain('총 16 피해');
    expect(buildUnbreakableWallCardTooltip('strike', gs)).toBe('');
  });
});
