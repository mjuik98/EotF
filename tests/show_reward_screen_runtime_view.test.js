import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  ensureRewardScreenShell: vi.fn(),
  renderRewardHeader: vi.fn(),
  renderRewardOptions: vi.fn(),
}));

vi.mock('../game/features/reward/platform/browser/ensure_reward_screen_shell.js', () => ({
  ensureRewardScreenShell: hoisted.ensureRewardScreenShell,
}));

vi.mock('../game/features/reward/presentation/browser/reward_ui_render.js', () => ({
  renderRewardHeader: hoisted.renderRewardHeader,
}));

vi.mock('../game/features/reward/presentation/browser/reward_ui_options.js', () => ({
  renderRewardOptions: hoisted.renderRewardOptions,
}));

import { showRewardScreenView } from '../game/features/reward/presentation/browser/show_reward_screen_runtime.js';

function createRewardCardsElement() {
  const classes = new Set(['picked']);
  return {
    textContent: 'stale',
    classList: {
      add: (...tokens) => tokens.forEach((token) => classes.add(token)),
      remove: (...tokens) => tokens.forEach((token) => classes.delete(token)),
      contains: (token) => classes.has(token),
    },
  };
}

describe('showRewardScreenView', () => {
  it('switches to the reward screen without re-entering the reward action surface', () => {
    const rewardCards = createRewardCardsElement();
    const rewardScreen = {
      classList: {
        add: vi.fn(),
      },
    };
    const doc = {
      getElementById: vi.fn((id) => {
        if (id === 'rewardCards') return rewardCards;
        if (id === 'rewardScreen') return rewardScreen;
        return null;
      }),
    };
    const deps = {
      doc,
      showRewardScreen: vi.fn(() => {
        throw new Error('should not recurse through showRewardScreen');
      }),
      switchScreen: vi.fn(),
    };

    expect(() => showRewardScreenView({}, {
      data: {},
      gs: {},
      isElite: false,
      rewardCards: [],
      rewardMode: 'normal',
    }, deps)).not.toThrow();

    expect(hoisted.ensureRewardScreenShell).toHaveBeenCalledWith(doc);
    expect(deps.showRewardScreen).not.toHaveBeenCalled();
    expect(deps.switchScreen).toHaveBeenCalledWith('reward');
    expect(rewardCards.textContent).toBe('');
    expect(rewardCards.classList.contains('picked')).toBe(false);
  });
});
