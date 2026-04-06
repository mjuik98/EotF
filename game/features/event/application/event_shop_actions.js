import { createRestEventService } from './rest_service.js';
import { createShopEventService } from './shop_service.js';
import {
  applyRestCardUpgradeState,
  applyShopCardPurchaseState,
  applyShopCardUpgradeState,
  applyShopEnergyPurchaseState,
  applyShopPotionPurchaseState,
  restoreStagnationDeckState,
} from '../state/event_state_commands.js';
import { resolveActiveRegionId } from '../../run/ports/public_rule_capabilities.js';
import {
  createEventChoiceResult,
  createFailedEventChoiceResult,
} from './resolve_event_choice_actions.js';
import {
  getEventShopMaxEnergyCap,
  hasRestorableStagnationCards,
  pickRandomBaseCardId,
  pickRandomUpgradeableCardId,
} from './event_shop_policy_queries.js';

function emitShopBuy(state, payload) {
  state.triggerItems?.('shop_buy', payload);
}

export function shopBuyPotion(state, cost) {
  const itemUseResult = state.triggerItems?.('item_use', { itemId: 'potion', cost, kind: 'potion' });
  const effectiveCost = itemUseResult?.costFree ? 0 : Math.max(0, Number(itemUseResult?.cost ?? cost) || 0);
  if (state.player.gold < effectiveCost) return `골드가 부족합니다 (${state.player.gold}/${effectiveCost}).`;
  applyShopPotionPurchaseState(state, effectiveCost);
  emitShopBuy(state, { kind: 'potion', cost: effectiveCost });
  return `❤️ 체력 30 회복. 남은 골드: ${state.player.gold}`;
}

export function shopBuyCard(state, data, cost) {
  if (state.player.gold < cost) return `골드가 부족합니다 (${state.player.gold}/${cost}).`;
  const cardId = pickRandomBaseCardId(data);
  if (!cardId) return '획득 가능한 카드가 없습니다.';
  applyShopCardPurchaseState(state, cardId, cost);
  emitShopBuy(state, { kind: 'card', cost, cardId });
  return {
    resultText: `🃏 ${data.cards?.[cardId]?.name || cardId} 획득. 남은 골드: ${state.player.gold}`,
    acquiredCard: cardId,
  };
}

export function shopUpgradeCard(state, data, cost) {
  if (state.player.gold < cost) return `골드가 부족합니다 (${state.player.gold}/${cost}).`;
  const cardId = pickRandomUpgradeableCardId(state.player, data.upgradeMap);
  if (!cardId) return '강화 가능한 카드가 없습니다.';
  const upgId = data.upgradeMap[cardId];
  applyShopCardUpgradeState(state, cardId, upgId, cost);
  emitShopBuy(state, { kind: 'upgrade', cost, cardId, upgradedId: upgId });
  return `✨ ${data.cards?.[cardId]?.name || cardId} 강화 완료. 남은 골드: ${state.player.gold}`;
}

export function shopBuyEnergy(state, cost) {
  const maxEnergyCap = getEventShopMaxEnergyCap(state);
  if (state.player.gold < cost) return `골드가 부족합니다 (${state.player.gold}/${cost}).`;
  if (state.player.maxEnergy >= maxEnergyCap) return `이미 최대 에너지입니다. (최대 ${maxEnergyCap})`;
  applyShopEnergyPurchaseState(state, cost, maxEnergyCap);
  emitShopBuy(state, { kind: 'energy', cost });
  state.addLog?.(`⚡ 최대 에너지 증가: ${state.player.maxEnergy}`, 'echo');
  return `⚡ 최대 에너지 ${state.player.maxEnergy}. 남은 골드: ${state.player.gold}`;
}

export function restResetStagnationDeck(state) {
  if (!hasRestorableStagnationCards(state)) {
    return '복원 대기 중인 카드가 없습니다.';
  }
  const restored = restoreStagnationDeckState(state);
  state.addLog?.(`🧩 정체 영역 복원: 카드 ${restored.length}장`, 'echo');
  return `덱에 카드 ${restored.length}장을 복원했습니다.`;
}

export function restUpgradeCard(state, data) {
  const cardId = pickRandomUpgradeableCardId(state.player, data.upgradeMap);
  if (!cardId) return '강화 가능한 카드가 없습니다.';
  const upgId = data.upgradeMap[cardId];
  applyRestCardUpgradeState(state, cardId, upgId);
  state.triggerItems?.('rest_upgrade', {
    cardId,
    upgradedId: upgId,
    upgradeMap: data.upgradeMap,
  });
  state.addLog?.(`✨ ${data.cards?.[cardId]?.name || cardId} 강화`, 'echo');
  return `${data.cards?.[cardId]?.name || cardId} 강화 완료.`;
}

export function resolveShopPotionChoice(state, cost) {
  if (state.player.gold < cost) {
    return createFailedEventChoiceResult(`골드가 부족합니다 (${state.player.gold}/${cost}).`);
  }
  return shopBuyPotion(state, cost);
}

export function resolveShopCardChoice(state, data, cost) {
  if (state.player.gold < cost) {
    return createFailedEventChoiceResult(`골드가 부족합니다 (${state.player.gold}/${cost}).`);
  }

  const cardId = pickRandomBaseCardId(data);
  if (!cardId) {
    return createFailedEventChoiceResult('획득 가능한 카드가 없습니다.');
  }

  applyShopCardPurchaseState(state, cardId, cost);
  emitShopBuy(state, { kind: 'card', cost, cardId });
  return createEventChoiceResult(
    `🃏 ${data.cards?.[cardId]?.name || cardId} 획득. 남은 골드: ${state.player.gold}`,
    { acquiredCard: cardId },
  );
}

export function resolveShopUpgradeChoice(state, data, cost) {
  if (state.player.gold < cost) {
    return createFailedEventChoiceResult(`골드가 부족합니다 (${state.player.gold}/${cost}).`);
  }

  if (!pickRandomUpgradeableCardId(state.player, data.upgradeMap)) {
    return createFailedEventChoiceResult('강화 가능한 카드가 없습니다.');
  }

  return shopUpgradeCard(state, data, cost);
}

export function resolveRestResetStagnationChoice(state) {
  if (!hasRestorableStagnationCards(state)) {
    return createFailedEventChoiceResult('복원 대기 중인 카드가 없습니다.');
  }
  return restResetStagnationDeck(state);
}

export function resolveRestUpgradeChoice(state, data) {
  if (!pickRandomUpgradeableCardId(state.player, data.upgradeMap)) {
    return createFailedEventChoiceResult('강화 가능한 카드가 없습니다.');
  }
  return restUpgradeCard(state, data);
}

export function createShopEvent(gs, data, runRules, { showItemShopFn } = {}) {
  if (!gs || !data || !runRules) return null;
  return createShopEventService({
    uiActions: {
      handleChoice: (choiceId, state, serviceData, costs) => {
        if (choiceId === 'buy_potion') return resolveShopPotionChoice(state, costs.costPotion);
        if (choiceId === 'buy_card') return resolveShopCardChoice(state, serviceData, costs.costCard);
        if (choiceId === 'upgrade_card') return resolveShopUpgradeChoice(state, serviceData, costs.costUpgrade);
        if (choiceId === 'open_item_shop') {
          if (showItemShopFn) showItemShopFn(state);
          return '__item_shop_open__';
        }
        return null;
      },
    },
  }).create(gs, data, runRules);
}

export function createRestEvent(gs, data, runRules, { showCardDiscardFn } = {}) {
  if (!gs || !data || !runRules) return null;
  return createRestEventService({
    regionResolver: (state) => resolveActiveRegionId(state),
    uiActions: {
      handleChoice: (choiceId, state, serviceData) => {
        if (choiceId === 'upgrade_random') return resolveRestUpgradeChoice(state, serviceData);
        if (choiceId === 'burn_one') {
          if (showCardDiscardFn) showCardDiscardFn(state, true);
          return '소각할 카드를 선택했습니다.';
        }
        if (choiceId === 'reset_stagnation') return resolveRestResetStagnationChoice(state);
        return null;
      },
    },
  }).create(gs, data);
}
