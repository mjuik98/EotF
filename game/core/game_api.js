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
        const result = gs.dispatch(Actions.CARD_DRAW, { count });
        // 카드 UI 갱신은 EventBus 구독자가 처리

        const activeRegionId = Number(gs?._activeRegionId);
        let combatRegionId = Number.isFinite(activeRegionId) ? Math.max(0, Math.floor(activeRegionId)) : null;
        if (combatRegionId == null) {
            const getRegionData = globalThis.GAME?.getDeps?.()?.getRegionData;
            const regionIdFromData = Number(getRegionData?.(gs.currentRegion, gs)?.id);
            if (Number.isFinite(regionIdFromData)) {
                combatRegionId = Math.max(0, Math.floor(regionIdFromData));
            } else {
                combatRegionId = Math.max(0, Math.floor(Number(gs.currentRegion) || 0));
            }
        }

        if (combatRegionId === 5 && gs.combat?.active) {
            if (typeof gs.addTimeRift === 'function' && result?.drawn > 0) {
                gs.addTimeRift(result.drawn, '시간의 균열', globalThis.GAME?.getDeps?.() || {});
            }
        }
    },

    /**
     * 플레이어가 직접 카드를 뽑는 액션을 수행합니다 (에너지 소모 및 제약 포함).
     */
    executePlayerDraw(gs = GAME.State) {
        if (!gs.combat?.active || !gs.combat?.playerTurn) return false;

        const maxHand = Math.max(1, 8 - Math.max(0, Number(gs.player._handCapMinus || 0)));
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
    discardCard(cardId, isExhaust = false, gs = GAME.State, skipHandRemove = false) {
        gs.dispatch(Actions.CARD_DISCARD, { cardId, exhaust: isExhaust, skipHandRemove });
        Logger.info(`[API] Card ${isExhaust ? 'exhausted' : 'discarded'}: ${cardId}`);
    },

    // === Combat ===

    /**
     * 카드를 사용합니다 (동기 처리 - 모든 카드 효과는 동기 함수임).
     */
    playCard(cardId, handIdx, gs = GAME.State) {
        if (gs.combat._isPlayingCard) {
            Logger.warn('Already playing a card. Ignoring input.');
            return false;
        }

        const card = GAME.Data?.cards?.[cardId];
        if (!card) return false;

        Logger.group(`API: Play Card (${card.name})`);
        gs.combat._isPlayingCard = true;

        try {
            if (!gs.combat?.active || !gs.combat?.playerTurn) {
                Logger.warn('Cannot play card: Not player turn.');
                gs.combat._isPlayingCard = false;
                return false;
            }

            // 새로운 카드 액션이 시작될 때 이전 회피 상태이상 무효화 플래그 초기화
            gs._lastDodgedTarget = null;

            const handCardId = gs.player.hand?.[handIdx];
            if (handCardId !== cardId) {
                Logger.warn('Cannot play card: Invalid hand index or card mismatch.');
                gs.combat._isPlayingCard = false;
                return false;
            }

            const cardCostUtils = GAME.Modules?.['CardCostUtils'];
            const nextCardDiscountBeforePlay = Number(gs.player._nextCardDiscount || 0);
            let cost = cardCostUtils?.calcEffectiveCost?.(cardId, card, gs.player, handIdx) ?? card.cost;
            if (typeof gs.triggerItems === 'function') {
                const delta = gs.triggerItems('before_card_cost', { cardId, cost, baseCost: card.cost });
                if (typeof delta === 'number' && Number.isFinite(delta)) {
                    cost = Math.max(0, Math.floor(cost + delta));
                }
            }
            if (gs.player.energy < cost) {
                Logger.warn('Not enough energy.');
                gs.combat._isPlayingCard = false;
                return false;
            }

            // 지불 및 손패 제거
            const energyBefore = gs.player.energy;
            const handBefore = [...gs.player.hand];
            gs.dispatch(Actions.PLAYER_ENERGY, { amount: -cost });
            gs.player.hand.splice(handIdx, 1);

            const rollbackPlayCost = () => {
                const restoreEnergy = energyBefore - gs.player.energy;
                if (restoreEnergy !== 0) {
                    gs.dispatch(Actions.PLAYER_ENERGY, { amount: restoreEnergy });
                }
                gs.player.hand = handBefore;
            };

            // 효과 실행 (동기 처리)
            try {
                gs._currentCard = card;
                card.effect?.(gs);
            } catch (effectErr) {
                rollbackPlayCost();
                throw effectErr;
            } finally {
                gs._currentCard = null;
            }

            // 성공적으로 카드가 발동된 뒤에만 카드 사용 부가 상태를 소모한다.
            // (예외 경로에서 상태 불일치가 남지 않도록 보장)
            const activeRegionId = Number(gs._activeRegionId);
            let combatRegionId = Number.isFinite(activeRegionId)
                ? Math.max(0, Math.floor(activeRegionId))
                : null;
            if (combatRegionId == null) {
                const getRegionData = GAME.getDeps()?.getRegionData;
                const regionIdFromData = Number(getRegionData?.(gs.currentRegion, gs)?.id);
                if (Number.isFinite(regionIdFromData)) {
                    combatRegionId = Math.max(0, Math.floor(regionIdFromData));
                } else {
                    combatRegionId = Math.max(0, Math.floor(Number(gs.currentRegion) || 0));
                }
            }
            if (gs.combat?.active && combatRegionId === 1) {
                gs.addSilence?.(1);
            }

            if (nextCardDiscountBeforePlay > 0) {
                gs.player._nextCardDiscount = Math.max(0, gs.player._nextCardDiscount - 1);
            }

            cardCostUtils?.consumeTraitDiscount?.(cardId, gs.player);
            cardCostUtils?.consumeFreeCharge?.(cardId, gs.player, handIdx);

            // 클래스 특성 훅
            const cm = GAME.Modules?.['ClassMechanics']?.[gs.player.class];
            if (cm && typeof cm.onPlayCard === 'function') {
                cm.onPlayCard(gs, { cardId });
            }

            // 카드 사용 기반 유물 트리거
            gs.triggerItems?.('card_play', { cardId, cost });

            // 5연쇄 이상일 때 매 카드마다 공명 폭발 발동
            if (gs.player.echoChain >= 5) {
                if (typeof gs.triggerResonanceBurst === 'function') {
                    gs.triggerResonanceBurst({
                        audioEngine: GAME.Audio,
                        screenShake: GAME.getDeps()?.ScreenShake,
                        particleSystem: GAME.getDeps()?.ParticleSystem,
                        showDmgPopup: GAME.getDeps()?.showDmgPopup,
                        updateUI: GAME.getDeps()?.updateUI,
                        renderCombatEnemies: GAME.getDeps()?.renderCombatEnemies
                    }, { isPassive: true });
                }
            }

            // 사용 후 처리
            if (!gs.player.graveyard.includes(cardId) && !gs.player.exhausted.includes(cardId)) {
                this.discardCard(cardId, card.exhaust, gs, true);
            }

            gs.stats.cardsPlayed++;

            // EventBus 알림
            gs.bus?.emit(Actions.CARD_PLAY, { cardId, card, cost });

            Logger.info(`Card ${card.name} played successfully.`);
            GAME.getDeps()?.renderCombatCards?.();
            gs.markDirty?.('hud');
            GAME.Modules?.['HudUpdateUI']?.processDirtyFlags?.(GAME.getDeps());

            // 처리 완료 후 플래그 해제
            gs.combat._isPlayingCard = false;
            return true;
        } catch (e) {
            Logger.error('Error playing card:', e);
            gs.combat._isPlayingCard = false;
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
