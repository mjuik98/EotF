import { AudioEngine } from '../../engine/audio.js';
import { ParticleSystem } from '../../engine/particles.js';
import { RunRules, getBaseRegionIndex, getRegionCount } from '../run_rules.js';

export const PlayerMethods = {
    addEcho(amount, skipFullUI = false) {
        this.player.echo = Math.min(this.player.maxEcho, this.player.echo + amount);
        this.markDirty('hud');
    },

    drainEcho(amount) {
        this.player.echo = Math.max(0, this.player.echo - amount);
        this.markDirty('hud');
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
        this.markDirty('hud');
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
        this.markDirty('hud');
    },

    getBuff(id) { return this.player.buffs[id] || null; },

    addGold(amount) {
        this.player.gold += amount;
        this.markDirty('hud');
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
