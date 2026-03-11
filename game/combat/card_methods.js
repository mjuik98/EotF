import { DATA } from '../../data/game_data.js';
import {
  drawStateCards,
  playStateCard,
} from '../features/combat/app/game_state_card_actions.js';
import { createLegacyGameStateCardPorts } from '../platform/legacy/adapters/create_legacy_game_state_card_ports.js';

export const CardMethods = {
    drawCards(count = 1, options = {}) {
        const gs = this;
        const ports = createLegacyGameStateCardPorts();
        return drawStateCards({
            count,
            gs,
            options,
            runRuntimeDeps: ports.getRunRuntimeDeps(),
        });
    },

    playCard(cardId, handIdx) {
        const gs = this;
        const ports = createLegacyGameStateCardPorts();
        return playStateCard({
            cardId,
            handIdx,
            gs,
            card: ports.getCurrentCard(cardId),
            cardCostUtils: ports.getCardCostUtils(),
            classMechanics: ports.getClassMechanics(),
            audioEngine: ports.getAudioEngine(),
            combatRuntimeDeps: ports.getCombatRuntimeDeps(),
            hudUpdateUI: ports.getHudUpdateUI(),
        });
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
