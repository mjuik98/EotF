import { describe, expect, it, vi } from 'vitest';
import { RewardUI } from '../game/features/reward/public.js';
import { CONSTANTS } from '../game/data/constants.js';
import { clearIdempotencyPrefix } from '../game/utils/idempotency_utils.js';

function querySelectorAllByClass(root, selector) {
  if (typeof selector !== 'string' || !selector.startsWith('.')) return [];
  const required = selector.slice(1).split('.').filter(Boolean);
  const found = [];
  const walk = (node) => {
    for (const child of node.children || []) {
      if (child?.classList && required.every((token) => child.classList.contains(token))) {
        found.push(child);
      }
      walk(child);
    }
  };
  walk(root);
  return found;
}

function createMockElement(tag = 'div') {
  const classes = new Set();
  const attributes = {};
  const element = {
    tagName: String(tag).toUpperCase(),
    children: [],
    style: {},
    dataset: {},
    disabled: false,
    title: '',
    type: '',
    innerHTML: '',
    _textContent: '',
    set textContent(value) {
      this._textContent = value == null ? '' : String(value);
      if (this._textContent === '') this.children = [];
    },
    get textContent() {
      return this._textContent;
    },
    setAttribute(name, value) {
      attributes[name] = String(value);
    },
    getAttribute(name) {
      return attributes[name];
    },
    append(...nodes) {
      this.children.push(...nodes);
    },
    appendChild(node) {
      this.children.push(node);
      return node;
    },
    addEventListener: vi.fn(),
    querySelectorAll(selector) {
      return querySelectorAllByClass(this, selector);
    },
  };

  Object.defineProperty(element, 'className', {
    get() {
      return [...classes].join(' ');
    },
    set(value) {
      classes.clear();
      String(value || '')
        .split(/\s+/)
        .filter(Boolean)
        .forEach((token) => classes.add(token));
    },
    configurable: true,
  });

  element.classList = {
    add: (...tokens) => tokens.forEach((token) => classes.add(token)),
    remove: (...tokens) => tokens.forEach((token) => classes.delete(token)),
    contains: (token) => classes.has(token),
  };

  return element;
}

function createMockDoc() {
  const byId = new Map();
  return {
    createElement: vi.fn((tag) => createMockElement(tag)),
    getElementById: vi.fn((id) => byId.get(id) || null),
    register(id, node) {
      byId.set(id, node);
    },
  };
}

function createDeps({ maxEnergy, withGetRandomCard = true }) {
  const doc = createMockDoc();
  const rewardEyebrow = createMockElement('div');
  const rewardTitle = createMockElement('div');
  const rewardCards = createMockElement('div');
  const rewardSkipInitBtn = createMockElement('button');
  const skipConfirmRow = createMockElement('div');

  doc.register('rewardEyebrow', rewardEyebrow);
  doc.register('rewardTitle', rewardTitle);
  doc.register('rewardCards', rewardCards);
  doc.register('rewardSkipInitBtn', rewardSkipInitBtn);
  doc.register('skipConfirmRow', skipConfirmRow);

  const cardIds = ['card_a', 'card_b', 'card_c', 'card_d', 'card_e'];
  let cardPickIndex = 0;
  const cards = Object.fromEntries(cardIds.map((id) => [id, {
    id,
    name: id,
    desc: `${id} desc`,
    rarity: 'common',
    type: 'attack',
    cost: 1,
  }]));
  cards.card_a_plus = {
    id: 'card_a_plus',
    name: 'card_a+',
    desc: 'card_a+ desc',
    rarity: 'common',
    type: 'attack',
    cost: 1,
    upgraded: true,
  };
  cards.card_b_plus = {
    id: 'card_b_plus',
    name: 'card_b+',
    desc: 'card_b+ desc',
    rarity: 'common',
    type: 'attack',
    cost: 1,
    upgraded: true,
  };
  cards.card_c_plus = {
    id: 'card_c_plus',
    name: 'card_c+',
    desc: 'card_c+ desc',
    rarity: 'common',
    type: 'attack',
    cost: 1,
    upgraded: true,
  };

  const gs = {
    combat: { active: true },
    currentNode: { type: 'normal' },
    currentRegion: 0,
    player: {
      maxEnergy,
      maxHp: 100,
      hp: 100,
      items: [],
      deck: [],
    },
    meta: {
      codex: {
        cards: { add: vi.fn() },
        items: { add: vi.fn() },
      },
    },
  };

  if (withGetRandomCard) {
    gs.getRandomCard = vi.fn(() => {
      const id = cardIds[cardPickIndex % cardIds.length];
      cardPickIndex += 1;
      return id;
    });
  }

  return {
    gs,
    data: {
      cards,
      items: {},
      upgradeMap: {
        card_a: 'card_a_plus',
        card_b: 'card_b_plus',
        card_c: 'card_c_plus',
      },
    },
    doc,
    switchScreen: vi.fn(),
    showItemToast: vi.fn(),
    playItemGet: vi.fn(),
    returnToGame: vi.fn(),
    rewardCards,
  };
}

function findBlessingWrapper(rewardCards, blessingName) {
  return rewardCards.children.find((child) => {
    return child?.getAttribute?.('aria-label')?.includes?.(blessingName);
  });
}

function findChildByClass(node, className) {
  return (node.children || []).find((child) => child?.classList?.contains?.(className));
}

describe('RewardUI', () => {
  it('renders card rewards even when the game state lacks getRandomCard', () => {
    const originalRandom = Math.random;
    Math.random = vi.fn(() => 0);
    const deps = createDeps({ maxEnergy: 3, withGetRandomCard: false });

    try {
      RewardUI.showRewardScreen('normal', deps);
    } finally {
      Math.random = originalRandom;
    }

    expect(deps.rewardCards.children.length).toBeGreaterThan(0);
    expect(deps.rewardCards.children[0]?.getAttribute?.('aria-label')).toContain('카드 보상');
    expect(deps.doc.getElementById('rewardEyebrow')?.textContent).toBe('전투 보상');
    expect(deps.doc.getElementById('rewardTitle')?.style.display).toBe('none');
    expect(deps.switchScreen).toHaveBeenCalledWith('reward');
  });

  it('localizes boss reward header copy', () => {
    const deps = createDeps({ maxEnergy: 3 });

    RewardUI.showRewardScreen('boss', deps);

    expect(deps.doc.getElementById('rewardEyebrow')?.textContent).toBe('보스 보상');
    expect(deps.doc.getElementById('rewardTitle')?.textContent).toBe('보스 처치');
    expect(deps.doc.getElementById('rewardTitle')?.style.display).toBe('block');
  });

  it('surfaces exactly one upgraded card in a normal three-card combat reward high-roll', () => {
    const originalRandom = Math.random;
    Math.random = vi.fn(() => 0);
    const deps = createDeps({ maxEnergy: 3 });

    try {
      RewardUI.showRewardScreen('normal', deps);
    } finally {
      Math.random = originalRandom;
    }

    const labels = deps.rewardCards.children.map((child) => child.getAttribute('aria-label'));
    const upgradedCount = labels.filter((label) => label?.includes?.('+')).length;

    expect(deps.rewardCards.children).toHaveLength(3);
    expect(upgradedCount).toBe(1);
  });

  it('caps elite three-card combat rewards at one upgraded card', () => {
    const originalRandom = Math.random;
    Math.random = vi.fn(() => 0);
    const deps = createDeps({ maxEnergy: 3 });
    deps.gs.currentNode.type = 'elite';
    deps.data.cards.card_a.rarity = 'uncommon';
    deps.data.cards.card_b.rarity = 'uncommon';
    deps.data.cards.card_c.rarity = 'rare';
    deps.data.cards.card_a_plus.rarity = 'uncommon';
    deps.data.cards.card_b_plus.rarity = 'uncommon';
    deps.data.cards.card_c_plus.rarity = 'rare';

    try {
      RewardUI.showRewardScreen('normal', deps);
    } finally {
      Math.random = originalRandom;
    }

    const labels = deps.rewardCards.children.map((child) => child.getAttribute('aria-label'));
    const upgradedCount = labels.filter((label) => label?.includes?.('+')).length;

    expect(deps.rewardCards.children).toHaveLength(3);
    expect(upgradedCount).toBe(1);
  });

  it('marks permanent energy blessing with emphasized disabled visuals at cap', () => {
    const cap = Number(CONSTANTS?.PLAYER?.MAX_ENERGY_CAP) || 5;
    const deps = createDeps({ maxEnergy: cap });

    RewardUI.showRewardScreen('boss', deps);

    const energyBlessing = findBlessingWrapper(deps.rewardCards, '에너지의 축복');
    expect(energyBlessing).toBeTruthy();
    expect(energyBlessing.disabled).toBe(false);
    expect(energyBlessing.getAttribute('aria-disabled')).toBe('true');
    expect(energyBlessing.classList.contains('reward-permanent-energy-disabled')).toBe(true);
    expect(energyBlessing.title).toContain(`${cap}`);

    const blessingCard = energyBlessing.children[0];
    const overlay = findChildByClass(blessingCard, 'reward-disabled-overlay');
    const badge = findChildByClass(blessingCard, 'reward-disabled-state-badge');
    const reason = findChildByClass(blessingCard, 'reward-disabled-reason');

    expect(overlay).toBeTruthy();
    expect(badge?.textContent).toBe('최대치 도달');
    expect(reason?.textContent).toContain(`${cap}`);
    expect(deps.switchScreen).toHaveBeenCalledWith('reward');
  });

  it('keeps permanent energy blessing selectable below cap', () => {
    const cap = Number(CONSTANTS?.PLAYER?.MAX_ENERGY_CAP) || 5;
    const deps = createDeps({ maxEnergy: Math.max(0, cap - 1) });

    RewardUI.showRewardScreen('boss', deps);

    const energyBlessing = findBlessingWrapper(deps.rewardCards, '에너지의 축복');
    expect(energyBlessing).toBeTruthy();
    expect(energyBlessing.disabled).toBe(false);
    expect(energyBlessing.classList.contains('reward-permanent-energy-disabled')).toBe(false);

    const blessingCard = energyBlessing.children[0];
    expect(findChildByClass(blessingCard, 'reward-disabled-overlay')).toBeFalsy();
    expect(findChildByClass(blessingCard, 'reward-disabled-state-badge')).toBeFalsy();
    expect(findChildByClass(blessingCard, 'reward-disabled-reason')).toBeFalsy();
  });

  it('queues the guaranteed mini-boss relic toast', () => {
    const originalRandom = Math.random;
    Math.random = vi.fn()
      .mockReturnValueOnce(0)
      .mockReturnValue(1);

    const deps = createDeps({ maxEnergy: 3 });
    deps.data.items = {
      relic_test: {
        id: 'relic_test',
        name: 'Mini Boss Relic',
        desc: 'reward relic',
        rarity: 'rare',
        obtainableFrom: ['reward'],
      },
    };

    try {
      RewardUI.showRewardScreen('mini_boss', deps);
    } finally {
      Math.random = originalRandom;
    }

    expect(deps.gs.player.items).toContain('relic_test');
    expect(deps.playItemGet).toHaveBeenCalledTimes(1);
    expect(deps.showItemToast).toHaveBeenCalledWith(
      deps.data.items.relic_test,
      { forceQueue: true },
    );
  });

  it('forces reward item acquisition through the toast queue', () => {
    vi.useFakeTimers();
    clearIdempotencyPrefix('reward:');

    const deps = createDeps({ maxEnergy: 3 });
    deps.data.items = {
      relic_reward: {
        id: 'relic_reward',
        name: 'Reward Relic',
        desc: 'reward relic',
        rarity: 'legendary',
      },
    };

    try {
      RewardUI.takeRewardItem('relic_reward', deps);

      expect(deps.showItemToast).toHaveBeenCalledWith(
        deps.data.items.relic_reward,
        { forceQueue: true },
      );
      expect(deps.playItemGet).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(350);
      expect(deps.returnToGame).toHaveBeenCalledWith(true);
    } finally {
      clearIdempotencyPrefix('reward:');
      vi.useRealTimers();
    }
  });

  it('clears picked state and unlocks reward flow when remove selection is cancelled', () => {
    clearIdempotencyPrefix('reward:');

    const deps = createDeps({ maxEnergy: 3 });
    deps.gs._rewardLock = false;
    deps.EventUI = {
      showCardDiscard: vi.fn((gs, isBurn, forwardedDeps) => {
        expect(gs).toBe(deps.gs);
        expect(isBurn).toBe(true);
        forwardedDeps.onCancel();
      }),
    };

    RewardUI.takeRewardRemove(deps);

    expect(deps.EventUI.showCardDiscard).toHaveBeenCalledTimes(1);
    expect(deps.gs._rewardLock).toBe(false);
    expect(deps.rewardCards.classList.contains('picked')).toBe(false);

    clearIdempotencyPrefix('reward:');
  });
});
