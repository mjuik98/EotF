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
import { Actions } from '../shared/state/public.js';
import {
    runEndCombatFlow,
    applyPassiveResonanceBurstState,
    syncCombatMaxChainState,
} from '../features/combat/app/combat_lifecycle_feature_bridge.js';
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
        const win = _getWin(deps);
        const doc = _getDoc(deps);
        const outcome = await runEndCombatFlow({
            combatStateCommands: {
                beginResolution: beginCombatResolution,
                completeResolution: completeCombatResolution,
                setBossRewardState,
                setCombatActive,
            },
            deps: {
                ...deps,
                playItemGet: () => playUiItemGet(deps.audioEngine || win.AudioEngine),
            },
            dispatchCombatEnd: (state) => state.dispatch?.(Actions.COMBAT_END, { victory: true }),
            doc,
            getBaseRegionIndex,
            getRegionCount,
            gs: this,
            isEndlessRun: (state) => RunRules.isEndless(state),
            reportError: (error) => console.error('[endCombat] Error:', error),
            win,
        });

        if (outcome?.skipped || outcome?.error) return outcome;

        this.triggerItems('combat_end', { isBoss: outcome.isBoss });
        this.triggerItems('void_shard');
        return outcome;
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
