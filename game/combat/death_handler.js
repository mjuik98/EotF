/**
 * death_handler.js — 사망 처리 시스템
 *
 * 책임: 적/플레이어 사망 처리 + 사망 화면 구성
 * - onEnemyDeath: 적 사망 시 보상, 도감 등록, UI 정리
 * - onPlayerDeath: 플레이어 사망 연출
 * - showDeathScreen: 사망 화면 구성
 * - generateFragmentChoices: 에코 파편 선택지 생성
 * - spawnEnemy: 적 소환 (적 생사 관리)
 */

// 엔진 기능은 deps를 통해 주입받도록 수정하여 하드코딩 연결 제거
import { DATA } from '../../data/game_data.js';
import { DifficultyScaler } from './difficulty_scaler.js';
import { getRegionData } from '../systems/run_rules.js';
import { EventBus } from '../core/event_bus.js';
import { Actions } from '../core/state_actions.js';

const _getDoc = (deps) => deps?.doc || document;
const _getWin = (deps) => deps?.win || window;

export const DeathHandler = {
    spawnEnemy(deps = {}) {
        const region = getRegionData(this.currentRegion, this);
        if (!region) return;

        const pool = (this.currentFloor <= 1 && region.strongEnemies) ? region.enemies : [...region.enemies, ...(region.strongEnemies || [])];
        const eKey = pool[Math.floor(Math.random() * pool.length)];
        const eData = DATA.enemies[eKey];
        if (eData && this.combat.enemies.length < 3) {
            this.combat.enemies.push(DifficultyScaler.scaleEnemy({ ...eData, statusEffects: {} }, this, undefined, undefined, this.currentFloor));
            const win = _getWin(deps);
            const renderCombatEnemies = deps.renderCombatEnemies || win.renderCombatEnemies;
            if (typeof renderCombatEnemies === 'function') {
                renderCombatEnemies();
            }
            if (this.combat.playerTurn) {
                const hudUpdateUI = deps.hudUpdateUI || win.HudUpdateUI;
                if (hudUpdateUI && typeof hudUpdateUI.enableActionButtons === 'function') {
                    hudUpdateUI.enableActionButtons();
                } else {
                    _getDoc(deps).querySelectorAll('.action-btn').forEach(b => { b.disabled = false; });
                }
            }
        }
    },

    onEnemyDeath(enemy, idx, deps = {}) {
        this.player.kills++; this.meta.totalKills++;
        EventBus.emit(Actions.ENEMY_DEATH, { enemy: { name: enemy.name, id: enemy.id }, idx });

        if (enemy.isBoss) {
            this.combat.bossDefeated = true;
        }

        const goldGained = enemy.gold || 10;
        this.addGold(goldGained, deps);
        const AudioEngine = deps.audioEngine || _getWin(deps).AudioEngine;
        AudioEngine?.playHit?.();
        this.addLog(`💀 ${enemy.name} 처치! +${goldGained}골드`, 'system');
        this.triggerItems('enemy_kill', { enemy, idx, gold: goldGained });

        // 도감에 적 등록
        if (this.meta.codex && enemy.id) {
            this.meta.codex.enemies.add(enemy.id);
        }

        const win = _getWin(deps);
        // _selectedTarget 즉시 조정 제거 (setTimeout 내부에서 일괄 처리)
        this.worldMemory[`killed_${enemy.id}`] = (this.worldMemory[`killed_${enemy.id}`] || 0) + 1;

        const doc = _getDoc(deps);
        const cardEl = doc.getElementById(`enemy_${idx}`);
        if (cardEl) {
            cardEl.classList.add('dying');
            setTimeout(() => {
                // 죽은 적을 배열에서 실제로 제거
                this.combat.enemies = this.combat.enemies.filter(e => e.hp > 0);

                // 배열 재구성 이후 selectedTarget 재계산
                const aliveCount = this.combat.enemies.length;
                if (aliveCount === 0) {
                    this._selectedTarget = null;
                } else if (this._selectedTarget === null || this._selectedTarget >= aliveCount) {
                    this._selectedTarget = 0;
                }
                // 그 외엔 기존 인덱스 유지 (배열이 앞에서 줄었을 경우 대비)

                const renderCombatEnemies = deps.renderCombatEnemies || win.renderCombatEnemies;
                if (typeof renderCombatEnemies === 'function') renderCombatEnemies();
            }, 700);
        }

        const alive = this.combat.enemies.filter(e => e.hp > 0);
        if (alive.length === 0 && !this._endCombatScheduled) {
            this._endCombatScheduled = true;
            setTimeout(() => {
                // deps 가 비어있을 경우 window globals 로 폴백
                const win = _getWin(deps);
                const endCombatDeps = {
                    ...deps,
                    showRewardScreen: deps.showRewardScreen || win.showRewardScreen,
                    showCombatSummary: deps.showCombatSummary || win.showCombatSummary,
                    switchScreen: deps.switchScreen || win.switchScreen,
                    returnToGame: deps.returnToGame || win.returnToGame,
                    updateUI: deps.updateUI || win.updateUI,
                    renderHand: deps.renderHand || win.renderHand,
                    updateChainUI: deps.updateChainUI || win.updateChainUI,
                    tooltipUI: deps.tooltipUI || win.TooltipUI,
                    hudUpdateUI: deps.hudUpdateUI || win.HudUpdateUI,
                };
                if (typeof deps.cleanupAllTooltips === 'function') deps.cleanupAllTooltips();
                if (typeof deps.renderCombatCards === 'function') deps.renderCombatCards();
                this.endCombat(endCombatDeps);
            }, 900);
        }
        const updateUI = deps.updateUI || win.updateUI;
        if (typeof updateUI === 'function') updateUI();
    },

    onPlayerDeath(deps = {}) {
        console.log('[onPlayerDeath] Called, hp:', this.player.hp);

        const heart = this.player.items.find(i => i === 'echo_heart');
        if (heart && !this._heartUsed) {
            const AudioEngine = deps.audioEngine || _getWin(deps).AudioEngine;
            if (DATA.items.echo_heart.passive(this, 'pre_death')) {
                AudioEngine?.playHeal?.();
                const updateUI = deps.updateUI || _getWin(deps).updateUI;
                if (typeof updateUI === 'function') updateUI();
                return;
            }
        }

        const win = _getWin(deps);
        const doc = _getDoc(deps);

        const AudioEngine = deps.audioEngine || win.AudioEngine;
        const ScreenShake = deps.screenShake || win.ScreenShake;
        const ParticleSystem = deps.particleSystem || win.ParticleSystem;

        AudioEngine?.playDeath?.();
        ScreenShake?.shake?.(20, 1.2);
        ParticleSystem?.deathEffect?.(win.innerWidth / 2, win.innerHeight / 2);

        // 전투 상태 해제 및 유물 트리거 (death)
        this.combat.active = false;
        this.triggerItems('death');
        doc.getElementById('combatOverlay')?.classList.remove('active');

        doc.body.style.transition = 'filter 1s';
        doc.body.style.filter = 'saturate(0.2) brightness(0.6)';
        setTimeout(() => {
            const quote = DATA.deathQuotes[Math.floor(Math.random() * DATA.deathQuotes.length)];
            const mono = doc.createElement('div');
            mono.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:1800;pointer-events:none;';
            const monoInner = doc.createElement('div');
            monoInner.style.cssText = "font-family:'Crimson Pro',serif;font-style:italic;font-size:clamp(18px,3vw,28px);color:rgba(238,240,255,0.9);text-align:center;max-width:500px;line-height:1.8;text-shadow:0 0 40px rgba(123,47,255,0.8);animation:fadeInUp 1s ease both;";
            monoInner.textContent = quote;
            mono.appendChild(monoInner);
            doc.body.appendChild(mono);
            setTimeout(() => {
                mono.remove();
                doc.body.style.filter = '';
                doc.body.style.transition = '';
                this.showDeathScreen(deps);
            }, 2500);
        }, 800);
    },

    showDeathScreen(deps = {}) {
        const win = _getWin(deps);
        const finalizeRunOutcome = deps.finalizeRunOutcome || win.finalizeRunOutcome;
        if (typeof finalizeRunOutcome === 'function') finalizeRunOutcome('defeat', { echoFragments: 3 });

        const doc = _getDoc(deps);
        const dFloor = doc.getElementById('deathFloor');
        if (dFloor) dFloor.textContent = this.currentFloor;
        const dKills = doc.getElementById('deathKills');
        if (dKills) dKills.textContent = this.player.kills;
        const dChain = doc.getElementById('deathChain');
        if (dChain) dChain.textContent = this.stats.maxChain;
        const dRun = doc.getElementById('deathRun');
        if (dRun) dRun.textContent = this.meta.runCount - 1;
        const dQuote = doc.getElementById('deathQuote');
        if (dQuote) dQuote.textContent = DATA.deathQuotes[Math.floor(Math.random() * DATA.deathQuotes.length)];

        const wmEl = doc.getElementById('deathWorldMemory');
        if (wmEl) {
            const wm = this.meta.worldMemory;
            const hints = [];
            if ((wm.savedMerchant || 0) > 0) hints.push(`🤝 상인을 구함 ×${wm.savedMerchant}`);
            if (wm.stoleFromMerchant) hints.push('⚠️ 상인에게서 약탈함');
            if (wm['killed_ancient_echo']) hints.push(`💀 태고의 잔향 처치 ×${wm['killed_ancient_echo']}`);
            if (wm['killed_void_herald']) hints.push(`🌌 허공의 사도 처치 ×${wm['killed_void_herald']}`);
            if (wm['killed_memory_sovereign']) hints.push(`👑 기억의 군주 처치 ×${wm['killed_memory_sovereign']}`);
            const storyCount = this.meta.storyPieces.length;
            if (storyCount > 0) hints.push(`📖 스토리 ${storyCount}/10 해금`);
            wmEl.textContent = '';
            if (hints.length) {
                const title = doc.createElement('div');
                title.style.cssText = "font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.3em;color:var(--text-dim);width:100%;text-align:center;margin-bottom:6px;";
                title.textContent = '◈ 세계의 기억 ◈';
                wmEl.appendChild(title);
                hints.forEach(h => {
                    const badge = doc.createElement('span');
                    badge.className = 'wm-badge';
                    badge.textContent = h;
                    wmEl.appendChild(badge);
                });
            }
        }

        this.generateFragmentChoices(deps);
        const switchScreen = deps.switchScreen || win.switchScreen;
        if (typeof switchScreen === 'function') switchScreen('death');
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
                    const selectFragment = deps.selectFragment || win.selectFragment || window.selectFragment;
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
