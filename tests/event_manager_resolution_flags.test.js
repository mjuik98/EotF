import { describe, expect, it } from 'vitest';

import { EVENTS } from '../data/events_data.js';
import { EventManager } from '../game/systems/event_manager.js';

describe('EventManager structured resolution flags', () => {
  it('treats explicit successful object results as success even if the text contains failure keywords', () => {
    const resolution = EventManager.resolveEventChoice(
      {},
      {
        persistent: false,
        choices: [
          {
            effect: () => ({
              resultText: '말은 없었다. 하지만 길은 열렸다.',
              isFail: false,
            }),
          },
        ],
      },
      0,
    );

    expect(resolution.resultText).toBe('말은 없었다. 하지만 길은 열렸다.');
    expect(resolution.isFail).toBe(false);
    expect(resolution.shouldClose).toBe(true);
  });

  it('keeps explicit failure object results open regardless of result text parsing', () => {
    const resolution = EventManager.resolveEventChoice(
      {},
      {
        persistent: false,
        choices: [
          {
            effect: () => ({
              resultText: '대가가 부족하다.',
              isFail: true,
            }),
          },
        ],
      },
      0,
    );

    expect(resolution.resultText).toBe('대가가 부족하다.');
    expect(resolution.isFail).toBe(true);
    expect(resolution.shouldClose).toBe(false);
  });

  it('returns explicit failure objects from real event data branches', () => {
    const event = EVENTS.find((entry) => entry.id === 'shrine');
    const choiceIdx = event?.choices?.findIndex((choice) => String(choice?.text || '').includes('15'));
    const gs = {
      player: {
        hp: 40,
        maxHp: 40,
        gold: 15,
      },
    };

    const resolution = EventManager.resolveEventChoice(gs, event, choiceIdx);

    expect(resolution.isFail).toBe(true);
    expect(resolution.shouldClose).toBe(false);
    expect(typeof resolution.resultText).toBe('string');
  });

  it('returns structured failure objects for shop purchase validation', () => {
    const shopEvent = EventManager.createShopEvent(
      {
        player: { gold: 0, deck: [], items: [] },
        worldMemory: {},
      },
      { cards: {} },
      { getShopCost: (_gs, baseCost) => baseCost },
    );

    const result = shopEvent.choices[0].effect({
      player: { gold: 0, deck: [], items: [] },
      worldMemory: {},
    });

    expect(result.isFail).toBe(true);
    expect(result.shouldClose).toBe(false);
    expect(typeof result.resultText).toBe('string');
  });
});
