import { playUiItemGetFeedback } from '../../domain/audio/audio_event_helpers.js';
import { EventManager } from '../../systems/event_manager.js';

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
  if (!gs || !data || !runRules) return null;

  const shop = EventManager.createShopEvent(gs, data, runRules, {
    showItemShopFn: (state) => callbacks.showItemShop?.(state),
  });
  if (!shop) return null;

  return decorateEventShopChoiceEffects(shop, deps);
}
