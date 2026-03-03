/**
 * event_manager.js - pure event/shop/rest business logic.
 */

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
    if (!event || !gs) return { resultText: null, isFail: false, shouldClose: true, isItemShop: false };
    const choice = event.choices?.[choiceIdx];
    if (!choice || typeof choice.effect !== 'function') {
      return { resultText: null, isFail: false, shouldClose: true, isItemShop: false };
    }

    const result = choice.effect(gs);
    if (!result) {
      return { resultText: null, isFail: false, shouldClose: true, isItemShop: false };
    }
    if (result === '__item_shop_open__') {
      return { resultText: null, isFail: false, shouldClose: false, isItemShop: true };
    }

    const failPattern = /(not enough|insufficient|none available|없|부족)/i;
    const isFail = typeof result === 'string' && failPattern.test(result);
    const shouldClose = !event.persistent && !isFail;

    return { resultText: result, isFail, shouldClose, isItemShop: false };
  },

  createShopEvent(gs, data, runRules, { showItemShopFn } = {}) {
    if (!gs || !data || !runRules) return null;

    const savedMerchant = (gs.worldMemory?.savedMerchant || 0) > 0;
    const costPotion = runRules.getShopCost(gs, savedMerchant ? 8 : 12);
    const costCard = runRules.getShopCost(gs, 15);
    const costUpgrade = runRules.getShopCost(gs, 20);
    const costEnergy = runRules.getShopCost(gs, 30);

    return {
      id: 'shop',
      persistent: true,
      eyebrow: savedMerchant ? 'World Memory Shop' : 'Layer 1 Shop',
      title: savedMerchant ? 'Grateful Merchant' : 'Echo Merchant',
      desc: savedMerchant
        ? 'The merchant remembers your help and lowers prices.'
        : 'A wandering merchant offers deals from fractured timelines.',
      choices: [
        {
          text: `Potion (HP +30) - ${costPotion} gold`,
          effect: (state) => this._shopBuyPotion(state, costPotion),
        },
        {
          text: `Random uncommon card - ${costCard} gold`,
          effect: (state) => this._shopBuyCard(state, data, costCard),
        },
        {
          text: `Upgrade random card - ${costUpgrade} gold`,
          effect: (state) => this._shopUpgradeCard(state, data, costUpgrade),
        },
        {
          text: `Max energy +1 - ${costEnergy} gold`,
          effect: (state) => this._shopBuyEnergy(state, costEnergy),
        },
        {
          text: 'Open relic shop',
          effect: (state) => {
            if (showItemShopFn) showItemShopFn(state);
            return '__item_shop_open__';
          },
        },
        {
          text: 'Leave',
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
        text: 'Burn a card',
        effect: (state) => {
          if (showCardDiscardFn) showCardDiscardFn(state, true);
          return null;
        },
      },
      {
        text: 'Upgrade random card',
        effect: (state) => this._restUpgradeCard(state, data),
      },
    ];

    if (canResetStagnation) {
      choices.push({
        text: 'Reset stagnation deck',
        effect: (state) => this._restResetStagnationDeck(state, data),
      });
    }

    return {
      id: 'rest',
      eyebrow: 'Layer 1 Rest Site',
      title: 'Echo Sanctuary',
      desc: 'A still pocket of resonance where your deck can be repaired.',
      choices,
    };
  },

  generateItemShopStock(gs, data, runRules) {
    if (!gs?.player || !data?.items || !runRules) return [];

    const rarityConfig = {
      common: { baseCost: 10 },
      uncommon: { baseCost: 20 },
      rare: { baseCost: 35 },
      legendary: { baseCost: 60 },
    };

    const byRarity = {};
    Object.values(data.items).forEach((item) => {
      if (!byRarity[item.rarity]) byRarity[item.rarity] = [];
      byRarity[item.rarity].push(item);
    });

    const shopItems = [];
    ['common', 'uncommon', 'rare', 'legendary'].forEach((rarity) => {
      const pool = (byRarity[rarity] || []).filter((item) => !gs.player.items.includes(item.id));
      if (!pool.length) return;
      const item = pool[Math.floor(Math.random() * pool.length)];
      const cost = runRules.getShopCost(gs, rarityConfig[rarity]?.baseCost || 10);
      shopItems.push({ item, cost, rarity });
    });

    return shopItems;
  },

  purchaseItem(gs, item, cost) {
    if (gs.player.gold < cost) {
      return { success: false, message: `Not enough gold (${gs.player.gold}/${cost}).` };
    }
    gs.player.gold -= cost;
    gs.player.items.push(item.id);
    if (gs.meta?.codex) gs.meta.codex.items.add(item.id);
    gs.addLog?.(`Purchased ${item.name}.`, 'echo');
    return { success: true, message: `${item.name} purchased.` };
  },

  discardCard(gs, cardId, data, isBurn = false) {
    let found = false;
    if (_removeFirst(gs.player.deck, cardId)) found = true;
    else if (_removeFirst(gs.player.hand, cardId)) found = true;
    else if (_removeFirst(gs.player.graveyard, cardId)) found = true;

    if (!found) return { success: false, message: 'Card not found.' };

    const card = data.cards?.[cardId];
    if (!isBurn) {
      gs.addGold?.(8);
      gs.addLog?.(`${card?.name || cardId} sold for 8 gold.`, 'system');
    } else {
      gs.addLog?.(`${card?.name || cardId} burned.`, 'system');
    }

    return {
      success: true,
      message: isBurn
        ? `${card?.name || cardId} burned.`
        : `${card?.name || cardId} sold (+8 gold).`,
    };
  },

  _shopBuyPotion(state, cost) {
    if (state.player.gold < cost) return `Not enough gold (${state.player.gold}/${cost}).`;
    state.player.gold -= cost;
    state.heal?.(30);
    return `Recovered 30 HP. Gold left: ${state.player.gold}`;
  },

  _shopBuyCard(state, data, cost) {
    if (state.player.gold < cost) return `Not enough gold (${state.player.gold}/${cost}).`;
    const cardId = state.getRandomCard?.('uncommon');
    if (!cardId) return 'No card available.';
    state.player.gold -= cost;
    state.player.deck.push(cardId);
    state.meta?.codex?.cards?.add?.(cardId);
    return `Obtained ${data.cards?.[cardId]?.name || cardId}. Gold left: ${state.player.gold}`;
  },

  _shopUpgradeCard(state, data, cost) {
    if (state.player.gold < cost) return `Not enough gold (${state.player.gold}/${cost}).`;
    const upgradable = (state.player.deck || []).filter((id) => data.upgradeMap?.[id]);
    if (!upgradable.length) return 'No upgradable card.';
    const cardId = upgradable[Math.floor(Math.random() * upgradable.length)];
    const upgId = data.upgradeMap[cardId];
    const idx = state.player.deck.indexOf(cardId);
    if (idx >= 0) state.player.deck[idx] = upgId;
    state.player.gold -= cost;
    state.meta?.codex?.cards?.add?.(upgId);
    return `${data.cards?.[cardId]?.name || cardId} upgraded. Gold left: ${state.player.gold}`;
  },

  _shopBuyEnergy(state, cost) {
    if (state.player.gold < cost) return `Not enough gold (${state.player.gold}/${cost}).`;
    if (state.player.maxEnergy >= 6) return 'Already at max energy.';
    state.player.gold -= cost;
    state.player.maxEnergy += 1;
    state.player.energy = Math.min(state.player.maxEnergy, (state.player.energy || 0) + 1);
    state.addLog?.(`Max energy increased to ${state.player.maxEnergy}.`, 'echo');
    return `Max energy is now ${state.player.maxEnergy}. Gold left: ${state.player.gold}`;
  },

  _restResetStagnationDeck(state) {
    if (!Array.isArray(state._stagnationVault) || state._stagnationVault.length === 0) {
      return 'No cards are waiting for restoration.';
    }
    const restored = [...state._stagnationVault];
    state._stagnationVault = [];
    state.player.deck.push(...restored);
    restored.forEach((cardId) => state.meta?.codex?.cards?.add?.(cardId));
    state.addLog?.(`Restored ${restored.length} card(s) from stagnation.`, 'echo');
    return `${restored.length} card(s) restored to deck.`;
  },

  _restUpgradeCard(state, data) {
    const upgradable = (state.player.deck || []).filter((id) => data.upgradeMap?.[id]);
    if (!upgradable.length) return 'No upgradable card.';
    const cardId = upgradable[Math.floor(Math.random() * upgradable.length)];
    const upgId = data.upgradeMap[cardId];
    const idx = state.player.deck.indexOf(cardId);
    if (idx >= 0) state.player.deck[idx] = upgId;
    state.addLog?.(`${data.cards?.[cardId]?.name || cardId} upgraded.`, 'echo');
    return `${data.cards?.[cardId]?.name || cardId} upgraded.`;
  },
};
