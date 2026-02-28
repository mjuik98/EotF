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
import { GAME } from './global_bridge.js';
import { Actions } from './state_actions.js';
import { CoreEvents } from './event_contracts.js';

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

        if (result && result.actualDamage > 0) {
            _ui.ScreenShake?.shake?.(8, 0.4);
            _ui.AudioEngine?.playPlayerHit?.();
        }

        // 체력 낮을 때 경고 이펙트
        if (gs.player.hp > 0 && gs.player.hp <= gs.player.maxHp * 0.25) {
            gs.showLowHpWarning?.();
        }

        // 사망 시 처리는 DeathHandler가 이후에 캡치함.
    });

    // 플레이어 회복 → HUD 갱신
    EventBus.on(Actions.PLAYER_HEAL, ({ payload, result, gs }) => {
        _ui.HudUpdateUI?.updatePlayerStats?.(gs);
        if (result && result.healed > 0) {
            _ui.ParticleSystem?.healEffect?.(window.innerWidth / 2, window.innerHeight / 2);
            _ui.AudioEngine?.playHeal?.();
        }
    });

    // 방어막 변경 → HUD 갱신
    EventBus.on(Actions.PLAYER_SHIELD, ({ payload, result, gs }) => {
        _ui.HudUpdateUI?.updatePlayerStats?.(gs);
    });

    // 골드 변경 → HUD 갱신
    EventBus.on(Actions.PLAYER_GOLD, ({ payload, result, gs }) => {
        _ui.HudUpdateUI?.updatePlayerStats?.(gs);
        if (result && result.delta > 0) {
            const el = document.createElement('div');
            el.style.cssText = `position:fixed;left:50%;top:${40 + Math.random() * 20}%;transform:translate(-50%,-50%);font-family:'Share Tech Mono',monospace;font-size:24px;font-weight:900;color:var(--gold);text-shadow:0 0 20px rgba(240,180,41,0.9);pointer-events:none;z-index:9500;animation:goldPop 1.4s ease forwards;`;
            el.textContent = `+${result.delta} Gold`;
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 1400);
        }
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

    EventBus.on(Actions.PLAYER_SILENCE, ({ payload, result, gs }) => {
        _ui.HudUpdateUI?.updateUI?.(GAME.getDeps?.() || {});
        const updateNoiseWidget = _ui.CombatHudUI?.updateNoiseWidget || window.updateNoiseWidget;
        if (typeof updateNoiseWidget === 'function') updateNoiseWidget();
    });

    // 버프 변경 → 상태 효과 디스플레이 갱신
    EventBus.on(Actions.PLAYER_BUFF, ({ payload, result, gs }) => {
        const updateStatusDisplay = _ui.HudUpdateUI?.updateStatusDisplay || window.updateStatusDisplay;
        if (typeof updateStatusDisplay === 'function') updateStatusDisplay();
    });

    // ═══════════════════════════════════════════
    //  Card Events → Hand/Card UI
    // ═══════════════════════════════════════════

    // 카드 드로우 → 손패 렌더링
    EventBus.on(Actions.CARD_DRAW, ({ payload, result, gs }) => {
        GAME.Audio?.playCard?.();
        window.renderHand?.();
        window.renderCombatCards?.();
        _ui.HudUpdateUI?.triggerDrawCardAnimation?.();
    });

    // 카드 사용 → 카드 이펙트 표시
    EventBus.on(Actions.CARD_PLAY, ({ payload, result, gs }) => {
        const { card } = payload || {};
        if (card) {
            const showCardPlayEffect = _ui.CombatUI?.showCardPlayEffect || window.showCardPlayEffect;
            showCardPlayEffect?.(card);
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

    // 적 데미지 → 적 HP UI 갱신 및 이펙트 처리
    EventBus.on(Actions.ENEMY_DAMAGE, ({ payload, result, gs }) => {
        if (result?.targetIdx !== undefined) {
            const enemy = gs?.combat?.enemies?.[result.targetIdx];
            if (enemy) {
                _ui.CombatUI?.updateEnemyHpUI?.(result.targetIdx, enemy);

                const dmg = result.actualDamage || 0;
                if (dmg > 0 || (payload && payload.amount > 0)) {
                    _ui.HitStop?.trigger?.(8);
                    const ex = window.innerWidth / 2 + (result.targetIdx - (gs.combat.enemies.length / 2 - 0.5)) * 180;

                    const isCrit = payload?.isCrit || dmg > (enemy.hp + dmg) * 0.3;
                    _ui.ParticleSystem?.hitEffect?.(ex, 250, dmg > 20 || isCrit);

                    const overlay = document.getElementById('hudOverlay');
                    if (isCrit || dmg > 25) {
                        _ui.AudioEngine?.playCritical?.();
                        const cf = document.createElement('div'); cf.className = 'crit-flash-overlay';
                        overlay?.appendChild(cf); setTimeout(() => cf.remove(), 450);
                    } else if (dmg > 12) {
                        _ui.AudioEngine?.playHeavyHit?.();
                        const hf = document.createElement('div'); hf.className = 'heavy-hit-overlay';
                        overlay?.appendChild(hf); setTimeout(() => hf.remove(), 500);
                    } else {
                        _ui.AudioEngine?.playHit?.();
                    }

                    const enemyCard = document.getElementById(`enemy_${result.targetIdx}`);
                    if (enemyCard) {
                        enemyCard.classList.remove('enemy-hit-anim'); void enemyCard.offsetWidth;
                        enemyCard.classList.add('enemy-hit-anim'); setTimeout(() => enemyCard.classList.remove('enemy-hit-anim'), 280);
                        const flashEl = document.createElement('div'); flashEl.className = 'enemy-dmg-flash';
                        enemyCard.style.position = 'relative'; enemyCard.appendChild(flashEl);
                        setTimeout(() => flashEl.remove(), 350);
                    }

                    _ui.ScreenShake?.shake?.(dmg > 20 ? 6 : 3, 0.2);
                    window.showDmgPopup?.(dmg, ex, 250);
                }
            }
        }
    });

    // 적 사망 → 로그
    EventBus.on(Actions.ENEMY_DEATH, ({ payload, result, gs }) => {
        // 사망 애니메이션은 combat_methods.onEnemyDeath에서 직접 처리 (DOM 타이밍 의존)
    });

    // 적 상태이상 적용 → 적 UI 갱신 (전체 렌더링 포함)
    EventBus.on(Actions.ENEMY_STATUS, ({ payload, result, gs }) => {
        // 카드 이펙트나 데미지 애니메이션이 끝난 후 상태 UI를 갱신하기 위해 약간 지연
        setTimeout(() => {
            if (typeof window.renderCombatEnemies === 'function') {
                window.renderCombatEnemies(true);
            }
            if (typeof window.updateUI === 'function') {
                window.updateUI();
            }
        }, 300);
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

    EventBus.on(CoreEvents.LOG_ADD, ({ msg, type, gs }) => {
        // GAME.API.updateCombatLog → window.updateCombatLog 순서로 호출
        if (typeof GAME.API?.updateCombatLog === 'function') {
            GAME.API.updateCombatLog();
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
