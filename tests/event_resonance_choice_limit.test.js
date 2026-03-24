import { describe, expect, it } from 'vitest';
import { EVENTS } from '../data/events_data.js';
import { EventManager } from '../game/features/event/ports/public_compat_capabilities.js';

function createState() {
  return {
    player: {
      deck: [],
      hand: [],
      graveyard: [],
    },
    getRandomCard: () => 'strike',
  };
}

describe('echo_resonance event resolution', () => {
  it('treats "에너지가 카드를 원한다" as a successful choice and closes the event', () => {
    const gs = createState();
    const event = EVENTS.find((entry) => entry.id === 'echo_resonance');
    const choiceIdx = event?.choices?.findIndex((choice) => String(choice?.text || '').includes('에너지가 카드를 원한다'));

    expect(event).toBeTruthy();
    expect(choiceIdx).toBeGreaterThanOrEqual(0);

    const resolution = EventManager.resolveEventChoice(gs, event, choiceIdx);

    expect(gs.player.deck).toEqual(['strike']);
    expect(resolution.isFail).toBe(false);
    expect(resolution.shouldClose).toBe(true);
  });
});
