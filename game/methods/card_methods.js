import { AudioEngine } from '../../engine/audio.js';
import { DATA } from '../../data/game_data.js';

export const CardMethods = {
    drawCards(count = 1) {
        const gs = this;
        const api = gs.API || window.GAME?.API;

        if (typeof api?.drawCards === 'function') {
            api.drawCards(count, gs);
        } else {
            console.error('[CardMethods.drawCards] API.drawCards not found!');
        }
        gs.markDirty('hand');
        gs.markDirty('hud');
    },

    playCard(cardId, handIdx) {
        const gs = this;
        const api = gs.API || window.GAME?.API;
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
