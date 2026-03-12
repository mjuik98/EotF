import { describe, expect, it, vi } from 'vitest';

const { createEventShopUseCaseSpy } = vi.hoisted(() => ({
  createEventShopUseCaseSpy: vi.fn(),
}));

vi.mock('../game/app/event/use_cases/create_event_shop_use_case.js', () => ({
  createEventShopUseCase: createEventShopUseCaseSpy,
}));

import { createEventShop, decorateEventShopChoiceEffects } from '../game/ui/screens/event_ui_shop.js';

describe('event_ui_shop', () => {
  it('decorates successful shop effects with item-get and UI refresh side effects', () => {
    const playItemGet = vi.fn();
    const updateUI = vi.fn();
    const audioEngine = { playEvent: vi.fn(), playItemGet: vi.fn() };
    const originalEffect = vi.fn(() => 'Bought potion');
    const shop = decorateEventShopChoiceEffects({
      choices: [{ effect: originalEffect }],
    }, { playItemGet, updateUI, audioEngine });

    const result = shop.choices[0].effect({ player: {} });

    expect(result).toBe('Bought potion');
    expect(originalEffect).toHaveBeenCalledTimes(1);
    expect(playItemGet).toHaveBeenCalledTimes(1);
    expect(audioEngine.playEvent).not.toHaveBeenCalled();
    expect(audioEngine.playItemGet).not.toHaveBeenCalled();
    expect(updateUI).toHaveBeenCalledTimes(1);
  });

  it('skips success hooks for fail results and item-shop sentinel results', () => {
    const playItemGet = vi.fn();
    const updateUI = vi.fn();
    const failedEffect = vi.fn(() => ({ resultText: 'No gold', isFail: true }));
    const openEffect = vi.fn(() => '__item_shop_open__');
    const shop = decorateEventShopChoiceEffects({
      choices: [
        { effect: failedEffect },
        { effect: openEffect },
      ],
    }, { playItemGet, updateUI });

    expect(shop.choices[0].effect({})).toEqual({ resultText: 'No gold', isFail: true });
    expect(shop.choices[1].effect({})).toBe('__item_shop_open__');
    expect(playItemGet).not.toHaveBeenCalled();
    expect(updateUI).not.toHaveBeenCalled();
  });

  it('creates a decorated shop event and wires showItemShop callback through EventManager', () => {
    const showItemShop = vi.fn();
    const deps = {
      playItemGet: vi.fn(),
      updateUI: vi.fn(),
    };
    const choiceEffect = vi.fn((state) => {
      state.opened = true;
      return { resultText: 'Potion bought' };
    });
    createEventShopUseCaseSpy.mockImplementationOnce(({ showItemShop }) => {
      showItemShop?.({ fromEventManager: true });
      return {
        id: 'shop',
        choices: [{ effect: choiceEffect }],
      };
    });

    const shop = createEventShop({ player: {} }, { cards: {} }, { getShopCost: vi.fn() }, deps, {
      showItemShop,
    });

    expect(createEventShopUseCaseSpy).toHaveBeenCalledTimes(1);
    expect(showItemShop).toHaveBeenCalledWith({ fromEventManager: true });

    const state = {};
    expect(shop.choices[0].effect(state)).toEqual({ resultText: 'Potion bought' });
    expect(state.opened).toBe(true);
    expect(deps.playItemGet).toHaveBeenCalledTimes(1);
    expect(deps.updateUI).toHaveBeenCalledTimes(1);
  });

  it('falls back to the audio engine item-get event when no injected hook exists', () => {
    const audioEngine = { playEvent: vi.fn(), playItemGet: vi.fn() };
    const updateUI = vi.fn();
    const originalEffect = vi.fn(() => ({ resultText: 'Relic bought' }));
    const shop = decorateEventShopChoiceEffects({
      choices: [{ effect: originalEffect }],
    }, { audioEngine, updateUI });

    expect(shop.choices[0].effect({ player: {} })).toEqual({ resultText: 'Relic bought' });
    expect(audioEngine.playEvent).toHaveBeenCalledWith('ui', 'itemGet');
    expect(audioEngine.playItemGet).not.toHaveBeenCalled();
    expect(updateUI).toHaveBeenCalledTimes(1);
  });
});
