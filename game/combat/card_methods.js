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
        const rare = ['echo_burst_card', 'void_blade', 'soul_armor', 'echo_dance', 'arcane_storm', 'sanctuary', 'echo_overload'];
        const uncommon = ['echo_wave', 'resonance', 'soul_rend', 'twin_strike', 'echo_shield', 'afterimage', 'phantom_blade', 'time_echo', 'void_mirror', 'prediction', 'death_mark', 'shadow_step', 'poison_blade', 'soul_harvest', 'desperate_strike', 'reverberation', 'dark_pact', 'surge', 'energy_siphon'];
        const allCards = Object.keys(DATA.cards);
        let pool;
        if (rarity === 'rare') pool = rare;
        else if (rarity === 'uncommon') pool = uncommon;
        else pool = allCards.filter(c => !rare.includes(c) && !uncommon.includes(c));
        if (!pool.length) pool = allCards;
        return pool[Math.floor(Math.random() * pool.length)];
    },
};
