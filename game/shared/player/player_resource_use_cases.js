import { createRunRuleCapabilities } from '../../features/run/ports/public_rule_capabilities.js';
import { PlayerStateActions as Actions } from '../state/player_state_commands.js';
import { LogUtils } from '../../utils/log_utils.js';

function getRunRules() {
  return createRunRuleCapabilities();
}

export const PlayerResourceUseCaseMethods = {
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

    const result = this.commit(Actions.PLAYER_ECHO, { amount: adjusted });
    if (source && source.name) {
      const icon = source.type === 'item' ? '💍' : '✨';
      this.addLog(`${icon} ${source.name}: 잔향 +${adjusted}`, 'echo');
    }
    return result;
  },

  drainEcho(amount) {
    return this.commit(Actions.PLAYER_ECHO, { amount: -amount });
  },

  heal(amount, source = null, deps = {}) {
    void deps;
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
    }
    return result;
  },

  addBuff(id, stacks, data = {}) {
    return this.commit(Actions.PLAYER_BUFF, { id, stacks, data });
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
    return result;
  },

  increaseMaxHp(amount) {
    return this.commit(Actions.PLAYER_MAX_HP_GROWTH, { amount });
  },
};
