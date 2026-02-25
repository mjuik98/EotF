import { AudioEngine } from '../../engine/audio.js';
import { DATA } from '../../../data/game_data.js';

export const CardMethods = {
    drawCards(count = 1) {
        const shuffle = (arr) => {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
        };

        for (let i = 0; i < count; i++) {
            if (this.player.deck.length === 0) {
                if (this.player.graveyard.length === 0) break;
                this.player.deck = [...this.player.graveyard];
                this.player.graveyard = [];
                shuffle(this.player.deck);
                this.addLog('🔄 덱을 섞었다', 'system');
                if (typeof window.HudUpdateUI !== 'undefined' && typeof window.HudUpdateUI.triggerDeckShufflePulse === 'function') {
                    window.HudUpdateUI.triggerDeckShufflePulse();
                }
            }
            if (this.player.hand.length < 8) {
                this.player.hand.push(this.player.deck.pop());
                AudioEngine.playCard();
            }
        }
        if (typeof window.renderHand === 'function') window.renderHand();
        if (typeof window.updateUI === 'function') window.updateUI();

        setTimeout(() => {
            if (typeof window.HudUpdateUI !== 'undefined' && typeof window.HudUpdateUI.triggerDrawCardAnimation === 'function') {
                window.HudUpdateUI.triggerDrawCardAnimation();
            } else {
                document.querySelectorAll('#handCards .card, #combatHandCards .card').forEach((el, i) => {
                    el.style.animation = 'none';
                    requestAnimationFrame(() => { el.style.animation = `cardDraw 0.25s ease ${i * 0.04}s both`; });
                });
                const fanRestoreDelay = 300 + Math.max(0, (this.player.hand.length - 1) * 40);
                if (typeof window.updateHandFanEffect === 'function') setTimeout(() => window.updateHandFanEffect(), fanRestoreDelay);
            }
        }, 10);
    },

    playCard(cardId, handIdx) {
        const card = DATA.cards[cardId];
        if (!card) return false;

        console.log('[playCard] Called with cardId:', cardId, 'handIdx:', handIdx);
        console.log('[playCard] combat.active:', this.combat?.active, 'playerTurn:', this.combat?.playerTurn, '_endCombatScheduled:', this._endCombatScheduled);

        if (!this.combat.active || !this.combat.playerTurn || this._endCombatScheduled) {
            console.log('[playCard] Blocked - combat not active or not player turn');
            return false;
        }

        const cost = typeof window.CardCostUtils !== 'undefined'
            ? window.CardCostUtils.calcEffectiveCost(cardId, card, this.player)
            : Math.max(0, card.cost - (this.player.costDiscount || 0));

        if (this.player.energy < cost) {
            this.addLog('⚠️ 에너지 부족!', 'damage');
            if (typeof window.HudUpdateUI !== 'undefined' && typeof window.HudUpdateUI.triggerCardShakeAnimation === 'function') {
                window.HudUpdateUI.triggerCardShakeAnimation();
            } else {
                document.querySelectorAll('#combatHandCards .card:not(.playable)').forEach(el => {
                    el.style.animation = 'none';
                    requestAnimationFrame(() => { el.style.animation = 'shake 0.3s ease'; });
                });
            }
            AudioEngine.playHit();
            return false;
        }

        // 침묵의 도시 (지역 1) 소음 게이지
        const baseRegion = typeof window.getBaseRegionIndex === 'function' ? window.getBaseRegionIndex(this.currentRegion) : this.currentRegion;
        console.log('[playCard] currentRegion:', this.currentRegion, 'baseRegion:', baseRegion);
        console.log('[playCard] getBaseRegionIndex result:', typeof window.getBaseRegionIndex, window.getBaseRegionIndex ? window.getBaseRegionIndex(this.currentRegion) : 'N/A');

        if (baseRegion === 1) {
            console.log('[playCard] Silent City - adding silence gauge');
            this.player.silenceGauge = (this.player.silenceGauge || 0) + 1;
            this.addLog(`🌑 소음 +1 (${this.player.silenceGauge}/10)`, 'echo');
            if (this.player.silenceGauge >= 10) {
                this.player.silenceGauge = 0;
                this.spawnEnemy();
                this.addLog('⚠️ 소음 초과! 파수꾼 등장!', 'damage');
            }
        } else {
            console.log('[playCard] Not Silent City (baseRegion:', baseRegion, ')');
        }

        this.player.energy -= cost;
        if (typeof window.CardCostUtils !== 'undefined') {
            window.CardCostUtils.consumeFreeCharge(cardId, this.player);
        } else {
            const cascade = this.player._cascadeCards;
            const isCascadeFree = cascade instanceof Map
                ? (cascade.get(cardId) || 0) > 0
                : !!(cascade && cascade.has && cascade.has(cardId));
            const freeCardUses = Math.max(0, Number(this.player._freeCardUses || 0));
            const isChargedFree = !this.player.zeroCost && !isCascadeFree && freeCardUses > 0;

            if (isChargedFree) {
                this.player._freeCardUses = Math.max(0, freeCardUses - 1);
            }
            if (isCascadeFree) {
                if (cascade instanceof Map) {
                    const left = Math.max(0, (cascade.get(cardId) || 0) - 1);
                    if (left <= 0) cascade.delete(cardId);
                    else cascade.set(cardId, left);
                } else if (cascade && cascade.delete) {
                    cascade.delete(cardId);
                }
            }
        }
        this.player.hand.splice(handIdx, 1);

        if (typeof window.TooltipUI !== 'undefined') {
            window.TooltipUI.hideTooltip({ doc: document });
        }

        this.triggerItems('card_play', { cardId });
        if (window.ClassMechanics?.[this.player.class]?.onPlayCard) {
            window.ClassMechanics[this.player.class].onPlayCard(this, { cardId });
        }

        if (this.meta.codex) this.meta.codex.cards.add(cardId);
        if (typeof window.showCardPlayEffect === 'function') window.showCardPlayEffect(card);

        try {
            console.log('[playCard] Calling card.effect for:', cardId);
            card.effect(this);
            console.log('[playCard] card.effect completed');
        } catch (e) {
            console.error('[playCard] card.effect error:', e);
            this.addLog(`⚠️ 카드 효과 오류: ${e.message}`, 'damage');
        }

        this.stats.cardsPlayed++;
        if (card.exhaust) {
            this.player.exhausted.push(cardId);
            this.addLog(`🔥 ${card.name} 소진`, 'system');
        } else {
            this.player.graveyard.push(cardId);
        }
        this.triggerItems('card_discard', { cardId });

        console.log('[playCard] Before render - hand:', this.player.hand);

        // 카드 사용 후 손패 및 전투 카드 즉시 갱신
        if (typeof window.renderCombatCards === 'function') {
            setTimeout(() => {
                console.log('[playCard] Calling renderCombatCards');
                window.renderCombatCards();
            }, 10);
        }
        if (typeof window.updateUI === 'function') {
            setTimeout(() => {
                console.log('[playCard] Calling updateUI');
                window.updateUI();
            }, 10);
        }

        if (this.combat.active) {
            const alive = this.combat.enemies.filter(e => e.hp > 0);
            if (alive.length === 0) {
                if (typeof window.renderHand === 'function') window.renderHand();
                if (typeof window.renderCombatCards === 'function') window.renderCombatCards();
                if (typeof window.updateUI === 'function') window.updateUI();
                if (typeof window.CombatUI !== 'undefined') {
                    window.CombatUI.renderCombatEnemies({ gs: this, data: DATA });
                } else if (typeof renderCombatEnemies === 'function') {
                    renderCombatEnemies();
                }
                return true;
            }
        }
        if (typeof window.renderHand === 'function') window.renderHand();
        if (typeof window.renderCombatCards === 'function') window.renderCombatCards();
        if (typeof window.updateUI === 'function') window.updateUI();
        if (typeof window.CombatUI !== 'undefined') {
            window.CombatUI.renderCombatEnemies({ gs: this, data: DATA });
        } else if (typeof renderCombatEnemies === 'function') {
            renderCombatEnemies();
        }
        return true;
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
