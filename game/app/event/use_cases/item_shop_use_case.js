import { EventManager } from '../../../systems/event_manager.js';

export function buildItemShopStockUseCase({ gs, data, runRules } = {}) {
  if (!gs?.player || !data?.items || !runRules) return [];
  return EventManager.generateItemShopStock(gs, data, runRules);
}

export function purchaseItemFromShopUseCase({ gs, item, cost } = {}) {
  if (!gs || !item) return { success: false };
  return EventManager.purchaseItem(gs, item, cost);
}
