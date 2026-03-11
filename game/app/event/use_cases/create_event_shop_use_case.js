import { EventManager } from '../../../systems/event_manager.js';

export function createEventShopUseCase({
  gs,
  data,
  runRules,
  showItemShop,
} = {}) {
  if (!gs || !data || !runRules) return null;
  return EventManager.createShopEvent(gs, data, runRules, {
    showItemShopFn: (state) => showItemShop?.(state),
  });
}
