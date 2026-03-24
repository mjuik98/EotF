import { describe, expect, it } from 'vitest';
import { EVENTS } from '../data/events_data.js';
import { EventManager } from '../game/features/event/ports/public_compat_capabilities.js';

function createState() {
  return {
    worldMemory: {},
    player: {
      hp: 40,
      maxHp: 100,
      deck: [],
      hand: [],
      graveyard: [],
    },
    heal(amount) {
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + amount);
    },
    addLog: () => {},
  };
}

describe('merchant_lost event resolution', () => {
  it('treats "손을 내민다" as a successful choice and closes the event', () => {
    const gs = createState();
    const event = EVENTS.find((entry) => entry.id === 'merchant_lost');
    const choiceIdx = event?.choices?.findIndex((choice) => String(choice?.text || '').includes('손을 내민다'));

    expect(event).toBeTruthy();
    expect(choiceIdx).toBeGreaterThanOrEqual(0);

    const resolution = EventManager.resolveEventChoice(gs, event, choiceIdx);

    expect(gs.worldMemory.savedMerchant).toBe(1);
    expect(gs.player.hp).toBe(55);
    expect(resolution.isFail).toBe(false);
    expect(resolution.shouldClose).toBe(true);
  });
});
