import { clampNonNegative, selectPlayerState } from './player_state_helpers.js';

export function applyLegacyPlayerHealMutation(gs, amount) {
  const player = selectPlayerState(gs);
  if (!player) return null;
  const actual = Math.min(clampNonNegative(amount), Math.max(0, (player.maxHp || 0) - (player.hp || 0)));
  player.hp = Math.min(player.maxHp || 0, clampNonNegative(player.hp) + actual);
  gs.markDirty?.('hud');
  return { healed: actual, hpAfter: player.hp };
}

export function applyLegacyPlayerShieldMutation(gs, amount) {
  const player = selectPlayerState(gs);
  if (!player) return null;
  player.shield = Math.max(0, clampNonNegative(player.shield) + (Number(amount) || 0));
  gs.markDirty?.('hud');
  return { shieldAfter: player.shield };
}

export function applyLegacyPlayerEchoMutation(gs, amount) {
  const player = selectPlayerState(gs);
  if (!player) return null;
  player.echo = Math.max(0, Math.min(Number(player.maxEcho || 0), Number(amount) || 0));
  gs.markDirty?.('hud');
  return { echoAfter: player.echo };
}

export function applyLegacyPlayerSilenceGaugeMutation(gs, amount) {
  const player = selectPlayerState(gs);
  if (!player) return null;
  player.silenceGauge = Math.max(0, clampNonNegative(player.silenceGauge) + (Number(amount) || 0));
  gs.markDirty?.('hud');
  return { silenceGauge: player.silenceGauge };
}

export function applyLegacyPlayerTimeRiftGaugeMutation(gs, amount) {
  const player = selectPlayerState(gs);
  if (!player) return null;
  player.timeRiftGauge = Math.max(0, clampNonNegative(player.timeRiftGauge) + (Number(amount) || 0));
  gs.markDirty?.('hud');
  return { timeRiftGauge: player.timeRiftGauge };
}

export function applyLegacyPlayerBuffMutation(gs, id, stacks, data = {}) {
  const player = selectPlayerState(gs);
  if (!player || !id) return null;
  if (!player.buffs || typeof player.buffs !== 'object') player.buffs = {};

  if (player.buffs[id]) {
    player.buffs[id].stacks = clampNonNegative(player.buffs[id].stacks) + (Number(stacks) || 0);
    Object.entries(data || {}).forEach(([key, value]) => {
      if (typeof value === 'number') {
        player.buffs[id][key] = Number(player.buffs[id][key] || 0) + value;
      } else {
        player.buffs[id][key] = value;
      }
    });
  } else {
    player.buffs[id] = { stacks: Number(stacks) || 0, ...data };
  }

  gs.markDirty?.('hud');
  return player.buffs[id];
}

export function applyLegacyPlayerGoldMutation(gs, amount) {
  const player = selectPlayerState(gs);
  if (!player) return null;
  player.gold = Number(player.gold || 0) + (Number(amount) || 0);
  gs.markDirty?.('hud');
  return { goldAfter: player.gold, delta: Number(amount) || 0 };
}

export function applyLegacyPlayerMaxHpGrowthMutation(gs, amount) {
  const player = selectPlayerState(gs);
  if (!player) return null;
  player.maxHp = Math.max(1, clampNonNegative(player.maxHp || 1) + (Number(amount) || 0));
  if ((Number(amount) || 0) > 0) {
    player.hp = Math.min(player.maxHp, clampNonNegative(player.hp) + (Number(amount) || 0));
  } else {
    player.hp = Math.min(player.maxHp, clampNonNegative(player.hp));
  }
  gs.markDirty?.('hud');
  return { maxHpAfter: player.maxHp, hpAfter: player.hp };
}

export function applyLegacyPlayerMaxEnergyGrowthMutation(gs, amount, options = {}) {
  const player = selectPlayerState(gs);
  if (!player) return null;
  const cap = Math.max(1, Number(options.maxEnergyCap ?? player.maxEnergyCap ?? 5) || 5);
  const previousMax = Math.max(1, Number(player.maxEnergy || 1) || 1);
  const previousEnergy = clampNonNegative(player.energy);
  const requestedMax = Math.max(1, previousMax + (Number(amount) || 0));
  player.maxEnergy = Math.min(cap, requestedMax);

  if ((Number(amount) || 0) > 0) {
    const actualIncrease = Math.max(0, player.maxEnergy - previousMax);
    player.energy = Math.min(player.maxEnergy, previousEnergy + actualIncrease);
  } else {
    player.energy = Math.min(player.maxEnergy, previousEnergy);
  }

  gs.markDirty?.('hud');
  return { maxEnergyAfter: player.maxEnergy, energyAfter: player.energy };
}

export function applyLegacyPlayerMaxEnergySetMutation(gs, amount, options = {}) {
  const player = selectPlayerState(gs);
  if (!player) return null;
  const cap = Math.max(1, Number(options.maxEnergyCap ?? player.maxEnergyCap ?? 5) || 5);
  player.maxEnergy = Math.max(1, Math.min(cap, Number(amount) || 0));
  player.energy = Math.min(player.maxEnergy, clampNonNegative(player.energy));
  gs.markDirty?.('hud');
  return { maxEnergyAfter: player.maxEnergy, energyAfter: player.energy };
}

export function applyLegacyPlayerEnergyAdjustMutation(gs, amount) {
  const player = selectPlayerState(gs);
  if (!player) return null;
  player.energy = Math.max(0, Math.min(
    Math.max(0, Number(player.maxEnergy || 0) || 0),
    clampNonNegative(player.energy) + (Number(amount) || 0),
  ));
  gs.markDirty?.('hud');
  return { energyAfter: player.energy };
}

export function applyLegacyPlayerEnergySetMutation(gs, amount) {
  const player = selectPlayerState(gs);
  if (!player) return null;
  player.energy = Math.max(0, Math.min(
    Math.max(0, Number(player.maxEnergy || 0) || 0),
    Number(amount) || 0,
  ));
  gs.markDirty?.('hud');
  return { energyAfter: player.energy };
}

export function applyLegacyPlayerHpSetMutation(gs, amount) {
  const player = selectPlayerState(gs);
  if (!player) return null;
  player.hp = Math.max(0, Math.min(
    Math.max(1, Number(player.maxHp || 1) || 1),
    Number(amount) || 0,
  ));
  gs.markDirty?.('hud');
  return { hpAfter: player.hp };
}

export function applyLegacyPlayerMaxHpSetMutation(gs, amount) {
  const player = selectPlayerState(gs);
  if (!player) return null;
  player.maxHp = Math.max(1, Number(amount) || 1);
  player.hp = Math.min(player.maxHp, clampNonNegative(player.hp));
  gs.markDirty?.('hud');
  return { maxHpAfter: player.maxHp, hpAfter: player.hp };
}

export function applyLegacyPlayerStatusClearMutation(gs, statusId) {
  const statusEffects = selectPlayerState(gs)?.statusEffects;
  if (!statusEffects || !statusId) return false;
  statusEffects[statusId] = 0;
  gs.markDirty?.('hud');
  return true;
}
