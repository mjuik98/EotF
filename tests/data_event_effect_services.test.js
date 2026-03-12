import { afterEach, describe, expect, it, vi } from 'vitest';

import { EVENTS } from '../data/events_data.js';

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
});
