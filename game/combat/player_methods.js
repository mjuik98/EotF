import { AudioEngine } from '../../engine/audio.js';
import { ParticleSystem } from '../../engine/particles.js';
import { RunRules, getBaseRegionIndex, getRegionCount } from '../systems/run_rules.js';
import { Actions } from '../core/state_actions.js';

const _getDoc = (deps) => deps?.doc || document;
const _getWin = (deps) => deps?.win || window;

export const PlayerMethods = {
    addEcho(amount, skipFullUI = false) {
        this.dispatch(Actions.PLAYER_ECHO, { amount });
        const updateEchoSkillBtn = window.updateEchoSkillBtn;
        if (typeof updateEchoSkillBtn === 'function') updateEchoSkillBtn();
    },

    drainEcho(amount) {
        this.dispatch(Actions.PLAYER_ECHO, { amount: -amount });
        const updateEchoSkillBtn = window.updateEchoSkillBtn;
        if (typeof updateEchoSkillBtn === 'function') updateEchoSkillBtn();
    },

    heal(amount, deps = {}) {
        if (getBaseRegionIndex(this.currentRegion) === Math.max(0, getRegionCount() - 1)) {
            this.addLog('❌ 메아리의 근원: 회복 불가!', 'damage');
            return;
        }
        let adjusted = RunRules.getHealAmount(this, amount);
        if ((this.getBuff('cursed')?.stacks || 0) > 0) {
            adjusted = Math.max(0, Math.floor(adjusted * 0.7));
        }

        const result = this.dispatch(Actions.PLAYER_HEAL, { amount: adjusted });
        if (result && result.healed > 0) {
            this.addLog(`💚 체력 +${result.healed}`, 'heal');
        }
    },

    addBuff(id, stacks, data = {}) {
        this.dispatch(Actions.PLAYER_BUFF, { id, stacks, data });
    },

    getBuff(id) { return this.player.buffs[id] || null; },

    addGold(amount, deps = {}) {
        const result = this.dispatch(Actions.PLAYER_GOLD, { amount });
        if (amount > 0 && result && result.delta > 0) {
            this.addLog(`💰 +${result.delta} Gold`, 'system');
        }
    },

    addSilence(amount, deps = {}) {
        this.player.silenceGauge = (this.player.silenceGauge || 0) + amount;
        const max = 10;
        this.addLog(`🌑 소음 ${this.player.silenceGauge}/${max}`, 'echo');
        if (this.player.silenceGauge >= max) {
            this.player.silenceGauge = 0;
            this.spawnEnemy(deps);
            this.addLog('⚠️ 소음 한계! 파수꾼 등장!', 'damage');
            const win = _getWin(deps);
            const screenShake = deps.screenShake || win.ScreenShake;
            if (screenShake) screenShake.shake(10, 0.5);
        }
        const win = _getWin(deps);
        const updateNoiseWidget = deps.updateNoiseWidget || win.updateNoiseWidget;
        if (typeof updateNoiseWidget === 'function') updateNoiseWidget();
        const updateClassSpecialUI = deps.updateClassSpecialUI || win.updateClassSpecialUI;
        if (typeof updateClassSpecialUI === 'function') updateClassSpecialUI();
    },

    showLowHpWarning(deps = {}) {
        const doc = _getDoc(deps);
        let el = doc.querySelector('.pulse-overlay');
        if (!el) {
            el = doc.createElement('div');
            el.className = 'pulse-overlay';
            doc.body.appendChild(el);
        }
        clearTimeout(this._pulseTimer);
        this._pulseTimer = setTimeout(() => el.remove(), 5000);
    },
};
