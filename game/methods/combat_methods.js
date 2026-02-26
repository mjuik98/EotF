import { AudioEngine } from '../../engine/audio.js';
import { ParticleSystem } from '../../engine/particles.js';
import { ScreenShake } from '../../engine/screenshake.js';
import { HitStop } from '../../engine/hitstop.js';
import { DATA } from '../../data/game_data.js';
import { DifficultyScaler } from '../difficulty_scaler.js';
import { RunRules, getRegionData, getBaseRegionIndex, getRegionCount } from '../run_rules.js';

import { Logger } from '../utils/logger.js';

export const CombatMethods = {
    dealDamage(amount, targetIdx = null, noChain = false) {
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

        const ex = window.innerWidth / 2 + (targetIdx - (this.combat.enemies.length / 2 - 0.5)) * 180;
        ParticleSystem.hitEffect(ex, 250, dmg > 20);

        const isCrit = dmg > prevHp * 0.3 || (this.getBuff && this._lastCrit);
        if (isCrit || dmg > 25) {
            AudioEngine.playCritical();
            const cf = document.createElement('div');
            cf.className = 'crit-flash-overlay';
            document.getElementById('hudOverlay')?.appendChild(cf);
            setTimeout(() => cf.remove(), 450);
        } else if (dmg > 12) {
            AudioEngine.playHeavyHit();
            const hf = document.createElement('div');
            hf.className = 'heavy-hit-overlay';
            document.getElementById('hudOverlay')?.appendChild(hf);
            setTimeout(() => hf.remove(), 500);
        } else {
            AudioEngine.playHit();
        }

        const enemyCard = document.getElementById(`enemy_${targetIdx}`);
        if (enemyCard) {
            enemyCard.classList.remove('enemy-hit-anim');
            void enemyCard.offsetWidth;
            enemyCard.classList.add('enemy-hit-anim');
            setTimeout(() => enemyCard.classList.remove('enemy-hit-anim'), 280);
            const flashEl = document.createElement('div');
            flashEl.className = 'enemy-dmg-flash';
            enemyCard.style.position = 'relative';
            enemyCard.appendChild(flashEl);
            setTimeout(() => flashEl.remove(), 350);
        }

        ScreenShake.shake(dmg > 20 ? 6 : 3, 0.2);

        if (!noChain) {
            this.player.echoChain++;
            // 전투 중에는 Echo 게이지만 즉시 갱신 (전체 UI 갱신은 playCard 에서)
            this.addEcho(10, true);
            if (typeof window.updateChainUI === 'function') window.updateChainUI();
        }

        this.addLog(`⚔️ ${enemy.name}에게 ${dmg} 피해!`, 'damage');
        if (typeof window.showDmgPopup === 'function') window.showDmgPopup(dmg, ex, 250);

        Logger.debug('[dealDamage] Before HP update:', enemy.hp, 'TargetIdx:', targetIdx);
        Logger.debug('[dealDamage] DOM elements check:', {
            fill: document.getElementById(`enemy_hpfill_${targetIdx}`) ? 'found' : 'not found',
            txt: document.getElementById(`enemy_hptext_${targetIdx}`) ? 'found' : 'not found',
            card: document.getElementById(`enemy_${targetIdx}`) ? 'found' : 'not found'
        });

        // 적 HP UI 즉시 갱신 - DOM 직접 업데이트
        const fillEl = document.getElementById(`enemy_hpfill_${targetIdx}`);
        const txtEl = document.getElementById(`enemy_hptext_${targetIdx}`);
        const cardEl = document.getElementById(`enemy_${targetIdx}`);

        if (fillEl) {
            const hpPct = Math.max(0, (enemy.hp / enemy.maxHp) * 100);
            fillEl.style.width = hpPct + '%';
            Logger.debug('[dealDamage] HP fill updated to:', hpPct + '%');
        }
        if (txtEl) {
            txtEl.textContent = `${enemy.hp} / ${enemy.maxHp}${enemy.shield ? ` 🛡️${enemy.shield}` : ''}`;
            Logger.debug('[dealDamage] HP text updated to:', txtEl.textContent);
        }

        if (typeof window.updateEnemyHpUI === 'function') {
            window.updateEnemyHpUI(targetIdx, enemy);
            Logger.debug('[dealDamage] updateEnemyHpUI called');
        } else {
            Logger.warn('[dealDamage] updateEnemyHpUI not available');
        }

        this.markDirty('enemies');

        if (enemy.hp <= 0) this.onEnemyDeath(enemy, targetIdx);

        // UI Sync (GameAPI가 담당하지 않는 즉각적인 UI 반영용)
        window.HudUpdateUI?.updateEnemyHpUI?.(targetIdx, enemy);

        return dmg;
    },

    dealDamageAll(amount, noChain = false) {
        const alive = this.combat.enemies.map((_, i) => i).filter(i => this.combat.enemies[i].hp > 0);
        alive.forEach((i, idx) => {
            // If the whole AOE is marked noChain, pass it.
            // Otherwise, subsequents should be noChain anyway to avoid multiple chain increments if that's the logic.
            // But here we want to ensure Echo skills can pass 'true' to avoid ANY gain.
            this.dealDamage(amount, i, noChain || (idx < alive.length - 1));
        });
    },

    addShield(amount) {
        let actual = amount;
        if (this.runConfig?.curse === 'fatigue' || this.meta?.runConfig?.curse === 'fatigue') {
            actual = Math.max(0, amount - 10);
            if (actual < amount) this.addLog('📉 피로의 저주: 방어막 획득 감소 (-10)', 'system');
        }
        this.player.shield += actual;
        this.addLog(`🛡️ 방어막 +${actual}`, 'system');

        this.markDirty('hud');
        window.HudUpdateUI?.updatePlayerStats?.(this);
    },

    takeDamage(amount) {
        if (amount <= 0) return;

        if (this.getBuff?.('immune')) {
            this.addLog?.('🏛️ 면역으로 피해 무효!', 'echo');
            return;
        }

        let dmg = amount;
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
            window.ScreenShake?.shake(8, 0.4);
            window.AudioEngine?.playPlayerHit();
        }

        this.markDirty('hud');
        window.HudUpdateUI?.updatePlayerStats?.(this);
        if (this.player.hp <= 0) this.onPlayerDeath?.();
    },

    applyEnemyStatus(status, duration, targetIdx = null) {
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
        setTimeout(() => {
            if (typeof window.renderCombatEnemies === 'function') {
                Logger.debug('[applyEnemyStatus] Calling renderCombatEnemies with forceFullRender');
                window.renderCombatEnemies(true);
            }
            if (typeof window.updateUI === 'function') {
                Logger.debug('[applyEnemyStatus] Calling updateUI');
                window.updateUI();
            }
        }, 300); // 카드 효과 애니메이션 완료 대기 (300ms)
    },

    getEnemyIntent(targetIdx = null) {
        const idx = targetIdx !== null ? targetIdx : (this._selectedTarget !== null ? this._selectedTarget : 0);
        const enemy = this.combat.enemies[idx];
        if (!enemy || enemy.hp <= 0) return 0;
        return enemy.ai(this.combat.turn + 1)?.dmg || 0;
    },

    spawnEnemy() {
        const region = getRegionData(this.currentRegion, this);
        if (!region) return;

        const pool = (this.currentFloor <= 1 && region.strongEnemies) ? region.enemies : [...region.enemies, ...(region.strongEnemies || [])];
        const eKey = pool[Math.floor(Math.random() * pool.length)];
        const eData = DATA.enemies[eKey];
        if (eData && this.combat.enemies.length < 3) {
            this.combat.enemies.push(DifficultyScaler.scaleEnemy({ ...eData, statusEffects: {} }, this, undefined, undefined, this.currentFloor));
            if (typeof window.renderCombatEnemies === 'function') {
                window.renderCombatEnemies();
            } else if (typeof renderCombatEnemies === 'function') {
                renderCombatEnemies();
            }
            if (this.combat.playerTurn) {
                if (typeof window.HudUpdateUI !== 'undefined' && typeof window.HudUpdateUI.enableActionButtons === 'function') {
                    window.HudUpdateUI.enableActionButtons();
                } else {
                    document.querySelectorAll('.action-btn').forEach(b => { b.disabled = false; });
                }
            }
        }
    },

    onEnemyDeath(enemy, idx) {
        this.player.kills++; this.meta.totalKills++;
        const goldGained = enemy.gold || 10;
        this.addGold(goldGained);
        AudioEngine.playHit();
        this.addLog(`💀 ${enemy.name} 처치! +${goldGained}골드`, 'system');
        this.triggerItems('enemy_kill', { enemy, idx, gold: goldGained });

        // 도감에 적 등록
        if (this.meta.codex && enemy.id) {
            this.meta.codex.enemies.add(enemy.id);
        }

        if (this._selectedTarget === idx) {
            const nextAlive = this.combat.enemies.findIndex((e, i) => i !== idx && e.hp > 0);
            this._selectedTarget = nextAlive >= 0 ? nextAlive : null;
            setTimeout(() => {
                if (typeof window.renderCombatEnemies === 'function') window.renderCombatEnemies();
            }, 50);
        }
        this.worldMemory[`killed_${enemy.id}`] = (this.worldMemory[`killed_${enemy.id}`] || 0) + 1;
        const cardEl = document.getElementById(`enemy_${idx}`);
        if (cardEl) {
            cardEl.classList.add('dying');
            setTimeout(() => { cardEl.style.display = 'none'; }, 700);
        }
        const alive = this.combat.enemies.filter(e => e.hp > 0);
        if (alive.length === 0 && !this._endCombatScheduled) {
            this._endCombatScheduled = true;
            setTimeout(() => this.endCombat(), 900);
        }
        if (typeof window.updateUI === 'function') window.updateUI();
    },

    onPlayerDeath() {
        console.log('[onPlayerDeath] Called, hp:', this.player.hp);

        const heart = this.player.items.find(i => i === 'echo_heart');
        if (heart && !this._heartUsed) {
            if (DATA.items.echo_heart.passive(this, 'pre_death')) {
                AudioEngine.playHeal();
                if (typeof window.updateUI === 'function') window.updateUI();
                return;
            }
        }
        AudioEngine.playDeath();
        ScreenShake.shake(20, 1.2);
        ParticleSystem.deathEffect(window.innerWidth / 2, window.innerHeight / 2);

        // 전투 상태 해제
        this.combat.active = false;
        document.getElementById('combatOverlay')?.classList.remove('active');

        document.body.style.transition = 'filter 1s';
        document.body.style.filter = 'saturate(0.2) brightness(0.6)';
        setTimeout(() => {
            const quote = DATA.deathQuotes[Math.floor(Math.random() * DATA.deathQuotes.length)];
            const mono = document.createElement('div');
            mono.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:1800;pointer-events:none;';
            const monoInner = document.createElement('div');
            monoInner.style.cssText = "font-family:'Crimson Pro',serif;font-style:italic;font-size:clamp(18px,3vw,28px);color:rgba(238,240,255,0.9);text-align:center;max-width:500px;line-height:1.8;text-shadow:0 0 40px rgba(123,47,255,0.8);animation:fadeInUp 1s ease both;";
            monoInner.textContent = quote;
            mono.appendChild(monoInner);
            document.body.appendChild(mono);
            setTimeout(() => {
                mono.remove();
                document.body.style.filter = '';
                document.body.style.transition = '';
                this.showDeathScreen();
            }, 2500);
        }, 800);
    },

    showDeathScreen() {
        if (typeof window.finalizeRunOutcome === 'function') window.finalizeRunOutcome('defeat', { echoFragments: 3 });

        const dFloor = document.getElementById('deathFloor');
        if (dFloor) dFloor.textContent = this.currentFloor;
        const dKills = document.getElementById('deathKills');
        if (dKills) dKills.textContent = this.player.kills;
        const dChain = document.getElementById('deathChain');
        if (dChain) dChain.textContent = this.stats.maxChain;
        const dRun = document.getElementById('deathRun');
        if (dRun) dRun.textContent = this.meta.runCount - 1;
        const dQuote = document.getElementById('deathQuote');
        if (dQuote) dQuote.textContent = DATA.deathQuotes[Math.floor(Math.random() * DATA.deathQuotes.length)];

        const wmEl = document.getElementById('deathWorldMemory');
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
                const title = document.createElement('div');
                title.style.cssText = "font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.3em;color:var(--text-dim);width:100%;text-align:center;margin-bottom:6px;";
                title.textContent = '◈ 세계의 기억 ◈';
                wmEl.appendChild(title);
                hints.forEach(h => {
                    const badge = document.createElement('span');
                    badge.className = 'wm-badge';
                    badge.textContent = h;
                    wmEl.appendChild(badge);
                });
            }
        }

        this.generateFragmentChoices();
        if (typeof window.switchScreen === 'function') window.switchScreen('death');
    },

    generateFragmentChoices() {
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
        const fragList = document.getElementById('fragmentChoices');
        if (fragList) {
            fragList.textContent = '';
            choices.forEach(c => {
                const btn = document.createElement('div');
                btn.className = 'fragment-btn';
                btn.onclick = () => window.selectFragment(c.effect);

                const icon = document.createElement('div');
                icon.className = 'fragment-icon';
                icon.textContent = c.icon;

                const name = document.createElement('div');
                name.className = 'fragment-name';
                name.textContent = c.name;

                const desc = document.createElement('div');
                desc.className = 'fragment-desc';
                desc.textContent = c.desc;

                btn.append(icon, name, desc);
                fragList.appendChild(btn);
            });
        }
    },

    async endCombat() {
        if (!this.combat.active) return;
        if (this._endCombatRunning) return;
        this._endCombatRunning = true;
        try {
            this.combat.active = false;
            if (typeof window.TooltipUI !== 'undefined') {
                window.TooltipUI.hideTooltip({ doc: document });
            }
            document.getElementById('cardTooltip')?.classList.remove('visible');
            const combatHandCards = document.getElementById('combatHandCards');
            if (combatHandCards) combatHandCards.textContent = '';
            if (typeof window.HudUpdateUI !== 'undefined' && typeof window.HudUpdateUI.resetCombatUI === 'function') {
                window.HudUpdateUI.resetCombatUI();
            } else {
                document.getElementById('combatOverlay')?.classList.remove('active');
                document.getElementById('noiseGaugeOverlay')?.remove();
                const endZone = document.getElementById('enemyZone');
                if (endZone) endZone.textContent = '';
            }

            this.player.graveyard.push(...this.player.hand);
            this.player.hand = [];
            this.player.shield = 0;
            this.player.echoChain = 0;
            this.player.energy = this.player.maxEnergy;
            this.player.buffs = {};
            this.player.costDiscount = 0;
            this.player.zeroCost = false;
            this.player._freeCardUses = 0;
            this.player._cascadeCards = new Map();
            this.player.silenceGauge = 0;
            this._maskCount = 0;
            this._batteryUsedTurn = false;
            this._temporalTurn = 0;
            this.triggerItems('combat_end');
            this.triggerItems('void_shard');

            if (typeof window.updateChainUI === 'function') window.updateChainUI(0);
            if (typeof window.renderHand === 'function') window.renderHand();
            if (typeof window.renderCombatCards === 'function') window.renderCombatCards();
            if (typeof window.updateUI === 'function') window.updateUI();

            const isBoss = this.combat.enemies.some(e => e.isBoss);
            const isLastRegion = getBaseRegionIndex(this.currentRegion) === Math.max(0, getRegionCount() - 1);

            AudioEngine.playItemGet();
            const combatDmgDealt = this.stats.damageDealt - (this._combatStartDmg || 0);
            const combatDmgTaken = this.stats.damageTaken - (this._combatStartTaken || 0);
            console.log('[endCombat] Showing combat summary:', combatDmgDealt, combatDmgTaken);
            if (typeof window.showCombatSummary === 'function') window.showCombatSummary(combatDmgDealt, combatDmgTaken, this.player.kills - (this._combatStartKills || 0));

            if (isBoss) {
                this._bossRewardPending = true;
                this._bossLastRegion = isLastRegion;
                console.log('[endCombat] Boss reward pending:', isLastRegion);
            }
            if (isBoss && isLastRegion && RunRules.isEndless(this)) {
                setTimeout(() => {
                    if (typeof window.returnToGame === 'function') window.returnToGame(true);
                }, 300);
                return;
            }
            if (typeof window.HudUpdateUI !== 'undefined' && typeof window.HudUpdateUI.hideNodeOverlay === 'function') {
                window.HudUpdateUI.hideNodeOverlay();
            } else {
                const nodeOverlay = document.getElementById('nodeCardOverlay');
                if (nodeOverlay) nodeOverlay.style.display = 'none';
            }
            console.log('[endCombat] Waiting 1 second before reward screen...');
            await new Promise(r => setTimeout(r, 1000));
            console.log('[endCombat] Calling showRewardScreen, isBoss:', isBoss);
            if (typeof window.showRewardScreen === 'function') {
                window.showRewardScreen(isBoss);
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

    updateChainDisplay() {
        const chain = this.player.echoChain;
        this.stats.maxChain = Math.max(this.stats.maxChain, chain);
        if (typeof window.updateChainUI === 'function') window.updateChainUI(chain);
        if (chain > 0) AudioEngine.playChain(chain);
        if (chain >= 5) this.triggerResonanceBurst();
    },

    triggerResonanceBurst() {
        this.player.echoChain = 0;
        this.drainEcho(50);
        AudioEngine.playResonanceBurst();
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
                if (typeof window.showDmgPopup === 'function') window.showDmgPopup(burstDmg, window.innerWidth / 2 + (i - 0.5) * 200, 200, '#00ffcc');
                if (e.hp <= 0) this.onEnemyDeath(e, i);
            }
        });
        ParticleSystem.burstEffect(window.innerWidth / 2, window.innerHeight / 3);
        if (typeof window.showEchoBurstOverlay === 'function') window.showEchoBurstOverlay();
        this.addLog(`🌟 RESONANCE BURST! 전체 ${burstDmg} 피해!`, 'echo');
        this.stats.maxChain = Math.max(this.stats.maxChain, 5);
        if (typeof window.updateChainUI === 'function') window.updateChainUI(0);
        if (typeof window.renderCombatEnemies === 'function') window.renderCombatEnemies();
        if (typeof window.showChainAnnounce === 'function') window.showChainAnnounce('RESONANCE BURST!!');
    },
};
