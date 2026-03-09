import { describe, expect, it, vi } from 'vitest';
import { RewardUI } from '../game/ui/screens/reward_ui.js';
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

function createDeps({ maxEnergy }) {
  const doc = createMockDoc();
  const rewardEyebrow = createMockElement('div');
  const rewardTitle = createMockElement('div');
  const rewardCards = createMockElement('div');

  doc.register('rewardEyebrow', rewardEyebrow);
  doc.register('rewardTitle', rewardTitle);
  doc.register('rewardCards', rewardCards);

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
    getRandomCard: vi.fn(() => {
      const id = cardIds[cardPickIndex % cardIds.length];
      cardPickIndex += 1;
      return id;
    }),
  };

  return {
    gs,
    data: { cards, items: {} },
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

describe('RewardUI blessing disabled visuals', () => {
  it('marks permanent energy blessing with emphasized disabled visuals at cap', () => {
    const cap = Number(CONSTANTS?.PLAYER?.MAX_ENERGY_CAP) || 5;
    const deps = createDeps({ maxEnergy: cap });

    RewardUI.showRewardScreen('boss', deps);

    const energyBlessing = findBlessingWrapper(deps.rewardCards, '영구적인 기운');
    expect(energyBlessing).toBeTruthy();
    expect(energyBlessing.disabled).toBe(true);
    expect(energyBlessing.classList.contains('reward-permanent-energy-disabled')).toBe(true);
    expect(energyBlessing.title).toContain(`최대 ${cap}`);

    const blessingCard = energyBlessing.children[0];
    const overlay = findChildByClass(blessingCard, 'reward-disabled-overlay');
    const badge = findChildByClass(blessingCard, 'reward-disabled-state-badge');
    const reason = findChildByClass(blessingCard, 'reward-disabled-reason');

    expect(overlay).toBeTruthy();
    expect(badge?.textContent).toBe('최대치 도달');
    expect(reason?.textContent).toContain(`최대 ${cap}`);
    expect(deps.switchScreen).toHaveBeenCalledWith('reward');
  });

  it('keeps permanent energy blessing selectable below cap', () => {
    const cap = Number(CONSTANTS?.PLAYER?.MAX_ENERGY_CAP) || 5;
    const deps = createDeps({ maxEnergy: Math.max(0, cap - 1) });

    RewardUI.showRewardScreen('boss', deps);

    const energyBlessing = findBlessingWrapper(deps.rewardCards, '영구적인 기운');
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
});
