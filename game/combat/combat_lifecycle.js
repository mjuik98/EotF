/**
 * combat_lifecycle.js — 전투 흐름 관리
 *
 * 책임: 전투 종료 처리 + 에코 체인 시스템
 * - endCombat: 전투 종료 (UI 정리, 보상 화면 전환)
 * - updateChainDisplay: 체인 카운터 표시
 * - triggerResonanceBurst: 공명 폭발 (체인 5+ 달성 시)
 */

// 엔진 기능은 deps를 통해 주입받도록 수정하여 하드코딩 연결 제거
import { RunRules, getBaseRegionIndex, getRegionCount } from '../systems/run_rules.js';
import { EventBus } from '../core/event_bus.js';
import { Actions } from '../core/state_actions.js';
import {
    applyPassiveResonanceBurstState,
    syncCombatMaxChainState,
} from '../features/combat/state/combat_chain_state_commands.js';
import {
    beginCombatResolution,
    completeCombatResolution,
    resetPlayerEchoChain,
    setBossRewardState,
    setCombatActive,
} from '../state/commands/combat_runtime_commands.js';
import {
    playEventResonanceBurst,
    playUiItemGet,
} from '../domain/audio/audio_event_helpers.js';

import { LogUtils } from '../utils/log_utils.js';

const _getDoc = (deps) => deps?.doc || document;
const _getWin = (deps) => deps?.win || window;

export const CombatLifecycle = {
    async endCombat(deps = {}) {
        if (!this.combat.active) return;
        if (!beginCombatResolution(this)) return;
        const win = _getWin(deps);
        const doc = _getDoc(deps);

        // COMBAT_END 디스패치가 전투 상태를 초기화하므로, 보스 정보는 미리 캡처한다.
        const combatState = this.combat;
        const preEndEnemies = Array.isArray(combatState?.enemies) ? [...combatState.enemies] : [];
        const isBoss = !!combatState?.bossDefeated || preEndEnemies.some(e => e?.isBoss);
        const isMiniBoss = !!combatState?.miniBossDefeated
            || preEndEnemies.some(e => e?.isMiniBoss)
            || this.currentNode?.type === 'mini_boss';
        const regionIdx = this.currentRegion;
        const isLastRegion = getBaseRegionIndex(regionIdx) === Math.max(0, getRegionCount() - 1);

        // Capture combat summary stats BEFORE dispatch resets them
        const combatDmgDealt = this.stats.damageDealt - (this._combatStartDmg || 0);
        const combatDmgTaken = this.stats.damageTaken - (this._combatStartTaken || 0);
        const combatKills = this.player.kills - (this._combatStartKills || 0);

        try {
            deps.runRules?.onCombatEnd?.(this);

            this.dispatch(Actions.COMBAT_END, { victory: true });
            const tooltipUI = deps.tooltipUI || win.TooltipUI;
            tooltipUI?.hideTooltip?.({ doc });

            // 전투 종료 시 툴팁 정리
            const cleanupTooltips = deps.cleanupAllTooltips || win.CombatUI?.cleanupAllTooltips;
            if (typeof cleanupTooltips === 'function') cleanupTooltips({ doc, win });

            doc.getElementById('cardTooltip')?.classList.remove('visible');
            const combatHandCards = doc.getElementById('combatHandCards');
            if (combatHandCards) combatHandCards.textContent = '';
            const hudUpdateUI = deps.hudUpdateUI || win.HudUpdateUI;
            if (hudUpdateUI && typeof hudUpdateUI.resetCombatUI === 'function') {
                hudUpdateUI.resetCombatUI();
            } else {
                doc.getElementById('combatOverlay')?.classList.remove('active');
                doc.getElementById('noiseGaugeOverlay')?.remove();
                const endZone = doc.getElementById('enemyZone');
                if (endZone) endZone.textContent = '';
            }

            this.triggerItems('combat_end', { isBoss });
            this.triggerItems('void_shard');

            const updateChainUI = deps.updateChainUI || win.updateChainUI;
            if (typeof updateChainUI === 'function') updateChainUI(0);
            const renderHand = deps.renderHand || win.renderHand;
            if (typeof renderHand === 'function') renderHand();
            const renderCombatCards = deps.renderCombatCards || win.renderCombatCards;
            if (typeof renderCombatCards === 'function') renderCombatCards();
            const updateUI = deps.updateUI || win.updateUI;
            if (typeof updateUI === 'function') updateUI();

            const AudioEngine = deps.audioEngine || win.AudioEngine;
            playUiItemGet(AudioEngine);
            const showCombatSummary = deps.showCombatSummary || win.showCombatSummary;
            if (typeof showCombatSummary === 'function') showCombatSummary(combatDmgDealt, combatDmgTaken, combatKills);

            if (isBoss) {
                setBossRewardState(this, { pending: true, lastRegion: isLastRegion });
            }
            if (isBoss && isLastRegion && RunRules.isEndless(this)) {
                setTimeout(() => {
                    const returnFromReward = deps.returnFromReward || win.returnFromReward;
                    if (typeof returnFromReward === 'function') {
                        returnFromReward();
                        return;
                    }
                    const returnToGame = deps.returnToGame || win.returnToGame;
                    if (typeof returnToGame === 'function') returnToGame(true);
                }, 300);
                return;
            }
            if (hudUpdateUI && typeof hudUpdateUI.hideNodeOverlay === 'function') {
                hudUpdateUI.hideNodeOverlay();
            } else {
                const nodeOverlay = doc.getElementById('nodeCardOverlay');
                if (nodeOverlay) nodeOverlay.style.display = 'none';
            }
            await new Promise(r => setTimeout(r, 1000));

            // Ensure combat is deactivated before showing reward screen
            setCombatActive(this, false);
            const showRewardScreen = deps.showRewardScreen || win.showRewardScreen;
            if (typeof showRewardScreen === 'function') {
                const rewardMode = isBoss ? 'boss' : (isMiniBoss ? 'mini_boss' : false);
                showRewardScreen(rewardMode);
            }
        } catch (e) {
            console.error('[endCombat] Error:', e);
        } finally {
            completeCombatResolution(this);
        }
    },

    updateChainDisplay(deps = {}) {
        const chain = this.player.echoChain;
        syncCombatMaxChainState(this, chain);
        const win = _getWin(deps);
        const updateChainUI = deps.updateChainUI || win.updateChainUI;
        if (typeof updateChainUI === 'function') updateChainUI(chain);
        const AudioEngine = deps.audioEngine || win.AudioEngine;
        if (chain > 0) AudioEngine?.playChain?.(chain);
        // 5연쇄 이상일 때 공명 폭발 발동 (하지만 체인은 초기화하지 않음)
        if (chain >= 5 && chain % 5 === 0) {
            // 처음 5연쇄 도달 시에만 알림 표시 (선택적)
            if (chain === 5 && typeof win.showChainAnnounce === 'function') {
                win.showChainAnnounce('RESONANCE BURST!!');
            }
            this.triggerResonanceBurst(deps, { isPassive: true });
        }
    },

    triggerResonanceBurst(deps = {}, options = {}) {
        const isPassive = !!options.isPassive;
        const win = _getWin(deps);

        if (!isPassive) {
            resetPlayerEchoChain(this);
            this.drainEcho(50);
        }

        const AudioEngine = deps.audioEngine || win.AudioEngine;
        const ScreenShake = deps.screenShake || win.ScreenShake;
        const ParticleSystem = deps.particleSystem || win.ParticleSystem;

        playEventResonanceBurst(AudioEngine);

        // 패시브 발동 시에는 화면 흔들림을 약하게
        if (isPassive) {
            ScreenShake?.shake?.(5, 0.3);
        } else {
            ScreenShake?.shake?.(15, 0.8);
        }

        let burstDmg = isPassive ? (this.player.echoChain || 0) : 0;
        if (!isPassive) return; // 기존의 강력한 고정 데미지 폭발은 제거함.

        const burstMod = this.triggerItems('resonance_burst', burstDmg);
        if (typeof burstMod === 'number' && Number.isFinite(burstMod)) {
            burstDmg = Math.max(0, Math.floor(burstMod));
        }

        const hitResults = applyPassiveResonanceBurstState(this, burstDmg, {
            onEnemyDeath: (enemy, index) => this.onEnemyDeath(enemy, index, deps),
        });
        hitResults.forEach(({ index, dealt }) => {
            if (dealt <= 0) return;
            const x = win.innerWidth / 2 + (index - (this.combat.enemies.length - 1) / 2) * 200;
            const showDmgPopup = deps.showDmgPopup || win.showDmgPopup;
            if (typeof showDmgPopup === 'function') {
                showDmgPopup(burstDmg, x, 200, '#00ffcc');
            }

            if (isPassive && typeof ParticleSystem?.hitEffect === 'function') {
                ParticleSystem.hitEffect(x, 200, false);
            }
        });

        if (!isPassive) {
            // 기존의 강력한 BURST 효과(오버레이 등)는 제거
            this.stats.maxChain = Math.max(this.stats.maxChain, 5);
        } else {
            // 패시브용 로그
            this.addLog(LogUtils.formatEcho(`✨ 공명 폭발: ${burstDmg} 피해!`), 'echo');
        }

        const renderCombatEnemies = deps.renderCombatEnemies || win.renderCombatEnemies;
        if (typeof renderCombatEnemies === 'function') renderCombatEnemies();
    },
};
