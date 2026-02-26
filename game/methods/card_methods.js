import { AudioEngine } from '../../engine/audio.js';
import { DATA } from '../../../data/game_data.js';

export const CardMethods = {
    drawCards(count = 1) {
        const gs = window.GS;

        // Use GS.API instead of window.GAME.API
        const api = gs.API || window.GAME?.API;

        const shuffle = (arr) => {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
        };

        if (typeof api?.drawCards === 'function') {
            api.drawCards(count, gs);
        } else {
            console.error('[CardMethods.drawCards] API.drawCards not found!', { api, hasGSAPI: !!gs?.API, hasGAMEAPI: !!window.GAME?.API?.drawCards });
        }
        gs.markDirty('hand');
        gs.markDirty('hud');

        setTimeout(() => {
            if (typeof window.HudUpdateUI !== 'undefined' && typeof window.HudUpdateUI.triggerDrawCardAnimation === 'function') {
                window.HudUpdateUI.triggerDrawCardAnimation();
            } else {
                document.querySelectorAll('#handCards .card, #combatHandCards .card').forEach((el, i) => {
                    el.style.animation = 'none';
                    requestAnimationFrame(() => { el.style.animation = `cardDraw 0.25s ease ${i * 0.04}s both`; });
                });
                const fanRestoreDelay = 300 + Math.max(0, (gs.player.hand.length - 1) * 40);
                if (typeof window.updateHandFanEffect === 'function') setTimeout(() => window.updateHandFanEffect(), fanRestoreDelay);
            }
        }, 10);
    },

    playCard(cardId, handIdx) {
        const gs = window.GS;
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
