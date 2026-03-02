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

import { LogUtils } from '../utils/log_utils.js';

const _getDoc = (deps) => deps?.doc || document;
const _getWin = (deps) => deps?.win || window;

export const CombatLifecycle = {
    async endCombat(deps = {}) {
        if (!this.combat.active) return;
        if (this._endCombatRunning) return;
        this._endCombatRunning = true;
        const win = _getWin(deps);
        const doc = _getDoc(deps);

        // COMBAT_END 디스패치가 전투 상태를 초기화하므로, 보스 정보는 미리 캡처한다.
        const combatState = this.combat;
        const preEndEnemies = Array.isArray(combatState?.enemies) ? [...combatState.enemies] : [];
        const isBoss = !!combatState?.bossDefeated || preEndEnemies.some(e => e?.isBoss);
        const regionIdx = this.currentRegion;
        const isLastRegion = getBaseRegionIndex(regionIdx) === Math.max(0, getRegionCount() - 1);

        try {
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

            this.triggerItems('combat_end');
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
            AudioEngine?.playItemGet?.();
            const combatDmgDealt = this.stats.damageDealt - (this._combatStartDmg || 0);
            const combatDmgTaken = this.stats.damageTaken - (this._combatStartTaken || 0);
            const showCombatSummary = deps.showCombatSummary || win.showCombatSummary;
            if (typeof showCombatSummary === 'function') showCombatSummary(combatDmgDealt, combatDmgTaken, this.player.kills - (this._combatStartKills || 0));

            if (isBoss) {
                this._bossRewardPending = true;
                this._bossLastRegion = isLastRegion;
            }
            if (isBoss && isLastRegion && RunRules.isEndless(this)) {
                setTimeout(() => {
                    const returnToGame = deps.returnToGame || win.returnToGame;
                    if (typeof returnToGame === 'function') {
                        returnToGame(true);
                    }
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
            this.combat.active = false;
            const showRewardScreen = deps.showRewardScreen || win.showRewardScreen;
            if (typeof showRewardScreen === 'function') {
                showRewardScreen(isBoss);
            }
        } catch (e) {
            console.error('[endCombat] Error:', e);
        } finally {
            this._endCombatRunning = false;
            this._endCombatScheduled = false;
        }
    },

    updateChainDisplay(deps = {}) {
        const chain = this.player.echoChain;
        this.stats.maxChain = Math.max(this.stats.maxChain, chain);
        const win = _getWin(deps);
        const updateChainUI = deps.updateChainUI || win.updateChainUI;
        if (typeof updateChainUI === 'function') updateChainUI(chain);
        const AudioEngine = deps.audioEngine || win.AudioEngine;
        if (chain > 0) AudioEngine?.playChain?.(chain);
        if (chain >= 5) this.triggerResonanceBurst(deps);
    },

    triggerResonanceBurst(deps = {}) {
        this.player.echoChain = 0;
        this.drainEcho(50);
        const win = _getWin(deps);
        const AudioEngine = deps.audioEngine || win.AudioEngine;
        const ScreenShake = deps.screenShake || win.ScreenShake;
        const ParticleSystem = deps.particleSystem || win.ParticleSystem;

        AudioEngine?.playResonanceBurst?.();
        ScreenShake?.shake?.(15, 0.8);
        let burstDmg = 35 + Math.floor(this.player.echo / 3);
        const burstMod = this.triggerItems('resonance_burst', burstDmg);
        if (burstMod === true) {
            burstDmg = Math.floor(burstDmg * 2);
        } else if (typeof burstMod === 'number' && Number.isFinite(burstMod)) {
            burstDmg = Math.max(0, Math.floor(burstMod));
        }
        this.combat.enemies.forEach((e, i) => {
            if (e.hp > 0) {
                e.hp = Math.max(0, e.hp - burstDmg);
                const showDmgPopup = deps.showDmgPopup || win.showDmgPopup;
                if (typeof showDmgPopup === 'function') showDmgPopup(burstDmg, win.innerWidth / 2 + (i - 0.5) * 200, 200, '#00ffcc');
                if (e.hp <= 0) this.onEnemyDeath(e, i, deps);
            }
        });
        ParticleSystem?.burstEffect?.(win.innerWidth / 2, win.innerHeight / 3);
        const showEchoBurstOverlay = deps.showEchoBurstOverlay || win.showEchoBurstOverlay;
        if (typeof showEchoBurstOverlay === 'function') showEchoBurstOverlay();
        this.addLog(LogUtils.formatEcho(`🌟 RESONANCE BURST! 전체 ${burstDmg} 피해!`), 'echo');
        this.stats.maxChain = Math.max(this.stats.maxChain, 5);
        const updateChainUI = deps.updateChainUI || win.updateChainUI;
        if (typeof updateChainUI === 'function') updateChainUI(0);
        const renderCombatEnemies = deps.renderCombatEnemies || win.renderCombatEnemies;
        if (typeof renderCombatEnemies === 'function') renderCombatEnemies();
        const showChainAnnounce = deps.showChainAnnounce || win.showChainAnnounce;
        if (typeof showChainAnnounce === 'function') showChainAnnounce('RESONANCE BURST!!');
    },
};
