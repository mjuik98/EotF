import { describe, expect, it, vi } from 'vitest';

import { PlayerResourceUseCaseMethods } from '../game/shared/player/player_resource_use_cases.js';

function createHost() {
  const host = {
    _activeRegionId: 1,
    _currentCard: null,
    currentRegion: 0,
    player: {
      buffs: {},
    },
    addBuff: vi.fn(),
    addLog: vi.fn(),
    commit: vi.fn((action, payload) => {
      if (action === 'player:heal') {
        return { healed: payload.amount };
      }
      if (action === 'player:echo') {
        return { delta: payload.amount };
      }
      return {};
    }),
    getBuff: vi.fn(() => null),
    triggerItems: vi.fn(),
  };

  Object.assign(host, PlayerResourceUseCaseMethods);
  return host;
}

describe('PlayerResourceUseCaseMethods', () => {
  it('attaches recent-feed metadata for card-based heals', () => {
    const host = createHost();
    host._currentCard = { id: 'first_aid', name: '응급 처치' };

    host.heal(6);

    expect(host.addLog).toHaveBeenCalledWith(
      '💚 플레이어: 6 회복',
      'heal',
      expect.objectContaining({
        recentFeed: {
          eligible: true,
          text: '[응급 처치]: 6 회복',
        },
      }),
    );
  });

  it('attaches recent-feed metadata for card-based player echo gain', () => {
    const host = createHost();
    host._currentCard = { id: 'resonance_tap', name: '공명 수집' };

    host.addEcho(4, { name: '공명 수집', type: 'card' });

    expect(host.addLog).toHaveBeenCalledWith(
      '✨ 공명 수집: 잔향 +4',
      'echo',
      expect.objectContaining({
        recentFeed: {
          eligible: true,
          text: '[공명 수집]: 잔향 +4',
        },
      }),
    );
  });
});
