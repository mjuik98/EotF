import { describe, expect, it, vi } from 'vitest';

import {
  finishEventFlow,
  resolveEventChoiceFlow,
} from '../game/features/event/application/workflows/event_choice_flow.js';

describe('event_choice_flow ports', () => {
  it('delegates finish flow dismissal to an injected flow ui port', () => {
    const dismissModal = vi.fn((_doc, onDone) => onDone());
    const clearCurrentEvent = vi.fn();
    const gs = { _eventLock: true };

    finishEventFlow(
      { getElementById: vi.fn(() => ({ id: 'eventModal' })) },
      gs,
      {
        flowUi: { dismissModal },
        showGameplayScreen: vi.fn(),
        updateUI: vi.fn(),
        renderMinimap: vi.fn(),
        updateNextNodes: vi.fn(),
      },
      clearCurrentEvent,
    );

    expect(dismissModal).toHaveBeenCalledTimes(1);
    expect(clearCurrentEvent).toHaveBeenCalledTimes(1);
  });

  it('delegates resolution rendering to an injected flow ui port', () => {
    const presentResolution = vi.fn();
    const resolution = resolveEventChoiceFlow(0, {
      gs: { _eventLock: false, player: { gold: 10 } },
      event: {
        persistent: true,
        choices: [{ text: 'Take reward' }],
      },
      doc: { getElementById: vi.fn() },
      deps: {
        flowUi: { presentResolution },
        updateUI: vi.fn(),
      },
      sharedData: {},
      onResolveChoice: vi.fn(),
      onRefreshGoldBar: vi.fn(),
      resolveChoice: vi.fn(() => ({
        resultText: 'reward',
      })),
    });

    expect(resolution).toEqual({
      resultText: 'reward',
    });
    expect(presentResolution).toHaveBeenCalledTimes(1);
  });
});
