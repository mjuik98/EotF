import { ITEM_SHOP_RARITY_BASE_COSTS, ITEM_SHOP_RARITY_ORDER } from '../../../../data/event_shop_data.js';
import { isContentAvailable } from '../ports/item_shop_policy_ports.js';
import {
  discardEventCardState,
  purchaseEventShopItemState,
  readItemShopStockCache,
  writeItemShopStockCache,
} from '../state/event_state_commands.js';

function isItemObtainableFrom(item, source) {
  const routes = item?.obtainableFrom;
  if (!Array.isArray(routes) || routes.length === 0) return true;
  return routes.includes(source);
}

function getItemShopCacheKey(gs) {
  const runCount = Number(gs?.meta?.runCount || 0);
  const region = Number(gs?.currentRegion || 0);
  const floor = Number(gs?.currentFloor || 0);
  const nodeId = gs?.currentNode?.id || 'shop';
  return `${runCount}:${region}:${floor}:${nodeId}`;
}

export function generateItemShopStock(gs, data, runRules) {
  if (!gs?.player || !data?.items || !runRules) return [];
  const cacheKey = getItemShopCacheKey(gs);
  const cached = readItemShopStockCache(gs, cacheKey);
  if (cached) return cached;

  const byRarity = {};
  Object.values(data.items).forEach((item) => {
    if (!isItemObtainableFrom(item, 'shop')) return;
    if (!isContentAvailable(gs?.meta, { type: 'relic', id: item.id, classId: gs?.player?.class })) return;
    if (!byRarity[item.rarity]) byRarity[item.rarity] = [];
    byRarity[item.rarity].push(item);
  });

  const shopItems = [];
  ITEM_SHOP_RARITY_ORDER.forEach((rarity) => {
    const pool = (byRarity[rarity] || []).filter((item) => !gs.player.items.includes(item.id));
    if (!pool.length) return;
    const item = pool[Math.floor(Math.random() * pool.length)];
    const cost = runRules.getShopCost(gs, ITEM_SHOP_RARITY_BASE_COSTS[rarity]?.baseCost || 10, { type: 'relic' });
    shopItems.push({ item, cost, rarity });
  });

  return writeItemShopStockCache(gs, cacheKey, shopItems);
}

export function purchaseItem(gs, item, cost) {
  if (gs.player.gold < cost) {
    return { success: false, message: `골드가 부족합니다 (${gs.player.gold}/${cost}).` };
  }
  purchaseEventShopItemState(gs, item, cost);
  if (typeof gs.triggerItems === 'function') {
    gs.triggerItems('shop_buy', { item, cost });
  }
  gs.addLog?.(`🛒 ${item.name} 구매 완료.`, 'echo');
  return { success: true, message: `${item.name}을(를) 구매했습니다.` };
}

export function discardEventCard(gs, cardId, data, isBurn = false) {
  const found = discardEventCardState(gs, cardId);
  if (!found) return { success: false, message: '카드를 찾을 수 없습니다.' };

  const card = data.cards?.[cardId];
  if (!isBurn) {
    gs.addGold?.(8);
    gs.addLog?.(`💰 ${card?.name || cardId} 판매: 골드 +8`, 'system');
  } else {
    gs.addLog?.(`🔥 ${card?.name || cardId} 소각`, 'system');
  }

  return {
    success: true,
    message: isBurn
      ? `${card?.name || cardId} 소각 완료.`
      : `${card?.name || cardId} 판매 완료 (+8 골드).`,
  };
}
