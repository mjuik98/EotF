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

  it('blocks healing in the echo source region before committing state', () => {
    const host = createHost();
    host._activeRegionId = 4;

    const result = host.heal(6);

    expect(result).toBeUndefined();
    expect(host.commit).not.toHaveBeenCalledWith('player:heal', expect.anything());
    expect(host.addLog).toHaveBeenCalledWith('⚙️ 메아리의 근원: 회복 불가!', 'damage');
  });

  it('applies cursed and item-based scaling before healing', () => {
    const host = createHost();
    host.runConfig = { ascension: 5, curse: 'fatigue' };
    host.getBuff = vi.fn((id) => (id === 'cursed' ? { stacks: 1 } : null));
    host.triggerItems.mockImplementation((event, amount) => (event === 'heal_amount' ? amount + 1 : amount));

    host.heal(10, { name: '치유 물약', type: 'item' });

    expect(host.commit).toHaveBeenCalledWith('player:heal', { amount: 5 });
    expect(host.addLog).toHaveBeenCalledWith(
      '💍 치유 물약: 5 회복',
      'heal',
      expect.objectContaining({
        recentFeed: expect.objectContaining({
          eligible: true,
          text: '치유 물약: 5 회복',
        }),
      }),
    );
  });

  it('resolves routed active region ids without feature run-rule imports', () => {
    const host = createHost();
    host._activeRegionId = null;
    host.currentRegion = 3;
    host.regionRoute = { 3: 4 };

    const result = host.heal(6);

    expect(result).toBeUndefined();
    expect(host.commit).not.toHaveBeenCalledWith('player:heal', expect.anything());
    expect(host.addLog).toHaveBeenCalledWith('⚙️ 메아리의 근원: 회복 불가!', 'damage');
  });

  it('logs source-aware status application and generic gold gains', () => {
    const host = createHost();
    host.addBuff = vi.fn();
    host.commit.mockImplementation((action, payload) => {
      if (action === 'player:gold') {
        return { delta: payload.amount };
      }
      return {};
    });

    host.applyPlayerStatus('poison', 2, { name: '독 안개', type: 'item' });
    host.addGold(3);

    expect(host.addBuff).toHaveBeenCalledWith('poison', 2, {});
    expect(host.addLog).toHaveBeenCalledWith(
      '💍 독 안개: poison 2턴',
      'damage',
      expect.objectContaining({
        recentFeed: expect.objectContaining({
          eligible: true,
        }),
      }),
    );
    expect(host.addLog).toHaveBeenCalledWith('🔺 플레이어: 골드 +3', 'system');
  });
});
