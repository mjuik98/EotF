import { applyPlayerMaxHpGrowthState } from '../state/player_state_commands.js';

function applyPassivePlayerMaxHpGrowth(gs, amount) {
  const player = gs?.player;
  if (!player) return null;

  const maxHpBefore = Number(player.maxHp || 0);
  const hpBefore = Number(player.hp || 0);
  const result = applyPlayerMaxHpGrowthState(gs, amount);
  if (Number(player.maxHp || 0) !== maxHpBefore || Number(player.hp || 0) !== hpBefore) {
    return result ?? {
      maxHpAfter: player.maxHp,
      hpAfter: player.hp,
    };
  }

  player.maxHp = Math.max(1, maxHpBefore + amount);
  player.hp = amount > 0
    ? Math.min(player.maxHp, hpBefore + amount)
    : Math.min(player.maxHp, hpBefore);
  gs.markDirty?.('hud');

  return {
    maxHpAfter: player.maxHp,
    hpAfter: player.hp,
  };
}

export function applyPassiveSetBonuses(gs, counts) {
  const player = gs?.player;
  if (!player) return;

  if (counts.abyssal_set >= 2 && !gs._abyssalSet2Applied) {
    gs._abyssalSet2Applied = true;
    player.maxEcho = Math.floor((player.maxEcho || 0) * 1.2);
  }

  if (counts.ancient_set >= 2 && !gs._ancientSet2Applied) {
    gs._ancientSet2Applied = true;
    applyPassivePlayerMaxHpGrowth(gs, 10);
  }
}
