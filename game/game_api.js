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
        if (typeof gs.takeDamage === 'function') {
            gs.takeDamage(amount);
        } else {
            // Fallback
            gs.player.hp = Math.max(0, gs.player.hp - amount);
            if (gs.player.hp <= 0) gs.onPlayerDeath?.();
        }
        window.HudUpdateUI?.updatePlayerStats?.(gs);
    },

    /**
     * 플레이어에게 방어막을 추가합니다.
     */
    addShield(amount, gs = window.GS) {
        if (amount <= 0) return;
        if (typeof gs.addShield === 'function') {
            gs.addShield(amount);
        } else {
            // Fallback
            gs.player.shield += amount;
        }
        window.HudUpdateUI?.updatePlayerStats?.(gs);
    },

    /**
     * 플레이어를 회복시킵니다.
     */
    healPlayer(amount, gs = window.GS) {
        if (amount <= 0) return;
        if (typeof gs.heal === 'function') {
            gs.heal(amount);
        } else {
            gs.player.hp = Math.min(gs.player.maxHp, gs.player.hp + amount);
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
        if (typeof gs.dealDamage === 'function') {
            return gs.dealDamage(amount, targetIdx);
        }

        // Fallback for primitive GS
        const enemy = gs.combat?.enemies?.[targetIdx];
        if (!enemy || enemy.hp <= 0) return 0;
        enemy.hp = Math.max(0, enemy.hp - amount);
        window.HudUpdateUI?.updateEnemyHpUI?.(targetIdx, enemy);
        return amount;
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
     * 카드를 뽑습니다 (단순 상태 변경).
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
        window.updateUI?.();
    },

    /**
     * 플레이어가 직접 카드를 뽑는 액션을 수행합니다 (에너지 소모 및 제약 포함).
     */
    executePlayerDraw(gs = window.GS) {
        if (!gs.combat?.active || !gs.combat?.playerTurn) return false;

        const maxHand = 8;
        if (gs.player.hand.length >= maxHand) {
            gs.addLog?.(`⚠️ 손패가 가득 찼습니다 (최대 ${maxHand}장)`, 'damage');
            window.AudioEngine?.playHit?.();
            window.updateUI?.();
            return false;
        }

        if (gs.player.energy < 1) {
            gs.addLog?.('⚠️ 에너지 부족! (카드 뽑기: 1 에너지)', 'damage');
            window.AudioEngine?.playHit?.();
            window.updateUI?.();
            return false;
        }

        this.modifyEnergy(-1, gs);
        this.drawCards(1, gs);
        return true;
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
     * 카드를 사용합니다 (동기 처리 - 모든 카드 효과는 동기 함수임).
     */
    playCard(cardId, handIdx, gs = window.GS) {
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

            // ── Bug Fix: 침묵의 도시 소음 게이지 상승 ──
            const _getBaseRegion = window.getBaseRegionIndex || ((r) => r);
            if (_getBaseRegion(gs.currentRegion) === 1 && gs.combat?.active) {
                gs.addSilence?.(1);
            }

            // 효과 실행 (동기 처리)
            card.effect?.(gs);

            // ── Bug Fix: _nextCardDiscount 소비 (박자 강타 등) ──
            if ((gs.player._nextCardDiscount || 0) > 0) {
                gs.player._nextCardDiscount = Math.max(0, gs.player._nextCardDiscount - 1);
            }

            // 클래스 특성 훅 실행 (예: 잔향검사 모멘텀)
            const cm = window.ClassMechanics?.[gs.player.class];
            if (cm && typeof cm.onPlayCard === 'function') {
                cm.onPlayCard(gs, { cardId });
            }

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
        // ScreenUI 는 GAME.Modules 에 등록되어 있음
        const ScreenUI = window.GAME?.Modules?.['ScreenUI'];
        if (ScreenUI?.switchScreen) {
            ScreenUI.switchScreen(screenName, { gs });
        } else {
            // Fallback: direct window call (main.js 에서 window.switchScreen 등록됨)
            window.switchScreen?.(screenName);
        }
    },

    // === UI Controls ===

    /**
     * HUD 핀 고정/해제를 토글합니다.
     */
    toggleHudPin(gs = window.GS) {
        // GAME.Modules 에 등록된 CombatHudUI 직접 호출 (재귀 방지)
        const CombatHudUI = window.GAME?.Modules?.['CombatHudUI'];
        if (CombatHudUI?.toggleHudPin) {
            CombatHudUI.toggleHudPin(window.GAME.getDeps());
        } else {
            console.warn('[API] CombatHudUI.toggleHudPin not available');
        }
    },

    /**
     * 덱 보기 모달을 닫습니다.
     */
    closeDeckView(gs = window.GS) {
        // GAME.Modules 에 등록된 DeckModalUI 직접 호출 (재귀 방지)
        const DeckModalUI = window.GAME?.Modules?.['DeckModalUI'];
        if (DeckModalUI?.closeDeckView) {
            DeckModalUI.closeDeckView(window.GAME.getDeps());
        } else {
            console.warn('[API] DeckModalUI.closeDeckView not available');
        }
    },

    /**
     * 도감 모달을 닫습니다.
     */
    closeCodex(gs = window.GS) {
        // GAME.Modules 에 등록된 CodexUI 직접 호출 (재귀 방지)
        const CodexUI = window.GAME?.Modules?.['CodexUI'];
        if (CodexUI?.closeCodex) {
            CodexUI.closeCodex(window.GAME.getDeps());
        } else {
            console.warn('[API] CodexUI.closeCodex not available');
        }
    }
};

// Global export for legacy/UI code compatibility
// Note: This runs at module load time, GAME may be overwritten by main.js
// The API methods will still work as they reference window.GS directly
