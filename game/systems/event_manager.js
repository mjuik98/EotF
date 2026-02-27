/**
 * event_manager.js — 이벤트/상점/휴식 비즈니스 로직 (순수 Model)
 *
 * DOM/window 접근 없이 게임 상태(gs)만 변경하고 결과를 반환합니다.
 */

// ═══════════════════════════════════════
//  이벤트 풀 필터링
// ═══════════════════════════════════════
export const EventManager = {

    /**
     * 현재 상태에서 표시 가능한 이벤트 하나를 랜덤 선택
     * @returns {object|null} 선택된 이벤트 또는 null
     */
    pickRandomEvent(gs, data) {
        if (!gs || !data?.events) return null;
        const pool = data.events.filter(event => {
            if (event.layer === 2 && gs.currentFloor < 2) return false;
            return true;
        });
        if (!pool.length) return null;
        return pool[Math.floor(Math.random() * pool.length)];
    },

    /**
     * 이벤트 선택지 효과 실행 (순수 로직)
     * @returns {{ resultText: string|null, isFail: boolean, shouldClose: boolean, isItemShop: boolean }}
     */
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

        const isFail = result.includes('부족') || result.includes('없다') || result.includes('부족.');
        const shouldClose = !event.persistent && !isFail;

        return { resultText: result, isFail, shouldClose, isItemShop: false };
    },

    // ═══════════════════════════════════════
    //  상점 데이터 생성 (순수 데이터)
    // ═══════════════════════════════════════

    /**
     * 상점 이벤트 객체 생성
     */
    createShopEvent(gs, data, runRules, { showItemShopFn } = {}) {
        if (!gs || !data || !runRules) return null;

        const savedMerchant = (gs.worldMemory.savedMerchant || 0) > 0;
        const costPotion = runRules.getShopCost(gs, savedMerchant ? 8 : 12);
        const costCard = runRules.getShopCost(gs, 15);
        const costUpgrade = runRules.getShopCost(gs, 20);
        const costEnergy = runRules.getShopCost(gs, 30);

        return {
            id: 'shop',
            persistent: true,
            eyebrow: savedMerchant ? 'WORLD MEMORY · 특별 상점' : 'LAYER 1 · 상점',
            title: savedMerchant ? '고마운 상인의 가게' : '잔향 상인',
            desc: savedMerchant
                ? '전에 도움받은 상인이다. 좋은 가격을 제시한다.'
                : '낡은 외투를 입은 상인이 잔향 결정들을 늘어놓고 있다.',
            choices: [
                {
                    text: `💊 치료약 (HP +30) — ${costPotion}골드`,
                    effect: (state) => this._shopBuyPotion(state, costPotion),
                },
                {
                    text: `🃏 랜덤 카드 — ${costCard}골드`,
                    effect: (state) => this._shopBuyCard(state, data, costCard),
                },
                {
                    text: `⚒️ 카드 강화 — ${costUpgrade}골드`,
                    effect: (state) => this._shopUpgradeCard(state, data, costUpgrade),
                },
                {
                    text: `⚡ 에너지 강화 — ${costEnergy}골드 (최대 에너지 +1)`,
                    effect: (state) => this._shopBuyEnergy(state, costEnergy),
                },
                {
                    text: '💎 아이템 구매 — 골드',
                    effect: (state) => {
                        if (showItemShopFn) showItemShopFn(state);
                        return '__item_shop_open__';
                    },
                },
                {
                    text: '🚪 나간다',
                    effect: () => null,
                },
            ],
        };
    },

    /**
     * 휴식 이벤트 객체 생성
     */
    createRestEvent(gs, data, runRules, { showCardDiscardFn } = {}) {
        if (!gs || !data || !runRules) return null;

        return {
            id: 'rest',
            eyebrow: 'LAYER 1 · 휴식 장소',
            title: '잔향의 모닥불',
            desc: '꺼지지 않는 이상한 불꽃이 타오르고 있다.',
            choices: [
                {
                    text: '❤️ 휴식한다 (HP +25%)',
                    effect: (state) => {
                        const baseHeal = Math.floor(state.player.maxHp * 0.25);
                        state.heal(runRules.getHealAmount(state, baseHeal));
                        return '몸이 회복되었다.';
                    },
                },
                {
                    text: '🃏 카드를 강화한다 (랜덤 카드 업그레이드)',
                    effect: (state) => this._restUpgradeCard(state, data),
                },
                {
                    text: '⚡ Echo를 충전한다 (Echo +50)',
                    effect: (state) => {
                        state.addEcho(50);
                        return 'Echo 에너지가 충전됐다.';
                    },
                },
                {
                    text: '🔥 카드를 소각한다 (덱에서 1장 제거)',
                    effect: (state) => {
                        if (showCardDiscardFn) showCardDiscardFn(state, true);
                        return null;
                    },
                },
            ],
        };
    },

    /**
     * 아이템 상점 아이템 풀 생성
     * @returns {{ item, cost, rarity }[]}
     */
    generateItemShopStock(gs, data, runRules) {
        if (!gs?.player || !data?.items || !runRules) return [];

        const rarityConfig = {
            common: { baseCost: 10 },
            uncommon: { baseCost: 20 },
            rare: { baseCost: 35 },
            legendary: { baseCost: 60 },
        };

        const byRarity = {};
        Object.values(data.items).forEach(item => {
            if (!byRarity[item.rarity]) byRarity[item.rarity] = [];
            byRarity[item.rarity].push(item);
        });

        const shopItems = [];
        ['common', 'uncommon', 'rare', 'legendary'].forEach(rarity => {
            const pool = (byRarity[rarity] || []).filter(item => !gs.player.items.includes(item.id));
            if (pool.length) {
                const item = pool[Math.floor(Math.random() * pool.length)];
                const cost = runRules.getShopCost(gs, rarityConfig[rarity]?.baseCost || 10);
                shopItems.push({ item, cost, rarity });
            }
        });

        return shopItems;
    },

    /**
     * 아이템 구매 처리
     * @returns {{ success: boolean, message: string }}
     */
    purchaseItem(gs, item, cost) {
        if (gs.player.gold < cost) {
            return { success: false, message: `골드 부족! (필요: ${cost}, 보유: ${gs.player.gold})` };
        }
        gs.player.gold -= cost;
        gs.player.items.push(item.id);
        if (gs.meta.codex) gs.meta.codex.items.add(item.id);
        gs.addLog(`🛍️ ${item.name} 구매!`, 'echo');
        return { success: true, message: `${item.name} 구매 완료!` };
    },

    /**
     * 카드 소각/처분 처리
     * @returns {{ success: boolean, message: string }}
     */
    discardCard(gs, cardId, data, isBurn = false) {
        let found = false;

        // 1. 덱에서 제거
        const deckIdx = gs.player.deck.indexOf(cardId);
        if (deckIdx >= 0) {
            gs.player.deck.splice(deckIdx, 1);
            found = true;
        }

        // 2. 패에서 제거 (상점/이벤트 중에는 비어있을 수 있지만 안전장치)
        const handIdx = gs.player.hand.indexOf(cardId);
        if (handIdx >= 0) {
            gs.player.hand.splice(handIdx, 1);
            found = true;
        }

        // 3. 무덤에서 제거
        const graveIdx = gs.player.graveyard.indexOf(cardId);
        if (graveIdx >= 0) {
            gs.player.graveyard.splice(graveIdx, 1);
            found = true;
        }

        if (!found) return { success: false, message: '카드를 찾을 수 없습니다.' };

        const card = data.cards[cardId];

        if (!isBurn) {
            gs.addGold(8);
            gs.addLog(`🗑️ ${card?.name} 처분 +8골드`, 'system');
        } else {
            gs.addLog(`🔥 ${card?.name} 소각`, 'system');
        }

        return { success: true, message: isBurn ? `${card?.name} 소각됨` : `${card?.name} 처분 +8골드` };
    },

    // ═══════════════════════════════════════
    //  Private helpers
    // ═══════════════════════════════════════

    _shopBuyPotion(state, cost) {
        if (state.player.gold >= cost) {
            const api = state.API || (typeof window !== 'undefined' ? window.GAME?.API : null);
            api?.addGold?.(-cost, state);
            api?.healPlayer?.(30, state);
            return `치료약을 마셨다. [남은 골드: ${state.player.gold}]`;
        }
        return `골드 부족! (필요: ${cost}, 보유: ${state.player.gold})`;
    },

    _shopBuyCard(state, data, cost) {
        if (state.player.gold >= cost) {
            const api = state.API || (typeof window !== 'undefined' ? window.GAME?.API : null);
            api?.addGold?.(-cost, state);
            const cardId = state.getRandomCard?.('uncommon');
            state.player.deck.push(cardId);
            if (state.meta.codex) state.meta.codex.cards.add(cardId);
            return `카드 획득: ${data.cards[cardId]?.name} [남은 골드: ${state.player.gold}]`;
        }
        return `골드 부족! (필요: ${cost}, 보유: ${state.player.gold})`;
    },

    _shopUpgradeCard(state, data, cost) {
        if (state.player.gold < cost) return `골드 부족! (필요: ${cost}, 보유: ${state.player.gold})`;
        const upgradable = state.player.deck.filter(id => data.upgradeMap[id]);
        if (!upgradable.length) return '강화 가능한 카드가 없다.';
        state.player.gold -= cost;
        const cardId = upgradable[Math.floor(Math.random() * upgradable.length)];
        const upgId = data.upgradeMap[cardId];
        const idx = state.player.deck.indexOf(cardId);
        if (idx >= 0) state.player.deck[idx] = upgId;
        if (state.meta.codex) state.meta.codex.cards.add(upgId);
        return `${data.cards[cardId]?.name} → ${data.cards[upgId]?.name} [남은 골드: ${state.player.gold}]`;
    },

    _shopBuyEnergy(state, cost) {
        if (state.player.gold < cost) return `골드 부족! (필요: ${cost}, 보유: ${state.player.gold})`;
        if (state.player.maxEnergy >= 6) return '이미 최대 에너지에 도달했다.';
        state.player.gold -= cost;
        state.player.maxEnergy++;
        state.player.energy = Math.min(state.player.energy + 1, state.player.maxEnergy);
        state.addLog(`⚡ 에너지 강화! 최대 에너지 ${state.player.maxEnergy}`, 'echo');
        return `최대 에너지 ${state.player.maxEnergy}으로 증가! [남은 골드: ${state.player.gold}]`;
    },

    _restUpgradeCard(state, data) {
        const upgradable = state.player.deck.filter(id => data.upgradeMap[id]);
        if (!upgradable.length) return '강화 가능한 카드가 없다.';
        const cardId = upgradable[Math.floor(Math.random() * upgradable.length)];
        const upgId = data.upgradeMap[cardId];
        const idx = state.player.deck.indexOf(cardId);
        if (idx >= 0) {
            state.player.deck[idx] = upgId;
            state.addLog(`✨ ${data.cards[cardId]?.name} → ${data.cards[upgId]?.name} 강화!`, 'echo');
        }
        return `${data.cards[cardId]?.name}이(가) 강화되었다.`;
    },
};
