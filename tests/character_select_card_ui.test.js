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
    if (selector === '.csm-card-xp-fill') {
      generated.fill ??= createNode();
      return generated.fill;
    }
    if (selector === '.csm-card-xp-text') {
      generated.text ??= createNode();
      return generated.text;
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
    if (selector === '#cardXpBarWrap') {
      return card.children.find((child) => child.id === 'cardXpBarWrap') || null;
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
      xpText: '42 / 100 XP',
    });

    expect(card.style.border).toBe('1px solid #7CC8FF44');
    expect(nodes.cardTitle.textContent).toBe('Paladin');
    expect(nodes.cardEmoji.style.filter).toBe('drop-shadow(0 0 28px #7CC8FF)');
    expect(nodes.cardName.style.textShadow).toBe('0 0 20px #7CC8FF');
    expect(nodes.cardTraitBadge.textContent).toBe('Trait Grace');
    expect(nodes.cardTags.innerHTML).toContain('holy');

    const levelBadgeHost = card.children.find((child) => child.id === 'cardLevelBadge');
    const xpWrapHost = card.children.find((child) => child.id === 'cardXpBarWrap');
    expect(levelBadgeHost).toBeTruthy();
    expect(levelBadgeHost.querySelector('.csm-card-level').textContent).toBe('Lv.3');
    expect(xpWrapHost.querySelector('.csm-card-xp-fill').style.width).toBe('42%');
    expect(xpWrapHost.querySelector('.csm-card-xp-text').textContent).toBe('42 / 100 XP');
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
      xpText: 'MAX LEVEL 999 XP',
    });

    const levelBadgeHost = card.children.find((child) => child.id === 'cardLevelBadge');
    expect(card.classList.contains('csm-max')).toBe(true);
    expect(card.style.border).toBe('1.6px solid #FFAA55aa');
    expect(oldCorner.removed).toBe(true);
    expect(levelBadgeHost.querySelector('.csm-card-level').textContent).toBe('MAX');
    expect(levelBadgeHost.querySelector('.csm-card-level').style.background).toBe('#FFAA5526');
  });
});
