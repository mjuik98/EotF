import { Logger } from '../utils/logger.js';
import { drawCardsService, executePlayerDrawService } from '../app/combat/card_draw_service.js';
import { playCardService } from '../app/combat/play_card_service.js';
import { setScreenService } from '../app/system/screen_service.js';
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
    drawCards(count = 1, gs = GAME.State, options = {}) {
        return drawCardsService({
            count,
            gs,
            options,
            deps: {
                getRegionData: GAME.getDeps?.()?.getRegionData,
                runtimeDeps: GAME.getDeps?.() || {},
            },
        });
    },

    /**
     * 플레이어가 직접 카드를 뽑는 액션을 수행합니다 (에너지 소모 및 제약 포함).
     */
    executePlayerDraw(gs = GAME.State) {
        return executePlayerDrawService({
            gs,
            modifyEnergy: (amount, state) => this.modifyEnergy(amount, state),
            drawCards: (count, state) => this.drawCards(count, state),
            playHit: () => GAME.Audio?.playHit?.(),
            updateUI: () => GAME.getDeps()?.updateUI?.(),
        });
    },

    /**
     * 카드를 버리거나 사용 후 처리합니다.
     */
    discardCard(cardId, isExhaust = false, gs = GAME.State, skipHandRemove = false) {
        gs.dispatch(Actions.CARD_DISCARD, { cardId, exhaust: isExhaust, skipHandRemove });
        Logger.info(`[API] Card ${isExhaust ? 'exhausted' : 'discarded'}: ${cardId}`);
    },

    // === Combat ===

    /**
     * 카드를 사용합니다 (동기 처리 - 모든 카드 효과는 동기 함수임).
     */
    playCard(cardId, handIdx, gs = GAME.State) {
        const card = GAME.Data?.cards?.[cardId];
        return playCardService({
            cardId,
            handIdx,
            gs,
            card,
            cardCostUtils: GAME.Modules?.['CardCostUtils'],
            classMechanics: GAME.Modules?.['ClassMechanics'],
            discardCard: (nextCardId, isExhaust, state, skipHandRemove) => this.discardCard(nextCardId, isExhaust, state, skipHandRemove),
            logger: Logger,
            audioEngine: GAME.Audio,
            runtimeDeps: GAME.getDeps?.() || {},
            hudUpdateUI: GAME.Modules?.['HudUpdateUI'],
        });
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
        setScreenService({
            screenName,
            gs,
            logger: Logger,
            screenUI: GAME.Modules?.['ScreenUI'],
            switchScreen: (screen) => GAME.getDeps()?.switchScreen?.(screen),
        });
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
