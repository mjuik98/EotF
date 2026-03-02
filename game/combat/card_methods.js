import { AudioEngine } from '../../engine/audio.js';
import { DATA } from '../../data/game_data.js';
import { GAME } from '../core/global_bridge.js';

export const CardMethods = {
    drawCards(count = 1) {
        const gs = this;

        const api = GAME?.Modules?.['GameAPI'];
        if (typeof api?.drawCards === 'function') {
            api.drawCards(count, gs);
        } else if (typeof gs.dispatch === 'function') {
            // 폴백: Dispatch를 직접 호출
            gs.dispatch('card:draw', { count });
        }
    },

    playCard(cardId, handIdx) {
        const gs = this;
        // GameAPI는 순환참조 방지 위해 GAME.Modules 지연 참조
        const api = GAME?.Modules?.['GameAPI'];
        return api?.playCard?.(cardId, handIdx, gs);
    },

    getRandomCard(rarity = 'common') {
        const allCards = Object.values(DATA.cards);
        const pool = allCards.filter(c => c.rarity === rarity && !c.upgraded).map(c => c.id);

        if (!pool.length) {
            // 해당 희귀도 카드가 없으면 전체 일반 카드 중 선택
            const commonPool = allCards.filter(c => c.rarity === 'common' && !c.upgraded).map(c => c.id);
            return commonPool[Math.floor(Math.random() * commonPool.length)];
        }
        return pool[Math.floor(Math.random() * pool.length)];
    },
};
