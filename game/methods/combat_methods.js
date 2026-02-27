import { AudioEngine } from '../../engine/audio.js';
import { ParticleSystem } from '../../engine/particles.js';
import { ScreenShake } from '../../engine/screenshake.js';
import { HitStop } from '../../engine/hitstop.js';
import { DATA } from '../../data/game_data.js';
import { DifficultyScaler } from '../difficulty_scaler.js';
import { RunRules, getRegionData, getBaseRegionIndex, getRegionCount } from '../run_rules.js';

import { Logger } from '../utils/logger.js';

const _getDoc = (deps) => deps?.doc || document;
const _getWin = (deps) => deps?.win || window;

export const CombatMethods = {
    dealDamage(amount, targetIdx = null, noChain = false, deps = {}) {
        const doc = _getDoc(deps);
        const win = _getWin(deps);

        Logger.debug('[dealDamage] Called with targetIdx:', targetIdx, '_selectedTarget:', this._selectedTarget);
        Logger.debug('[dealDamage] Enemies:', this.combat.enemies.map(e => ({ name: e.name, hp: e.hp })));

        if (targetIdx === null) {
            const sel = this._selectedTarget;
            if (sel !== null && sel !== undefined && this.combat.enemies[sel]?.hp > 0) {
                targetIdx = sel;
                Logger.debug('[dealDamage] Using _selectedTarget:', targetIdx);
            } else {
                targetIdx = this.combat.enemies.findIndex(e => e.hp > 0);
                Logger.debug('[dealDamage] Using first alive enemy:', targetIdx);
                if (targetIdx < 0) return 0;
            }
        }
        const enemy = this.combat.enemies[targetIdx];
        if (!enemy || enemy.hp <= 0) return 0;

        let dmg = amount;
        const mom = this.getBuff('momentum');
        if (mom) dmg += mom.dmgBonus || 0;
        const sha = this.getBuff('shadow_atk');
        if (sha) { dmg += sha.dmgBonus || 0; delete this.player.buffs['shadow_atk']; }
        if (this.getBuff('vanish')) {
            dmg = Math.floor(dmg * 2);
            delete this.player.buffs['vanish'];
            this.addLog('💥 크리티컬!', 'echo');
        }
        if (enemy.statusEffects?.immune > 0) {
            this.addLog(`🏛️ ${enemy.name}은(는) 무적 상태!`, 'echo');
            return 0;
        }
        if (enemy.statusEffects?.dodge > 0) {
            this.addLog(`💨 ${enemy.name}이(가) 공격을 강회피했습니다!`, 'system');
            enemy.statusEffects.dodge--;
            if (enemy.statusEffects.dodge <= 0) delete enemy.statusEffects.dodge;
            return 0;
        }
        if ((this.getBuff('weakened')?.stacks || 0) > 0) {
            dmg = Math.max(0, Math.floor(dmg * 0.5));
        }

        const itemScaled = this.triggerItems('deal_damage', dmg);
        if (typeof itemScaled === 'number' && Number.isFinite(itemScaled)) {
            dmg = Math.max(0, Math.floor(itemScaled));
        }
        if (this.player.echoChain > 0) {
            const chainScaled = this.triggerItems('chain_dmg', dmg);
            if (typeof chainScaled === 'number' && Number.isFinite(chainScaled)) {
                dmg = Math.max(0, Math.floor(chainScaled));
            }
        }

        if (enemy.shield > 0) {
            const blocked = Math.min(enemy.shield, dmg);
            enemy.shield -= blocked;
            dmg -= blocked;
            if (blocked > 0) this.addLog(`🛡️ ${enemy.name} 방어막 ${blocked} 흡수`, 'system');
        }

        HitStop.trigger(8);
        const prevHp = enemy.hp;
        enemy.hp = Math.max(0, enemy.hp - dmg);
        this.stats.damageDealt += dmg;

        // 가시 반격 처리
        if (enemy.statusEffects?.thorns > 0) {
            const thornsAmt = enemy.statusEffects.thorns;
            this.addLog?.(`🌵 ${enemy.name}: 가시 반격!`, 'damage');
            this.takeDamage(thornsAmt, deps);
        }

        const ex = win.innerWidth / 2 + (targetIdx - (this.combat.enemies.length / 2 - 0.5)) * 180;
        ParticleSystem.hitEffect(ex, 250, dmg > 20);

        const audioEngine = deps.audioEngine || win.AudioEngine;
        const isCrit = dmg > prevHp * 0.3 || (this.getBuff && this._lastCrit);
        const hudOverlay = doc.getElementById('hudOverlay');
        if (isCrit || dmg > 25) {
            audioEngine?.playCritical?.();
            const cf = doc.createElement('div');
            cf.className = 'crit-flash-overlay';
            hudOverlay?.appendChild(cf);
            setTimeout(() => cf.remove(), 450);
        } else if (dmg > 12) {
            audioEngine?.playHeavyHit?.();
            const hf = doc.createElement('div');
            hf.className = 'heavy-hit-overlay';
            hudOverlay?.appendChild(hf);
            setTimeout(() => hf.remove(), 500);
        } else {
            audioEngine?.playHit?.();
        }

        const enemyCard = doc.getElementById(`enemy_${targetIdx}`);
        if (enemyCard) {
            enemyCard.classList.remove('enemy-hit-anim');
            void enemyCard.offsetWidth;
            enemyCard.classList.add('enemy-hit-anim');
            setTimeout(() => enemyCard.classList.remove('enemy-hit-anim'), 280);
            const flashEl = doc.createElement('div');
            flashEl.className = 'enemy-dmg-flash';
            enemyCard.style.position = 'relative';
            enemyCard.appendChild(flashEl);
            setTimeout(() => flashEl.remove(), 350);
        }

        const screenShake = deps.screenShake || win.ScreenShake || ScreenShake;
        screenShake?.shake?.(dmg > 20 ? 6 : 3, 0.2);

        if (!noChain) {
            this.player.echoChain++;
            // 전투 중에는 Echo 게이지만 즉시 갱신 (전체 UI 갱신은 playCard 에서)
            this.addEcho(10, true);
            const updateChainUI = deps.updateChainUI || win.updateChainUI;
            if (typeof updateChainUI === 'function') updateChainUI();
        }

        this.addLog(`⚔️ ${enemy.name}에게 ${dmg} 피해!`, 'damage');
        const showDmgPopup = deps.showDmgPopup || win.showDmgPopup;
        if (typeof showDmgPopup === 'function') showDmgPopup(dmg, ex, 250);

        Logger.debug('[dealDamage] Before HP update:', enemy.hp, 'TargetIdx:', targetIdx);
        Logger.debug('[dealDamage] DOM elements check:', {
            fill: doc.getElementById(`enemy_hpfill_${targetIdx}`) ? 'found' : 'not found',
            txt: doc.getElementById(`enemy_hptext_${targetIdx}`) ? 'found' : 'not found',
            card: doc.getElementById(`enemy_${targetIdx}`) ? 'found' : 'not found'
        });

        // 적 HP UI 즉시 갱신 - DOM 직접 업데이트
        const fillEl = doc.getElementById(`enemy_hpfill_${targetIdx}`);
        const txtEl = doc.getElementById(`enemy_hptext_${targetIdx}`);

        if (fillEl) {
            const hpPct = Math.max(0, (enemy.hp / enemy.maxHp) * 100);
            fillEl.style.width = hpPct + '%';
            Logger.debug('[dealDamage] HP fill updated to:', hpPct + '%');
        }
        if (txtEl) {
            txtEl.textContent = `${enemy.hp} / ${enemy.maxHp}${enemy.shield ? ` 🛡️${enemy.shield}` : ''}`;
            Logger.debug('[dealDamage] HP text updated to:', txtEl.textContent);
        }


        this.markDirty('enemies');

        if (enemy.hp <= 0) this.onEnemyDeath(enemy, targetIdx, deps);

        // UI Sync (GameAPI가 담당하지 않는 즉각적인 UI 반영용)
        const hudUpdateUI = deps.hudUpdateUI || win.HudUpdateUI;
        hudUpdateUI?.updateEnemyHpUI?.(targetIdx, enemy);

        return dmg;
    },

    dealDamageAll(amount, noChain = false, deps = {}) {
        const alive = this.combat.enemies.map((_, i) => i).filter(i => this.combat.enemies[i].hp > 0);
        alive.forEach((i, idx) => {
            // If the whole AOE is marked noChain, pass it.
            // Otherwise, subsequents should be noChain anyway to avoid multiple chain increments if that's the logic.
            this.dealDamage(amount, i, noChain || (idx < alive.length - 1), deps);
        });
    },

    addShield(amount, deps = {}) {
        let actual = amount;
        if (this.runConfig?.curse === 'fatigue' || this.meta?.runConfig?.curse === 'fatigue') {
            actual = Math.max(0, amount - 10);
            if (actual < amount) this.addLog('📉 피로의 저주: 방어막 획득 감소 (-10)', 'system');
        }
        this.player.shield += actual;
        this.addLog(`🛡️ 방어막 +${actual}`, 'system');

        this.markDirty('hud');
        const hudUpdateUI = deps.hudUpdateUI || _getWin(deps).HudUpdateUI;
        hudUpdateUI?.updatePlayerStats?.(this);
    },

    takeDamage(amount, deps = {}) {
        if (amount <= 0) return;

        if (this.getBuff?.('immune')) {
            this.addLog?.('🏛️ 면역으로 피해 무효!', 'echo');
            return;
        }

        let dmg = amount;
        if ((this.getBuff?.('vulnerable')?.stacks || 0) > 0) {
            dmg = Math.floor(dmg * 1.5);
            this.addLog?.('💢 취약: 피해량 증가!', 'damage');
        }

        if (this.player.shield > 0) {
            const block = Math.min(this.player.shield, dmg);
            this.player.shield -= block;
            dmg -= block;
            if (block > 0) this.addLog?.(`🛡️ 방어막 ${block} 흡수`, 'system');
        }

        const itemScaled = this.triggerItems?.('damage_taken', dmg);
        if (itemScaled === true) {
            dmg = 0;
            this.addLog?.('🛡️ 피해 무효!', 'echo');
        } else if (typeof itemScaled === 'number' && Number.isFinite(itemScaled)) {
            dmg = Math.max(0, Math.floor(itemScaled));
        }

        if (dmg > 0) {
            this.player.hp = Math.max(0, this.player.hp - dmg);
            this.stats.damageTaken += dmg;
            this.addLog?.(`💔 ${dmg} 피해 받음`, 'damage');

            const win = _getWin(deps);
            const screenShake = deps.screenShake || win.ScreenShake || ScreenShake;
            screenShake?.shake?.(8, 0.4);
            const audioEngine = deps.audioEngine || win.AudioEngine || AudioEngine;
            audioEngine?.playPlayerHit?.();
        }

        this.markDirty('hud');
        const hudUpdateUI = deps.hudUpdateUI || _getWin(deps).HudUpdateUI;
        hudUpdateUI?.updatePlayerStats?.(this);
        if (this.player.hp <= 0) this.onPlayerDeath?.(deps);
    },

    applyEnemyStatus(status, duration, targetIdx = null, deps = {}) {
        if (targetIdx === null) {
            const sel = this._selectedTarget;
            if (sel !== null && sel !== undefined && this.combat.enemies[sel]?.hp > 0) {
                targetIdx = sel;
            } else {
                targetIdx = this.combat.enemies.findIndex(e => e.hp > 0);
                if (targetIdx < 0) return;
            }
        }
        const enemy = this.combat.enemies[targetIdx];
        if (!enemy) return;
        if (!enemy.statusEffects) enemy.statusEffects = {};
        enemy.statusEffects[status] = duration;
        this.addLog(`💫 ${enemy.name}: ${status} ${duration}턴`, 'echo');

        Logger.debug('[applyEnemyStatus] Applied', status, 'for', duration, 'turns to', enemy.name);
        Logger.debug('[applyEnemyStatus] Enemy statusEffects:', enemy.statusEffects);

        // 상태 이상 UI 즉시 갱신 - 전체 렌더링 수행 (카드 애니메이션 완료 후)
        const win = _getWin(deps);
        setTimeout(() => {
            const renderCombatEnemies = deps.renderCombatEnemies || win.renderCombatEnemies;
            if (typeof renderCombatEnemies === 'function') {
                Logger.debug('[applyEnemyStatus] Calling renderCombatEnemies with forceFullRender');
                renderCombatEnemies(true);
            }
            const updateUI = deps.updateUI || win.updateUI;
            if (typeof updateUI === 'function') {
                Logger.debug('[applyEnemyStatus] Calling updateUI');
                updateUI();
            }
        }, 300); // 카드 효과 애니메이션 완료 대기 (300ms)
    },

    getEnemyIntent(targetIdx = null) {
        const idx = targetIdx !== null ? targetIdx : (this._selectedTarget !== null ? this._selectedTarget : 0);
        const enemy = this.combat.enemies[idx];
        if (!enemy || enemy.hp <= 0) return 0;
        return enemy.ai(this.combat.turn + 1)?.dmg || 0;
    },

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
        const goldGained = enemy.gold || 10;
        this.addGold(goldGained, deps);
        audioEngine?.playHit?.();
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
                    renderCombatCards: deps.renderCombatCards || win.renderCombatCards,
                    updateChainUI: deps.updateChainUI || win.updateChainUI,
                    cleanupAllTooltips: deps.cleanupAllTooltips || win.CombatUI?.cleanupAllTooltips,
                    tooltipUI: deps.tooltipUI || win.TooltipUI,
                    hudUpdateUI: deps.hudUpdateUI || win.HudUpdateUI,
                    showCombatSummary: deps.showCombatSummary || win.showCombatSummary,
                };
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
            if (DATA.items.echo_heart.passive(this, 'pre_death')) {
                audioEngine?.playHeal?.();
                const updateUI = deps.updateUI || _getWin(deps).updateUI;
                if (typeof updateUI === 'function') updateUI();
                return;
            }
        }

        const win = _getWin(deps);
        const doc = _getDoc(deps);

        audioEngine?.playDeath?.();
        ScreenShake.shake(20, 1.2);
        ParticleSystem.deathEffect(win.innerWidth / 2, win.innerHeight / 2);

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

    async endCombat(deps = {}) {
        if (!this.combat.active) return;
        if (this._endCombatRunning) return;
        this._endCombatRunning = true;
        const win = _getWin(deps);
        const doc = _getDoc(deps);

        try {
            this.combat.active = false;
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

            this.player.graveyard.push(...this.player.hand);
            this.player.hand = [];
            this.player.shield = 0;
            this.player.echoChain = 0;
            this.player.energy = this.player.maxEnergy;
            this.player.buffs = {};
            this.player.costDiscount = 0;
            this.player._nextCardDiscount = 0;
            this.player.zeroCost = false;
            this.player._freeCardUses = 0;
            this.player._cascadeCards = new Map();
            this.player.silenceGauge = 0;
            this._maskCount = 0;
            this._batteryUsedTurn = false;
            this._temporalTurn = 0;
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

            const isBoss = this.combat.enemies.some(e => e.isBoss);
            const isLastRegion = getBaseRegionIndex(this.currentRegion) === Math.max(0, getRegionCount() - 1);

            audioEngine?.playItemGet?.();
            const combatDmgDealt = this.stats.damageDealt - (this._combatStartDmg || 0);
            const combatDmgTaken = this.stats.damageTaken - (this._combatStartTaken || 0);
            console.log('[endCombat] Showing combat summary:', combatDmgDealt, combatDmgTaken);
            const showCombatSummary = deps.showCombatSummary || win.showCombatSummary;
            if (typeof showCombatSummary === 'function') showCombatSummary(combatDmgDealt, combatDmgTaken, this.player.kills - (this._combatStartKills || 0));

            if (isBoss) {
                this._bossRewardPending = true;
                this._bossLastRegion = isLastRegion;
                console.log('[endCombat] Boss reward pending:', isLastRegion);
            }
            if (isBoss && isLastRegion && RunRules.isEndless(this)) {
                setTimeout(() => {
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
            console.log('[endCombat] Waiting 1 second before reward screen...');
            await new Promise(r => setTimeout(r, 1000));
            console.log('[endCombat] Calling showRewardScreen, isBoss:', isBoss);
            const showRewardScreen = deps.showRewardScreen || win.showRewardScreen;
            if (typeof showRewardScreen === 'function') {
                showRewardScreen(isBoss);
                console.log('[endCombat] showRewardScreen called successfully');
            } else {
                console.error('[endCombat] showRewardScreen is not available');
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
        if (chain > 0) audioEngine?.playChain?.(chain);
        if (chain >= 5) this.triggerResonanceBurst(deps);
    },

    triggerResonanceBurst(deps = {}) {
        this.player.echoChain = 0;
        this.drainEcho(50);
        audioEngine?.playResonanceBurst?.();
        const win = _getWin(deps);
        ScreenShake.shake(15, 0.8);
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
        ParticleSystem.burstEffect(win.innerWidth / 2, win.innerHeight / 3);
        const showEchoBurstOverlay = deps.showEchoBurstOverlay || win.showEchoBurstOverlay;
        if (typeof showEchoBurstOverlay === 'function') showEchoBurstOverlay();
        this.addLog(`🌟 RESONANCE BURST! 전체 ${burstDmg} 피해!`, 'echo');
        this.stats.maxChain = Math.max(this.stats.maxChain, 5);
        const updateChainUI = deps.updateChainUI || win.updateChainUI;
        if (typeof updateChainUI === 'function') updateChainUI(0);
        const renderCombatEnemies = deps.renderCombatEnemies || win.renderCombatEnemies;
        if (typeof renderCombatEnemies === 'function') renderCombatEnemies();
        const showChainAnnounce = deps.showChainAnnounce || win.showChainAnnounce;
        if (typeof showChainAnnounce === 'function') showChainAnnounce('RESONANCE BURST!!');
    },
};
