import { CONSTANTS } from '../../data/constants.js';
import { Actions } from '../state_action_types.js';

const CONFIG_MAX_ENERGY_CAP = Number(CONSTANTS?.PLAYER?.MAX_ENERGY_CAP);
const MAX_ENERGY_CAP =
  Number.isFinite(CONFIG_MAX_ENERGY_CAP) && CONFIG_MAX_ENERGY_CAP >= 1
    ? Math.floor(CONFIG_MAX_ENERGY_CAP)
    : 5;

export const PlayerReducers = {
  [Actions.PLAYER_DAMAGE](gs, { amount }) {
    const player = gs.player;
    const stats = gs.stats;
    let remaining = amount;

    if (player.shield > 0) {
      const absorbed = Math.min(player.shield, remaining);
      player.shield -= absorbed;
      remaining -= absorbed;
    }

    if (remaining > 0) {
      player.hp = Math.max(0, player.hp - remaining);
      stats.damageTaken += remaining;
    }

    gs.markDirty('hud');

    return {
      shieldAbsorbed: amount - remaining,
      actualDamage: remaining,
      hpAfter: player.hp,
      isDead: player.hp <= 0,
    };
  },

  [Actions.PLAYER_HEAL](gs, { amount }) {
    const player = gs.player;
    const actual = Math.min(amount, player.maxHp - player.hp);
    player.hp = Math.min(player.maxHp, player.hp + actual);
    gs.markDirty('hud');

    return { healed: actual, hpAfter: player.hp };
  },

  [Actions.PLAYER_SHIELD](gs, { amount }) {
    const player = gs.player;
    player.shield = Math.max(0, player.shield + amount);
    gs.markDirty('hud');
    return { shieldAfter: player.shield };
  },

  [Actions.PLAYER_GOLD](gs, { amount }) {
    const player = gs.player;
    player.gold += amount;
    gs.markDirty('hud');
    return { goldAfter: player.gold, delta: amount };
  },

  [Actions.PLAYER_ENERGY](gs, { amount }) {
    const player = gs.player;
    const prevEnergy = Number(player.energy || 0);
    if (amount > 0 && typeof gs.triggerItems === 'function') {
      const scaled = gs.triggerItems('energy_gain', { amount });
      if (typeof scaled === 'number' && Number.isFinite(scaled)) amount = scaled;
    }
    player.energy = Math.max(0, player.energy + amount);
    if (amount < 0 && prevEnergy > 0 && player.energy === 0 && typeof gs.triggerItems === 'function') {
      gs.triggerItems('energy_empty', { previous: prevEnergy, delta: amount });
    }
    gs.markDirty('hud');
    return { energyAfter: player.energy };
  },

  [Actions.PLAYER_ENERGY_ADJUST](gs, { amount }) {
    const player = gs.player;
    const maxEnergy = Math.max(0, Number(player.maxEnergy || 0) || 0);
    const currentEnergy = Math.max(0, Number(player.energy || 0) || 0);
    player.energy = Math.max(0, Math.min(maxEnergy, currentEnergy + (Number(amount) || 0)));
    gs.markDirty('hud');
    return { energyAfter: player.energy };
  },

  [Actions.PLAYER_ENERGY_SET](gs, { amount }) {
    const player = gs.player;
    const maxEnergy = Math.max(0, Number(player.maxEnergy || 0) || 0);
    player.energy = Math.max(0, Math.min(maxEnergy, Number(amount) || 0));
    gs.markDirty('hud');
    return { energyAfter: player.energy };
  },

  [Actions.PLAYER_ECHO](gs, { amount }) {
    const player = gs.player;
    player.echo = Math.max(0, Math.min(player.maxEcho, player.echo + amount));
    gs.markDirty('hud');
    return { echoAfter: player.echo };
  },

  [Actions.PLAYER_SILENCE](gs, { amount }) {
    const player = gs.player;
    player.silenceGauge = Math.max(0, (player.silenceGauge || 0) + amount);
    gs.markDirty('hud');
    return { silenceGauge: player.silenceGauge };
  },

  [Actions.PLAYER_TIME_RIFT](gs, { amount }) {
    const player = gs.player;
    player.timeRiftGauge = Math.max(0, (player.timeRiftGauge || 0) + amount);
    gs.markDirty('hud');
    return { timeRiftGauge: player.timeRiftGauge };
  },

  [Actions.PLAYER_BUFF](gs, { id, stacks, data = {} }) {
    const player = gs.player;
    const buffs = player.buffs;
    if (buffs[id]) {
      buffs[id].stacks += stacks;
      for (const key in data) {
        if (typeof data[key] === 'number') {
          buffs[id][key] = (buffs[id][key] || 0) + data[key];
        } else {
          buffs[id][key] = data[key];
        }
      }
    } else {
      buffs[id] = { stacks, ...data };
    }
    gs.markDirty('hud');
  },

  [Actions.PLAYER_MAX_HP_GROWTH](gs, { amount }) {
    const player = gs.player;
    player.maxHp = Math.max(1, player.maxHp + amount);
    if (amount > 0) {
      player.hp = Math.min(player.maxHp, player.hp + amount);
    } else {
      player.hp = Math.min(player.maxHp, player.hp);
    }
    gs.markDirty('hud');
    return { maxHpAfter: player.maxHp, hpAfter: player.hp };
  },

  [Actions.PLAYER_HP_SET](gs, { amount }) {
    const player = gs.player;
    const maxHp = Math.max(1, Number(player.maxHp || 1) || 1);
    player.hp = Math.max(0, Math.min(maxHp, Number(amount) || 0));
    gs.markDirty('hud');
    return { hpAfter: player.hp };
  },

  [Actions.PLAYER_MAX_HP_SET](gs, { amount }) {
    const player = gs.player;
    player.maxHp = Math.max(1, Number(amount) || 1);
    player.hp = Math.min(player.maxHp, Math.max(0, Number(player.hp || 0) || 0));
    gs.markDirty('hud');
    return { maxHpAfter: player.maxHp, hpAfter: player.hp };
  },

  [Actions.PLAYER_MAX_ENERGY_GROWTH](gs, { amount }) {
    const player = gs.player;
    const cap = Math.max(1, Number(player.maxEnergyCap || MAX_ENERGY_CAP));
    const previousMax = Math.max(1, Number(player.maxEnergy || 1));
    const previousEnergy = Math.max(0, Number(player.energy || 0));
    const requestedMax = Math.max(1, previousMax + amount);
    player.maxEnergy = Math.min(cap, requestedMax);

    if (amount > 0) {
      const actualIncrease = Math.max(0, player.maxEnergy - previousMax);
      player.energy = Math.min(player.maxEnergy, previousEnergy + actualIncrease);
    } else {
      player.energy = Math.min(player.maxEnergy, previousEnergy);
    }

    gs.markDirty('hud');
    return { maxEnergyAfter: player.maxEnergy, energyAfter: player.energy };
  },

  [Actions.PLAYER_MAX_ENERGY_SET](gs, { amount, maxEnergyCap }) {
    const player = gs.player;
    const currentCap = Math.max(1, Number(player.maxEnergyCap || MAX_ENERGY_CAP));
    const requestedCap = Math.max(1, Number(maxEnergyCap || currentCap) || currentCap);
    const requestedMaxEnergy = Math.max(1, Number(amount) || 1);
    player.maxEnergy = Math.min(requestedCap, requestedMaxEnergy);
    player.energy = Math.min(player.maxEnergy, Math.max(0, Number(player.energy || 0) || 0));
    gs.markDirty('hud');
    return { maxEnergyAfter: player.maxEnergy, energyAfter: player.energy };
  },

  [Actions.PLAYER_STATUS_CLEAR](gs, { statusId }) {
    const statusEffects = gs.player?.statusEffects;
    if (!statusEffects || !statusId) return false;
    statusEffects[statusId] = 0;
    gs.markDirty('hud');
    return true;
  },
};
