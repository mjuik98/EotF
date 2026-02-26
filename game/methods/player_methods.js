import { AudioEngine } from '../../engine/audio.js';
import { ParticleSystem } from '../../engine/particles.js';
import { RunRules, getBaseRegionIndex, getRegionCount } from '../run_rules.js';

export const PlayerMethods = {
    addEcho(amount, skipFullUI = false) {
        const oldEcho = this.player.echo;
        this.player.echo = Math.min(this.player.maxEcho, this.player.echo + amount);
        const newEcho = this.player.echo;

        // 즉시 HUD 갱신 (에코 텍스트만 빠르게) - 모든 Echo 관련 요소 갱신
        const echoTextEl = document.getElementById('echoText');
        const hudEchoTextEl = document.getElementById('hudEchoText');
        const hudEchoMiniEl = document.getElementById('hudEchoBarMini');
        const echoBar = document.getElementById('echoBar');
        const echoBtn = document.getElementById('useEchoSkillBtn');

        const echoValue = Math.floor(newEcho);
        const echoPct = (newEcho / this.player.maxEcho) * 100;

        if (echoTextEl) echoTextEl.textContent = `${echoValue} / ${this.player.maxEcho}`;
        if (hudEchoTextEl) hudEchoTextEl.textContent = echoValue;
        if (hudEchoMiniEl) hudEchoMiniEl.style.width = `${echoPct}%`;
        if (echoBar) echoBar.style.width = `${echoPct}%`;

        // Echo 버튼 상태도 즉시 갱신
        if (echoBtn) {
          const canUse = newEcho >= 30;
          echoBtn.disabled = !canUse;
          echoBtn.style.opacity = canUse ? '1' : '0.4';
          // Echo 스킬 버튼 텍스트는 updateEchoSkillBtn 에서 일관되게 처리
          if (canUse && typeof window.updateEchoSkillBtn === 'function') {
            window.updateEchoSkillBtn();
          } else {
            echoBtn.textContent = `⚡ Echo 스킬 (${echoValue}/30)`;
          }
        }

        // 전체 UI 갱신 (skipFullUI 가 true 가 아닐 때만)
        if (!skipFullUI && typeof window.updateUI === 'function') {
          window.updateUI();
        }
    },

    drainEcho(amount) {
        this.player.echo = Math.max(0, this.player.echo - amount);
        if (typeof window.updateUI === 'function') window.updateUI();
    },

    heal(amount) {
        if (getBaseRegionIndex(this.currentRegion) === Math.max(0, getRegionCount() - 1)) {
            this.addLog('❌ 메아리의 근원: 회복 불가!', 'damage');
            return;
        }
        let adjusted = RunRules.getHealAmount(this, amount);
        if ((this.getBuff('cursed')?.stacks || 0) > 0) {
            adjusted = Math.max(0, Math.floor(adjusted * 0.7));
        }
        const actual = Math.min(adjusted, this.player.maxHp - this.player.hp);
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + actual);
        if (actual > 0) {
            ParticleSystem.healEffect(window.innerWidth / 2, window.innerHeight / 2);
            AudioEngine.playHeal();
            this.addLog(`💚 체력 +${actual}`, 'heal');
        }
        if (typeof window.updateUI === 'function') window.updateUI();
    },

    addBuff(id, stacks, data = {}) {
        if (this.player.buffs[id]) {
            this.player.buffs[id].stacks += stacks;
            for (const key in data) {
                if (typeof data[key] === 'number') {
                    this.player.buffs[id][key] = (this.player.buffs[id][key] || 0) + data[key];
                } else {
                    this.player.buffs[id][key] = data[key];
                }
            }
        } else {
            this.player.buffs[id] = { stacks, ...data };
        }
        if (typeof window.updateStatusDisplay === 'function') window.updateStatusDisplay();
    },

    getBuff(id) { return this.player.buffs[id] || null; },

    addGold(amount) {
        this.player.gold += amount;
        if (typeof window.updateUI === 'function') window.updateUI();
        if (amount > 0) {
            const el = document.createElement('div');
            el.style.cssText = `position:fixed;left:50%;top:${40 + Math.random() * 20}%;transform:translate(-50%,-50%);font-family:'Share Tech Mono',monospace;font-size:24px;font-weight:900;color:var(--gold);text-shadow:0 0 20px rgba(240,180,41,0.9);pointer-events:none;z-index:9500;animation:goldPop 1.4s ease forwards;`;
            el.textContent = `+${amount} Gold`;
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 1400);
        }
    },

    addSilence(amount) {
        this.player.silenceGauge = (this.player.silenceGauge || 0) + amount;
        const max = 10;
        this.addLog(`🌑 소음 ${this.player.silenceGauge}/${max}`, 'echo');
        if (this.player.silenceGauge >= max) {
            this.player.silenceGauge = 0;
            this.spawnEnemy();
            this.addLog('⚠️ 소음 한계! 파수꾼 등장!', 'damage');
            if (typeof window.ScreenShake !== 'undefined') window.ScreenShake.shake(10, 0.5);
        }
        if (typeof window.updateNoiseWidget === 'function') window.updateNoiseWidget();
        if (typeof window.updateClassSpecialUI === 'function') window.updateClassSpecialUI();
    },

    showLowHpWarning() {
        let el = document.querySelector('.pulse-overlay');
        if (!el) {
            el = document.createElement('div');
            el.className = 'pulse-overlay';
            document.body.appendChild(el);
        }
        clearTimeout(this._pulseTimer);
        this._pulseTimer = setTimeout(() => el.remove(), 5000);
    },
};
