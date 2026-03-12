import { createShopEventAction } from '../../../features/event/app/event_manager_actions.js';

export function createEventShopUseCase({
  gs,
  data,
  runRules,
  showItemShop,
} = {}) {
  if (!gs || !data || !runRules) return null;
  return createShopEventAction(gs, data, runRules, {
    showItemShopFn: (state) => showItemShop?.(state),
  });
}
