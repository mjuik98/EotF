import { Logger } from './utils/logger.js';

/**
 * GAME.API - 게임 상태 변조를 위한 공식 인터페이스.
 * 모든 상위 수준의 UI 및 하위 엔진 로직은 이 API를 통해 상태를 변경해야 합니다.
 * 이를 통해 로깅, 검증, 그리고 상태 동기화를 보장합니다.
 */
export const GameAPI = {
    // === Player Stats ===

    /**
     * 플레이어에게 데미지를 입힙니다.
     */
    applyPlayerDamage(amount, gs = window.GS) {
        if (amount <= 0) return;
        Logger.group('API: Player Damage');
        try {
            if (gs.getBuff?.('immune')) {
                Logger.info('Player is immune.');
                gs.addLog?.('🏛️ 면역으로 피해 무효!', 'echo');
                return;
            }

            let dmg = amount;
            if (gs.player.shield > 0) {
                const block = Math.min(gs.player.shield, dmg);
                gs.player.shield -= block;
                dmg -= block;
                Logger.debug(`Shield blocked ${block}. Remaining: ${dmg}`);
                if (block > 0) gs.addLog?.(`🛡️ 방어막 ${block} 흡수`, 'system');
            }

            const itemScaled = gs.triggerItems?.('damage_taken', dmg);
            if (itemScaled === true) {
                dmg = 0;
                gs.addLog?.('🛡️ 피해 무효!', 'echo');
            } else if (typeof itemScaled === 'number' && Number.isFinite(itemScaled)) {
                dmg = Math.max(0, Math.floor(itemScaled));
            }

            if (dmg > 0) {
                gs.player.hp = Math.max(0, gs.player.hp - dmg);
                gs.stats.damageTaken += dmg;
                gs.addLog?.(`💔 ${dmg} 피해 받음`, 'damage');

                // Audio/Visual feedback via window objects
                window.ScreenShake?.shake(8, 0.4);
                window.AudioEngine?.playPlayerHit();
            }

            window.HudUpdateUI?.updatePlayerStats?.(gs);
            window.updateUI?.();
            if (gs.player.hp <= 0) gs.onPlayerDeath?.();
        } finally {
            Logger.groupEnd();
        }
    },

    /**
     * 플레이어에게 방어막을 추가합니다.
     */
    addShield(amount, gs = window.GS) {
        if (amount <= 0) return;
        Logger.info(`[API] Add Shield: ${amount}`);

        let actual = amount;
        // 밸런스 조정: 피로의 저주(fatigue)
        if (gs.runConfig?.curse === 'fatigue' || gs.meta?.runConfig?.curse === 'fatigue') {
            actual = Math.max(0, amount - 10);
            if (actual < amount) gs.addLog?.('📉 피로의 저주: 방어막 획득 감소 (-10)', 'system');
        }

        gs.player.shield += actual;
        gs.addLog?.(`🛡️ 방어막 +${actual}`, 'system');
        window.HudUpdateUI?.updatePlayerStats?.(gs);
    },

    /**
     * 플레이어를 회복시킵니다.
     */
    healPlayer(amount, gs = window.GS) {
        if (amount <= 0) return;
        Logger.info(`[API] Heal attempt: ${amount}`);

        // 지역 제한 등 비즈니스 로직 유지
        if (gs.currentRegion !== undefined && window.RunRules?.getHealAmount) {
            // ... RunRules 로직은 기존 player_methods.js 참고
        }

        const oldHp = gs.player.hp;
        gs.player.hp = Math.min(gs.player.maxHp, gs.player.hp + amount);
        const actual = gs.player.hp - oldHp;

        if (actual > 0) {
            Logger.info(`Player healed for ${actual}.`);
            gs.addLog?.(`💚 체력 +${actual}`, 'heal');
            window.AudioEngine?.playHeal();
        }
        window.HudUpdateUI?.updatePlayerStats?.(gs);
    },

    /**
     * 골드를 추가합니다.
     */
    addGold(amount, gs = window.GS) {
        if (amount === 0) return;
        gs.player.gold += amount;
        Logger.info(`[API] Gold ${amount > 0 ? '+' : ''}${amount}. Current: ${gs.player.gold}`);
        if (amount > 0) {
            // UI Popup logic...
        }
        window.HudUpdateUI?.updatePlayerStats?.(gs);
    },

    // === Enemy Stats ===

    /**
     * 적에게 데미지를 입힙니다.
     */
    applyEnemyDamage(amount, targetIdx, gs = window.GS) {
        const enemy = gs.combat?.enemies?.[targetIdx];
        if (!enemy || enemy.hp <= 0) return 0;

        Logger.group(`API: Enemy Damage (${enemy.name})`);
        try {
            let dmg = amount;

            // 기존 dealDamage의 데미지 계산 로직(버프, 면역 등) 이관 예정... 
            // 현재는 단순화하여 프로토타입 구현
            if (enemy.shield > 0) {
                const block = Math.min(enemy.shield, dmg);
                enemy.shield -= block;
                dmg -= block;
            }

            enemy.hp = Math.max(0, enemy.hp - dmg);
            gs.stats.damageDealt += dmg;

            Logger.debug(`Dealt ${dmg} damage. ${enemy.name} HP: ${enemy.hp}`);

            if (enemy.hp <= 0) gs.onEnemyDeath?.(enemy, targetIdx);

            window.HudUpdateUI?.updateEnemyHpUI?.(targetIdx, enemy);
            return dmg;
        } finally {
            Logger.groupEnd();
        }
    },

    /**
     * 에너지를 추가/차감합니다.
     */
    modifyEnergy(amount, gs = window.GS) {
        gs.player.energy = Math.max(0, Math.min(gs.player.maxEnergy, gs.player.energy + amount));
        Logger.debug(`[API] Energy modified by ${amount}. Current: ${gs.player.energy}`);
        gs.markDirty?.('hud');
        window.HudUpdateUI?.updateCombatEnergy?.(gs);
    },

    /**
     * 카드를 뽑습니다.
     */
    drawCards(count = 1, gs = window.GS) {
        for (let i = 0; i < count; i++) {
            if (gs.player.deck.length === 0) {
                if (gs.player.graveyard.length === 0) break;
                gs.player.deck = [...gs.player.graveyard];
                gs.player.graveyard = [];
                gs.addLog?.('🔄 덱을 섞었다', 'system');
            }
            if (gs.player.hand.length < 8) {
                gs.player.hand.push(gs.player.deck.pop());
                window.AudioEngine?.playCard();
            }
        }
        window.renderHand?.();
        window.renderCombatCards?.();
        window.HudUpdateUI?.triggerDrawCardAnimation?.();
    },

    /**
     * 카드를 버리거나 사용 후 처리합니다.
     */
    discardCard(cardId, isExhaust = false, gs = window.GS) {
        if (isExhaust) {
            gs.player.exhausted.push(cardId);
            Logger.info(`[API] Card exhausted: ${cardId}`);
        } else {
            gs.player.graveyard.push(cardId);
            Logger.debug(`[API] Card discarded to graveyard: ${cardId}`);
        }
    },

    // === Combat ===

    /**
     * 카드를 사용합니다 (고도화 버전).
     */
    async playCard(cardId, handIdx, gs = window.GS) {
        const card = window.DATA?.cards?.[cardId];
        if (!card) return false;

        Logger.group(`API: Play Card (${card.name})`);
        try {
            if (!gs.combat?.active || !gs.combat?.playerTurn) {
                Logger.warn('Cannot play card: Not player turn.');
                return false;
            }

            const cost = window.CardCostUtils?.calcEffectiveCost?.(cardId, card, gs.player) ?? card.cost;
            if (gs.player.energy < cost) {
                Logger.warn('Not enough energy.');
                return false;
            }

            // 지불 및 손패 제거
            gs.player.energy -= cost;
            gs.player.hand.splice(handIdx, 1);

            // 효과 실행 (비동기 처리)
            await card.effect?.(gs);

            // 사용 후 처리 (소진 여부 등)
            this.discardCard(cardId, card.exhaust, gs);

            gs.stats.cardsPlayed++;
            Logger.info(`Card ${card.name} played successfully.`);

            console.log('[playCard] Before updateUI - energy:', gs.player.energy);
            window.renderCombatCards?.();
            gs.markDirty?.('hud');
            window.updateUI?.();
            return true;
        } catch (e) {
            Logger.error('Error playing card:', e);
            return false;
        } finally {
            Logger.groupEnd();
        }
    },

    // === Combat Management ===

    /**
     * 전투를 종료합니다 (비동기 처리).
     */
    async endCombat(gs = window.GS) {
        if (!gs.combat?.active || gs._endCombatRunning) return;
        // gs.endCombat()은 combat_methods.js의 완전한 구현을 사용
        return gs.endCombat();
    },

    // === System ===

    /**
     * 게임 화면을 전환합니다.
     */
    setScreen(screenName, gs = window.GS) {
        Logger.info(`[API] Screen change: ${gs.currentScreen} -> ${screenName}`);
        gs.currentScreen = screenName;
        window.ScreenUI?.show?.(screenName);
    },

    // === UI Controls ===

    /**
     * HUD 핀 고정/해제를 토글합니다.
     */
    toggleHudPin() {
        if (window.CombatHudUI?.toggleHudPin) {
            window.CombatHudUI.toggleHudPin();
        } else {
            console.warn('[API] CombatHudUI.toggleHudPin not found');
        }
    },

    /**
     * 덱 보기 모달을 닫습니다.
     */
    closeDeckView() {
        if (window.DeckModalUI?.closeDeckView) {
            window.DeckModalUI.closeDeckView();
        } else {
            console.warn('[API] DeckModalUI.closeDeckView not found');
        }
    },

    /**
     * 도감 모달을 닫습니다.
     */
    closeCodex() {
        if (window.CodexUI?.closeCodex) {
            window.CodexUI.closeCodex();
        } else {
            console.warn('[API] CodexUI.closeCodex not found');
        }
    }
};

// Global export for legacy/UI code compatibility
// Note: This runs at module load time, GAME may be overwritten by main.js
// The API methods will still work as they reference window.GS directly
