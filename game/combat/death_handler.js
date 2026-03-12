/**
 * death_handler.js — 사망 처리 시스템
 *
 * 책임: 적/플레이어 사망 처리 + 사망 화면 구성
 * - onEnemyDeath: 적 사망 시 보상, 도감 등록, UI 정리
 * - onPlayerDeath: 플레이어 사망 연출
 * - showDeathScreen: 사망 결과 연출 및 후처리
 * - spawnEnemy: 적 소환 (적 생사 관리)
 */

import { DATA } from '../../data/game_data.js';
import { applyEnemyDeathState } from './death_handler_enemy_state.js';
import { showDeathOutcomeScreen } from './death_handler_outcome.js';
import { handleEnemyDeathFlow } from './death_handler_enemy_death_flow.js';
import {
    cleanupEnemyDeathTooltips,
    lockCombatEndInputs,
    runPlayerDeathSequence,
    scheduleCombatEndFlow,
    scheduleEnemyRemoval,
    showDefeatOutcome,
} from './death_handler_runtime.js';
import { getRegionData } from '../systems/run_rules.js';
import { registerEnemyKill } from '../systems/codex_records_system.js';
import { EventBus } from '../core/event_bus.js';
import { Actions } from '../core/state_actions.js';
import {
    recordEnemyWorldKill,
    replaceCombatEnemies,
    scheduleCombatEnd,
    setCombatActive,
    syncSelectedTarget,
} from '../state/commands/combat_runtime_commands.js';
import { spawnScaledEnemyForRegion } from './death_handler_spawn.js';
import {
    playReactionEnemyDeath,
    playReactionPlayerDeath,
    playStatusHeal,
} from '../domain/audio/audio_event_helpers.js';

const _getDoc = (deps) => deps?.doc || document;
const _getWin = (deps) => deps?.win || window;

export const DeathHandler = {
    spawnEnemy(deps = {}) {
        const win = _getWin(deps);
        const hudUpdateUI = deps.hudUpdateUI || win.HudUpdateUI;
        return spawnScaledEnemyForRegion(this, {
            getRegionData,
            renderCombatEnemies: deps.renderCombatEnemies || win.renderCombatEnemies,
            enableActionButtons: hudUpdateUI?.enableActionButtons?.bind?.(hudUpdateUI),
            doc: _getDoc(deps),
            win,
        });
    },

    onEnemyDeath(enemy, idx, deps = {}) {
        const win = _getWin(deps);
        const doc = _getDoc(deps);
        const cleanupTooltips = deps.cleanupAllTooltips || win.CombatUI?.cleanupAllTooltips;
        const AudioEngine = deps.audioEngine || win.AudioEngine;
        handleEnemyDeathFlow({
            enemy,
            gs: this,
            idx,
            applyEnemyDeath: (state, defeatedEnemy, enemyIdx) => applyEnemyDeathState(state, defeatedEnemy, enemyIdx, {
                addGold: (amount) => this.addGold(amount, deps),
                addLog: (message, type) => this.addLog(message, type),
                emitEnemyDeath: (payload) => EventBus.emit(Actions.ENEMY_DEATH, payload),
                isCombatEndScheduled: () => !!this._endCombatScheduled,
                playEnemyDeath: () => playReactionEnemyDeath(AudioEngine),
                recordEnemyWorldKill: (enemyId) => recordEnemyWorldKill(this, enemyId),
                registerEnemyKill: (enemyId) => registerEnemyKill(this, enemyId),
                scheduleCombatEnd: () => scheduleCombatEnd(this),
                triggerItems: (trigger, payload) => this.triggerItems(trigger, payload),
            }),
            runtimePort: {
                cleanupTooltips: () => cleanupEnemyDeathTooltips(cleanupTooltips, doc, win),
                lockCombatEndInputs: () => lockCombatEndInputs(doc),
                queueCombatEnd: () => scheduleCombatEndFlow({
                    deps,
                    endCombat: (endCombatDeps) => this.endCombat(endCombatDeps),
                    schedule: setTimeout,
                    win,
                }),
                removeDeadEnemies: () => replaceCombatEnemies(this, this.combat.enemies.filter(e => e.hp > 0)),
                renderCombatEnemies: deps.renderCombatEnemies || win.renderCombatEnemies,
                scheduleEnemyRemoval: (enemyIdx, onRemove) => {
                    const cardEl = doc.getElementById(`enemy_${enemyIdx}`);
                    scheduleEnemyRemoval(cardEl, setTimeout, onRemove);
                },
                syncSelectedTarget: () => syncSelectedTarget(this),
                updateUi: deps.updateUI || win.updateUI,
            },
        });
    },

    onPlayerDeath(deps = {}) {
        const AudioEngine = deps.audioEngine || _getWin(deps).AudioEngine;
        const preDeathResult = this.triggerItems?.('pre_death');
        if (preDeathResult === true) {
            playStatusHeal(AudioEngine);
            const updateUI = deps.updateUI || _getWin(deps).updateUI;
            if (typeof updateUI === 'function') updateUI();
            return;
        }

        const win = _getWin(deps);
        const doc = _getDoc(deps);
        const ScreenShake = deps.screenShake || win.ScreenShake;
        const ParticleSystem = deps.particleSystem || win.ParticleSystem;

        playReactionPlayerDeath(AudioEngine);

        // 전투 상태 해제 및 유물 트리거 (death)
        setCombatActive(this, false);
        this.triggerItems('death');
        runPlayerDeathSequence({
            combatOverlay: doc.getElementById('combatOverlay'),
            deathQuotes: DATA.deathQuotes,
            doc,
            particleSystem: ParticleSystem,
            schedule: setTimeout,
            screenShake: ScreenShake,
            showDeathScreen: () => this.showDeathScreen(deps),
            win,
        });
    },

    showDeathScreen(deps = {}) {
        const win = _getWin(deps);
        showDeathOutcomeScreen(this, deps, win);
    },

    generateFragmentChoices(deps = {}) {
        const choices = [
            { icon: '⚡', name: 'Echo 강화', desc: '다음 런 시작 시 Echo +30', effect: 'echo_boost' },
            { icon: '🛡️', name: '회복력', desc: '최대 체력 +10', effect: 'resilience' },
            { icon: '💰', name: '행운', desc: '시작 골드 +25', effect: 'fortune' },
        ];
        const shuffle = (arr) => {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
        };
        shuffle(choices);
        const doc = _getDoc(deps);
        const win = _getWin(deps);
        const fragList = doc.getElementById('fragmentChoices');
        if (fragList) {
            fragList.textContent = '';
            choices.forEach(c => {
                const btn = doc.createElement('div');
                btn.className = 'fragment-btn';
                btn.onclick = () => {
                    const selectFragment = deps.selectFragment || win.selectFragment;
                    selectFragment?.(c.effect);
                };

                const icon = doc.createElement('div');
                icon.className = 'fragment-icon';
                icon.textContent = c.icon;

                const name = doc.createElement('div');
                name.className = 'fragment-name';
                name.textContent = c.name;

                const desc = doc.createElement('div');
                desc.className = 'fragment-desc';
                desc.textContent = c.desc;

                btn.append(icon, name, desc);
                fragList.appendChild(btn);
            });
        }
    },
};
