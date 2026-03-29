import { PlayerStateActions as Actions } from '../state/player_state_commands.js';
import {
  resolvePlayerActiveRegionId,
  resolvePlayerHealAmount,
} from './player_resource_rule_support.js';
import {
  createRecentFeedMeta,
  formatRecentFeedStatusOutcome,
  formatRecentFeedText,
  getCurrentCardLogSource,
  LogUtils,
} from '../logging/log_utils.js';

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
      this.addLog(`${icon} ${source.name}: 잔향 +${adjusted}`, 'echo', createRecentFeedMeta({
        source,
        text: formatRecentFeedText({
          sourceName: source.name,
          sourceType: source.type,
          outcome: `잔향 +${adjusted}`,
        }),
      }));
    }
    return result;
  },

  drainEcho(amount) {
    return this.commit(Actions.PLAYER_ECHO, { amount: -amount });
  },

  heal(amount, source = null, deps = {}) {
    const regionId = resolvePlayerActiveRegionId(this, deps);
    if (regionId === 4) {
      this.addLog(LogUtils.formatSystem('메아리의 근원: 회복 불가!'), 'damage');
      return;
    }
    let adjusted = resolvePlayerHealAmount(this, amount, deps);
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
        this.addLog(`${icon} ${source.name}: ${result.healed} 회복`, 'heal', createRecentFeedMeta({
          source,
          text: formatRecentFeedText({
            sourceName: source.name,
            sourceType: source.type,
            outcome: `${result.healed} 회복`,
          }),
        }));
      } else {
        this.addLog(LogUtils.formatHeal('플레이어', result.healed), 'heal', this._currentCard
          ? createRecentFeedMeta({
            source: getCurrentCardLogSource(this),
            text: formatRecentFeedText({
              sourceName: this._currentCard.name,
              sourceType: 'card',
              outcome: `${result.healed} 회복`,
            }),
          })
          : null);
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
      this.addLog(`${icon} ${source.name}: ${status} ${stacks}턴`, 'damage', createRecentFeedMeta({
        source,
        text: formatRecentFeedText({
          sourceName: source.name,
          sourceType: source.type,
          outcome: formatRecentFeedStatusOutcome(status, stacks),
        }),
      }));
    } else {
      this.addLog(LogUtils.formatStatus('플레이어', status, stacks), 'damage', this._currentCard
        ? createRecentFeedMeta({
          source: getCurrentCardLogSource(this),
          text: formatRecentFeedText({
            sourceName: this._currentCard.name,
            sourceType: 'card',
            outcome: formatRecentFeedStatusOutcome(status, stacks),
          }),
        })
        : null);
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
