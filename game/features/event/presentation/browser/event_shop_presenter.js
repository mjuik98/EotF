import { playUiItemGetFeedback } from '../../ports/public_audio_runtime_capabilities.js';
import { createEventShopUseCase } from '../../application/create_event_shop_use_case.js';

export function decorateEventShopChoiceEffects(shop, deps = {}) {
  if (!shop?.choices?.length) return shop || null;

  shop.choices.forEach((choice) => {
    const originalEffect = choice.effect;
    if (typeof originalEffect !== 'function') return;

    choice.effect = (state) => {
      const result = originalEffect(state);
      const isSkip = typeof result === 'object' && result !== null
        ? result.isFail === true
        : false;

      if (result && !isSkip && result !== '__item_shop_open__') {
        playUiItemGetFeedback(deps.playItemGet, deps.audioEngine);
        deps.updateUI?.();
      }
      return result;
    };
  });

  return shop;
}

export function createEventShop(gs, data, runRules, deps = {}, callbacks = {}) {
  const shop = createEventShopUseCase({
    gs,
    data,
    runRules,
    showItemShop: (state) => callbacks.showItemShop?.(state),
  });
  if (!shop) return null;

  return decorateEventShopChoiceEffects(shop, deps);
}
