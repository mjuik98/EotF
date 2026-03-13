import { createRunRuleCapabilities } from '../../features/run/ports/public_rule_capabilities.js';
import { Actions } from './public.js';
import { setPlayerEnergyState } from './player_state_commands.js';
import { GAME } from '../../core/global_bridge.js';
import { LogUtils } from '../../utils/log_utils.js';

function getRunRules() {
  return createRunRuleCapabilities();
}

const getDoc = (deps) => deps?.doc || document;
const getWin = (deps) => deps?.win || window;

export const PlayerMethods = {
  addEcho(amount, source = null) {
    if (this._currentCard) {
      this._echoAddedThisAction = true;
    }
    let adjusted = amount;
    if (adjusted > 0 && typeof this.triggerItems === 'function') {
      const scaled = this.triggerItems('echo_gain', { amount: adjusted, source });
      if (typeof scaled === 'number' && Number.isFinite(scaled)) {
        adjusted = Math.max(0, Math.floor(scaled));
      }
    }

    this.commit(Actions.PLAYER_ECHO, { amount: adjusted });
    if (source && source.name) {
      const icon = source.type === 'item' ? '💍' : '✨';
      this.addLog(`${icon} ${source.name}: 잔향 +${adjusted}`, 'echo');
    }
    GAME?.API?.updateEchoSkillBtn?.();
  },

  drainEcho(amount) {
    this.commit(Actions.PLAYER_ECHO, { amount: -amount });
    GAME?.API?.updateEchoSkillBtn?.();
  },

  heal(amount, source = null, deps = {}) {
    const activeRegionId = Number(this._activeRegionId);
    const regionId = Number.isFinite(activeRegionId)
      ? Math.max(0, Math.floor(activeRegionId))
      : getRunRules().getRegionIdForStage(this.currentRegion, this);
    if (regionId === 4) {
      this.addLog(LogUtils.formatSystem('메아리의 근원: 회복 불가!'), 'damage');
      return;
    }
    let adjusted = getRunRules().RunRules.getHealAmount(this, amount);
    if ((this.getBuff('cursed')?.stacks || 0) > 0) {
      adjusted = Math.max(0, Math.floor(adjusted * 0.7));
    }
    if (typeof this.triggerItems === 'function') {
      const scaled = this.triggerItems('heal_amount', adjusted);
      if (typeof scaled === 'number' && Number.isFinite(scaled)) {
        adjusted = Math.max(0, Math.floor(scaled));
      }
    }

    const result = this.commit(Actions.PLAYER_HEAL, { amount: adjusted });
    if (result && result.healed > 0) {
      if (source && source.name) {
        const icon = source.type === 'item' ? '💍' : '✨';
        this.addLog(`${icon} ${source.name}: ${result.healed} 회복`, 'heal');
      } else {
        this.addLog(LogUtils.formatHeal('플레이어', result.healed), 'heal');
      }

      if (this.combat?.active) {
        const cm = GAME?.Modules?.ClassMechanics?.[this.player.class];
        if (cm && typeof cm.onHeal === 'function') {
          cm.onHeal(this, result.healed);
        }
      }
    }
  },

  addBuff(id, stacks, data = {}) {
    this.commit(Actions.PLAYER_BUFF, { id, stacks, data });
  },

  applyPlayerStatus(status, stacks = 1, source = null) {
    if (!status || stacks <= 0) return;
    this.addBuff(status, stacks, {});
    if (source && source.name) {
      const icon = source.type === 'item' ? '💍' : '✨';
      this.addLog(`${icon} ${source.name}: ${status} ${stacks}턴`, 'damage');
    } else {
      this.addLog(LogUtils.formatStatus('플레이어', status, stacks), 'damage');
    }
  },

  getBuff(id) {
    return this.player.buffs[id] || null;
  },

  addGold(amount, source = null) {
    const result = this.commit(Actions.PLAYER_GOLD, { amount });
    if (amount > 0 && result && result.delta > 0) {
      if (source && source.name) {
        this.addLog(`💍 ${source.name}: 골드 +${result.delta}`, 'gold');
      } else {
        this.addLog(LogUtils.formatStatChange('플레이어', '골드', result.delta), 'system');
      }
    }
  },

  addSilence(amount, label = '소음', deps = {}) {
    const result = this.commit(Actions.PLAYER_SILENCE, { amount });
    const silenceGauge = Number(result?.silenceGauge || 0);
    const max = 10;
    this.addLog(LogUtils.formatEcho(`${label} ${silenceGauge}/${max}`), 'echo');
    if (silenceGauge >= max) {
      this.commit(Actions.PLAYER_SILENCE, { amount: -silenceGauge });
      this.spawnEnemy(deps);
      this.addLog(LogUtils.formatSystem('소음 한계! 파수꾼 등장!'), 'damage');
      const win = getWin(deps);
      const screenShake = deps.screenShake || win.ScreenShake;
      if (screenShake) screenShake.shake(10, 0.5);
    }
    const win = getWin(deps);
    const updateNoiseWidget = deps.updateNoiseWidget || win.updateNoiseWidget;
    if (typeof updateNoiseWidget === 'function') updateNoiseWidget();
    const updateClassSpecialUI = deps.updateClassSpecialUI || win.updateClassSpecialUI;
    if (typeof updateClassSpecialUI === 'function') updateClassSpecialUI();
  },

  addTimeRift(amount, label = '시간의 균열', deps = {}) {
    const result = this.commit(Actions.PLAYER_TIME_RIFT, { amount });
    const timeRiftGauge = Number(result?.timeRiftGauge || 0);
    const max = 10;

    let labelText = `${label} ${timeRiftGauge}/${max}`;
    if (timeRiftGauge >= max) {
      labelText += ' - 시간 강제 재조정!';
    }
    this.addLog(LogUtils.formatEcho(labelText), 'echo');

    const win = getWin(deps);
    const updateNoiseWidget = deps.updateNoiseWidget || win.updateNoiseWidget;
    if (typeof updateNoiseWidget === 'function') updateNoiseWidget();

    if (timeRiftGauge >= max) {
      this.commit(Actions.PLAYER_TIME_RIFT, { amount: -timeRiftGauge });
      setPlayerEnergyState(this, 0);
      this.addLog(LogUtils.formatSystem('시간의 왜곡이 임계점에 달했습니다. 에너지를 모두 잃고 턴이 강제로 종료됩니다!'), 'damage');

      const screenShake = deps.screenShake || win.ScreenShake;
      if (screenShake) screenShake.shake(15, 0.6);

      setTimeout(() => {
        const endPlayerTurn = deps.endPlayerTurn || win.endPlayerTurn;
        if (typeof endPlayerTurn === 'function') {
          endPlayerTurn();
        }
      }, 300);
    }
  },

  showLowHpWarning(deps = {}) {
    const doc = getDoc(deps);
    let el = doc.querySelector('.pulse-overlay');
    if (!el) {
      el = doc.createElement('div');
      el.className = 'pulse-overlay';
      doc.body.appendChild(el);
    }
    clearTimeout(this._pulseTimer);
    this._pulseTimer = setTimeout(() => el.remove(), 5000);
  },

  increaseMaxHp(amount) {
    this.commit(Actions.PLAYER_MAX_HP_GROWTH, { amount });
  },
};
