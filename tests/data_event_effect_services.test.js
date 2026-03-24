import { afterEach, describe, expect, it, vi } from 'vitest';

import { EVENTS } from '../data/events_data.js';
import { resolveEventChoiceService } from '../game/features/event/application/resolve_event_choice_service.js';

describe('data event effect services', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('passes injected services into direct event choice effects', () => {
    const services = {
      playItemGet: vi.fn(),
      showItemToast: vi.fn(),
    };
    const event = EVENTS.find((entry) => entry.id === 'void_crack');
    const choice = event.choices[0];

    vi.spyOn(Math, 'random').mockReturnValue(0);

    const gs = {
      player: {
        hp: 50,
        items: [],
      },
    };

    const result = choice.effect(gs, services);

    expect(result).toEqual(expect.any(String));
    expect(gs.player.hp).toBe(30);
    expect(gs.player.items).toHaveLength(1);
    expect(services.playItemGet).toHaveBeenCalledTimes(1);
    expect(services.showItemToast).toHaveBeenCalledWith(expect.objectContaining({
      id: gs.player.items[0],
    }));
  });

  it('routes effectId-based choices through the shared event effect handler service', () => {
    const gs = {
      player: {
        hp: 30,
        maxHp: 50,
        gold: 20,
        deck: ['strike'],
      },
      addGold: vi.fn(),
      heal: vi.fn(),
      addEcho: vi.fn(),
      addLog: vi.fn(),
    };

    const result = resolveEventChoiceService({
      gs,
      event: { id: 'merchant_lost' },
      choice: { effectId: 'merchant_help' },
    });

    expect(result).toEqual(expect.any(String));
    expect(gs.heal).toHaveBeenCalledWith(15);
    expect(gs.addLog).toHaveBeenCalledTimes(1);
  });

  it('returns fail payloads for effect handlers when prerequisites are missing', () => {
    const gs = {
      player: {
        hp: 50,
        maxHp: 50,
        gold: 2,
        deck: [],
      },
    };

    const result = resolveEventChoiceService({
      gs,
      event: { id: 'echo_shrine' },
      choice: { effectId: 'shrine_gold_heal' },
    });

    expect(result).toEqual({
      resultText: '상처가 없다. 신도 쓸모없는 것은 받지 않는다.',
      isFail: true,
    });
  });

  it('upgrades a random mapped card through the forge effect handler', () => {
    const gs = {
      player: {
        deck: ['strike', 'guard'],
      },
    };

    vi.spyOn(Math, 'random').mockReturnValue(0);

    const result = resolveEventChoiceService({
      gs,
      event: { id: 'forge' },
      choice: { effectId: 'forge_upgrade_random_card' },
      data: {
        upgradeMap: { strike: 'strike_plus' },
        cards: {
          strike: { name: '타격' },
          strike_plus: { name: '타격+' },
        },
      },
    });

    expect(gs.player.deck).toEqual(['strike_plus', 'guard']);
    expect(result).toContain('타격');
    expect(result).toContain('타격+');
  });

  it('returns a structured failure when forge has no upgradable cards', () => {
    const gs = {
      player: {
        deck: ['guard'],
      },
    };

    const result = resolveEventChoiceService({
      gs,
      event: { id: 'forge' },
      choice: { effectId: 'forge_upgrade_random_card' },
      data: {
        upgradeMap: { strike: 'strike_plus' },
        cards: {},
      },
    });

    expect(result).toEqual({
      resultText: '화로가 식는다. 더 나아질 것이 없다는 뜻인지, 아직 때가 아니라는 뜻인지.',
      isFail: true,
    });
  });

  it('adds a rare card through the resonance handler and plays acquisition audio', () => {
    const services = {
      playItemGet: vi.fn(),
    };
    const gs = {
      player: {
        deck: [],
      },
      getRandomCard: vi.fn(() => 'meteor'),
    };

    const result = resolveEventChoiceService({
      gs,
      event: { id: 'echo_resonance' },
      choice: { effectId: 'echo_resonance_gain_rare_card' },
      data: {
        cards: {
          meteor: { name: '유성 낙하' },
        },
      },
      services,
    });

    expect(gs.player.deck).toEqual(['meteor']);
    expect(result).toEqual({
      resultText: '에너지가 응결한다. 기억이 기술이 된다 — 유성 낙하. 배운 기억이 흐릿한데 손이 먼저 안다.',
      acquiredCard: 'meteor',
    });
    expect(services.playItemGet).toHaveBeenCalledTimes(1);
  });
});
