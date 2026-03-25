export function applyPassiveSetBonuses(gs, counts) {
  if (counts.abyssal_set >= 2 && !gs._abyssalSet2Applied) {
    gs._abyssalSet2Applied = true;
    gs.player.maxEcho = Math.floor((gs.player.maxEcho || 0) * 1.2);
  }

  if (counts.echo_set >= 2) gs._echoSet2 = true;

  if (counts.blood_set >= 2 && !gs._bloodSet2Applied) {
    gs._bloodSet2Applied = true;
    gs.player.maxHp += 20;
    gs.player.hp += 20;
    gs.markDirty?.('hud');
  }

  if (counts.ancient_set >= 2 && !gs._ancientSet2Applied) {
    gs._ancientSet2Applied = true;
    gs.player.maxHp += 10;
    gs.player.hp += 10;
    gs.markDirty?.('hud');
  }
}
