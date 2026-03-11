import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EventBus } from '../game/core/event_bus.js';
import { registerCardEventSubscribers } from '../game/core/event_subscribers_card_events.js';
import { GAME } from '../game/core/global_bridge.js';
import { Actions } from '../game/core/state_actions.js';

describe('event subscribers card events', () => {
  beforeEach(() => {
    EventBus.clear();
    GAME.Audio = null;
  });

  it('plays the card ui event without falling back to the legacy method on draw', () => {
    const audio = {
      playEvent: vi.fn(),
      playCard: vi.fn(),
    };
    const callAction = vi.fn();
    const triggerDrawCardAnimation = vi.fn();

    GAME.Audio = audio;

    registerCardEventSubscribers({
      callAction,
      resolveAction: vi.fn(),
      ui: {
        HudUpdateUI: {
          triggerDrawCardAnimation,
        },
      },
    });

    EventBus.emit(Actions.CARD_DRAW);

    expect(audio.playEvent).toHaveBeenCalledWith('ui', 'card');
    expect(audio.playCard).not.toHaveBeenCalled();
    expect(callAction).toHaveBeenNthCalledWith(1, 'renderHand');
    expect(callAction).toHaveBeenNthCalledWith(2, 'renderCombatCards');
    expect(triggerDrawCardAnimation).toHaveBeenCalledTimes(1);
  });
});
