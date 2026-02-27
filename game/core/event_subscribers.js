/**
 * event_subscribers.js — 이벤트 구독 등록 (Pub/Sub 와이어링)
 *
 * EventBus에서 발행되는 상태 변경 이벤트를 구독하고,
 * 적절한 UI 모듈을 호출하여 화면을 갱신합니다.
 *
 * 로직 모듈(combat_methods, player_methods 등)은 이벤트만 발행하고,
 * 이 파일에서 UI 업데이트를 책임집니다.
 * → 로직 ↔ UI 간 직접 결합 제거
 */
import { EventBus } from './event_bus.js';
import { Actions } from './state_actions.js';

let _ui = {};  // UI 모듈 참조

/**
 * UI 모듈 참조를 주입받아 모든 구독을 등록합니다.
 * main.js 또는 init_sequence.js에서 부팅 시 한번 호출됩니다.
 */
export function registerSubscribers(uiRefs) {
    _ui = uiRefs;

    // ═══════════════════════════════════════════
    //  Player State Changes → HUD Update
    // ═══════════════════════════════════════════

    // 플레이어 데미지 → HUD 갱신 + 피격 이펙트
    EventBus.on(Actions.PLAYER_DAMAGE, ({ payload, result, gs }) => {
        _ui.HudUpdateUI?.updatePlayerStats?.(gs);

        // 체력 낮을 때 경고 이펙트
        if (gs.player.hp > 0 && gs.player.hp <= gs.player.maxHp * 0.25) {
            gs.showLowHpWarning?.();
        }

        // 사망 시 화면 전체 ui는 onPlayerDeath가 처리
    });

    // 플레이어 회복 → HUD 갱신
    EventBus.on(Actions.PLAYER_HEAL, ({ payload, result, gs }) => {
        _ui.HudUpdateUI?.updatePlayerStats?.(gs);
    });

    // 방어막 변경 → HUD 갱신
    EventBus.on(Actions.PLAYER_SHIELD, ({ payload, result, gs }) => {
        _ui.HudUpdateUI?.updatePlayerStats?.(gs);
    });

    // 골드 변경 → HUD 갱신
    EventBus.on(Actions.PLAYER_GOLD, ({ payload, result, gs }) => {
        _ui.HudUpdateUI?.updatePlayerStats?.(gs);
    });

    // 에너지 변경 → 전투 에너지 UI 갱신
    EventBus.on(Actions.PLAYER_ENERGY, ({ payload, result, gs }) => {
        _ui.HudUpdateUI?.updateCombatEnergy?.(gs);
    });

    // Echo 변경 → Echo 스킬 버튼 갱신
    EventBus.on(Actions.PLAYER_ECHO, ({ payload, result, gs }) => {
        const updateEchoSkillBtn = window.updateEchoSkillBtn;
        if (typeof updateEchoSkillBtn === 'function') updateEchoSkillBtn();
    });

    // 버프 변경 → 상태 효과 디스플레이 갱신
    EventBus.on(Actions.PLAYER_BUFF, ({ payload, result, gs }) => {
        const updateStatusDisplay = window.updateStatusDisplay;
        if (typeof updateStatusDisplay === 'function') updateStatusDisplay();
    });

    // ═══════════════════════════════════════════
    //  Card Events → Hand/Card UI
    // ═══════════════════════════════════════════

    // 카드 드로우 → 손패 렌더링
    EventBus.on(Actions.CARD_DRAW, ({ payload, result, gs }) => {
        window.AudioEngine?.playCard?.();
        window.renderHand?.();
        window.renderCombatCards?.();
        _ui.HudUpdateUI?.triggerDrawCardAnimation?.();
    });

    // 카드 사용 → 카드 이펙트 표시
    EventBus.on(Actions.CARD_PLAY, ({ payload, result, gs }) => {
        const { card } = payload || {};
        if (card) {
            window.showCardPlayEffect?.(card);
        }
        window.renderCombatCards?.();
    });

    // 카드 버림 → 손패 갱신
    EventBus.on(Actions.CARD_DISCARD, ({ payload, result, gs }) => {
        window.renderCombatCards?.();
    });

    // ═══════════════════════════════════════════
    //  Enemy Events → Combat UI
    // ═══════════════════════════════════════════

    // 적 데미지 → 적 HP UI 갱신
    EventBus.on(Actions.ENEMY_DAMAGE, ({ payload, result, gs }) => {
        if (result?.targetIdx !== undefined) {
            const enemy = gs?.combat?.enemies?.[result.targetIdx];
            if (enemy) {
                _ui.HudUpdateUI?.updateEnemyHpUI?.(result.targetIdx, enemy);
            }
        }
    });

    // 적 사망 → 로그
    EventBus.on(Actions.ENEMY_DEATH, ({ payload, result, gs }) => {
        // 사망 애니메이션은 combat_methods.onEnemyDeath에서 직접 처리 (DOM 타이밍 의존)
    });

    // ═══════════════════════════════════════════
    //  Combat Flow Events
    // ═══════════════════════════════════════════

    // 전투 종료 → 전체 UI 정리
    EventBus.on(Actions.COMBAT_END, ({ payload, result, gs }) => {
        // endCombat의 복잡한 UI 처리는 combat_methods에서 직접 수행 (타이밍 의존)
        // 여기서는 보조적인 정리만 수행
        window.updateUI?.();
    });

    // 턴 시작 → 턴 배너 표시
    EventBus.on(Actions.TURN_START, ({ payload, result, gs }) => {
        if (payload.isPlayerTurn) {
            window.showTurnBanner?.('player');
        } else {
            window.showTurnBanner?.('enemy');
        }
    });

    // ═══════════════════════════════════════════
    //  Screen Change
    // ═══════════════════════════════════════════

    EventBus.on(Actions.SCREEN_CHANGE, ({ payload, result, gs }) => {
        // ScreenUI.switchScreen은 game_api.setScreen에서 이미 호출됨
        // 여기서는 부가적인 UI 동기화만 수행
        window.updateUI?.();
    });

    // ═══════════════════════════════════════════
    //  Combat Log
    // ═══════════════════════════════════════════

    EventBus.on('log:add', ({ msg, type, gs }) => {
        // GAME.API.updateCombatLog → window.updateCombatLog 순서로 호출
        if (typeof window.GAME?.API?.updateCombatLog === 'function') {
            window.GAME.API.updateCombatLog();
        } else if (typeof window.updateCombatLog === 'function') {
            window.updateCombatLog();
        }
    });

    console.log('[EventSubscribers] Registered all event subscriptions');
}

/**
 * 구독 해제 (테스트/리셋용)
 */
export function clearSubscribers() {
    EventBus.clear();
}
