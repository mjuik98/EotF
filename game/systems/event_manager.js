/**
 * event_manager.js - pure event/shop/rest business logic.
 */

import { CONSTANTS } from '../data/constants.js';
import { ITEM_SHOP_RARITY_BASE_COSTS, ITEM_SHOP_RARITY_ORDER } from '../../data/event_shop_data.js';
import { resolveEventChoiceService } from '../app/event/resolve_event_choice_service.js';
import { registerCardDiscovered, registerItemFound } from './codex_records_system.js';

function _totalDeckCards(player) {
  return (player?.deck?.length || 0) + (player?.hand?.length || 0) + (player?.graveyard?.length || 0);
}

function _removeFirst(arr, value) {
  if (!Array.isArray(arr)) return false;
  const idx = arr.indexOf(value);
  if (idx < 0) return false;
  arr.splice(idx, 1);
  return true;
}

function _isItemObtainableFrom(item, source) {
  const routes = item?.obtainableFrom;
  if (!Array.isArray(routes) || routes.length === 0) return true;
  return routes.includes(source);
}

function _getMaxEnergyCap(state) {
  const overrideCap = Number(state?.player?.maxEnergyCap);
  if (Number.isFinite(overrideCap) && overrideCap >= 1) return Math.floor(overrideCap);
  const configCap = Number(CONSTANTS?.PLAYER?.MAX_ENERGY_CAP);
  if (Number.isFinite(configCap) && configCap >= 1) return Math.floor(configCap);
  return 5;
}

function _isChoiceDisabled(choice, state) {
  if (!choice) return false;
  if (typeof choice.isDisabled === 'function') return !!choice.isDisabled(state);
  return !!choice.disabled;
}

function _getItemShopCacheKey(gs) {
  const runCount = Number(gs?.meta?.runCount || 0);
  const region = Number(gs?.currentRegion || 0);
  const floor = Number(gs?.currentFloor || 0);
  const nodeId = gs?.currentNode?.id || 'shop';
  return `${runCount}:${region}:${floor}:${nodeId}`;
}

function _createEventChoiceResult(resultText, {
  isFail = false,
  shouldClose = false,
  isItemShop = false,
  acquiredCard,
  acquiredItem,
} = {}) {
  const resolution = {
    resultText: resultText ?? null,
    isFail,
    shouldClose,
    isItemShop,
  };
  if (acquiredCard) resolution.acquiredCard = acquiredCard;
  if (acquiredItem) resolution.acquiredItem = acquiredItem;
  return resolution;
}

function _createFailedEventChoiceResult(resultText, extra = {}) {
  return _createEventChoiceResult(resultText, {
    ...extra,
    isFail: true,
    shouldClose: false,
  });
}

function _normalizeEventChoiceResult(event, result) {
  if (!result) {
    return _createEventChoiceResult(null, { shouldClose: true });
  }
  if (result === '__item_shop_open__') {
    return _createEventChoiceResult(null, { shouldClose: false, isItemShop: true });
  }
  if (typeof result === 'object' && result !== null) {
    const isFail = result.isFail === true;
    return _createEventChoiceResult(result.resultText, {
      isFail,
      shouldClose: typeof result.shouldClose === 'boolean'
        ? result.shouldClose
        : !event?.persistent && !isFail,
      isItemShop: result.isItemShop === true,
      acquiredCard: result.acquiredCard,
      acquiredItem: result.acquiredItem,
    });
  }
  return _createEventChoiceResult(result, { shouldClose: !event?.persistent });
}

export const EventManager = {
  pickRandomEvent(gs, data) {
    if (!gs || !data?.events) return null;
    const pool = data.events.filter((event) => {
      if (event.layer === 2 && gs.currentFloor < 2) return false;
      return true;
    });
    if (!pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  },

  resolveEventChoice(gs, event, choiceIdx) {
    if (!event || !gs) return _createEventChoiceResult(null, { shouldClose: true });
    const choice = event.choices?.[choiceIdx];
    if (!choice || (!choice.effectId && typeof choice.effect !== 'function')) {
      return _createEventChoiceResult(null, { shouldClose: true });
    }
    if (_isChoiceDisabled(choice, gs)) {
      return {
        resultText: choice?.disabledReason || '현재 선택할 수 없는 선택지입니다.',
        isFail: true,
        shouldClose: false,
        isItemShop: false,
      };
    }

    const result = choice.effectId
      ? resolveEventChoiceService({ gs, event, choice })
      : choice.effect(gs);

    return _normalizeEventChoiceResult(event, result);
  },

  createShopEvent(gs, data, runRules, { showItemShopFn } = {}) {
    if (!gs || !data || !runRules) return null;

    const savedMerchant = (gs.worldMemory?.savedMerchant || 0) > 0;
    const costPotion = runRules.getShopCost(gs, savedMerchant ? 8 : 12);
    const costCard = runRules.getShopCost(gs, 15);
    const costUpgrade = runRules.getShopCost(gs, 20);

    return {
      id: 'shop',
      persistent: true,
      eyebrow: savedMerchant ? '세계 기억 상점' : '상점',
      title: savedMerchant ? '은혜를 갚는 상인' : '잔향 상인',
      desc: savedMerchant
        ? '당신의 도움을 기억한 상인이 가격을 낮춰 주었다.'
        : '부서진 시간대 사이를 떠도는 상인이 거래를 제안한다.',
      choices: [
        {
          text: `🧪 포션 (HP +30) - ${costPotion} 골드`,
          cssClass: 'shop-choice-potion',
          effect: (state) => this._resolveShopPotionChoice(state, costPotion),
        },
        {
          text: `🃏 랜덤 무작위 카드 - ${costCard} 골드`,
          cssClass: 'shop-choice-card',
          effect: (state) => this._resolveShopCardChoice(state, data, costCard),
        },
        {
          text: `✨ 무작위 카드 강화 - ${costUpgrade} 골드`,
          cssClass: 'shop-choice-upgrade',
          effect: (state) => this._resolveShopUpgradeChoice(state, data, costUpgrade),
        },
        {
          text: '🛍️ 유물 상점 열기',
          cssClass: 'shop-choice-relic',
          effect: (state) => {
            if (showItemShopFn) showItemShopFn(state);
            return '__item_shop_open__';
          },
        },
        {
          text: '🚶 떠난다',
          cssClass: 'shop-choice-leave',
          effect: () => null,
        },
      ],
    };
  },

  createRestEvent(gs, data, runRules, { showCardDiscardFn } = {}) {
    if (!gs || !data || !runRules) return null;

    const regionData = typeof globalThis.getRegionData === 'function'
      ? globalThis.getRegionData(gs.currentRegion, gs)
      : null;
    const activeRegionId = Number(gs._activeRegionId ?? regionData?.id);
    const canResetStagnation = activeRegionId === 5
      && Array.isArray(gs._stagnationVault)
      && gs._stagnationVault.length > 0;

    const choices = [
      {
        text: '무작위 카드 강화',
        isDisabled: (state) => {
          const upgradable = (state.player.deck || []).filter((id) => data.upgradeMap?.[id]);
          return upgradable.length === 0;
        },
        disabledReason: '강화 가능한 카드가 없습니다.',
        effect: (state) => this._resolveRestUpgradeChoice(state, data),
      },
      {
        text: '카드 1장 소각',
        effect: (state) => {
          if (showCardDiscardFn) showCardDiscardFn(state, true);
          return '소각할 카드를 선택했습니다.';
        },
      },
    ];

    if (canResetStagnation) {
      choices.push({
        text: '정체 덱 복원',
        effect: (state) => this._resolveRestResetStagnationChoice(state),
      });
    }

    return {
      id: 'rest',
      eyebrow: '휴식',
      title: '잔향의 안식처',
      desc: '고요한 공명 속에서 덱을 정비할 수 있다.',
      choices,
    };
  },

  generateItemShopStock(gs, data, runRules) {
    if (!gs?.player || !data?.items || !runRules) return [];
    const cacheKey = _getItemShopCacheKey(gs);
    if (gs._itemShopStockCacheKey === cacheKey && Array.isArray(gs._itemShopStockCache)) {
      return gs._itemShopStockCache;
    }

    const byRarity = {};
    Object.values(data.items).forEach((item) => {
      if (!_isItemObtainableFrom(item, 'shop')) return;
      if (!byRarity[item.rarity]) byRarity[item.rarity] = [];
      byRarity[item.rarity].push(item);
    });

    const shopItems = [];
    ITEM_SHOP_RARITY_ORDER.forEach((rarity) => {
      const pool = (byRarity[rarity] || []).filter((item) => !gs.player.items.includes(item.id));
      if (!pool.length) return;
      const item = pool[Math.floor(Math.random() * pool.length)];
      const cost = runRules.getShopCost(gs, ITEM_SHOP_RARITY_BASE_COSTS[rarity]?.baseCost || 10);
      shopItems.push({ item, cost, rarity });
    });

    gs._itemShopStockCacheKey = cacheKey;
    gs._itemShopStockCache = shopItems;
    return shopItems;
  },

  purchaseItem(gs, item, cost) {
    if (gs.player.gold < cost) {
      return { success: false, message: `골드가 부족합니다 (${gs.player.gold}/${cost}).` };
    }
    gs.player.gold -= cost;
    gs.player.items.push(item.id);
    registerItemFound(gs, item.id);
    if (typeof item.onAcquire === 'function') {
      item.onAcquire(gs);
    }
    // 상점 구매 트리거 추가 (예: 상인의 펜던트)
    if (typeof gs.triggerItems === 'function') {
      gs.triggerItems('shop_buy', { item, cost });
    }
    gs.addLog?.(`🛒 ${item.name} 구매 완료.`, 'echo');
    return { success: true, message: `${item.name}을(를) 구매했습니다.` };
  },

  discardCard(gs, cardId, data, isBurn = false) {
    let found = false;
    if (_removeFirst(gs.player.deck, cardId)) found = true;
    else if (_removeFirst(gs.player.hand, cardId)) found = true;
    else if (_removeFirst(gs.player.graveyard, cardId)) found = true;

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
  },

  _resolveShopPotionChoice(state, cost) {
    if (state.player.gold < cost) {
      return _createFailedEventChoiceResult(`怨⑤뱶媛 遺議깊빀?덈떎 (${state.player.gold}/${cost}).`);
    }
    return this._shopBuyPotion(state, cost);
  },

  _resolveShopCardChoice(state, data, cost) {
    if (state.player.gold < cost) {
      return _createFailedEventChoiceResult(`怨⑤뱶媛 遺議깊빀?덈떎 (${state.player.gold}/${cost}).`);
    }

    const cardPool = Object.values(data?.cards || {})
      .filter((card) => card && !card.upgraded)
      .map((card) => card.id)
      .filter(Boolean);
    const cardId = cardPool.length
      ? cardPool[Math.floor(Math.random() * cardPool.length)]
      : null;

    if (!cardId) {
      return _createFailedEventChoiceResult('?띾뱷 媛?ν븳 移대뱶媛 ?놁뒿?덈떎.');
    }

    state.player.gold -= cost;
    state.player.deck.push(cardId);
    registerCardDiscovered(state, cardId);
    return _createEventChoiceResult(
      `?깗 ${data.cards?.[cardId]?.name || cardId} ?띾뱷. ?⑥? 怨⑤뱶: ${state.player.gold}`,
      { acquiredCard: cardId },
    );
  },

  _resolveShopUpgradeChoice(state, data, cost) {
    if (state.player.gold < cost) {
      return _createFailedEventChoiceResult(`怨⑤뱶媛 遺議깊빀?덈떎 (${state.player.gold}/${cost}).`);
    }

    const upgradable = (state.player.deck || []).filter((id) => data.upgradeMap?.[id]);
    if (!upgradable.length) {
      return _createFailedEventChoiceResult('媛뺥솕 媛?ν븳 移대뱶媛 ?놁뒿?덈떎.');
    }

    return this._shopUpgradeCard(state, data, cost);
  },

  _resolveRestResetStagnationChoice(state) {
    if (!Array.isArray(state._stagnationVault) || state._stagnationVault.length === 0) {
      return _createFailedEventChoiceResult('蹂듭썝 ?湲?以묒씤 移대뱶媛 ?놁뒿?덈떎.');
    }
    return this._restResetStagnationDeck(state);
  },

  _resolveRestUpgradeChoice(state, data) {
    const upgradable = (state.player.deck || []).filter((id) => data.upgradeMap?.[id]);
    if (!upgradable.length) {
      return _createFailedEventChoiceResult('媛뺥솕 媛?ν븳 移대뱶媛 ?놁뒿?덈떎.');
    }
    return this._restUpgradeCard(state, data);
  },

  _shopBuyPotion(state, cost) {
    if (state.player.gold < cost) return `골드가 부족합니다 (${state.player.gold}/${cost}).`;
    state.player.gold -= cost;
    state.heal?.(30);
    return `❤️ 체력 30 회복. 남은 골드: ${state.player.gold}`;
  },

  _shopBuyCard(state, data, cost) {
    if (state.player.gold < cost) return `골드가 부족합니다 (${state.player.gold}/${cost}).`;
    const cardPool = Object.values(data?.cards || {})
      .filter((card) => card && !card.upgraded)
      .map((card) => card.id)
      .filter(Boolean);
    const cardId = cardPool.length
      ? cardPool[Math.floor(Math.random() * cardPool.length)]
      : null;
    if (!cardId) return '획득 가능한 카드가 없습니다.';
    state.player.gold -= cost;
    state.player.deck.push(cardId);
    registerCardDiscovered(state, cardId);
    return {
      resultText: `🃏 ${data.cards?.[cardId]?.name || cardId} 획득. 남은 골드: ${state.player.gold}`,
      acquiredCard: cardId
    };
  },

  _shopUpgradeCard(state, data, cost) {
    if (state.player.gold < cost) return `골드가 부족합니다 (${state.player.gold}/${cost}).`;
    const upgradable = (state.player.deck || []).filter((id) => data.upgradeMap?.[id]);
    if (!upgradable.length) return '강화 가능한 카드가 없습니다.';
    const cardId = upgradable[Math.floor(Math.random() * upgradable.length)];
    const upgId = data.upgradeMap[cardId];
    const idx = state.player.deck.indexOf(cardId);
    if (idx >= 0) state.player.deck[idx] = upgId;
    state.player.gold -= cost;
    registerCardDiscovered(state, upgId);
    return `✨ ${data.cards?.[cardId]?.name || cardId} 강화 완료. 남은 골드: ${state.player.gold}`;
  },

  _shopBuyEnergy(state, cost) {
    const maxEnergyCap = _getMaxEnergyCap(state);
    if (state.player.gold < cost) return `골드가 부족합니다 (${state.player.gold}/${cost}).`;
    if (state.player.maxEnergy >= maxEnergyCap) return `이미 최대 에너지입니다. (최대 ${maxEnergyCap})`;
    state.player.gold -= cost;
    state.player.maxEnergy = Math.min(maxEnergyCap, state.player.maxEnergy + 1);
    state.player.energy = Math.min(state.player.maxEnergy, (state.player.energy || 0) + 1);
    state.addLog?.(`⚡ 최대 에너지 증가: ${state.player.maxEnergy}`, 'echo');
    return `⚡ 최대 에너지 ${state.player.maxEnergy}. 남은 골드: ${state.player.gold}`;
  },

  _restResetStagnationDeck(state) {
    if (!Array.isArray(state._stagnationVault) || state._stagnationVault.length === 0) {
      return '복원 대기 중인 카드가 없습니다.';
    }
    const restored = [...state._stagnationVault];
    state._stagnationVault = [];
    state.player.deck.push(...restored);
    restored.forEach((cardId) => registerCardDiscovered(state, cardId));
    state.addLog?.(`🧩 정체 영역 복원: 카드 ${restored.length}장`, 'echo');
    return `덱에 카드 ${restored.length}장을 복원했습니다.`;
  },

  _restUpgradeCard(state, data) {
    const upgradable = (state.player.deck || []).filter((id) => data.upgradeMap?.[id]);
    if (!upgradable.length) return '강화 가능한 카드가 없습니다.';
    const cardId = upgradable[Math.floor(Math.random() * upgradable.length)];
    const upgId = data.upgradeMap[cardId];
    const idx = state.player.deck.indexOf(cardId);
    if (idx >= 0) state.player.deck[idx] = upgId;
    registerCardDiscovered(state, upgId);
    state.addLog?.(`✨ ${data.cards?.[cardId]?.name || cardId} 강화`, 'echo');
    return `${data.cards?.[cardId]?.name || cardId} 강화 완료.`;
  },
};
