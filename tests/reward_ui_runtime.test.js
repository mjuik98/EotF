import { describe, expect, it, vi } from 'vitest';
import { clearIdempotencyPrefix } from '../game/utils/idempotency_utils.js';
import {
  skipRewardRuntime,
  takeRewardCardRuntime,
  takeRewardRemoveRuntime,
  takeRewardUpgradeRuntime,
} from '../game/ui/screens/reward_ui_runtime.js';

function createMockElement() {
  const classes = new Set();
  return {
    classList: {
      add: (...tokens) => tokens.forEach((token) => classes.add(token)),
      remove: (...tokens) => tokens.forEach((token) => classes.delete(token)),
      contains: (token) => classes.has(token),
    },
  };
}

function createDoc() {
  const rewardCards = createMockElement();
  return {
    getElementById: vi.fn((id) => {
      if (id === 'rewardCards') return rewardCards;
      return null;
    }),
    rewardCards,
  };
}

describe('reward_ui_runtime', () => {
  it('plays hit feedback when no upgrade target exists', () => {
    clearIdempotencyPrefix('reward:');
    const audioEngine = { playEvent: vi.fn(), playHit: vi.fn() };
    const deps = {
      gs: {
        _rewardLock: false,
        player: { deck: ['base_card'] },
      },
      data: {
        cards: {},
        upgradeMap: {},
      },
      audioEngine,
      playItemGet: vi.fn(),
      showItemToast: vi.fn(),
    };

    try {
      takeRewardUpgradeRuntime(deps);
    } finally {
      clearIdempotencyPrefix('reward:');
    }

    expect(audioEngine.playEvent).toHaveBeenCalledWith('attack', 'slash');
    expect(audioEngine.playHit).not.toHaveBeenCalled();
    expect(deps.gs._rewardLock).toBe(false);
    expect(deps.playItemGet).not.toHaveBeenCalled();
    expect(deps.showItemToast).not.toHaveBeenCalled();
  });

  it('uses injected playItemGet without double-triggering the audio engine fallback', () => {
    vi.useFakeTimers();
    clearIdempotencyPrefix('reward:');
    const doc = createDoc();
    const returnToGame = vi.fn();
    const playItemGet = vi.fn();
    const audioEngine = { playEvent: vi.fn(), playItemGet: vi.fn() };
    const deps = {
      gs: {
        _rewardLock: false,
        player: { deck: [] },
      },
      data: {
        cards: {
          strike: { name: 'Strike', icon: 'S', desc: 'Deal damage' },
        },
      },
      doc,
      audioEngine,
      playItemGet,
      showItemToast: vi.fn(),
      returnToGame,
    };

    try {
      takeRewardCardRuntime('strike', deps);
      vi.runAllTimers();
    } finally {
      vi.useRealTimers();
      clearIdempotencyPrefix('reward:');
    }

    expect(playItemGet).toHaveBeenCalledTimes(1);
    expect(audioEngine.playEvent).not.toHaveBeenCalled();
    expect(audioEngine.playItemGet).not.toHaveBeenCalled();
    expect(returnToGame).toHaveBeenCalledWith(true);
  });

  it('returns directly to the game when remove flow has no EventUI discard hook', () => {
    clearIdempotencyPrefix('reward:');
    const doc = createDoc();
    const returnToGame = vi.fn();
    const deps = {
      gs: {
        _rewardLock: false,
      },
      doc,
      returnToGame,
    };

    try {
      takeRewardRemoveRuntime(deps);
    } finally {
      clearIdempotencyPrefix('reward:');
    }

    expect(doc.rewardCards.classList.contains('picked')).toBe(true);
    expect(deps.gs._rewardLock).toBe(true);
    expect(returnToGame).toHaveBeenCalledWith(true);
  });

  it('locks the reward and returns to game when skipping', () => {
    clearIdempotencyPrefix('reward:');
    const returnToGame = vi.fn();
    const deps = {
      gs: {
        _rewardLock: false,
      },
      returnToGame,
    };

    try {
      skipRewardRuntime(deps);
    } finally {
      clearIdempotencyPrefix('reward:');
    }

    expect(deps.gs._rewardLock).toBe(true);
    expect(returnToGame).toHaveBeenCalledWith(true);
  });
});
