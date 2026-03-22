import { describe, expect, it } from 'vitest';
import { renderCharacterCard } from '../game/ui/title/character_select_card_ui.js';

function createClassList() {
  const set = new Set();
  return {
    add: (...tokens) => tokens.forEach((token) => set.add(token)),
    remove: (...tokens) => tokens.forEach((token) => set.delete(token)),
    contains: (token) => set.has(token),
    toggle: (token, force) => {
      if (force === undefined) {
        if (set.has(token)) set.delete(token);
        else set.add(token);
        return;
      }
      if (force) set.add(token);
      else set.delete(token);
    },
  };
}

function createNode() {
  return {
    style: { cssText: '' },
    className: '',
    classList: createClassList(),
    textContent: '',
    innerHTML: '',
    children: [],
    appendChild(child) {
      this.children.push(child);
    },
    remove() {
      this.removed = true;
    },
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
  };
}

function createGeneratedNode() {
  const node = createNode();
  const generated = {};
  node.querySelector = (selector) => {
    if (selector === '.csm-card-level') {
      generated.level ??= createNode();
      return generated.level;
    }
    if (selector === '.csm-card-xp-text') {
      generated.text ??= createNode();
      return generated.text;
    }
    if (selector === '.csm-card-loadout-summary') {
      generated.summary ??= createNode();
      return generated.summary;
    }
    if (selector === '.csm-card-loadout-warning') {
      generated.warning ??= createNode();
      return generated.warning;
    }
    return null;
  };
  return node;
}

function createCard() {
  const card = createNode();
  card.children = [Object.assign(createNode(), { className: 'card-corner' })];
  card.querySelector = (selector) => {
    if (selector === '#cardLevelBadge') {
      return card.children.find((child) => child.id === 'cardLevelBadge') || null;
    }
    if (selector === '#cardLoadoutStatus') {
      return card.children.find((child) => child.id === 'cardLoadoutStatus') || null;
    }
    return null;
  };
  card.querySelectorAll = (selector) => {
    if (selector === '.card-corner') {
      return card.children.filter((child) => child.className === 'card-corner' && !child.removed);
    }
    return [];
  };
  return card;
}

describe('character select card helper', () => {
  it('renders card content and creates progress nodes when missing', () => {
    const card = createCard();
    const nodes = {
      charCard: card,
      cardTitle: createNode(),
      cardEmoji: createNode(),
      cardName: createNode(),
      cardSummary: createNode(),
      cardDiff: createNode(),
      cardTraitBadge: createNode(),
      cardTags: createNode(),
      cardBottomGrad: createNode(),
      cardShimmer: createNode(),
    };
    const doc = {
      createElement: () => createGeneratedNode(),
    };

    renderCharacterCard({
      card,
      selectedChar: {
        accent: '#7CC8FF',
        color: '#123456',
        glow: '#7CC8FF',
        title: 'Paladin',
        emoji: 'P',
        name: 'Defender',
        difficulty: 'Normal',
        traitName: 'Grace',
        tags: ['holy', 'tank'],
      },
      classProgress: {
        level: 3,
        progress: 0.42,
      },
      maxLevel: 10,
      resolveById: (id) => nodes[id] || null,
      doc,
      traitBadgeText: 'Trait Grace',
      summaryText: '근접 압박과 잔향 연계에 강한 전위형',
    });

    expect(card.style.border).toBe('1px solid #7CC8FF44');
    expect(card.style.background).toBe('linear-gradient(158deg,#12345626 0%,#090916 46%,#12345614 100%)');
    expect(card.style.boxShadow).toBe('0 0 78px #7CC8FF28,inset 0 1px 0 #7CC8FF22');
    expect(nodes.cardTitle.textContent).toBe('Paladin');
    expect(nodes.cardEmoji.style.filter).toBe('drop-shadow(0 0 34px #7CC8FF)');
    expect(nodes.cardName.style.textShadow).toBe('0 0 20px #7CC8FF');
    expect(nodes.cardName.style.color).toBe('#f4f7ff');
    expect(nodes.cardSummary.textContent).toBe('근접 압박과 잔향 연계에 강한 전위형');
    expect(nodes.cardSummary.style.color).toBe('#edf4ff');
    expect(nodes.cardDiff.textContent).toBe('난이도 Normal');
    expect(nodes.cardDiff.style.color).toBe('#edf4ff');
    expect(nodes.cardTraitBadge.textContent).toBe('Trait Grace');
    expect(nodes.cardTags.innerHTML).toContain('holy');
    expect(card.children.find((child) => child.id === 'cardVisualOrbit')).toBeTruthy();
    expect(card.children.find((child) => child.id === 'cardVisualSigil')).toBeTruthy();
    expect(card.children.find((child) => child.id === 'cardVisualPedestal')).toBeTruthy();

    const levelBadgeHost = card.children.find((child) => child.id === 'cardLevelBadge');
    expect(levelBadgeHost).toBeTruthy();
    expect(levelBadgeHost.querySelector('.csm-card-level').textContent).toBe('Lv.3');
    expect(card.children.find((child) => child.id === 'cardXpBarWrap')).toBeFalsy();
    expect(card.querySelectorAll('.card-corner')).toHaveLength(4);
  });

  it('renders max-level styles and replaces old corners', () => {
    const oldCorner = Object.assign(createNode(), { className: 'card-corner' });
    const card = createCard();
    card.children = [oldCorner];
    const doc = {
      createElement: () => createGeneratedNode(),
    };

    renderCharacterCard({
      card,
      selectedChar: {
        accent: '#FFAA55',
        color: '#331100',
        glow: '#FFAA55',
        title: 'Berserker',
        emoji: 'B',
        name: 'Rage',
        difficulty: 'Hard',
        traitName: 'Fury',
        tags: [],
      },
      classProgress: {
        level: 10,
        progress: 1,
      },
      maxLevel: 10,
      resolveById: () => null,
      doc,
      traitBadgeText: 'Trait Fury',
    });

    const levelBadgeHost = card.children.find((child) => child.id === 'cardLevelBadge');
    expect(card.classList.contains('csm-max')).toBe(true);
    expect(card.style.border).toBe('1.6px solid #FFAA55aa');
    expect(card.style.background).toBe('linear-gradient(158deg,#33110038 0%,#0a0716 44%,#3311001e 100%)');
    expect(card.style.boxShadow).toBe('0 0 92px #FFAA5532,inset 0 1px 0 #FFAA5540');
    expect(oldCorner.removed).toBe(true);
    expect(levelBadgeHost.querySelector('.csm-card-level').textContent).toBe('MAX');
    expect(levelBadgeHost.querySelector('.csm-card-level').style.background).toBe('#FFAA5526');
  });

  it('renders loadout summary and invalid preset warning badges', () => {
    const card = createCard();
    const doc = {
      createElement: () => createGeneratedNode(),
    };

    renderCharacterCard({
      card,
      selectedChar: {
        accent: '#7CC8FF',
        color: '#123456',
        glow: '#7CC8FF',
        title: 'Paladin',
        emoji: 'P',
        name: 'Defender',
        difficulty: 'Normal',
        traitName: 'Grace',
        tags: ['holy', 'tank'],
      },
      classProgress: {
        level: 12,
        progress: 1,
      },
      maxLevel: 12,
      resolveById: () => null,
      doc,
      traitBadgeText: 'Trait Grace',
      loadoutSummaryText: '프리셋: 중격→잔영 | +고대인의 자루',
      loadoutWarningText: '프리셋 확인 필요',
    });

    const statusHost = card.children.find((child) => child.id === 'cardLoadoutStatus');
    expect(statusHost).toBeTruthy();
    expect(statusHost.querySelector('.csm-card-loadout-summary').textContent).toBe('프리셋: 중격→잔영 | +고대인의 자루');
    expect(statusHost.querySelector('.csm-card-loadout-warning').textContent).toBe('프리셋 확인 필요');
  });
});
