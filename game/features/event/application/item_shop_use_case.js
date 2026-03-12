import {
  buildItemShopStockAction,
  purchaseItemFromShopAction,
} from '../app/event_manager_actions.js';

export function buildItemShopStockUseCase({ gs, data, runRules } = {}) {
  if (!gs?.player || !data?.items || !runRules) return [];
  return buildItemShopStockAction(gs, data, runRules);
}

export function purchaseItemFromShopUseCase({ gs, item, cost } = {}) {
  if (!gs || !item) return { success: false };
  return purchaseItemFromShopAction(gs, item, cost);
}
