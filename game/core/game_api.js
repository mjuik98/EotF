import { Logger } from '../utils/logger.js';
import { Actions } from './state_actions.js';
import { GAME } from './global_bridge.js';

/**
 * GAME.API - 게임 상태 변조를 위한 공식 인터페이스.
 * 모든 상태 변경은 gs.dispatch()를 통해 수행됩니다.
 */
export const GameAPI = {
    // === Player Stats ===

    /**
     * 플레이어에게 데미지를 입힙니다.
     */
    applyPlayerDamage(amount, gs = GAME.State) {
        if (amount <= 0) return;
        // 기존 takeDamage가 있으면 사용 (파티클, 사운드 등 사이드이펙트 포함)
        if (typeof gs.takeDamage === 'function') {
            gs.takeDamage(amount);
        } else {
            gs.dispatch(Actions.PLAYER_DAMAGE, { amount, source: 'api' });
        }
        // HUD 갱신은 EventBus 구독자가 처리
    },

    /**
     * 플레이어에게 방어막을 추가합니다.
     */
    addShield(amount, gs = GAME.State) {
        if (amount <= 0) return;
        if (typeof gs.addShield === 'function') {
            gs.addShield(amount);
        } else {
            gs.dispatch(Actions.PLAYER_SHIELD, { amount });
        }
        // HUD 갱신은 EventBus 구독자가 처리
    },

    /**
     * 플레이어를 회복시킵니다.
     */
    healPlayer(amount, gs = GAME.State) {
        if (amount <= 0) return;
        if (typeof gs.heal === 'function') {
            gs.heal(amount);
        } else {
            gs.dispatch(Actions.PLAYER_HEAL, { amount });
        }
        // HUD 갱신은 EventBus 구독자가 처리
    },

    /**
     * 골드를 추가합니다.
     */
    addGold(amount, gs = GAME.State) {
        if (amount === 0) return;
        const result = gs.dispatch(Actions.PLAYER_GOLD, { amount });
        Logger.info(`[API] Gold ${amount > 0 ? '+' : ''}${amount}. Current: ${result?.goldAfter}`);
        // HUD 갱신은 EventBus 구독자가 처리
    },

    // === Enemy Stats ===

    /**
     * 적에게 데미지를 입힙니다.
     */
    applyEnemyDamage(amount, targetIdx, gs = GAME.State) {
        if (typeof gs.dealDamage === 'function') {
            return gs.dealDamage(amount, targetIdx);
        }
        const result = gs.dispatch(Actions.ENEMY_DAMAGE, { amount, targetIdx });
        GAME.Modules?.['HudUpdateUI']?.updateEnemyHpUI?.(targetIdx, gs.combat?.enemies?.[targetIdx]);
        return result?.actualDamage || 0;
    },

    /**
     * 에너지를 추가/차감합니다.
     */
    modifyEnergy(amount, gs = GAME.State) {
        const result = gs.dispatch(Actions.PLAYER_ENERGY, { amount });
        Logger.debug(`[API] Energy modified by ${amount}. Current: ${result?.energyAfter}`);
        // HUD 갱신은 EventBus 구독자가 처리
    },

    /**
     * 카드를 뽑습니다 (단순 상태 변경).
     */
    drawCards(count = 1, gs = GAME.State) {
        gs.dispatch(Actions.CARD_DRAW, { count });
        // 카드 UI 갱신은 EventBus 구독자가 처리
    },

    /**
     * 플레이어가 직접 카드를 뽑는 액션을 수행합니다 (에너지 소모 및 제약 포함).
     */
    executePlayerDraw(gs = GAME.State) {
        if (!gs.combat?.active || !gs.combat?.playerTurn) return false;

        const maxHand = 8;
        if (gs.player.hand.length >= maxHand) {
            gs.addLog?.(`⚠️ 손패가 가득 찼습니다 (최대 ${maxHand}장)`, 'damage');
            GAME.Audio?.playHit?.();
            GAME.getDeps()?.updateUI?.();
            return false;
        }

        if (gs.player.energy < 1) {
            gs.addLog?.('⚠️ 에너지 부족! (카드 뽑기: 1 에너지)', 'damage');
            GAME.Audio?.playHit?.();
            GAME.getDeps()?.updateUI?.();
            return false;
        }

        this.modifyEnergy(-1, gs);
        this.drawCards(1, gs);
        return true;
    },

    /**
     * 카드를 버리거나 사용 후 처리합니다.
     */
    discardCard(cardId, isExhaust = false, gs = GAME.State) {
        gs.dispatch(Actions.CARD_DISCARD, { cardId, exhaust: isExhaust });
        Logger.info(`[API] Card ${isExhaust ? 'exhausted' : 'discarded'}: ${cardId}`);
    },

    // === Combat ===

    /**
     * 카드를 사용합니다 (동기 처리 - 모든 카드 효과는 동기 함수임).
     */
    playCard(cardId, handIdx, gs = GAME.State) {
        const card = GAME.Data?.cards?.[cardId];
        if (!card) return false;

        Logger.group(`API: Play Card (${card.name})`);
        try {
            if (!gs.combat?.active || !gs.combat?.playerTurn) {
                Logger.warn('Cannot play card: Not player turn.');
                return false;
            }

            const cost = GAME.Modules?.['CardCostUtils']?.calcEffectiveCost?.(cardId, card, gs.player, handIdx) ?? card.cost;
            if (gs.player.energy < cost) {
                Logger.warn('Not enough energy.');
                return false;
            }

            // 지불 및 손패 제거
            gs.dispatch(Actions.PLAYER_ENERGY, { amount: -cost });
            gs.player.hand.splice(handIdx, 1);

            // 침묵의 도시 소음 게이지 상승
            const _getBaseRegion = GAME.getDeps()?.getBaseRegionIndex || ((r) => r);
            if (gs.combat?.active && _getBaseRegion(gs.currentRegion) === 1) {
                // 추가 방어 로직: 1지역(침묵의 도시) 외에서 소음 관련 로그가 뜨는 것을 방지
                gs.addSilence?.(1);
            }

            // 효과 실행 (동기 처리)
            card.effect?.(gs);

            // _nextCardDiscount 소비
            if ((gs.player._nextCardDiscount || 0) > 0) {
                gs.player._nextCardDiscount = Math.max(0, gs.player._nextCardDiscount - 1);
            }

            // 클래스 특성 훅
            const cm = GAME.Modules?.['ClassMechanics']?.[gs.player.class];
            if (cm && typeof cm.onPlayCard === 'function') {
                cm.onPlayCard(gs, { cardId });
            }

            // 사용 후 처리
            if (!gs.player.graveyard.includes(cardId) && !gs.player.exhausted.includes(cardId)) {
                this.discardCard(cardId, card.exhaust, gs);
            }

            gs.stats.cardsPlayed++;

            // EventBus 알림
            gs.bus?.emit(Actions.CARD_PLAY, { cardId, card, cost });

            Logger.info(`Card ${card.name} played successfully.`);
            GAME.getDeps()?.renderCombatCards?.();
            gs.markDirty?.('hud');
            GAME.getDeps()?.updateUI?.();
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
     * 전투를 종료합니다.
     */
    async endCombat(gs = GAME.State) {
        if (!gs.combat?.active || gs._endCombatRunning) return;
        return gs.endCombat();
    },

    // === System ===

    /**
     * 게임 화면을 전환합니다.
     */
    setScreen(screenName, gs = GAME.State) {
        Logger.info(`[API] Screen change: ${gs.currentScreen} -> ${screenName}`);
        gs.dispatch(Actions.SCREEN_CHANGE, { screen: screenName });

        const ScreenUI = GAME.Modules?.['ScreenUI'];
        if (ScreenUI?.switchScreen) {
            ScreenUI.switchScreen(screenName, { gs });
        } else {
            GAME.getDeps()?.switchScreen?.(screenName);
        }
    },

    // === UI Controls ===

    toggleHudPin(gs = GAME.State) {
        const CombatHudUI = GAME.Modules?.['CombatHudUI'];
        if (CombatHudUI?.toggleHudPin) {
            CombatHudUI.toggleHudPin(GAME.getDeps());
        } else {
            console.warn('[API] CombatHudUI.toggleHudPin not available');
        }
    },

    closeDeckView(gs = GAME.State) {
        const DeckModalUI = GAME.Modules?.['DeckModalUI'];
        if (DeckModalUI?.closeDeckView) {
            DeckModalUI.closeDeckView(GAME.getDeps());
        } else {
            console.warn('[API] DeckModalUI.closeDeckView not available');
        }
    },

    closeCodex(gs = GAME.State) {
        const CodexUI = GAME.Modules?.['CodexUI'];
        if (CodexUI?.closeCodex) {
            CodexUI.closeCodex(GAME.getDeps());
        } else {
            console.warn('[API] CodexUI.closeCodex not available');
        }
    }
};
