import { describe, expect, it, vi } from 'vitest';

import {
  createFailedEventChoiceResult,
  isEventChoiceDisabled,
  normalizeEventChoiceResult,
  pickRandomEventPolicy,
} from '../game/features/event/domain/event_choice_domain.js';

describe('event_choice_domain', () => {
  it('normalizes scalar, structured, and sentinel results', () => {
    expect(normalizeEventChoiceResult({ persistent: false }, 'ok')).toEqual({
      resultText: 'ok',
      isFail: false,
      shouldClose: true,
      isItemShop: false,
    });
    expect(normalizeEventChoiceResult({ persistent: true }, '__item_shop_open__')).toEqual({
      resultText: null,
      isFail: false,
      shouldClose: false,
      isItemShop: true,
    });
    expect(normalizeEventChoiceResult({ persistent: false }, {
      resultText: 'fail',
      isFail: true,
    })).toEqual({
      resultText: 'fail',
      isFail: true,
      shouldClose: false,
      isItemShop: false,
    });
  });

  it('evaluates disabled predicates and failure result helpers', () => {
    expect(isEventChoiceDisabled({ disabled: true }, {})).toBe(true);
    expect(isEventChoiceDisabled({ isDisabled: vi.fn(() => false) }, {})).toBe(false);
    expect(createFailedEventChoiceResult('blocked')).toEqual({
      resultText: 'blocked',
      isFail: true,
      shouldClose: false,
      isItemShop: false,
    });
  });

  it('picks events from the currently unlocked layer pool', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const picked = pickRandomEventPolicy(
      { currentFloor: 1 },
      { events: [{ id: 'a', layer: 1 }, { id: 'b', layer: 2 }] },
    );

    expect(picked).toEqual({ id: 'a', layer: 1 });
    randomSpy.mockRestore();
  });
});
