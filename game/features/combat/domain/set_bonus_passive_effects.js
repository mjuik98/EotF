export function applyPassiveSetBonuses(gs, counts) {
  if (counts.void_set >= 2 && !gs._voidSet2Applied) {
    gs._voidSet2Applied = true;
    gs.player.maxEcho = Math.floor((gs.player.maxEcho || 0) * 1.2);
  }

  if (counts.echo_set >= 2) gs._echoSet2 = true;

  if (counts.blood_set >= 2 && !gs._bloodSet2Applied) {
    gs._bloodSet2Applied = true;
    gs.player.maxHp += 20;
    gs.player.hp += 20;
    gs.markDirty?.('hud');
  }
}
